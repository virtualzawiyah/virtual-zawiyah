'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { 
  Clock, 
  Video, 
  Calendar, 
  CheckCircle2, 
  FileText,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react'

// --- Types & Interfaces ---

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

interface StudentMock {
  id: string
  fullName: string
  avatarInitials: string
  courseName: string
  status: 'trial' | 'active'
  is1to1: boolean
  timezoneClass: string
  nextClassTime: string
  lessons: LessonHistoryItem[]
}

interface TodayScheduleItem {
  id: string
  studentId: string
  studentName: string
  courseName: string
  timeText: string
  status: 'Live Now' | 'Upcoming' | 'Completed'
  isImminent: boolean
}

// --- Static Mock Data ---

const MOCK_STUDENTS: StudentMock[] = [
  {
    id: 'student-ahmed',
    fullName: 'Ahmed Bilal',
    avatarInitials: 'AB',
    courseName: 'Quran Memorization (Hifz)',
    status: 'trial',
    is1to1: true,
    timezoneClass: 'Mon & Wed at 7:00 PM (PKT)',
    nextClassTime: 'Wednesday at 7:00 PM (PKT)',
    lessons: [
      {
        id: 'report-1',
        date: '2026-06-18',
        course: 'Quran Memorization (Hifz)',
        teacherName: 'Ustadh Ahmad Bilal',
        isHifz: true,
        hifzReport: {
          sabaq: 'Surah Al-Baqarah v10-15',
          sabaqi: 'Surah Al-Baqarah v1-9',
          manzil: 'Juz 30 (Surah An-Naba to An-Nas)',
          additionalNotes: 'Recitation was fluent, made 2 mistakes in Sabaq which were corrected.',
          yesterdayReport: 'Sabaq: Surah Al-Baqarah v5-9 (Excellent, minor mistakes)'
        }
      },
      {
        id: 'report-2',
        date: '2026-06-15',
        course: 'Quran Memorization (Hifz)',
        teacherName: 'Ustadh Ahmad Bilal',
        isHifz: true,
        hifzReport: {
          sabaq: 'Surah Al-Baqarah v5-9',
          sabaqi: 'Surah Al-Fatiha',
          manzil: 'Surah Yaseen v1-20',
          additionalNotes: 'Need to focus more on Ghunnah rules during Sabaqi.',
          yesterdayReport: 'Sabaq: Surah Al-Baqarah v1-4'
        }
      }
    ]
  },
  {
    id: 'student-sara',
    fullName: 'Sara Bilal',
    avatarInitials: 'SB',
    courseName: 'Dars-e-Nizami',
    status: 'active',
    is1to1: false,
    timezoneClass: 'Tue & Thu at 6:00 PM (PKT)',
    nextClassTime: 'Tuesday at 6:00 PM (PKT)',
    lessons: [
      {
        id: 'report-3',
        date: '2026-06-19',
        course: 'Dars-e-Nizami',
        teacherName: 'Ustadh Ahmad Bilal',
        isHifz: false,
        standardReport: {
          topicCovered: 'Sarfi Bahas (Verb conjugation rules)',
          nextPlan: 'Homework exercise 4 on page 22',
          feedback: 'Participated actively in group discussions, understood conjugations well.'
        }
      }
    ]
  },
  {
    id: 'student-yusuf',
    fullName: 'Yusuf Khan',
    avatarInitials: 'YK',
    courseName: 'Quran Reading (Nazra)',
    status: 'active',
    is1to1: true,
    timezoneClass: 'Mon & Wed at 5:00 PM (PKT)',
    nextClassTime: 'Monday at 5:00 PM (PKT)',
    lessons: [
      {
        id: 'report-4',
        date: '2026-06-17',
        course: 'Quran Reading (Nazra)',
        teacherName: 'Ustadh Ahmad Bilal',
        isHifz: false,
        standardReport: {
          topicCovered: 'Qaida lesson 10 (Tanween rules)',
          nextPlan: 'Qaida lesson 11 revision',
          feedback: 'Yusuf made progress with double accents. Needs revision on standing fatha.'
        }
      }
    ]
  },
  {
    id: 'student-anisa',
    fullName: 'Anisa Fatima',
    avatarInitials: 'AF',
    courseName: 'Islamic Studies',
    status: 'active',
    is1to1: false,
    timezoneClass: 'Wed & Fri at 4:00 PM (PKT)',
    nextClassTime: 'Wednesday at 4:00 PM (PKT)',
    lessons: [
      {
        id: 'report-5',
        date: '2026-06-16',
        course: 'Islamic Studies',
        teacherName: 'Ustadh Ahmad Bilal',
        isHifz: false,
        standardReport: {
          topicCovered: 'History of Fiqh (Introduction)',
          nextPlan: 'Read chapter 2 summary on Abu Hanifa',
          feedback: 'Attended live, answered questions correctly, good attention span.'
        }
      }
    ]
  },
  {
    id: 'student-zainab',
    fullName: 'Zainab Ali',
    avatarInitials: 'ZA',
    courseName: 'Quran Memorization (Hifz)',
    status: 'active',
    is1to1: true,
    timezoneClass: 'Mon & Wed at 8:00 PM (PKT)',
    nextClassTime: 'Monday at 8:00 PM (PKT)',
    lessons: [
      {
        id: 'report-6',
        date: '2026-06-17',
        course: 'Quran Memorization (Hifz)',
        teacherName: 'Ustadh Ahmad Bilal',
        isHifz: true,
        hifzReport: {
          sabaq: 'Surah Maryam v1-5',
          sabaqi: 'Surah Al-Kahf v100-110',
          manzil: 'Juz 29',
          additionalNotes: 'Tajweed rules were followed perfectly. MashaAllah.',
          yesterdayReport: 'Sabaq: Surah Al-Kahf completion'
        }
      }
    ]
  }
]

const MOCK_TODAY_SCHEDULE: TodayScheduleItem[] = [
  {
    id: 'class-1',
    studentId: 'student-yusuf',
    studentName: 'Yusuf Khan',
    courseName: 'Quran Reading (Nazra)',
    timeText: '10:00 AM - 10:30 AM (PKT)',
    status: 'Completed',
    isImminent: false
  },
  {
    id: 'class-2',
    studentId: 'student-ahmed',
    studentName: 'Ahmed Bilal',
    courseName: 'Quran Memorization (Hifz)',
    timeText: '5:00 PM - 5:30 PM (PKT)',
    status: 'Live Now',
    isImminent: true
  },
  {
    id: 'class-3',
    studentId: 'student-sara',
    studentName: 'Sara Bilal',
    courseName: 'Dars-e-Nizami',
    timeText: '7:00 PM - 7:45 PM (PKT)',
    status: 'Upcoming',
    isImminent: false
  }
]

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedStudentId = searchParams.get('studentId')

  // UI States
  const [currentTimeText, setCurrentTimeText] = useState('5:10 PM')
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false)

  // Live Database States
  const [profileName, setProfileName] = useState('Ustadh')
  const [teacherId, setTeacherId] = useState<string>('')
  const [todaySchedules, setTodaySchedules] = useState<any[]>([])
  const [loadingSchedule, setLoadingSchedule] = useState(true)

  // Student list states (used for selecting active student derived state)
  const [todaysStudents, setTodaysStudents] = useState<any[]>([])
  const [allStudents, setAllStudents] = useState<any[]>([])
  const [loadingStudents, setLoadingStudents] = useState(true)

  const fetchProfileName = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setTeacherId(session.user.id)
        const fullName = session.user.user_metadata?.full_name
        if (fullName) {
          setProfileName(fullName)
        } else {
          const { data } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', session.user.id)
            .single()
          if (data?.full_name) {
            setProfileName(data.full_name)
          }
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const fetchTodaySchedule = async () => {
    setLoadingSchedule(true)
    try {
      const response = await fetch('/api/teacher/schedule')
      const result = await response.json()
      if (response.ok) {
        setTodaySchedules(result.schedules || [])
      }
    } catch (e) {
      console.error('Error fetching today schedule:', e)
    } finally {
      setLoadingSchedule(false)
    }
  }

  const fetchStudentsList = async () => {
    setLoadingStudents(true)
    try {
      const response = await fetch('/api/teacher/students')
      const result = await response.json()
      if (response.ok) {
        setTodaysStudents(result.todaysStudents || [])
        setAllStudents(result.allStudents || [])
      }
    } catch (err) {
      console.error('Error fetching teacher students list:', err)
    } finally {
      setLoadingStudents(false)
    }
  }

  const getInitials = (name: string) => {
    if (!name) return '??'
    const parts = name.trim().split(/\s+/)
    return parts.map(p => p[0]).join('').substring(0, 2).toUpperCase()
  }

  useEffect(() => {
    fetchProfileName()
    fetchTodaySchedule()
    fetchStudentsList()
  }, [])

  // Report Submission Form States
  const [sabaq, setSabaq] = useState('')
  const [sabaqi, setSabaqi] = useState('')
  const [manzil, setManzil] = useState('')
  const [notes, setNotes] = useState('')
  const [yesterdayReport, setYesterdayReport] = useState('Sabaq: Surah Al-Baqarah v5-9 (Excellent)')
  const [feedback, setFeedback] = useState('')
  const [formSubmittedMsg, setFormSubmittedMsg] = useState('')

  const getYYYYMMDD = () => {
    const nowUtc = new Date()
    const nowPst = new Date(nowUtc.getTime() + (5 * 60 * 60 * 1000))
    const yyyy = nowPst.getUTCFullYear()
    const mm = String(nowPst.getUTCMonth() + 1).padStart(2, '0')
    const dd = String(nowPst.getUTCDate()).padStart(2, '0')
    return `${yyyy}${mm}${dd}`
  }

  const isClassActive = (start_time: string, duration_minutes: number) => {
    const nowUtc = new Date()
    const nowPst = new Date(nowUtc.getTime() + (5 * 60 * 60 * 1000))
    const curH = nowPst.getUTCHours()
    const curM = nowPst.getUTCMinutes()
    const curTotal = curH * 60 + curM

    const [h, m] = start_time.split(':').map(Number)
    const startTotal = h * 60 + m
    const endTotal = startTotal + duration_minutes

    return (curTotal >= startTotal && curTotal <= endTotal) || 
           (startTotal > curTotal && (startTotal - curTotal) <= 15)
  }

  const getPendingReports = () => {
    const nowUtc = new Date()
    const nowPst = new Date(nowUtc.getTime() + (5 * 60 * 60 * 1000))
    const curH = nowPst.getUTCHours()
    const curM = nowPst.getUTCMinutes()
    const curTotal = curH * 60 + curM

    return todaySchedules.filter(s => {
      if (s.is_completed) return false
      const [h, m] = s.start_time.split(':').map(Number)
      const endTotal = h * 60 + m + s.duration_minutes
      return curTotal > endTotal
    })
  }

  // Select active student derived state
  const selectedStudent = [...todaysStudents, ...allStudents].find(s => s.id === selectedStudentId)

  // Dynamic lesson history database states
  const [isSubmittingReport, setIsSubmittingReport] = useState(false)
  const [reportError, setReportError] = useState('')
  const [lessonHistory, setLessonHistory] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [nextPlan, setNextPlan] = useState('')

  const fetchLessonHistory = async (studentId: string) => {
    setLoadingHistory(true)
    try {
      const response = await fetch(`/api/teacher/lesson-history?student_id=${studentId}`)
      const result = await response.json()
      if (response.ok) {
        setLessonHistory(result.logs || [])
        
        // Update yesterday's report
        const logsList = result.logs || []
        if (logsList.length > 0) {
          const lastHifz = logsList[0]
          if (lastHifz && lastHifz.log_type === 'hifz') {
            setYesterdayReport(`Sabaq: ${lastHifz.sabaq} | Sabaqi: ${lastHifz.sabaqi} | Manzil: ${lastHifz.manzil}`)
          } else {
            setYesterdayReport(`Topic: ${lastHifz.topic_covered}`)
          }
        } else {
          setYesterdayReport('No previous lessons logged.')
        }
      }
    } catch (e) {
      console.error('Error fetching history:', e)
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    if (selectedStudentId) {
      fetchLessonHistory(selectedStudentId)
    }
  }, [selectedStudentId])

  // Auto select first student on desktop for preview
  useEffect(() => {
    const combined = [...todaysStudents, ...allStudents]
    if (!selectedStudentId && typeof window !== 'undefined' && window.innerWidth >= 1024 && combined.length > 0) {
      router.replace(`/teacher/dashboard?studentId=${combined[0].id}`)
    }
  }, [selectedStudentId, todaysStudents, allStudents, router])

  // Reset form fields when selected student changes
  useEffect(() => {
    setFormSubmittedMsg('')
    setReportError('')
    setSabaq('')
    setSabaqi('')
    setManzil('')
    setNotes('')
    setFeedback('')
    setNextPlan('')
  }, [selectedStudentId])

  // Update current time dynamic tracker
  useEffect(() => {
    const updateTime = () => {
      const date = new Date()
      let hours = date.getHours()
      const minutes = date.getMinutes()
      const ampm = hours >= 12 ? 'PM' : 'AM'
      hours = hours % 12
      hours = hours ? hours : 12
      const minutesStr = minutes < 10 ? '0' + minutes : minutes
      setCurrentTimeText(`${hours}:${minutesStr} ${ampm}`)
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent) return

    setIsSubmittingReport(true)
    setReportError('')
    setFormSubmittedMsg('')

    try {
      const isHifz = selectedStudent.courseName.toLowerCase().includes('hifz')
      const payload = {
        student_id: selectedStudent.id,
        log_type: isHifz ? 'hifz' : 'standard',
        sabaq: isHifz ? sabaq : '',
        sabaqi: isHifz ? sabaqi : '',
        manzil: isHifz ? manzil : '',
        topic_covered: isHifz ? 'Quran Hifz Lesson' : feedback,
        next_plan: isHifz ? 'Next Hifz Lesson Plan' : nextPlan,
        notes: notes
      }

      const response = await fetch('/api/teacher/submit-lesson-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (response.ok) {
        setFormSubmittedMsg(`Report submitted successfully for ${selectedStudent.full_name}!`)
        setSabaq('')
        setSabaqi('')
        setManzil('')
        setNotes('')
        setFeedback('')
        setNextPlan('')
        
        // Refresh schedule lists and history list
        fetchTodaySchedule()
        fetchLessonHistory(selectedStudent.id)
      } else {
        setReportError(result.error || 'Failed to submit lesson report.')
      }
    } catch (err: any) {
      setReportError(err.message || 'An error occurred during report submission.')
    } finally {
      setIsSubmittingReport(false)
    }
  }

  return (
    <>
      {/* ========================================== */}
      {/* PANEL 2: CENTER PANEL - MAIN CONTENT AREA  */}
      {/* ========================================== */}
      <main className="flex-1 bg-[#FAFAF7] overflow-y-auto p-4 sm:p-6 lg:p-8 h-full">
        
        {/* Back button on Mobile detail view */}
        {selectedStudentId && (
          <button
            onClick={() => {
              router.push('/teacher/dashboard')
            }}
            className="lg:hidden flex items-center gap-2 text-sm font-bold text-[#1B6B3A] mb-4 hover:underline"
          >
            ← Back to Student List
          </button>
        )}

        {/* Center Default view: Today's Schedule */}
        {!selectedStudentId ? (
          <div className="space-y-6">
            {/* Welcome Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 pb-5 gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900">
                  Assalamu Alaikum, {profileName}!
                </h1>
                <p className="text-xs sm:text-sm text-zinc-700 mt-1 font-sans">
                  Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}. Live Classroom System synced.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-zinc-200 text-xs text-zinc-700 font-mono shadow-xs self-start sm:self-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Time Tracker: {currentTimeText} (PKT)
              </div>
            </div>

            {/* Mobile Quick Stats Container */}
            <div className="lg:hidden grid gap-4 grid-cols-2">
              <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-sm text-center">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Completed Today</p>
                <h3 className="text-2xl font-serif font-black text-[#1B6B3A] mt-1">
                  {todaySchedules.filter(s => s.is_completed).length} / {todaySchedules.length}
                </h3>
              </div>
              <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-sm text-center">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Remaining Classes</p>
                <h3 className="text-2xl font-serif font-black text-rose-600 mt-1">
                  {todaySchedules.filter(s => !s.is_completed).length}
                </h3>
              </div>
            </div>

            {/* Imminent / Live Call Dashboard card on mobile */}
            {todaySchedules.find(s => !s.is_completed && isClassActive(s.start_time, s.duration_minutes)) && (
              (() => {
                const live = todaySchedules.find(s => !s.is_completed && isClassActive(s.start_time, s.duration_minutes))
                return (
                  <div className="lg:hidden">
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                          <Video className="h-5 w-5 animate-pulse" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Live Classroom Active Now</p>
                          <h4 className="text-sm font-bold text-zinc-900 truncate">{live.student_name}</h4>
                          <p className="text-[10px] text-zinc-500 font-mono">Slot: {live.start_time} ({live.duration_minutes} Mins)</p>
                        </div>
                      </div>
                      <a
                        href={`https://meet.virtualzawiyah.com/VZ-${teacherId}-${live.student_id}-${getYYYYMMDD()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B6B3A] text-white py-2 px-4 text-xs font-bold shadow-xs hover:bg-[#1B6B3A]/90 transition-all text-center font-sans"
                      >
                        Start Class Room
                      </a>
                    </div>
                  </div>
                )
              })()
            )}

            {/* Schedule Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-serif font-bold text-zinc-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#1B6B3A]" /> Today&apos;s Class Schedule
              </h2>

              {loadingSchedule ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#1B6B3A]" />
                </div>
              ) : todaySchedules.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 bg-white border border-zinc-200 rounded-2xl p-6 font-sans">
                  No classes scheduled for today.
                </div>
              ) : (
                <div className="grid gap-4">
                  {todaySchedules.map((item) => {
                    const isCompleted = item.is_completed
                    const isLive = !isCompleted && isClassActive(item.start_time, item.duration_minutes)
                    const isUpcoming = !isCompleted && !isLive

                    return (
                      <div 
                        key={item.assignment_id}
                        className={`rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all ${
                          isLive 
                            ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm' 
                            : 'bg-white border-zinc-200 shadow-xs'
                        }`}
                      >
                        <div className="min-w-0 font-sans">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-base font-bold text-zinc-900">{item.student_name}</h4>
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                              isLive ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                              isCompleted ? 'bg-zinc-150 text-zinc-700 border-zinc-200' :
                              'bg-amber-100 text-amber-800 border-amber-250'
                            }`}>
                              {isLive ? 'Live Now' : isCompleted ? 'Completed' : 'Upcoming'}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500 mt-1">Slot Time: {item.start_time} ({item.duration_minutes} Mins)</p>
                        </div>

                        <div className="flex items-center gap-3 font-sans">
                          {isLive && (
                            <a
                              href={`https://meet.virtualzawiyah.com/VZ-${teacherId}-${item.student_id}-${getYYYYMMDD()}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B6B3A] hover:bg-[#1B6B3A]/90 text-white font-bold py-2.5 px-5 text-xs shadow-md active:scale-95 transition-all animate-pulse"
                            >
                              <Video className="h-4 w-4" />
                              Start Class Now
                            </a>
                          )}
                          {isCompleted && (
                            <div className="flex items-center gap-1 text-emerald-800 text-xs font-semibold bg-emerald-100/60 border border-emerald-200 px-3 py-1.5 rounded-xl">
                              <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                              Session Logged
                            </div>
                          )}
                          {isUpcoming && (
                            <span className="text-xs font-bold text-zinc-500 bg-zinc-100 px-3 py-1.5 rounded-xl border border-zinc-200">
                              Locked
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

          </div>
        ) : (
          // Selected Student View Detail Panel
          <div className="space-y-8">
                       {/* Selected Student Profile Header */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-[#1B6B3A]/5 blur-3xl pointer-events-none" />
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-[#1B6B3A]/10 border border-[#1B6B3A]/20 flex items-center justify-center text-lg font-black text-[#1B6B3A] font-sans">
                  {getInitials(selectedStudent?.full_name)}
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-zinc-900">
                    {selectedStudent?.full_name}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-650 mt-0.5 font-sans">{selectedStudent?.courseName}</p>
                </div>
              </div>
              
              {/* Deselect Profile Button */}
              <button
                onClick={() => {
                  router.push('/teacher/dashboard')
                }}
                className="rounded-xl border border-zinc-300 bg-zinc-50 hover:bg-zinc-100 px-4 py-2 text-xs font-bold text-zinc-700 shadow-xs self-start sm:self-auto transition-all font-sans"
              >
                Deselect Student
              </button>
            </div>

            {/* Expanding Lesson History Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-serif font-bold text-zinc-900 flex items-center gap-2">
                  <FileText className="h-4.5 w-4.5 text-[#1B6B3A]" /> Lesson History & Past Reports
                </h3>
              </div>

              <div className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 shadow-sm space-y-4">
                {loadingHistory ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-[#1B6B3A]" />
                  </div>
                ) : lessonHistory.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic text-center py-4 font-sans">No lesson logs recorded for this student yet.</p>
                ) : (
                  <>
                    {/* Show the very first report by default */}
                    <div className="border-b border-zinc-150 pb-4 last:border-b-0 last:pb-0 font-sans">
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                        <span className="text-xs text-zinc-500 font-semibold">Date Logged: {lessonHistory[0].class_date}</span>
                        <span className="text-[10px] bg-zinc-100 px-2 py-0.5 rounded text-zinc-650 font-mono font-bold uppercase tracking-wider">
                          {lessonHistory[0].log_type}
                        </span>
                      </div>
                      
                      {lessonHistory[0].log_type === 'hifz' ? (
                        <div className="grid gap-2.5 sm:grid-cols-3 text-xs">
                          <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
                            <span className="block font-bold text-[#1B6B3A] mb-0.5">Sabaq:</span>
                            <span className="text-zinc-750">{lessonHistory[0].sabaq}</span>
                          </div>
                          <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
                            <span className="block font-bold text-[#C9A84C] mb-0.5">Sabaqi:</span>
                            <span className="text-zinc-750">{lessonHistory[0].sabaqi}</span>
                          </div>
                          <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
                            <span className="block font-bold text-rose-750 mb-0.5">Manzil:</span>
                            <span className="text-zinc-750">{lessonHistory[0].manzil}</span>
                          </div>
                          {lessonHistory[0].notes && (
                            <div className="sm:col-span-3 bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
                              <span className="block font-bold text-zinc-500 mb-0.5">Notes:</span>
                              <span className="text-zinc-750">{lessonHistory[0].notes}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2 text-xs">
                          <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
                            <span className="block font-bold text-zinc-600 mb-0.5">Topic Covered:</span>
                            <span className="text-zinc-750">{lessonHistory[0].topic_covered}</span>
                          </div>
                          <div className="grid gap-2 sm:grid-cols-2">
                            <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
                              <span className="block font-bold text-zinc-500 mb-0.5">Next Lesson Plan:</span>
                              <span className="text-zinc-750">{lessonHistory[0].next_plan}</span>
                            </div>
                            {lessonHistory[0].notes && (
                              <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
                                <span className="block font-bold text-zinc-500 mb-0.5">Teacher Notes:</span>
                                <span className="text-zinc-755">{lessonHistory[0].notes}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Expandable Previous Reports */}
                    {lessonHistory.length > 1 && (
                      <div className="pt-2 font-sans">
                        {isHistoryExpanded && (
                          <div className="space-y-4 border-t border-zinc-150 pt-4 mb-4">
                            {lessonHistory.slice(1).map((lesson) => (
                              <div key={lesson.id} className="pb-4 border-b border-zinc-150 last:border-b-0 last:pb-0">
                                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                                  <span className="text-xs text-zinc-500 font-semibold">Date Logged: {lesson.class_date}</span>
                                  <span className="text-[10px] bg-zinc-100 px-2 py-0.5 rounded text-zinc-650 font-mono font-bold uppercase tracking-wider">
                                    {lesson.log_type}
                                  </span>
                                </div>
                                {lesson.log_type === 'hifz' ? (
                                  <div className="grid gap-2.5 sm:grid-cols-3 text-xs">
                                    <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
                                      <span className="block font-bold text-[#1B6B3A] mb-0.5">Sabaq:</span>
                                      <span className="text-zinc-750">{lesson.sabaq}</span>
                                    </div>
                                    <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
                                      <span className="block font-bold text-[#C9A84C] mb-0.5">Sabaqi:</span>
                                      <span className="text-zinc-750">{lesson.sabaqi}</span>
                                    </div>
                                    <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
                                      <span className="block font-bold text-rose-750 mb-0.5">Manzil:</span>
                                      <span className="text-zinc-750">{lesson.manzil}</span>
                                    </div>
                                    {lesson.notes && (
                                      <div className="sm:col-span-3 bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
                                        <span className="block font-bold text-zinc-505 mb-0.5">Notes:</span>
                                        <span className="text-zinc-750">{lesson.notes}</span>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="space-y-2 text-xs">
                                    <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
                                      <span className="block font-bold text-zinc-650 mb-0.5">Topic Covered:</span>
                                      <span className="text-zinc-755">{lesson.topic_covered}</span>
                                    </div>
                                    <div className="grid gap-2 sm:grid-cols-2">
                                      <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
                                        <span className="block font-bold text-zinc-550 mb-0.5">Next Lesson Plan:</span>
                                        <span className="text-zinc-755">{lesson.next_plan}</span>
                                      </div>
                                      {lesson.notes && (
                                        <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
                                          <span className="block font-bold text-zinc-550 mb-0.5">Teacher Notes:</span>
                                          <span className="text-zinc-755">{lesson.notes}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        <button
                          onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                          className="w-full text-center text-xs font-bold text-[#1B6B3A] hover:text-[#1B6B3A]/80 transition-all flex items-center justify-center gap-1.5 py-1"
                        >
                          {isHistoryExpanded ? (
                            <>Hide Previous Reports <ChevronUp className="h-4 w-4" /></>
                          ) : (
                            <>View Previous Reports ({lessonHistory.length - 1}) <ChevronDown className="h-4 w-4" /></>
                          )}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Submit Lesson Report Form */}
            <div className="space-y-3">
              <h3 className="text-base font-serif font-bold text-zinc-900 flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-[#1B6B3A]" /> Submit Today&apos;s Lesson Report
              </h3>

              <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
                {formSubmittedMsg && (
                  <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-100/60 p-4 text-sm text-emerald-800 font-sans">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-700" />
                    {formSubmittedMsg}
                  </div>
                )}
                {reportError && (
                  <div className="mb-6 rounded-lg border border-rose-250 bg-rose-50 p-3 text-center text-xs font-semibold text-rose-700 font-sans">
                    {reportError}
                  </div>
                )}

                <form onSubmit={handleReportSubmit} className="space-y-5">
                  {selectedStudent?.courseName.toLowerCase().includes('hifz') ? (
                    // 5-field Hifz Report Form
                    <div className="space-y-4 font-sans">
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                          <label className="block text-xs font-bold text-zinc-650 uppercase tracking-wider mb-2">Sabaq (New Lesson)</label>
                          <input
                            type="text"
                            value={sabaq}
                            onChange={(e) => setSabaq(e.target.value)}
                            placeholder="Surah & verses"
                            className="w-full text-sm rounded-xl border border-zinc-200 p-3 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] transition-all"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-zinc-650 uppercase tracking-wider mb-2">Sabaqi (Recent Revision)</label>
                          <input
                            type="text"
                            value={sabaqi}
                            onChange={(e) => setSabaqi(e.target.value)}
                            placeholder="Sub-recent pages"
                            className="w-full text-sm rounded-xl border border-zinc-200 p-3 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] transition-all"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-zinc-650 uppercase tracking-wider mb-2">Manzil (Revision)</label>
                          <input
                            type="text"
                            value={manzil}
                            onChange={(e) => setManzil(e.target.value)}
                            placeholder="Revision Juz/chapters"
                            className="w-full text-sm rounded-xl border border-zinc-200 p-3 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] transition-all"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-zinc-650 uppercase tracking-wider mb-2">Yesterday&apos;s Report (Read Only)</label>
                        <input
                          type="text"
                          value={yesterdayReport}
                          disabled
                          className="w-full text-sm rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-500 p-3"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-zinc-650 uppercase tracking-wider mb-2">Additional Notes / Homework</label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Add specific mistakes, Tajweed feedback, or next lesson goals..."
                          rows={3}
                          className="w-full text-sm rounded-xl border border-zinc-200 p-3 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] transition-all"
                        />
                      </div>
                    </div>
                  ) : (
                    // Standard Course Form (Topic Covered + Next Plan + Notes)
                    <div className="space-y-4 font-sans">
                      <div>
                        <label className="block text-xs font-bold text-zinc-650 uppercase tracking-wider mb-2">Lesson Details Covered Today</label>
                        <textarea
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="Detail topics covered, student comprehension details, etc..."
                          rows={4}
                          className="w-full text-sm rounded-xl border border-zinc-200 p-3 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-650 uppercase tracking-wider mb-2">Next Lesson Plan</label>
                        <input
                          type="text"
                          value={nextPlan}
                          onChange={(e) => setNextPlan(e.target.value)}
                          placeholder="What will be covered next class..."
                          className="w-full text-sm rounded-xl border border-zinc-200 p-3 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-650 uppercase tracking-wider mb-2">Additional Notes / Homework</label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Homework instructions, private teacher observations..."
                          rows={3}
                          className="w-full text-sm rounded-xl border border-zinc-200 p-3 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmittingReport}
                      className="w-full bg-[#1B6B3A] hover:bg-[#1B6B3A]/90 text-white font-bold py-3 px-6 rounded-xl text-sm shadow-xs transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                      {isSubmittingReport && <Loader2 className="h-4 w-4 animate-spin" />}
                      {isSubmittingReport ? 'Submitting Lesson Report...' : 'Submit Session Report'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ========================================== */}
      {/* PANEL 3: RIGHT SIDEBAR - QUICK ACCESS ITEMS*/}
      {/* ========================================== */}
      <aside className="hidden lg:block lg:w-80 shrink-0 bg-[#FAFAF7] p-8 border-l border-zinc-200 space-y-6 overflow-y-auto h-full">
               {/* Start Class Now Card (Only visible/highlighted when class is active/imminent) */}
        {(() => {
          const activeClass = todaySchedules.find(s => !s.is_completed && isClassActive(s.start_time, s.duration_minutes))
          if (activeClass) {
            return (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 shadow-sm space-y-3 font-sans">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded">
                    Live Classroom
                  </span>
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                </div>
                
                <div>
                  <h4 className="text-base font-bold text-zinc-900 font-serif">{activeClass.student_name}</h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5 leading-none">Active Session</p>
                  <p className="text-[10px] text-zinc-650 font-mono mt-2 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> Slot: {activeClass.start_time} ({activeClass.duration_minutes} Mins)
                  </p>
                </div>

                <a
                  href={`https://meet.virtualzawiyah.com/VZ-${teacherId}-${activeClass.student_id}-${getYYYYMMDD()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B6B3A] text-white hover:bg-[#1B6B3A]/90 py-2.5 px-4 text-xs font-bold shadow-sm transition-all"
                >
                  <Video className="h-4 w-4" />
                  Start Class Room
                </a>
              </div>
            )
          }
          return (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-2 text-center font-sans">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Classroom Status</span>
              <p className="text-xs text-zinc-550 italic">No active live classroom session right now.</p>
            </div>
          )
        })()}

        {/* Pending Lesson Reports Checklist */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4 font-sans">
          <h4 className="text-sm font-bold text-zinc-800 uppercase tracking-wider">
            Pending Reports
          </h4>
          
          <div className="space-y-3">
            {(() => {
              const pending = getPendingReports()
              if (pending.length === 0) {
                return <p className="text-xs text-zinc-500 italic">All completed classes logged! Good job.</p>
              }
              return pending.map(pr => (
                <div key={pr.assignment_id} className="flex items-center justify-between border-b border-zinc-100 pb-2.5 last:border-b-0 last:pb-0 gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-800 truncate">{pr.student_name}</p>
                    <p className="text-[9px] text-zinc-500 truncate mt-0.5">Ended at {pr.start_time}</p>
                  </div>
                  <button
                    onClick={() => router.push(`/teacher/dashboard?studentId=${pr.student_id}`)}
                    className="shrink-0 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold px-2.5 py-1.5 border border-rose-200/55 transition-all"
                  >
                    Log Now
                  </button>
                </div>
              ))
            })()}
          </div>
        </div>

        {/* Today's Summary statistics */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4 font-sans">
          <h4 className="text-sm font-bold text-zinc-800 uppercase tracking-wider">
            Today&apos;s Summary
          </h4>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3">
              <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Completed</span>
              <span className="text-xl font-black text-[#1B6B3A]">{todaySchedules.filter(s => s.is_completed).length}</span>
            </div>
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3">
              <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Remaining</span>
              <span className="text-xl font-black text-zinc-800">{todaySchedules.filter(s => !s.is_completed).length}</span>
            </div>
          </div>
        </div>

      </aside>
    </>
  )
}

export default function TeacherDashboard() {
  return (
    <Suspense fallback={<div className="p-8 text-zinc-500">Loading Dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  )
}
