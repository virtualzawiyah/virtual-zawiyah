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

    // 1. Fetch teachers
    // Note: profiles table does not have supervisor_id column, so we fetch all active teachers for now
    const { data: teachersData, error: teachersError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, teacher_type, status')
      .eq('role', 'teacher')

    if (teachersError) throw teachersError

    const activeTeachers = teachersData || []

    // 2. Fetch all attendance logs to calculate percentages in-memory
    const { data: allLogs, error: logsError } = await supabaseAdmin
      .from('attendance_logs')
      .select('teacher_id, student_id, status')

    if (logsError) throw logsError

    const logs = allLogs || []

    // 3. Process teachers attendance
    const processedTeachers = activeTeachers.map(teacher => {
      const teacherLogs = logs.filter(log => log.teacher_id === teacher.id)
      const totalClasses = teacherLogs.length
      const presentClasses = teacherLogs.filter(log => log.status === 'present').length
      
      const attendancePercent = totalClasses === 0 ? 100 : Math.round((presentClasses / totalClasses) * 100)
      const punctualityPercent = totalClasses === 0 ? 100 : 95 // Simulated base/defaults

      return {
        id: teacher.id,
        full_name: teacher.full_name,
        teacher_type: teacher.teacher_type || '1:1',
        attendancePercent,
        punctualityPercent,
        status: teacher.status
      }
    })

    // 4. Fetch assignments of these teachers to get students
    const teacherIds = activeTeachers.map(t => t.id)
    let assignments: any[] = []
    
    if (teacherIds.length > 0) {
      const { data: assignmentsData, error: assignmentsError } = await supabaseAdmin
        .from('teacher_student_assignments')
        .select(`
          id,
          student_id,
          profiles:student_id (
            id,
            full_name,
            status
          )
        `)
        .in('teacher_id', teacherIds)
        .eq('is_active', true)

      if (assignmentsError) throw assignmentsError
      assignments = assignmentsData || []
    }

    // 5. Fetch enrollment requests to map student course interests
    const { data: enrollments } = await supabaseAdmin
      .from('enrollment_requests')
      .select('student_name, course_interest')

    // 6. Process students attendance
    const processedStudents = assignments.map((assign: any) => {
      const studentProfile = assign.profiles
      if (!studentProfile) return null

      const studentLogs = logs.filter(log => log.student_id === studentProfile.id)
      const totalLogs = studentLogs.length
      const presentLogs = studentLogs.filter(log => log.status === 'present').length
      
      const attendancePercent = totalLogs === 0 ? 100 : Math.round((presentLogs / totalLogs) * 100)

      let course = 'Quran Reading (Nazra)'
      if (enrollments) {
        const match = enrollments.find(e => 
          e.student_name && e.student_name.toLowerCase() === studentProfile.full_name.toLowerCase()
        )
        if (match) {
          course = match.course_interest
        }
      }

      return {
        id: studentProfile.id,
        full_name: studentProfile.full_name,
        course,
        attendancePercent,
        studentId: studentProfile.id,
        status: studentProfile.status
      }
    }).filter(Boolean)

    return NextResponse.json({
      teachers: processedTeachers,
      students: processedStudents
    })

  } catch (err: any) {
    console.error('Attendance report route exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
