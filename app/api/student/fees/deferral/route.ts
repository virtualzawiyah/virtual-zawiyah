import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createNotification } from '@/lib/notifications'

export async function POST(request: Request) {
  try {
    // 1. Authenticate user from session cookie
    const supabaseUserClient = createRouteHandlerClient({ cookies })
    const { data: { session }, error: sessionError } = await supabaseUserClient.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 })
    }

    const userId = session.user.id

    // 2. Parse request body
    const { fee_payment_id, requested_date, reason } = await request.json()

    if (!fee_payment_id || !requested_date || !reason) {
      return NextResponse.json({ error: 'Missing fee_payment_id, requested_date, or reason parameters' }, { status: 400 })
    }

    // 3. Initialize admin client (bypasses RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 4. Retrieve target fee payment to resolve student ID
    const { data: feePayment, error: feeErr } = await supabaseAdmin
      .from('fee_payments')
      .select('student_id')
      .eq('id', fee_payment_id)
      .single()

    if (feeErr || !feePayment) {
      return NextResponse.json({ error: 'Fee payment record not found' }, { status: 404 })
    }

    const studentId = feePayment.student_id

    // 5. Security check: verify logged-in user is authorized to edit this student's records
    if (userId !== studentId) {
      const { data: targetProfile, error: profErr } = await supabaseAdmin
        .from('profiles')
        .select('parent_id')
        .eq('id', studentId)
        .single()

      if (profErr || !targetProfile || targetProfile.parent_id !== userId) {
        return NextResponse.json({ error: 'Forbidden: Insufficient permissions to request deferral' }, { status: 403 })
      }
    }

    // 6. Insert into fee_deferrals table
    const { error: deferralErr } = await supabaseAdmin
      .from('fee_deferrals')
      .insert({
        fee_payment_id,
        requested_date,
        reason,
        status: 'pending'
      })

    if (deferralErr) throw deferralErr

    // 7. Update corresponding columns on fee_payments record
    const { data: updatedPayment, error: updateErr } = await supabaseAdmin
      .from('fee_payments')
      .update({
        deferral_requested: true,
        deferral_date: requested_date,
        deferral_reason: reason,
        deferral_status: 'pending'
      })
      .eq('id', fee_payment_id)
      .select()
      .single()

    if (updateErr) throw updateErr

    // Create registrar notification (Trigger 10)
    try {
      const { data: studentProfile } = await supabaseAdmin
        .from('profiles')
        .select('full_name')
        .eq('id', studentId)
        .single()

      const studentName = studentProfile?.full_name || 'Student'


      await createNotification({
        role: 'registrar',
        title: 'Fee Deferral Requested',
        message: `Fee deferral requested by ${studentName}`
      })
    } catch (notifErr: any) {
      console.error('Failed to send notification for fee deferral request (non-fatal):', notifErr.message)
    }

    return NextResponse.json({
      success: true,
      updatedPayment
    })

  } catch (err: any) {
    console.error('Deferral request handler exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
