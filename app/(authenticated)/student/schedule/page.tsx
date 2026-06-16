'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { 
  Calendar, 
  Clock, 
  Video, 
  User, 
  Loader2, 
  AlertCircle,
  HelpCircle,
  Play
} from 'lucide-react'

interface LocalSchedule {
  id: string
  assignment_id: string
  teacher_name: string
  teacher_id: string
  local_day: number
  local_time: string
  local_end_time: string
  duration_minutes: number
}

interface DBClassSchedule {
  id: string
  assignment_id: string
  day_of_week: number
  start_time: string
  duration_minutes: number
}

interface Assignment {
  id: string
  teacher: { id: string; full_name: string }
}

const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
]

export default function StudentSchedulePage() {
  const [schedules, setSchedules] = useState<LocalSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())

  // Keep current time updated for active class check
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 30000) // update every 30s
    return () => clearInterval(timer)
  }, [])

  // Converts recurring UTC weekly schedule to client's local timezone
  const convertUTCSlotToLocal = (dayOfWeek: number, startTime: string, durationMin: number): {
    localDay: number
    localTime: string
    localEndTime: string
  } => {
    const [h, m] = startTime.split(':').map(Number)
    const utcDate = new Date(Date.UTC(2026, 0, 4 + dayOfWeek, h, m))
    
    const localDay = utcDate.getDay()
    const localHours = String(utcDate.getHours()).padStart(2, '0')
    const localMinutes = String(utcDate.getMinutes()).padStart(2, '0')
    const localTime = `${localHours}:${localMinutes}`

    const localEndDate = new Date(utcDate.getTime() + durationMin * 60000)
    const endHours = String(localEndDate.getHours()).padStart(2, '0')
    const endMinutes = String(localEndDate.getMinutes()).padStart(2, '0')
    const localEndTime = `${endHours}:${endMinutes}`

    return { localDay, localTime, localEndTime }
  }

  // Returns true if class is currently running (based on local time)
  const isClassActive = (sched: LocalSchedule): boolean => {
    const currentDayIdx = currentTime.getDay()
    if (sched.local_day !== currentDayIdx) return false

    const [startH, startM] = sched.local_time.split(':').map(Number)
    const [endH, endM] = sched.local_end_time.split(':').map(Number)

    const curH = currentTime.getHours()
    const curM = currentTime.getMinutes()

    const startTotal = startH * 60 + startM
    const endTotal = endH * 60 + endM
    const curTotal = curH * 60 + curM

    return curTotal >= startTotal && curTotal <= endTotal
  }

  // Returns true if class is starting in the next 15 minutes
  const isClassUpcoming = (sched: LocalSchedule): boolean => {
    const currentDayIdx = currentTime.getDay()
    if (sched.local_day !== currentDayIdx) return false

    const [startH, startM] = sched.local_time.split(':').map(Number)
    const curH = currentTime.getHours()
    const curM = currentTime.getMinutes()

    const startTotal = startH * 60 + startM
    const curTotal = curH * 60 + curM

    return startTotal > curTotal && (startTotal - curTotal) <= 15
  }

  useEffect(() => {
    const fetchStudentSchedule = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) return

        // 1. Fetch student assignments
        const { data: assigns, error: assignErr } = await supabase
          .from('teacher_student_assignments')
          .select(`
            id,
            teacher:profiles!teacher_id(id, full_name)
          `)
          .eq('student_id', session.user.id)
          .eq('is_active', true)

        if (assignErr) throw assignErr

        const assignmentMap = new Map<string, Assignment>()
        const assignmentIds: string[] = []

        interface QueryAssignment {
          id: string
          teacher: { id: string; full_name: string } | { id: string; full_name: string }[] | null
        }

        if (assigns) {
          (assigns as unknown as QueryAssignment[]).forEach((a) => {
            const teacherProfile = Array.isArray(a.teacher) ? a.teacher[0] : a.teacher
            if (teacherProfile) {
              assignmentMap.set(a.id, {
                id: a.id,
                teacher: teacherProfile
              })
              assignmentIds.push(a.id)
            }
          })
        }

        if (assignmentIds.length === 0) {
          setSchedules([])
          setLoading(false)
          return
        }

        // 2. Fetch class schedules for student's assignments
        const { data: schedulesData, error: schedErr } = await supabase
          .from('class_schedules')
          .select('*')
          .in('assignment_id', assignmentIds)

        if (schedErr) throw schedErr

        const formatted: LocalSchedule[] = []
        if (schedulesData) {
          (schedulesData as DBClassSchedule[]).forEach((s) => {
            const assign = assignmentMap.get(s.assignment_id)
            if (assign) {
              const { localDay, localTime, localEndTime } = convertUTCSlotToLocal(
                s.day_of_week,
                s.start_time,
                s.duration_minutes
              )

              formatted.push({
                id: s.id,
                assignment_id: s.assignment_id,
                teacher_name: assign.teacher.full_name,
                teacher_id: assign.teacher.id,
                local_day: localDay,
                local_time: localTime,
                local_end_time: localEndTime,
                duration_minutes: s.duration_minutes
              })
            }
          })
        }

        // Sort schedules by day of week then start time
        formatted.sort((a, b) => {
          if (a.local_day !== b.local_day) return a.local_day - b.local_day
          return a.local_time.localeCompare(b.local_time)
        })

        setSchedules(formatted)
      } catch (err) {
        console.error('Failed to load student schedule:', err)
        setErrorMsg('Failed to load your schedules list.')
      } finally {
        setLoading(false)
      }
    }

    fetchStudentSchedule()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    )
  }

  // Group schedules by day
  const schedulesByDay = Array.from({ length: 7 }, (_, i) => {
    return {
      dayIdx: i,
      dayName: DAYS[i],
      slots: schedules.filter(s => s.local_day === i)
    }
  })

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-sans">My Learning Schedule</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Your active weekly classes automatically converted to your local timezone. Join your virtual classroom directly from here.
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {errorMsg}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Schedule Visual Calendar */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-400" /> Weekly Class Schedule
            </h2>

            {schedules.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 space-y-3">
                <HelpCircle className="h-10 w-10 text-zinc-600 mx-auto" />
                <p className="text-sm">You do not have any active class assignments scheduled yet.</p>
                <p className="text-xs text-zinc-600">Please contact academy administration if you believe this is an error.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {schedulesByDay.map((day) => {
                  if (day.slots.length === 0) return null
                  return (
                    <div key={day.dayIdx} className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 border-b border-emerald-500/20 pb-1.5">{day.dayName}</h3>
                      <div className="grid gap-3">
                        {day.slots.map((s) => {
                          const active = isClassActive(s)
                          const upcoming = isClassUpcoming(s)

                          return (
                            <div 
                              key={s.id} 
                              className={`rounded-xl border p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all duration-150 ${
                                active ? 'bg-emerald-500/10 border-emerald-500 shadow-md shadow-emerald-500/5' :
                                upcoming ? 'bg-yellow-500/5 border-yellow-500/50' :
                                'bg-black/20 border-white/5 hover:border-white/10'
                              }`}
                            >
                              <div className="space-y-1.5">
                                <p className="font-bold text-white flex items-center gap-1.5">
                                  <User className="h-4 w-4 text-zinc-400" /> Teacher: {s.teacher_name}
                                </p>
                                <div className="flex flex-wrap gap-2 text-xs font-mono text-zinc-400">
                                  <span className="flex items-center gap-1 bg-zinc-800 px-2 py-0.5 rounded">
                                    <Clock className="h-3.5 w-3.5 text-zinc-500" /> {s.local_time} - {s.local_end_time}
                                  </span>
                                  <span className="bg-zinc-850 px-2 py-0.5 rounded text-zinc-500">
                                    {s.duration_minutes} Minutes
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {active && (
                                  <span className="flex h-2.5 w-2.5 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                  </span>
                                )}
                                {upcoming && (
                                  <span className="text-[10px] bg-yellow-500/15 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded font-bold uppercase">
                                    Starting Soon
                                  </span>
                                )}

                                <a
                                  href={`https://meet.jit.si/virtual-zawiyah-teacher-${s.teacher_id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center justify-center gap-2 rounded-xl py-2 px-4 text-xs font-bold tracking-wide transition-all ${
                                    active 
                                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow shadow-emerald-500/10' 
                                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-white/5'
                                  }`}
                                >
                                  <Video className="h-3.5 w-3.5" />
                                  {active ? 'Join Class Now' : 'Classroom Link'}
                                </a>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Info panel */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Video className="h-5 w-5 text-emerald-400" /> Virtual Classroom Guidelines
            </h3>
            <div className="space-y-3 text-xs text-zinc-400 leading-relaxed">
              <p>
                Our system uses **Jitsi Meet** for secure, private video learning. No account creation or software download is required.
              </p>
              <ul className="list-disc pl-4 space-y-2">
                <li>Classes are visible in your calendar. Please join within 5 minutes of your scheduled time.</li>
                <li>Make sure your camera and microphone are permitted by your web browser.</li>
                <li>Rooms are protected. Only you and your teacher can access your Jitsi classroom room (virtual-zawiyah-teacher-ID).</li>
              </ul>
              <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-3 text-emerald-300 flex items-start gap-2">
                <Play className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-emerald-200">How to Join?</span>
                  Simply click the green &quot;Join Class Now&quot; button when the class starts.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
