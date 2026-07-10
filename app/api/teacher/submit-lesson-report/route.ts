import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createNotification } from '@/lib/notifications'

export async function POST(request: Request) {
  try {
    // 1. Authenticate user from session cookie
    const supabaseUserClient = createRouteHandlerClient({ cookies })
    const { data: { session }, error: sessionError } = await supabaseUserClient.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 })
    }

    const teacherId = session.user.id

    // 2. Parse request body
    const body = await request.json()
    const { 
      student_id, 
      log_type, 
      sabaq = '', 
      sabaqi = '', 
      manzil = '', 
      topic_covered = '', 
      next_plan = '', 
      notes = '' 
    } = body

    if (!student_id || !log_type) {
      return NextResponse.json({ error: 'Missing student_id or log_type parameter' }, { status: 400 })
    }

    // 3. Initialize admin client (bypasses RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 4. Security Check: verify teacher has active assignment with this student
    const { data: assignment, error: assignError } = await supabaseAdmin
      .from('teacher_student_assignments')
      .select('id')
      .eq('teacher_id', teacherId)
      .eq('student_id', student_id)
      .eq('is_active', true)
      .maybeSingle()

    if (assignError || !assignment) {
      return NextResponse.json({ error: 'Forbidden: No active assignment exists for this student' }, { status: 403 })
    }

    // 5. Insert into lesson_logs
    const nowUtc = new Date()
    const nowPst = new Date(nowUtc.getTime() + (5 * 60 * 60 * 1000))
    const todayDateStr = nowPst.toISOString().split('T')[0]

    const { data: logRecord, error: logError } = await supabaseAdmin
      .from('lesson_logs')
      .insert({
        student_id,
        teacher_id: teacherId,
        class_date: todayDateStr,
        log_type,
        sabaq: log_type === 'hifz' ? sabaq : '',
        sabaqi: log_type === 'hifz' ? sabaqi : '',
        manzil: log_type === 'hifz' ? manzil : '',
        topic_covered: log_type !== 'hifz' ? topic_covered : 'Quran Hifz Lesson',
        next_plan: log_type !== 'hifz' ? next_plan : 'Next Hifz Lesson Plan',
        performance: 'good' // default check constraint value
      })
      .select('id')
      .single()

    if (logError) throw logError

    // 6. Insert into lesson_private_notes if notes are provided
    if (notes && notes.trim() !== '') {
      const { error: notesError } = await supabaseAdmin
        .from('lesson_private_notes')
        .insert({
          lesson_id: logRecord.id,
          notes: notes.trim()
        })

      if (notesError) throw notesError
    }

    // 7. Check if an attendance log already exists for today. If not, insert a new record.
    const { data: existingAttendance } = await supabaseAdmin
      .from('attendance_logs')
      .select('id')
      .eq('student_id', student_id)
      .eq('class_date', todayDateStr)
      .maybeSingle()

    if (!existingAttendance) {
      const { error: attError } = await supabaseAdmin
        .from('attendance_logs')
        .insert({
          student_id,
          teacher_id: teacherId,
          class_date: todayDateStr,
          status: 'present',
          locked: false
        })

      if (attError) throw attError
    }

    // Create student notification (Trigger 12)
    try {
      const { data: teacherProfile } = await supabaseAdmin
        .from('profiles')
        .select('full_name')
        .eq('id', teacherId)
        .single()

      const teacherName = teacherProfile?.full_name || 'Teacher'


      await createNotification({
        user_id: student_id,
        role: 'student',
        title: 'New Lesson Report Submitted',
        message: `New lesson report submitted by ${teacherName}`
      })
    } catch (notifErr: any) {
      console.error('Failed to send notification for lesson report submission (non-fatal):', notifErr.message)
    }

    return NextResponse.json({ success: true, lesson_id: logRecord.id })

  } catch (err: any) {
    console.error('Submit lesson report exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
