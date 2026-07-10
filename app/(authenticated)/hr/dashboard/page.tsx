'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { 
  Users, 
  FileText, 
  UserMinus, 
  Check, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  LogOut, 
  Search, 
  Plus,
  MessageSquare,
  Calendar,
  Clock
} from 'lucide-react'
import GeometricPattern from '@/components/GeometricPattern'

// --- Interfaces ---

interface HrStaffMock {
  id: string
  name: string
  role: 'Security Guard' | 'Office Boy' | 'Cleaner' | 'Other'
  contact: string
  joiningDate: string
  status: 'Active' | 'Removed'
  removalReason?: string
}

interface LeaveRequestMock {
  id: string
  staffName: string
  requestedDates: string
  reason: string
  status: 'Pending' | 'Approved' | 'Declined'
}

interface QueryMock {
  id: string
  staffName: string
  subject: string
  message: string
  status: 'Pending' | 'Resolved'
  responseNote?: string
}

// --- Initial Mock Data ---

const INITIAL_STAFF: HrStaffMock[] = [
  { id: 'st-01', name: 'Muhammad Ramzan', role: 'Security Guard', contact: '+92 300 1234567', joiningDate: '2024-03-01', status: 'Active' },
  { id: 'st-02', name: 'Sajid Ali', role: 'Office Boy', contact: '+92 312 9876543', joiningDate: '2025-01-15', status: 'Active' },
  { id: 'st-03', name: 'Abdul Karim', role: 'Cleaner', contact: '+92 321 4567890', joiningDate: '2023-09-10', status: 'Active' },
  { id: 'st-04', name: 'Tariq Masih', role: 'Cleaner', contact: '+92 333 5551234', joiningDate: '2025-05-20', status: 'Active' },
  { id: 'st-05', name: 'Bilal Shah', role: 'Security Guard', contact: '+92 345 8887776', joiningDate: '2026-02-10', status: 'Active' }
]

const INITIAL_LEAVES: LeaveRequestMock[] = [
  { id: 'lr-1', staffName: 'Muhammad Ramzan', requestedDates: 'July 5 - July 7, 2026', reason: 'Personal work in native village.', status: 'Pending' },
  { id: 'lr-2', staffName: 'Sajid Ali', requestedDates: 'July 10, 2026', reason: "Daughter's school registration ceremony.", status: 'Pending' }
]

const INITIAL_QUERIES: QueryMock[] = [
  { id: 'q-1', staffName: 'Abdul Karim', subject: 'Pantry supplies shortage', message: 'The cleaning supply room is running low on bleach and trash bags. Please request restocking.', status: 'Pending' },
  { id: 'q-2', staffName: 'Tariq Masih', subject: 'Uniform fitting issue', message: 'The standard size uniform trousers issued are too tight. Requesting an exchange for XL.', status: 'Pending' }
]

export default function HrDashboard() {
  const handleLogout = async () => {
    document.cookie = 'vz_user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;'
    await supabase.auth.signOut()
    window.location.href = '/staff/login'
  }

  const [activeTab, setActiveTab] = useState<'directory' | 'leaves-queries'>('directory')

  // Core Mock States
  const [staffList, setStaffList] = useState<HrStaffMock[]>(INITIAL_STAFF)
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestMock[]>(INITIAL_LEAVES)
  const [queries, setQueries] = useState<QueryMock[]>(INITIAL_QUERIES)

  // Filter States
  const [searchQuery, setSearchQuery] = useState('')

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Modal Control States
  const [modalType, setModalType] = useState<'add-staff' | 'remove-staff' | 'resolve-query' | null>(null)
  
  // Selected targets for actions
  const [targetStaff, setTargetStaff] = useState<HrStaffMock | null>(null)
  const [targetQuery, setTargetQuery] = useState<QueryMock | null>(null)

  // Form Fields
  const [newStaffName, setNewStaffName] = useState('')
  const [newStaffRole, setNewStaffRole] = useState<'Security Guard' | 'Office Boy' | 'Cleaner' | 'Other'>('Security Guard')
  const [newStaffContact, setNewStaffContact] = useState('')
  const [newStaffJoiningDate, setNewStaffJoiningDate] = useState('')
  const [removalReason, setRemovalReason] = useState('')
  const [resolutionNote, setResolutionNote] = useState('')

  // Helper: Trigger Toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 5000)
  }

  // --- Handlers ---

  const handleOpenAddStaff = () => {
    setNewStaffName('')
    setNewStaffRole('Security Guard')
    setNewStaffContact('')
    setNewStaffJoiningDate(new Date().toISOString().split('T')[0])
    setModalType('add-staff')
  }

  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStaffName || !newStaffContact || !newStaffJoiningDate) {
      alert('Please fill out all fields.')
      return
    }

    const newMember: HrStaffMock = {
      id: `st-${Date.now()}`,
      name: newStaffName,
      role: newStaffRole,
      contact: newStaffContact,
      joiningDate: newStaffJoiningDate,
      status: 'Active'
    }

    setStaffList([...staffList, newMember])
    setModalType(null)
    triggerToast(`Successfully added "${newStaffName}" as a ${newStaffRole}!`)
  }

  const handleOpenRemoveStaff = (staff: HrStaffMock) => {
    setTargetStaff(staff)
    setRemovalReason('')
    setModalType('remove-staff')
  }

  const handleRemoveStaffConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetStaff || !removalReason.trim()) return

    setStaffList(staffList.map(s => 
      s.id === targetStaff.id 
        ? { ...s, status: 'Removed' as const, removalReason: removalReason } 
        : s
    ))

    setModalType(null)
    triggerToast(`Staff member "${targetStaff.name}" has been removed from active register. Reason: ${removalReason}`)
    setTargetStaff(null)
  }

  const handleLeaveAction = (id: string, action: 'Approve' | 'Decline') => {
    const updatedStatus = action === 'Approve' ? 'Approved' : 'Declined'
    
    setLeaveRequests(leaveRequests.map(lr => 
      lr.id === id ? { ...lr, status: updatedStatus } : lr
    ))

    const request = leaveRequests.find(lr => lr.id === id)
    triggerToast(`Leave request for "${request?.staffName}" was ${updatedStatus.toLowerCase()} successfully.`)
  }

  const handleOpenResolveQuery = (query: QueryMock) => {
    setTargetQuery(query)
    setResolutionNote('')
    setModalType('resolve-query')
  }

  const handleResolveQueryConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetQuery) return

    setQueries(queries.map(q => 
      q.id === targetQuery.id 
        ? { ...q, status: 'Resolved' as const, responseNote: resolutionNote } 
        : q
    ))

    setModalType(null)
    triggerToast(`Query ticket from "${targetQuery.staffName}" marked as resolved. Response note archived.`)
    setTargetQuery(null)
  }

  // Filtered staff list
  const filteredStaff = staffList.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Calculations for stats
  const activeStaffCount = staffList.filter(s => s.status === 'Active').length
  const pendingLeavesCount = leaveRequests.filter(lr => lr.status === 'Pending').length
  const pendingQueriesCount = queries.filter(q => q.status === 'Pending').length

  return (
    <div className="h-screen w-full bg-[#FAFAF7] text-zinc-800 font-sans relative flex overflow-hidden select-none">
      
      {/* Soft geometric watermark backdrop */}
      <GeometricPattern opacity={0.04} />

      {/* ========================================== */}
      {/* PERSISTENT LEFT SIDEBAR                    */}
      {/* ========================================== */}
      <aside className="w-80 shrink-0 border-r border-zinc-200 bg-white flex flex-col h-full overflow-hidden z-20">
        {/* Brand Header */}
        <div className="flex flex-col border-b border-zinc-100 px-6 py-5 justify-center shrink-0">
          <div className="flex items-center gap-3">
            <img src="/weblogo-01.png" alt="Virtual Zawiyah Logo" className="h-9 w-auto object-contain" />
            <div>
              <span className="text-sm font-bold font-serif text-zinc-900 leading-tight block">Virtual Zawiyah</span>
              <span className="block text-[9px] uppercase tracking-wider text-[#1B6B3A] font-bold leading-none mt-0.5">HR PORTAL</span>
            </div>
          </div>
        </div>

        {/* Navigation Sidebar List */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {/* Staff Directory tab */}
          <button 
            onClick={() => setActiveTab('directory')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold font-sans transition-all duration-150 active:scale-[0.98] ${
              activeTab === 'directory' 
                ? 'bg-[#1B6B3A] text-white shadow-xs' 
                : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="h-4 w-4 shrink-0" />
              <span>Staff Directory</span>
            </div>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
              activeTab === 'directory' ? 'bg-[#FAFAF7]/20 text-white' : 'bg-zinc-100 text-zinc-650'
            }`}>
              {activeStaffCount} Active
            </span>
          </button>

          {/* Leave & Queries tab */}
          <button 
            onClick={() => setActiveTab('leaves-queries')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold font-sans transition-all duration-150 active:scale-[0.98] ${
              activeTab === 'leaves-queries' 
                ? 'bg-[#1B6B3A] text-white shadow-xs' 
                : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className="h-4 w-4 shrink-0" />
              <span>Leave & Queries</span>
            </div>
            {(pendingLeavesCount > 0 || pendingQueriesCount > 0) && (
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                activeTab === 'leaves-queries' ? 'bg-rose-500 text-white' : 'bg-rose-50 text-rose-700'
              }`}>
                {pendingLeavesCount + pendingQueriesCount} New
              </span>
            )}
          </button>
        </nav>

        {/* HR Profile section at bottom */}
        <div className="border-t border-zinc-200 bg-zinc-50/50 p-4 shrink-0 mt-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-zinc-200 text-[#1B6B3A] shadow-sm shrink-0 font-bold text-xs font-serif">
              SK
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-zinc-800 font-sans">Sarah Khan</p>
              <p className="truncate text-[10px] text-zinc-600 font-medium">HR Administrator</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white py-2 text-[10px] font-bold text-zinc-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 active:scale-[0.98] transition-all duration-150"
          >
            <LogOut className="h-3 w-3" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ========================================== */}
      {/* MAIN CONTENT AREA                          */}
      {/* ========================================== */}
      <main className="flex-1 overflow-y-auto p-8 relative z-10">
        
        {/* Toast Alert Notification */}
        {toastMessage && (
          <div className="fixed top-6 right-6 bg-zinc-900 text-white text-xs font-semibold py-3 px-5 rounded-xl shadow-lg border border-zinc-700 flex items-center gap-2.5 z-55 animate-slide-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="mx-auto max-w-5xl space-y-8">
          
          {/* Header Row */}
          <div className="flex items-center justify-between border-b border-zinc-200 pb-5">
            <div>
              <h1 className="text-xl font-bold font-serif text-zinc-900 tracking-tight">
                {activeTab === 'directory' ? 'Non-Teaching Staff Directory' : 'Staff Leave & Queries Management'}
              </h1>
              <p className="text-xs text-zinc-600 mt-1">
                {activeTab === 'directory' 
                  ? 'Manage administrative records, directory cards, and roster registrations.' 
                  : 'Respond to leave applications and address employee complaints/queries.'}
              </p>
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-[10px] font-mono text-zinc-500 shadow-3xs">
              June 29, 2026
            </div>
          </div>

          {/* ========================================== */}
          {/* TAB 1: STAFF DIRECTORY VIEW                */}
          {/* ========================================== */}
          {activeTab === 'directory' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Statistics Grid */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-3xs">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500">Active Staff</span>
                  <span className="block text-2xl font-serif font-bold text-zinc-900 mt-1">{activeStaffCount}</span>
                </div>
                <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-3xs">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500">Security Team</span>
                  <span className="block text-2xl font-serif font-bold text-[#1B6B3A] mt-1">
                    {staffList.filter(s => s.role === 'Security Guard' && s.status === 'Active').length}
                  </span>
                </div>
                <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-3xs">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500">Support Staff</span>
                  <span className="block text-2xl font-serif font-bold text-zinc-900 mt-1">
                    {staffList.filter(s => (s.role === 'Office Boy' || s.role === 'Cleaner') && s.status === 'Active').length}
                  </span>
                </div>
                <div className="bg-white border border-[#1B6B3A]/20 bg-emerald-50/10 rounded-2xl p-4 shadow-3xs">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-[#1B6B3A]">System Load</span>
                  <span className="block text-xs font-semibold text-zinc-700 mt-2">Optimal Capacity</span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex justify-between items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search staff members by name..."
                    className="w-full text-xs pl-10 pr-4 py-2 border border-zinc-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] text-zinc-800 bg-white"
                  />
                </div>

                <button
                  onClick={handleOpenAddStaff}
                  className="bg-[#1B6B3A] text-white hover:bg-[#1B6B3A]/90 text-xs font-bold py-2 px-4 rounded-xl shadow-2xs active:scale-95 transition-all duration-150 flex items-center gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Staff</span>
                </button>
              </div>

              {/* Staff Table */}
              <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-3xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 uppercase text-[10px] tracking-wider font-semibold">
                      <th className="p-4">Staff Member</th>
                      <th className="p-4">Assigned Role</th>
                      <th className="p-4">Contact Details</th>
                      <th className="p-4">Joining Date</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {filteredStaff.map(staff => (
                      <tr key={staff.id} className="hover:bg-zinc-50/20 transition-colors">
                        <td className="p-4 font-bold text-zinc-955">
                          <div>
                            <span>{staff.name}</span>
                            {staff.status === 'Removed' && staff.removalReason && (
                              <span className="block text-[10px] text-rose-600 font-normal mt-0.5">
                                Reason: &quot;{staff.removalReason}&quot;
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 font-medium text-zinc-700">{staff.role}</td>
                        <td className="p-4 font-mono text-zinc-650">{staff.contact}</td>
                        <td className="p-4 font-mono text-zinc-650">{staff.joiningDate}</td>
                        <td className="p-4 text-center">
                          <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${
                            staff.status === 'Active'
                              ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                              : 'text-zinc-505 bg-zinc-100 border-zinc-250'
                          }`}>
                            {staff.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {staff.status === 'Active' ? (
                            <button
                              onClick={() => handleOpenRemoveStaff(staff)}
                              className="p-1.5 text-zinc-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                              title="Remove Staff"
                            >
                              <UserMinus className="h-4 w-4" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-zinc-400 font-medium italic pr-2">Roster Inactive</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredStaff.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-zinc-600 italic">
                          No staff directory records found matching your query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* ========================================== */}
          {/* TAB 2: LEAVE & QUERIES VIEW                */}
          {/* ========================================== */}
          {activeTab === 'leaves-queries' && (
            <div className="grid grid-cols-2 gap-8 animate-fade-in">
              
              {/* Leave Requests Roster */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#1B6B3A]" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800 font-serif">Leave Applications</h3>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">
                    {leaveRequests.filter(lr => lr.status === 'Pending').length} Pending
                  </span>
                </div>

                <div className="space-y-3.5">
                  {leaveRequests.map(request => (
                    <div key={request.id} className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-3xs space-y-3 relative overflow-hidden">
                      {/* Request status indicators */}
                      {request.status !== 'Pending' && (
                        <div className="absolute top-0 right-0">
                          <span className={`text-[8px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-bl border-l border-b ${
                            request.status === 'Approved'
                              ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                              : 'text-rose-600 bg-rose-50 border-rose-150'
                          }`}>
                            {request.status}
                          </span>
                        </div>
                      )}

                      <div className="space-y-1">
                        <span className="block text-xs font-bold text-zinc-900">{request.staffName}</span>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
                          <Clock className="h-3.5 w-3.5 text-zinc-450" />
                          <span>{request.requestedDates}</span>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-750 leading-relaxed bg-zinc-50 border border-zinc-150 rounded-xl p-3">
                        {request.reason}
                      </p>

                      {request.status === 'Pending' && (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleLeaveAction(request.id, 'Approve')}
                            className="flex-1 bg-[#1B6B3A] text-white hover:bg-[#1B6B3A]/90 text-[10px] font-bold py-1.5 rounded-lg active:scale-97 transition-all flex items-center justify-center gap-1"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Approve Leave</span>
                          </button>
                          <button
                            onClick={() => handleLeaveAction(request.id, 'Decline')}
                            className="flex-1 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-[10px] font-bold py-1.5 rounded-lg active:scale-97 transition-all flex items-center justify-center gap-1"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Decline</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {leaveRequests.length === 0 && (
                    <div className="bg-white border border-zinc-200 rounded-2xl p-6 text-center text-zinc-600 italic text-xs">
                      No leave applications submitted.
                    </div>
                  )}
                </div>
              </div>

              {/* Employee Queries Roster */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-[#1B6B3A]" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800 font-serif">Employee Queries</h3>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">
                    {queries.filter(q => q.status === 'Pending').length} Open
                  </span>
                </div>

                <div className="space-y-3.5">
                  {queries.map(query => (
                    <div key={query.id} className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-3xs space-y-3 relative overflow-hidden">
                      {/* Query status indicators */}
                      {query.status === 'Resolved' && (
                        <div className="absolute top-0 right-0">
                          <span className="text-[8px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-bl border-l border-b text-emerald-700 bg-emerald-50 border-emerald-200">
                            Resolved
                          </span>
                        </div>
                      )}

                      <div className="space-y-0.5">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xs font-bold text-zinc-900">{query.staffName}</span>
                          <span className="text-[9px] text-zinc-650 bg-zinc-100 rounded px-1.5 font-medium">{query.subject}</span>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-750 leading-relaxed bg-zinc-50 border border-zinc-150 rounded-xl p-3">
                        {query.message}
                      </p>

                      {query.status === 'Resolved' && query.responseNote && (
                        <div className="bg-emerald-50/20 border border-emerald-100/50 rounded-xl p-3 space-y-1">
                          <span className="block text-[9px] uppercase font-bold text-emerald-800">HR Resolution Note:</span>
                          <p className="text-xs text-zinc-600 leading-relaxed font-serif italic">
                            &quot;{query.responseNote}&quot;
                          </p>
                        </div>
                      )}

                      {query.status === 'Pending' && (
                        <button
                          onClick={() => handleOpenResolveQuery(query)}
                          className="w-full bg-[#1B6B3A]/10 text-[#1B6B3A] hover:bg-[#1B6B3A]/20 text-[10px] font-bold py-1.5 rounded-lg active:scale-97 transition-all flex items-center justify-center gap-1"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Mark as Resolved</span>
                        </button>
                      )}
                    </div>
                  ))}

                  {queries.length === 0 && (
                    <div className="bg-white border border-zinc-200 rounded-2xl p-6 text-center text-zinc-600 italic text-xs">
                      No staff queries filed.
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>
      </main>

      {/* ========================================== */}
      {/* MODAL OVERLAYS                             */}
      {/* ========================================== */}

      {/* Modal 1: Add Staff */}
      {modalType === 'add-staff' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-scale-up">
            <div className="bg-zinc-50 border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800 font-serif">Add New Staff Member</h3>
              <button 
                onClick={() => setModalType(null)}
                className="p-1 hover:bg-zinc-200 text-zinc-500 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <form onSubmit={handleAddStaffSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-zinc-500">Full Name</label>
                <input 
                  type="text"
                  required
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="e.g. Sajid Mahmood"
                  className="w-full text-xs p-2.5 border border-zinc-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1B6B3A] text-zinc-800 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-zinc-500">Role</label>
                  <select
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value as 'Security Guard' | 'Office Boy' | 'Cleaner' | 'Other')}
                    className="w-full text-xs p-2.5 border border-zinc-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1B6B3A] text-zinc-800 bg-white font-medium"
                  >
                    <option value="Security Guard">Security Guard</option>
                    <option value="Office Boy">Office Boy</option>
                    <option value="Cleaner">Cleaner</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-zinc-500">Joining Date</label>
                  <input 
                    type="date"
                    required
                    value={newStaffJoiningDate}
                    onChange={(e) => setNewStaffJoiningDate(e.target.value)}
                    className="w-full text-xs p-2.5 border border-zinc-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1B6B3A] text-zinc-800 bg-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-zinc-500">Contact Number</label>
                <input 
                  type="text"
                  required
                  value={newStaffContact}
                  onChange={(e) => setNewStaffContact(e.target.value)}
                  placeholder="e.g. +92 300 1234567"
                  className="w-full text-xs p-2.5 border border-zinc-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1B6B3A] text-zinc-800 bg-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-bold rounded-xl transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1B6B3A] text-white hover:bg-[#1B6B3A]/90 text-xs font-bold rounded-xl shadow-2xs transition-all active:scale-95"
                >
                  Submit Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Remove Staff Confirmation */}
      {modalType === 'remove-staff' && targetStaff && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-scale-up">
            <div className="bg-zinc-50 border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5 font-serif">
                <AlertCircle className="h-4 w-4" />
                <span>Remove Staff Member</span>
              </h3>
              <button 
                onClick={() => setModalType(null)}
                className="p-1 hover:bg-zinc-200 text-zinc-500 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <form onSubmit={handleRemoveStaffConfirm} className="p-6 space-y-4">
              <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-4 text-xs text-rose-800 leading-relaxed">
                You are about to flag active staff member <strong className="font-bold text-rose-900">&quot;{targetStaff.name}&quot;</strong> (Role: {targetStaff.role}) as <strong className="font-bold text-rose-900">Removed</strong>. They will be marked inactive across rosters.
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-zinc-500">Reason for Removal / Administrative Notes</label>
                <textarea 
                  required
                  rows={3}
                  value={removalReason}
                  onChange={(e) => setRemovalReason(e.target.value)}
                  placeholder="Provide detailed reasoning for removal (e.g., resignation, termination, transfer)..."
                  className="w-full text-xs p-2.5 border border-zinc-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 text-zinc-800 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-bold rounded-xl transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 text-xs font-bold rounded-xl shadow-2xs transition-all active:scale-95"
                >
                  Confirm Removal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Resolve Query Dialog */}
      {modalType === 'resolve-query' && targetQuery && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-scale-up">
            <div className="bg-zinc-50 border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800 font-serif">Resolve Query Ticket</h3>
              <button 
                onClick={() => setModalType(null)}
                className="p-1 hover:bg-zinc-200 text-zinc-500 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <form onSubmit={handleResolveQueryConfirm} className="p-6 space-y-4">
              <div className="text-xs text-zinc-650 space-y-1">
                <span className="block text-[10px] uppercase font-bold text-zinc-500">Employee Message:</span>
                <p className="bg-zinc-50 border border-zinc-150 rounded-xl p-3 leading-relaxed">
                  {targetQuery.message}
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-zinc-500">HR Response Note (Optional)</label>
                <textarea 
                  rows={3}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Type an optional response note to display on ticket..."
                  className="w-full text-xs p-2.5 border border-zinc-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1B6B3A] text-zinc-800 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-bold rounded-xl transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1B6B3A] text-white hover:bg-[#1B6B3A]/90 text-xs font-bold rounded-xl shadow-2xs transition-all active:scale-95"
                >
                  Mark as Resolved
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
