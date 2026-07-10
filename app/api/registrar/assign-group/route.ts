import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createNotification } from '@/lib/notifications'

export async function POST(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Supabase credentials are missing.' }, { status: 550 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    const { 
      enrollmentRequestId, 
      groupClassId, 
      studentName, 
      parentEmail, 
      timezone, 
      gender 
    } = await req.json()

    if (!enrollmentRequestId || !groupClassId || !studentName || !parentEmail) {
      return NextResponse.json({ error: 'Missing required parameters.' }, { status: 400 })
    }

    // 1. Check if user already exists in profiles
    const { data: existingProfile, error: profileCheckErr } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', parentEmail)
      .maybeSingle()

    let studentId: string

    if (existingProfile) {
      studentId = existingProfile.id
    } else {
      // 2. Create user in Supabase Auth via Admin Client
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: parentEmail,
        email_confirm: true,
        user_metadata: { role: 'student' }
      })

      if (authError) {
        return NextResponse.json({ error: `Auth creation failed: ${authError.message}` }, { status: 400 })
      }

      studentId = authData.user.id

      // 3. Create profile entry
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: studentId,
          email: parentEmail,
          full_name: studentName,
          role: 'student',
          status: 'Active',
          timezone: timezone || 'UTC',
          gender: gender ? gender.toLowerCase() : null
        })

      if (profileError) {
        return NextResponse.json({ error: `Profile creation failed: ${profileError.message}` }, { status: 450 })
      }
    }

    // 4. Create Group Class Enrollment
    const { error: enrollClassErr } = await supabase
      .from('group_class_enrollments')
      .insert({
        group_class_id: groupClassId,
        student_id: studentId
      })

    if (enrollClassErr) {
      // If student is already enrolled in this class, ignore unique key violation and proceed
      if (!enrollClassErr.message.includes('unique_group_class_id_student_id') && !enrollClassErr.message.includes('duplicate key value')) {
        return NextResponse.json({ error: `Group class enrollment failed: ${enrollClassErr.message}` }, { status: 460 })
      }
    }

    // 5. Increment enrolled_count of group class
    // First, fetch the current enrolled_count
    const { data: groupClass, error: classFetchErr } = await supabase
      .from('group_classes')
      .select('enrolled_count, max_capacity')
      .eq('id', groupClassId)
      .single()

    if (classFetchErr) {
      return NextResponse.json({ error: `Failed to fetch class info: ${classFetchErr.message}` }, { status: 465 })
    }

    const newEnrolledCount = Math.min(groupClass.enrolled_count + 1, groupClass.max_capacity)

    const { error: classUpdateErr } = await supabase
      .from('group_classes')
      .update({ enrolled_count: newEnrolledCount })
      .eq('id', groupClassId)

    if (classUpdateErr) {
      return NextResponse.json({ error: `Failed to update class capacity: ${classUpdateErr.message}` }, { status: 468 })
    }

    // 6. Update enrollment request status to 'completed' (fallback to 'enrolled' if constraint fails)
    const { error: enrollError } = await supabase
      .from('enrollment_requests')
      .update({
        status: 'completed'
      })
      .eq('id', enrollmentRequestId)

    if (enrollError) {
      console.warn('Failed to update status to completed. Retrying with "enrolled":', enrollError.message)
      const { error: retryError } = await supabase
        .from('enrollment_requests')
        .update({
          status: 'enrolled'
        })
        .eq('id', enrollmentRequestId)

      if (retryError) {
        return NextResponse.json({ error: `Enrollment status update failed: ${retryError.message}` }, { status: 470 })
      }
    }

    // Create teacher notification (Trigger 2)
    try {
      const { data: enrollmentReq } = await supabase
        .from('enrollment_requests')
        .select('course_interest')
        .eq('id', enrollmentRequestId)
        .maybeSingle()
      
      const courseName = enrollmentReq?.course_interest || 'Quran Class'

      const { data: grpClass } = await supabase
        .from('group_classes')
        .select('teacher_id')
        .eq('id', groupClassId)
        .single()


      if (grpClass?.teacher_id) {
        await createNotification({
          user_id: grpClass.teacher_id,
          role: 'teacher',
          title: 'New Student Assigned',
          message: `New student assigned: ${studentName} - ${courseName}`
        })
      }
    } catch (notifErr: any) {
      console.error('Failed to send notification for assign-group (non-fatal):', notifErr.message)
    }

    return NextResponse.json({
      status: 'success',
      studentId: studentId
    })

  } catch (err: any) {
    console.error('Error in assign-group API:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
