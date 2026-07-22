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

    // 1. Fetch all teachers from profiles table
    const { data: teachersData, error: teachersError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, role, teacher_type, status')
      .eq('role', 'teacher')

    if (teachersError) throw teachersError
    const teachers = teachersData || []

    // Time definitions in PST / PKT (UTC+5)
    const nowUtc = new Date()
    const nowPst = new Date(nowUtc.getTime() + (5 * 60 * 60 * 1000))
    const todayDayOfWeek = nowPst.getUTCDay() // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const todayDateStr = nowPst.toISOString().split('T')[0] // 'YYYY-MM-DD'
    const yyyymmdd = todayDateStr.replace(/-/g, '')
    
    const currentHours = nowPst.getUTCHours()
    const currentMins = nowPst.getUTCMinutes()
    const currentTotalMins = currentHours * 60 + currentMins

    // 2. Fetch all active teacher-student assignments
    const teacherIds = teachers.map(t => t.id)
    let assignments: any[] = []
    if (teacherIds.length > 0) {
      const { data: assignData, error: assignError } = await supabaseAdmin
        .from('teacher_student_assignments')
        .select(`
          id,
          teacher_id,
          student_id,
          is_active,
          student:profiles!student_id (
            id,
            full_name,
            status
          )
        `)
        .in('teacher_id', teacherIds)
        .eq('is_active', true)

      if (assignError) console.error('Error fetching assignments:', assignError)
      assignments = assignData || []
    }

    // 3. Fetch class schedules for active assignments
    const assignmentIds = assignments.map(a => a.id)
    let schedules: any[] = []
    if (assignmentIds.length > 0) {
      const { data: schedData, error: schedError } = await supabaseAdmin
        .from('class_schedules')
        .select('*')
        .in('assignment_id', assignmentIds)

      if (schedError) console.error('Error fetching schedules:', schedError)
      schedules = schedData || []
    }

    // 4. Fetch attendance logs and lesson logs for today
    const { data: attendanceLogs } = await supabaseAdmin
      .from('attendance_logs')
      .select('teacher_id, student_id, status, marked_at')
      .eq('class_date', todayDateStr)

    const { data: lessonLogs } = await supabaseAdmin
      .from('lesson_logs')
      .select('teacher_id, student_id, lesson_notes, surah_name, start_ayah, end_ayah, created_at')
      .gte('created_at', `${todayDateStr}T00:00:00.000Z`)

    // 5. Fetch approved leave requests for today
    const { data: leaveRequests } = await supabaseAdmin
      .from('leave_requests')
      .select('*')
      .eq('status', 'approved')
      .lte('start_date', todayDateStr)
      .gte('end_date', todayDateStr)

    // Build operational monitor records per teacher
    const processedTeachers = teachers.map(t => {
      const teacherAssignments = assignments.filter(a => a.teacher_id === t.id)
      
      // Check if teacher is on approved leave today
      const teacherLeave = (leaveRequests || []).find(l => l.teacher_id === t.id)

      let teacherScheduleItems: any[] = []

      teacherAssignments.forEach(a => {
        const studentProfile = a.student as any
        const studentName = studentProfile?.full_name || 'Assigned Student'
        const studentId = a.student_id

        // Find schedules for this assignment
        const matchSchedules = schedules.filter(s => s.assignment_id === a.id)

        if (matchSchedules.length > 0) {
          matchSchedules.forEach(s => {
            const isToday = s.day_of_week === todayDayOfWeek
            const startTimeStr = s.start_time ? s.start_time.substring(0, 5) : '14:00'
            const duration = s.duration_minutes || 30

            const [sH, sM] = startTimeStr.split(':').map(Number)
            const startMins = (sH || 0) * 60 + (sM || 0)
            const endMins = startMins + duration
            const endH = Math.floor(endMins / 60)
            const endM = endMins % 60
            const endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`

            // Check completion
            const isAttended = (attendanceLogs || []).some(log => log.teacher_id === t.id && log.student_id === studentId)
            const lessonLog = (lessonLogs || []).find(log => log.teacher_id === t.id && log.student_id === studentId)

            // Status calculation
            let itemStatus: 'completed' | 'leave' | 'live' | 'overdue' | 'upcoming' = 'upcoming'

            if (teacherLeave) {
              itemStatus = 'leave'
            } else if (isAttended || lessonLog) {
              itemStatus = 'completed'
            } else if (isToday) {
              if (currentTotalMins >= startMins && currentTotalMins <= endMins) {
                itemStatus = 'live'
              } else if (currentTotalMins > endMins || currentTotalMins > startMins + 5) {
                itemStatus = 'overdue'
              } else {
                itemStatus = 'upcoming'
              }
            } else {
              itemStatus = 'upcoming'
            }

            teacherScheduleItems.push({
              id: `sched-${s.id}`,
              studentName,
              studentId,
              course: 'Quran Reading & Tajweed',
              scheduledTime: `${startTimeStr} - ${endTimeStr}`,
              rawStartTime: startTimeStr,
              rawStartMins: startMins,
              status: itemStatus,
              isToday,
              summary: lessonLog ? (lessonLog.lesson_notes || `Surah ${lessonLog.surah_name || 'Nazra'}`) : undefined,
              leaveReason: teacherLeave ? teacherLeave.reason : undefined,
              meetingUrl: `https://meet.virtualzawiyah.com/VZ-${t.id}-${studentId}-${yyyymmdd}`
            })
          })
        } else {
          // Default assignment schedule line (15:00 - 15:30 PST)
          const defaultStartMins = 15 * 60 // 900 (15:00)
          const defaultEndMins = 15 * 60 + 30 // 930 (15:30)

          const isAttended = (attendanceLogs || []).some(log => log.teacher_id === t.id && log.student_id === studentId)
          const lessonLog = (lessonLogs || []).find(log => log.teacher_id === t.id && log.student_id === studentId)

          let itemStatus: 'completed' | 'leave' | 'live' | 'overdue' | 'upcoming' = 'upcoming'
          if (teacherLeave) {
            itemStatus = 'leave'
          } else if (isAttended || lessonLog) {
            itemStatus = 'completed'
          } else if (currentTotalMins >= defaultStartMins && currentTotalMins <= defaultEndMins) {
            itemStatus = 'live'
          } else if (currentTotalMins > defaultEndMins) {
            itemStatus = 'overdue'
          } else {
            itemStatus = 'upcoming'
          }

          teacherScheduleItems.push({
            id: `assign-${a.id}`,
            studentName,
            studentId,
            course: 'Quran & Islamic Studies',
            scheduledTime: '15:00 - 15:30 (PST)',
            rawStartTime: '15:00',
            rawStartMins: defaultStartMins,
            status: itemStatus,
            isToday: true,
            summary: lessonLog ? (lessonLog.lesson_notes || `Surah ${lessonLog.surah_name || 'Nazra'}`) : undefined,
            leaveReason: teacherLeave ? teacherLeave.reason : undefined,
            meetingUrl: `https://meet.virtualzawiyah.com/VZ-${t.id}-${studentId}-${yyyymmdd}`
          })
        }
      })

      // Overall status
      let overallStatus: 'in_session' | 'overdue' | 'idle' | 'leave' = 'idle'
      let activeClass = null
      let overdueClass = null

      if (teacherLeave) {
        overallStatus = 'leave'
      } else {
        const liveItem = teacherScheduleItems.find(i => i.status === 'live')
        const overdueItem = teacherScheduleItems.find(i => i.status === 'overdue')

        if (liveItem) {
          overallStatus = 'in_session'
          activeClass = {
            studentName: liveItem.studentName,
            studentId: liveItem.studentId,
            course: liveItem.course,
            startTime: liveItem.scheduledTime,
            meetingUrl: liveItem.meetingUrl
          }
        } else if (overdueItem) {
          overallStatus = 'overdue'
          overdueClass = {
            studentName: overdueItem.studentName,
            studentId: overdueItem.studentId,
            course: overdueItem.course,
            scheduledTime: overdueItem.scheduledTime
          }
        }
      }

      return {
        id: t.id,
        name: t.full_name || 'Teacher',
        email: t.email,
        type: t.teacher_type || '1:1 Individual Teacher',
        status: overallStatus,
        activeClass,
        overdueClass,
        schedules: teacherScheduleItems
      }
    })

    return NextResponse.json({
      success: true,
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      teachers: processedTeachers
    })

  } catch (err: any) {
    console.error('Supervisor live-monitor GET exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
