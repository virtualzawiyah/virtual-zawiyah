'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Plus, Trash2, Calendar, Clock, Loader2, AlertCircle } from 'lucide-react'

interface WorkSlot {
  id: string
  day_of_week: number
  slot_start: string
  slot_end: string
  break_start: string | null
  break_end: string | null
  is_active: boolean
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

export default function TeacherWorkSlotsPage() {
  const [slots, setSlots] = useState<WorkSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [teacherId, setTeacherId] = useState<string | null>(null)
  
  // Form state
  const [dayOfWeek, setDayOfWeek] = useState<number>(1) // Monday default
  const [slotStart, setSlotStart] = useState('09:00')
  const [slotEnd, setSlotEnd] = useState('17:00')
  const [hasBreak, setHasBreak] = useState(false)
  const [breakStart, setBreakStart] = useState('13:00')
  const [breakEnd, setBreakEnd] = useState('14:00')
  
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    const fetchTeacherAndSlots = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) return

        setTeacherId(session.user.id)

        const { data, error } = await supabase
          .from('teacher_work_slots')
          .select('*')
          .eq('teacher_id', session.user.id)
          .order('day_of_week', { ascending: true })
          .order('slot_start', { ascending: true })

        if (error) throw error
        setSlots(data || [])
      } catch (err) {
        console.error('Error fetching work slots:', err)
        setErrorMsg('Failed to load work slots.')
      } finally {
        setLoading(false)
      }
    }

    fetchTeacherAndSlots()
  }, [])

  const validateAndAddSlot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teacherId) return

    setErrorMsg('')
    setSuccessMsg('')

    // 1. Time conversion & basic checks
    const parseTime = (t: string) => {
      const [h, m] = t.split(':').map(Number)
      return h * 60 + m
    }

    const startMin = parseTime(slotStart)
    const endMin = parseTime(slotEnd)

    if (startMin >= endMin) {
      setErrorMsg('Slot start time must be before the end time.')
      return
    }

    let bStartMin: number | null = null
    let bEndMin: number | null = null

    if (hasBreak) {
      bStartMin = parseTime(breakStart)
      bEndMin = parseTime(breakEnd)

      if (bStartMin >= bEndMin) {
        setErrorMsg('Break start time must be before the break end time.')
        return
      }

      if (bStartMin < startMin || bEndMin > endMin) {
        setErrorMsg('Break times must fall completely inside the work slot hours.')
        return
      }
    }

    // 2. Overlap validation (local check before inserting)
    const daySlots = slots.filter(s => s.day_of_week === dayOfWeek)
    const overlaps = daySlots.some(s => {
      const existingStart = parseTime(s.slot_start.slice(0, 5))
      const existingEnd = parseTime(s.slot_end.slice(0, 5))
      return startMin < existingEnd && endMin > existingStart
    })

    if (overlaps) {
      setErrorMsg('This slot overlaps with an existing availability slot on the same day.')
      return
    }

    // 3. Save to database
    setSaving(true)
    try {
      const newSlot = {
        teacher_id: teacherId,
        day_of_week: dayOfWeek,
        slot_start: `${slotStart}:00`,
        slot_end: `${slotEnd}:00`,
        break_start: hasBreak ? `${breakStart}:00` : null,
        break_end: hasBreak ? `${breakEnd}:00` : null,
        is_active: true
      }

      const { data, error } = await supabase
        .from('teacher_work_slots')
        .insert([newSlot])
        .select()

      if (error) throw error

      if (data) {
        setSlots(prev => [...prev, data[0] as WorkSlot].sort((a, b) => {
          if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week
          return parseTime(a.slot_start) - parseTime(b.slot_start)
        }))
        setSuccessMsg('Availability slot added successfully.')
        setHasBreak(false)
      }
    } catch (err) {
      const error = err as Error
      console.error('Error adding slot:', error)
      setErrorMsg(error.message || 'Failed to save availability slot.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSlot = async (id: string) => {
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const { error } = await supabase
        .from('teacher_work_slots')
        .delete()
        .eq('id', id)

      if (error) throw error

      setSlots(prev => prev.filter(s => s.id !== id))
      setSuccessMsg('Slot removed successfully.')
    } catch (err) {
      console.error('Error deleting slot:', err)
      setErrorMsg('Failed to remove the slot.')
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
        <h1 className="text-3xl font-bold tracking-tight text-white">Work Slots & Availability</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Define your recurring weekly teaching availability and set breaks to prevent double-bookings.
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
        {/* Slot Creation Form */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md h-fit">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Plus className="h-5 w-5 text-emerald-400" /> Add Availability
          </h2>

          <form onSubmit={validateAndAddSlot} className="space-y-4">
            {/* Day selector */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Day of the Week</label>
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

            {/* Time windows */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Start Time</label>
                <input
                  type="time"
                  required
                  value={slotStart}
                  onChange={(e) => setSlotStart(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/25 py-2.5 px-3.5 text-sm text-white outline-none focus:border-emerald-500/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">End Time</label>
                <input
                  type="time"
                  required
                  value={slotEnd}
                  onChange={(e) => setSlotEnd(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/25 py-2.5 px-3.5 text-sm text-white outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            {/* Break option */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="hasBreak"
                checked={hasBreak}
                onChange={(e) => setHasBreak(e.target.checked)}
                className="h-4 w-4 rounded border-white/10 bg-black/20 text-emerald-500 focus:ring-emerald-500/30"
              />
              <label htmlFor="hasBreak" className="text-sm font-medium text-zinc-300 select-none cursor-pointer">
                Include lunch/break slot
              </label>
            </div>

            {hasBreak && (
              <div className="grid grid-cols-2 gap-4 border-l border-emerald-500/30 pl-4 py-1 space-y-0.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Break Start</label>
                  <input
                    type="time"
                    required
                    value={breakStart}
                    onChange={(e) => setBreakStart(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/25 py-2 px-3 text-sm text-white outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Break End</label>
                  <input
                    type="time"
                    required
                    value={breakEnd}
                    onChange={(e) => setBreakEnd(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/25 py-2 px-3 text-sm text-white outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-semibold text-white transition-all duration-150 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Save Availability
            </button>
          </form>
        </div>

        {/* Slots Overview List */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md lg:col-span-2">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-400" /> Active Schedule
          </h2>

          {slots.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-sm">
              No availability slots created yet. Fill the form to add availability.
            </div>
          ) : (
            <div className="space-y-4">
              {DAYS.map((dayName, dayIdx) => {
                const daySlots = slots.filter(s => s.day_of_week === dayIdx)
                if (daySlots.length === 0) return null

                return (
                  <div key={dayIdx} className="rounded-xl border border-white/5 bg-black/20 p-4 space-y-3">
                    <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
                      {dayName}
                    </h3>
                    
                    <div className="grid gap-3 sm:grid-cols-2">
                      {daySlots.map((slot) => (
                        <div key={slot.id} className="flex items-center justify-between rounded-lg bg-white/[0.02] border border-white/5 p-3 hover:border-white/10 transition-colors">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-sm font-semibold text-white">
                              <Clock className="h-4 w-4 text-zinc-400" />
                              {slot.slot_start.slice(0, 5)} - {slot.slot_end.slice(0, 5)}
                            </div>
                            {slot.break_start && (
                              <p className="text-[11px] text-zinc-400 italic">
                                Lunch break: {slot.break_start.slice(0, 5)} - {slot.break_end?.slice(0, 5)}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteSlot(slot.id)}
                            className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
