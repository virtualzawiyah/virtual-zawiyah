'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { 
  Calendar, 
  Clock, 
  Filter, 
  User, 
  BookOpen, 
  Loader2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Video, 
  Check
} from 'lucide-react'

interface Assignment {
  id: string
  student: { id: string; full_name: string; email: string }
  teacher: { id: string; full_name: string; email: string }
}

interface DBClassSchedule {
  id: string
  assignment_id: string
  day_of_week: number
  start_time: string
  duration_minutes: number
}

interface LocalSchedule {
  id: string
  assignment_id: string
  student_name: string
  teacher_name: string
  teacher_id: string
  utc_day: number
  utc_time: string
  local_day: number
  local_time: string
  local_end_time: string
  duration_minutes: number
}

interface HolidayRecord {
  date: string
  is_teaching_day: boolean
  description: string | null
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

// Hours for the daily grid view (e.g. 8 AM to 10 PM local)
const GRID_HOURS = Array.from({ length: 15 }, (_, i) => i + 8)

export default function AdminCalendarPage() {
  const [loading, setLoading] = useState(true)
  const [schedules, setSchedules] = useState<LocalSchedule[]>([])
  const [allStudents, setAllStudents] = useState<Array<{ id: string; name: string }>>([])
  const [allTeachers, setAllTeachers] = useState<Array<{ id: string; name: string }>>([])
  
  // Filters
  const [selectedStudent, setSelectedStudent] = useState('')
  const [selectedTeacher, setSelectedTeacher] = useState('')
  const [calendarView, setCalendarView] = useState<'week' | 'list'>('week')

  // Academic calendar state
  const [holidays, setHolidays] = useState<HolidayRecord[]>([])
  const [newHolidayDate, setNewHolidayDate] = useState('')
  const [newHolidayDesc, setNewHolidayDesc] = useState('')
  const [holidayError, setHolidayError] = useState('')
  const [holidaySuccess, setHolidaySuccess] = useState('')
  const [holidaySubmitting, setHolidaySubmitting] = useState(false)

  // Converts recurring UTC weekly schedule to client's local timezone
  const convertUTCSlotToLocal = (dayOfWeek: number, startTime: string, durationMin: number): {
    localDay: number
    localTime: string
    localEndTime: string
  } => {
    const [h, m] = startTime.split(':').map(Number)
    // Jan 4, 2026 was a Sunday. So 4 + dayOfWeek aligns with the UTC day
    const utcDate = new Date(Date.UTC(2026, 0, 4 + dayOfWeek, h, m))
    
    const localDay = utcDate.getDay()
    const localHours = String(utcDate.getHours()).padStart(2, '0')
    const localMinutes = String(utcDate.getMinutes()).padStart(2, '0')
    const localTime = `${localHours}:${localMinutes}`

    // Calculate local end time
    const localEndDate = new Date(utcDate.getTime() + durationMin * 60000)
    const endHours = String(localEndDate.getHours()).padStart(2, '0')
    const endMinutes = String(localEndDate.getMinutes()).padStart(2, '0')
    const localEndTime = `${endHours}:${endMinutes}`

    return { localDay, localTime, localEndTime }
  }

  const loadCalendarData = async () => {
    try {
      setLoading(true)
      // 1. Fetch active assignments
      const { data: assignmentsData, error: assignErr } = await supabase
        .from('teacher_student_assignments')
        .select(`
          id,
          student:profiles!student_id(id, full_name, email),
          teacher:profiles!teacher_id(id, full_name, email)
        `)
        .eq('is_active', true)

      if (assignErr) throw assignErr

      const assignmentsMap = new Map<string, Assignment>()
      const studentSet = new Map<string, string>()
      const teacherSet = new Map<string, string>()

      interface QueryAssignment {
        id: string
        student: { id: string; full_name: string; email: string } | { id: string; full_name: string; email: string }[] | null
        teacher: { id: string; full_name: string; email: string } | { id: string; full_name: string; email: string }[] | null
      }

      if (assignmentsData) {
        (assignmentsData as unknown as QueryAssignment[]).forEach((item) => {
          const studentProfile = Array.isArray(item.student) ? item.student[0] : item.student
          const teacherProfile = Array.isArray(item.teacher) ? item.teacher[0] : item.teacher

          if (studentProfile && teacherProfile) {
            assignmentsMap.set(item.id, {
              id: item.id,
              student: studentProfile,
              teacher: teacherProfile
            })
            studentSet.set(studentProfile.id, studentProfile.full_name)
            teacherSet.set(teacherProfile.id, teacherProfile.full_name)
          }
        })
      }

      setAllStudents(Array.from(studentSet.entries()).map(([id, name]) => ({ id, name })).sort((a,b) => a.name.localeCompare(b.name)))
      setAllTeachers(Array.from(teacherSet.entries()).map(([id, name]) => ({ id, name })).sort((a,b) => a.name.localeCompare(b.name)))

      // 2. Fetch class schedules
      const { data: schedulesData, error: schedErr } = await supabase
        .from('class_schedules')
        .select('*')

      if (schedErr) throw schedErr

      const formattedSchedules: LocalSchedule[] = []
      if (schedulesData) {
        (schedulesData as DBClassSchedule[]).forEach((s) => {
          const assign = assignmentsMap.get(s.assignment_id)
          if (assign) {
            const { localDay, localTime, localEndTime } = convertUTCSlotToLocal(
              s.day_of_week,
              s.start_time,
              s.duration_minutes
            )

            formattedSchedules.push({
              id: s.id,
              assignment_id: s.assignment_id,
              student_name: assign.student.full_name,
              teacher_name: assign.teacher.full_name,
              teacher_id: assign.teacher.id,
              utc_day: s.day_of_week,
              utc_time: s.start_time,
              local_day: localDay,
              local_time: localTime,
              local_end_time: localEndTime,
              duration_minutes: s.duration_minutes
            })
          }
        })
      }

      setSchedules(formattedSchedules)

      // 3. Fetch academic calendar holidays
      const { data: holidaysData, error: holidayErr } = await supabase
        .from('academic_calendar')
        .select('*')
        .order('date', { ascending: true })

      if (holidayErr) throw holidayErr
      setHolidays(holidaysData || [])
    } catch (err) {
      console.error('Error fetching calendar data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCalendarData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newHolidayDate) return

    setHolidaySubmitting(true)
    setHolidayError('')
    setHolidaySuccess('')

    try {
      const { error } = await supabase
        .from('academic_calendar')
        .upsert([{
          date: newHolidayDate,
          is_teaching_day: false,
          description: newHolidayDesc.trim() || 'Holiday'
        }])

      if (error) throw error

      setHolidaySuccess(`Successfully marked ${newHolidayDate} as a holiday.`)
      setNewHolidayDate('')
      setNewHolidayDesc('')
      
      // Reload calendar data to refresh list
      await loadCalendarData()
    } catch (err) {
      const error = err as Error
      setHolidayError(error.message || 'Failed to add holiday.')
    } finally {
      setHolidaySubmitting(false)
    }
  }

  const handleDeleteHoliday = async (date: string) => {
    try {
      const { error } = await supabase
        .from('academic_calendar')
        .delete()
        .eq('date', date)

      if (error) throw error
      await loadCalendarData()
    } catch (err) {
      console.error('Failed to remove holiday:', err)
    }
  }

  // Filtered schedules list
  const filteredSchedules = schedules.filter((s) => {
    if (selectedStudent && s.student_name !== selectedStudent) return false
    if (selectedTeacher && s.teacher_name !== selectedTeacher) return false
    return true
  })

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Academy Calendar & Scheduling</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Monitor and coordinate active classes, filter assignments, and manage academic calendar non-teaching days.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex bg-slate-900 border border-white/10 rounded-xl p-1 w-fit">
          <button
            onClick={() => setCalendarView('week')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              calendarView === 'week' 
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Weekly Grid
          </button>
          <button
            onClick={() => setCalendarView('list')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              calendarView === 'list' 
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Active List
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur-md flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
          <Filter className="h-4 w-4 text-emerald-400" /> Filters:
        </div>

        {/* Student filter */}
        <div className="flex-1 min-w-[200px]">
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/25 py-2 px-3 text-xs text-white outline-none focus:border-emerald-500/50"
          >
            <option value="">All Students</option>
            {allStudents.map((s) => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Teacher filter */}
        <div className="flex-1 min-w-[200px]">
          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/25 py-2 px-3 text-xs text-white outline-none focus:border-emerald-500/50"
          >
            <option value="">All Teachers</option>
            {allTeachers.map((t) => (
              <option key={t.id} value={t.name}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid or List layout */}
      <div className="grid gap-8 lg:grid-cols-4">
        
        {/* Calendar visual */}
        <div className="lg:col-span-3 space-y-6">
          {calendarView === 'week' ? (
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md">
              <div className="min-w-[800px] border-collapse divide-y divide-white/5">
                {/* Header days */}
                <div className="grid grid-cols-8 text-center text-xs font-bold uppercase tracking-wider text-zinc-400 bg-white/[0.01]">
                  <div className="py-4 border-r border-white/5">Time (Local)</div>
                  {DAYS.map((day) => (
                    <div key={day} className="py-4 border-r border-white/5 flex flex-col items-center justify-center">
                      <span>{day}</span>
                    </div>
                  ))}
                </div>

                {/* Hour rows */}
                <div className="divide-y divide-white/5 font-mono text-zinc-400">
                  {GRID_HOURS.map((hour) => {
                    const timeLabel = `${String(hour).padStart(2, '0')}:00`
                    return (
                      <div key={hour} className="grid grid-cols-8 text-[11px] hover:bg-white/[0.01] transition-all">
                        {/* Time cell */}
                        <div className="py-6 text-center border-r border-white/5 font-bold flex items-center justify-center bg-black/10">
                          {timeLabel}
                        </div>

                        {/* Days cells */}
                        {DAYS.map((_, dayIdx) => {
                          // Find schedules active in this hour and day
                          const slotsInHour = filteredSchedules.filter((s) => {
                            if (s.local_day !== dayIdx) return false
                            const [sHour] = s.local_time.split(':').map(Number)
                            return sHour === hour
                          })

                          return (
                            <div key={dayIdx} className="p-1 border-r border-white/5 min-h-[60px] relative group flex flex-col gap-1.5 justify-center">
                              {slotsInHour.map((s) => (
                                <div
                                  key={s.id}
                                  className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2 text-[10px] text-white flex flex-col leading-normal shadow shadow-emerald-500/5 hover:border-emerald-500/40 hover:bg-emerald-500/15 transition-all"
                                >
                                  <span className="font-bold block truncate">{s.student_name}</span>
                                  <span className="text-[9px] text-emerald-400 truncate flex items-center gap-0.5 mt-0.5">
                                    <User className="h-2.5 w-2.5" /> {s.teacher_name}
                                  </span>
                                  <span className="text-[9px] text-zinc-400 font-bold block mt-1 flex items-center gap-0.5">
                                    <Clock className="h-2.5 w-2.5" /> {s.local_time} - {s.local_end_time}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* List View */
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-400" /> Active Schedule Lists ({filteredSchedules.length})
              </h2>

              {filteredSchedules.length === 0 ? (
                <p className="text-center py-12 text-zinc-500 text-sm">No schedules match the active filter configurations.</p>
              ) : (
                <div className="overflow-hidden rounded-xl border border-white/5 bg-black/10">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-xs font-bold uppercase tracking-wider text-zinc-500 bg-white/[0.01]">
                        <th className="py-3 px-4">Student</th>
                        <th className="py-3 px-4">Teacher</th>
                        <th className="py-3 px-4">Weekly Slot</th>
                        <th className="py-3 px-4">Local Time (converted)</th>
                        <th className="py-3 px-4">Jitsi Meet Classroom</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs text-zinc-300">
                      {filteredSchedules.map((s) => (
                        <tr key={s.id} className="hover:bg-white/[0.01]">
                          <td className="py-4 px-4 font-bold text-white">{s.student_name}</td>
                          <td className="py-4 px-4 text-zinc-400 flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-emerald-400" />
                            {s.teacher_name}
                          </td>
                          <td className="py-4 px-4 font-mono text-zinc-400">{DAYS[s.local_day]}</td>
                          <td className="py-4 px-4 font-mono font-semibold text-emerald-400">
                            {s.local_time} - {s.local_end_time} ({s.duration_minutes}m)
                          </td>
                          <td className="py-4 px-4">
                            <a
                              href={`https://meet.jit.si/virtual-zawiyah-teacher-${s.teacher_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 text-[11px] font-bold transition-all"
                            >
                              <Video className="h-3 w-3" /> Class Room
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Academic Calendar Holidays & Exceptions panel */}
        <div className="space-y-6">
          
          {/* Holiday Creator */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-400" /> Mark Holiday
            </h2>
            <p className="text-xs text-zinc-400">
              Block learning sessions by registering non-teaching days in the academic calendar database.
            </p>

            {holidayError && (
              <div className="flex items-center gap-1.5 text-xs text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" /> {holidayError}
              </div>
            )}
            {holidaySuccess && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                <Check className="h-4 w-4 shrink-0" /> {holidaySuccess}
              </div>
            )}

            <form onSubmit={handleAddHoliday} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Date</label>
                <input
                  type="date"
                  required
                  value={newHolidayDate}
                  onChange={(e) => setNewHolidayDate(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/25 py-2 px-3 text-xs text-white outline-none focus:border-emerald-500/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Description / Holiday Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eid-ul-Adha Holiday"
                  value={newHolidayDesc}
                  onChange={(e) => setNewHolidayDesc(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/25 py-2 px-3 text-xs text-white outline-none focus:border-emerald-500/50"
                />
              </div>
              <button
                type="submit"
                disabled={holidaySubmitting || !newHolidayDate}
                className="w-full mt-2 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-2.5 text-xs font-semibold text-white transition-all hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50"
              >
                {holidaySubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                Add Non-Teaching Day
              </button>
            </form>
          </div>

          {/* Holiday List */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-zinc-500" /> Holiday exceptions list
            </h3>
            {holidays.length === 0 ? (
              <p className="text-center py-4 text-zinc-500 text-xs">No active holidays stored.</p>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {holidays.map((h) => (
                  <div key={h.date} className="rounded-xl border border-white/5 bg-black/20 p-2.5 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white font-mono">{h.date}</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">{h.description || 'Holiday'}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteHoliday(h.date)}
                      className="text-zinc-500 hover:text-red-400 p-1 transition-all"
                      title="Remove Holiday"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
