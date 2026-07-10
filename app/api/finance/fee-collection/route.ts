import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
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

    // Query fee_payments with profiles (student name)
    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from('fee_payments')
      .select(`
        id,
        student_id,
        original_amount,
        original_currency,
        status,
        receipt_url,
        created_at,
        month_year,
        profiles!fee_payments_student_id_fkey(
          full_name
        )
      `)
      .order('created_at', { ascending: false })

    if (paymentsError) throw paymentsError

    const formattedPayments = (payments || []).map((p: any) => {
      let mappedStatus = p.status
      if (p.status === 'verified') {
        mappedStatus = 'confirmed'
      } else if (p.status === 'pending' && p.receipt_url) {
        mappedStatus = 'pending_verification'
      }

      return {
        fee_payment_id: p.id,
        student_id: p.student_id,
        amount: Number(p.original_amount),
        currency: p.original_currency,
        status: mappedStatus,
        receipt_url: p.receipt_url,
        created_at: p.created_at,
        month_year: p.month_year,
        student_name: p.profiles?.full_name || 'Unknown Student'
      }
    })

    return NextResponse.json({
      success: true,
      payments: formattedPayments
    })

  } catch (err: any) {
    console.error('Fee collection GET exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
