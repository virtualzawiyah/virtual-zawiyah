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

    // 2. Parse query parameters
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('student_id')

    if (!studentId) {
      return NextResponse.json({ error: 'Missing student_id query parameter' }, { status: 400 })
    }

    // 3. Initialize admin client (bypasses RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 4. Security check: verify logged-in user has permission to access this student's data
    const userId = session.user.id
    if (userId !== studentId) {
      // Check parent linkage
      const { data: targetProfile, error: profErr } = await supabaseAdmin
        .from('profiles')
        .select('parent_id')
        .eq('id', studentId)
        .single()

      if (profErr || !targetProfile || targetProfile.parent_id !== userId) {
        return NextResponse.json({ error: 'Forbidden: Insufficient permissions to view this student profile' }, { status: 403 })
      }
    }

    // 5. Fetch student profile details (for full name)
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', studentId)
      .single()

    // 6. Fetch course name from enrollment_requests table
    let courseName = 'Quran Reading (Nazra)'
    if (profile) {
      const { data: enrollment } = await supabaseAdmin
        .from('enrollment_requests')
        .select('course_interest')
        .eq('student_name', profile.full_name)
        .limit(1)
        .maybeSingle()

      if (enrollment && enrollment.course_interest) {
        courseName = enrollment.course_interest
      }
    }

    // 7. Fetch attendance statistics
    const { data: attendance, error: attError } = await supabaseAdmin
      .from('attendance_logs')
      .select('status, class_date')
      .eq('student_id', studentId)

    if (attError) throw attError

    const totalClasses = attendance ? attendance.length : 0
    const presentClasses = attendance ? attendance.filter(a => a.status === 'present').length : 0
    const overallAttendance = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0

    // Filter current month logs
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() // 0-indexed

    const thisMonthLogs = (attendance || []).filter(a => {
      const d = new Date(a.class_date)
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth
    })

    const totalThisMonth = thisMonthLogs.length
    const presentThisMonth = thisMonthLogs.filter(a => a.status === 'present').length
    const thisMonthAttendance = totalThisMonth > 0 ? Math.round((presentThisMonth / totalThisMonth) * 100) : 0

    // 8. Fetch the latest lesson log
    const { data: logs, error: logsError } = await supabaseAdmin
      .from('lesson_logs')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(1)

    if (logsError) throw logsError

    const latestLog = logs && logs.length > 0 ? logs[0] : null

    return NextResponse.json({
      success: true,
      thisMonthAttendance,
      overallAttendance,
      totalClasses,
      presentClasses,
      courseName,
      latestLog
    })

  } catch (err: any) {
    console.error('Academic progress query handler exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
