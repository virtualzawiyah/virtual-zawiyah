'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Plus, Users, Calendar, Loader2, AlertCircle, Wand2, Trash2 } from 'lucide-react'

interface Assignment {
  id: string
  student: { id: string; full_name: string }
  teacher: { id: string; full_name: string }
  assigned_date: string
  schedules: Array<{
    id: string
    day_of_week: number
    start_time: string
    duration_minutes: number
  }>
}

interface Profile {
  id: string
  full_name: string
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

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [students, setStudents] = useState<Profile[]>([])
  const [teachers, setTeachers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [autoAssigning, setAutoAssigning] = useState(false)

  // Form State
  const [studentId, setStudentId] = useState('')
  const [teacherId, setTeacherId] = useState('')
  const [dayOfWeek, setDayOfWeek] = useState<number>(1) // Monday
  const [startTime, setStartTime] = useState('09:00')
  const [duration, setDuration] = useState(30)

  // Validation/Alerts State
  const [validationAlerts, setValidationAlerts] = useState<string[]>([])
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const fetchInitialData = async () => {
    try {
      // 1. Fetch Students
      const { data: stds } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'student')
        .order('full_name')

      // 2. Fetch Teachers
      const { data: tchs } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'teacher')
        .order('full_name')

      setStudents(stds || [])
      setTeachers(tchs || [])

      // 3. Fetch Assignments and their schedules
      const { data: assigns, error: assignError } = await supabase
        .from('teacher_student_assignments')
        .select(`
          id,
          assigned_date,
          student:profiles!student_id(id, full_name),
          teacher:profiles!teacher_id(id, full_name)
        `)
        .eq('is_active', true)

      if (assignError) throw assignError

      const formattedAssignments: Assignment[] = []

      interface QueryAssignment {
        id: string
        assigned_date: string
        student: { id: string; full_name: string } | { id: string; full_name: string }[] | null
        teacher: { id: string; full_name: string } | { id: string; full_name: string }[] | null
      }

      if (assigns) {
        for (const assign of assigns as unknown as QueryAssignment[]) {
          const { data: scheds } = await supabase
            .from('class_schedules')
            .select('id, day_of_week, start_time, duration_minutes')
            .eq('assignment_id', assign.id)

          const studentProfile = Array.isArray(assign.student) ? assign.student[0] : assign.student
          const teacherProfile = Array.isArray(assign.teacher) ? assign.teacher[0] : assign.teacher

          if (studentProfile && teacherProfile) {
            formattedAssignments.push({
              id: assign.id,
              student: studentProfile,
              teacher: teacherProfile,
              assigned_date: assign.assigned_date,
              schedules: scheds || []
            })
          }
        }
      }

      setAssignments(formattedAssignments)
    } catch (err) {
      console.error('Error fetching data:', err)
      setErrorMsg('Failed to load portal configuration data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInitialData()
  }, [])

  // Validate the proposed schedule against teacher availability and conflicts
  const validateSchedule = async (
    tId: string,
    day: number,
    start: string,
    dur: number
  ): Promise<string[]> => {
    const alerts: string[] = []
    
    const parseTime = (t: string) => {
      const [h, m] = t.split(':').map(Number)
      return h * 60 + m
    }

    const proposedStartMin = parseTime(start)
    const proposedEndMin = proposedStartMin + dur

    // 1. Check Teacher Availability Work Slots
    const { data: slots, error: slotsError } = await supabase
      .from('teacher_work_slots')
      .select('*')
      .eq('teacher_id', tId)
      .eq('day_of_week', day)
      .eq('is_active', true)

    if (slotsError) {
      alerts.push('Failed to load teacher availability.')
      return alerts
    }

    if (!slots || slots.length === 0) {
      alerts.push(`Warning: Selected teacher has no active work slots defined for ${DAYS[day]}.`)
    } else {
      // Check if proposed slot is inside teacher's availability
      let fitsInSlot = false
      let overlapsBreak = false

      for (const slot of slots) {
        const slotStartMin = parseTime(slot.slot_start.slice(0, 5))
        const slotEndMin = parseTime(slot.slot_end.slice(0, 5))

        if (proposedStartMin >= slotStartMin && proposedEndMin <= slotEndMin) {
          fitsInSlot = true

          // Check if it overlaps break time
          if (slot.break_start && slot.break_end) {
            const breakStartMin = parseTime(slot.break_start.slice(0, 5))
            const breakEndMin = parseTime(slot.break_end.slice(0, 5))

            if (proposedStartMin < breakEndMin && proposedEndMin > breakStartMin) {
              overlapsBreak = true
            }
          }
          break
        }
      }

      if (!fitsInSlot) {
        alerts.push('Conflict: Class schedule falls outside the teacher\'s defined availability hours.')
      }
      if (overlapsBreak) {
        alerts.push('Conflict: Class schedule overlaps with the teacher\'s scheduled lunch/break time.')
      }
    }

    // 2. Check for Double-Bookings (Overlapping assignments with other students)
    // Query all schedules for this teacher
    const { data: teacherAssigns } = await supabase
      .from('teacher_student_assignments')
      .select('id, student:profiles!student_id(full_name)')
      .eq('teacher_id', tId)
      .eq('is_active', true)

    interface TeacherAssignRecord {
      id: string
      student: { full_name: string } | { full_name: string }[] | null
    }

    const assignsData = (teacherAssigns as unknown as TeacherAssignRecord[]) || []

    if (assignsData.length > 0) {
      const assignIds = assignsData.map(ta => ta.id)

      const { data: existingScheds } = await supabase
        .from('class_schedules')
        .select('day_of_week, start_time, duration_minutes, assignment_id')
        .in('assignment_id', assignIds)
        .eq('day_of_week', day)

      if (existingScheds) {
        existingScheds.forEach((es) => {
          const extStartMin = parseTime(es.start_time.slice(0, 5))
          const extEndMin = extStartMin + es.duration_minutes

          if (proposedStartMin < extEndMin && proposedEndMin > extStartMin) {
            const matchAssign = assignsData.find(ta => ta.id === es.assignment_id)
            const studentData = matchAssign?.student
            const studentName = Array.isArray(studentData)
              ? studentData[0]?.full_name
              : studentData?.full_name || 'Another student'
            alerts.push(`Double Booking Conflict: Teacher is already teaching ${studentName} from ${es.start_time.slice(0, 5)} on ${DAYS[day]}.`)
          }
        })
      }
    }

    return alerts
  }

  // Trigger validation on form change
  useEffect(() => {
    if (!teacherId) {
      setValidationAlerts([])
      return
    }

    const runValidation = async () => {
      const alerts = await validateSchedule(teacherId, dayOfWeek, startTime, duration)
      setValidationAlerts(alerts)
    }

    const timer = setTimeout(runValidation, 500)
    return () => clearTimeout(timer)
  }, [teacherId, dayOfWeek, startTime, duration])

  const handleAutoAssign = async () => {
    setAutoAssigning(true)
    setErrorMsg('')
    try {
      const response = await fetch('/api/auto-assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const result = await response.json()
      if (result.suggested_teacher_id) {
        setTeacherId(result.suggested_teacher_id)
        setSuccessMsg(`Auto-suggested ${result.suggested_teacher_name} (occupying ${result.workload_slots} weekly slots).`)
      } else {
        throw new Error(result.error || 'Failed to auto-assign')
      }
    } catch (err) {
      const error = err as Error
      setErrorMsg(error.message || 'Auto-assignment failed.')
    } finally {
      setAutoAssigning(false)
    }
  }

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentId || !teacherId) {
      setErrorMsg('Please select a student and teacher.')
      return
    }

    setSaving(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      // 1. Create assignment row
      const { data: assign, error: assignErr } = await supabase
        .from('teacher_student_assignments')
        .insert([{
          student_id: studentId,
          teacher_id: teacherId,
          is_active: true
        }])
        .select()

      if (assignErr) throw assignErr

      if (assign && assign.length > 0) {
        // 2. Create schedule row
        const { error: schedErr } = await supabase
          .from('class_schedules')
          .insert([{
            assignment_id: assign[0].id,
            day_of_week: dayOfWeek,
            start_time: `${startTime}:00`,
            duration_minutes: duration
          }])

        if (schedErr) throw schedErr

        setSuccessMsg('Student assigned and class scheduled successfully!')
        setStudentId('')
        setTeacherId('')
        setValidationAlerts([])
        fetchInitialData()
      }
    } catch (err) {
      const error = err as Error
      console.error('Error saving assignment:', error)
      setErrorMsg(error.message || 'Failed to create student-teacher assignment.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm('Are you sure you want to remove this assignment and its weekly schedule?')) return
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const { error } = await supabase
        .from('teacher_student_assignments')
        .delete()
        .eq('id', id)

      if (error) throw error

      setAssignments(prev => prev.filter(a => a.id !== id))
      setSuccessMsg('Assignment deleted successfully.')
    } catch (err) {
      const error = err as Error
      console.error('Error deleting assignment:', error)
      setErrorMsg('Failed to remove assignment.')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Student & Teacher Assignments</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Match students with available teachers and schedule recurring weekly class times.
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">
          {successMsg}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Form panel */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md h-fit">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Plus className="h-5 w-5 text-emerald-400" /> Create Assignment
          </h2>

          <form onSubmit={handleCreateAssignment} className="space-y-4">
            {/* Student Dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Select Student</label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-black/25 py-2.5 px-3.5 text-sm text-white outline-none focus:border-emerald-500/50"
              >
                <option value="" className="bg-slate-900">Choose Student...</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id} className="bg-slate-900">{student.full_name}</option>
                ))}
              </select>
            </div>

            {/* Teacher Dropdown with Auto-Assign */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Select Teacher</label>
                <button
                  type="button"
                  onClick={handleAutoAssign}
                  disabled={autoAssigning}
                  className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
                >
                  {autoAssigning ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Wand2 className="h-3.5 w-3.5" />
                  )}
                  Auto-Assign
                </button>
              </div>
              <select
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-black/25 py-2.5 px-3.5 text-sm text-white outline-none focus:border-emerald-500/50"
              >
                <option value="" className="bg-slate-900">Choose Teacher...</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id} className="bg-slate-900">{teacher.full_name}</option>
                ))}
              </select>
            </div>

            {/* Day Selector */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Weekly Class Day</label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
                className="w-full rounded-xl border border-white/10 bg-black/25 py-2.5 px-3.5 text-sm text-white outline-none focus:border-emerald-500/50"
              >
                {DAYS.map((day, idx) => (
                  <option key={idx} value={idx} className="bg-slate-900">{day}</option>
                ))}
              </select>
            </div>

            {/* Start Time & Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Start Time</label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/25 py-2.5 px-3.5 text-sm text-white outline-none focus:border-emerald-500/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Duration (mins)</label>
                <input
                  type="number"
                  required
                  min={15}
                  max={240}
                  step={15}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/10 bg-black/25 py-2.5 px-3.5 text-sm text-white outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            {/* Validation Alerts Block */}
            {validationAlerts.length > 0 && (
              <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-yellow-400 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4" /> Schedule Warnings
                </h4>
                <ul className="list-inside list-disc text-xs text-yellow-500 space-y-1">
                  {validationAlerts.map((alert, idx) => (
                    <li key={idx}>{alert}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="submit"
              disabled={saving || validationAlerts.some(a => a.startsWith('Conflict:'))}
              className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-semibold text-white transition-all duration-150 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create Assignment
            </button>
          </form>
        </div>

        {/* Overview List panel */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md lg:col-span-2">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-400" /> Active Student Assignments
          </h2>

          {assignments.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-sm">
              No assignments or schedules created yet. Use the sidebar form to match classes.
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.map((assign) => (
                <div key={assign.id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-white/5 bg-black/20 p-4 gap-4 hover:border-white/10 transition-colors">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-bold text-white">{assign.student?.full_name}</span>
                      <span className="text-zinc-500">assigned to</span>
                      <span className="font-semibold text-emerald-400">{assign.teacher?.full_name}</span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                      {assign.schedules.map((sched) => (
                        <div key={sched.id} className="flex items-center gap-1.5 rounded-lg bg-white/[0.02] border border-white/5 py-1.5 px-3 text-xs text-zinc-300">
                          <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                          {DAYS[sched.day_of_week]}: {sched.start_time.slice(0, 5)} ({sched.duration_minutes}m)
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteAssignment(assign.id)}
                    className="text-zinc-500 hover:text-red-400 transition-colors p-2 self-end sm:self-center"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
