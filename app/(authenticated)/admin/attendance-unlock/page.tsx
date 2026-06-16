'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Lock, Unlock, Loader2, AlertCircle, Calendar, ShieldAlert } from 'lucide-react'

interface LockedLog {
  id: string
  class_date: string
  status: string
  notes: string | null
  locked: boolean
  teacher: { full_name: string }
  student: { full_name: string }
}

export default function AdminAttendanceUnlockPage() {
  const [logs, setLogs] = useState<LockedLog[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  
  // Modal State
  const [selectedLog, setSelectedLog] = useState<LockedLog | null>(null)
  const [reason, setReason] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const fetchLockedLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance_logs')
        .select(`
          id,
          class_date,
          status,
          notes,
          locked,
          teacher:profiles!teacher_id(full_name),
          student:profiles!student_id(full_name)
        `)
        .eq('locked', true)
        .order('class_date', { ascending: false })

      interface QueryLockedLog {
        id: string
        class_date: string
        status: string
        notes: string | null
        locked: boolean
        teacher: { full_name: string } | { full_name: string }[] | null
        student: { full_name: string } | { full_name: string }[] | null
      }

      if (error) throw error

      if (data) {
        const formattedLogs = (data as unknown as QueryLockedLog[]).map(log => {
          const teacherProfile = Array.isArray(log.teacher) ? log.teacher[0] : log.teacher
          const studentProfile = Array.isArray(log.student) ? log.student[0] : log.student
          return {
            id: log.id,
            class_date: log.class_date,
            status: log.status,
            notes: log.notes,
            locked: log.locked,
            teacher: teacherProfile || { full_name: 'Unknown' },
            student: studentProfile || { full_name: 'Unknown' }
          }
        })
        setLogs(formattedLogs)
      } else {
        setLogs([])
      }
    } catch (err) {
      console.error('Error loading locked logs:', err)
      setErrorMsg('Failed to fetch locked attendance records.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLockedLogs()
  }, [])

  const handleUnlockRecord = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLog || !reason.trim()) return

    setUpdatingId(selectedLog.id)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) throw new Error('Unauthenticated session.')

      // 1. Perform database updates
      const { error: updateErr } = await supabase
        .from('attendance_logs')
        .update({ locked: false })
        .eq('id', selectedLog.id)

      if (updateErr) throw updateErr

      // 2. Insert log record
      const { error: logErr } = await supabase
        .from('attendance_unlock_log')
        .insert([{
          attendance_id: selectedLog.id,
          unlocked_by: session.user.id,
          reason: reason.trim()
        }])

      if (logErr) throw logErr

      setSuccessMsg(`Successfully unlocked attendance log for ${selectedLog.student?.full_name} on ${selectedLog.class_date}.`)
      setLogs(prev => prev.filter(l => l.id !== selectedLog.id))
      setSelectedLog(null)
      setReason('')
    } catch (err) {
      const error = err as Error
      console.error('Error unlocking log:', error)
      setErrorMsg(error.message || 'Unlock operation failed.')
    } finally {
      setUpdatingId(null)
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
        <h1 className="text-3xl font-bold tracking-tight text-white">Attendance Lock Overrides</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Manage locked logs. Unlock teaching logs older than 24 hours to allow edits.
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

      {/* Main logs display list */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-yellow-500" /> Locked Session Logs ({logs.length})
        </h2>

        {logs.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 text-sm">
            No locked attendance logs found in the database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  <th className="pb-3 pr-4">Class Date</th>
                  <th className="pb-3 px-4">Student</th>
                  <th className="pb-3 px-4">Teacher</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-zinc-300">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.01]">
                    <td className="py-4 pr-4 font-semibold text-white">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-zinc-500" />
                        {log.class_date}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium">{log.student?.full_name}</td>
                    <td className="py-4 px-4">{log.teacher?.full_name}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold capitalize ${
                        log.status === 'present' ? 'bg-emerald-500/10 text-emerald-400' :
                        log.status === 'absent' ? 'bg-red-500/10 text-red-400' :
                        'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-4 pl-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-1.5 px-3 text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 active:scale-[0.98] transition-all duration-150"
                      >
                        <Unlock className="h-3.5 w-3.5" />
                        Unlock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Unlock Confirmation Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Lock className="h-5 w-5 text-yellow-500" /> Confirm Log Unlock
            </h3>
            
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              Unlocking the log for <strong className="text-white">{selectedLog.student?.full_name}</strong> (taught by {selectedLog.teacher?.full_name}) on {selectedLog.class_date} will make it editable again in the Teacher Panel.
            </p>

            <form onSubmit={handleUnlockRecord} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Reason for Unlock</label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Teacher forgot to log topic details, corrected student attendance status..."
                  className="w-full rounded-xl border border-white/10 bg-black/25 py-2 px-3 text-sm text-white outline-none focus:border-emerald-500/50 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setSelectedLog(null); setReason(''); }}
                  className="rounded-xl border border-white/10 bg-white/5 py-2 px-4 text-xs font-semibold text-zinc-300 hover:bg-white/10 active:scale-[0.98] transition-all duration-150"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingId === selectedLog.id}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-2 px-4 text-xs font-semibold text-white transition-all duration-150 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] disabled:opacity-50"
                >
                  {updatingId === selectedLog.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Unlock className="h-3.5 w-3.5" />
                  )}
                  Confirm Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
