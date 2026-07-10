import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
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

    // 1. Fetch profiles for counts
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, role, status, teacher_type')

    if (profilesError) throw profilesError

    const activeStudents = profiles.filter(p => p.role === 'student' && p.status === 'Active')
    const studentsCount = activeStudents.length

    const activeTeachers = profiles.filter(p => p.role === 'teacher' && p.status === 'Active')
    const teachersCount = activeTeachers.length

    const supervisorsCount = profiles.filter(p => p.role === 'supervisor' && p.status === 'Active').length

    // Breakdown teachers by teacher_type
    const teacherTypesCount = {
      '1:1': activeTeachers.filter(t => t.teacher_type === '1:1').length,
      'Dars-e-Nizami': activeTeachers.filter(t => t.teacher_type === 'Dars-e-Nizami').length,
      'Tajweed': activeTeachers.filter(t => t.teacher_type === 'Tajweed').length
    }

    // Breakdown students: 1:1 vs group
    const { data: groupEnrollments, error: enrollError } = await supabaseAdmin
      .from('group_class_enrollments')
      .select('student_id')

    if (enrollError) throw enrollError

    const groupStudentIds = new Set((groupEnrollments || []).map((e: any) => e.student_id))
    let oneOnOneStudentsCount = 0
    let groupStudentsCount = 0

    activeStudents.forEach(s => {
      if (groupStudentIds.has(s.id)) {
        groupStudentsCount++
      } else {
        oneOnOneStudentsCount++
      }
    })

    // 2. Fetch trials count (pending/scheduled)
    const { data: trials, error: trialsError } = await supabaseAdmin
      .from('trial_requests')
      .select('id')
      .in('status', ['pending', 'scheduled'])

    if (trialsError) throw trialsError
    const trialsCount = (trials || []).length

    // 3. Fetch pending escalations count (leave_requests pending > 48 hours)
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    const { data: escalations, error: escalationsError } = await supabaseAdmin
      .from('leave_requests')
      .select('id')
      .eq('status', 'pending')
      .lt('created_at', fortyEightHoursAgo)

    if (escalationsError) throw escalationsError
    const escalationsCount = (escalations || []).length

    // 4. Academy-wide attendance % this month
    const now = new Date()
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
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
      success: true,
      studentsCount,
      oneOnOneStudentsCount,
      groupStudentsCount,
      teachersCount,
      teacherTypesCount,
      supervisorsCount,
      attendancePercent,
      trialsCount,
      escalationsCount
    })

  } catch (err: any) {
    console.error('Academy overview GET exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
