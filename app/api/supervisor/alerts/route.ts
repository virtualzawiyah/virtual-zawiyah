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

  if (profileError || !profile || (profile.role !== 'supervisor' && profile.role !== 'founder' && profile.role !== 'academic_director')) {
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

    // 1. Fetch students with attendance < 75% this month
    const now = new Date()
    const startOfMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

    const { data: logs, error: logsError } = await supabaseAdmin
      .from('attendance_logs')
      .select(`
        student_id,
        status,
        profiles:student_id (
          full_name
        )
      `)
      .gte('class_date', startOfMonthStr)

    if (logsError) throw logsError

    const studentLogsMap: Record<string, { fullName: string; present: number; total: number }> = {}
    
    for (const log of (logs || [])) {
      if (!log.student_id) continue
      const studentName = (log.profiles as any)?.full_name || 'Student'
      if (!studentLogsMap[log.student_id]) {
        studentLogsMap[log.student_id] = { fullName: studentName, present: 0, total: 0 }
      }
      studentLogsMap[log.student_id].total += 1
      if (log.status === 'present') {
        studentLogsMap[log.student_id].present += 1
      }
    }

    const attendanceAlerts = Object.entries(studentLogsMap)
      .map(([id, s]) => {
        const percent = Math.round((s.present / s.total) * 100)
        if (percent < 75) {
          return {
            id: `alt-attd-${id}`,
            category: 'Low Attendance',
            description: `${s.fullName} attendance has dropped to ${percent}% this month.`,
            targetTab: 'attendance',
            severity: 'high'
          }
        }
        return null
      })
      .filter(Boolean)

    // 2. Fetch pending leave requests older than 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const { data: leaves, error: leavesError } = await supabaseAdmin
      .from('leave_requests')
      .select(`
        id,
        profiles:requester_id (
          full_name
        )
      `)
      .eq('status', 'pending')
      .lt('created_at', twentyFourHoursAgo)

    if (leavesError) throw leavesError

    const leaveAlerts = (leaves || []).map((l: any) => ({
      id: `alt-leave-${l.id}`,
      category: 'Unreviewed Leave',
      description: `Leave request for ${l.profiles?.full_name || 'Staff/Student'} has been pending for >24 hours.`,
      targetTab: 'disputes',
      severity: 'medium'
    }))

    // 3. Fetch pending teacher change requests older than 48 hours
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()

    const { data: changes, error: changesError } = await supabaseAdmin
      .from('teacher_change_requests')
      .select(`
        id,
        student:student_id (
          full_name
        )
      `)
      .eq('status', 'pending')
      .lt('created_at', fortyEightHoursAgo)

    if (changesError) throw changesError

    const changeAlerts = (changes || []).map((c: any) => ({
      id: `alt-change-${c.id}`,
      category: 'Teacher Change Overdue',
      description: `Teacher change request for ${c.student?.full_name || 'Student'} has been pending for >48 hours.`,
      targetTab: 'changes',
      severity: 'high'
    }))

    // Merge all alerts
    const allAlerts = [...attendanceAlerts, ...leaveAlerts, ...changeAlerts]

    return NextResponse.json(allAlerts)

  } catch (err: any) {
    console.error('Supervisor alerts GET exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
