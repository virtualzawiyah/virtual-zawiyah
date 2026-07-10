/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createNotification } from '@/lib/notifications'

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

    // 1. Fetch active teachers
    const { data: teachers, error: teachersError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, teacher_type, status')
      .eq('role', 'teacher')
      .neq('status', 'Removed')

    if (teachersError) throw teachersError

    // 2. Fetch active students
    const { data: students, error: studentsError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, status')
      .eq('role', 'student')
      .neq('status', 'Removed')

    if (studentsError) throw studentsError

    // 3. Fetch enrollment requests to map student course interests
    const { data: enrollments } = await supabaseAdmin
      .from('enrollment_requests')
      .select('student_name, course_interest')

    const mappedStudents = (students || []).map((s: any) => {
      let course = 'Quran Reading (Nazra)'
      if (enrollments) {
        const match = enrollments.find(e => 
          e.student_name && e.student_name.toLowerCase() === s.full_name.toLowerCase()
        )
        if (match) {
          course = match.course_interest
        }
      }
      return {
        id: s.id,
        name: s.full_name,
        course,
        status: s.status
      }
    })

    const mappedTeachers = (teachers || []).map((t: any) => ({
      id: t.id,
      name: t.full_name,
      course: t.teacher_type || '1:1',
      status: t.status
    }))

    return NextResponse.json({
      teachers: mappedTeachers,
      students: mappedStudents
    })

  } catch (err: any) {
    console.error('Supervisor disciplinary GET exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
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

    const { target_id, target_type, action, reason } = await request.json()

    if (!target_id || !target_type || !action || !reason) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // 1. Determine profile status to update based on action
    let newStatus = ''
    if (action === 'recommend_removal') {
      if (target_type !== 'teacher') {
        return NextResponse.json({ error: 'Removal recommendation only applies to teachers' }, { status: 400 })
      }
      newStatus = 'Pending Director Approval'
    } else if (action === 'suspend') {
      if (target_type !== 'student') {
        return NextResponse.json({ error: 'Suspension only applies to students' }, { status: 400 })
      }
      newStatus = 'Suspended'
    } else if (action === 'remove') {
      if (target_type !== 'student') {
        return NextResponse.json({ error: 'Removal only applies to students' }, { status: 400 })
      }
      newStatus = 'Removed'
    } else {
      return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 })
    }

    // 2. Update profile status in database
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', target_id)

    if (profileError) throw profileError

    // Trigger 13: Student account suspended/unsuspended
    if (target_type === 'student') {
      try {

        if (newStatus === 'Suspended') {
          await createNotification({
            user_id: target_id,
            role: 'student',
            title: 'Account Suspended',
            message: 'Your student portal account has been suspended'
          })
        } else if (newStatus === 'Active' || newStatus === 'active') {
          await createNotification({
            user_id: target_id,
            role: 'student',
            title: 'Account Unsuspended',
            message: 'Your student portal account has been unsuspended'
          })
        }
      } catch (notifErr: any) {
        console.error('Failed to send suspension notification (non-fatal):', notifErr.message)
      }
    }

    // Trigger 14: Teacher removal recommended
    if (action === 'recommend_removal' && target_type === 'teacher') {
      try {
        const { data: teacherProfile } = await supabaseAdmin
          .from('profiles')
          .select('full_name')
          .eq('id', target_id)
          .single()

        const teacherName = teacherProfile?.full_name || 'Teacher'


        await createNotification({
          role: 'academic_director',
          title: 'Teacher Removal Recommended',
          message: `Removal recommended for teacher ${teacherName}`
        })
      } catch (notifErr: any) {
        console.error('Failed to send removal recommendation notification (non-fatal):', notifErr.message)
      }
    }

    // 3. Log event to security_audit_logs
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
    const userAgent = request.headers.get('user-agent') || 'Unknown'

    const { error: auditError } = await supabaseAdmin
      .from('security_audit_logs')
      .insert({
        profile_id: target_id,
        event_type: action,
        ip_address: ip,
        user_agent: userAgent,
        details: reason
      })

    if (auditError) throw auditError

    // Trigger 24: Security audit log generated
    try {

      await createNotification({
        role: 'founder',
        title: 'Security Alert',
        message: `Security alert: ${action} - ${ip}`
      })
    } catch (notifErr: any) {
      console.error('Failed to send security alert notification (non-fatal):', notifErr.message)
    }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('Supervisor disciplinary POST exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
