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

    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()

    const { data: escalations, error: escError } = await supabaseAdmin
      .from('leave_requests')
      .select(`
        id,
        requester_id,
        role,
        reason,
        start_date,
        created_at,
        profiles:requester_id (
          full_name
        )
      `)
      .eq('status', 'pending')
      .lt('created_at', fortyEightHoursAgo)

    if (escError) throw escError

    const mapped = (escalations || []).map((e: any) => ({
      id: e.id,
      requester_name: e.profiles?.full_name || 'Unknown User',
      role: e.role,
      reason: e.reason,
      start_date: e.start_date,
      created_at: e.created_at
    }))

    return NextResponse.json(mapped)

  } catch (err: any) {
    console.error('Director escalations route GET exception:', err)
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

    const { request_id, action, notes } = await request.json()

    if (!request_id || !action || !notes) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Determine target status for leave request
    const statusValue = (action === 'approved' || action === 'override') ? 'approved' : 'rejected'

    // Update leave request status
    const { error: updateError } = await supabaseAdmin
      .from('leave_requests')
      .update({
        status: statusValue,
        approved_by: userId
      })
      .eq('id', request_id)

    if (updateError) throw updateError

    // Log to security audit log
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
    const userAgent = request.headers.get('user-agent') || 'Unknown'

    const { error: auditError } = await supabaseAdmin
      .from('security_audit_logs')
      .insert({
        profile_id: userId,
        event_type: 'director_escalation_resolution',
        ip_address: ip,
        user_agent: userAgent,
        details: `Escalated request ID: ${request_id}. Action: ${action}. Director Notes: "${notes}"`
      })

    if (auditError) throw auditError

    // Trigger 24: Security audit log generated
    try {

      await createNotification({
        role: 'founder',
        title: 'Security Alert',
        message: `Security alert: director_escalation_resolution - ${ip}`
      })
    } catch (notifErr: any) {
      console.error('Failed to send security alert notification (non-fatal):', notifErr.message)
    }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('Director escalations route PATCH exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
