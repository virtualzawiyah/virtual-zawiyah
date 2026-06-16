import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Supabase credentials are missing.' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // 1. Get all teachers
    const { data: teachers, error: teacherError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'teacher')

    if (teacherError) throw teacherError
    if (!teachers || teachers.length === 0) {
      return NextResponse.json({ error: 'No teachers found in the system.' }, { status: 404 })
    }

    // 2. Get workload view records
    const { data: workloads, error: workloadError } = await supabase
      .from('teacher_weekly_workload')
      .select('*')

    if (workloadError) {
      console.warn('Workload view query failed, defaulting all workloads to 0:', workloadError.message)
    }

    interface WorkloadRecord {
      teacher_id: string
      weekly_slots_occupied: number
    }

    interface TeacherProfileRecord {
      id: string
      full_name: string
    }

    // 3. Map workloads (default to 0 for teachers not in the view)
    const workloadMap = new Map<string, number>()
    if (workloads) {
      (workloads as unknown as WorkloadRecord[]).forEach((w) => {
        workloadMap.set(w.teacher_id, Number(w.weekly_slots_occupied))
      })
    }

    const teacherWorkloads = (teachers as unknown as TeacherProfileRecord[]).map((t) => ({
      id: t.id,
      name: t.full_name,
      slots_occupied: workloadMap.get(t.id) || 0
    }))

    // 4. Sort ascending to find teacher with lowest workload
    teacherWorkloads.sort((a, b) => a.slots_occupied - b.slots_occupied)

    return NextResponse.json({
      status: 'success',
      suggested_teacher_id: teacherWorkloads[0].id,
      suggested_teacher_name: teacherWorkloads[0].name,
      workload_slots: teacherWorkloads[0].slots_occupied
    })
  } catch (err) {
    const error = err as Error
    console.error('Error in auto-assign API:', error)
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}
