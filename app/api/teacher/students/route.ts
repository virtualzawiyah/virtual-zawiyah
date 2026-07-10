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

    // 3. Fetch active teacher-student assignments
    const { data: assignments, error: assignError } = await supabaseAdmin
      .from('teacher_student_assignments')
      .select(`
        id,
        student_id,
        profiles:student_id (
          id,
          full_name,
          gender,
          status
        )
      `)
      .eq('teacher_id', teacherId)
      .eq('is_active', true)

    if (assignError) throw assignError

    if (!assignments || assignments.length === 0) {
      return NextResponse.json({
        success: true,
        todaysStudents: [],
        allStudents: []
      })
    }

    // 4. Query enrollment requests to match course interests
    const { data: enrollments } = await supabaseAdmin
      .from('enrollment_requests')
      .select('student_name, course_interest')

    // 5. Fetch class schedules for these assignments
    const assignmentIds = assignments.map(a => a.id)

    // Compute day_of_week index in PST/UTC+5
    const nowUtc = new Date()
    const nowPst = new Date(nowUtc.getTime() + (5 * 60 * 60 * 1000))
    const todayDayOfWeek = nowPst.getUTCDay() // 0 = Sunday, 1 = Monday, etc.

    const { data: schedules, error: schedError } = await supabaseAdmin
      .from('class_schedules')
      .select('assignment_id, day_of_week, start_time, duration_minutes')
      .in('assignment_id', assignmentIds)

    if (schedError) throw schedError

    // 6. Map and group students into todaysStudents and allStudents
    const mappedStudents = assignments.map((a: any) => {
      const studentProfile = a.profiles
      if (!studentProfile) return null

      // Match course name
      let courseName = 'Quran Reading (Nazra)'
      if (enrollments) {
        const match = enrollments.find(e => 
          e.student_name && e.student_name.toLowerCase() === studentProfile.full_name.toLowerCase()
        )
        if (match) {
          courseName = match.course_interest
        }
      }

      // Check if student has class scheduled for today
      const todaySched = (schedules || []).find(s => 
        s.assignment_id === a.id && s.day_of_week === todayDayOfWeek
      )

      return {
        id: studentProfile.id,
        full_name: studentProfile.full_name,
        gender: studentProfile.gender,
        status: studentProfile.status,
        courseName,
        assignment_id: a.id,
        scheduled_time: todaySched ? todaySched.start_time.substring(0, 5) : null,
        duration_minutes: todaySched ? todaySched.duration_minutes : null
      }
    }).filter(Boolean)

    const todaysStudents = mappedStudents.filter((s: any) => s.scheduled_time !== null)
    const allStudents = mappedStudents.filter((s: any) => s.scheduled_time === null)

    return NextResponse.json({
      success: true,
      todaysStudents,
      allStudents
    })

  } catch (err: any) {
    console.error('Teacher students list handler exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
