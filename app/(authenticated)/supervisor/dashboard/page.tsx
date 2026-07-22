'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { 
  Bell, 
  User, 
  Users, 
  TrendingUp, 
  LogOut, 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  UserMinus, 
  Download, 
  Inbox, 
  ShieldAlert, 
  ArrowRight, 
  Search, 
  FileText,
  Sparkles,
  Loader2,
  Radio,
  Video,
  Clock,
  AlertTriangle,
  Play,
  Calendar,
  UserPlus
} from 'lucide-react'
import BackToFounderBanner from '@/components/BackToFounderBanner'
import NotificationBell from '@/components/NotificationBell'

// --- Interfaces ---

interface AdmissionRequestMock {
  id: string
  studentName: string
  courseName: string
  type: '1:1' | 'Group'
  submissionDate: string
  genderPreference?: string
  timezone?: string
  preferredTimeSlot?: string
  availableDays?: string[]
  yearLevel?: string
  status?: string
  assignedTeacher?: string
}

// --- Interfaces ---

interface TeacherMock {
  id: string
  name: string
  course: string
  attendanceRate: number
  punctualityRate: number
  status?: 'Active' | 'Pending Director Approval'
}

interface StudentMock {
  id: string
  name: string
  course: string
  attendanceRate: number
  status: 'Good' | 'Warning' | 'Critical'
}

interface DisputeMock {
  id: string
  teacherName: string
  studentName: string
  date: string
  description: string
  status: 'Pending' | 'Resolved'
}

interface ChangeRequestMock {
  id: string
  studentName: string
  currentTeacher: string
  course: string
  reason: string
}

interface GroupClassMock {
  id: string
  name: string
  teacherName: string
  enrollmentCount: number
  maxStudents: number
  schedule: string
}

interface AlertMock {
  id: string
  category: string
  description: string
  targetTab: 'attendance' | 'disputes' | 'changes' | 'classes' | 'disciplinary' | 'reports'
  resolved?: boolean
}

interface MonthlyReportMock {
  id: string
  title: string
  date: string
  size: string
}

interface TeacherScheduleItem {
  id: string
  studentName: string
  courseName: string
  scheduledTime: string
  status: 'completed' | 'live' | 'overdue' | 'upcoming' | 'leave'
  lessonNotes?: string
  leaveReason?: string
}

interface TeacherLiveMonitorMock {
  id: string
  name: string
  program: string
  gender: string
  avatar: string
  currentStatus: 'in_class' | 'idle' | 'leave'
  activeStudent?: string
  activeCourse?: string
  meetingUrl?: string
  schedules: TeacherScheduleItem[]
}

const INITIAL_TEACHER_MONITOR_DATA: TeacherLiveMonitorMock[] = [
  {
    id: 'tch-1',
    name: 'Ustadh Ahmad',
    program: '1:1 & Tajweed Faculty',
    gender: 'Male',
    avatar: 'UA',
    currentStatus: 'in_class',
    activeStudent: 'Tariq Mahmood',
    activeCourse: 'Applied Tajweed (Basic)',
    schedules: [
      {
        id: 'sch-1',
        studentName: 'Ahmed Bilal',
        courseName: 'Applied Tajweed (Basic)',
        scheduledTime: '13:00 - 13:30',
        status: 'completed',
        lessonNotes: 'Makhraj of letters corrected: Tajweed on letter [ق] practiced with Surah Al-Fatiha.'
      },
      {
        id: 'sch-2',
        studentName: 'Tariq Mahmood',
        courseName: 'Applied Tajweed (Basic)',
        scheduledTime: '14:00 - 14:30',
        status: 'live'
      },
      {
        id: 'sch-3',
        studentName: 'Omar Farooq',
        courseName: 'Quran Reading (Nazra)',
        scheduledTime: '14:30 - 15:00',
        status: 'overdue'
      },
      {
        id: 'sch-4',
        studentName: 'Zaynul Haroon',
        courseName: 'Arabic Grammar (Sarf & Nahw)',
        scheduledTime: '18:00 - 18:30',
        status: 'upcoming'
      },
      {
        id: 'sch-5',
        studentName: 'Bilal Siddiqui',
        courseName: 'Applied Tajweed (Basic)',
        scheduledTime: '19:00 - 19:30',
        status: 'upcoming'
      }
    ]
  },
  {
    id: 'tch-2',
    name: 'Ustadha Mariam',
    program: '1:1 Female Faculty',
    gender: 'Female',
    avatar: 'UM',
    currentStatus: 'idle',
    schedules: [
      {
        id: 'sch-6',
        studentName: 'Sara Bilal',
        courseName: 'Dars-e-Nizami Year 1',
        scheduledTime: '10:00 - 10:30',
        status: 'completed',
        lessonNotes: 'Completed Nahw Mir Chapter 3 exercises with full syntax tree.'
      },
      {
        id: 'sch-7',
        studentName: 'Fatima Zahra',
        courseName: 'Quran Reading (Nazra)',
        scheduledTime: '18:30 - 19:00',
        status: 'upcoming'
      },
      {
        id: 'sch-8',
        studentName: 'Ayesha Malik',
        courseName: '40 Hadith Memorization',
        scheduledTime: '19:30 - 20:00',
        status: 'upcoming'
      }
    ]
  },
  {
    id: 'tch-3',
    name: 'Qari Shahid',
    program: '1:1 Male Faculty',
    gender: 'Male',
    avatar: 'QS',
    currentStatus: 'idle',
    schedules: [
      {
        id: 'sch-9',
        studentName: 'Suhail Khan',
        courseName: 'Quran Memorization (Hifz)',
        scheduledTime: '11:00 - 11:30',
        status: 'completed',
        lessonNotes: 'Juz 30 revision completed cleanly.'
      },
      {
        id: 'sch-10',
        studentName: 'Zohaib Ahmed',
        courseName: 'Applied Tajweed (Basic)',
        scheduledTime: '15:00 - 15:30',
        status: 'leave',
        leaveReason: 'Approved Excused Leave — Personal Emergency (Substitute Assigned)'
      }
    ]
  },
  {
    id: 'tch-4',
    name: 'Sana Javed',
    program: '1:1 Female Faculty',
    gender: 'Female',
    avatar: 'SJ',
    currentStatus: 'idle',
    schedules: [
      {
        id: 'sch-11',
        studentName: 'Rania Regular',
        courseName: 'Quran Reading with Tajweed',
        scheduledTime: '19:00 - 19:30',
        status: 'upcoming'
      }
    ]
  }
]

const MONTHLY_REPORTS: MonthlyReportMock[] = [
  { id: 'rep-01', title: 'June 2026 — Supervisor Summary Report', date: '2026-06-20', size: '1.2 MB' },
  { id: 'rep-02', title: 'May 2026 — Supervisor Summary Report', date: '2026-05-20', size: '1.4 MB' },
  { id: 'rep-03', title: 'April 2026 — Supervisor Summary Report', date: '2026-05-20', size: '1.1 MB' }
]

export default function SupervisorDashboard() {
  const [activeTab, setActiveTab] = useState<'live-monitor' | 'attendance' | 'disputes' | 'changes' | 'classes' | 'disciplinary' | 'reports'>('live-monitor')
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('tch-1')
  const [scheduleFilter, setScheduleFilter] = useState<'all' | 'overdue' | 'live' | 'upcoming' | 'completed' | 'leave'>('all')
  const [teacherMonitorData, setTeacherMonitorData] = useState<TeacherLiveMonitorMock[]>(INITIAL_TEACHER_MONITOR_DATA)
  
  const [admissions, setAdmissions] = useState<AdmissionRequestMock[]>([])
  
  // App States
  const [teachers, setTeachers] = useState<TeacherMock[]>([])
  const [students, setStudents] = useState<StudentMock[]>([])
  const [disputes, setDisputes] = useState<any[]>([])
  const [changeRequests, setChangeRequests] = useState<any[]>([])
  const [groupClasses, setGroupClasses] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Feedback Notifications
  const [successBanner, setSuccessBanner] = useState<string | null>(null)

  // Alerts Panel UI
  const [showAlertPanel, setShowAlertPanel] = useState(false)

  // Disputes decision state
  const [activeDisputeId, setActiveDisputeId] = useState<string | null>(null)
  const [disputeNotes, setDisputeNotes] = useState('')

  // Transfer student form state
  const [transferStudentId, setTransferStudentId] = useState('')
  const [transferDestinationClassId, setTransferDestinationClassId] = useState('')

  // Disciplinary Actions states
  const [teacherSearch, setTeacherSearch] = useState('')
  const [studentSearch, setStudentSearch] = useState('')

  // Modals configurations
  const [modalType, setModalType] = useState<'remove-teacher' | 'suspend-student' | 'remove-student' | null>(null)
  const [targetEntityId, setTargetEntityId] = useState<string | null>(null)
  const [targetEntityName, setTargetEntityName] = useState('')
  const [disciplinaryNotes, setDisciplinaryNotes] = useState('')

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch Attendance Data
      const attdRes = await fetch('/api/supervisor/attendance')
      if (!attdRes.ok) throw new Error('Failed to fetch attendance data')
      const attdData = await attdRes.json()
      setTeachers(attdData.teachers.map((t: any) => ({
        id: t.id,
        name: t.full_name,
        course: t.teacher_type,
        attendanceRate: t.attendancePercent,
        punctualityRate: t.punctualityPercent,
        status: t.status
      })))
      setStudents(attdData.students.map((s: any) => ({
        id: s.id,
        name: s.full_name,
        course: s.course,
        attendanceRate: s.attendancePercent,
        status: s.attendancePercent < 75 ? 'Critical' : s.attendancePercent < 90 ? 'Warning' : 'Good'
      })))

      // Fetch Disputes
      const dispRes = await fetch('/api/supervisor/disputes')
      if (dispRes.ok) {
        const dispData = await dispRes.json()
        const leaveItems = (dispData.leaveDisputes || []).map((l: any) => ({
          id: l.id,
          type: 'leave',
          teacherName: l.role === 'teacher' ? l.requesterName : 'N/A',
          studentName: l.role === 'student' ? l.requesterName : 'N/A',
          date: `${l.startDate} to ${l.endDate}`,
          description: `Leave request reason: "${l.reason}"`,
          status: 'Pending'
        }))
        const makeupItems = (dispData.makeupDisputes || []).map((m: any) => ({
          id: m.id,
          type: 'makeup',
          teacherName: m.teacherName,
          studentName: m.studentName,
          date: m.proposedDate,
          description: `Makeup Class Request at ${m.proposedTime}`,
          status: 'Pending'
        }))
        setDisputes([...leaveItems, ...makeupItems])
      }

      // Fetch Teacher Changes
      const chgRes = await fetch('/api/supervisor/teacher-changes')
      if (chgRes.ok) {
        const chgData = await chgRes.json()
        setChangeRequests(chgData.map((r: any) => ({
          id: r.id,
          studentName: r.studentName,
          currentTeacher: r.currentTeacher,
          course: r.course,
          reason: r.reason
        })))
      }

      // Fetch Group Classes
      const clsRes = await fetch('/api/supervisor/group-classes')
      if (clsRes.ok) {
        const clsData = await clsRes.json()
        setGroupClasses(clsData.map((c: any) => ({
          id: c.id,
          name: c.class_name,
          teacherName: c.teacher_name,
          enrollmentCount: c.enrolled_count,
          maxStudents: c.max_capacity,
          schedule: `Year level ${c.year_level} | ${c.course_title}`,
          enrolled_students: c.enrolled_students
        })))
      }

      // Fetch Alerts
      const altRes = await fetch('/api/supervisor/alerts')
      if (altRes.ok) {
        const altData = await altRes.json()
        setAlerts(altData)
      }

      // Fetch Live Monitor Real DB Data
      const liveRes = await fetch('/api/supervisor/live-monitor')
      if (liveRes.ok) {
        const liveData = await liveRes.json()
        if (liveData.teachers && Array.isArray(liveData.teachers) && liveData.teachers.length > 0) {
          const mapped = liveData.teachers.map((t: any) => ({
            id: t.id,
            name: t.name,
            program: t.type || '1:1 Faculty',
            gender: 'Faculty',
            avatar: t.name ? t.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'T',
            currentStatus: t.status === 'in_session' ? 'in_class' : t.status,
            activeStudent: t.activeClass?.studentName,
            activeCourse: t.activeClass?.course,
            meetingUrl: t.activeClass?.meetingUrl,
            schedules: (t.schedules || []).map((s: any) => ({
              id: s.id,
              studentName: s.studentName,
              courseName: s.course,
              scheduledTime: s.scheduledTime,
              status: s.status,
              lessonNotes: s.summary,
              leaveReason: s.leaveReason,
              meetingUrl: s.meetingUrl
            }))
          }))
          setTeacherMonitorData(mapped)
          if (!selectedTeacherId || !mapped.some((m: any) => m.id === selectedTeacherId)) {
            setSelectedTeacherId(mapped[0].id)
          }
        }
      }

    } catch (err: any) {
      console.error(err)
      setError(err.message || 'An error occurred loading live supervisor metrics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const saved = localStorage.getItem('vz_admissions')
    if (saved) {
      try {
        setAdmissions(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    }
    fetchData()
  }, [])

  const pendingApprovals = admissions.filter(a => a.type === '1:1' && a.status === 'Pending Supervisor Approval')

  const handleApproveEnrollment = (id: string) => {
    const updated = admissions.map(a => {
      if (a.id === id) {
        return { ...a, status: 'Trial Started' }
      }
      return a
    })
    setAdmissions(updated)
    localStorage.setItem('vz_admissions', JSON.stringify(updated))
    setSuccessBanner('Enrollment request approved successfully. Student is now set to TRIAL status.')
  }

  const handleDeclineEnrollment = (id: string) => {
    const updated = admissions.map(a => {
      if (a.id === id) {
        return { ...a, status: 'Declined' }
      }
      return a
    })
    setAdmissions(updated)
    localStorage.setItem('vz_admissions', JSON.stringify(updated))
    setSuccessBanner('Enrollment request declined.')
  }

  // --- Handlers ---

  const handleDisputeResolve = async (actionType: 'Approved' | 'Declined' | 'Resolved') => {
    if (!activeDisputeId) return
    const dispute = disputes.find(d => d.id === activeDisputeId)
    if (!dispute) return

    const action = actionType === 'Declined' ? 'rejected' : 'approved'

    try {
      setLoading(true)
      const res = await fetch('/api/supervisor/disputes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: activeDisputeId,
          request_type: dispute.type,
          action,
          notes: disputeNotes
        })
      })
      if (!res.ok) throw new Error('Failed to resolve dispute')

      setSuccessBanner(`Dispute resolved as [${actionType}] successfully. Notes logged.`)
      setActiveDisputeId(null)
      setDisputeNotes('')
      await fetchData()
    } catch (err: any) {
      alert(err.message)
      setLoading(false)
    }
  }

  const handleApproveTeacherChange = async (id: string, studentName: string) => {
    try {
      setLoading(true)
      const res = await fetch('/api/supervisor/teacher-changes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: id,
          action: 'approved'
        })
      })
      if (!res.ok) throw new Error('Failed to approve change request')
      setSuccessBanner(`Teacher change request approved for ${studentName}. Reassignment will be executed by Registrar shortly.`)
      await fetchData()
    } catch (err: any) {
      alert(err.message)
      setLoading(false)
    }
  }

  const handleDeclineTeacherChange = async (id: string, studentName: string) => {
    try {
      setLoading(true)
      const res = await fetch('/api/supervisor/teacher-changes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: id,
          action: 'rejected'
        })
      })
      if (!res.ok) throw new Error('Failed to decline change request')
      setSuccessBanner(`Teacher change request for ${studentName} declined.`)
      await fetchData()
    } catch (err: any) {
      alert(err.message)
      setLoading(false)
    }
  }

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!transferStudentId || !transferDestinationClassId) return

    const groupEnrolledStudents = groupClasses.flatMap((gc: any) => 
      (gc.enrolled_students || []).map((es: any) => ({
        student_id: es.student_id,
        student_name: es.student_name,
        class_id: gc.id,
        class_name: gc.name
      }))
    )

    const match = groupEnrolledStudents.find((x: any) => x.student_id === transferStudentId)
    if (!match) return

    const destClass = groupClasses.find((c: any) => c.id === transferDestinationClassId)
    if (!destClass) return

    if (destClass.enrollmentCount >= destClass.maxStudents) {
      alert('Error: The destination class is already full.')
      return
    }

    try {
      setLoading(true)
      const res = await fetch('/api/supervisor/group-classes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: transferStudentId,
          from_class_id: match.class_id,
          to_class_id: transferDestinationClassId
        })
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to transfer student')

      setSuccessBanner(`Student successfully transferred to ${destClass.name}.`)
      setTransferStudentId('')
      setTransferDestinationClassId('')
      await fetchData()
    } catch (err: any) {
      alert(err.message)
      setLoading(false)
    }
  }

  // --- Disciplinary Modal Action Finalizers ---

  const handleConfirmDisciplinary = async () => {
    if (!targetEntityId || !disciplinaryNotes) return

    let action = ''
    let targetType = ''
    if (modalType === 'remove-teacher') {
      action = 'recommend_removal'
      targetType = 'teacher'
    } else if (modalType === 'suspend-student') {
      action = 'suspend'
      targetType = 'student'
    } else if (modalType === 'remove-student') {
      action = 'remove'
      targetType = 'student'
    }

    try {
      setLoading(true)
      const res = await fetch('/api/supervisor/disciplinary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_id: targetEntityId,
          target_type: targetType,
          action,
          reason: disciplinaryNotes
        })
      })
      if (!res.ok) throw new Error('Failed to record disciplinary action')

      setSuccessBanner(`Disciplinary action recorded successfully. Details logged to security audit trails.`)
      setModalType(null)
      setTargetEntityId(null)
      setTargetEntityName('')
      setDisciplinaryNotes('')
      await fetchData()
    } catch (err: any) {
      alert(err.message)
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    document.cookie = 'vz_user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;'
    await supabase.auth.signOut()
    window.location.href = '/staff/login'
  }

  const selectedTeacher = teacherMonitorData.find(t => t.id === selectedTeacherId) || teacherMonitorData[0]
  const allOverdueSchedules = teacherMonitorData.flatMap(t => 
    t.schedules.filter(s => s.status === 'overdue').map(s => ({ ...s, teacherName: t.name, teacherId: t.id }))
  )

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <BackToFounderBanner />
      <div className="flex-1 flex bg-[#FAFAF7] text-zinc-800 font-sans relative overflow-hidden select-none">
      
      {/* ========================================== */}
      {/* PERSISTENT LEFT SIDEBAR                    */}
      {/* ========================================== */}
      <aside className="w-80 shrink-0 border-r border-zinc-200 bg-white flex flex-col h-full overflow-hidden z-20">
        {/* Brand header */}
        <div className="flex flex-col border-b border-zinc-100 px-6 py-5 justify-center shrink-0">
          <div className="flex items-center gap-3">
            <img src="/weblogo-01.png" alt="Virtual Zawiyah Logo" className="h-9 w-auto object-contain" />
            <div>
              <span className="text-sm font-bold font-serif text-zinc-900 leading-tight block">Virtual Zawiyah</span>
              <span className="block text-[9px] uppercase tracking-wider text-[#1B6B3A] font-bold leading-none mt-0.5">SUPERVISOR PORTAL</span>
            </div>
          </div>
        </div>

        {/* Portal Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          
          <button 
            onClick={() => {
              setActiveTab('live-monitor')
              setSuccessBanner(null)
            }}
            className={`flex items-center justify-between w-full p-3 rounded-xl text-xs font-bold transition-all duration-150 ${
              activeTab === 'live-monitor' 
                ? 'bg-[#1B6B3A]/10 text-[#1B6B3A] border-l-4 border-[#1B6B3A] shadow-xs' 
                : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Radio className="h-4.5 w-4.5 text-[#1B6B3A] animate-pulse" />
              <span>Live Teacher Monitor</span>
            </div>
            {teacherMonitorData.some(t => t.schedules.some(s => s.status === 'overdue')) && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-rose-600 text-white animate-pulse">
                Alarm
              </span>
            )}
          </button>

          <button 
            onClick={() => {
              setActiveTab('attendance')
              setSuccessBanner(null)
            }}
            className={`flex items-center justify-between w-full p-3 rounded-xl text-xs font-bold transition-all duration-150 ${
              activeTab === 'attendance' 
                ? 'bg-[#1B6B3A]/10 text-[#1B6B3A] border-l-4 border-[#1B6B3A] shadow-xs' 
                : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <TrendingUp className="h-4.5 w-4.5" />
              <span>Attendance Reports</span>
            </div>
          </button>

          <button 
            onClick={() => {
              setActiveTab('disputes')
              setSuccessBanner(null)
            }}
            className={`flex items-center justify-between w-full p-3 rounded-xl text-xs font-bold transition-all duration-150 ${
              activeTab === 'disputes' 
                ? 'bg-[#1B6B3A]/10 text-[#1B6B3A] border-l-4 border-[#1B6B3A] shadow-xs' 
                : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sliders className="h-4.5 w-4.5" />
              <span>Leave & Makeup Disputes</span>
            </div>
            {disputes.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'disputes' ? 'bg-[#1B6B3A] text-white' : 'bg-zinc-100 text-zinc-600'
              }`}>
                {disputes.length}
              </span>
            )}
          </button>

          <button 
            onClick={() => {
              setActiveTab('changes')
              setSuccessBanner(null)
            }}
            className={`flex items-center justify-between w-full p-3 rounded-xl text-xs font-bold transition-all duration-150 ${
              activeTab === 'changes' 
                ? 'bg-[#1B6B3A]/10 text-[#1B6B3A] border-l-4 border-[#1B6B3A] shadow-xs' 
                : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <User className="h-4.5 w-4.5" />
              <span>Teacher Change Requests</span>
            </div>
            {changeRequests.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'changes' ? 'bg-[#1B6B3A] text-white' : 'bg-zinc-100 text-zinc-600'
              }`}>
                {changeRequests.length}
              </span>
            )}
          </button>

          <button 
            onClick={() => {
              setActiveTab('classes')
              setSuccessBanner(null)
            }}
            className={`flex items-center justify-between w-full p-3 rounded-xl text-xs font-bold transition-all duration-150 ${
              activeTab === 'classes' 
                ? 'bg-[#1B6B3A]/10 text-[#1B6B3A] border-l-4 border-[#1B6B3A] shadow-xs' 
                : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="h-4.5 w-4.5" />
              <span>Group Class Management</span>
            </div>
          </button>

          <button 
            onClick={() => {
              setActiveTab('disciplinary')
              setSuccessBanner(null)
            }}
            className={`flex items-center justify-between w-full p-3 rounded-xl text-xs font-bold transition-all duration-150 ${
              activeTab === 'disciplinary' 
                ? 'bg-[#1B6B3A]/10 text-[#1B6B3A] border-l-4 border-[#1B6B3A] shadow-xs' 
                : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="h-4.5 w-4.5" />
              <span>Disciplinary Actions</span>
            </div>
          </button>

          <button 
            onClick={() => {
              setActiveTab('reports')
              setSuccessBanner(null)
            }}
            className={`flex items-center justify-between w-full p-3 rounded-xl text-xs font-bold transition-all duration-150 ${
              activeTab === 'reports' 
                ? 'bg-[#1B6B3A]/10 text-[#1B6B3A] border-l-4 border-[#1B6B3A] shadow-xs' 
                : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className="h-4.5 w-4.5" />
              <span>Monthly Reports</span>
            </div>
          </button>

        </nav>

        {/* User profile bottom bar */}
        <div className="border-t border-zinc-200 bg-zinc-50/50 p-4 shrink-0 mt-auto">
          <div className="flex items-center gap-3 mb-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-zinc-200 text-zinc-700 shadow-sm shrink-0 font-bold text-xs">
              SK
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-zinc-800 font-sans">
                Supervisor Kamal
              </p>
              <p className="truncate text-[10px] text-zinc-700">
                kamal.supervisor@virtualzawiyah.com
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white py-2 text-[10px] font-bold text-zinc-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 active:scale-[0.98] transition-all duration-150"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ========================================== */}
      {/* MAIN CONTAINER (HEADER + WORKSPACE)       */}
      {/* ========================================== */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Header bar */}
        <header className="h-16 shrink-0 bg-white border-b border-zinc-200 px-8 flex justify-between items-center z-10">
          <h2 className="text-md font-serif font-bold text-zinc-900 capitalize">
            {activeTab === 'live-monitor' && 'Live Teacher Operations & Monitor'}
            {activeTab === 'attendance' && 'Attendance & Performance Reports'}
            {activeTab === 'disputes' && 'Leave & Makeup Disputes Resolution'}
            {activeTab === 'changes' && 'Teacher Reassignment Requests'}
            {activeTab === 'classes' && 'Group Class Management Workspace'}
            {activeTab === 'disciplinary' && 'Disciplinary Action Center'}
            {activeTab === 'reports' && 'Monthly Performance Summary Sheets'}
          </h2>

          <NotificationBell />
        </header>

        {/* Workspace content window */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          
          {loading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-50">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 text-[#1B6B3A] animate-spin" />
                <span className="text-xs text-zinc-650 font-bold uppercase tracking-wider">Loading Live Data...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 flex items-start gap-2.5 rounded-2xl border border-rose-500/25 bg-rose-50/70 p-4 text-xs text-rose-800 shadow-xs max-w-4xl animate-fade-in">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <p className="font-bold">Error loading live metrics</p>
                <p className="mt-1 leading-relaxed">{error}</p>
                <button onClick={fetchData} className="mt-2 text-rose-700 underline font-semibold focus:outline-none">
                  Retry Loading
                </button>
              </div>
            </div>
          )}
          
          {/* Action Success Alert Notification banner */}
          {successBanner && (
            <div className="mb-6 flex items-start gap-2.5 rounded-2xl border border-emerald-500/25 bg-emerald-50/70 p-4 text-xs text-emerald-800 shadow-xs max-w-4xl animate-fade-in">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <p className="font-bold">Supervisor Action Recorded Successfully</p>
                <p className="mt-1 leading-relaxed">{successBanner}</p>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* TAB 0: LIVE TEACHER MONITOR                */}
          {/* ========================================== */}
          {activeTab === 'live-monitor' && (
            <div className="space-y-6 animate-fade-in">

              {/* OVERDUE CLASS ALARM BANNER */}
              {allOverdueSchedules.length > 0 && (
                <div className="bg-rose-50 border-2 border-rose-500/50 rounded-2xl p-5 shadow-lg animate-pulse flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-rose-600 text-white rounded-xl shadow-md shrink-0 mt-0.5">
                      <AlertTriangle className="h-6 w-6 animate-bounce" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold uppercase tracking-widest bg-rose-600 text-white px-2 py-0.5 rounded">
                          HIGH-PRIORITY OPERATIONAL ALARM
                        </span>
                        <span className="text-xs font-mono font-bold text-rose-700">
                          {allOverdueSchedules.length} Class(es) Overdue
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-rose-950 font-serif mt-1">
                        Class time has passed but session has NOT started!
                      </h3>
                      <div className="mt-2 space-y-1">
                        {allOverdueSchedules.map(ovd => (
                          <p key={ovd.id} className="text-xs text-rose-900 font-semibold flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-rose-600 shrink-0"></span>
                            <span>Student: <strong className="font-bold text-rose-950">{ovd.studentName}</strong> ({ovd.courseName}) with <strong className="font-bold text-rose-950">{ovd.teacherName}</strong></span>
                            <span className="font-mono bg-rose-200/80 px-2 py-0.5 rounded text-[10px] text-rose-950 font-bold">Scheduled {ovd.scheduledTime}</span>
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('changes')
                      setSuccessBanner('Switched to Teacher Change & Substitute Console to assign substitute coverage.')
                    }}
                    className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 shrink-0 flex items-center gap-1.5"
                  >
                    <UserPlus className="h-4 w-4" />
                    Assign Substitute Now
                  </button>
                </div>
              )}

              {/* MASTER-DETAIL LAYOUT: LEFT TEACHER ROSTER & RIGHT OPERATIONS PANEL */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* LEFT ROSTER (4 COLUMNS): ALL TEACHERS LIST */}
                <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-2xl p-5 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900 font-serif">Supervised Faculty</h3>
                      <p className="text-[10px] text-zinc-650 font-medium">Select a teacher to inspect live classroom</p>
                    </div>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded-full border border-zinc-200">
                      {teacherMonitorData.length} Teachers
                    </span>
                  </div>

                  {/* Teacher Cards */}
                  <div className="space-y-2.5">
                    {teacherMonitorData.map(teacher => {
                      const isSelected = selectedTeacherId === teacher.id
                      const hasOverdue = teacher.schedules.some(s => s.status === 'overdue')
                      const isInClass = teacher.currentStatus === 'in_class'

                      return (
                        <div
                          key={teacher.id}
                          onClick={() => setSelectedTeacherId(teacher.id)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-150 flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-[#1B6B3A]/5 border-[#1B6B3A] shadow-xs'
                              : hasOverdue
                              ? 'bg-rose-50/60 border-rose-300 hover:border-rose-400'
                              : 'bg-white border-zinc-200 hover:border-zinc-300'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                              isInClass 
                                ? 'bg-emerald-600 text-white shadow-xs' 
                                : hasOverdue 
                                ? 'bg-rose-600 text-white shadow-xs' 
                                : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                            }`}>
                              {teacher.avatar}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-zinc-900 truncate">{teacher.name}</h4>
                              <p className="text-[10px] text-zinc-650 truncate">{teacher.program}</p>
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            {hasOverdue ? (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-rose-600 text-white px-2 py-0.5 rounded-full animate-pulse">
                                <AlertTriangle className="h-3 w-3" /> Overdue
                              </span>
                            ) : isInClass ? (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping"></span> Live Class
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-600 border border-zinc-200 px-2 py-0.5 rounded-full">
                                Idle
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* RIGHT OPERATIONS PANEL (8 COLUMNS): SELECTED TEACHER LIVE MONITOR */}
                <div className="lg:col-span-8 space-y-6">

                  {selectedTeacher && (
                    <>
                      {/* REAL-TIME HERO CLASSROOM STATUS BANNER */}
                      <div className={`rounded-2xl border p-6 transition-all shadow-xs ${
                        selectedTeacher.currentStatus === 'in_class'
                          ? 'bg-gradient-to-r from-emerald-900 to-emerald-950 border-emerald-700 text-white'
                          : 'bg-white border-zinc-200 text-zinc-900'
                      }`}>
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {selectedTeacher.currentStatus === 'in_class' ? (
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full">
                                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                                  CLASSROOM CURRENTLY LIVE NOW
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-zinc-100 text-zinc-600 border border-zinc-200 px-2.5 py-1 rounded-full">
                                  <Clock className="h-3 w-3" />
                                  TEACHER NOT IN CLASS RIGHT NOW
                                </span>
                              )}
                              <span className="text-xs font-semibold opacity-80">
                                {selectedTeacher.program}
                              </span>
                            </div>

                            <h2 className="text-2xl font-serif font-bold mt-2">
                              {selectedTeacher.name}
                            </h2>

                            {selectedTeacher.currentStatus === 'in_class' ? (
                              <p className="text-xs text-emerald-200 font-sans leading-relaxed">
                                Currently conducting 1:1 Live Session with <strong className="text-white font-bold">{selectedTeacher.activeStudent}</strong> ({selectedTeacher.activeCourse}).
                              </p>
                            ) : (
                              <p className="text-xs text-zinc-650 font-sans leading-relaxed">
                                Instructor is currently idle. Next class is scheduled on their daily roster.
                              </p>
                            )}
                          </div>

                          {selectedTeacher.currentStatus === 'in_class' && (
                            <button
                              onClick={() => {
                                const url = selectedTeacher.meetingUrl || `https://meet.virtualzawiyah.com/VZ-${selectedTeacher.id}-live`
                                window.open(url, '_blank')
                              }}
                              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
                            >
                              <Video className="h-4 w-4" />
                              Join Observer View
                            </button>
                          )}
                        </div>
                      </div>

                      {/* CATEGORIZED SCHEDULE FILTERS & BREAKDOWN */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-[#1B6B3A]" />
                            Today&apos;s Class Schedule Breakdown
                          </h3>

                          {/* Filter Pills */}
                          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200 text-[10px] font-bold">
                            {(['all', 'overdue', 'live', 'upcoming', 'completed', 'leave'] as const).map(f => (
                              <button
                                key={f}
                                onClick={() => setScheduleFilter(f)}
                                className={`px-2.5 py-1 rounded-lg capitalize transition-all ${
                                  scheduleFilter === f
                                    ? 'bg-white text-zinc-900 shadow-xs border border-zinc-250 font-extrabold'
                                    : 'text-zinc-600 hover:text-zinc-900'
                                }`}
                              >
                                {f}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Schedule Items List */}
                        <div className="space-y-3">
                          {selectedTeacher.schedules
                            .filter(sch => scheduleFilter === 'all' || sch.status === scheduleFilter)
                            .map(sch => (
                              <div
                                key={sch.id}
                                className={`p-4 rounded-2xl border transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                                  sch.status === 'overdue'
                                    ? 'bg-rose-50/80 border-rose-300'
                                    : sch.status === 'live'
                                    ? 'bg-emerald-50/80 border-emerald-300'
                                    : sch.status === 'completed'
                                    ? 'bg-white border-zinc-200'
                                    : sch.status === 'leave'
                                    ? 'bg-amber-50/70 border-amber-200'
                                    : 'bg-zinc-50/50 border-zinc-200'
                                }`}
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                                      sch.status === 'overdue'
                                        ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                                        : sch.status === 'live'
                                        ? 'bg-emerald-600 text-white border-emerald-600'
                                        : sch.status === 'completed'
                                        ? 'bg-zinc-100 text-zinc-700 border-zinc-200'
                                        : sch.status === 'leave'
                                        ? 'bg-amber-100 text-amber-900 border-amber-200'
                                        : 'bg-blue-50 text-blue-800 border-blue-200'
                                    }`}>
                                      {sch.status === 'overdue' && '🚨 OVERDUE / UNSTARTED'}
                                      {sch.status === 'live' && '🟢 LIVE NOW'}
                                      {sch.status === 'completed' && '✅ COMPLETED'}
                                      {sch.status === 'upcoming' && '🔵 UPCOMING TODAY'}
                                      {sch.status === 'leave' && '🟡 APPROVED LEAVE'}
                                    </span>
                                    <span className="text-xs font-mono font-bold text-zinc-700">
                                      {sch.scheduledTime}
                                    </span>
                                  </div>

                                  <h4 className="text-sm font-bold text-zinc-900">{sch.studentName}</h4>
                                  <p className="text-xs text-zinc-650">{sch.courseName}</p>

                                  {sch.lessonNotes && (
                                    <p className="text-[11px] text-zinc-600 bg-zinc-100 p-2.5 rounded-xl border border-zinc-200 mt-2 italic font-sans leading-relaxed">
                                      &ldquo;{sch.lessonNotes}&rdquo;
                                    </p>
                                  )}

                                  {sch.leaveReason && (
                                    <p className="text-[11px] text-amber-900 bg-amber-100/60 p-2 rounded-lg border border-amber-200 mt-2 font-medium">
                                      {sch.leaveReason}
                                    </p>
                                  )}
                                </div>

                                {/* Actions */}
                                <div className="shrink-0 flex items-center gap-2">
                                  {sch.status === 'overdue' && (
                                    <button
                                      onClick={() => {
                                        setActiveTab('changes')
                                        setSuccessBanner(`Opened substitute reassignment request for ${sch.studentName}.`)
                                      }}
                                      className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
                                    >
                                      <UserPlus className="h-3.5 w-3.5" />
                                      Reassign Substitute
                                    </button>
                                  )}
                                  {sch.status === 'live' && (
                                    <button
                                      onClick={() => alert(`Entering live classroom observer view for ${sch.studentName}...`)}
                                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
                                    >
                                      <Video className="h-3.5 w-3.5" />
                                      Join Class
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}

                          {selectedTeacher.schedules.filter(sch => scheduleFilter === 'all' || sch.status === scheduleFilter).length === 0 && (
                            <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center text-xs text-zinc-450 italic">
                              No classes matching filter &ldquo;{scheduleFilter}&rdquo; for this teacher today.
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                </div>

              </div>

            </div>
          )}

          {/* ========================================== */}
          {/* TAB 1: ATTENDANCE REPORTS                  */}
          {/* ========================================== */}
          {activeTab === 'attendance' && (
            <div className="space-y-8 animate-fade-in">
              
              {/* Pending Enrollment Approvals section */}
              {pendingApprovals.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-amber-800 flex items-center gap-2">
                      <Sparkles className="h-4.5 w-4.5 animate-pulse text-amber-600" />
                      Pending Enrollment Approvals
                    </h3>
                    <p className="text-[11px] text-amber-900 mt-0.5">Admissions awaiting Supervisor authorization for 1:1 matchmaker slots.</p>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    {pendingApprovals.map(appr => (
                      <div key={appr.id} className="bg-white border border-amber-200 rounded-xl p-4 shadow-sm flex flex-col justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-xs font-bold text-zinc-900">{appr.studentName}</h4>
                              <p className="text-[10px] text-zinc-650">{appr.courseName}</p>
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full">
                              Pending Approval
                            </span>
                          </div>
                          <div className="text-[10px] text-zinc-500 space-y-1 bg-zinc-50/50 p-2 rounded-lg border border-zinc-150">
                            <div>Teacher Recommended: <span className="font-semibold text-zinc-800">{appr.assignedTeacher || 'None'}</span></div>
                            <div>Preferred slot: <span className="font-semibold text-zinc-800">{appr.preferredTimeSlot || 'Not specified'}</span></div>
                            <div>Timezone: <span className="font-semibold text-zinc-800">{appr.timezone || 'Not specified'}</span></div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApproveEnrollment(appr.id)}
                            className="flex-1 py-1.5 bg-[#1B6B3A] text-white hover:bg-[#1B6B3A]/90 font-bold rounded-lg text-[10px] transition-all text-center"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleDeclineEnrollment(appr.id)}
                            className="flex-1 py-1.5 border border-zinc-250 text-zinc-700 hover:bg-zinc-50 font-bold rounded-lg text-[10px] transition-all text-center"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Faculty Section */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800">
                    Faculty Attendance Ledger
                  </h3>
                  <p className="text-[11px] text-zinc-700 mt-0.5">Overview of supervised teacher punctuality and presence ratings.</p>
                </div>

                <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 uppercase text-[10px] tracking-wider font-semibold">
                        <th className="p-4">Teacher</th>
                        <th className="p-4">Main Course Assignment</th>
                        <th className="p-4 text-right">Attendance Rate</th>
                        <th className="p-4 text-right">Punctuality Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {teachers.map(teacher => (
                        <tr key={teacher.id} className="hover:bg-zinc-50/30 transition-colors">
                          <td className="p-4 font-bold text-zinc-900">{teacher.name}</td>
                          <td className="p-4 text-zinc-800">{teacher.course}</td>
                          <td className="p-4 text-right font-mono font-bold">
                            <span className={teacher.attendanceRate < 85 ? 'text-red-600' : 'text-zinc-800'}>
                              {teacher.attendanceRate}%
                            </span>
                          </td>
                          <td className="p-4 text-right font-mono font-bold">
                            <span className={teacher.punctualityRate < 85 ? 'text-red-600' : 'text-zinc-800'}>
                              {teacher.punctualityRate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Students Section */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800">
                    Student Roster Attendance (Sorted Lowest First)
                  </h3>
                  <p className="text-[11px] text-zinc-700 mt-0.5">Performance tracking showing low attendances first to enable direct supervisor focus.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[...students]
                    .sort((a, b) => a.attendanceRate - b.attendanceRate)
                    .map(student => (
                      <div 
                        key={student.id} 
                        className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs flex justify-between items-center"
                      >
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-zinc-900 truncate">{student.name}</h4>
                          <p className="text-[10px] text-zinc-700 truncate mt-0.5">{student.course}</p>
                          <p className="text-[9px] text-zinc-600 font-mono mt-1">{student.id}</p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`text-[10px] font-bold font-mono px-2.5 py-1 rounded-full border inline-block ${
                            student.status === 'Critical'
                              ? 'bg-rose-50 border-rose-100 text-rose-700'
                              : student.status === 'Warning'
                              ? 'bg-amber-50 border-amber-100 text-amber-700'
                              : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                          }`}>
                            {student.attendanceRate}% Attd
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

            </div>
          )}

          {/* ========================================== */}
          {/* TAB 2: LEAVE & MAKEUP DISPUTES             */}
          {/* ========================================== */}
          {activeTab === 'disputes' && (
            <div className="grid gap-6 lg:grid-cols-2 items-start animate-fade-in">
              
              {/* Disputes List */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800">
                  Escalated Leave & Makeup Dispute Tickets
                </h3>
                
                <div className="space-y-3">
                  {disputes.map(item => {
                    const isSelected = activeDisputeId === item.id
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setActiveDisputeId(item.id)
                          setDisputeNotes('')
                          setSuccessBanner(null)
                        }}
                        className={`rounded-2xl border p-5 transition-all cursor-pointer shadow-xs space-y-3 ${
                          isSelected 
                            ? 'border-[#1B6B3A] bg-[#1B6B3A]/5' 
                            : 'border-zinc-200 bg-white hover:border-zinc-300'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h4 className="text-xs font-bold text-[#1B6B3A] uppercase tracking-wider">Ticket: {item.id}</h4>
                            <p className="text-xs text-zinc-700 font-mono mt-0.5">Missed class: {item.date}</p>
                          </div>
                          <span className="text-[9px] font-bold text-rose-600 border border-rose-200 bg-rose-50 px-2 py-0.5 rounded uppercase tracking-wider">
                            Disputed
                          </span>
                        </div>

                        <p className="text-xs text-zinc-700 leading-relaxed font-sans">{item.description}</p>
                        
                        <div className="pt-2 border-t border-zinc-200 flex gap-4 text-[10px] text-zinc-800 font-medium">
                          <div>
                            <span className="text-zinc-700 block font-semibold uppercase text-[9px]">Teacher</span>
                            <span className="text-zinc-900 font-bold">{item.teacherName}</span>
                          </div>
                          <div>
                            <span className="text-zinc-700 block font-semibold uppercase text-[9px]">Student</span>
                            <span className="text-zinc-900 font-bold">{item.studentName}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {disputes.length === 0 && (
                    <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center space-y-2">
                      <Inbox className="h-8 w-8 text-zinc-300 mx-auto" />
                      <p className="text-xs text-zinc-600 italic">No disputed leave or makeup cases on record.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Resolution console */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800">
                  Supervisor Resolution Console
                </h3>

                {activeDisputeId ? (
                  <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-5 shadow-xs animate-fade-in">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                        Resolve Ticket {activeDisputeId}
                      </h4>
                      <p className="text-[11px] text-zinc-900 mt-0.5 font-semibold">Provide a professional justification. Your notes will be logged permanently.</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-2">
                          Decision Reasoning / Notes
                        </label>
                        <textarea
                          value={disputeNotes}
                          onChange={(e) => setDisputeNotes(e.target.value)}
                          placeholder="State reasoning based on system logs, teacher check-ins, or student complaints..."
                          rows={4}
                          required
                          className="w-full text-xs p-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] bg-zinc-50 focus:bg-white transition-all font-sans text-zinc-800 placeholder-zinc-500 font-medium"
                        />
                      </div>

                      <div className="grid gap-2 sm:grid-cols-3">
                        <button
                          onClick={() => handleDisputeResolve('Approved')}
                          disabled={!disputeNotes.trim()}
                          className={`py-2 px-3 font-bold rounded-xl text-[10px] text-white transition-all active:scale-[0.98] ${
                            disputeNotes.trim() ? 'bg-[#1B6B3A] hover:bg-[#1B6B3A]/90' : 'bg-zinc-300 text-zinc-500 cursor-not-allowed'
                          }`}
                        >
                          Approve Dispute
                        </button>
                        <button
                          onClick={() => handleDisputeResolve('Declined')}
                          disabled={!disputeNotes.trim()}
                          className={`py-2 px-3 font-bold rounded-xl text-[10px] text-white transition-all active:scale-[0.98] ${
                            disputeNotes.trim() ? 'bg-rose-600 hover:bg-rose-700' : 'bg-zinc-300 text-zinc-500 cursor-not-allowed'
                          }`}
                        >
                          Decline Dispute
                        </button>
                        <button
                          onClick={() => handleDisputeResolve('Resolved')}
                          disabled={!disputeNotes.trim()}
                          className={`py-2 px-3 font-bold rounded-xl text-[10px] text-white transition-all active:scale-[0.98] ${
                            disputeNotes.trim() ? 'bg-amber-600 hover:bg-amber-700' : 'bg-zinc-300 text-zinc-500 cursor-not-allowed'
                          }`}
                        >
                          Resolve & Split
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center text-zinc-600 space-y-2 shadow-xs">
                    <Sliders className="h-8 w-8 text-zinc-300 mx-auto" />
                    <p className="text-xs text-zinc-600 italic">Select an escalated dispute ticket from the roster to deploy action parameters.</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ========================================== */}
          {/* TAB 3: TEACHER CHANGE REQUESTS             */}
          {/* ========================================== */}
          {activeTab === 'changes' && (
            <div className="space-y-6 max-w-4xl animate-fade-in">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800">
                  Pending Regular Student Change Requests
                </h3>
                <p className="text-[11px] text-zinc-700 mt-0.5">Reviews submitted by regular students seeking re-assignment to alternative instructors.</p>
              </div>

              <div className="space-y-4">
                {changeRequests.map(item => (
                  <div key={item.id} className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-6">
                    <div className="min-w-0 space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="text-sm font-bold text-zinc-900">{item.studentName}</h4>
                        <span className="text-[9px] font-mono font-bold bg-[#1B6B3A]/10 text-[#1B6B3A] px-2 py-0.5 rounded border border-[#1B6B3A]/20">
                          {item.course}
                        </span>
                      </div>
                      
                      <div className="grid sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-zinc-600 block uppercase font-semibold">Current Teacher Assignment</span>
                          <span className="font-semibold text-zinc-800">{item.currentTeacher}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-600 block uppercase font-semibold">Reason for Reassignment</span>
                          <span className="text-zinc-800 italic font-sans font-medium">&quot;{item.reason}&quot;</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col gap-2 shrink-0 sm:min-w-28">
                      <button
                        onClick={() => handleApproveTeacherChange(item.id, item.studentName)}
                        className="flex-1 py-1.5 px-3 bg-[#1B6B3A] text-white hover:bg-[#1B6B3A]/90 font-bold rounded-lg text-[10px] transition-all active:scale-[0.98]"
                      >
                        Approve Request
                      </button>
                      <button
                        onClick={() => handleDeclineTeacherChange(item.id, item.studentName)}
                        className="flex-1 py-1.5 px-3 bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 font-bold rounded-lg text-[10px] transition-all active:scale-[0.98]"
                      >
                        Decline Request
                      </button>
                    </div>
                  </div>
                ))}

                {changeRequests.length === 0 && (
                  <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center space-y-2">
                    <Inbox className="h-8 w-8 text-zinc-300 mx-auto" />
                    <p className="text-xs text-zinc-600 italic">No teacher change requests pending currently.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* TAB 4: GROUP CLASS MANAGEMENT              */}
          {/* ========================================== */}
          {activeTab === 'classes' && (
            <div className="grid gap-6 lg:grid-cols-3 items-start animate-fade-in">
              
              {/* Classes list */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800">
                  Supervised Group Year-Batches
                </h3>
                
                <div className="space-y-3">
                  {groupClasses.map(c => (
                    <div key={c.id} className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs flex justify-between items-center gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2.5">
                          <h4 className="text-xs font-bold text-zinc-900">{c.name}</h4>
                          <span className="text-[9px] font-mono font-bold bg-zinc-100 text-zinc-700 px-1.5 rounded">
                            {c.id}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-700 mt-1">Teacher: <strong className="font-semibold text-zinc-700">{c.teacherName}</strong></p>
                        <p className="text-[10px] text-zinc-700 font-mono font-medium mt-0.5">Schedule: {c.schedule}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="block text-[11px] text-zinc-700 font-mono font-bold">
                          {c.enrollmentCount} / {c.maxStudents} Students
                        </span>
                        <div className="w-24 h-1.5 bg-zinc-100 rounded-full overflow-hidden mt-1.5 border border-zinc-200">
                          <div 
                            className="h-full bg-[#1B6B3A] rounded-full transition-all duration-300"
                            style={{ width: `${(c.enrollmentCount / c.maxStudents) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Move Student selector widget */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800">
                  Transfer Student Widget
                </h3>

                <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Move Class Enrollment</h4>
                    <p className="text-[10px] text-zinc-700 mt-0.5 font-sans">Transfer a student directly from their year level class to another year level class.</p>
                  </div>

                  <form onSubmit={handleTransferSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-2">
                        Select Student
                      </label>
                      <select
                        value={transferStudentId}
                        onChange={(e) => setTransferStudentId(e.target.value)}
                        required
                        className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-[#1B6B3A] focus:border-[#1B6B3A] text-zinc-800 font-medium"
                      >
                        <option value="">-- Choose Student --</option>
                        {groupClasses.flatMap((gc: any) => 
                          (gc.enrolled_students || []).map((es: any) => ({
                            student_id: es.student_id,
                            student_name: es.student_name,
                            class_name: gc.name
                          }))
                        ).map(s => (
                          <option key={s.student_id} value={s.student_id}>{s.student_name} ({s.class_name})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-2">
                        Destination Group Class
                      </label>
                      <select
                        value={transferDestinationClassId}
                        onChange={(e) => setTransferDestinationClassId(e.target.value)}
                        required
                        className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-[#1B6B3A] focus:border-[#1B6B3A] text-zinc-800 font-medium"
                      >
                        <option value="">-- Choose Destination --</option>
                        {groupClasses.map(c => (
                          <option key={c.id} value={c.id}>{c.name} ({c.teacherName}) - {c.enrollmentCount}/{c.maxStudents}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-[#1B6B3A] text-white hover:bg-[#1B6B3A]/90 font-bold rounded-xl text-xs transition-all active:scale-[0.98] shadow-xs"
                    >
                      Confirm Enrollment Transfer
                    </button>
                  </form>
                </div>
              </div>

            </div>
          )}

          {/* ========================================== */}
          {/* TAB 5: DISCIPLINARY ACTIONS                */}
          {/* ========================================== */}
          {activeTab === 'disciplinary' && (
            <div className="grid gap-6 lg:grid-cols-2 items-start animate-fade-in">
              
              {/* Supervised Teachers Roster */}
              <div className="space-y-4 bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
                <div className="flex justify-between items-center gap-4 flex-wrap">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                      Supervised Teacher Registry
                    </h3>
                    <p className="text-[10px] text-zinc-700 mt-0.5">Deploy removal orders on supervised faculty members.</p>
                  </div>
                  
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-800" />
                    <input 
                      type="text" 
                      placeholder="Search teacher..." 
                      value={teacherSearch}
                      onChange={(e) => setTeacherSearch(e.target.value)}
                      className="text-[11px] p-2 pl-8 rounded-lg border border-zinc-300 bg-zinc-50 w-44 focus:outline-none focus:ring-1 focus:ring-[#1B6B3A] text-zinc-800 placeholder-zinc-700 font-semibold"
                    />
                  </div>
                </div>

                <div className="divide-y divide-zinc-200 space-y-3 pt-2">
                  {teachers
                    .filter(t => t.name.toLowerCase().includes(teacherSearch.toLowerCase()))
                    .map(t => (
                      <div key={t.id} className="pt-3 first:pt-0 flex justify-between items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-zinc-900">{t.name}</h4>
                            {t.status === 'Pending Director Approval' && (
                              <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                Pending Director Approval
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-zinc-700 mt-0.5">{t.course} — <span className="font-mono text-zinc-600">{t.id}</span></p>
                        </div>
                        {t.status === 'Pending Director Approval' ? (
                          <span className="text-[10px] text-amber-750 font-bold italic py-2">
                            Recommended
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setModalType('remove-teacher')
                              setTargetEntityId(t.id)
                              setTargetEntityName(t.name)
                              setDisciplinaryNotes('')
                            }}
                            className="p-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors active:scale-95"
                            title="Recommend Removal"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  {teachers.filter(t => t.name.toLowerCase().includes(teacherSearch.toLowerCase())).length === 0 && (
                    <p className="text-[11px] text-zinc-600 font-medium italic text-center p-4">No teachers found matching query.</p>
                  )}
                </div>
              </div>

              {/* Student Roster */}
              <div className="space-y-4 bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
                <div className="flex justify-between items-center gap-4 flex-wrap">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                      Student Registry Ledger
                    </h3>
                    <p className="text-[10px] text-zinc-700 mt-0.5">Deploy suspension or removal actions on students.</p>
                  </div>
                  
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-800" />
                    <input 
                      type="text" 
                      placeholder="Search student..." 
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="text-[11px] p-2 pl-8 rounded-lg border border-zinc-300 bg-zinc-50 w-44 focus:outline-none focus:ring-1 focus:ring-[#1B6B3A] text-zinc-800 placeholder-zinc-700 font-semibold"
                    />
                  </div>
                </div>

                <div className="divide-y divide-zinc-200 space-y-3 pt-2">
                  {students
                    .filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()))
                    .map(s => (
                      <div key={s.id} className="pt-3 first:pt-0 flex justify-between items-center gap-4">
                        <div>
                          <h4 className="text-xs font-bold text-zinc-900">{s.name}</h4>
                          <p className="text-[10px] text-zinc-700 mt-0.5">{s.course} — <span className="font-mono text-zinc-600">{s.id}</span></p>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => {
                              setModalType('suspend-student')
                              setTargetEntityId(s.id)
                              setTargetEntityName(s.name)
                              setDisciplinaryNotes('')
                            }}
                            className="py-1 px-2.5 border border-amber-250 text-amber-700 hover:bg-amber-50 rounded-lg text-[9px] font-bold tracking-wider uppercase transition-colors active:scale-95"
                            title="Suspend Student"
                          >
                            Suspend
                          </button>
                          <button
                            onClick={() => {
                              setModalType('remove-student')
                              setTargetEntityId(s.id)
                              setTargetEntityName(s.name)
                              setDisciplinaryNotes('')
                            }}
                            className="p-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors active:scale-95"
                            title="Remove Student"
                          >
                            <UserMinus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  {students.filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase())).length === 0 && (
                    <p className="text-[11px] text-zinc-600 font-medium italic text-center p-4">No students found matching query.</p>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ========================================== */}
          {/* TAB 6: MONTHLY REPORTS                     */}
          {/* ========================================== */}
          {activeTab === 'reports' && (
            <div className="space-y-6 max-w-4xl animate-fade-in">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800">
                  Supervisor Summary Sheets Ledger
                </h3>
                <p className="text-[11px] text-zinc-700 mt-0.5">Download monthly consolidated reports regarding class operations and disputes.</p>
              </div>

              <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="divide-y divide-zinc-200">
                  {MONTHLY_REPORTS.map(rep => (
                    <div key={rep.id} className="p-4 flex justify-between items-center hover:bg-zinc-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-[#1B6B3A] shrink-0" />
                        <div>
                          <h4 className="text-xs font-bold text-zinc-900">{rep.title}</h4>
                          <p className="text-[10px] text-zinc-600 font-mono mt-0.5">Generated: {rep.date} — Size: {rep.size}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => alert(`Download started (placeholder for ${rep.title})`)}
                        className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-600 hover:text-zinc-900 transition-all active:scale-90 border border-zinc-200 shadow-xs"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>

      </div>

      {/* ========================================== */}
      {/* DISCIPLINARY CONFIRMATION MODALS           */}
      {/* ========================================== */}
      {modalType && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl shrink-0">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-950 font-serif">
                  {modalType === 'remove-teacher' && 'Recommend Teacher Removal'}
                  {modalType === 'suspend-student' && 'Issue Student Suspension'}
                  {modalType === 'remove-student' && 'Permanently Expel Student'}
                </h4>
                <p className="text-xs text-zinc-700 font-medium mt-1 leading-relaxed">
                  {modalType === 'remove-teacher' && `This will send a removal recommendation for ${targetEntityName} to the Academic Director for final approval.`}
                  {modalType === 'suspend-student' && `Are you sure you want to issue a temporary suspension for student ${targetEntityName}?`}
                  {modalType === 'remove-student' && `Are you sure you want to permanently expel student ${targetEntityName}? This will revoke class registries and portal credentials.`}
                </p>
              </div>
            </div>

            {/* Note text field */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-2">
                Reason / Decision Justification Notes
              </label>
              <textarea
                value={disciplinaryNotes}
                onChange={(e) => setDisciplinaryNotes(e.target.value)}
                placeholder="State the official grounds for this disciplinary action..."
                rows={3}
                required
                className="w-full text-xs p-3 rounded-xl border border-zinc-300 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-sans text-zinc-800 placeholder-zinc-500 font-medium"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2 pt-2 text-xs">
              <button
                onClick={() => setModalType(null)}
                className="py-2 px-4 border border-zinc-300 text-zinc-700 hover:bg-zinc-50 font-bold rounded-xl active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDisciplinary}
                disabled={!disciplinaryNotes.trim()}
                className={`py-2 px-4 font-bold rounded-xl active:scale-95 transition-all ${
                  disciplinaryNotes.trim() 
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm' 
                    : 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed'
                }`}
              >
                {modalType === 'remove-teacher' ? 'Recommend Removal' : 'Confirm Action'}
              </button>
            </div>

          </div>
        </div>
      )}

      </div>
    </div>
  )
}
