import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createNotification } from '@/lib/notifications'

// GET leave requests list
export async function GET(request: Request) {
  try {
    const supabaseUserClient = createRouteHandlerClient({ cookies })
    const { data: { session }, error: sessionError } = await supabaseUserClient.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('student_id')

    if (!studentId) {
      return NextResponse.json({ error: 'Missing student_id query parameter' }, { status: 400 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Security check: verify owner or parent linkage
    const userId = session.user.id
    if (userId !== studentId) {
      const { data: targetProfile, error: profErr } = await supabaseAdmin
        .from('profiles')
        .select('parent_id')
        .eq('id', studentId)
        .single()

      if (profErr || !targetProfile || targetProfile.parent_id !== userId) {
        return NextResponse.json({ error: 'Forbidden: Insufficient permissions to view leave requests' }, { status: 403 })
      }
    }

    const { data: leaves, error: leavesError } = await supabaseAdmin
      .from('leave_requests')
      .select('id, start_date, reason, status, created_at')
      .eq('requester_id', studentId)
      .eq('role', 'student')
      .order('created_at', { ascending: false })

    if (leavesError) throw leavesError

    return NextResponse.json({
      success: true,
      leaves: leaves || []
    })

  } catch (err: any) {
    console.error('Leave requests GET handler exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}

// POST leave request
export async function POST(request: Request) {
  try {
    const supabaseUserClient = createRouteHandlerClient({ cookies })
    const { data: { session }, error: sessionError } = await supabaseUserClient.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 })
    }

    const { student_id, start_date, reason } = await request.json()

    if (!student_id || !start_date || !reason) {
      return NextResponse.json({ error: 'Missing student_id, start_date, or reason parameters' }, { status: 400 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Security check: verify ownership
    const userId = session.user.id
    if (userId !== student_id) {
      const { data: targetProfile, error: profErr } = await supabaseAdmin
        .from('profiles')
        .select('parent_id')
        .eq('id', student_id)
        .single()

      if (profErr || !targetProfile || targetProfile.parent_id !== userId) {
        return NextResponse.json({ error: 'Forbidden: Insufficient permissions to request leave' }, { status: 403 })
      }
    }

    // Server-side validation: start_date must be at least 12 hours from now in PST/UTC+5
    // Construct Date object in UTC+5
    const nowUtc = new Date()
    const targetDate = new Date(`${start_date}T00:00:00+05:00`)
    const diffHours = (targetDate.getTime() - nowUtc.getTime()) / (1000 * 60 * 60)

    if (diffHours < 12) {
      return NextResponse.json({ error: 'Leave must be requested at least 12 hours before the class' }, { status: 400 })
    }

    // Insert leave request
    // Set end_date to start_date to satisfy schema end_date NOT NULL constraint
    const { data: leaveRequest, error: leaveErr } = await supabaseAdmin
      .from('leave_requests')
      .insert({
        requester_id: student_id,
        role: 'student',
        start_date,
        end_date: start_date,
        reason,
        status: 'pending'
      })
      .select()
      .single()

    if (leaveErr) throw leaveErr

    // Create supervisor notification (Trigger 4)
    try {
      const { data: requesterProfile } = await supabaseAdmin
        .from('profiles')
        .select('full_name')
        .eq('id', student_id)
        .single()

      const requesterName = requesterProfile?.full_name || 'Student'


      await createNotification({
        role: 'supervisor',
        title: 'New Leave Request',
        message: `New leave request from ${requesterName} for ${start_date}`
      })
    } catch (notifErr: any) {
      console.error('Failed to send notification for student leave (non-fatal):', notifErr.message)
    }

    return NextResponse.json({
      success: true,
      leaveRequest
    })

  } catch (err: any) {
    console.error('Leave requests POST handler exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
