import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const {
      student_name,
      parent_name,
      parent_email,
      parent_whatsapp,
      student_gender,
      student_age,
      country,
      state,
      course_interest,
      course_type,
      preferred_teacher_gender,
      student_timezone,
      preferred_schedule,
      message
    } = payload

    // 1. Validation
    if (!student_name || typeof student_name !== 'string' || student_name.trim() === '') {
      return NextResponse.json({ success: false, error: 'Student name is required' }, { status: 400 })
    }

    if (!parent_name || typeof parent_name !== 'string' || parent_name.trim() === '') {
      return NextResponse.json({ success: false, error: 'Parent name is required' }, { status: 400 })
    }

    if (!parent_whatsapp || typeof parent_whatsapp !== 'string' || !/^\+[0-9]+$/.test(parent_whatsapp)) {
      return NextResponse.json({ success: false, error: 'Parent WhatsApp number is required and must start with + followed by only digits' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!parent_email || typeof parent_email !== 'string' || !emailRegex.test(parent_email)) {
      return NextResponse.json({ success: false, error: 'A valid parent email address is required' }, { status: 400 })
    }

    const parsedAge = parseInt(student_age, 10)
    if (isNaN(parsedAge) || parsedAge <= 0) {
      return NextResponse.json({ success: false, error: 'Student age must be a positive integer' }, { status: 400 })
    }

    if (!course_interest || typeof course_interest !== 'string' || course_interest.trim() === '') {
      return NextResponse.json({ success: false, error: 'Course interest is required' }, { status: 400 })
    }

    if (student_gender !== 'male' && student_gender !== 'female') {
      return NextResponse.json({ success: false, error: 'Student gender must be either male or female' }, { status: 400 })
    }

    if (course_type !== '1:1' && course_type !== 'group') {
      return NextResponse.json({ success: false, error: 'Course type must be either 1:1 or group' }, { status: 400 })
    }

    // 2. Initialize Supabase Admin client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Store unmapped fields (country, state, preferred_teacher_gender) inside the message field
    const additionalMessageParts = [
      message ? `Special notes: ${message}` : '',
      country ? `Country: ${country}` : '',
      state ? `State: ${state}` : '',
      preferred_teacher_gender ? `Preferred Teacher Gender: ${preferred_teacher_gender}` : ''
    ].filter(Boolean).join('\n')

    // 3. Insert into enrollment_requests table
    const { data: requestData, error: insertError } = await supabaseAdmin
      .from('enrollment_requests')
      .insert({
        student_name,
        student_age: parsedAge,
        parent_name,
        parent_email,
        parent_whatsapp,
        course_interest,
        course_type,
        student_gender,
        student_timezone: student_timezone || 'UTC',
        preferred_schedule: preferred_schedule || {},
        message: additionalMessageParts || null,
        status: 'pending'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Enrollment insert error:', insertError)
      return NextResponse.json({ success: false, error: insertError.message }, { status: 500 })
    }

    // 4. Find active supervisor from profiles
    const { data: supervisor } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('role', 'supervisor')
      .eq('status', 'Active')
      .limit(1)
      .maybeSingle()

    let targetUserId = supervisor?.id

    if (!targetUserId) {
      const { data: anySupervisor } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('role', 'supervisor')
        .limit(1)
        .maybeSingle()
      targetUserId = anySupervisor?.id
    }

    if (!targetUserId) {
      const { data: fallbackUser } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .in('role', ['founder', 'registrar', 'academic_director'])
        .limit(1)
        .maybeSingle()
      targetUserId = fallbackUser?.id
    }

    // 5. Insert notification
    if (targetUserId) {
      const { error: notifError } = await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: targetUserId,
          role: 'supervisor',
          title: 'New Enrollment Request',
          message: `A new enrollment request has been submitted for ${student_name} - ${course_interest}`
        })
      if (notifError) {
        console.error('Notification insertion error (non-fatal):', notifError)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Your application has been received. We will contact you on WhatsApp shortly.'
    })

  } catch (err: any) {
    console.error('Enrollment POST exception:', err)
    return NextResponse.json({ success: false, error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
