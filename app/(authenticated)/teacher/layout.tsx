'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { 
  Search, 
  Menu, 
  X,
  LayoutDashboard,
  Wallet,
  LogOut,
  Briefcase,
  AlertTriangle,
  UserCheck,
  Calendar,
  Loader2
} from 'lucide-react'

import BackToFounderBanner from '@/components/BackToFounderBanner'
import NotificationBell from '@/components/NotificationBell'

// --- Mock Students List ---
interface StudentMock {
  id: string
  fullName: string
  avatarInitials: string
  courseName: string
}

const MOCK_STUDENTS: StudentMock[] = [
  { id: 'student-ahmed', fullName: 'Ahmed Bilal', avatarInitials: 'AB', courseName: 'Quran Memorization (Hifz)' },
  { id: 'student-sara', fullName: 'Sara Bilal', avatarInitials: 'SB', courseName: 'Dars-e-Nizami' },
  { id: 'student-yusuf', fullName: 'Yusuf Khan', avatarInitials: 'YK', courseName: 'Quran Reading (Nazra)' },
  { id: 'student-anisa', fullName: 'Anisa Fatima', avatarInitials: 'AF', courseName: 'Islamic Studies' },
  { id: 'student-zainab', fullName: 'Zainab Ali', avatarInitials: 'ZA', courseName: 'Quran Memorization (Hifz)' }
]

const MOCK_TODAY_SCHEDULE = [
  { studentId: 'student-yusuf', timeText: '10:00 AM' },
  { studentId: 'student-ahmed', timeText: '5:00 PM' },
  { studentId: 'student-sara', timeText: '7:00 PM' }
]

interface LeaveRequestMock {
  id: string
  date: string
  time: string
  reason: string
  status: 'Pending' | 'Approved' | 'Rejected'
}

interface MakeupRequestMock {
  id: string
  studentName: string
  course: string
  requestedTime: string
  reason: string
  status: 'Pending' | 'Accepted' | 'Declined'
}

const MOCK_LEAVE_REQUESTS: LeaveRequestMock[] = [
  {
    id: 'leave-1',
    date: '2026-06-15',
    time: '18:00',
    reason: 'Family event travel',
    status: 'Approved'
  },
  {
    id: 'leave-2',
    date: '2026-06-25',
    time: '17:00',
    reason: 'Medical checkup appointment',
    status: 'Pending'
  }
]

const MOCK_MAKEUP_REQUESTS: MakeupRequestMock[] = [
  {
    id: 'makeup-1',
    studentName: 'Zainab Ali',
    course: 'Quran Memorization (Hifz)',
    requestedTime: 'Monday, June 22 at 4:00 PM (PKT)',
    reason: 'Power outage during scheduled class slot',
    status: 'Pending'
  }
]

export default function TeacherLayout({
  children
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  
  // UI & Search States
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Teacher Profile state
  const [profile, setProfile] = useState<{ full_name: string; email: string } | null>(null)

  // Leave Form Input States
  const [leaveDate, setLeaveDate] = useState('')
  const [leaveTime, setLeaveTime] = useState('')
  const [leaveReason, setLeaveReason] = useState('')
  const [leaveError, setLeaveError] = useState('')
  const [leaveSuccess, setLeaveSuccess] = useState('')
  const [leaveRequests, setLeaveRequests] = useState<any[]>([])

  // Makeup Requests State
  const [makeupRequests, setMakeupRequests] = useState<any[]>([])

  // Sibling student states loaded from API
  const [todaysStudents, setTodaysStudents] = useState<any[]>([])
  const [allStudents, setAllStudents] = useState<any[]>([])
  const [loadingStudents, setLoadingStudents] = useState(true)

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

  const fetchLeaveRequests = async () => {
    try {
      const response = await fetch('/api/teacher/leave')
      const result = await response.json()
      if (response.ok) {
        setLeaveRequests(result.leaves || [])
      }
    } catch (e) {
      console.error('Error fetching leave requests:', e)
    }
  }

  const fetchMakeupRequests = async () => {
    try {
      const response = await fetch('/api/teacher/makeup')
      const result = await response.json()
      if (response.ok) {
        setMakeupRequests(result.makeups || [])
      }
    } catch (e) {
      console.error('Error fetching makeup requests:', e)
    }
  }

  useEffect(() => {
    fetchStudentsList()
    fetchLeaveRequests()
    fetchMakeupRequests()
  }, [])

  // Listen to studentId query parameter to highlight sidebar correctly
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      setSelectedStudentId(params.get('studentId'))
    }
  }, [pathname])

  // Fetch teacher profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', session.user.id)
            .single()
          if (!error && data) {
            setProfile({
              full_name: data.full_name,
              email: data.email || session.user.email || ''
            })
          }
        }
      } catch (err) {
        console.error('Error fetching teacher profile:', err)
      }
    }
    fetchProfile()
  }, [])

  const handleLogout = async () => {
    document.cookie = 'vz_user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;'
    try {
      await supabase.auth.signOut()
    } catch (e) {
      console.error('Logout error:', e)
    }
    window.location.href = '/staff/login'
  }

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLeaveError('')
    setLeaveSuccess('')

    if (!leaveDate || !leaveTime) {
      setLeaveError('Please specify both the class date and time.')
      return
    }

    try {
      const combinedDateTime = `${leaveDate}T${leaveTime}`
      const start = new Date(combinedDateTime)
      const end = new Date(start.getTime() + 30 * 60 * 1000) // Default 30 mins slot duration
      
      const response = await fetch('/api/teacher/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_date: start.toISOString(),
          end_date: end.toISOString(),
          reason: leaveReason
        })
      })

      const result = await response.json()

      if (response.ok) {
        setLeaveSuccess(`Leave request submitted successfully!`)
        setLeaveReason('')
        setLeaveDate('')
        setLeaveTime('')
        fetchLeaveRequests()
      } else {
        setLeaveError(result.error || 'Failed to submit leave request.')
      }
    } catch (err: any) {
      setLeaveError(err.message || 'An error occurred.')
    }
  }

  const handleAcceptMakeup = async (id: string) => {
    try {
      const response = await fetch('/api/teacher/makeup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          makeup_request_id: id,
          decision: 'scheduled'
        })
      })
      if (response.ok) {
        fetchMakeupRequests()
      }
    } catch (e) {
      console.error('Error accepting makeup request:', e)
    }
  }

  const handleDeclineMakeup = async (id: string) => {
    try {
      const response = await fetch('/api/teacher/makeup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          makeup_request_id: id,
          decision: 'cancelled'
        })
      })
      if (response.ok) {
        fetchMakeupRequests()
      }
    } catch (e) {
      console.error('Error declining makeup request:', e)
    }
  }

  const handleSelectStudent = (id: string) => {
    setSelectedStudentId(id)
    setIsDrawerOpen(false)
    // Always navigate back to dashboard when selecting a student to view details/log report
    router.push(`/teacher/dashboard?studentId=${id}`)
  }

  // Filter students based on search
  const filteredToday = todaysStudents.filter(s => 
    s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.courseName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredAll = allStudents.filter(s => 
    s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.courseName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getInitials = (name: string) => {
    if (!name) return '??'
    const parts = name.trim().split(/\s+/)
    return parts.map(p => p[0]).join('').substring(0, 2).toUpperCase()
  }



  const isDashboardActive = pathname === '/teacher/dashboard'
  const isWalletActive = pathname === '/teacher/wallet'

  return (
    <div className="h-screen w-full bg-[#FAFAF7] text-zinc-800 font-sans relative flex flex-col overflow-hidden">
      <BackToFounderBanner />
      
      {/* Header Mobile Nav Bar */}
      <div className="lg:hidden border-b border-zinc-200 bg-white px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-100 active:scale-95 transition-all"
            title="Open Drawer Menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div>
            <span className="font-serif font-bold text-base text-zinc-900 leading-tight block">Virtual Zawiyah</span>
            <span className="text-[8px] uppercase tracking-widest text-[#1B6B3A] font-bold block leading-none mt-0.5">TEACHER PORTAL</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <div className="flex bg-zinc-100 rounded-xl p-0.5 border border-zinc-200">
            <Link
              href="/teacher/dashboard"
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                isDashboardActive
                  ? 'bg-[#1B6B3A] text-white shadow-xs'
                  : 'text-zinc-650 hover:text-zinc-900'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/teacher/wallet"
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                isWalletActive
                  ? 'bg-[#1B6B3A] text-white shadow-xs'
                  : 'text-zinc-650 hover:text-zinc-900'
              }`}
            >
              Wallet
            </Link>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">

        {/* ========================================== */}
        {/* PERSISTENT LEFT SIDEBAR - STUDENTS LIST    */}
        {/* ========================================== */}
        <aside className="hidden lg:flex lg:w-80 lg:shrink-0 border-r border-zinc-200 bg-white flex-col h-full overflow-hidden">
          <div className="flex border-b border-zinc-100 px-6 py-4 items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsDrawerOpen(true)}
                className="p-1.5 rounded-lg text-zinc-650 hover:bg-zinc-100 hover:text-zinc-900 active:scale-95 transition-all"
                title="Open Drawer Menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <img src="/weblogo-01.png" alt="Virtual Zawiyah Logo" className="h-8 w-auto object-contain" />
              <div>
                <span className="text-sm font-bold font-serif text-zinc-900 leading-tight block">Virtual Zawiyah</span>
                <span className="block text-[9px] uppercase tracking-wider text-[#1B6B3A] font-bold leading-none mt-0.5">TEACHER PORTAL</span>
              </div>
            </div>
            <NotificationBell align="left" />
          </div>

          {/* Portal Navigation Section */}
          <div className="px-4 py-3 border-b border-zinc-100 shrink-0">
            <div className="grid grid-cols-2 gap-1 bg-zinc-100 rounded-xl p-1 border border-zinc-200">
              <Link 
                href="/teacher/dashboard" 
                className={`flex items-center justify-center gap-1.5 p-2 rounded-lg text-xs font-bold transition-all ${
                  isDashboardActive 
                    ? 'bg-white text-[#1B6B3A] shadow-xs' 
                    : 'text-zinc-650 hover:text-zinc-900'
                }`}
                title="Dashboard"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link 
                href="/teacher/wallet" 
                className={`flex items-center justify-center gap-1.5 p-2 rounded-lg text-xs font-bold transition-all ${
                  isWalletActive 
                    ? 'bg-white text-[#1B6B3A] shadow-xs' 
                    : 'text-zinc-650 hover:text-zinc-900'
                }`}
                title="My Wallet"
              >
                <Wallet className="h-4 w-4" />
                <span>My Wallet</span>
              </Link>
            </div>
          </div>

          {/* Search bar */}
          <div className="p-4 border-b border-zinc-100">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] transition-all"
              />
            </div>
          </div>

          {/* Students List Scroll Area */}
          <div className="flex-1 overflow-y-auto p-2 space-y-4">
            {loadingStudents ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-2">
                <Loader2 className="h-6 w-6 animate-spin text-[#1B6B3A]" />
                <span className="text-xs text-zinc-500 font-sans">Loading assigned students...</span>
              </div>
            ) : (
              <>
                {/* Group 1: Today's Classes */}
                <div>
                  <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Today&apos;s Classes
                  </h4>
                  <div className="space-y-0.5">
                    {filteredToday.map(s => {
                      const isSelected = selectedStudentId === s.id
                      return (
                        <div
                          key={s.id}
                          onClick={() => handleSelectStudent(s.id)}
                          className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-150 ${
                            isSelected 
                              ? 'bg-[#1B6B3A]/10 border-l-4 border-[#1B6B3A] text-zinc-900 font-semibold shadow-xs' 
                              : 'hover:bg-zinc-50 text-zinc-700 hover:text-zinc-900'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              isSelected ? 'bg-[#1B6B3A] text-white' : 'bg-zinc-100 text-zinc-600'
                            }`}>
                              {getInitials(s.full_name)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold truncate leading-tight">{s.full_name}</p>
                              <p className="text-[10px] text-zinc-500 truncate mt-0.5">{s.courseName}</p>
                            </div>
                          </div>
                          <div className="shrink-0 pl-2 text-right">
                            <span className="text-[9px] font-bold text-[#C9A84C] font-mono bg-[#C9A84C]/10 px-1.5 py-0.5 rounded">
                              {s.scheduled_time}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                    {filteredToday.length === 0 && (
                      <p className="text-xs text-zinc-400 italic px-3 py-2 font-sans">No matching students with classes today.</p>
                    )}
                  </div>
                </div>

                {/* Group 2: All Students */}
                <div>
                  <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    All Assigned Students
                  </h4>
                  <div className="space-y-0.5">
                    {filteredAll.map(s => {
                      const isSelected = selectedStudentId === s.id
                      return (
                        <div
                          key={s.id}
                          onClick={() => handleSelectStudent(s.id)}
                          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-150 ${
                            isSelected 
                              ? 'bg-[#1B6B3A]/10 border-l-4 border-[#1B6B3A] text-zinc-900 font-semibold shadow-xs' 
                              : 'hover:bg-zinc-50 text-zinc-700 hover:text-zinc-900'
                          }`}
                        >
                          <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSelected ? 'bg-[#1B6B3A] text-white' : 'bg-zinc-100 text-zinc-600'
                          }`}>
                            {getInitials(s.full_name)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate leading-tight">{s.full_name}</p>
                            <p className="text-[10px] text-zinc-500 truncate mt-0.5">{s.courseName}</p>
                          </div>
                        </div>
                      )
                    })}
                    {filteredAll.length === 0 && (
                      <p className="text-xs text-zinc-400 italic px-3 py-2 font-sans">No other assigned students.</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User profile bottom bar */}
          <div className="border-t border-zinc-200 bg-zinc-50/50 p-4 shrink-0 mt-auto">
            <div className="flex items-center gap-3 mb-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-zinc-200 text-zinc-700 shadow-sm shrink-0 font-bold text-sm">
                UA
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-zinc-800 font-sans">
                  {profile?.full_name || 'Ustadh Ahmad'}
                </p>
                <p className="truncate text-[10px] text-zinc-500">
                  {profile?.email || 'ahmad.bilal@gmail.com'}
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

        {/* Content View Area */}
        <div className="flex-1 flex h-full overflow-hidden relative">
          {children}
        </div>

      </div>

      {/* ========================================== */}
      {/* LEFT DRAWER MENU (Slides out from ☰)       */}
      {/* ========================================== */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Semi-transparent backdrop overlay */}
          <div 
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-zinc-900/60 backdrop-blur-xs transition-opacity duration-300"
          />

          {/* Drawer Panel Container */}
          <aside className="relative flex w-80 max-w-[85vw] flex-col bg-white h-full shadow-2xl z-10 transition-all duration-300 animate-slide-in-left overflow-y-auto">
            
            {/* Drawer Header */}
            <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
              <div className="flex items-center gap-2">
                <img src="/weblogo-01.png" alt="Virtual Zawiyah" className="h-8 w-auto object-contain" />
                <span className="font-serif font-bold text-base text-zinc-900">Ustadh Controls</span>
              </div>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 active:scale-95 transition-all"
                title="Close Menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation Tabs in Drawer */}
            <div className="px-5 py-3 border-b border-zinc-100 shrink-0">
              <div className="grid grid-cols-2 gap-1 bg-zinc-100 rounded-xl p-1 border border-zinc-200">
                <Link 
                  href="/teacher/dashboard" 
                  onClick={() => setIsDrawerOpen(false)}
                  className={`flex items-center justify-center gap-1.5 p-2 rounded-lg text-xs font-bold transition-all ${
                    isDashboardActive 
                      ? 'bg-white text-[#1B6B3A] shadow-xs' 
                      : 'text-zinc-650 hover:text-zinc-900'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link 
                  href="/teacher/wallet" 
                  onClick={() => setIsDrawerOpen(false)}
                  className={`flex items-center justify-center gap-1.5 p-2 rounded-lg text-xs font-bold transition-all ${
                    isWalletActive 
                      ? 'bg-white text-[#1B6B3A] shadow-xs' 
                      : 'text-zinc-650 hover:text-zinc-905'
                  }`}
                >
                  <Wallet className="h-4 w-4" />
                  <span>Wallet</span>
                </Link>
              </div>
            </div>

            {/* Scrollable Content (Students & Controls) */}
            <div className="p-5 flex-1 overflow-y-auto space-y-6">
              {/* Search bar inside drawer */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              {/* Today's Classes */}
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">Today&apos;s Classes</h4>
                <div className="space-y-1">
                  {filteredToday.map((s: any) => {
                    const isSelected = selectedStudentId === s.id
                    return (
                      <div
                        key={s.id}
                        onClick={() => handleSelectStudent(s.id)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer ${
                          isSelected ? 'bg-[#1B6B3A]/10 text-zinc-900 font-semibold' : 'hover:bg-zinc-50'
                        }`}
                      >
                        <span className="text-xs truncate font-sans">{s.full_name}</span>
                        <span className="text-[9px] text-[#C9A84C] font-mono">{s.scheduled_time}</span>
                      </div>
                    )
                  })}
                  {filteredToday.length === 0 && (
                    <p className="text-xs text-zinc-400 italic p-2 font-sans">No classes today.</p>
                  )}
                </div>
              </div>

              {/* All Students */}
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">All Students</h4>
                <div className="space-y-1">
                  {filteredAll.map((s: any) => {
                    const isSelected = selectedStudentId === s.id
                    return (
                      <div
                        key={s.id}
                        onClick={() => handleSelectStudent(s.id)}
                        className={`p-2 rounded-lg cursor-pointer text-xs ${
                          isSelected ? 'bg-[#1B6B3A]/10 text-zinc-900 font-semibold' : 'hover:bg-zinc-50'
                        }`}
                      >
                        <span className="font-sans">{s.full_name}</span>
                      </div>
                    )
                  })}
                  {filteredAll.length === 0 && (
                    <p className="text-xs text-zinc-400 italic p-2 font-sans">No other students.</p>
                  )}
                </div>
              </div>

              <hr className="border-zinc-150" />

              {/* 1. Leave Requests */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1B6B3A] border-b border-[#1B6B3A]/10 pb-1 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" /> Leave Requests
                </h4>
                
                {/* Form to submit request */}
                <form onSubmit={handleLeaveSubmit} className="space-y-3 bg-zinc-50 border border-zinc-200 p-3 rounded-xl">
                  {leaveSuccess && (
                    <div className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 p-2 rounded-lg font-sans">
                      {leaveSuccess}
                    </div>
                  )}
                  {leaveError && (
                    <div className="text-[10px] bg-rose-100 text-rose-800 border border-rose-200 p-2 rounded-lg flex gap-1 items-start font-sans">
                      <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5 text-rose-700" />
                      <span>{leaveError}</span>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Class Date</label>
                    <input 
                      type="date"
                      value={leaveDate}
                      onChange={(e) => setLeaveDate(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#1B6B3A] focus:border-[#1B6B3A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Class Time</label>
                    <input 
                      type="time"
                      value={leaveTime}
                      onChange={(e) => setLeaveTime(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#1B6B3A] focus:border-[#1B6B3A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Reason</label>
                    <input 
                      type="text"
                      placeholder="e.g. Travel, sickness"
                      value={leaveReason}
                      onChange={(e) => setLeaveReason(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#1B6B3A] focus:border-[#1B6B3A]"
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    className="w-full py-2 bg-[#1B6B3A] text-white hover:bg-[#1B6B3A]/90 font-bold rounded-lg text-xs transition-all active:scale-98"
                  >
                    Submit Leave Request
                  </button>
                </form>

                {/* Leave request history */}
                <div className="space-y-1.5 font-sans">
                  <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Leave History</span>
                  {leaveRequests.length === 0 ? (
                    <p className="text-[10px] text-zinc-400 italic">No leave history recorded.</p>
                  ) : (
                    leaveRequests.map(lr => {
                      const statusClean = (lr.status || '').toLowerCase()
                      const dateStr = lr.start_date ? new Date(lr.start_date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'N/A'
                      return (
                        <div key={lr.id} className="flex justify-between items-center text-xs p-2 bg-zinc-50 border border-zinc-200 rounded-lg">
                          <div className="min-w-0">
                            <p className="font-bold text-zinc-800 font-mono text-[10px]">{dateStr}</p>
                            <p className="text-[10px] text-zinc-505 truncate">{lr.reason}</p>
                          </div>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                            statusClean === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                            statusClean === 'rejected' ? 'bg-rose-100 text-rose-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {lr.status}
                          </span>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* 2. Makeup Requests */}
              <div className="space-y-3 font-sans">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1B6B3A] border-b border-[#1B6B3A]/10 pb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Makeup Requests
                </h4>

                <div className="space-y-2">
                  {makeupRequests.map(mr => {
                    const statusClean = (mr.status || '').toLowerCase()
                    return (
                      <div key={mr.id} className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
                        <div>
                          <p className="text-xs font-bold text-zinc-850">{mr.studentName}</p>
                          <p className="text-[10px] font-semibold text-zinc-700 mt-1 font-mono">{mr.requestedTime}</p>
                        </div>

                        {statusClean === 'pending' ? (
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => handleAcceptMakeup(mr.id)}
                              className="flex-1 py-1.5 bg-[#1B6B3A] hover:bg-[#1B6B3A]/90 text-white rounded-lg text-[10px] font-bold transition-all active:scale-95"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleDeclineMakeup(mr.id)}
                              className="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-250 rounded-lg text-[10px] font-bold transition-all active:scale-95"
                            >
                              Decline
                            </button>
                          </div>
                        ) : (
                          <div className={`text-center py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                            statusClean === 'scheduled' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {mr.status}
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {makeupRequests.length === 0 && (
                    <p className="text-xs text-zinc-400 italic">No makeup requests pending.</p>
                  )}
                </div>
              </div>

              {/* 3. My Attendance & Punctuality */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1B6B3A] border-b border-[#1B6B3A]/10 pb-1 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5" /> My Record
                </h4>
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-2.5">
                    <span className="block text-[8px] font-bold text-zinc-400 uppercase">Attendance</span>
                    <span className="text-sm font-black text-zinc-800">99.2%</span>
                  </div>
                  <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-2.5">
                    <span className="block text-[8px] font-bold text-zinc-400 uppercase">Late Starts</span>
                    <span className="text-sm font-black text-[#C9A84C]">1 / 45</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile footer inside drawer */}
            <div className="border-t border-zinc-200 bg-zinc-50/50 p-4">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-zinc-200 font-bold text-sm text-zinc-700 shadow-sm shrink-0">
                  UA
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-zinc-800">{profile?.full_name || 'Ustadh Ahmad'}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white py-2 text-[10px] font-bold text-zinc-700 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>

          </aside>
        </div>
      )}

    </div>
  )
}
