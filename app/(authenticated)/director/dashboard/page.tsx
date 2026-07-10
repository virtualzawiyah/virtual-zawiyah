'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  ShieldAlert, 
  FileText, 
  LogOut,
  TrendingUp,
  UserCheck,
  Users,
  AlertTriangle,
  Download,
  Building,
  DollarSign,
  Loader2
} from 'lucide-react'
import GeometricPattern from '@/components/GeometricPattern'
import BackToFounderBanner from '@/components/BackToFounderBanner'
import NotificationBell from '@/components/NotificationBell'

// --- Interfaces ---
interface SupervisorMock {
  id: string
  name: string
  teachersCount: number
  studentsCount: number
  disputesResolved: number
  disputesPending: number
}

interface EscalationMock {
  id: string
  description: string
  involvedParties: string
  supervisorName: string
  status: 'Pending' | 'Approved' | 'Declined' | 'Resolved'
  directorNotes?: string
}

interface DisciplinaryApprovalMock {
  id: string
  teacherName: string
  recommendingSupervisor: string
  reason: string
  dateRecommended: string
  status: 'Pending' | 'Approved' | 'Declined'
}

interface NonTeachingStaffMock {
  id: string
  name: string
  role: 'Security Guard' | 'Office Boy' | 'Cleaner' | 'Other'
  contactNumber: string
  joiningDate: string
  status: 'Active' | 'Removed'
}

interface SupportLeaveRequestMock {
  id: string
  staffName: string
  role: string
  startDate: string
  durationDays: number
  reason: string
  status: 'Pending' | 'Approved' | 'Declined'
}

interface OperationsReportMock {
  id: string
  title: string
  dateGenerated: string
  category: string
  fileSize: string
}

// --- Initial Mock Data ---

const INITIAL_REPORTS: OperationsReportMock[] = [
  { id: 'REP-01', title: 'June 2026 — Academy-Wide Summary', dateGenerated: '2026-06-30', category: 'Operational Audit', fileSize: '1.4 MB' },
  { id: 'REP-02', title: 'May 2026 — Faculty Performance & Disputes Report', dateGenerated: '2026-05-31', category: 'Supervision Ledger', fileSize: '2.1 MB' },
  { id: 'REP-03', title: 'Q2 2026 — Platform Audit & Operations Report', dateGenerated: '2026-06-15', category: 'Strategic Review', fileSize: '4.8 MB' }
]

export default function AcademicDirectorDashboard() {
  const handleLogout = async () => {
    document.cookie = 'vz_user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;'
    await supabase.auth.signOut()
    window.location.href = '/staff/login'
  }

  const [activeTab, setActiveTab] = useState<'overview' | 'supervisors' | 'escalations' | 'disciplinary' | 'staff' | 'reports'>('overview')
  const [successToast, setSuccessToast] = useState<string | null>(null)

  // State Management
  const [stats, setStats] = useState({
    supervisorsCount: 0,
    teachersCount: 0,
    studentsCount: 0,
    trialsCount: 0,
    escalationsCount: 0,
    expectedFees: 0,
    collectedFees: 0,
    attendancePercent: 100
  })
  const [supervisors, setSupervisors] = useState<any[]>([])
  const [escalations, setEscalations] = useState<EscalationMock[]>([])
  const [recommendations, setRecommendations] = useState<DisciplinaryApprovalMock[]>([])
  const [staffList, setStaffList] = useState<NonTeachingStaffMock[]>([])
  const [leaveRequests, setLeaveRequests] = useState<SupportLeaveRequestMock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modals / Input states
  const [activeModal, setActiveModal] = useState<'add-staff' | 'remove-staff' | 'escalation-decide' | 'recommendation-decide' | null>(null)
  
  // Dynamic temporary states for modal operations
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null)
  const [selectedStaffName, setSelectedStaffName] = useState('')
  const [removalReason, setRemovalReason] = useState('')
  
  const [selectedEscalation, setSelectedEscalation] = useState<EscalationMock | null>(null)
  const [escalationAction, setEscalationAction] = useState<'Approved' | 'Declined' | 'Resolved' | null>(null)
  const [decisionNotes, setDecisionNotes] = useState('')
  
  const [selectedRecommendation, setSelectedRecommendation] = useState<DisciplinaryApprovalMock | null>(null)
  const [recAction, setRecAction] = useState<'Approved' | 'Declined' | null>(null)
  const [recNotes, setRecNotes] = useState('')
  
  // New Staff form states
  const [newStaffName, setNewStaffName] = useState('')
  const [newStaffRole, setNewStaffRole] = useState<'Security Guard' | 'Office Boy' | 'Cleaner' | 'Other'>('Security Guard')
  const [newStaffContact, setNewStaffContact] = useState('')
  const [newStaffJoinDate, setNewStaffJoinDate] = useState('')

  // Toast Helper
  const triggerToast = (msg: string) => {
    setSuccessToast(msg)
    setTimeout(() => setSuccessToast(null), 5000)
  }

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch Overview Stats
      const ovRes = await fetch('/api/director/overview')
      if (!ovRes.ok) throw new Error('Failed to load executive overview stats')
      const ovData = await ovRes.json()
      setStats(ovData)

      // Fetch Supervisors
      const supRes = await fetch('/api/director/supervisors')
      if (supRes.ok) {
        const supData = await supRes.json()
        setSupervisors(supData.supervisors || [])
      }

      // Fetch Escalations
      const escRes = await fetch('/api/director/escalations')
      if (escRes.ok) {
        const escData = await escRes.json()
        setEscalations(escData.map((e: any) => ({
          id: e.id,
          description: e.reason,
          involvedParties: `${e.requester_name} (${e.role})`,
          supervisorName: 'Escalated Leave Request',
          status: 'Pending'
        })))
      }

      // Fetch Disciplinary Recommendations
      const discRes = await fetch('/api/director/disciplinary')
      if (discRes.ok) {
        const discData = await discRes.json()
        setRecommendations(discData.map((r: any) => ({
          id: r.id,
          teacherName: r.full_name,
          recommendingSupervisor: 'Supervisor',
          reason: r.recommended_by_note,
          dateRecommended: new Date(r.created_at).toLocaleDateString(),
          status: 'Pending'
        })))
      }

      // Fetch Non-Teaching Staff & Leaves
      const staffRes = await fetch('/api/director/staff')
      if (staffRes.ok) {
        const staffData = await staffRes.json()
        setStaffList((staffData.staff || []).map((s: any) => ({
          id: s.id,
          name: s.name,
          role: s.role,
          contactNumber: s.contact,
          joiningDate: s.joining_date,
          status: s.status
        })))
        setLeaveRequests(staffData.pendingLeaves || [])
      }

    } catch (err: any) {
      console.error(err)
      setError(err.message || 'An error occurred loading academic director dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Action Handlers
  const handleAddStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStaffName.trim() || !newStaffContact.trim() || !newStaffJoinDate) return

    try {
      setLoading(true)
      const res = await fetch('/api/director/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStaffName,
          role: newStaffRole,
          contact: newStaffContact,
          joining_date: newStaffJoinDate
        })
      })
      if (!res.ok) throw new Error('Failed to add staff member')

      triggerToast(`Non-teaching staff "${newStaffName}" added successfully as ${newStaffRole}.`)
      setNewStaffName('')
      setNewStaffRole('Security Guard')
      setNewStaffContact('')
      setNewStaffJoinDate('')
      setActiveModal(null)
      await loadData()
    } catch (err: any) {
      alert(err.message)
      setLoading(false)
    }
  }

  const handleConfirmRemoveStaff = async () => {
    if (!selectedStaffId || !removalReason.trim()) return

    try {
      setLoading(true)
      const res = await fetch('/api/director/staff', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staff_id: selectedStaffId,
          action: 'remove',
          reason: removalReason
        })
      })
      if (!res.ok) throw new Error('Failed to remove staff member')

      triggerToast(`Staff member "${selectedStaffName}" marked as removed.`)
      setSelectedStaffId(null)
      setSelectedStaffName('')
      setRemovalReason('')
      setActiveModal(null)
      await loadData()
    } catch (err: any) {
      alert(err.message)
      setLoading(false)
    }
  }

  const handleEscalationResolution = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEscalation || !escalationAction || !decisionNotes.trim()) return

    const actionValue = escalationAction === 'Declined' ? 'rejected' : 'approved'

    try {
      setLoading(true)
      const res = await fetch('/api/director/escalations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: selectedEscalation.id,
          action: actionValue,
          notes: decisionNotes
        })
      })
      if (!res.ok) throw new Error('Failed to resolve escalation request')

      triggerToast(`Escalation resolved successfully as [${escalationAction}].`)
      setSelectedEscalation(null)
      setEscalationAction(null)
      setDecisionNotes('')
      setActiveModal(null)
      await loadData()
    } catch (err: any) {
      alert(err.message)
      setLoading(false)
    }
  }

  const handleRecommendationDecision = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRecommendation || !recAction || !recNotes.trim()) return

    const actionValue = recAction === 'Approved' ? 'approve_termination' : 'decline_retain'

    try {
      setLoading(true)
      const res = await fetch('/api/director/disciplinary', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacher_id: selectedRecommendation.id,
          action: actionValue,
          final_notes: recNotes
        })
      })
      if (!res.ok) throw new Error('Failed to record disciplinary decision')

      triggerToast(`Disciplinary decision [${recAction}] processed successfully.`)
      setSelectedRecommendation(null)
      setRecAction(null)
      setRecNotes('')
      setActiveModal(null)
      await loadData()
    } catch (err: any) {
      alert(err.message)
      setLoading(false)
    }
  }

  const handleLeaveDecision = async (id: string, action: 'Approved' | 'Declined') => {
    const actionValue = action === 'Approved' ? 'approve_leave' : 'reject_leave'

    try {
      setLoading(true)
      const res = await fetch('/api/director/staff', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staff_id: id,
          action: actionValue
        })
      })
      if (!res.ok) throw new Error('Failed to process leave request')

      triggerToast(`Leave request has been [${action}].`)
      await loadData()
    } catch (err: any) {
      alert(err.message)
      setLoading(false)
    }
  }

  const handleDownloadReport = (title: string) => {
    triggerToast(`Initiating secure download of "${title}" operations PDF report...`)
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <BackToFounderBanner />
      <div className="flex-1 flex bg-[#FAFAF7] text-zinc-800 select-none overflow-hidden font-sans relative">
      <GeometricPattern opacity={0.04} />

      {/* ========================================== */}
      {/* PERSISTENT LEFT SIDEBAR                    */}
      {/* ========================================== */}
      <aside className="w-80 shrink-0 border-r border-zinc-200 bg-white flex flex-col h-full overflow-hidden z-20">
        <div className="flex border-b border-zinc-100 px-6 py-5 items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img src="/weblogo-01.png" alt="Virtual Zawiyah Logo" className="h-9 w-auto object-contain" />
            <div>
              <span className="text-sm font-bold font-serif text-zinc-900 leading-tight block">Virtual Zawiyah</span>
              <span className="block text-[9px] uppercase tracking-wider text-[#1B6B3A] font-bold leading-none mt-0.5">DIRECTOR PORTAL</span>
            </div>
          </div>
          <NotificationBell />
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {/* Overview Tab Link */}
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 active:scale-[0.98] ${
              activeTab === 'overview' 
                ? 'bg-[#1B6B3A] text-white shadow-xs' 
                : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <Building className="h-4 w-4 shrink-0" />
            <span>Executive Overview</span>
          </button>

          {/* Supervisors Performance Link */}
          <button 
            onClick={() => setActiveTab('supervisors')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 active:scale-[0.98] ${
              activeTab === 'supervisors' 
                ? 'bg-[#1B6B3A] text-white shadow-xs' 
                : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <Users className="h-4 w-4 shrink-0" />
            <span>Supervisors Performance</span>
          </button>

          {/* Escalations Tab Link */}
          <button 
            onClick={() => setActiveTab('escalations')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 active:scale-[0.98] ${
              activeTab === 'escalations' 
                ? 'bg-[#1B6B3A] text-white shadow-xs' 
                : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Escalated Disputes</span>
            </div>
            {escalations.filter(e => e.status === 'Pending').length > 0 && (
              <span className="bg-rose-500 text-white font-mono text-[9px] px-1.5 py-0.5 rounded-md">
                {escalations.filter(e => e.status === 'Pending').length}
              </span>
            )}
          </button>

          {/* Teacher Disciplinary Tab Link */}
          <button 
            onClick={() => setActiveTab('disciplinary')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 active:scale-[0.98] ${
              activeTab === 'disciplinary' 
                ? 'bg-[#1B6B3A] text-white shadow-xs' 
                : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>Teacher Disciplinary</span>
            </div>
            {recommendations.filter(r => r.status === 'Pending').length > 0 && (
              <span className="bg-amber-500 text-zinc-950 font-mono text-[9px] px-1.5 py-0.5 rounded-md font-bold font-sans">
                {recommendations.filter(r => r.status === 'Pending').length}
              </span>
            )}
          </button>

          {/* Non-Teaching Staff Tab Link */}
          <button 
            onClick={() => setActiveTab('staff')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 active:scale-[0.98] ${
              activeTab === 'staff' 
                ? 'bg-[#1B6B3A] text-white shadow-xs' 
                : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <UserCheck className="h-4 w-4 shrink-0" />
              <span>Non-Teaching Staff</span>
            </div>
            {leaveRequests.filter(l => l.status === 'Pending').length > 0 && (
              <span className="bg-blue-500 text-white font-mono text-[9px] px-1.5 py-0.5 rounded-md">
                {leaveRequests.filter(l => l.status === 'Pending').length}
              </span>
            )}
          </button>

          {/* Reports Tab Link */}
          <button 
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 active:scale-[0.98] ${
              activeTab === 'reports' 
                ? 'bg-[#1B6B3A] text-white shadow-xs' 
                : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <FileText className="h-4 w-4 shrink-0" />
            <span>Academy Reports</span>
          </button>
        </nav>

        {/* Director Profile Section */}
        <div className="border-t border-zinc-200 bg-zinc-50/50 p-4 shrink-0 mt-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-xl bg-white border border-zinc-200 shadow-xs flex items-center justify-center text-[#1B6B3A] font-bold text-xs shrink-0">
              DA
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-zinc-800 leading-none">Dr. Sulaiman Ali</p>
              <span className="text-[9px] text-zinc-500 block mt-1">Academic Director</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white py-2 text-[10px] font-bold text-zinc-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 active:scale-95 transition-all"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Exit Portal</span>
          </button>
        </div>
      </aside>

      {/* ========================================== */}
      {/* MAIN CONTAINER                             */}
      {/* ========================================== */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        
        {/* Top Header */}
        <header className="h-16 shrink-0 bg-white border-b border-zinc-200 px-8 flex justify-between items-center z-10 shadow-2xs">
          <div>
            <h2 className="text-md font-serif font-bold text-zinc-900 capitalize">
              {activeTab === 'overview' && 'Executive Summary'}
              {activeTab === 'supervisors' && 'Supervisors Performance Ledger'}
              {activeTab === 'escalations' && 'Escalated Disputes Registry'}
              {activeTab === 'disciplinary' && 'Teacher Removal Approvals'}
              {activeTab === 'staff' && 'Support & Non-Teaching HR'}
            </h2>
          </div>

          <div className="text-[10px] text-zinc-500 font-mono font-bold bg-zinc-50 border border-zinc-200/80 px-3 py-1.5 rounded-xl">
            SYSTEM STATE: LIVE SUBA-INTEGRATION
          </div>
        </header>

        {/* Viewport Content Area */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          
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
                <button onClick={loadData} className="mt-2 text-rose-700 underline font-semibold focus:outline-none">
                  Retry Loading
                </button>
              </div>
            </div>
          )}

          {/* Dynamic success toast notifications */}
          {successToast && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 shadow-sm animate-fade-in-up">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
              <span>{successToast}</span>
            </div>
          )}

          {/* ========================================== */}
          {/* TAB 1: EXECUTIVE OVERVIEW                  */}
          {/* ========================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                
                {/* supervisors count */}
                <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xs flex flex-col justify-between h-32">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Supervisors</span>
                    <span className="p-2 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl">
                      <Users className="h-4.5 w-4.5" />
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-zinc-955 font-serif">{stats.supervisorsCount} Active</h3>
                    <p className="text-[10px] text-zinc-650 mt-1 font-medium font-sans">Managing all platform sectors</p>
                  </div>
                </div>

                {/* teachers / students card */}
                <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xs flex flex-col justify-between h-32">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Faculty & Pupils</span>
                    <span className="p-2 bg-blue-50 border border-blue-100 text-blue-700 rounded-xl">
                      <UserCheck className="h-4.5 w-4.5" />
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-zinc-955 font-serif">{stats.teachersCount} T · {stats.studentsCount} S</h3>
                    <p className="text-[10px] text-zinc-650 mt-1 font-medium font-sans">Enrolled live rosters</p>
                  </div>
                </div>

                {/* average attendance */}
                <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xs flex flex-col justify-between h-32">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Avg Attendance</span>
                    <span className="p-2 bg-amber-50 border border-amber-100 text-amber-700 rounded-xl">
                      <TrendingUp className="h-4.5 w-4.5" />
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-zinc-955 font-serif">{stats.attendancePercent}% Overall</h3>
                    <p className="text-[10px] text-zinc-655 mt-1 font-medium font-sans">Live classroom logs</p>
                  </div>
                </div>

                {/* active trials */}
                <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xs flex flex-col justify-between h-32">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Pupils in Trial</span>
                    <span className="p-2 bg-purple-50 border border-purple-100 text-purple-700 rounded-xl">
                      <Users className="h-4.5 w-4.5" />
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-zinc-955 font-serif">{stats.trialsCount} Active</h3>
                    <p className="text-[10px] text-zinc-650 mt-1 font-medium font-sans">Trial placement phase</p>
                  </div>
                </div>

                {/* pending escalations */}
                <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xs flex flex-col justify-between h-32">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Escalated Disputes</span>
                    <span className="p-2 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl">
                      <AlertTriangle className="h-4.5 w-4.5" />
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-rose-700 font-serif">{stats.escalationsCount} Cases</h3>
                    <p className="text-[10px] text-rose-700 mt-1 font-bold font-sans animate-pulse">Awaiting director action</p>
                  </div>
                </div>

              </div>

              {/* High-level budget/billing overview card */}
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xs space-y-4 max-w-4xl">
                <div className="flex items-center gap-2 border-b border-zinc-150 pb-3">
                  <DollarSign className="h-5 w-5 text-[#1B6B3A]" />
                  <h4 className="font-serif font-bold text-zinc-900 text-sm">Monthly Tuition Fee Collection Status</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider block mb-1">Fee Receipts Collection</span>
                    <h3 className="text-2xl font-bold text-[#1B6B3A] font-mono">${stats.collectedFees.toLocaleString()} <span className="text-xs font-semibold text-zinc-600 font-sans">collected</span></h3>
                    <p className="text-[10px] text-zinc-500 mt-1">Representing verified credit and wise uploads</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-555 uppercase tracking-wider block mb-1">Expected Projection</span>
                    <h3 className="text-2xl font-bold text-zinc-900 font-mono">${stats.expectedFees.toLocaleString()} <span className="text-xs font-semibold text-zinc-655 font-sans">expected</span></h3>
                    <p className="text-[10px] text-zinc-500 mt-1">Overall active student catalog list invoice expectation</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2 pt-2">
                  <div className="w-full bg-zinc-100 rounded-full h-2">
                    <div className="bg-[#1B6B3A] h-2 rounded-full transition-all duration-300" style={{ width: `${stats.expectedFees > 0 ? Math.min(100, Math.round((stats.collectedFees / stats.expectedFees) * 100)) : 0}%` }} />
                  </div>
                  <div className="flex justify-between text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                    <span>{stats.expectedFees > 0 ? Math.min(100, Math.round((stats.collectedFees / stats.expectedFees) * 100)) : 0}% Collection progress</span>
                    <span>${Math.max(0, stats.expectedFees - stats.collectedFees).toLocaleString()} Remaining balance</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* TAB 2: SUPERVISORS PERFORMANCE             */}
          {/* ========================================== */}
          {activeTab === 'supervisors' && (
            <div className="space-y-6 max-w-5xl">
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xs space-y-4">
                <div className="border-b border-zinc-100 pb-3">
                  <h3 className="text-sm font-bold text-zinc-900 font-serif">Academic Supervisor Roster & Performance Stats</h3>
                  <p className="text-[10px] text-zinc-500 mt-1">Tracks student disputes and direct warning allocations per supervisor sector.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {supervisors.map(sup => (
                    <div key={sup.id} className="border border-zinc-200 rounded-2xl p-5 hover:border-zinc-300 transition-all space-y-4 bg-zinc-50/20">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-bold text-zinc-900">{sup.full_name}</h4>
                          <span className="text-[9px] font-mono text-zinc-500 block mt-0.5">{sup.id}</span>
                        </div>
                        <span className="p-1 bg-[#1B6B3A]/10 border border-[#1B6B3A]/20 text-[#1B6B3A] rounded-lg text-[9px] font-bold uppercase tracking-wider px-2">
                          Active
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-[9px] text-zinc-550 block">Faculty Assigned</span>
                          <span className="font-bold text-zinc-800">{sup.teacherCount} teachers</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-zinc-555 block">Students Assigned</span>
                          <span className="font-bold text-zinc-800">{sup.studentCount} students</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-zinc-555 block">Disputes Resolved</span>
                          <span className="font-bold text-emerald-700 font-mono">{sup.resolvedDisputes}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-zinc-555 block">Disputes Pending</span>
                          <span className={`font-bold font-mono ${sup.pendingDisputes > 0 ? 'text-amber-600' : 'text-zinc-500'}`}>
                            {sup.pendingDisputes}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {supervisors.length === 0 && (
                    <div className="col-span-3 p-6 text-center text-zinc-500 italic text-xs">
                      No active academic supervisors registered.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* TAB 3: ESCALATIONS                         */}
          {/* ========================================== */}
          {activeTab === 'escalations' && (
            <div className="space-y-6 max-w-5xl">
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xs space-y-4">
                <div className="border-b border-zinc-150 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 font-serif">Supervisor-Escalated Conflicts Ledger</h3>
                    <p className="text-[10px] text-zinc-500 mt-1">Requires Academic Director override decisions on class hours or parent tuition disputes.</p>
                  </div>
                  <span className="text-xs font-bold text-zinc-700 px-3 py-1 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl">
                    {escalations.filter(e => e.status === 'Pending').length} Pending Review
                  </span>
                </div>

                <div className="divide-y divide-zinc-200">
                  {escalations.map(esc => (
                    <div key={esc.id} className="py-6 first:pt-0 last:pb-0 space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-zinc-900 font-mono">{esc.id}</span>
                            <span className="text-[9px] text-zinc-500 font-medium">Escalated by Supervisor {esc.supervisorName}</span>
                          </div>
                          <p className="text-xs text-zinc-800 leading-relaxed font-medium">{esc.description}</p>
                          <p className="text-[10px] text-zinc-600 font-medium"><strong>Involved Parties:</strong> {esc.involvedParties}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border shrink-0 ${
                          esc.status === 'Pending' ? 'text-amber-700 bg-amber-50 border-amber-250' :
                          esc.status === 'Approved' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                          esc.status === 'Declined' ? 'text-rose-700 bg-rose-50 border-rose-100' :
                          'text-blue-700 bg-blue-50 border-blue-200'
                        }`}>
                          {esc.status}
                        </span>
                      </div>

                      {esc.status === 'Pending' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedEscalation(esc)
                              setEscalationAction('Approved')
                              setDecisionNotes('')
                              setActiveModal('escalation-decide')
                            }}
                            className="px-3.5 py-1.5 bg-[#1B6B3A] text-white hover:bg-[#1B6B3A]/90 font-bold rounded-lg text-[10px] active:scale-95 transition-all shadow-xs"
                          >
                            Approve Exception
                          </button>
                          <button
                            onClick={() => {
                              setSelectedEscalation(esc)
                              setEscalationAction('Declined')
                              setDecisionNotes('')
                              setActiveModal('escalation-decide')
                            }}
                            className="px-3.5 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold rounded-lg text-[10px] active:scale-95 transition-all"
                          >
                            Decline Exception
                          </button>
                          <button
                            onClick={() => {
                              setSelectedEscalation(esc)
                              setEscalationAction('Resolved')
                              setDecisionNotes('')
                              setActiveModal('escalation-decide')
                            }}
                            className="px-3.5 py-1.5 border border-zinc-300 text-zinc-700 hover:bg-zinc-50 font-bold rounded-lg text-[10px] active:scale-95 transition-all"
                          >
                            Resolve Otherwise
                          </button>
                        </div>
                      ) : (
                        <div className="p-3 bg-zinc-50 border border-zinc-150 rounded-xl space-y-1">
                          <span className="text-[9px] uppercase font-bold text-zinc-550 block">Director Decision Notes</span>
                          <p className="text-[11px] text-zinc-755 font-medium italic">&quot;{esc.directorNotes}&quot;</p>
                        </div>
                      )}
                    </div>
                  ))}
                  {escalations.length === 0 && (
                    <p className="text-xs font-semibold italic text-zinc-650 text-center py-6">No escalated disputes found in ledger.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* TAB 4: TEACHER DISCIPLINARY APPROVALS     */}
          {/* ========================================== */}
          {activeTab === 'disciplinary' && (
            <div className="space-y-6 max-w-5xl">
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xs space-y-4">
                <div className="border-b border-zinc-150 pb-3">
                  <h3 className="text-sm font-bold text-zinc-900 font-serif">Teacher Removal Approvals Queue</h3>
                  <p className="text-[10px] text-zinc-500 mt-1">Review recommendation requests submitted by Academic Supervisors to strip class registries from faculty members.</p>
                </div>

                <div className="divide-y divide-zinc-200">
                  {recommendations.map(rec => (
                    <div key={rec.id} className="py-6 first:pt-0 last:pb-0 space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider font-sans">RECOMMENDED REMOVAL</span>
                            <span className="text-[9px] font-mono text-zinc-500">Submit ID: {rec.id}</span>
                          </div>
                          <h4 className="text-sm font-bold text-zinc-950 font-serif">{rec.teacherName}</h4>
                          <p className="text-[10px] text-zinc-650 font-medium">Recommending Supervisor: <strong>{rec.recommendingSupervisor}</strong> · Date: {rec.dateRecommended}</p>
                          <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl mt-2">
                            <span className="block text-[9px] uppercase font-bold text-rose-700 tracking-wider mb-1">Supervisor Ground Justifications</span>
                            <p className="text-xs text-zinc-755 leading-relaxed font-medium">&quot;{rec.reason}&quot;</p>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border shrink-0 ${
                          rec.status === 'Pending' ? 'text-amber-700 bg-amber-50 border-amber-250' :
                          rec.status === 'Approved' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                          'text-zinc-655 bg-zinc-100 border-zinc-200'
                        }`}>
                          {rec.status === 'Pending' ? 'Pending Director Approval' : rec.status === 'Approved' ? 'Approved & Terminated' : 'Declined & Retained'}
                        </span>
                      </div>

                      {rec.status === 'Pending' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedRecommendation(rec)
                              setRecAction('Approved')
                              setRecNotes('')
                              setActiveModal('recommendation-decide')
                            }}
                            className="px-3.5 py-1.5 bg-rose-600 text-white hover:bg-rose-700 font-bold rounded-lg text-[10px] active:scale-95 transition-all shadow-xs"
                          >
                            Approve Termination
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRecommendation(rec)
                              setRecAction('Declined')
                              setRecNotes('')
                              setActiveModal('recommendation-decide')
                            }}
                            className="px-3.5 py-1.5 border border-zinc-300 text-zinc-700 hover:bg-zinc-50 font-bold rounded-lg text-[10px] active:scale-95 transition-all"
                          >
                            Decline & Retain Teacher
                          </button>
                        </div>
                      ) : (
                        <p className="text-[10px] text-zinc-500 font-medium italic">Final decision logged. This record is sealed.</p>
                      )}
                    </div>
                  ))}
                  {recommendations.length === 0 && (
                    <p className="text-xs font-semibold italic text-zinc-655 text-center py-6">No pending teacher removal recommendations.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* TAB 5: NON-TEACHING STAFF                  */}
          {/* ========================================== */}
          {activeTab === 'staff' && (
            <div className="space-y-8 max-w-5xl">
              
              {/* Staff directory */}
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xs space-y-4">
                <div className="border-b border-zinc-150 pb-3 flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 font-serif">Non-Teaching Operations Staff Register</h3>
                    <p className="text-[10px] text-zinc-500 mt-1">Security Guards, Office Boys, Cleaners, and administrative operators.</p>
                  </div>
                  <button
                    onClick={() => {
                      setNewStaffName('')
                      setNewStaffContact('')
                      setNewStaffJoinDate('')
                      setNewStaffRole('Security Guard')
                      setActiveModal('add-staff')
                    }}
                    className="px-4 py-2 bg-[#1B6B3A] text-white hover:bg-[#1B6B3A]/90 font-bold rounded-xl text-xs active:scale-[0.98] transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add New Staff</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                        <th className="pb-3 pr-4">Staff Member</th>
                        <th className="pb-3 px-4">Role</th>
                        <th className="pb-3 px-4">Contact Number</th>
                        <th className="pb-3 px-4">Joining Date</th>
                        <th className="pb-3 px-4">Status</th>
                        <th className="pb-3 pl-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-150 text-xs">
                      {staffList.map(s => (
                        <tr key={s.id} className="hover:bg-zinc-55/20 transition-colors">
                          <td className="py-3 pr-4 font-bold text-zinc-900">
                            <div>
                              <span>{s.name}</span>
                              <span className="block text-[8px] text-zinc-450 font-mono mt-0.5">{s.id}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-zinc-700 font-medium">{s.role}</td>
                          <td className="py-3 px-4 font-mono font-medium text-zinc-800">{s.contactNumber}</td>
                          <td className="py-3 px-4 font-mono text-zinc-650">{s.joiningDate}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                              s.status === 'Active' ? 'text-emerald-700 bg-emerald-50 border-emerald-250' : 'text-rose-700 bg-rose-50 border-rose-100'
                            }`}>
                              {s.status}
                            </span>
                          </td>
                          <td className="py-3 pl-4 text-right">
                            {s.status === 'Active' && (
                              <button
                                onClick={() => {
                                  setSelectedStaffId(s.id)
                                  setSelectedStaffName(s.name)
                                  setRemovalReason('')
                                  setActiveModal('remove-staff')
                                }}
                                className="p-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors active:scale-95"
                                title="Remove Staff Member"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pending leave requests */}
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xs space-y-4">
                <div className="border-b border-zinc-100 pb-3">
                  <h3 className="text-sm font-bold text-zinc-900 font-serif">Leave Applications Pool (Non-Teaching)</h3>
                  <p className="text-[10px] text-zinc-500 mt-1">Review leave applications submitted by support and security operations staff.</p>
                </div>

                <div className="divide-y divide-zinc-150">
                  {leaveRequests.map(lr => (
                    <div key={lr.id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-start gap-4 flex-wrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-zinc-900">{lr.staffName}</h4>
                          <span className="text-[9px] px-1.5 py-0.5 bg-zinc-100 text-zinc-700 rounded-md font-medium">{lr.role}</span>
                        </div>
                        <p className="text-xs text-zinc-700 leading-relaxed font-medium">
                          <strong>Date:</strong> {lr.startDate} · <strong>Duration:</strong> {lr.durationDays} days · <strong>Reason:</strong> &quot;{lr.reason}&quot;
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {lr.status === 'Pending' ? (
                          <>
                            <button
                              onClick={() => handleLeaveDecision(lr.id, 'Approved')}
                              className="px-3 py-1 bg-[#1B6B3A] text-white hover:bg-[#1B6B3A]/90 font-bold rounded-lg text-[10px] active:scale-95 transition-all shadow-xs"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleLeaveDecision(lr.id, 'Declined')}
                              className="px-3 py-1 border border-rose-255 text-rose-700 hover:bg-rose-50 font-bold rounded-lg text-[10px] active:scale-95 transition-all"
                            >
                              Decline
                            </button>
                          </>
                        ) : (
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${
                            lr.status === 'Approved' ? 'text-emerald-700 bg-emerald-50 border-emerald-250' : 'text-rose-700 bg-rose-50 border-rose-100'
                          }`}>
                            {lr.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {leaveRequests.length === 0 && (
                    <p className="text-xs font-semibold italic text-zinc-655 text-center py-4">No leave requests currently pending.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* TAB 6: REPORTS                             */}
          {/* ========================================== */}
          {activeTab === 'reports' && (
            <div className="space-y-6 max-w-4xl">
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xs space-y-4">
                <div className="border-b border-zinc-100 pb-3">
                  <h3 className="text-sm font-bold text-zinc-900 font-serif">Academy-Wide Summary & Audit Reports</h3>
                  <p className="text-[10px] text-zinc-500 mt-1">Download monthly operational performance summaries, dispute metrics, and security/support staff rosters.</p>
                </div>

                <div className="divide-y divide-zinc-150">
                  {INITIAL_REPORTS.map(rep => (
                    <div key={rep.id} className="py-4.5 first:pt-0 last:pb-0 flex justify-between items-center gap-4">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-zinc-900 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-[#1B6B3A]" />
                          <span>{rep.title}</span>
                        </h4>
                        <p className="text-[10px] text-zinc-650 font-medium">
                          <strong>Date Generated:</strong> {rep.dateGenerated} · <strong>Category:</strong> {rep.category} · <strong>Size:</strong> {rep.fileSize}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDownloadReport(rep.title)}
                        className="p-2 border border-zinc-200 text-zinc-700 hover:bg-zinc-55 rounded-xl transition-colors active:scale-95 shadow-2xs flex items-center gap-1.5 text-[10px] font-bold"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download PDF</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ========================================== */}
      {/* ADD STAFF MODAL                            */}
      {/* ========================================== */}
      {activeModal === 'add-staff' && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-scale-up">
            <h3 className="text-sm font-bold text-zinc-950 font-serif">Add New Operations Staff</h3>
            
            <form onSubmit={handleAddStaffSubmit} className="space-y-4 text-xs font-medium text-zinc-850">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1">Full Name</label>
                <input 
                  type="text"
                  required
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="e.g. Muhammad Ramzan"
                  className="w-full text-xs p-3 rounded-xl border border-zinc-300 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] text-zinc-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1">Role / Job Title</label>
                  <select
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value as 'Security Guard' | 'Office Boy' | 'Cleaner' | 'Other')}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] text-zinc-800"
                  >
                    <option value="Security Guard">Security Guard</option>
                    <option value="Office Boy">Office Boy</option>
                    <option value="Cleaner">Cleaner</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1">Joining Date</label>
                  <input 
                    type="date"
                    required
                    value={newStaffJoinDate}
                    onChange={(e) => setNewStaffJoinDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] text-zinc-850"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1">Contact Phone Number</label>
                <input 
                  type="tel"
                  required
                  value={newStaffContact}
                  onChange={(e) => setNewStaffContact(e.target.value)}
                  placeholder="e.g. +92 325 5777312"
                  className="w-full text-xs p-3 rounded-xl border border-zinc-300 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] text-zinc-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="py-2 px-4 border border-zinc-300 text-zinc-700 hover:bg-zinc-50 font-bold rounded-xl active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-[#1B6B3A] text-white hover:bg-[#1B6B3A]/90 font-bold rounded-xl active:scale-95 transition-all shadow-xs"
                >
                  Add Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REMOVE STAFF MODAL */}
      {activeModal === 'remove-staff' && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl shrink-0">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-955 font-serif">Confirm Staff Removal</h4>
                <p className="text-xs text-zinc-700 font-medium mt-1 leading-relaxed">
                  Are you sure you want to terminate/remove support staff member <strong>{selectedStaffName}</strong> from active registers? This is logged in final audit directories.
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-2">Removal Reason Notes</label>
              <textarea
                value={removalReason}
                onChange={(e) => setRemovalReason(e.target.value)}
                placeholder="State the official reasoning for removal/termination..."
                rows={3}
                required
                className="w-full text-xs p-3 rounded-xl border border-zinc-300 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-sans text-zinc-800 placeholder-zinc-500 font-medium"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 text-xs">
              <button
                onClick={() => setActiveModal(null)}
                className="py-2 px-4 border border-zinc-300 text-zinc-700 hover:bg-zinc-50 font-bold rounded-xl active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRemoveStaff}
                disabled={!removalReason.trim()}
                className={`py-2 px-4 font-bold rounded-xl active:scale-95 transition-all ${
                  removalReason.trim() 
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm' 
                    : 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed'
                }`}
              >
                Confirm Removal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESOLVE ESCALATION MODAL */}
      {activeModal === 'escalation-decide' && selectedEscalation && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-scale-up">
            <h3 className="text-sm font-bold text-zinc-955 font-serif">Resolve Escalation {selectedEscalation.id}</h3>
            <p className="text-xs text-zinc-700 font-medium leading-relaxed">
              Applying director action: <strong className="text-primary">{escalationAction}</strong> for escalation case.
            </p>

            <form onSubmit={handleEscalationResolution} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-2">Director Decision Reasoning Notes</label>
                <textarea
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  placeholder="State final decision justifications..."
                  rows={3}
                  required
                  className="w-full text-xs p-3 rounded-xl border border-zinc-300 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] transition-all font-sans text-zinc-800 placeholder-zinc-500 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="py-2 px-4 border border-zinc-300 text-zinc-700 hover:bg-zinc-50 font-bold rounded-xl active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!decisionNotes.trim()}
                  className={`py-2 px-4 font-bold rounded-xl active:scale-95 transition-all ${
                    decisionNotes.trim() 
                      ? 'bg-[#1B6B3A] text-white hover:bg-[#1B6B3A]/90 shadow-sm' 
                      : 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed'
                  }`}
                >
                  Submit Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEACHER DISCIPLINARY MODAL DECIDE */}
      {activeModal === 'recommendation-decide' && selectedRecommendation && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-scale-up">
            <h3 className="text-sm font-bold text-zinc-955 font-serif">
              {recAction === 'Approved' ? 'Approve Faculty Termination' : 'Decline Faculty Termination'}
            </h3>
            <p className="text-xs text-zinc-700 font-medium leading-relaxed">
              Reviewing recommended removal of Muallim/Muallima <strong>{selectedRecommendation.teacherName}</strong>.
            </p>

            <form onSubmit={handleRecommendationDecision} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-2">Director&apos;s Review &amp; Order Notes</label>
                <textarea
                  value={recNotes}
                  onChange={(e) => setRecNotes(e.target.value)}
                  placeholder="Enter the official final review statement..."
                  rows={3}
                  required
                  className="w-full text-xs p-3 rounded-xl border border-zinc-300 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-sans text-zinc-800 placeholder-zinc-500 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="py-2 px-4 border border-zinc-300 text-zinc-700 hover:bg-zinc-50 font-bold rounded-xl active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!recNotes.trim()}
                  className={`py-2 px-4 font-bold rounded-xl active:scale-95 transition-all ${
                    recNotes.trim() 
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm' 
                      : 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed'
                  }`}
                >
                  Confirm Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </div>
    </div>
  )
}
