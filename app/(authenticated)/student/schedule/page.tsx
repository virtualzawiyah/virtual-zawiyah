'use client'

import { useEffect, useState } from 'react'
import { 
  Calendar, 
  Clock, 
  Video, 
  User, 
  Loader2, 
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
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null)
  const [schedules, setSchedules] = useState<LocalSchedule[]>([])
  const [studentTimezone, setStudentTimezone] = useState<string>('UTC')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Keep current time updated for active class check
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 15000) // update every 15s
    return () => clearInterval(timer)
  }, [])

  // Helper to convert UTC day_of_week (0-6) and start_time (HH:MM:SS) to student's timezone
  const convertUtcToTimezone = (utcDay: number, utcTimeStr: string, timezone: string) => {
    try {
      const [hours, minutes] = utcTimeStr.split(':').map(Number)
      const now = new Date()
      const currentDay = now.getUTCDay()
      
      // Calculate difference in days to match the week day index
      let daysDiff = utcDay - currentDay
      const utcDate = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + daysDiff,
        hours,
        minutes,
        0
      ))

      // Day index in target timezone
      const dayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: timezone })
      const localDayName = dayFormatter.format(utcDate)
      const localDay = DAYS.indexOf(localDayName)

      // Time in target timezone (24-hour format)
      const timeFormatter = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: timezone
      })
      const localTime = timeFormatter.format(utcDate)

      return { localDay, localTime }
    } catch (e) {
      console.error('Timezone conversion error:', e)
      return { localDay: utcDay, localTime: utcTimeStr.substring(0, 5) }
    }
  }

  // Get current wall-clock date in target timezone
  const getCurrentTimeInTimezone = (timezone: string): Date => {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric',
        hour12: false
      })
      const parts = formatter.formatToParts(new Date())
      const getPart = (type: string) => Number(parts.find(p => p.type === type)?.value)
      
      return new Date(
        getPart('year'),
        getPart('month') - 1,
        getPart('day'),
        getPart('hour'),
        getPart('minute'),
        getPart('second')
      )
    } catch (e) {
      console.error('Error getting timezone time:', e)
      return new Date()
    }
  }

  // Format YYYYMMDD string in student's timezone
  const getYYYYMMDD = (timezone: string) => {
    const tzTime = getCurrentTimeInTimezone(timezone)
    const yyyy = tzTime.getFullYear()
    const mm = String(tzTime.getMonth() + 1).padStart(2, '0')
    const dd = String(tzTime.getDate()).padStart(2, '0')
    return `${yyyy}${mm}${dd}`
  }

  // Returns true if class is currently running (based on local time)
  const isClassActive = (sched: LocalSchedule): boolean => {
    const tzTime = getCurrentTimeInTimezone(studentTimezone)
    const currentDayIdx = tzTime.getDay()
    if (sched.local_day !== currentDayIdx) return false

    const [startH, startM] = sched.local_time.split(':').map(Number)
    const [endH, endM] = sched.local_end_time.split(':').map(Number)

    const curH = tzTime.getHours()
    const curM = tzTime.getMinutes()

    const startTotal = startH * 60 + startM
    const endTotal = endH * 60 + endM
    const curTotal = curH * 60 + curM

    return curTotal >= startTotal && curTotal <= endTotal
  }

  // Returns true if class is starting in the next 15 minutes
  const isClassUpcoming = (sched: LocalSchedule): boolean => {
    const tzTime = getCurrentTimeInTimezone(studentTimezone)
    const currentDayIdx = tzTime.getDay()
    if (sched.local_day !== currentDayIdx) return false

    const [startH, startM] = sched.local_time.split(':').map(Number)
    const curH = tzTime.getHours()
    const curM = tzTime.getMinutes()

    const startTotal = startH * 60 + startM
    const curTotal = curH * 60 + curM

    return startTotal > curTotal && (startTotal - curTotal) <= 15
  }

  const fetchSchedule = async (studentId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/student/schedule?student_id=${studentId}`)
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to fetch schedule')

      const tz = result.studentTimezone || 'UTC'
      setStudentTimezone(tz)

      // Convert each schedule from UTC to target timezone
      const localSchedules = (result.schedules || []).map((s: any) => {
        const { localDay, localTime } = convertUtcToTimezone(s.day_of_week, s.start_time, tz)
        
        // Calculate local end time
        const [h, m] = localTime.split(':').map(Number)
        const totalMinutes = h * 60 + m + s.duration_minutes
        const endH = Math.floor(totalMinutes / 60) % 24
        const endM = totalMinutes % 60
        const localEndTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`

        return {
          id: s.id,
          assignment_id: s.assignment_id,
          teacher_name: s.teacher_name,
          teacher_id: s.teacher_id,
          local_day: localDay,
          local_time: localTime,
          local_end_time: localEndTime,
          duration_minutes: s.duration_minutes
        }
      })

      // Sort schedules by local day and start time
      localSchedules.sort((a: any, b: any) => {
        if (a.local_day !== b.local_day) return a.local_day - b.local_day
        return a.local_time.localeCompare(b.local_time)
      })

      setSchedules(localSchedules)
    } catch (err: any) {
      console.error('Error fetching schedule:', err)
      setError(err.message || 'Failed to load weekly schedule.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const initializeStudent = async () => {
      let savedId = null
      if (typeof window !== 'undefined') {
        savedId = localStorage.getItem('activeStudentId')
      }

      if (!savedId) {
        // Try fetching siblings to auto-select if single
        try {
          const res = await fetch('/api/student/siblings')
          const result = await res.json()
          if (res.ok && result.siblings && result.siblings.length === 1) {
            savedId = result.siblings[0].id
            if (typeof window !== 'undefined') {
              localStorage.setItem('activeStudentId', savedId)
              localStorage.setItem('selectedKey', savedId)
            }
          }
        } catch (e) {
          console.error(e)
        }
      }

      if (savedId) {
        setActiveStudentId(savedId)
      } else {
        setLoading(false)
      }
    }
    initializeStudent()
  }, [])

  useEffect(() => {
    if (activeStudentId) {
      fetchSchedule(activeStudentId)
    }
  }, [activeStudentId])

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B6B3A]" />
      </div>
    )
  }

  if (!activeStudentId) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center shadow-sm max-w-xl mx-auto space-y-4 my-12">
        <HelpCircle className="h-12 w-12 text-amber-500 mx-auto animate-bounce" />
        <h2 className="text-xl font-bold font-serif text-zinc-900">No Student Selected</h2>
        <p className="text-sm text-zinc-700 font-sans">
          Please select a student profile first in order to view their personalized schedule.
        </p>
        <a 
          href="/student/dashboard"
          className="inline-block rounded-xl bg-gradient-to-r from-emerald-600 to-[#1B6B3A] text-white px-6 py-2.5 text-sm font-bold shadow-md hover:scale-[1.01] transition-all"
        >
          Go to Dashboard
        </a>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm max-w-xl mx-auto space-y-4 my-12 font-sans">
        <h2 className="text-lg font-bold text-red-800">Error Loading Schedule</h2>
        <p className="text-sm text-red-700">{error}</p>
        <button 
          onClick={() => fetchSchedule(activeStudentId)}
          className="rounded-xl bg-red-600 text-white px-4 py-2 text-xs font-bold hover:bg-red-700 transition-all"
        >
          Retry Load
        </button>
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
        <h1 className="text-3xl font-bold font-serif tracking-tight text-zinc-900">My Learning Schedule</h1>
        <p className="mt-1 text-sm text-zinc-700 font-sans">
          Your active weekly classes automatically converted to your local timezone ({studentTimezone}). Join your virtual classroom directly from here.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Schedule Visual Calendar */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-bold font-serif text-zinc-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#1B6B3A]" /> Weekly Class Schedule
            </h2>

            {schedules.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 space-y-3 font-sans">
                <HelpCircle className="h-10 w-10 text-zinc-400 mx-auto" />
                <p className="text-sm">You do not have any active class assignments scheduled yet.</p>
                <p className="text-xs text-zinc-700">Please contact administration if you believe this is an error.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {schedulesByDay.map((day) => {
                  if (day.slots.length === 0) return null
                  return (
                    <div key={day.dayIdx} className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#1B6B3A] border-b border-[#1B6B3A]/20 pb-1.5 font-sans">{day.dayName}</h3>
                      <div className="grid gap-3">
                        {day.slots.map((s) => {
                          const active = isClassActive(s)
                          const upcoming = isClassUpcoming(s)

                          return (
                            <div 
                              key={s.id} 
                              className={`rounded-xl border p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all duration-150 font-sans ${
                                active ? 'bg-emerald-50 border-[#1B6B3A] shadow-sm animate-pulse-light' :
                                upcoming ? 'bg-amber-50/50 border-amber-300' :
                                'bg-zinc-50/80 border-zinc-200 hover:border-zinc-300'
                              }`}
                            >
                              <div className="space-y-1.5">
                                <p className="font-bold text-zinc-800 flex items-center gap-1.5">
                                  <User className="h-4 w-4 text-zinc-500" /> Teacher: {s.teacher_name}
                                </p>
                                <div className="flex flex-wrap gap-2 text-xs font-mono text-zinc-700">
                                  <span className="flex items-center gap-1 bg-white border border-zinc-200 px-2 py-0.5 rounded">
                                    <Clock className="h-3.5 w-3.5 text-zinc-400" /> {s.local_time} - {s.local_end_time}
                                  </span>
                                  <span className="bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded text-zinc-700">
                                    {s.duration_minutes} Minutes
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {active && (
                                  <span className="flex h-2.5 w-2.5 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                                  </span>
                                )}
                                {upcoming && (
                                  <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold uppercase">
                                    Starting Soon
                                  </span>
                                )}

                                {active ? (
                                  <a
                                    href={`https://meet.virtualzawiyah.com/VZ-${s.teacher_id}-${activeStudentId}-${getYYYYMMDD(studentTimezone)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 rounded-xl py-2 px-4 text-xs font-bold tracking-wide transition-all bg-gradient-to-r from-emerald-600 to-[#1B6B3A] hover:from-emerald-500 hover:to-[#1B6B3A] text-white shadow-sm active:scale-[0.98]"
                                  >
                                    <Video className="h-3.5 w-3.5" />
                                    Join Class Now
                                  </a>
                                ) : (
                                  <button
                                    disabled
                                    className="flex items-center justify-center gap-2 rounded-xl py-2 px-4 text-xs font-bold tracking-wide transition-all bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed"
                                  >
                                    <Video className="h-3.5 w-3.5 text-zinc-350" />
                                    Classroom Link
                                  </button>
                                )}
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
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold font-serif text-zinc-900 flex items-center gap-2">
              <Video className="h-5 w-5 text-[#1B6B3A]" /> Virtual Classroom Guidelines
            </h3>
            <div className="space-y-3 text-xs text-zinc-700 leading-relaxed font-sans">
              <p>
                Our system uses **Jitsi Meet** for secure, private video learning. No account creation or software download is required.
              </p>
              <ul className="list-disc pl-4 space-y-2">
                <li>Classes are visible in your calendar. Please join within 5 minutes of your scheduled time.</li>
                <li>Make sure your camera and microphone are permitted by your web browser.</li>
                <li>Rooms are protected. Only you and your teacher can access your Jitsi classroom room.</li>
              </ul>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-800 flex items-start gap-2">
                <Play className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                <div>
                  <span className="font-bold block text-emerald-900 font-sans">How to Join?</span>
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
