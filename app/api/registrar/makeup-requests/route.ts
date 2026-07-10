import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // 1. Authenticate user and verify staff privileges
    const supabaseUserClient = createRouteHandlerClient({ cookies })
    const { data: { session }, error: sessionError } = await supabaseUserClient.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 })
    }

    const role = session.user.user_metadata?.role as string
    const authorizedRoles = ['registrar', 'admin', 'supervisor', 'academic_director', 'founder']
    
    if (!authorizedRoles.includes(role)) {
      return NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 })
    }

    // 2. Initialize admin client (bypasses RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 3. Query pending makeup requests
    const { data: makeupsData, error: queryError } = await supabaseAdmin
      .from('makeup_requests')
      .select(`
        id,
        status,
        proposed_date,
        proposed_time,
        student:student_id ( full_name ),
        teacher:teacher_id ( full_name ),
        attendance:original_attendance_id (
          class_date,
          class_type,
          group_class:group_class_id (
            course:course_id ( title )
          )
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (queryError) {
      console.error('Error fetching makeup requests:', queryError)
      return NextResponse.json({ error: queryError.message }, { status: 500 })
    }

    // 4. Fetch all enrollment_requests to map student course interests as fallback
    const { data: enrollments } = await supabaseAdmin
      .from('enrollment_requests')
      .select('student_name, course_interest')

    const mappedRequests = (makeupsData || []).map((row: any) => {
      const studentName = row.student?.full_name || 'Unknown Student'
      const teacherName = row.teacher?.full_name || 'Unknown Teacher'
      const missedDate = row.attendance?.class_date || row.proposed_date || 'N/A'
      
      // Resolve course name: first check group class title, fallback to enrollment request course_interest, fallback to Quran Reading
      let course = row.attendance?.group_class?.course?.title
      if (!course && enrollments) {
        const match = enrollments.find(e => 
          e.student_name && e.student_name.toLowerCase() === studentName.toLowerCase()
        )
        if (match) {
          course = match.course_interest
        }
      }
      if (!course) {
        course = 'Quran Reading (Nazra)'
      }

      return {
        id: row.id,
        studentName,
        course,
        missedDate,
        originalTeacher: teacherName,
        status: row.status
      }
    })

    return NextResponse.json({ success: true, requests: mappedRequests })

  } catch (err: any) {
    console.error('Makeup requests query handler exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
