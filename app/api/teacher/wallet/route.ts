import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // 1. Authenticate user from session cookie
    const supabaseUserClient = createRouteHandlerClient({ cookies })
    const { data: { session }, error: sessionError } = await supabaseUserClient.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 })
    }

    const teacherId = session.user.id

    // 2. Initialize admin client (bypasses RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 3. Fetch from teacher_wallet
    const { data: wallet, error: walletError } = await supabaseAdmin
      .from('teacher_wallet')
      .select('total_earned, available_balance, total_withdrawn, currency')
      .eq('teacher_id', teacherId)
      .maybeSingle()

    // 4. Fetch payroll disbursements (limit 12)
    const { data: disbursements, error: payrollError } = await supabaseAdmin
      .from('payroll_disbursements')
      .select('id, base_amount, adjustments, final_payout, status, payment_date, currency')
      .eq('recipient_id', teacherId)
      .eq('recipient_type', 'teacher')
      .order('payment_date', { ascending: false })
      .limit(12)

    if (payrollError) throw payrollError

    const walletResult = wallet || {
      total_earned: 0.00,
      available_balance: 0.00,
      total_withdrawn: 0.00,
      currency: 'PKR'
    }

    return NextResponse.json({
      success: true,
      wallet: walletResult,
      payrollHistory: disbursements || []
    })

  } catch (err: any) {
    console.error('Teacher wallet GET handler exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
