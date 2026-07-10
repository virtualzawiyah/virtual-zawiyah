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

    // 1. Fetch pending leave requests
    const { data: leavesData, error: leavesError } = await supabaseAdmin
      .from('leave_requests')
      .select(`
        id,
        requester_id,
        role,
        start_date,
        end_date,
        reason,
        status,
        created_at,
        profiles:requester_id (
          full_name
        )
      `)
      .eq('status', 'pending')
      .in('role', ['teacher', 'student'])
      .order('created_at', { ascending: false })

    if (leavesError) throw leavesError

    // 2. Fetch pending makeup requests
    const { data: makeupsData, error: makeupsError } = await supabaseAdmin
      .from('makeup_requests')
      .select(`
        id,
        student_id,
        teacher_id,
        proposed_date,
        proposed_time,
        status,
        created_at,
        student:student_id (
          full_name
        ),
        teacher:teacher_id (
          full_name
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (makeupsError) throw makeupsError

    return NextResponse.json({
      leaveDisputes: (leavesData || []).map((l: any) => ({
        id: l.id,
        requesterId: l.requester_id,
        requesterName: l.profiles?.full_name || 'Unknown Requester',
        role: l.role,
        startDate: l.start_date,
        endDate: l.end_date,
        reason: l.reason,
        status: l.status,
        createdAt: l.created_at
      })),
      makeupDisputes: (makeupsData || []).map((m: any) => ({
        id: m.id,
        studentId: m.student_id,
        studentName: m.student?.full_name || 'Unknown Student',
        teacherId: m.teacher_id,
        teacherName: m.teacher?.full_name || 'Unknown Teacher',
        proposedDate: m.proposed_date,
        proposedTime: m.proposed_time,
        status: m.status,
        createdAt: m.created_at
      }))
    })

  } catch (err: any) {
    console.error('Supervisor disputes route GET exception:', err)
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

    const { request_id, request_type, action } = await request.json()

    if (!request_id || !request_type || !action) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    if (request_type === 'leave') {
      // Fetch leave request details before update to send notification
      const { data: leaveReq } = await supabaseAdmin
        .from('leave_requests')
        .select('requester_id, role, start_date')
        .eq('id', request_id)
        .maybeSingle()

      const { error: updateError } = await supabaseAdmin
        .from('leave_requests')
        .update({
          status: action, // 'approved' or 'rejected'
          approved_by: userId
        })
        .eq('id', request_id)

      if (updateError) throw updateError

      // Trigger 5: Leave approved or rejected
      if (leaveReq) {
        try {

          await createNotification({
            user_id: leaveReq.requester_id,
            role: leaveReq.role,
            title: `Leave Request ${action === 'approved' ? 'Approved' : 'Rejected'}`,
            message: `Your leave request for ${leaveReq.start_date} has been ${action === 'approved' ? 'approved' : 'rejected'}`
          })
        } catch (notifErr: any) {
          console.error('Failed to send notification for leave resolution (non-fatal):', notifErr.message)
        }
      }
    } else if (request_type === 'makeup') {
      const makeupStatus = action === 'approved' ? 'scheduled' : 'cancelled'
      const { error: updateError } = await supabaseAdmin
        .from('makeup_requests')
        .update({
          status: makeupStatus
        })
        .eq('id', request_id)

      if (updateError) throw updateError
    } else {
      return NextResponse.json({ error: 'Invalid request_type' }, { status: 400 })
    }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('Supervisor disputes route PATCH exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
