import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createNotification } from '@/lib/notifications'

const isCurrentMonth = (monthYearStr: string) => {
  if (!monthYearStr) return false
  const now = new Date()
  const currentMonthNum = now.getMonth() + 1 // 1-12
  const currentYear = now.getFullYear()
  
  const parts = monthYearStr.split('-')
  if (parts.length === 2) {
    const p0 = parseInt(parts[0], 10)
    const p1 = parseInt(parts[1], 10)
    if ((p0 === currentMonthNum && p1 === currentYear) || (p0 === currentYear && p1 === currentMonthNum)) {
      return true
    }
  }
  return false
}

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

    // 1. Fetch teachers
    const { data: teachers, error: teachersError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, teacher_type, status')
      .eq('role', 'teacher')

    if (teachersError) throw teachersError

    // 2. Fetch staff
    const { data: staff, error: staffError } = await supabaseAdmin
      .from('non_teaching_staff')
      .select('id, name, role, base_salary_pkr, status')

    if (staffError) throw staffError

    // 3. Fetch all disbursements to map recent payslips
    const { data: payroll, error: payrollError } = await supabaseAdmin
      .from('payroll_disbursements')
      .select('id, recipient_id, base_amount, adjustments, final_payout, status, payment_date, month_year')
      .order('payment_date', { ascending: false })

    if (payrollError) throw payrollError

    const formattedTeachers = (teachers || []).map((t: any) => {
      const latestPay = (payroll || []).find((p: any) => p.recipient_id === t.id)
      return {
        id: t.id,
        name: t.full_name,
        teacher_type: t.teacher_type,
        status: t.status,
        salary: latestPay ? Number(latestPay.base_amount) : 110000.00,
        isPaidThisMonth: latestPay ? isCurrentMonth(latestPay.month_year) : false,
        lastPaymentDate: latestPay?.payment_date || null
      }
    })

    const formattedStaff = (staff || []).map((s: any) => {
      const latestPay = (payroll || []).find((p: any) => p.recipient_id === s.id)
      return {
        id: s.id,
        name: s.name,
        role: s.role,
        salary: Number(s.base_salary_pkr),
        isPaidThisMonth: latestPay ? isCurrentMonth(latestPay.month_year) : false,
        lastPaymentDate: latestPay?.payment_date || null
      }
    })

    const historyFormatted = (payroll || []).map((p: any) => {
      const teacher = (teachers || []).find((t: any) => t.id === p.recipient_id)
      const st = (staff || []).find((s: any) => s.id === p.recipient_id)
      return {
        id: p.id,
        teacherName: teacher ? teacher.full_name : (st ? st.name : 'Unknown Employee'),
        month: p.month_year,
        amount: Number(p.final_payout),
        datePaid: p.payment_date ? p.payment_date.split('T')[0] : 'Processing',
        status: p.status
      }
    })

    return NextResponse.json({
      success: true,
      teachers: formattedTeachers,
      otherStaff: formattedStaff,
      history: historyFormatted
    })

  } catch (err: any) {
    console.error('Salary GET exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
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

    const { recipient_id, recipient_type, base_amount, month_year, notes } = await request.json()
    if (!recipient_id || !recipient_type || !base_amount || !month_year) {
      return NextResponse.json({ error: 'Missing required payload parameters' }, { status: 400 })
    }

    const parsedAmount = parseFloat(base_amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than zero' }, { status: 400 })
    }

    // 1. Insert payroll disbursement record
    const { error: disbursementError } = await supabaseAdmin
      .from('payroll_disbursements')
      .insert({
        recipient_id,
        recipient_type,
        month_year,
        base_amount: parsedAmount,
        adjustments: 0.00,
        final_payout: parsedAmount,
        status: 'Paid',
        payment_date: new Date().toISOString(),
        voucher_url: notes || null
      })

    if (disbursementError) throw disbursementError

    // 2. Update teacher wallet if teacher
    if (recipient_type === 'teacher') {
      const { data: wallet, error: walletFetchError } = await supabaseAdmin
        .from('teacher_wallet')
        .select('*')
        .eq('teacher_id', recipient_id)
        .maybeSingle()

      if (walletFetchError) throw walletFetchError

      if (wallet) {
        const { error: walletUpdateError } = await supabaseAdmin
          .from('teacher_wallet')
          .update({
            total_earned: Number(wallet.total_earned) + parsedAmount,
            available_balance: Number(wallet.available_balance) + parsedAmount
          })
          .eq('teacher_id', recipient_id)

        if (walletUpdateError) throw walletUpdateError
      } else {
        const { error: walletInsertError } = await supabaseAdmin
          .from('teacher_wallet')
          .insert({
            teacher_id: recipient_id,
            total_earned: parsedAmount,
            available_balance: parsedAmount,
            total_withdrawn: 0.00,
            currency: 'PKR'
          })

        if (walletInsertError) throw walletInsertError
      }
    }

    // Trigger 19: Salary processed / payroll disbursed
    try {

      await createNotification({
        user_id: recipient_id,
        role: recipient_type === 'teacher' ? 'teacher' : 'staff',
        title: 'Salary Disbursed',
        message: `Your salary for ${month_year} has been disbursed`
      })
    } catch (notifErr: any) {
      console.error('Failed to send payroll disbursement notification (non-fatal):', notifErr.message)
    }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('Salary POST exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
