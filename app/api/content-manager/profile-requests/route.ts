import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createNotification } from '@/lib/notifications'

// GET all pending profile change requests
export async function GET(_request: Request) {
  try {
    const supabaseUserClient = createRouteHandlerClient({ cookies })
    const { data: { session }, error: sessionError } = await supabaseUserClient.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verify content manager role
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile?.role !== 'content_manager' && profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Content Manager role required' }, { status: 403 })
    }

    // Fetch pending requests with the teacher's profile details
    const { data: requests, error: reqErr } = await supabaseAdmin
      .from('teacher_profile_requests')
      .select(`
        id,
        teacher_id,
        new_avatar_url,
        new_education,
        new_experience,
        status,
        created_at,
        profiles (
          full_name,
          avatar_url,
          education,
          experience
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (reqErr) throw reqErr

    return NextResponse.json({
      success: true,
      requests: requests || []
    })

  } catch (err: any) {
    console.error('Content Manager profile GET exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}

// POST to resolve a profile change request (Approve or Reject)
export async function POST(request: Request) {
  try {
    const supabaseUserClient = createRouteHandlerClient({ cookies })
    const { data: { session }, error: sessionError } = await supabaseUserClient.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 })
    }

    const { requestId, action } = await request.json()

    if (!requestId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Missing or invalid parameters' }, { status: 400 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verify content manager role
    const { data: cmProfile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (cmProfile?.role !== 'content_manager' && cmProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Content Manager role required' }, { status: 403 })
    }

    // Fetch the target request details
    const { data: reqRow, error: fetchErr } = await supabaseAdmin
      .from('teacher_profile_requests')
      .select('teacher_id, new_avatar_url, new_education, new_experience, status')
      .eq('id', requestId)
      .single()

    if (fetchErr) throw fetchErr

    if (reqRow.status !== 'pending') {
      return NextResponse.json({ error: 'Request is already resolved' }, { status: 400 })
    }

    if (action === 'approve') {
      // 1. Update profiles table with approved details
      const { error: profileUpdateErr } = await supabaseAdmin
        .from('profiles')
        .update({
          avatar_url: reqRow.new_avatar_url,
          education: reqRow.new_education,
          experience: reqRow.new_experience,
          updated_at: new Date().toISOString()
        })
        .eq('id', reqRow.teacher_id)

      if (profileUpdateErr) throw profileUpdateErr

      // 2. Set request status to approved
      const { error: requestUpdateErr } = await supabaseAdmin
        .from('teacher_profile_requests')
        .update({ status: 'approved', updated_at: new Date().toISOString() })
        .eq('id', requestId)

      if (requestUpdateErr) throw requestUpdateErr

      // 3. Mark Content Manager notifications for this request as read
      await supabaseAdmin
        .from('notifications')
        .update({ is_read: true })
        .eq('role', 'content_manager')
        .eq('title', 'Profile Edit Request')

      // 4. Notify the teacher of approval
      try {
        await createNotification({
          user_id: reqRow.teacher_id,
          title: 'Profile Changes Approved',
          message: 'Your profile change request has been reviewed and approved.'
        })
      } catch (nErr: any) {
        console.error('Failed to notify teacher (non-fatal):', nErr.message)
      }

    } else {
      // Reject request
      // 1. Set request status to rejected
      const { error: requestUpdateErr } = await supabaseAdmin
        .from('teacher_profile_requests')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', requestId)

      if (requestUpdateErr) throw requestUpdateErr

      // 2. Mark Content Manager notifications for this request as read
      await supabaseAdmin
        .from('notifications')
        .update({ is_read: true })
        .eq('role', 'content_manager')
        .eq('title', 'Profile Edit Request')

      // 3. Notify the teacher of rejection
      try {
        await createNotification({
          user_id: reqRow.teacher_id,
          title: 'Profile Changes Rejected',
          message: 'Your profile change request was rejected. Please review your edits and resubmit.'
        })
      } catch (nErr: any) {
        console.error('Failed to notify teacher (non-fatal):', nErr.message)
      }
    }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('Content Manager profile POST exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
