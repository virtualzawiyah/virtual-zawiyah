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
        return NextResponse.json({ error: 'Forbidden: Insufficient permissions to view this student schedule' }, { status: 403 })
      }
    }

    // 5. Fetch student timezone
    const { data: studentProfile } = await supabaseAdmin
      .from('profiles')
      .select('timezone')
      .eq('id', studentId)
      .single()

    const studentTimezone = studentProfile?.timezone || 'UTC'

    // 6. Fetch active assignment IDs
    const { data: assignments, error: assignError } = await supabaseAdmin
      .from('teacher_student_assignments')
      .select('id, teacher_id')
      .eq('student_id', studentId)
      .eq('is_active', true)

    if (assignError) throw assignError

    if (!assignments || assignments.length === 0) {
      return NextResponse.json({
        success: true,
        schedules: [],
        studentTimezone
      })
    }

    const assignmentIds = assignments.map(a => a.id)

    // 7. Fetch class schedules for assignments
    const { data: schedules, error: schedError } = await supabaseAdmin
      .from('class_schedules')
      .select(`
        id,
        assignment_id,
        day_of_week,
        start_time,
        duration_minutes,
        teacher_student_assignments (
          teacher_id,
          profiles:teacher_id (
            full_name
          )
        )
      `)
      .in('assignment_id', assignmentIds)

    if (schedError) throw schedError

    // 8. Format schedules
    const formattedSchedules = (schedules || []).map((s: any) => {
      const tsa = s.teacher_student_assignments
      const teacherProfile = tsa?.profiles
      return {
        id: s.id,
        assignment_id: s.assignment_id,
        day_of_week: s.day_of_week,
        start_time: s.start_time,
        duration_minutes: s.duration_minutes,
        teacher_name: teacherProfile?.full_name || 'Teacher',
        teacher_id: tsa?.teacher_id || ''
      }
    })

    return NextResponse.json({
      success: true,
      schedules: formattedSchedules,
      studentTimezone
    })

  } catch (err: any) {
    console.error('Schedule query handler exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
