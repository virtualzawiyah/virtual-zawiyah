import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createNotification } from '@/lib/notifications'

async function checkFounderAuth(supabaseUserClient: any, supabaseAdmin: any) {
  const { data: { session }, error: sessionError } = await supabaseUserClient.auth.getSession()
  if (sessionError || !session) {
    return { authorized: false, userId: null }
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profileError || !profile || profile.role !== 'founder') {
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

    const { authorized } = await checkFounderAuth(supabaseUserClient, supabaseAdmin)
    if (!authorized) {
      return NextResponse.json({ error: 'Forbidden: Founder privilege required' }, { status: 403 })
    }

    const { data: staff, error: staffError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, role, teacher_type, status, whatsapp, created_at')
      .in('role', ['academic_director', 'supervisor', 'registrar', 'content_manager', 'finance_officer', 'teacher'])
      .neq('status', 'Removed')
      .order('created_at', { ascending: false })

    if (staffError) throw staffError

    const unifiedList = (staff || []).map((s: any) => ({
      id: s.id,
      name: s.full_name,
      email: s.email,
      role: s.role === 'academic_director' ? 'Academic Director' :
            s.role === 'supervisor' ? 'Supervisor' :
            s.role === 'registrar' ? 'Registrar' :
            s.role === 'content_manager' ? 'Content Manager' :
            s.role === 'finance_officer' ? 'Finance Officer' : 'Teacher',
      contact: s.whatsapp || 'N/A',
      joiningDate: s.created_at ? s.created_at.split('T')[0] : 'N/A',
      status: s.status
    }))

    return NextResponse.json(unifiedList)

  } catch (err: any) {
    console.error('Staff GET exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabaseUserClient = createRouteHandlerClient({ cookies })
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { authorized } = await checkFounderAuth(supabaseUserClient, supabaseAdmin)
    if (!authorized) {
      return NextResponse.json({ error: 'Forbidden: Founder privilege required' }, { status: 403 })
    }

    const { full_name, role, email, contact, joining_date } = await request.json()
    if (!full_name || !role || !email || !contact || !joining_date) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Auto-generate secure 12-character password
    const generatePassword = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
      let pwd = ''
      for (let i = 0; i < 12; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return pwd
    }
    const password = generatePassword()

    // Map role values to match enum case and metadata
    let mappedRole = role
    if (role === 'Academic Director') mappedRole = 'academic_director'
    else if (role === 'Supervisor') mappedRole = 'supervisor'
    else if (role === 'Registrar') mappedRole = 'registrar'
    else if (role === 'Content Manager') mappedRole = 'content_manager'
    else if (role === 'Finance Officer') mappedRole = 'finance_officer'
    else if (role === 'Teacher') mappedRole = 'teacher'

    // Create Supabase Auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: mappedRole }
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    const user = authData.user
    if (!user) {
      return NextResponse.json({ error: 'Failed to retrieve created user object' }, { status: 500 })
    }

    // Insert into profiles
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: user.id,
        email,
        full_name,
        role: mappedRole,
        whatsapp: contact,
        status: 'Active',
        teacher_type: mappedRole === 'teacher' ? '1:1' : null,
        created_at: new Date(joining_date).toISOString()
      })

    if (profileError) {
      console.error('Error inserting profile row:', profileError)
      // Cleanup auth user
      await supabaseAdmin.auth.admin.deleteUser(user.id)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      generatedPassword: password,
      staffId: user.id,
      email
    })

  } catch (err: any) {
    console.error('Staff POST exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabaseUserClient = createRouteHandlerClient({ cookies })
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { authorized } = await checkFounderAuth(supabaseUserClient, supabaseAdmin)
    if (!authorized) {
      return NextResponse.json({ error: 'Forbidden: Founder privilege required' }, { status: 403 })
    }

    const { staff_id, reason } = await request.json()
    if (!staff_id || !reason) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // 1. Update profiles status to 'Removed'
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ status: 'Removed' })
      .eq('id', staff_id)

    if (profileError) throw profileError

    // 2. Disable Supabase Auth user via Admin API
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      staff_id,
      { ban_duration: '876000h' } // 100 years
    )

    if (authError) {
      console.error('Error disabling auth user (continuing):', authError)
    }

    // 3. Log to security_audit_logs
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
    const userAgent = request.headers.get('user-agent') || 'Unknown'

    const { error: auditError } = await supabaseAdmin
      .from('security_audit_logs')
      .insert({
        profile_id: staff_id,
        event_type: 'founder_termination',
        ip_address: ip,
        user_agent: userAgent,
        details: reason
      })

    if (auditError) throw auditError

    // Trigger 24: Security audit log generated
    try {

      await createNotification({
        role: 'founder',
        title: 'Security Alert',
        message: `Security alert: founder_termination - ${ip}`
      })
    } catch (notifErr: any) {
      console.error('Failed to send security alert notification (non-fatal):', notifErr.message)
    }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('Staff DELETE exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
