import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createNotification } from '@/lib/notifications'

// GET makeup requests list
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

    // Query makeup requests and join profiles for student names
    const { data: makeups, error: makeupsError } = await supabaseAdmin
      .from('makeup_requests')
      .select(`
        id,
        proposed_date,
        proposed_time,
        status,
        created_at,
        profiles:student_id (
          full_name
        )
      `)
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false })

    if (makeupsError) throw makeupsError

    const formatted = (makeups || []).map((m: any) => ({
      id: m.id,
      studentName: m.profiles?.full_name || 'Unknown Student',
      requestedTime: `${m.proposed_date} at ${m.proposed_time}`,
      status: m.status,
      created_at: m.created_at
    }))

    return NextResponse.json({
      success: true,
      makeups: formatted
    })

  } catch (err: any) {
    console.error('Teacher makeup GET handler exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}

// POST accept/decline makeup request
export async function POST(request: Request) {
  try {
    const supabaseUserClient = createRouteHandlerClient({ cookies })
    const { data: { session }, error: sessionError } = await supabaseUserClient.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 })
    }

    const teacherId = session.user.id

    const { makeup_request_id, decision } = await request.json()

    if (!makeup_request_id || !decision) {
      return NextResponse.json({ error: 'Missing makeup_request_id or decision parameters' }, { status: 400 })
    }

    if (decision !== 'scheduled' && decision !== 'cancelled') {
      return NextResponse.json({ error: 'Invalid decision parameter. Must be scheduled or cancelled' }, { status: 400 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch student_id before updating to send notification
    const { data: makeupReq } = await supabaseAdmin
      .from('makeup_requests')
      .select('student_id')
      .eq('id', makeup_request_id)
      .maybeSingle()

    const { error: updateErr } = await supabaseAdmin
      .from('makeup_requests')
      .update({ status: decision })
      .eq('id', makeup_request_id)
      .eq('teacher_id', teacherId)

    if (updateErr) throw updateErr

    // Trigger 7: Makeup accepted or refused
    if (makeupReq) {
      try {
        const outcome = decision === 'scheduled' ? 'accepted' : 'declined'

        await createNotification({
          user_id: makeupReq.student_id,
          role: 'student',
          title: `Makeup Request ${decision === 'scheduled' ? 'Accepted' : 'Declined'}`,
          message: `Your makeup request has been ${outcome}`
        })
      } catch (notifErr: any) {
        console.error('Failed to send notification for makeup decision (non-fatal):', notifErr.message)
      }
    }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('Teacher makeup POST handler exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
