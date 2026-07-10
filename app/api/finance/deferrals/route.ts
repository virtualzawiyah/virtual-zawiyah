import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createNotification } from '@/lib/notifications'

export async function GET(_request: Request) {
  try {
    const supabaseUserClient = createRouteHandlerClient({ cookies })
    const { data: { session }, error: sessionError } = await supabaseUserClient.auth.getSession()
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check user role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profileError || !profile || (profile.role !== 'finance_officer' && profile.role !== 'founder')) {
      return NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 })
    }

    // Query fee_deferrals with fee_payments and profiles
    const { data: deferrals, error: deferralsError } = await supabaseAdmin
      .from('fee_deferrals')
      .select(`
        id,
        requested_date,
        reason,
        status,
        created_at,
        fee_payments!fee_deferrals_fee_payment_id_fkey(
          original_amount,
          profiles!fee_payments_student_id_fkey(
            full_name
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (deferralsError) throw deferralsError

    const formattedDeferrals = (deferrals || []).map((d: any) => {
      const payment = d.fee_payments
      const student = payment?.profiles
      return {
        deferral_id: d.id,
        requested_date: d.requested_date,
        reason: d.reason,
        status: d.status,
        created_at: d.created_at,
        fee_amount: Number(payment?.original_amount || 0),
        student_name: student?.full_name || 'Unknown Student'
      }
    })

    return NextResponse.json({
      success: true,
      deferrals: formattedDeferrals
    })

  } catch (err: any) {
    console.error('Deferrals GET exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabaseUserClient = createRouteHandlerClient({ cookies })
    const { data: { session }, error: sessionError } = await supabaseUserClient.auth.getSession()
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check user role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profileError || !profile || (profile.role !== 'finance_officer' && profile.role !== 'founder')) {
      return NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 })
    }

    const { deferral_id, action } = await request.json()
    if (!deferral_id || !action) {
      return NextResponse.json({ error: 'Missing deferral_id or action parameter' }, { status: 400 })
    }

    if (action !== 'approved' && action !== 'rejected') {
      return NextResponse.json({ error: 'Invalid action: must be approved or rejected' }, { status: 400 })
    }

    // 1. Fetch requested date and payment ID from the deferral record
    const { data: deferral, error: fetchError } = await supabaseAdmin
      .from('fee_deferrals')
      .select('fee_payment_id, requested_date')
      .eq('id', deferral_id)
      .single()

    if (fetchError || !deferral) {
      return NextResponse.json({ error: 'Deferral request not found' }, { status: 404 })
    }

    // 2. Update fee_deferrals status = action
    const { error: deferralUpdateError } = await supabaseAdmin
      .from('fee_deferrals')
      .update({
        status: action,
        reviewed_by: session.user.id
      })
      .eq('id', deferral_id)

    if (deferralUpdateError) throw deferralUpdateError

    // 3. Update the linked fee_payments record
    const paymentUpdates: any = {
      deferral_status: action
    }
    if (action === 'approved') {
      paymentUpdates.deferral_date = deferral.requested_date
    }
    const { error: paymentUpdateError } = await supabaseAdmin
      .from('fee_payments')
      .update(paymentUpdates)
      .eq('id', deferral.fee_payment_id)

    if (paymentUpdateError) throw paymentUpdateError

    // Trigger 11: Fee deferral approved/rejected
    try {
      const { data: payment } = await supabaseAdmin
        .from('fee_payments')
        .select('student_id, billing_month')
        .eq('id', deferral.fee_payment_id)
        .single()

      if (payment) {
        await createNotification({
          user_id: payment.student_id,
          role: 'student',
          title: `Fee Deferral Request ${action === 'approved' ? 'Approved' : 'Rejected'}`,
          message: `Your fee deferral request for ${payment.billing_month} has been ${action === 'approved' ? 'approved' : 'rejected'}`
        })
      }
    } catch (notifErr: any) {
      console.error('Failed to send fee deferral review notification (non-fatal):', notifErr.message)
    }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('Deferrals PATCH exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
