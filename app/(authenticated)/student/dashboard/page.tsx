'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { 
  User, 
  Clock, 
  Video, 
  Calendar, 
  CreditCard, 
  CheckCircle2, 
  Loader2, 
  AlertCircle 
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

interface StudentProfile {
  full_name: string
  email: string
  student_status: string
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

export default function StudentDashboard() {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [todayClasses, setTodayClasses] = useState<LocalSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())

  // Refresh current time every 30s to keep "active" checks precise
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 30000)
    return () => clearInterval(timer)
  }, [])

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
    const loadDashboardData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) return

        // 1. Fetch Student Profile
        const { data: prof, error: profErr } = await supabase
          .from('profiles')
          .select('full_name, email, student_status')
          .eq('id', session.user.id)
          .single()

        if (profErr) throw profErr
        setProfile(prof)

        // 2. Fetch student assignments
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
          setLoading(false)
          return
        }

        // 3. Fetch schedules
        const { data: schedulesData, error: schedErr } = await supabase
          .from('class_schedules')
          .select('*')
          .in('assignment_id', assignmentIds)

        if (schedErr) throw schedErr

        const todayDayIdx = currentTime.getDay()
        const todayFormatted: LocalSchedule[] = []

        if (schedulesData) {
          (schedulesData as DBClassSchedule[]).forEach((s) => {
            const assign = assignmentMap.get(s.assignment_id)
            if (assign) {
              const { localDay, localTime, localEndTime } = convertUTCSlotToLocal(
                s.day_of_week,
                s.start_time,
                s.duration_minutes
              )

              // Only include if class occurs today (local day)
              if (localDay === todayDayIdx) {
                todayFormatted.push({
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
            }
          })
        }

        // Sort by start time
        todayFormatted.sort((a, b) => a.local_time.localeCompare(b.local_time))
        setTodayClasses(todayFormatted)
      } catch (err) {
        console.error('Failed to load student dashboard:', err)
        setErrorMsg('Failed to load dashboard metrics.')
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 backdrop-blur-md relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-emerald-500/10 blur-[80px]" />
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Assalamu Alaikum, {profile?.full_name || 'Student'}!
            </h1>
            <p className="mt-2 text-zinc-400 max-w-xl">
              Welcome back to Virtual Zawiyah academy portal. Track your progress, view schedules, and launch your video classes.
            </p>
          </div>
          
          {/* Status Badge */}
          <div className="h-fit w-fit rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 text-center shadow shadow-emerald-500/5">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Account Status</span>
            <span className="text-sm font-black text-emerald-400 uppercase tracking-wide mt-1 block">
              {profile?.student_status || 'active'}
            </span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {errorMsg}
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-3">
        {/* Today's Classes List */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-400" /> Today&apos;s Class Schedule ({DAYS[currentTime.getDay()]})
          </h2>

          {todayClasses.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-12 text-center text-zinc-500 space-y-2">
              <CheckCircle2 className="h-10 w-10 text-emerald-500/40 mx-auto" />
              <p className="text-sm font-semibold text-zinc-400">No classes scheduled for today.</p>
              <p className="text-xs text-zinc-650">Enjoy your rest day or prepare for upcoming lessons!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {todayClasses.map((s) => {
                const active = isClassActive(s)
                const upcoming = isClassUpcoming(s)

                return (
                  <div 
                    key={s.id} 
                    className={`rounded-2xl border p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all duration-150 ${
                      active ? 'bg-emerald-500/10 border-emerald-500 shadow-md shadow-emerald-500/5' :
                      upcoming ? 'bg-yellow-500/5 border-yellow-500/50' :
                      'bg-black/20 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="space-y-2">
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <User className="h-4 w-4 text-zinc-400" /> Teacher: {s.teacher_name}
                      </h4>
                      <div className="flex flex-wrap gap-2 text-xs font-mono text-zinc-400">
                        <span className="flex items-center gap-1 bg-zinc-800 px-2.5 py-1 rounded">
                          <Clock className="h-4 w-4 text-zinc-500" /> {s.local_time} - {s.local_end_time}
                        </span>
                        <span className="bg-zinc-850 px-2.5 py-1 rounded text-zinc-500">
                          {s.duration_minutes} Mins
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {active && (
                        <span className="flex h-3 w-3 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                      )}
                      {upcoming && (
                        <span className="text-[10px] bg-yellow-500/15 text-yellow-400 border border-yellow-500/20 px-2 py-1 rounded font-bold uppercase tracking-wider">
                          Starting Soon
                        </span>
                      )}

                      <a
                        href={`https://meet.jit.si/virtual-zawiyah-teacher-${s.teacher_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-bold tracking-wide transition-all ${
                          active 
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow shadow-emerald-500/10' 
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-white/5'
                        }`}
                      >
                        <Video className="h-3.5 w-3.5" />
                        {active ? 'Join Classroom Now' : 'Classroom Link'}
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick Links Panel */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md space-y-4">
            <h3 className="text-lg font-bold text-white mb-4">Quick Navigation</h3>
            
            <div className="grid gap-3">
              <a 
                href="/student/schedule"
                className="flex items-center gap-3.5 rounded-xl border border-white/5 bg-black/20 p-4 text-sm font-semibold text-zinc-300 hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:text-white transition-all duration-150"
              >
                <Calendar className="h-5 w-5 text-emerald-400" />
                <div>
                  <span>My Weekly Calendar</span>
                  <span className="block text-[10px] font-normal text-zinc-500 mt-0.5">View all timezone-converted classes</span>
                </div>
              </a>

              <a 
                href="/student/fee-payment"
                className="flex items-center gap-3.5 rounded-xl border border-white/5 bg-black/20 p-4 text-sm font-semibold text-zinc-300 hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:text-white transition-all duration-150"
              >
                <CreditCard className="h-5 w-5 text-emerald-400" />
                <div>
                  <span>Submit Tuition Fee</span>
                  <span className="block text-[10px] font-normal text-zinc-500 mt-0.5">Upload manual transfer receipt logs</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
