'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { 
  User, 
  Clock, 
  Video, 
  Calendar, 
  Wallet, 
  CheckSquare, 
  Loader2, 
  AlertCircle,
  Users
} from 'lucide-react'

interface LocalSchedule {
  id: string
  assignment_id: string
  student_name: string
  student_id: string
  local_day: number
  local_time: string
  local_end_time: string
  duration_minutes: number
}

interface TeacherStats {
  activeStudents: number
  workloadSlots: number
  availableBalance: number
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
  student: { id: string; full_name: string }
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

export default function TeacherDashboard() {
  const [teacherName, setTeacherName] = useState('')
  const [teacherId, setTeacherId] = useState<string | null>(null)
  const [stats, setStats] = useState<TeacherStats>({
    activeStudents: 0,
    workloadSlots: 0,
    availableBalance: 0
  })
  const [todayClasses, setTodayClasses] = useState<LocalSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())

  // Refresh current time every 30s to update live checks
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
        const tId = session.user.id
        setTeacherId(tId)

        // 1. Fetch Teacher Name
        const { data: prof, error: profErr } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', tId)
          .single()

        if (profErr) throw profErr
        setTeacherName(prof?.full_name || 'Teacher')

        // 2. Fetch Wallet Balance
        const { data: walletData } = await supabase
          .from('teacher_wallet')
          .select('available_balance')
          .eq('teacher_id', tId)
          .single()

        const balance = walletData ? Number(walletData.available_balance) : 0

        // 3. Fetch active teacher assignments
        const { data: assigns, error: assignErr } = await supabase
          .from('teacher_student_assignments')
          .select(`
            id,
            student:profiles!student_id(id, full_name)
          `)
          .eq('teacher_id', tId)
          .eq('is_active', true)

        if (assignErr) throw assignErr

        const assignmentMap = new Map<string, Assignment>()
        const assignmentIds: string[] = []

        interface QueryAssignment {
          id: string
          student: { id: string; full_name: string } | { id: string; full_name: string }[] | null
        }

        if (assigns) {
          (assigns as unknown as QueryAssignment[]).forEach((a) => {
            const studentProfile = Array.isArray(a.student) ? a.student[0] : a.student
            if (studentProfile) {
              assignmentMap.set(a.id, {
                id: a.id,
                student: studentProfile
              })
              assignmentIds.push(a.id)
            }
          })
        }

        const todayFormatted: LocalSchedule[] = []
        let workloadCount = 0

        if (assignmentIds.length > 0) {
          // 4. Fetch schedules
          const { data: schedulesData, error: schedErr } = await supabase
            .from('class_schedules')
            .select('*')
            .in('assignment_id', assignmentIds)

          if (schedErr) throw schedErr

          if (schedulesData) {
            workloadCount = schedulesData.length;
            const todayDayIdx = new Date().getDay();

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
                    student_name: assign.student.full_name,
                    student_id: assign.student.id,
                    local_day: localDay,
                    local_time: localTime,
                    local_end_time: localEndTime,
                    duration_minutes: s.duration_minutes
                  })
                }
              }
            })
          }
        }

        // Sort by start time
        todayFormatted.sort((a, b) => a.local_time.localeCompare(b.local_time))
        setTodayClasses(todayFormatted)

        setStats({
          activeStudents: assignmentIds.length,
          workloadSlots: workloadCount,
          availableBalance: balance
        })
      } catch (err) {
        console.error('Failed to load teacher dashboard:', err)
        setErrorMsg('Failed to load teacher dashboard metrics.')
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
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-emerald-500/10 blur-[80px]" />
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Assalamu Alaikum, Ustadh {teacherName}!
          </h1>
          <p className="mt-2 text-zinc-400 max-w-xl">
            Welcome back to your Virtual Zawiyah Academy dashboard. Manage your availability work slots, review student schedules, and check your wallet balance.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        {/* Active students */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-4 right-4 h-10 w-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-emerald-400">
            <Users className="h-5 w-5" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Assigned Students</p>
          <h3 className="mt-4 text-3xl font-black text-white">{stats.activeStudents}</h3>
          <p className="text-xs text-zinc-500 mt-2">Active students in current assignments</p>
        </div>

        {/* Weekly schedules */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-4 right-4 h-10 w-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-emerald-400">
            <Calendar className="h-5 w-5" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Weekly Classes Workload</p>
          <h3 className="mt-4 text-3xl font-black text-white">{stats.workloadSlots} Slots</h3>
          <p className="text-xs text-zinc-500 mt-2">Total active class schedules per week</p>
        </div>

        {/* Wallet Balance */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 backdrop-blur-md relative overflow-hidden shadow-lg shadow-emerald-500/5">
          <div className="absolute top-4 right-4 h-10 w-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Wallet className="h-5 w-5" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Available Wallet Balance</p>
          <h3 className="mt-4 text-3xl font-black text-white">PKR {stats.availableBalance.toLocaleString()}</h3>
          <p className="text-xs text-zinc-400 mt-2">Withdrawable to your bank account IBAN</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-400" /> Today&apos;s Class Schedule ({DAYS[currentTime.getDay()]})
          </h2>

          {todayClasses.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-12 text-center text-zinc-500 space-y-2">
              <CheckSquare className="h-10 w-10 text-emerald-500/40 mx-auto" />
              <p className="text-sm font-semibold text-zinc-400">No classes scheduled for today.</p>
              <p className="text-xs text-zinc-600">Enjoy your day or update your recurring availability slots.</p>
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
                        <User className="h-4 w-4 text-zinc-400" /> Student: {s.student_name}
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
                        href={`https://meet.jit.si/virtual-zawiyah-teacher-${teacherId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-bold tracking-wide transition-all ${
                          active 
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow shadow-emerald-500/10' 
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-white/5'
                        }`}
                      >
                        <Video className="h-3.5 w-3.5" />
                        {active ? 'Start Class Room' : 'Start Classroom'}
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Shortcuts Panel */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md space-y-4">
            <h3 className="text-lg font-bold text-white mb-4">Ustadh Control Center</h3>
            
            <div className="grid gap-3">
              <a 
                href="/teacher/work-slots"
                className="flex items-center gap-3.5 rounded-xl border border-white/5 bg-black/20 p-4 text-sm font-semibold text-zinc-300 hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:text-white transition-all duration-150"
              >
                <Calendar className="h-5 w-5 text-emerald-400" />
                <div>
                  <span>Manage Work Slots</span>
                  <span className="block text-[10px] font-normal text-zinc-500 mt-0.5">Define weekly availability & breaks</span>
                </div>
              </a>

              <a 
                href="/teacher/attendance"
                className="flex items-center gap-3.5 rounded-xl border border-white/5 bg-black/20 p-4 text-sm font-semibold text-zinc-300 hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:text-white transition-all duration-150"
              >
                <CheckSquare className="h-5 w-5 text-emerald-400" />
                <div>
                  <span>Log Class Attendance</span>
                  <span className="block text-[10px] font-normal text-zinc-500 mt-0.5">Submit lessons and mark student presence</span>
                </div>
              </a>

              <a 
                href="/teacher/wallet"
                className="flex items-center gap-3.5 rounded-xl border border-white/5 bg-black/20 p-4 text-sm font-semibold text-zinc-300 hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:text-white transition-all duration-150"
              >
                <Wallet className="h-5 w-5 text-emerald-400" />
                <div>
                  <span>Wallet Dashboard</span>
                  <span className="block text-[10px] font-normal text-zinc-500 mt-0.5">Submit payout requests & review statements</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
