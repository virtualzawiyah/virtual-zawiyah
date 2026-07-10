import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createNotification } from '@/lib/notifications'

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

    const { fee_payment_id, action } = await request.json()
    if (!fee_payment_id || !action) {
      return NextResponse.json({ error: 'Missing parameters: fee_payment_id and action are required' }, { status: 400 })
    }

    if (action === 'confirm') {
      // Fetch the fee payment record first to get original_amount and original_currency
      const { data: payment, error: paymentFetchError } = await supabaseAdmin
        .from('fee_payments')
        .select('original_currency, original_amount, student_id, billing_month')
        .eq('id', fee_payment_id)
        .single()

      if (paymentFetchError || !payment) {
        return NextResponse.json({ error: 'Payment record not found' }, { status: 404 })
      }

      // Fetch the latest usd_to_pkr and gbp_to_pkr rates
      const { data: rates } = await supabaseAdmin
        .from('exchange_rate_log')
        .select('usd_to_pkr, gbp_to_pkr')
        .order('created_at', { ascending: false })
        .limit(1)

      let usdRate = 278.00
      let gbpRate = 350.00
      if (rates && rates.length > 0) {
        usdRate = Number(rates[0].usd_to_pkr)
        gbpRate = Number(rates[0].gbp_to_pkr)
      }

      let pkrAmount = Number(payment.original_amount)
      if (payment.original_currency === 'USD') {
        pkrAmount = Number(payment.original_amount) * usdRate
      } else if (payment.original_currency === 'GBP') {
        pkrAmount = Number(payment.original_amount) * gbpRate
      }

      const { error: updateError } = await supabaseAdmin
        .from('fee_payments')
        .update({
          status: 'verified',
          pkr_amount: pkrAmount,
          verified_at: new Date().toISOString()
        })
        .eq('id', fee_payment_id)

      if (updateError) throw updateError

      // Trigger 9: Fee payment verified
      try {

        await createNotification({
          user_id: payment.student_id,
          role: 'student',
          title: 'Fee Payment Verified',
          message: `Your fee payment for ${payment.billing_month} has been verified`
        })
      } catch (notifErr: any) {
        console.error('Failed to send fee verification notification (non-fatal):', notifErr.message)
      }
    } else if (action === 'reject') {
      const { error: updateError } = await supabaseAdmin
        .from('fee_payments')
        .update({
          status: 'pending',
          receipt_url: null
        })
        .eq('id', fee_payment_id)

      if (updateError) throw updateError
    } else {
      return NextResponse.json({ error: 'Invalid action: must be confirm or reject' }, { status: 400 })
    }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('Verify receipt PATCH exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
