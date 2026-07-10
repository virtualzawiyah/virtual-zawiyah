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

    // 3. Resolve active assignments for this teacher
    const { data: assignments, error: assignError } = await supabaseAdmin
      .from('teacher_student_assignments')
      .select('id, student_id, profiles:student_id (full_name)')
      .eq('teacher_id', teacherId)
      .eq('is_active', true)

    if (assignError) throw assignError

    if (!assignments || assignments.length === 0) {
      return NextResponse.json({
        success: true,
        schedules: []
      })
    }

    const assignmentIds = assignments.map(a => a.id)

    // Compute day_of_week index and date string in PST/UTC+5
    const nowUtc = new Date()
    const nowPst = new Date(nowUtc.getTime() + (5 * 60 * 60 * 1000))
    const todayDayOfWeek = nowPst.getUTCDay()
    const todayDateStr = nowPst.toISOString().split('T')[0]

    // 4. Fetch schedules for these assignments scheduled for today
    const { data: schedules, error: schedError } = await supabaseAdmin
      .from('class_schedules')
      .select('assignment_id, day_of_week, start_time, duration_minutes')
      .in('assignment_id', assignmentIds)
      .eq('day_of_week', todayDayOfWeek)

    if (schedError) throw schedError

    // 5. Fetch attendance logs for today to determine completed classes
    const { data: attendanceLogs } = await supabaseAdmin
      .from('attendance_logs')
      .select('student_id')
      .eq('teacher_id', teacherId)
      .eq('class_date', todayDateStr)

    // 6. Format schedules
    const formattedSchedules = (schedules || []).map((s: any) => {
      const assignment = assignments.find(a => a.id === s.assignment_id)
      const studentProfile = assignment?.profiles as any
      const studentId = assignment?.student_id

      const isCompleted = (attendanceLogs || []).some(log => log.student_id === studentId)

      return {
        student_name: studentProfile?.full_name || 'Unknown Student',
        student_id: studentId,
        day_of_week: s.day_of_week,
        start_time: s.start_time.substring(0, 5),
        duration_minutes: s.duration_minutes,
        assignment_id: s.assignment_id,
        is_completed: isCompleted
      }
    })

    // Sort schedules by start_time
    formattedSchedules.sort((a, b) => a.start_time.localeCompare(b.start_time))

    return NextResponse.json({
      success: true,
      schedules: formattedSchedules
    })

  } catch (err: any) {
    console.error('Teacher schedule list handler exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
