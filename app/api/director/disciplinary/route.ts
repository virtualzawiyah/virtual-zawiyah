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

  if (profileError || !profile || (profile.role !== 'academic_director' && profile.role !== 'founder')) {
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

    // 1. Fetch teachers pending removal
    const { data: teachers, error: queryError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, teacher_type, created_at')
      .eq('role', 'teacher')
      .eq('status', 'Pending Director Approval')

    if (queryError) throw queryError

    // 2. Fetch the corresponding supervisor notes from security audit logs
    const mapped = []
    for (const t of (teachers || [])) {
      const { data: logs } = await supabaseAdmin
        .from('security_audit_logs')
        .select('details')
        .eq('profile_id', t.id)
        .eq('event_type', 'recommend_removal')
        .order('created_at', { ascending: false })
        .limit(1)

      const note = logs && logs.length > 0 ? logs[0].details : 'No recommendation notes found.'
      mapped.push({
        id: t.id,
        full_name: t.full_name,
        teacher_type: t.teacher_type || '1:1',
        recommended_by_note: note,
        created_at: t.created_at
      })
    }

    return NextResponse.json(mapped)

  } catch (err: any) {
    console.error('Director disciplinary GET exception:', err)
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

    const { teacher_id, action, final_notes } = await request.json()

    if (!teacher_id || !action || !final_notes) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Determine target profile status based on action
    let newStatus = ''
    if (action === 'approve_termination') {
      newStatus = 'Removed'
    } else if (action === 'decline_retain') {
      newStatus = 'Active'
    } else {
      return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 })
    }

    // Update profile record in database
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', teacher_id)

    if (profileError) throw profileError

    // Trigger 15: Teacher removed
    if (action === 'approve_termination') {
      try {
        const { data: teacherProfile } = await supabaseAdmin
          .from('profiles')
          .select('full_name')
          .eq('id', teacher_id)
          .single()

        const teacherName = teacherProfile?.full_name || 'Teacher'


        
        // Notify teacher
        await createNotification({
          user_id: teacher_id,
          role: 'teacher',
          title: 'Account Terminated',
          message: 'Your teacher portal account has been terminated'
        })

        // Notify registrar
        await createNotification({
          role: 'registrar',
          title: 'Teacher Removed',
          message: `Teacher ${teacherName} has been removed`
        })
      } catch (notifErr: any) {
        console.error('Failed to send teacher removal notifications (non-fatal):', notifErr.message)
      }
    }

    // Insert decision logging to security audit log
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
    const userAgent = request.headers.get('user-agent') || 'Unknown'

    const { error: auditError } = await supabaseAdmin
      .from('security_audit_logs')
      .insert({
        profile_id: teacher_id,
        event_type: action,
        ip_address: ip,
        user_agent: userAgent,
        details: `Action: ${action} by Director ${userId}. Reason/Notes: "${final_notes}"`
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
    console.error('Director disciplinary PATCH exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
