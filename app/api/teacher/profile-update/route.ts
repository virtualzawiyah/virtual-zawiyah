import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createNotification } from '@/lib/notifications'

// GET the teacher's current profile and latest change request status
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

    // Fetch current profile fields
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('full_name, avatar_url, education, experience')
      .eq('id', teacherId)
      .single()

    if (profileErr) throw profileErr

    // Fetch latest profile change request
    const { data: latestRequest, error: reqErr } = await supabaseAdmin
      .from('teacher_profile_requests')
      .select('id, new_avatar_url, new_education, new_experience, status, created_at')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (reqErr) throw reqErr

    return NextResponse.json({
      success: true,
      profile,
      latestRequest
    })

  } catch (err: any) {
    console.error('Teacher profile GET exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}

// POST a new profile change request or update an existing pending one
export async function POST(request: Request) {
  try {
    const supabaseUserClient = createRouteHandlerClient({ cookies })
    const { data: { session }, error: sessionError } = await supabaseUserClient.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 })
    }

    const teacherId = session.user.id
    const { new_avatar_url, new_education, new_experience } = await request.json()

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Fetch teacher name
    const { data: teacherProfile, error: nameErr } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', teacherId)
      .single()

    if (nameErr) throw nameErr
    const teacherName = teacherProfile?.full_name || 'Teacher'

    // 2. Check for an existing pending request
    const { data: existingPending, error: existErr } = await supabaseAdmin
      .from('teacher_profile_requests')
      .select('id')
      .eq('teacher_id', teacherId)
      .eq('status', 'pending')
      .maybeSingle()

    if (existErr) throw existErr

    if (existingPending) {
      // Update the existing pending request
      const { error: updateErr } = await supabaseAdmin
        .from('teacher_profile_requests')
        .update({
          new_avatar_url,
          new_education,
          new_experience,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingPending.id)

      if (updateErr) throw updateErr
    } else {
      // Insert new request
      const { error: insertErr } = await supabaseAdmin
        .from('teacher_profile_requests')
        .insert({
          teacher_id: teacherId,
          new_avatar_url,
          new_education,
          new_experience,
          status: 'pending'
        })

      if (insertErr) throw insertErr
    }

    // 3. Send notification to the Content Manager
    try {
      await createNotification({
        role: 'content_manager',
        title: 'Profile Edit Request',
        message: `Teacher ${teacherName} has submitted profile changes for approval.`
      })
    } catch (notifErr: any) {
      console.error('Failed to send content manager notification (non-fatal):', notifErr.message)
    }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('Teacher profile POST exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
