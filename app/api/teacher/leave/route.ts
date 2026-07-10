import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createNotification } from '@/lib/notifications'

// GET leave requests list
export async function GET(_request: Request) {
  try {
    const supabaseUserClient = createRouteHandlerClient({ cookies })
    const { data: { session }, error: sessionError } = await supabaseUserClient.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 })
    }

    const teacherId = session.user.id

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: leaves, error: leavesError } = await supabaseAdmin
      .from('leave_requests')
      .select('id, start_date, end_date, reason, status, created_at')
      .eq('requester_id', teacherId)
      .eq('role', 'teacher')
      .order('created_at', { ascending: false })

    if (leavesError) throw leavesError

    return NextResponse.json({
      success: true,
      leaves: leaves || []
    })

  } catch (err: any) {
    console.error('Teacher leave GET handler exception:', err)
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

    const teacherId = session.user.id

    const { start_date, end_date, reason } = await request.json()

    if (!start_date || !end_date || !reason) {
      return NextResponse.json({ error: 'Missing start_date, end_date, or reason parameters' }, { status: 400 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Validate: start_date must be at least 12 hours from now in PST/UTC+5
    const nowUtc = new Date()
    const nowPst = new Date(nowUtc.getTime() + (5 * 60 * 60 * 1000))
    const classStart = new Date(start_date)
    const diffHours = (classStart.getTime() - nowPst.getTime()) / (1000 * 60 * 60)

    if (diffHours < 12) {
      return NextResponse.json({ error: 'Leave must be requested at least 12 hours before the class' }, { status: 400 })
    }

    const { error: insertErr } = await supabaseAdmin
      .from('leave_requests')
      .insert({
        requester_id: teacherId,
        role: 'teacher',
        start_date,
        end_date,
        reason,
        status: 'pending'
      })

    if (insertErr) throw insertErr

    // Create supervisor notification (Trigger 4)
    try {
      const { data: requesterProfile } = await supabaseAdmin
        .from('profiles')
        .select('full_name')
        .eq('id', teacherId)
        .single()

      const requesterName = requesterProfile?.full_name || 'Teacher'


      await createNotification({
        role: 'supervisor',
        title: 'New Leave Request',
        message: `New leave request from ${requesterName} for ${start_date}`
      })
    } catch (notifErr: any) {
      console.error('Failed to send notification for teacher leave (non-fatal):', notifErr.message)
    }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('Teacher leave POST handler exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
