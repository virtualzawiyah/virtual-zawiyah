'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { 
  User, 
  Clock, 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  Loader2, 
  AlertCircle
} from 'lucide-react'

interface ChildSchedule {
  studentName: string
  teacherName: string
  dayOfWeek: number
  startTime: string
  durationMinutes: number
  localTime: string
  localEndTime: string
  localDay: number
}

interface ParentPayment {
  id: string
  created_at: string
  total_amount: number
  currency: string
  status: 'pending' | 'verified' | 'rejected'
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

export default function ParentDashboard() {
  const [parentName, setParentName] = useState('')
  const [payments, setPayments] = useState<ParentPayment[]>([])
  const [childSchedules, setChildSchedules] = useState<ChildSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  // Converts UTC slot day and time to local timezone
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

  useEffect(() => {
    const loadParentDashboard = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) return

        // 1. Fetch parent profile name
        const { data: profileData, error: profErr } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', session.user.id)
          .single()

        if (profErr) throw profErr
        setParentName(profileData?.full_name || 'Parent')

        // 2. Fetch parent payments
        const { data: pps, error: ppErr } = await supabase
          .from('parent_payments')
          .select('id, created_at, total_amount, currency, status')
          .eq('parent_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(5)

        if (ppErr) throw ppErr
        setPayments(pps || [])

        // 3. Find unique children (students) and fetch schedules
        // Fetch all student ids from fee payments linked to this parent
        const { data: feesData } = await supabase
          .from('fee_payments')
          .select(`
            student_id,
            student:profiles!student_id(full_name),
            teacher:profiles!teacher_id(full_name)
          `)
          .in('parent_payment_id', pps?.map(p => p.id) || [])

        const uniqueChildren = new Map<string, { studentName: string }>()
        interface FeeRecord {
          student_id: string
          student: { full_name: string } | { full_name: string }[] | null
          teacher: { full_name: string } | { full_name: string }[] | null
        }

        if (feesData) {
          (feesData as unknown as FeeRecord[]).forEach((f) => {
            const studentProfile = Array.isArray(f.student) ? f.student[0] : f.student
            if (studentProfile) {
              uniqueChildren.set(f.student_id, {
                studentName: studentProfile.full_name
              })
            }
          })
        }

        const studentIds = Array.from(uniqueChildren.keys())

        if (studentIds.length > 0) {
          // 4. Fetch assignments & schedules for these students
          const { data: assignmentsData } = await supabase
            .from('teacher_student_assignments')
            .select(`
              id,
              student_id,
              student:profiles!student_id(full_name),
              teacher:profiles!teacher_id(full_name)
            `)
            .in('student_id', studentIds)
            .eq('is_active', true)

          const activeAssignmentIds: string[] = []
          const assignmentMap = new Map<string, { studentName: string; teacherName: string }>()

          interface AssignmentRecord {
            id: string
            student_id: string
            student: { full_name: string } | { full_name: string }[] | null
            teacher: { full_name: string } | { full_name: string }[] | null
          }

          if (assignmentsData) {
            (assignmentsData as unknown as AssignmentRecord[]).forEach((a) => {
              const studentProfile = Array.isArray(a.student) ? a.student[0] : a.student
              const teacherProfile = Array.isArray(a.teacher) ? a.teacher[0] : a.teacher
              if (studentProfile && teacherProfile) {
                assignmentMap.set(a.id, {
                  studentName: studentProfile.full_name,
                  teacherName: teacherProfile.full_name
                })
                activeAssignmentIds.push(a.id)
              }
            })
          }

          if (activeAssignmentIds.length > 0) {
            const { data: schedulesData } = await supabase
              .from('class_schedules')
              .select('*')
              .in('assignment_id', activeAssignmentIds)

            if (schedulesData) {
              const formattedSchedules: ChildSchedule[] = []
              schedulesData.forEach((s) => {
                const info = assignmentMap.get(s.assignment_id)
                if (info) {
                  const { localDay, localTime, localEndTime } = convertUTCSlotToLocal(
                    s.day_of_week,
                    s.start_time,
                    s.duration_minutes
                  )
                  formattedSchedules.push({
                    studentName: info.studentName,
                    teacherName: info.teacherName,
                    dayOfWeek: s.day_of_week,
                    startTime: s.start_time,
                    durationMinutes: s.duration_minutes,
                    localTime,
                    localEndTime,
                    localDay
                  })
                }
              })

              // Sort by day then time
              formattedSchedules.sort((a,b) => {
                if (a.localDay !== b.localDay) return a.localDay - b.localDay
                return a.localTime.localeCompare(b.localTime)
              })

              setChildSchedules(formattedSchedules)
            }
          }
        }
      } catch (err) {
        console.error('Failed to load parent dashboard:', err)
        setErrorMsg('Failed to load dashboard metrics.')
      } finally {
        setLoading(false)
      }
    }

    loadParentDashboard()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    )
  }

  // Calculate statistics
  const pendingCount = payments.filter(p => p.status === 'pending').length
  const verifiedCount = payments.filter(p => p.status === 'verified').length

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-emerald-500/10 blur-[80px]" />
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Assalamu Alaikum, {parentName}!
          </h1>
          <p className="mt-2 text-zinc-400 max-w-xl">
            Welcome back to the parent administration dashboard. Here you can track payment approvals and monitor class scheduling details.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Metrics */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 backdrop-blur-md relative overflow-hidden flex justify-between items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Verified Submissions</p>
            <h3 className="mt-2 text-3xl font-black text-white">{verifiedCount}</h3>
          </div>
          <CheckCircle2 className="h-10 w-10 text-emerald-500/30" />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md relative overflow-hidden flex justify-between items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-sans">Pending Verifications</p>
            <h3 className="mt-2 text-3xl font-black text-white">{pendingCount}</h3>
          </div>
          <Clock className="h-10 w-10 text-zinc-500/30" />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Child schedule overview */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-400" /> Children&apos;s Weekly Schedule Overview
          </h2>

          {childSchedules.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-12 text-center text-zinc-500 space-y-2">
              <Calendar className="h-10 w-10 text-zinc-650 mx-auto" />
              <p className="text-sm font-semibold text-zinc-400">No active classes registered.</p>
              <p className="text-xs text-zinc-600">Once your children have active assignments, they will display here.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {childSchedules.map((cs, idx) => (
                <div key={idx} className="rounded-xl border border-white/5 bg-black/20 p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div>
                    <h4 className="font-bold text-white flex items-center gap-1.5 text-sm">
                      <User className="h-4 w-4 text-emerald-400" /> {cs.studentName}
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1">
                      Teacher: <span className="text-zinc-300 font-semibold">{cs.teacherName}</span>
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-emerald-400 font-semibold">{DAYS[cs.localDay]}s</p>
                    <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                      {cs.localTime} - {cs.localEndTime} ({cs.durationMinutes}m)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent tuition transfers */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-emerald-400" /> Recent Tuition Submissions
          </h2>

          {payments.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-black/20 p-6 text-center text-zinc-500 text-xs">
              No recent payments recorded.
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((p) => {
                const date = new Date(p.created_at).toLocaleDateString()
                return (
                  <div key={p.id} className="rounded-xl border border-white/5 bg-black/20 p-4 flex items-center justify-between text-xs hover:bg-black/35 transition-all">
                    <div>
                      <p className="font-bold text-white">{p.currency} {Number(p.total_amount).toLocaleString()}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{date}</p>
                    </div>

                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      p.status === 'verified' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' :
                      p.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/15' :
                      'bg-yellow-500/10 text-yellow-400 border border-yellow-500/15'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                )
              })}
              <a 
                href="/parent/payments"
                className="block text-center rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-all duration-150"
              >
                View Complete History
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
