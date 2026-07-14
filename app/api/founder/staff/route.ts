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
      .select('id, full_name, email, role, teacher_type, status, whatsapp, created_at, gender')
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
      status: s.status,
      gender: s.gender
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

    const { full_name, role, email, contact, joining_date, gender } = await request.json()
    if (!full_name || !role || !email || !contact || !joining_date || !gender) {
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
        created_at: new Date(joining_date).toISOString(),
        gender: gender.toLowerCase()
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

export async function PATCH(request: Request) {
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

    const { staff_id, full_name, role, contact, gender } = await request.json()
    if (!staff_id) {
      return NextResponse.json({ error: 'Missing required parameter: staff_id' }, { status: 400 })
    }

    let mappedRole = role
    if (role === 'Academic Director') mappedRole = 'academic_director'
    else if (role === 'Supervisor') mappedRole = 'supervisor'
    else if (role === 'Registrar') mappedRole = 'registrar'
    else if (role === 'Content Manager') mappedRole = 'content_manager'
    else if (role === 'Finance Officer') mappedRole = 'finance_officer'
    else if (role === 'Teacher') mappedRole = 'teacher'

    const updatePayload: any = {}
    if (full_name !== undefined) updatePayload.full_name = full_name
    if (mappedRole !== undefined) {
      updatePayload.role = mappedRole
      updatePayload.teacher_type = mappedRole === 'teacher' ? '1:1' : null
    }
    if (contact !== undefined) updatePayload.whatsapp = contact
    if (gender !== undefined) updatePayload.gender = gender.toLowerCase()

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update(updatePayload)
      .eq('id', staff_id)

    if (profileError) {
      console.error('Error updating profile row:', profileError)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    // Also update role in user_metadata of auth.users
    if (mappedRole !== undefined) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        staff_id,
        { user_metadata: { role: mappedRole } }
      )
      if (authError) {
        console.error('Error updating auth user metadata:', authError)
      }
    }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('Staff PATCH exception:', err)
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

    const { authorized, userId: founder_id } = await checkFounderAuth(supabaseUserClient, supabaseAdmin)
    if (!authorized) {
      return NextResponse.json({ error: 'Forbidden: Founder privilege required' }, { status: 403 })
    }

    const { staff_id, reason } = await request.json()
    if (!staff_id || !reason) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // 1. Clean up references in all tables to prevent foreign key constraint violations
    
    // Update enrollment_requests preferred_teacher_id
    const { error: err1 } = await supabaseAdmin.from('enrollment_requests').update({ preferred_teacher_id: null }).eq('preferred_teacher_id', staff_id)
    if (err1) throw err1

    // Update enrollment_requests assigned_teacher_id
    const { error: err2 } = await supabaseAdmin.from('enrollment_requests').update({ assigned_teacher_id: null }).eq('assigned_teacher_id', staff_id)
    if (err2) throw err2

    // Update trial_requests converted_student_id
    const { error: err3 } = await supabaseAdmin.from('trial_requests').update({ converted_student_id: null }).eq('converted_student_id', staff_id)
    if (err3) throw err3

    // Delete trial_requests referencing staff_id
    const { error: err4 } = await supabaseAdmin.from('trial_requests').delete().or(`teacher_id.eq.${staff_id},student_id.eq.${staff_id}`)
    if (err4) throw err4

    // Delete teacher_student_assignments referencing staff_id (schedules cascade delete)
    const { error: err5 } = await supabaseAdmin.from('teacher_student_assignments').delete().or(`teacher_id.eq.${staff_id},student_id.eq.${staff_id}`)
    if (err5) throw err5

    // Delete group_classes referencing staff_id
    const { error: err6 } = await supabaseAdmin.from('group_classes').delete().eq('teacher_id', staff_id)
    if (err6) throw err6

    // Delete group_class_enrollments referencing staff_id
    const { error: err7 } = await supabaseAdmin.from('group_class_enrollments').delete().eq('student_id', staff_id)
    if (err7) throw err7

    // Update attendance_unlock_log unlocked_by to founder
    const { error: err8 } = await supabaseAdmin.from('attendance_unlock_log').update({ unlocked_by: founder_id }).eq('unlocked_by', staff_id)
    if (err8) throw err8

    // Delete attendance_logs referencing staff_id
    const { error: err9 } = await supabaseAdmin.from('attendance_logs').delete().or(`teacher_id.eq.${staff_id},student_id.eq.${staff_id}`)
    if (err9) throw err9

    // Delete lesson_logs referencing staff_id
    const { error: err10 } = await supabaseAdmin.from('lesson_logs').delete().or(`teacher_id.eq.${staff_id},student_id.eq.${staff_id}`)
    if (err10) throw err10

    // Delete disputes referencing staff_id
    const { error: err11 } = await supabaseAdmin.from('disputes').delete().eq('teacher_id', staff_id)
    if (err11) throw err11

    // Delete fee_payments referencing staff_id
    const { error: err12 } = await supabaseAdmin.from('fee_payments').delete().or(`teacher_id.eq.${staff_id},student_id.eq.${staff_id}`)
    if (err12) throw err12

    // Update fee_deferrals reviewed_by to null
    const { error: err13 } = await supabaseAdmin.from('fee_deferrals').update({ reviewed_by: null }).eq('reviewed_by', staff_id)
    if (err13) throw err13

    // Update leave_requests approved_by to null
    const { error: err14 } = await supabaseAdmin.from('leave_requests').update({ approved_by: null }).eq('approved_by', staff_id)
    if (err14) throw err14

    // Delete withdrawal_requests referencing staff_id
    const { error: err15 } = await supabaseAdmin.from('withdrawal_requests').delete().eq('teacher_id', staff_id)
    if (err15) throw err15

    // Delete wallet_transactions referencing staff_id
    const { error: err16 } = await supabaseAdmin.from('wallet_transactions').delete().eq('teacher_id', staff_id)
    if (err16) throw err16

    // Update exchange_rate_log entered_by_admin_id to founder
    const { error: err17 } = await supabaseAdmin.from('exchange_rate_log').update({ entered_by_admin_id: founder_id }).eq('entered_by_admin_id', staff_id)
    if (err17) throw err17

    // Update student_status_history changed_by to founder
    try {
      const { error: err18 } = await supabaseAdmin.from('student_status_history').update({ changed_by: founder_id }).eq('changed_by', staff_id)
      if (err18 && err18.code !== 'PGRST205') throw err18
    } catch (statusHistErr: any) {
      if (statusHistErr.code !== 'PGRST205') {
        console.error('Failed to update student_status_history:', statusHistErr.message)
        throw statusHistErr
      }
    }

    // Update student_status_import_logs uploaded_by to founder
    try {
      const { error: err19 } = await supabaseAdmin.from('student_status_import_logs').update({ uploaded_by: founder_id }).eq('uploaded_by', staff_id)
      if (err19 && err19.code !== 'PGRST205') throw err19
    } catch (statusImportErr: any) {
      if (statusImportErr.code !== 'PGRST205') {
        console.error('Failed to update student_status_import_logs:', statusImportErr.message)
        throw statusImportErr
      }
    }

    // Delete payroll_disbursements referencing staff_id
    const { error: err20 } = await supabaseAdmin.from('payroll_disbursements').delete().eq('recipient_id', staff_id)
    if (err20) throw err20

    // Update expenses_log logged_by to founder
    const { error: err21 } = await supabaseAdmin.from('expenses_log').update({ logged_by: founder_id }).eq('logged_by', staff_id)
    if (err21) throw err21

    // Update announcements published_by to founder
    const { error: err22 } = await supabaseAdmin.from('announcements').update({ published_by: founder_id }).eq('published_by', staff_id)
    if (err22) throw err22

    // Delete non_teaching_staff referencing staff_id
    const { error: err23 } = await supabaseAdmin.from('non_teaching_staff').delete().eq('id', staff_id)
    if (err23) throw err23

    // 2. Delete profiles row
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', staff_id)

    if (profileError) throw profileError

    // 3. Delete the corresponding Supabase Auth user via Admin API
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(staff_id)
    if (authError) throw authError

    // 4. Log to security_audit_logs
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
    const userAgent = request.headers.get('user-agent') || 'Unknown'

    const { error: auditError } = await supabaseAdmin
      .from('security_audit_logs')
      .insert({
        profile_id: founder_id, // Profile is deleted, associate audit log with the founder who performed the action
        event_type: 'founder_termination',
        ip_address: ip,
        user_agent: userAgent,
        details: `Terminated staff ID ${staff_id}. Reason: ${reason}`
      })

    if (auditError) throw auditError

    // Trigger 24: Security alert notification
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
