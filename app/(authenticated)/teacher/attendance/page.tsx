'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { User, BookOpen, AlertTriangle, Save, Loader2 } from 'lucide-react'

interface Student {
  id: string
  full_name: string
}

export default function TeacherAttendancePage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [teacherId, setTeacherId] = useState<string | null>(null)

  // Selected State
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [classDate, setClassDate] = useState(new Date().toISOString().slice(0, 10))

  // Log Form State
  const [status, setStatus] = useState<'present' | 'absent' | 'leave'>('present')
  const [notes, setNotes] = useState('')
  const [topicCovered, setTopicCovered] = useState('')
  const [nextPlan, setNextPlan] = useState('')
  const [performance, setPerformance] = useState<'excellent' | 'good' | 'average' | 'needs_improvement'>('good')
  const [privateNotes, setPrivateNotes] = useState('')

  // State flags
  const [isLocked, setIsLocked] = useState(false)
  const [existingAttendanceId, setExistingAttendanceId] = useState<string | null>(null)
  const [existingLessonId, setExistingLessonId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    const initTeacher = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) return
        setTeacherId(session.user.id)

        // Fetch student assignments for this teacher
        const { data: assigns, error } = await supabase
          .from('teacher_student_assignments')
          .select(`
            student_id,
            student:profiles!student_id(id, full_name)
          `)
          .eq('teacher_id', session.user.id)
          .eq('is_active', true)

        interface QueryAssignmentRecord {
          student_id: string
          student: { id: string; full_name: string } | { id: string; full_name: string }[] | null
        }

        if (error) throw error

        if (assigns) {
          const list = (assigns as unknown as QueryAssignmentRecord[]).map((a) => {
            const studentProfile = Array.isArray(a.student) ? a.student[0] : a.student
            return studentProfile
          }).filter((s): s is Student => !!s)
          setStudents(list)
          if (list.length > 0) {
            setSelectedStudentId(list[0].id)
          }
        }
      } catch (err) {
        console.error('Error loading students:', err)
        setErrorMsg('Failed to load assigned students.')
      } finally {
        setLoading(false)
      }
    }

    initTeacher()
  }, [])

  // Load log data when student or date changes
  useEffect(() => {
    if (!selectedStudentId || !classDate || !teacherId) return

    const loadLogData = async () => {
      setErrorMsg('')
      setSuccessMsg('')
      setIsLocked(false)
      setExistingAttendanceId(null)
      setExistingLessonId(null)
      
      // Reset form defaults
      setStatus('present')
      setNotes('')
      setTopicCovered('')
      setNextPlan('')
      setPerformance('good')
      setPrivateNotes('')

      try {
        // 1. Fetch attendance log
        const { data: attData } = await supabase
          .from('attendance_logs')
          .select('id, status, notes, locked')
          .eq('student_id', selectedStudentId)
          .eq('class_date', classDate)
          .single()

        // 2. Fetch lesson log and its private notes
        const { data: lesData } = await supabase
          .from('lesson_logs')
          .select('id, topic_covered, next_plan, performance')
          .eq('student_id', selectedStudentId)
          .eq('class_date', classDate)
          .single()

        let pNotesData = null
        if (lesData) {
          setExistingLessonId(lesData.id)
          setTopicCovered(lesData.topic_covered)
          setNextPlan(lesData.next_plan)
          setPerformance(lesData.performance)

          const { data: pnData } = await supabase
            .from('lesson_private_notes')
            .select('notes')
            .eq('lesson_id', lesData.id)
            .single()
          pNotesData = pnData
        }

        if (attData) {
          setExistingAttendanceId(attData.id)
          setStatus(attData.status as 'present' | 'absent' | 'leave')
          setNotes(attData.notes || '')
          
          // Determine locked status
          const isDateOld = new Date(classDate) < new Date(new Date().setDate(new Date().getDate() - 1))
          if (attData.locked || isDateOld) {
            setIsLocked(true)
          }
        } else {
          // If no log exists in DB, check if selected date is older than 24 hours
          const today = new Date().toISOString().slice(0, 10)
          const isDateOld = classDate < today // Simple check to enforce today or future entries
          if (isDateOld) {
            setIsLocked(true)
          }
        }

        if (pNotesData) {
          setPrivateNotes(pNotesData.notes)
        }
      } catch (err) {
        const error = err as { code?: string; message?: string }
        // single() returns error if no row matches, which is normal for a new entry
        if (error.code !== 'PGRST116') {
          console.error('Error loading log entries:', error)
          setErrorMsg('Failed to query progress log entries.')
        } else {
          // Simple date checking if record doesn't exist
          const today = new Date().toISOString().slice(0, 10)
          if (classDate < today) {
            setIsLocked(true)
          }
        }
      }
    }

    loadLogData()
  }, [selectedStudentId, classDate, teacherId])

  const handleSaveLogs = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teacherId || !selectedStudentId || isLocked) return

    setSaving(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      // 1. Save Attendance Log (upsert)
      const attPayload = {
        teacher_id: teacherId,
        student_id: selectedStudentId,
        class_date: classDate,
        status,
        notes: notes || null,
        locked: false // Middleware or pg_cron handles locks
      }

      if (existingAttendanceId) {
        const { error: attUpdateErr } = await supabase
          .from('attendance_logs')
          .update(attPayload)
          .eq('id', existingAttendanceId)
        if (attUpdateErr) throw attUpdateErr
      } else {
        const { data: newAtt, error: attInsertErr } = await supabase
          .from('attendance_logs')
          .insert([attPayload])
          .select()
        if (attInsertErr) throw attInsertErr
        if (newAtt) {
          setExistingAttendanceId(newAtt[0].id)
        }
      }

      // 2. Save Lesson Log (upsert)
      const lesPayload = {
        teacher_id: teacherId,
        student_id: selectedStudentId,
        class_date: classDate,
        topic_covered: topicCovered,
        next_plan: nextPlan,
        performance
      }

      let lesId = existingLessonId

      if (existingLessonId) {
        const { error: lesUpdateErr } = await supabase
          .from('lesson_logs')
          .update(lesPayload)
          .eq('id', existingLessonId)
        if (lesUpdateErr) throw lesUpdateErr
      } else {
        const { data: newLes, error: lesInsertErr } = await supabase
          .from('lesson_logs')
          .insert([lesPayload])
          .select()
        if (lesInsertErr) throw lesInsertErr
        if (newLes) {
          setExistingLessonId(newLes[0].id)
          lesId = newLes[0].id
        }
      }

      // 3. Save Private Notes if provided (linked to lesson_logs)
      if (lesId) {
        if (privateNotes.trim()) {
          const { error: pnErr } = await supabase
            .from('lesson_private_notes')
            .upsert({
              lesson_id: lesId,
              notes: privateNotes
            })
          if (pnErr) throw pnErr
        } else {
          // If empty, delete existing private notes
          await supabase
            .from('lesson_private_notes')
            .delete()
            .eq('lesson_id', lesId)
        }
      }

      setSuccessMsg('Attendance and Lesson Logs updated successfully.')
    } catch (err) {
      const error = err as Error
      console.error('Error saving logs:', error)
      setErrorMsg(error.message || 'Failed to submit changes.')
    } finally {
      setSaving(false)
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
        <h1 className="text-3xl font-bold tracking-tight text-white">Daily Attendance & Lesson Logs</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Mark attendance, log topic coverage, progress plans, and submit private feedback notes.
        </p>
      </div>

      {errorMsg && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">
          {successMsg}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Sidebar Controls */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md h-fit space-y-4">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-emerald-400" /> Class Session Info
          </h2>

          {/* Student Selector */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Select Student</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/25 py-2.5 px-3.5 text-sm text-white outline-none focus:border-emerald-500/50"
            >
              {students.length === 0 ? (
                <option value="" className="bg-slate-900">No students assigned</option>
              ) : (
                students.map((student) => (
                  <option key={student.id} value={student.id} className="bg-slate-900">{student.full_name}</option>
                ))
              )}
            </select>
          </div>

          {/* Date Picker */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Class Date</label>
            <input
              type="date"
              value={classDate}
              onChange={(e) => setClassDate(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/25 py-2.5 px-3.5 text-sm text-white outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Lock Banner */}
          {isLocked && (
            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 flex gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-yellow-400">Session Locked</h4>
                <p className="text-[11px] text-yellow-500/80 leading-relaxed">
                  Attendance logs are locked after 24 hours. Changes are prohibited unless unlocked by an Admin.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Logging Form */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md lg:col-span-2">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-400" /> Progress Entry
          </h2>

          <form onSubmit={handleSaveLogs} className="space-y-6">
            {/* Attendance state */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Attendance Status</label>
              <div className="flex gap-4">
                {['present', 'absent', 'leave'].map((statusOption) => (
                  <label
                    key={statusOption}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-xl border py-3 px-4 text-sm font-semibold capitalize cursor-pointer transition-all duration-150 ${
                      status === statusOption
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/5'
                        : 'border-white/10 bg-black/25 text-zinc-400 hover:bg-white/5 hover:text-white'
                    } ${isLocked ? 'pointer-events-none opacity-50' : ''}`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={statusOption}
                      checked={status === statusOption}
                      onChange={() => setStatus(statusOption as 'present' | 'absent' | 'leave')}
                      className="sr-only"
                    />
                    {statusOption}
                  </label>
                ))}
              </div>
            </div>

            {/* Attendance Notes */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Attendance Notes (Optional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isLocked}
                placeholder="e.g. Student arrived 10 mins late, network issue, etc."
                className="w-full rounded-xl border border-white/10 bg-black/25 py-2.5 px-3.5 text-sm text-white outline-none focus:border-emerald-500/50 disabled:opacity-50"
              />
            </div>

            {/* Topic Covered */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Topic Covered</label>
              <textarea
                required
                rows={3}
                value={topicCovered}
                onChange={(e) => setTopicCovered(e.target.value)}
                disabled={isLocked}
                placeholder="Detail the verses read, Tajweed rules reviewed, or lesson page..."
                className="w-full rounded-xl border border-white/10 bg-black/25 py-2.5 px-3.5 text-sm text-white outline-none focus:border-emerald-500/50 disabled:opacity-50 resize-none"
              />
            </div>

            {/* Next Plan */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Next Lesson Plan</label>
              <textarea
                required
                rows={3}
                value={nextPlan}
                onChange={(e) => setNextPlan(e.target.value)}
                disabled={isLocked}
                placeholder="What homework, memorization schedule, or next chapter is assigned?"
                className="w-full rounded-xl border border-white/10 bg-black/25 py-2.5 px-3.5 text-sm text-white outline-none focus:border-emerald-500/50 disabled:opacity-50 resize-none"
              />
            </div>

            {/* Performance Scale */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Student Performance</label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {['excellent', 'good', 'average', 'needs_improvement'].map((rating) => (
                  <label
                    key={rating}
                    className={`flex items-center justify-center text-center rounded-xl border py-2.5 px-3 text-xs font-semibold capitalize cursor-pointer transition-all duration-150 ${
                      performance === rating
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/5'
                        : 'border-white/10 bg-black/25 text-zinc-400 hover:bg-white/5 hover:text-white'
                    } ${isLocked ? 'pointer-events-none opacity-50' : ''}`}
                  >
                    <input
                      type="radio"
                      name="performance"
                      value={rating}
                      checked={performance === rating}
                      onChange={() => setPerformance(rating as 'excellent' | 'good' | 'average' | 'needs_improvement')}
                      className="sr-only"
                    />
                    {rating.replace('_', ' ')}
                  </label>
                ))}
              </div>
            </div>

            {/* Private Notes */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Private Notes (Admin & Teacher Only)</label>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Hidden from Student/Parent</span>
              </div>
              <textarea
                rows={3}
                value={privateNotes}
                onChange={(e) => setPrivateNotes(e.target.value)}
                disabled={isLocked}
                placeholder="Specific comments on student behavior, progress speed, or academy billing adjustments..."
                className="w-full rounded-xl border border-white/10 bg-black/25 py-2.5 px-3.5 text-sm text-white outline-none focus:border-emerald-500/50 disabled:opacity-50 resize-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={saving || isLocked || students.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 text-sm font-semibold text-white transition-all duration-150 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Saving Logs...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Save Progress Log
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
