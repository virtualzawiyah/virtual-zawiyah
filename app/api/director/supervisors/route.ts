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

    // 1. Fetch supervisors
    const { data: supervisors, error: supError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'supervisor')

    if (supError) throw supError

    // 2. Fetch fallbacks (all teachers, students, disputes)
    const { data: teachers } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('role', 'teacher')
      .eq('status', 'Active')

    const { data: students } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('role', 'student')
      .eq('status', 'Active')

    const { data: pendingLeaves } = await supabaseAdmin
      .from('leave_requests')
      .select('id')
      .eq('status', 'pending')

    const { data: resolvedLeaves } = await supabaseAdmin
      .from('leave_requests')
      .select('id')
      .in('status', ['approved', 'rejected'])

    const teacherCount = (teachers || []).length
    const studentCount = (students || []).length
    const pendingDisputes = (pendingLeaves || []).length
    const resolvedDisputes = (resolvedLeaves || []).length

    const mapped = (supervisors || []).map((s: any) => ({
      id: s.id,
      full_name: s.full_name,
      email: s.email,
      teacherCount,
      studentCount,
      pendingDisputes,
      resolvedDisputes
    }))

    return NextResponse.json({ supervisors: mapped })

  } catch (err: any) {
    console.error('Director supervisors route GET exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
