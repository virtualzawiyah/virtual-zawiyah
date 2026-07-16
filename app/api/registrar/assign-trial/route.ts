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
      teacherId, 
      studentName, 
      parentEmail, 
      timezone, 
      gender 
    } = await req.json()

    if (!enrollmentRequestId || !studentName || !parentEmail) {
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
      // Check if user already exists in Supabase Auth
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
      if (listError) {
        return NextResponse.json({ error: `Failed to check existing auth users: ${listError.message}` }, { status: 400 })
      }
      
      const existingAuthUser = users?.find((u: any) => u.email?.toLowerCase() === parentEmail.toLowerCase())
      
      if (existingAuthUser) {
        studentId = existingAuthUser.id
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
      }

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

    // 4. Create Trial Request
    const { error: trialError } = await supabase
      .from('trial_requests')
      .insert({
        student_id: studentId,
        teacher_id: teacherId,
        student_name: studentName,
        parent_email: parentEmail,
        requested_date: new Date().toISOString().split('T')[0],
        status: 'pending'
      })

    if (trialError) {
      return NextResponse.json({ error: `Trial creation failed: ${trialError.message}` }, { status: 460 })
    }

    // 5. Update enrollment request status to 'processing' (fallback to 'Trial Started' if constraint fails)
    const { error: enrollError } = await supabase
      .from('enrollment_requests')
      .update({
        status: 'processing',
        assigned_teacher_id: teacherId
      })
      .eq('id', enrollmentRequestId)

    if (enrollError) {
      console.warn('Failed to update status to processing. Retrying with "Trial Started":', enrollError.message)
      const { error: retryError } = await supabase
        .from('enrollment_requests')
        .update({
          status: 'Trial Started',
          assigned_teacher_id: teacherId
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


      if (teacherId) {
        await createNotification({
          user_id: teacherId,
          role: 'teacher',
          title: 'New Student Assigned',
          message: `New student assigned: ${studentName} - ${courseName}`
        })
      }
    } catch (notifErr: any) {
      console.error('Failed to send notification for assign-trial (non-fatal):', notifErr.message)
    }

    return NextResponse.json({
      status: 'success',
      studentId: studentId
    })

  } catch (err: any) {
    console.error('Error in assign-trial API:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
