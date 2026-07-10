import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createNotification } from '@/lib/notifications'

// GET makeup requests list
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
        return NextResponse.json({ error: 'Forbidden: Insufficient permissions to view makeup requests' }, { status: 403 })
      }
    }

    const { data: makeups, error: makeupsError } = await supabaseAdmin
      .from('makeup_requests')
      .select('id, proposed_date, proposed_time, status, created_at')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })

    if (makeupsError) throw makeupsError

    return NextResponse.json({
      success: true,
      makeups: makeups || []
    })

  } catch (err: any) {
    console.error('Makeup requests GET handler exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}

// POST makeup request
export async function POST(request: Request) {
  try {
    const supabaseUserClient = createRouteHandlerClient({ cookies })
    const { data: { session }, error: sessionError } = await supabaseUserClient.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 })
    }

    const { student_id, proposed_date, proposed_time } = await request.json()

    if (!student_id || !proposed_date || !proposed_time) {
      return NextResponse.json({ error: 'Missing student_id, proposed_date, or proposed_time parameters' }, { status: 400 })
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
        return NextResponse.json({ error: 'Forbidden: Insufficient permissions to request makeup' }, { status: 403 })
      }
    }

    // Verify student has an active 1:1 teacher assignment (and get teacher_id)
    const { data: assignment, error: assignErr } = await supabaseAdmin
      .from('teacher_student_assignments')
      .select('teacher_id')
      .eq('student_id', student_id)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle()

    if (assignErr) throw assignErr

    if (!assignment) {
      return NextResponse.json({ error: 'Makeup requests are only available for students with active 1:1 teacher assignments.' }, { status: 400 })
    }

    const teacherId = assignment.teacher_id

    // Insert makeup request
    const { data: makeupRequest, error: makeupErr } = await supabaseAdmin
      .from('makeup_requests')
      .insert({
        student_id,
        teacher_id: teacherId,
        proposed_date,
        proposed_time,
        status: 'pending'
      })
      .select()
      .single()

    if (makeupErr) throw makeupErr

    // Create teacher notification (Trigger 6)
    try {
      const { data: studentProfile } = await supabaseAdmin
        .from('profiles')
        .select('full_name')
        .eq('id', student_id)
        .single()

      const studentName = studentProfile?.full_name || 'Student'


      await createNotification({
        user_id: teacherId,
        role: 'teacher',
        title: 'New Makeup Class Request',
        message: `Makeup class requested by ${studentName} for ${proposed_date}`
      })
    } catch (notifErr: any) {
      console.error('Failed to send notification for student makeup (non-fatal):', notifErr.message)
    }

    return NextResponse.json({
      success: true,
      makeupRequest
    })

  } catch (err: any) {
    console.error('Makeup requests POST handler exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
