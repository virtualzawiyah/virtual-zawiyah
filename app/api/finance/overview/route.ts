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

    const now = new Date()
    const currentMonthString = `${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`

    // 1. Total collected this month
    const { data: collected, error: collectedError } = await supabaseAdmin
      .from('fee_payments')
      .select('original_amount')
      .eq('status', 'verified')
      .eq('month_year', currentMonthString)

    if (collectedError) throw collectedError

    // 2. Total pending this month
    const { data: pending, error: pendingError } = await supabaseAdmin
      .from('fee_payments')
      .select('original_amount')
      .eq('status', 'pending')
      .eq('month_year', currentMonthString)

    if (pendingError) throw pendingError

    // 3. Total expenses this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString()

    const { data: expenses, error: expensesError } = await supabaseAdmin
      .from('expenses_log')
      .select('amount_pkr')
      .gte('created_at', startOfMonth)
      .lte('created_at', endOfMonth)

    if (expensesError) throw expensesError

    const totalCollectedUSD = (collected || []).reduce((sum, item) => sum + Number(item.original_amount), 0)
    const totalPendingUSD = (pending || []).reduce((sum, item) => sum + Number(item.original_amount), 0)
    const totalExpensesPKR = (expenses || []).reduce((sum, item) => sum + Number(item.amount_pkr), 0)

    return NextResponse.json({
      success: true,
      totalCollectedUSD,
      totalPendingUSD,
      totalExpensesPKR
    })

  } catch (err: any) {
    console.error('Overview GET exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
