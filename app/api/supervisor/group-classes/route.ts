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

  if (profileError || !profile || (profile.role !== 'supervisor' && profile.role !== 'founder' && profile.role !== 'academic_director')) {
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

    // 1. Fetch group classes
    const { data: classesData, error: classesError } = await supabaseAdmin
      .from('group_classes')
      .select(`
        id,
        class_name,
        year_level,
        max_capacity,
        course:course_id (
          title
        ),
        teacher:teacher_id (
          full_name
        )
      `)

    if (classesError) throw classesError

    // 2. Fetch all group enrollments to count and map students
    const { data: enrollmentsData, error: enrollmentsError } = await supabaseAdmin
      .from('group_class_enrollments')
      .select(`
        group_class_id,
        student_id,
        profiles:student_id (
          full_name
        )
      `)

    if (enrollmentsError) throw enrollmentsError

    const enrollments = enrollmentsData || []

    const mapped = (classesData || []).map((c: any) => {
      const classEnrollments = enrollments.filter((e: any) => e.group_class_id === c.id)
      const enrolledCount = classEnrollments.length
      const enrolledStudents = classEnrollments.map((e: any) => ({
        student_id: e.student_id,
        student_name: e.profiles?.full_name || 'Unknown'
      }))
      
      return {
        id: c.id,
        class_name: c.class_name,
        course_title: c.course?.title || 'Unknown Course',
        teacher_name: c.teacher?.full_name || 'Unknown Teacher',
        year_level: c.year_level,
        max_capacity: c.max_capacity,
        enrolled_count: enrolledCount,
        enrolled_students: enrolledStudents
      }
    })

    return NextResponse.json(mapped)

  } catch (err: any) {
    console.error('Supervisor group-classes GET exception:', err)
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

    const { authorized } = await checkAuth(supabaseUserClient, supabaseAdmin)
    if (!authorized) {
      return NextResponse.json({ error: 'Forbidden: Access denied' }, { status: 403 })
    }

    const { student_id, from_class_id, to_class_id } = await request.json()

    if (!student_id || !from_class_id || !to_class_id) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // 1. Check destination class capacity
    const { data: toClass, error: toClassError } = await supabaseAdmin
      .from('group_classes')
      .select('max_capacity')
      .eq('id', to_class_id)
      .single()

    if (toClassError || !toClass) {
      return NextResponse.json({ error: 'Destination class not found' }, { status: 404 })
    }

    const { data: toClassEnrollments, error: countError } = await supabaseAdmin
      .from('group_class_enrollments')
      .select('id')
      .eq('group_class_id', to_class_id)

    if (countError) throw countError

    const currentEnrollmentCount = (toClassEnrollments || []).length
    if (currentEnrollmentCount >= toClass.max_capacity) {
      return NextResponse.json({ error: 'Destination class is at maximum capacity' }, { status: 400 })
    }

    // 2. Perform the transfer
    const { error: transferError } = await supabaseAdmin
      .from('group_class_enrollments')
      .update({ group_class_id: to_class_id })
      .eq('group_class_id', from_class_id)
      .eq('student_id', student_id)

    if (transferError) throw transferError

    // 3. Update the cached enrolled_count columns on both classes
    const { data: allEnrollments } = await supabaseAdmin
      .from('group_class_enrollments')
      .select('group_class_id')

    const activeEnrollments = allEnrollments || []
    
    const countFor = (classId: string) => activeEnrollments.filter((e: any) => e.group_class_id === classId).length

    await supabaseAdmin
      .from('group_classes')
      .update({ enrolled_count: countFor(from_class_id) })
      .eq('id', from_class_id)

    await supabaseAdmin
      .from('group_classes')
      .update({ enrolled_count: countFor(to_class_id) })
      .eq('id', to_class_id)

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('Supervisor group-classes PATCH exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
