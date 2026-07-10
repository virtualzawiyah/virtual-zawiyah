import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // 1. Authenticate user from session cookie
    const supabaseUserClient = createRouteHandlerClient({ cookies })
    const { data: { session }, error: sessionError } = await supabaseUserClient.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 })
    }

    const teacherId = session.user.id

    // 2. Parse query parameters
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('student_id')

    if (!studentId) {
      return NextResponse.json({ error: 'Missing student_id query parameter' }, { status: 400 })
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
      .eq('student_id', studentId)
      .eq('is_active', true)
      .maybeSingle()

    if (assignError || !assignment) {
      return NextResponse.json({ error: 'Forbidden: No active assignment exists for this student' }, { status: 403 })
    }

    // 5. Fetch last 10 rows from lesson_logs joined with lesson_private_notes
    const { data: logs, error: logsError } = await supabaseAdmin
      .from('lesson_logs')
      .select(`
        id,
        created_at,
        class_date,
        log_type,
        sabaq,
        sabaqi,
        manzil,
        topic_covered,
        next_plan,
        performance,
        lesson_private_notes (
          notes
        )
      `)
      .eq('student_id', studentId)
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (logsError) throw logsError

    // 6. Format output array mapping notes correctly
    const formattedLogs = (logs || []).map((log: any) => {
      const rawNotes = log.lesson_private_notes
      const notes = Array.isArray(rawNotes)
        ? (rawNotes[0]?.notes || '')
        : (rawNotes?.notes || '')

      return {
        id: log.id,
        created_at: log.created_at,
        class_date: log.class_date,
        log_type: log.log_type,
        sabaq: log.sabaq || '',
        sabaqi: log.sabaqi || '',
        manzil: log.manzil || '',
        topic_covered: log.topic_covered || '',
        next_plan: log.next_plan || '',
        performance: log.performance || '',
        notes
      }
    })

    return NextResponse.json({ success: true, logs: formattedLogs })

  } catch (err: any) {
    console.error('Lesson history GET handler exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
