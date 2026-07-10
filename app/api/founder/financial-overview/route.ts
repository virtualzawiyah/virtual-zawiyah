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

    if (profileError || !profile || profile.role !== 'founder') {
      return NextResponse.json({ error: 'Forbidden: Founder privilege required' }, { status: 403 })
    }

    const now = new Date()
    
    // Generate formats for the last 6 months
    const monthsList = []
    const allMonthYearFormats = []
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const m = d.getMonth() + 1
      const y = d.getFullYear()
      const formats = [
        `${String(m).padStart(2, '0')}-${y}`,
        `${m}-${y}`,
        `${y}-${String(m).padStart(2, '0')}`,
        `${y}-${m}`
      ]
      allMonthYearFormats.push(...formats)
      monthsList.push({
        month: m,
        year: y,
        formats,
        label: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
        feeIncomeUSD: 0,
        teacherSalariesPKR: 0,
        staffSalariesPKR: 0,
        expensesPKR: 0,
        netBalanceUSD: 0
      })
    }

    // 1. Fetch fee payments
    const { data: feePayments, error: feeError } = await supabaseAdmin
      .from('fee_payments')
      .select('original_amount, month_year')
      .eq('status', 'verified')
      .in('month_year', allMonthYearFormats)

    if (feeError) throw feeError

    // 2. Fetch payroll disbursements
    const { data: payrollList, error: payrollError } = await supabaseAdmin
      .from('payroll_disbursements')
      .select('final_payout, recipient_type, month_year')
      .eq('status', 'Paid')
      .in('month_year', allMonthYearFormats)

    if (payrollError) throw payrollError

    // 3. Fetch expenses
    const firstMonth = monthsList[0]
    const startOf6Months = new Date(firstMonth.year, firstMonth.month - 1, 1).toISOString()
    const endOf6Months = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString()

    const { data: expensesList, error: expensesError } = await supabaseAdmin
      .from('expenses_log')
      .select('amount_pkr, created_at')
      .gte('created_at', startOf6Months)
      .lte('created_at', endOf6Months)

    if (expensesError) throw expensesError

    // 4. Fetch exchange rate
    const { data: rateData, error: rateError } = await supabaseAdmin
      .from('exchange_rate_log')
      .select('usd_to_pkr')
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (rateError) throw rateError
    const exchangeRate = rateData ? Number(rateData.usd_to_pkr) : 278

    // Map fees
    if (feePayments) {
      for (const fp of feePayments) {
        const amt = Number(fp.original_amount)
        const monthObj = monthsList.find(m => m.formats.includes(fp.month_year))
        if (monthObj) {
          monthObj.feeIncomeUSD += amt
        }
      }
    }

    // Map payroll
    if (payrollList) {
      for (const pr of payrollList) {
        const amt = Number(pr.final_payout)
        const monthObj = monthsList.find(m => m.formats.includes(pr.month_year))
        if (monthObj) {
          if (pr.recipient_type === 'teacher') {
            monthObj.teacherSalariesPKR += amt
          } else if (pr.recipient_type === 'staff') {
            monthObj.staffSalariesPKR += amt
          }
        }
      }
    }

    // Map expenses
    if (expensesList) {
      for (const exp of expensesList) {
        const amt = Number(exp.amount_pkr)
        const expDate = new Date(exp.created_at)
        const expMonth = expDate.getMonth() + 1
        const expYear = expDate.getFullYear()
        const monthObj = monthsList.find(m => m.month === expMonth && m.year === expYear)
        if (monthObj) {
          monthObj.expensesPKR += amt
        }
      }
    }

    // Compute net balance per month
    const trend = monthsList.map(m => {
      const totalPKR = m.teacherSalariesPKR + m.staffSalariesPKR + m.expensesPKR
      const totalExpensesUSD = totalPKR / exchangeRate
      const netBalanceUSD = m.feeIncomeUSD - totalExpensesUSD
      return {
        month: m.label,
        feeIncomeUSD: m.feeIncomeUSD,
        teacherSalariesPKR: m.teacherSalariesPKR,
        staffSalariesPKR: m.staffSalariesPKR,
        expensesPKR: m.expensesPKR,
        totalExpensesPKR: totalPKR,
        totalExpensesUSD,
        netBalanceUSD
      }
    })

    const currentMonth = trend[trend.length - 1]

    return NextResponse.json({
      success: true,
      exchangeRate,
      currentMonth,
      trend
    })

  } catch (err: any) {
    console.error('Financial overview GET exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
