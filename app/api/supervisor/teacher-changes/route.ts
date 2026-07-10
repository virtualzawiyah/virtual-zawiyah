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

    // 1. Fetch pending change requests
    const { data: requestsData, error: queryError } = await supabaseAdmin
      .from('teacher_change_requests')
      .select(`
        id,
        student_id,
        current_teacher_id,
        reason,
        status,
        created_at,
        student:student_id (
          full_name
        ),
        current_teacher:current_teacher_id (
          full_name
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (queryError) throw queryError

    // 2. Fetch all enrollment requests for student course name fallback mapping
    const { data: enrollments } = await supabaseAdmin
      .from('enrollment_requests')
      .select('student_name, course_interest')

    const mapped = (requestsData || []).map((row: any) => {
      const studentName = row.student?.full_name || 'Unknown Student'
      const currentTeacher = row.current_teacher?.full_name || 'Unknown Teacher'

      let course = 'Quran Reading (Nazra)'
      if (enrollments) {
        const match = enrollments.find(e => 
          e.student_name && e.student_name.toLowerCase() === studentName.toLowerCase()
        )
        if (match) {
          course = match.course_interest
        }
      }

      return {
        id: row.id,
        studentId: row.student_id,
        studentName,
        currentTeacherId: row.current_teacher_id,
        currentTeacher,
        course,
        reason: row.reason,
        status: row.status,
        createdAt: row.created_at
      }
    })

    return NextResponse.json(mapped)

  } catch (err: any) {
    console.error('Supervisor teacher-changes GET exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabaseUserClient = createRouteHandlerClient({ cookies })
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { authorized, userId } = await checkAuth(supabaseUserClient, supabaseAdmin)
    if (!authorized) {
      return NextResponse.json({ error: 'Forbidden: Access denied' }, { status: 403 })
    }

    const { request_id, action } = await request.json()

    if (!request_id || !action) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Fetch teacher change request details before update to send notifications
    const { data: changeReq } = await supabaseAdmin
      .from('teacher_change_requests')
      .select('student_id, student:student_id(full_name)')
      .eq('id', request_id)
      .maybeSingle()

    const { error: updateError } = await supabaseAdmin
      .from('teacher_change_requests')
      .update({
        status: action, // 'approved' or 'rejected'
        reviewed_by: userId
      })
      .eq('id', request_id)

    if (updateError) throw updateError

    // Trigger 17: Supervisor reassignment approved/rejected
    const studentName = changeReq?.student?.full_name || 'Student'
    try {

      // Notify registrar
      await createNotification({
        role: 'registrar',
        title: `Teacher Change Request ${action === 'approved' ? 'Approved' : 'Rejected'}`,
        message: `Teacher change request for ${studentName} has been ${action === 'approved' ? 'approved' : 'rejected'}`
      })
      // Notify student if approved
      if (action === 'approved' && changeReq) {
        await createNotification({
          user_id: changeReq.student_id,
          role: 'student',
          title: 'Teacher Change Request Approved',
          message: 'Your teacher change request has been approved. You will be assigned a new teacher shortly.'
        })
      }
    } catch (notifErr: any) {
      console.error('Failed to send teacher change notifications (non-fatal):', notifErr.message)
    }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('Supervisor teacher-changes PATCH exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
