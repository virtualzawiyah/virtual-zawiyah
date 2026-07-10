/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

async function checkAuth(supabaseUserClient: any, supabaseAdmin: any) {
  const { data: { session }, error: sessionError } = await supabaseUserClient.auth.getSession()
  if (sessionError || !session) {
    return { authorized: false, userId: null }
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profileError || !profile || (profile.role !== 'academic_director' && profile.role !== 'founder')) {
    return { authorized: false, userId: session.user.id }
  }

  return { authorized: true, userId: session.user.id }
}

export async function GET() {
  try {
    const supabaseUserClient = createRouteHandlerClient({ cookies })
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { authorized } = await checkAuth(supabaseUserClient, supabaseAdmin)
    if (!authorized) {
      return NextResponse.json({ error: 'Forbidden: Access denied' }, { status: 403 })
    }

    // 1. Fetch profiles counts
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, role, status')

    if (profilesError) throw profilesError

    const supervisorsCount = profiles.filter(p => p.role === 'supervisor' && p.status === 'Active').length
    const teachersCount = profiles.filter(p => p.role === 'teacher' && p.status === 'Active').length
    const activeStudents = profiles.filter(p => p.role === 'student' && p.status !== 'Removed')
    const studentsCount = activeStudents.length

    // 2. Fetch trials count (pending/scheduled)
    const { data: trials, error: trialsError } = await supabaseAdmin
      .from('trial_requests')
      .select('id')
      .in('status', ['pending', 'scheduled'])

    if (trialsError) throw trialsError
    const trialsCount = (trials || []).length

    // 3. Fetch pending leave requests as escalations proxy
    const { data: escalations, error: escalationsError } = await supabaseAdmin
      .from('leave_requests')
      .select('id')
      .eq('status', 'pending')

    if (escalationsError) throw escalationsError
    const escalationsCount = (escalations || []).length

    // 4. expected fee calculation:
    // Fetch group class enrollments to classify students
    const { data: groupEnrollments, error: enrollError } = await supabaseAdmin
      .from('group_class_enrollments')
      .select('student_id')

    if (enrollError) throw enrollError

    const groupStudentIds = new Set((groupEnrollments || []).map((e: any) => e.student_id))
    
    let expectedFees = 0
    activeStudents.forEach(s => {
      if (groupStudentIds.has(s.id)) {
        expectedFees += 10 // Group student fee
      } else {
        expectedFees += 60 // 1:1 student fee
      }
    })

    // 5. collected fee calculation for current month:
    const now = new Date()
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from('fee_payments')
      .select('original_amount')
      .eq('status', 'verified')
      .eq('month_year', currentMonthStr)

    if (paymentsError) throw paymentsError

    const collectedFees = (payments || []).reduce((acc: number, p: any) => acc + (Number(p.original_amount) || 0), 0)

    // 6. academy-wide attendance % for current month
    const startOfMonthStr = `${currentMonthStr}-01`
    const { data: logs, error: logsError } = await supabaseAdmin
      .from('attendance_logs')
      .select('status')
      .gte('class_date', startOfMonthStr)

    if (logsError) throw logsError

    const totalLogs = (logs || []).length
    const presentLogs = (logs || []).filter((l: any) => l.status === 'present').length
    const attendancePercent = totalLogs === 0 ? 100 : Math.round((presentLogs / totalLogs) * 100)

    return NextResponse.json({
      supervisorsCount,
      teachersCount,
      studentsCount,
      trialsCount,
      escalationsCount,
      expectedFees,
      collectedFees,
      attendancePercent
    })

  } catch (err: any) {
    console.error('Director overview route GET exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
