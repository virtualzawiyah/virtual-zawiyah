/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

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

    // 1. Fetch non-teaching staff roster
    const { data: staff, error: staffError } = await supabaseAdmin
      .from('non_teaching_staff')
      .select('*')
      .order('created_at', { ascending: false })

    if (staffError) throw staffError

    // 2. Fetch pending leave requests for non-teaching staff
    const { data: leaves, error: leavesError } = await supabaseAdmin
      .from('leave_requests')
      .select(`
        id,
        requester_id,
        role,
        start_date,
        end_date,
        reason,
        status,
        created_at,
        profiles:requester_id (
          full_name
        )
      `)
      .eq('status', 'pending')
      .eq('role', 'non_teaching_staff')
      .order('created_at', { ascending: false })

    if (leavesError) throw leavesError

    const mappedLeaves = (leaves || []).map((l: any) => {
      // Calculate duration days
      const start = new Date(l.start_date)
      const end = new Date(l.end_date)
      const duration = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)
      
      return {
        id: l.id,
        staffName: l.profiles?.full_name || 'Staff Member',
        role: 'Non-Teaching',
        startDate: l.start_date,
        durationDays: duration,
        reason: l.reason,
        status: l.status
      }
    })

    return NextResponse.json({
      staff: staff || [],
      pendingLeaves: mappedLeaves
    })

  } catch (err: any) {
    console.error('Director staff GET exception:', err)
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

    const { authorized } = await checkAuth(supabaseUserClient, supabaseAdmin)
    if (!authorized) {
      return NextResponse.json({ error: 'Forbidden: Access denied' }, { status: 403 })
    }

    const { name, role, contact, joining_date } = await request.json()

    if (!name || !role || !contact || !joining_date) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Insert staff
    const { data: newStaff, error: insertError } = await supabaseAdmin
      .from('non_teaching_staff')
      .insert({
        name,
        role,
        contact,
        joining_date,
        base_salary_pkr: 30000, // Schema requires non-null numeric salary
        status: 'Active'
      })
      .select()
      .single()

    if (insertError) throw insertError

    return NextResponse.json(newStaff)

  } catch (err: any) {
    console.error('Director staff POST exception:', err)
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

    const { staff_id, action, reason } = await request.json()

    if (!staff_id || !action) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    if (action === 'remove') {
      const { error: removeError } = await supabaseAdmin
        .from('non_teaching_staff')
        .update({
          status: 'Removed',
          termination_reason: reason || 'Not specified'
        })
        .eq('id', staff_id)

      if (removeError) throw removeError
    } else if (action === 'approve_leave' || action === 'reject_leave') {
      const statusValue = action === 'approve_leave' ? 'approved' : 'rejected'
      const { error: leaveError } = await supabaseAdmin
        .from('leave_requests')
        .update({
          status: statusValue,
          approved_by: userId
        })
        .eq('id', staff_id)

      if (leaveError) throw leaveError
    } else {
      return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 })
    }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('Director staff PATCH exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
