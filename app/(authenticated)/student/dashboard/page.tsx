'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import NotificationBell from '@/components/NotificationBell'
import { 
  Users, 
  Clock, 
  Video, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Download, 
  FileText,
  CalendarCheck,
  ChevronDown,
  ChevronUp,
  LogOut,
  Loader2
} from 'lucide-react'

// ============================================================================
// ARCHITECTURAL NOTE FOR THE DATABASE DESIGN STEP:
// Sibling accounts share a single login, but fee/billing tracking must be per
// individual student, not per account. Each student record must carry its own
// independent fee/payment history, deferral status, and suspension status,
// completely separate from any siblings sharing the same login.
// ============================================================================

// --- Mock Datasets ---

interface LessonLogHifz {
  sabaq: string
  sabaqi: string
  manzil: string
  additionalNotes: string
  yesterdayReport: string
}

interface LessonLogStandard {
  topicCovered: string
  nextPlan: string
  feedback: string
}

interface LessonHistoryItem {
  id: string
  date: string
  course: string
  teacherName: string
  isHifz: boolean
  hifzReport?: LessonLogHifz
  standardReport?: LessonLogStandard
}

interface AttendanceItem {
  id: string
  date: string
  status: 'present' | 'absent' | 'leave'
  classType: '1:1' | 'Group'
}

interface StudentData {
  id: string
  fullName: string
  avatarUrl: string
  courseName: string
  status: 'trial' | 'active'
  attendanceMonth: number
  attendanceOverall: number
  classesAttendedText: string
  courseProgressPercent: number
  darsProgress?: {
    year: number
    subjects: { name: string; progress: number }[]
  }
  latestFeedback: string
  assignedTeacher: {
    name: string
    avatarInitials: string
    roleSummary: string
    timezoneClass: string
  }
  lessons: LessonHistoryItem[]
  attendance: AttendanceItem[]
  pastLeaveRequests: {
    id: string
    type: 'Leave' | 'Makeup'
    date: string
    reason: string
    status: 'Pending' | 'Approved' | 'Rejected'
  }[]
}

const MOCK_STUDENTS: Record<string, StudentData> = {
  ahmed: {
    id: 'student-ahmed',
    fullName: 'Ahmed Bilal',
    avatarUrl: 'AB',
    courseName: 'Quran Memorization (Hifz)',
    status: 'trial',
    attendanceMonth: 94,
    attendanceOverall: 88,
    classesAttendedText: '23 of 25 classes attended',
    courseProgressPercent: 65,
    latestFeedback: 'Excellent progress today, Ahmed! Work on the makhraj of Qaf and Lam-Jalalah. Surah Yusuf is coming along very well.',
    assignedTeacher: {
      name: 'Ustadh Ahmad Bilal',
      avatarInitials: 'AB',
      roleSummary: 'Qari & Tajweed Specialist, 8+ years teaching experience. Hafiz-ul-Quran.',
      timezoneClass: 'Mon & Wed at 7:00 PM (PKT)'
    },
    lessons: [
      {
        id: 'l-ahmed-1',
        date: '2026-06-19',
        course: 'Quran Memorization (Hifz)',
        teacherName: 'Ustadh Ahmad Bilal',
        isHifz: true,
        hifzReport: {
          sabaq: 'Surah Yusuf, verses 1-15 (Page 235)',
          sabaqi: 'Surah Hud, pages 221-234',
          manzil: 'Juz 11 & Juz 12',
          additionalNotes: 'Makharij are highly stable today. Keep retaining this rhythm.',
          yesterdayReport: 'Surah Hud verses 80-123 completed successfully.'
        }
      },
      {
        id: 'l-ahmed-2',
        date: '2026-06-17',
        course: 'Quran Memorization (Hifz)',
        teacherName: 'Ustadh Ahmad Bilal',
        isHifz: true,
        hifzReport: {
          sabaq: 'Surah Hud, verses 100-123 (Page 234)',
          sabaqi: 'Surah Hud, pages 215-220',
          manzil: 'Juz 10 & Juz 11',
          additionalNotes: 'Needs minor attention on Manzil fluency. Sabaq is strong.',
          yesterdayReport: 'Surah Hud verses 50-99 completed.'
        }
      },
      {
        id: 'l-ahmed-3',
        date: '2026-06-15',
        course: 'Quran Memorization (Hifz)',
        teacherName: 'Ustadh Ahmad Bilal',
        isHifz: true,
        hifzReport: {
          sabaq: 'Surah Hud, verses 50-99 (Page 233)',
          sabaqi: 'Surah Hud, pages 210-214',
          manzil: 'Juz 9 & Juz 10',
          additionalNotes: 'Good effort. Review verses 65-72 Hud to eliminate hesitation.',
          yesterdayReport: 'Surah Hud verses 1-49 recitation log.'
        }
      },
      {
        id: 'l-ahmed-4',
        date: '2026-06-10',
        course: 'Quran Memorization (Hifz)',
        teacherName: 'Ustadh Ahmad Bilal',
        isHifz: true,
        hifzReport: {
          sabaq: 'Surah Hud, verses 1-49 (Page 232)',
          sabaqi: 'Surah Yunus, pages 200-209',
          manzil: 'Juz 8 & Juz 9',
          additionalNotes: 'Excellent recitation. Pronunciation rules applied correctly.',
          yesterdayReport: 'Surah Yunus final section recitation log.'
        }
      }
    ],
    attendance: [
      { id: 'att-a-1', date: '2026-06-19', status: 'present', classType: '1:1' },
      { id: 'att-a-2', date: '2026-06-17', status: 'present', classType: '1:1' },
      { id: 'att-a-3', date: '2026-06-15', status: 'present', classType: '1:1' },
      { id: 'att-a-4', date: '2026-06-12', status: 'leave', classType: '1:1' },
      { id: 'att-a-5', date: '2026-06-10', status: 'absent', classType: '1:1' },
      { id: 'att-a-6', date: '2026-06-08', status: 'present', classType: '1:1' },
      { id: 'att-a-7', date: '2026-06-05', status: 'present', classType: '1:1' },
      { id: 'att-a-8', date: '2026-06-03', status: 'present', classType: '1:1' },
      { id: 'att-a-9', date: '2026-06-01', status: 'present', classType: '1:1' }
    ],
    pastLeaveRequests: [
      { id: 'lr-1', type: 'Leave', date: '2026-06-22', reason: 'Family wedding event', status: 'Pending' },
      { id: 'lr-2', type: 'Leave', date: '2026-06-12', reason: 'Medical appointment', status: 'Approved' }
    ]
  },
  sara: {
    id: 'student-sara',
    fullName: 'Sara Bilal',
    avatarUrl: 'SB',
    courseName: 'Dars-e-Nizami',
    status: 'active',
    attendanceMonth: 72,
    attendanceOverall: 78,
    classesAttendedText: '72 of 92 classes attended',
    courseProgressPercent: 40,
    darsProgress: {
      year: 3,
      subjects: [
        { name: 'Fiqh (Al-Hidayah)', progress: 45 },
        { name: 'Hadith (Riyadh as-Salihin)', progress: 30 },
        { name: 'Arabic Literature (Nafhatul Arab)', progress: 55 },
        { name: 'Sarf & Nahw (Grammar & Syntax)', progress: 60 }
      ]
    },
    latestFeedback: 'Sara is doing well in Sarf but needs to pay closer attention to Fiqh principles. Recommended reading the assigned text before class.',
    assignedTeacher: {
      name: 'Anisa Fatima',
      avatarInitials: 'AF',
      roleSummary: 'Alimah & Classical Arabic Graduate, 5+ years teaching. Specializes in Dars-e-Nizami curricula.',
      timezoneClass: 'Tue, Thu & Sat at 4:30 PM (PKT)'
    },
    lessons: [
      {
        id: 'l-sara-1',
        date: '2026-06-18',
        course: 'Dars-e-Nizami',
        teacherName: 'Anisa Fatima',
        isHifz: false,
        standardReport: {
          topicCovered: 'Fiqh - Introduction to Kitab al-Buyu\' (Trade/Commercial Transactions)',
          nextPlan: 'Fiqh - Valid, void (batil), and defective (fasid) conditions in contracts',
          feedback: 'Active participation. She asked excellent questions regarding contemporary trade applications.'
        }
      },
      {
        id: 'l-sara-2',
        date: '2026-06-16',
        course: 'Dars-e-Nizami',
        teacherName: 'Anisa Fatima',
        isHifz: false,
        standardReport: {
          topicCovered: 'Hadith - Riyadh as-Salihin (Hadith 45-50 on Sincerity)',
          nextPlan: 'Hadith 51-55 review',
          feedback: 'Fluency in terminology parsing is improving. Needs to practice translation aloud.'
        }
      },
      {
        id: 'l-sara-3',
        date: '2026-06-14',
        course: 'Dars-e-Nizami',
        teacherName: 'Anisa Fatima',
        isHifz: false,
        standardReport: {
          topicCovered: 'Arabic Grammar - Advanced Nahw constructs (Asma al-Khamsah)',
          nextPlan: 'Practical syntax parsing exercises on Quranic verses',
          feedback: 'Homework was completed accurately. Understood the grammatical cases perfectly.'
        }
      },
      {
        id: 'l-sara-4',
        date: '2026-06-11',
        course: 'Dars-e-Nizami',
        teacherName: 'Anisa Fatima',
        isHifz: false,
        standardReport: {
          topicCovered: 'Fiqh - Kitab al-Zakah (Final section review on eligible recipients)',
          nextPlan: 'Introductory concepts for Kitab al-Buyu\'',
          feedback: 'Excellent scoring in the oral check. Very stable foundation in Zakat categories.'
        }
      }
    ],
    attendance: [
      { id: 'att-s-1', date: '2026-06-18', status: 'present', classType: 'Group' },
      { id: 'att-s-2', date: '2026-06-16', status: 'present', classType: 'Group' },
      { id: 'att-s-3', date: '2026-06-14', status: 'leave', classType: 'Group' },
      { id: 'att-s-4', date: '2026-06-11', status: 'absent', classType: 'Group' },
      { id: 'att-s-5', date: '2026-06-09', status: 'absent', classType: 'Group' },
      { id: 'att-s-6', date: '2026-06-04', status: 'present', classType: 'Group' },
      { id: 'att-s-7', date: '2026-06-02', status: 'present', classType: 'Group' },
      { id: 'att-s-8', date: '2026-05-30', status: 'present', classType: 'Group' },
      { id: 'att-s-9', date: '2026-05-28', status: 'present', classType: 'Group' }
    ],
    pastLeaveRequests: [
      { id: 'lr-3', type: 'Leave', date: '2026-06-24', reason: 'Unplanned medical emergency', status: 'Rejected' },
      { id: 'lr-4', type: 'Leave', date: '2026-06-14', reason: 'High school graduation ceremony', status: 'Approved' }
    ]
  }
}

export default function StudentDashboard() {
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null)
  const [selectedKey, setSelectedKey] = useState<string>('')

  // Sibling profile states
  const [siblings, setSiblings] = useState<any[]>([])
  const [isLoadingSiblings, setIsLoadingSiblings] = useState(true)
  const [siblingsError, setSiblingsError] = useState<string | null>(null)

  // Academic Progress States
  const [progressData, setProgressData] = useState<any>(null)
  const [isLoadingProgress, setIsLoadingProgress] = useState(false)
  const [progressError, setProgressError] = useState<string | null>(null)

  // Lesson Logs States
  const [lessonLogsList, setLessonLogsList] = useState<any[]>([])
  const [isLoadingLogsList, setIsLoadingLogsList] = useState(false)
  const [logsListFetchError, setLogsListFetchError] = useState<string | null>(null)
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null)

  // Leave & Makeup Requests States
  const [leaveRequests, setLeaveRequests] = useState<any[]>([])
  const [isLoadingLeaves, setIsLoadingLeaves] = useState(false)
  const [makeupRequests, setMakeupRequests] = useState<any[]>([])
  const [isLoadingMakeups, setIsLoadingMakeups] = useState(false)
  const [hasActiveOneToOne, setHasActiveOneToOne] = useState(false)

  // Helper to map DB IDs to mock keys for Section 2-6 fallback presentation
  const getMockKeyForId = (id: string | null): string => {
    if (!id) return 'ahmed'
    if (id === '9f5bc742-f66d-45f2-a0cc-e3e2bc0ed539' || id.toLowerCase().includes('ahmed')) return 'ahmed'
    if (id === '0311a2e4-4a3d-42ae-b1b3-de0a589ecaaf' || id.toLowerCase().includes('sara')) return 'sara'
    return 'ahmed'
  }

  // Form States & Feedback Mock Actions
  const [activeStudent, setActiveStudent] = useState<StudentData>(MOCK_STUDENTS.ahmed)

  // Synchronize activeStudentId and selectedKey with localStorage on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedId = localStorage.getItem('activeStudentId')
      const savedKey = localStorage.getItem('selectedKey')
      if (savedId) {
        setActiveStudentId(savedId)
      }
      if (savedKey) {
        setSelectedKey(savedKey)
        const mockKey = getMockKeyForId(savedKey)
        setActiveStudent(MOCK_STUDENTS[mockKey])
      }
    }
  }, [])

  // Keep active student details synced with key
  useEffect(() => {
    if (activeStudentId) {
      const mockKey = getMockKeyForId(selectedKey)
      setActiveStudent(MOCK_STUDENTS[mockKey])
    }
  }, [selectedKey, activeStudentId])

  const fetchProgress = async (studentId: string) => {
    setIsLoadingProgress(true)
    setProgressError(null)
    try {
      const response = await fetch(`/api/student/progress?student_id=${studentId}`)
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to fetch academic progress')
      setProgressData(result)
    } catch (err: any) {
      console.error('Error fetching progress data:', err)
      setProgressError(err.message || 'Failed to load progress details.')
    } finally {
      setIsLoadingProgress(false)
    }
  }

  const fetchLessonLogs = async (studentId: string) => {
    setIsLoadingLogsList(true)
    setLogsListFetchError(null)
    try {
      const response = await fetch(`/api/student/lesson-logs?student_id=${studentId}`)
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to fetch lesson logs')
      setLessonLogsList(result.logs || [])
    } catch (err: any) {
      console.error('Error fetching lesson logs:', err)
      setLogsListFetchError(err.message || 'Failed to load lesson logs.')
    } finally {
      setIsLoadingLogsList(false)
    }
  }

  const fetchLeaves = async (studentId: string) => {
    setIsLoadingLeaves(true)
    try {
      const response = await fetch(`/api/student/leave?student_id=${studentId}`)
      const result = await response.json()
      if (response.ok) {
        setLeaveRequests(result.leaves || [])
      }
    } catch (err) {
      console.error('Error fetching leaves:', err)
    } finally {
      setIsLoadingLeaves(false)
    }
  }

  const fetchMakeups = async (studentId: string) => {
    setIsLoadingMakeups(true)
    try {
      const response = await fetch(`/api/student/makeup?student_id=${studentId}`)
      const result = await response.json()
      if (response.ok) {
        setMakeupRequests(result.makeups || [])
      }
    } catch (err) {
      console.error('Error fetching makeups:', err)
    } finally {
      setIsLoadingMakeups(false)
    }
  }

  const checkActiveOneToOne = async (studentId: string) => {
    try {
      const response = await fetch(`/api/student/schedule?student_id=${studentId}`)
      const result = await response.json()
      if (response.ok && result.schedules && result.schedules.length > 0) {
        setHasActiveOneToOne(true)
      } else {
        setHasActiveOneToOne(false)
      }
    } catch (err) {
      console.error('Error checking active 1:1:', err)
      setHasActiveOneToOne(false)
    }
  }

  useEffect(() => {
    if (activeStudentId) {
      fetchProgress(activeStudentId)
      fetchLessonLogs(activeStudentId)
      fetchLeaves(activeStudentId)
      fetchMakeups(activeStudentId)
      checkActiveOneToOne(activeStudentId)
    }
  }, [activeStudentId])

  const fetchSiblings = async () => {
    setIsLoadingSiblings(true)
    setSiblingsError(null)
    try {
      const response = await fetch('/api/student/siblings')
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to fetch sibling profiles')

      const sibs = result.siblings || []
      setSiblings(sibs)

      if (sibs.length === 1) {
        // If only 1 student profile found → skip the sibling gate, go directly
        handleSelectProfile(sibs[0].id)
      } else {
        // Check if there is already a saved activeStudentId in siblings list
        if (typeof window !== 'undefined') {
          const savedId = localStorage.getItem('activeStudentId')
          if (savedId && sibs.some((s: any) => s.id === savedId)) {
            // Already initialized from useEffect, skip auto-selection
            return
          }
        }
      }
    } catch (err: any) {
      console.error('Error loading siblings:', err)
      setSiblingsError(err.message || 'Failed to load family student profiles.')
    } finally {
      setIsLoadingSiblings(false)
    }
  }

  useEffect(() => {
    fetchSiblings()
  }, [])

  // Gate profile picker select handler
  const handleSelectProfile = (id: string) => {
    setActiveStudentId(id)
    setSelectedKey(id)
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeStudentId', id)
      localStorage.setItem('selectedKey', id)
    }
    const mockKey = getMockKeyForId(id)
    setActiveStudent(MOCK_STUDENTS[mockKey])
    console.log(`Logged in profile: ${id}`)
  }

  // Clear remembered selection (Sign out of profile)
  const handleResetProfile = () => {
    setActiveStudentId(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('activeStudentId')
      localStorage.removeItem('selectedKey')
    }
  }

  // Switcher triggers log
  const handleStudentSwitch = (key: string) => {
    setSelectedKey(key)
    setActiveStudentId(key)
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeStudentId', key)
      localStorage.setItem('selectedKey', key)
    }
    const mockKey = getMockKeyForId(key)
    setActiveStudent(MOCK_STUDENTS[mockKey])
    console.log(`Switched view to student: ${key}`)
  }


  // --- Leave Request Validation State ---
  const [leaveDate, setLeaveDate] = useState('')
  const [leaveTime, setLeaveTime] = useState('')
  const [leaveReason, setLeaveReason] = useState('')
  const [leaveError, setLeaveError] = useState('')
  const [leaveSuccess, setLeaveSuccess] = useState('')

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLeaveError('')
    setLeaveSuccess('')

    if (!leaveDate || !leaveTime) {
      setLeaveError('Please specify both the class date and time.')
      return
    }

    const now = new Date()
    const targetClassTime = new Date(`${leaveDate}T${leaveTime}`)
    const diffMs = targetClassTime.getTime() - now.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)

    if (diffMs <= 0) {
      setLeaveError('The requested class time must be in the future.')
      return
    }

    if (diffHours < 12) {
      setLeaveError('Leave must be requested at least 12 hours before the class')
      return
    }

    try {
      const response = await fetch('/api/student/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: activeStudentId,
          start_date: leaveDate,
          reason: leaveReason
        })
      })
      const result = await response.json()
      if (!response.ok) {
        setLeaveError(result.error || 'Failed to submit leave request')
        return
      }

      setLeaveSuccess(`Leave request submitted successfully for ${leaveDate}!`)
      setLeaveReason('')
      setLeaveDate('')
      setLeaveTime('')
      if (activeStudentId) {
        fetchLeaves(activeStudentId)
      }
    } catch (err: any) {
      console.error(err)
      setLeaveError(err.message || 'An error occurred during submission.')
    }
  }

  // --- Makeup Request State ---
  const [makeupDate, setMakeupDate] = useState('')
  const [makeupTime, setMakeupTime] = useState('')
  const [makeupSuccess, setMakeupSuccess] = useState('')
  const [makeupError, setMakeupError] = useState('')

  const handleMakeupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMakeupSuccess('')
    setMakeupError('')
    if (!makeupDate || !makeupTime) {
      setMakeupError('Please specify both date and time.')
      return
    }
    
    try {
      const response = await fetch('/api/student/makeup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: activeStudentId,
          proposed_date: makeupDate,
          proposed_time: makeupTime
        })
      })
      const result = await response.json()
      if (!response.ok) {
        setMakeupError(result.error || 'Failed to submit makeup request')
        return
      }

      setMakeupSuccess(`Makeup class request submitted for ${makeupDate} at ${makeupTime}. Pending coordinator approval.`)
      setMakeupDate('')
      setMakeupTime('')
      if (activeStudentId) {
        fetchMakeups(activeStudentId)
      }
    } catch (err: any) {
      console.error(err)
      setMakeupError(err.message || 'An error occurred during submission.')
    }
  }

  // --- Search & Filters for Lesson History ---
  const [searchTerm, setSearchTerm] = useState('')
  const [startDate, setStartDate] = useState('')
  const [filteredLessonLogs, setFilteredLessonLogs] = useState<any[]>([])
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false)

  useEffect(() => {
    let result = lessonLogsList
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      result = result.filter(item => 
        (item.sabaq && item.sabaq.toLowerCase().includes(q)) || 
        (item.sabaqi && item.sabaqi.toLowerCase().includes(q)) || 
        (item.manzil && item.manzil.toLowerCase().includes(q)) || 
        (item.topic_covered && item.topic_covered.toLowerCase().includes(q)) ||
        (item.next_plan && item.next_plan.toLowerCase().includes(q))
      )
    }
    if (startDate) {
      result = result.filter(item => item.class_date >= startDate)
    }
    setFilteredLessonLogs(result)
  }, [searchTerm, startDate, lessonLogsList])

  // Dynamic helper for color coding attendance percentage card
  const getAttendanceColorClass = (pct: number) => {
    if (pct >= 90) return 'text-emerald-800 border-emerald-200 bg-emerald-100'
    if (pct >= 75) return 'text-amber-800 border-amber-250 bg-amber-100'
    return 'text-red-800 border-red-200 bg-red-100'
  }

  const getAttendanceDotColorClass = (pct: number) => {
    if (pct >= 90) return 'bg-emerald-500'
    if (pct >= 75) return 'bg-amber-500'
    return 'bg-red-500'
  }

  // Combine leave and makeup requests for timeline log
  const combinedRequests = [
    ...leaveRequests.map(l => ({
      id: l.id,
      type: 'Leave Request',
      date: l.start_date,
      reason: l.reason,
      status: l.status,
      created_at: l.created_at
    })),
    ...makeupRequests.map(m => ({
      id: m.id,
      type: 'Makeup Request',
      date: `${m.proposed_date} ${m.proposed_time}`,
      reason: 'Proposed makeup slot',
      status: m.status,
      created_at: m.created_at
    }))
  ]
  combinedRequests.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // ============================================================================
  // RENDER GATE PAGE: "Who is learning today?"
  // ============================================================================
  if (!activeStudentId) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div>
            <h1 className="text-4xl font-serif font-bold text-zinc-900 tracking-tight">Who is going to learn first?</h1>
            <p className="mt-2 text-zinc-650 text-sm font-sans">Select a profile to continue to your dashboard view</p>
          </div>

          {isLoadingSiblings ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3 bg-white border border-zinc-200 rounded-2xl shadow-xs">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1B6B3A] border-t-transparent"></div>
              <p className="text-sm text-zinc-500 font-medium font-sans">Finding student profiles...</p>
            </div>
          ) : siblingsError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-xs text-red-750 shadow-xs max-w-md mx-auto">
              <p className="font-bold text-sm">Failed to load sibling profiles</p>
              <p className="mt-2 font-mono text-[10px]">{siblingsError}</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {siblings.map((sibling) => {
                return (
                  <div 
                    key={sibling.id}
                    onClick={() => handleSelectProfile(sibling.id)}
                    className="group rounded-2xl border border-zinc-200 bg-white hover:border-[#1B6B3A]/30 hover:bg-[#1B6B3A]/5 p-6 text-center cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between min-h-[200px]"
                  >
                    <div className="flex flex-col items-center space-y-4">
                      <div className="h-16 w-16 rounded-full bg-zinc-100 border border-zinc-200 group-hover:border-[#1B6B3A]/30 flex items-center justify-center font-black text-zinc-800 text-lg transition-all duration-200">
                        {sibling.avatarUrl}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-zinc-800 group-hover:text-[#1B6B3A] transition-colors duration-200">
                          {sibling.fullName}
                        </h3>
                        <p className="text-xs text-zinc-600 mt-1 font-sans">{sibling.courseName}</p>
                      </div>
                    </div>

                    <button 
                      className="mt-6 w-full rounded-xl bg-zinc-50 border border-zinc-200 py-2.5 text-xs font-bold text-zinc-700 group-hover:bg-[#1B6B3A] group-hover:border-[#1B6B3A] group-hover:text-white transition-all duration-200"
                    >
                      Continue as {sibling.fullName.split(' ')[0]}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ============================================================================
  // RENDER MAIN STUDENT DASHBOARD
  // ============================================================================
  return (
    <div className="space-y-8 pb-16 font-sans">
      
      {/* Top Header Row */}
      <div className="flex justify-between items-center bg-white border border-zinc-200 p-4 rounded-2xl shadow-sm">
        <h2 className="text-xl font-serif font-bold text-zinc-900">Student Workspace</h2>
        <NotificationBell />
      </div>

      {/* 1. STUDENT SWITCHER CONTAINER */}
      {siblings.length > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[#1B6B3A]" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-700">Sibling Student Switcher</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              {siblings.map(sibling => (
                <button
                  key={sibling.id}
                  onClick={() => handleStudentSwitch(sibling.id)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold tracking-wide transition-all border ${
                    selectedKey === sibling.id
                      ? 'bg-[#1B6B3A]/10 border-[#1B6B3A]/30 text-[#1B6B3A] shadow-sm'
                      : 'bg-zinc-50 border-zinc-300 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
                  }`}
                >
                  {sibling.fullName} ({sibling.courseName.split(' ')[0]})
                </button>
              ))}
            </div>
            
            {/* Switch Profile Back Button */}
            <button
              onClick={handleResetProfile}
              title="Switch Profile"
              className="p-2 rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 transition-all"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-[#1B6B3A]/5 blur-[80px] pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-serif tracking-tight text-zinc-900">
              Assalamu Alaikum, {activeStudent.fullName}!
            </h1>
            <p className="text-xs font-bold text-[#1B6B3A] uppercase tracking-wider mt-1.5">
              {progressData?.courseName || activeStudent.courseName}
            </p>
            <p className="mt-2 text-zinc-700 max-w-xl text-sm leading-relaxed">
              Welcome back to your Virtual Zawiyah learning space. Select different tabs to track your syllabus, check logs, schedule leaves, or coordinate with teachers.
            </p>
          </div>
          
          {/* Status Badge */}
          <div className={`h-fit w-fit rounded-xl border px-4 py-2 text-center shadow-sm ${
            activeStudent.status === 'trial'
              ? 'bg-amber-100 text-amber-800 border-amber-250'
              : 'bg-emerald-100 text-emerald-800 border-emerald-200'
          }`}>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-600">Student Tier</span>
            <span className="text-sm font-black uppercase tracking-wide mt-0.5 block">
              {activeStudent.status} Student
            </span>
          </div>
        </div>
      </div>

      {/* 2. UPCOMING CLASS / JOIN SECTION (Elevated to top, most prominent) */}
      <div className="rounded-2xl border border-[#1B6B3A]/20 bg-gradient-to-r from-emerald-50/40 to-teal-50/40 p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-emerald-500/10 blur-[80px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-[#1B6B3A]/10 border border-[#1B6B3A]/20 flex items-center justify-center font-bold text-[#1B6B3A] text-base shrink-0">
              {activeStudent.assignedTeacher.avatarInitials}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B6B3A] bg-[#1B6B3A]/10 px-2 py-0.5 rounded border border-[#1B6B3A]/30">Assigned Teacher</span>
              <h3 className="text-lg font-bold text-zinc-900 mt-1.5 flex items-center gap-2">
                {activeStudent.assignedTeacher.name}
              </h3>
              <p className="text-xs text-zinc-700 mt-0.5 max-w-lg">{activeStudent.assignedTeacher.roleSummary}</p>
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-700 mt-3">
                <span className="flex items-center gap-1.5 bg-white border border-zinc-200 px-3 py-1 rounded-lg">
                  <Clock className="h-3.5 w-3.5 text-zinc-700" /> Slot: {activeStudent.assignedTeacher.timezoneClass}
                </span>
                <span className="flex items-center gap-1 bg-white border border-zinc-200 px-2.5 py-1 rounded-lg text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping inline-block mr-1"></span> Active Classroom
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch md:self-auto justify-end">
            <button
              onClick={() => console.log('Mock: Launching Classroom...')}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-[#1B6B3A] hover:from-emerald-500 hover:to-[#1B6B3A] text-white font-bold py-3 px-6 text-sm transition-all shadow-md active:scale-[0.98]"
            >
              <Video className="h-4 w-4" />
              Join Classroom Now
            </button>
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* LEFT COLUMN: Lesson Logs, Stats & Attendance History */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* A. LESSON HISTORY (Student Lesson Logs & Reports) */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 pb-4">
              <h2 className="text-xl font-bold font-serif text-zinc-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#1B6B3A]" /> Student Lesson Logs & Reports
              </h2>
              
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 text-xs text-zinc-900 outline-none focus:border-[#1B6B3A]/50 w-40 font-sans"
                  />
                </div>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 text-xs text-zinc-900 outline-none focus:border-[#1B6B3A]/50 font-sans"
                  placeholder="Start date"
                />
                {(searchTerm || startDate) && (
                  <button 
                    onClick={() => { setSearchTerm(''); setStartDate(''); }}
                    className="px-2 py-1.5 text-zinc-700 hover:text-zinc-900 text-xs font-bold"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {isLoadingLogsList ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3 bg-zinc-50/50 border border-zinc-200 rounded-xl shadow-xs">
                <div className="h-7 w-7 animate-spin rounded-full border-3 border-[#1B6B3A] border-t-transparent"></div>
                <p className="text-xs text-zinc-500 font-medium font-sans">Querying lesson reports...</p>
              </div>
            ) : logsListFetchError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-750 shadow-xs">
                <p className="font-bold">Failed to load lesson reports</p>
                <p className="mt-1 font-mono text-[10px]">{logsListFetchError}</p>
              </div>
            ) : filteredLessonLogs.length === 0 ? (
              <p className="text-center text-zinc-400 italic text-xs py-10 font-sans bg-zinc-50/20 border border-zinc-200 rounded-xl">
                No lesson reports yet.
              </p>
            ) : (
              <div className="space-y-4">
                {/* Most recent log (index 0) - Always fully expanded */}
                {(() => {
                  const firstLog = filteredLessonLogs[0]
                  const isHifz = firstLog.log_type === 'hifz'
                  return (
                    <div className="rounded-xl border border-[#1B6B3A]/30 bg-[#1B6B3A]/5 p-4 space-y-3 shadow-xs">
                      <div className="flex justify-between items-center text-xs font-mono text-zinc-700 border-b border-zinc-200 pb-2">
                        <span className="bg-[#1B6B3A]/20 border border-[#1B6B3A]/40 px-2.5 py-0.5 rounded text-[#1B6B3A] font-bold uppercase tracking-wider text-[10px]">
                          Latest Log: {isHifz ? 'Hifz' : 'Standard'}
                        </span>
                        <span className="font-bold">Date: {firstLog.class_date}</span>
                      </div>

                      {isHifz ? (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-xs">
                          <div className="bg-white border border-zinc-200/60 p-2.5 rounded-lg shadow-2xs">
                            <span className="font-semibold text-[#1B6B3A] block mb-1">Sabaq (New Lesson)</span>
                            <p className="text-zinc-800">{firstLog.sabaq || 'N/A'}</p>
                          </div>
                          <div className="bg-white border border-zinc-200/60 p-2.5 rounded-lg shadow-2xs">
                            <span className="font-semibold text-[#1B6B3A] block mb-1">Sabaqi (Recent Review)</span>
                            <p className="text-zinc-800">{firstLog.sabaqi || 'N/A'}</p>
                          </div>
                          <div className="bg-white border border-zinc-200/60 p-2.5 rounded-lg shadow-2xs">
                            <span className="font-semibold text-[#1B6B3A] block mb-1">Manzil (Old Review)</span>
                            <p className="text-zinc-800">{firstLog.manzil || 'N/A'}</p>
                          </div>
                          <div className="bg-white border border-zinc-200/60 p-2.5 rounded-lg sm:col-span-2 shadow-2xs">
                            <span className="font-semibold text-[#1B6B3A] block mb-1">Yesterday&apos;s Report / Target</span>
                            <p className="text-zinc-800">{firstLog.next_plan || 'N/A'}</p>
                          </div>
                          <div className="bg-white border border-zinc-200/60 p-2.5 rounded-lg sm:col-span-2 lg:col-span-1 shadow-2xs">
                            <span className="font-semibold text-[#1B6B3A] block mb-1">Additional Notes</span>
                            <p className="text-zinc-800">{firstLog.topic_covered || 'N/A'}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="font-semibold text-teal-850">Topic Covered:</span>
                            <p className="text-zinc-800 mt-0.5">{firstLog.topic_covered}</p>
                          </div>
                          <div className="bg-white border border-zinc-200/60 p-2.5 rounded-lg shadow-2xs">
                            <span className="font-semibold text-teal-850 block mb-1">Next Plan</span>
                            <p className="text-zinc-800">{firstLog.next_plan || 'N/A'}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })()}

                {/* Historical logs (index > 0) - Collapsed by default, expand on toggle */}
                {isHistoryExpanded && filteredLessonLogs.slice(1).map((log) => {
                  const isExpanded = expandedLogId === log.id
                  const isHifz = log.log_type === 'hifz'
                  return (
                    <div key={log.id} className="rounded-xl border border-zinc-200 bg-white shadow-xs overflow-hidden">
                      {/* Collapsed Brief Header */}
                      <div 
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        className="p-3 bg-zinc-50/70 hover:bg-zinc-100 flex justify-between items-center cursor-pointer transition-all border-b border-zinc-150"
                      >
                        <div className="flex items-center gap-3">
                          <span className="bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase">
                            {isHifz ? 'Hifz' : 'Standard'}
                          </span>
                          <span className="text-xs font-bold text-zinc-800">Class Report: {log.class_date}</span>
                        </div>
                        <span className="text-[10px] text-[#1B6B3A] font-bold hover:underline">
                          {isExpanded ? 'Collapse' : 'Expand Details'}
                        </span>
                      </div>

                      {/* Expanded Detail Panel */}
                      {isExpanded && (
                        <div className="p-4 bg-white space-y-3 border-t border-zinc-100 animate-fade-in">
                          {isHifz ? (
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-xs">
                              <div className="bg-zinc-50 border border-zinc-200/60 p-2.5 rounded-lg shadow-2xs">
                                <span className="font-semibold text-[#1B6B3A] block mb-1">Sabaq (New Lesson)</span>
                                <p className="text-zinc-850">{log.sabaq || 'N/A'}</p>
                              </div>
                              <div className="bg-zinc-50 border border-zinc-200/60 p-2.5 rounded-lg shadow-2xs">
                                <span className="font-semibold text-[#1B6B3A] block mb-1">Sabaqi (Recent Review)</span>
                                <p className="text-zinc-850">{log.sabaqi || 'N/A'}</p>
                              </div>
                              <div className="bg-zinc-50 border border-zinc-200/60 p-2.5 rounded-lg shadow-2xs">
                                <span className="font-semibold text-[#1B6B3A] block mb-1">Manzil (Old Review)</span>
                                <p className="text-zinc-850">{log.manzil || 'N/A'}</p>
                              </div>
                              <div className="bg-zinc-50 border border-zinc-200/60 p-2.5 rounded-lg sm:col-span-2 shadow-2xs">
                                <span className="font-semibold text-[#1B6B3A] block mb-1">Yesterday&apos;s Report / Target</span>
                                <p className="text-zinc-850">{log.next_plan || 'N/A'}</p>
                              </div>
                              <div className="bg-zinc-50 border border-zinc-200/60 p-2.5 rounded-lg sm:col-span-2 lg:col-span-1 shadow-2xs">
                                <span className="font-semibold text-[#1B6B3A] block mb-1">Additional Notes</span>
                                <p className="text-zinc-850">{log.topic_covered || 'N/A'}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2 text-xs">
                              <div>
                                <span className="font-semibold text-teal-800">Topic Covered:</span>
                                <p className="text-zinc-800 mt-0.5">{log.topic_covered}</p>
                              </div>
                              <div className="bg-zinc-50 border border-zinc-200/60 p-2.5 rounded-lg shadow-2xs">
                                <span className="font-semibold text-teal-800 block mb-1">Next Plan</span>
                                <p className="text-zinc-850">{log.next_plan || 'N/A'}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* View Previous Reports Toggle Button */}
                {filteredLessonLogs.length > 1 && (
                  <button
                    onClick={() => {
                      setIsHistoryExpanded(!isHistoryExpanded)
                      setExpandedLogId(null) // clear expansion toggles
                    }}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 py-3 text-xs font-bold text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-all mt-4"
                  >
                    {isHistoryExpanded ? (
                      <>
                        <ChevronUp className="h-4 w-4 text-[#1B6B3A]" />
                        Hide Previous Reports
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 text-[#1B6B3A]" />
                        View Previous Reports ({filteredLessonLogs.length - 1} more)
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* B. STATS GRID: Attendance Percentage Widget & Latest Teacher Feedback Card */}
          {isLoadingProgress ? (
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[160px]">
                <div className="h-6 w-6 animate-spin rounded-full border-3 border-[#1B6B3A] border-t-transparent"></div>
                <p className="text-xs text-zinc-500 font-medium mt-2 font-sans">Querying progress metrics...</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[160px]">
                <div className="h-6 w-6 animate-spin rounded-full border-3 border-[#1B6B3A] border-t-transparent"></div>
                <p className="text-xs text-zinc-500 font-medium mt-2 font-sans">Querying teacher feedback...</p>
              </div>
            </div>
          ) : progressError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-750 shadow-sm">
              <p className="font-bold">Failed to load academic progress metrics</p>
              <p className="mt-1 font-mono text-[10px]">{progressError}</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              
              {/* Attendance Percentage Widget */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-700">Attendance Percentage</span>
                  <CalendarCheck className="h-5 w-5 text-[#1B6B3A]" />
                </div>
                
                {(!progressData || progressData.totalClasses === 0) ? (
                  <p className="text-xs text-zinc-400 italic text-center py-6 font-sans">No attendance records yet</p>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center ${getAttendanceColorClass(progressData.thisMonthAttendance)}`}>
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">This Month</span>
                      <span className="text-2xl font-black mt-1">{progressData.thisMonthAttendance}%</span>
                    </div>
                    <div className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center ${getAttendanceColorClass(progressData.overallAttendance)}`}>
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">Overall Rate</span>
                      <span className="text-2xl font-black mt-1">{progressData.overallAttendance}%</span>
                    </div>
                  </div>
                )}
                
                <div className="mt-3 flex items-center gap-1.5 text-[10px] text-zinc-700">
                  <span className={`h-2.5 w-2.5 rounded-full ${getAttendanceDotColorClass(progressData?.overallAttendance || 0)}`}></span>
                  <span>Color status levels: Green (≥90%), Amber (75-89%), Red (&lt;75%)</span>
                </div>
              </div>

              {/* Teacher Feedback Summary Card */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm relative overflow-hidden flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-700 block mb-3">Latest Teacher Feedback</span>
                  {!progressData || !progressData.latestLog ? (
                    <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-xs italic text-zinc-450 text-center font-sans">
                      No lesson reports yet
                    </div>
                  ) : (
                    <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-xs text-zinc-700 relative">
                      <span className="absolute top-2 right-2 text-2xl font-serif text-emerald-500/20 leading-none">&ldquo;</span>
                      
                      {progressData.latestLog.log_type === 'hifz' ? (
                        <div className="space-y-1.5 font-sans leading-relaxed text-zinc-700">
                          <p><strong>Sabaq:</strong> {progressData.latestLog.sabaq || 'N/A'}</p>
                          <p><strong>Sabaqi:</strong> {progressData.latestLog.sabaqi || 'N/A'}</p>
                          <p><strong>Manzil:</strong> {progressData.latestLog.manzil || 'N/A'}</p>
                          {progressData.latestLog.topic_covered && (
                            <p className="mt-1.5 pt-1 border-t border-zinc-200/60 text-[11px] italic text-zinc-650">
                              Notes: {progressData.latestLog.topic_covered}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1 font-sans leading-relaxed text-zinc-700 pr-4">
                          <p className="italic font-medium">&ldquo;{progressData.latestLog.topic_covered}&rdquo;</p>
                          {progressData.latestLog.next_plan && (
                            <p className="mt-1.5 text-[10px] text-zinc-500 font-mono">Next: {progressData.latestLog.next_plan}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {progressData?.latestLog && (
                  <span className="block text-[10px] text-zinc-700 mt-2 font-mono">
                    Source: Lesson Report dated {progressData.latestLog.class_date}
                  </span>
                )}
              </div>

            </div>
          )}

          {/* C. CONDITIONAL WIDGET: Dars-e-Nizami Progress Tracker */}
          {activeStudent.darsProgress && (
            <div className="rounded-2xl border border-teal-200 bg-teal-50/40 p-6 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-4 border-b border-teal-100 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800">Dars-e-Nizami Curriculum Tracker</span>
                <span className="text-xs font-black text-teal-900 bg-teal-100 px-2 py-0.5 rounded border border-teal-300">
                  Current Year: {activeStudent.darsProgress.year} of 8
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {activeStudent.darsProgress.subjects.map((sub, idx) => (
                  <div key={idx} className="space-y-1 bg-white p-2.5 rounded-xl border border-zinc-200">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-800 font-medium truncate max-w-[70%]">{sub.name}</span>
                      <span className="text-teal-800 font-bold">{sub.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-600" style={{ width: `${sub.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* D. ATTENDANCE HISTORY (12-Month Attendance Log) */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
              <h2 className="text-xl font-bold font-serif text-zinc-900 flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-[#1B6B3A]" /> 12-Month Attendance Log
              </h2>
              <button 
                onClick={() => console.log('Mock CSV export triggered')}
                className="flex items-center gap-1.5 text-xs font-bold text-[#1B6B3A] hover:text-[#1B6B3A]/80 border border-[#1B6B3A]/30 bg-[#1B6B3A]/10 hover:bg-[#1B6B3A]/15 px-3 py-1.5 rounded-xl transition-all"
              >
                <Download className="h-3.5 w-3.5" /> Export to CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-700 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Class Format</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {activeStudent.attendance.map((entry) => (
                    <tr key={entry.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-zinc-900">{entry.date}</td>
                      <td className="py-3.5 px-4 text-zinc-700 font-mono">{entry.classType} Class</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-bold uppercase tracking-wider text-[10px] ${
                          entry.status === 'present' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          entry.status === 'absent' ? 'bg-red-100 text-red-800 border border-red-200' :
                          'bg-yellow-100/80 text-yellow-800 border border-yellow-200'
                        }`}>
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Attendance Forms & Requests */}
        <div className="space-y-8">
          
          {/* Attendance Forms and Logs */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-6">
            <h2 className="text-xl font-bold font-serif text-zinc-900 flex items-center gap-2 border-b border-zinc-200 pb-4">
              <Calendar className="h-5 w-5 text-[#1B6B3A]" /> Attendance Forms & Requests
            </h2>

            {/* LEAVE REQUEST FORM */}
            <form onSubmit={handleLeaveSubmit} className="space-y-4 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1B6B3A]">Request Leave</h3>
              
              {leaveError && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-800 font-sans">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{leaveError}</span>
                </div>
              )}
              {leaveSuccess && (
                <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800 font-sans">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{leaveSuccess}</span>
                </div>
              )}

              <div className="space-y-2.5 font-sans">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-750 block mb-1">Class Date</label>
                    <input
                      type="date"
                      required
                      value={leaveDate}
                      onChange={(e) => setLeaveDate(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-white py-2 px-3 text-xs text-zinc-800 outline-none focus:border-[#1B6B3A]/50 font-sans"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-750 block mb-1">Class Start Time</label>
                    <input
                      type="time"
                      required
                      value={leaveTime}
                      onChange={(e) => setLeaveTime(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 bg-white py-2 px-3 text-xs text-zinc-800 outline-none focus:border-[#1B6B3A]/50 font-sans"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-750 block mb-1">Reason for Leave</label>
                  <textarea
                    required
                    rows={2}
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    placeholder="e.g. Traveling / Medical issue..."
                    className="w-full rounded-lg border border-zinc-200 bg-white py-2 px-3 text-xs text-zinc-800 outline-none focus:border-[#1B6B3A]/50 resize-none font-sans"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#1B6B3A] hover:bg-[#1B6B3A]/95 py-2 text-xs font-bold text-white transition-all duration-150"
                >
                  Submit Leave Application
                </button>
              </div>
            </form>

            {/* MAKEUP REQUEST FORM (1:1 students only) */}
            {hasActiveOneToOne ? (
              <form onSubmit={handleMakeupSubmit} className="space-y-4 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800">Request Makeup Class</h3>
                {makeupSuccess && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800 font-sans">
                    {makeupSuccess}
                  </div>
                )}
                {makeupError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-805 font-sans">
                    {makeupError}
                  </div>
                )}
                <div className="space-y-2.5 font-sans">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-zinc-750 block mb-1">Target Date</label>
                      <input
                        type="date"
                        required
                        value={makeupDate}
                        onChange={(e) => setMakeupDate(e.target.value)}
                        className="w-full rounded-lg border border-zinc-200 bg-white py-2 px-3 text-xs text-zinc-800 outline-none focus:border-[#1B6B3A]/50 font-sans"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-750 block mb-1">Target Time</label>
                      <input
                        type="time"
                        required
                        value={makeupTime}
                        onChange={(e) => setMakeupTime(e.target.value)}
                        className="w-full rounded-lg border border-zinc-200 bg-white py-2 px-3 text-xs text-zinc-800 outline-none focus:border-[#1B6B3A]/50 font-sans"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-teal-700 hover:bg-teal-650 py-2 text-xs font-bold text-white transition-all duration-150 active:scale-[0.99]"
                  >
                    Submit Makeup Schedule
                  </button>
                </div>
              </form>
            ) : (
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-center font-sans">
                <p className="text-zinc-700 text-xs">Makeup class scheduler is restricted to One-on-One students only.</p>
              </div>
            )}

            {/* List of past requests */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-700 block">Past Leave & Makeup Log</span>
              
              {isLoadingLeaves || isLoadingMakeups ? (
                <div className="flex justify-center p-6 bg-zinc-50 rounded-xl border border-zinc-200">
                  <Loader2 className="h-5 w-5 animate-spin text-[#1B6B3A]" />
                </div>
              ) : combinedRequests.length === 0 ? (
                <div className="p-4 text-center text-zinc-500 text-xs bg-zinc-50 border border-zinc-200 rounded-xl font-sans">
                  No leave or makeup requests submitted yet.
                </div>
              ) : (
                <div className="divide-y divide-zinc-200 bg-zinc-50/50 rounded-xl border border-zinc-200 overflow-hidden font-sans">
                  {combinedRequests.map((req) => (
                    <div key={req.id} className="p-3 flex items-center justify-between text-xs hover:bg-zinc-100 transition-colors">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap font-sans">
                          <span className="font-bold text-zinc-900">{req.type}</span>
                          <span className="text-[10px] text-zinc-700 font-mono">Date: {req.date}</span>
                        </div>
                        <p className="text-[10px] text-zinc-700 mt-1 max-w-[200px] truncate">{req.reason}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        req.status.toLowerCase() === 'approved' || req.status.toLowerCase() === 'scheduled' || req.status.toLowerCase() === 'completed'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-250' :
                        req.status.toLowerCase() === 'rejected' || req.status.toLowerCase() === 'cancelled'
                          ? 'bg-red-100 text-red-800 border-red-200' :
                        'bg-yellow-100/80 text-yellow-800 border-yellow-250'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
