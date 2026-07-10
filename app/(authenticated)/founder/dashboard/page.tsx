'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { 
  Building, 
  Users, 
  DollarSign, 
  LogOut, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Shield,
  Briefcase,
  Download,
  Loader2,
  Search
} from 'lucide-react'
import GeometricPattern from '@/components/GeometricPattern'
import NotificationBell from '@/components/NotificationBell'

// --- Interfaces ---
interface StaffMock {
  id: string
  name: string
  email: string
  role: string
  contact: string
  joiningDate: string
  status: string
}

export default function FounderOwnerDashboard() {
  const handleLogout = async () => {
    document.cookie = 'vz_user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;'
    await supabase.auth.signOut()
    window.location.href = '/staff/login'
  }

  const [activeTab, setActiveTab] = useState<'financial' | 'academy' | 'staff' | 'portals'>('financial')
  const [successToast, setSuccessToast] = useState<string | null>(null)
  
  // Loading & Error States
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Financial Stats state
  const [financialData, setFinancialData] = useState({
    feeIncomeUSD: 0,
    teacherSalariesPKR: 0,
    staffSalariesPKR: 0,
    expensesPKR: 0,
    totalExpensesPKR: 0,
    totalExpensesUSD: 0,
    netBalanceUSD: 0
  })
  const [trendData, setTrendData] = useState<any[]>([])
  const [exchangeRate, setExchangeRate] = useState(278)

  // Academy Stats state
  const [academyData, setAcademyData] = useState({
    studentsCount: 0,
    oneOnOneStudentsCount: 0,
    groupStudentsCount: 0,
    teachersCount: 0,
    teacherTypesCount: {
      '1:1': 0,
      'Dars-e-Nizami': 0,
      'Tajweed': 0
    },
    supervisorsCount: 0,
    attendancePercent: 0,
    trialsCount: 0,
    escalationsCount: 0
  })

  // Roster state
  const [staffList, setStaffList] = useState<StaffMock[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')

  // Modals state
  const [activeModal, setActiveModal] = useState<'add-staff' | 'remove-staff' | 'hire-success' | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<StaffMock | null>(null)
  const [removalReason, setRemovalReason] = useState('')

  // New staff form state
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState<string>('Teacher')
  const [newEmail, setNewEmail] = useState('')
  const [newContact, setNewContact] = useState('')
  const [newJoinDate, setNewJoinDate] = useState('')

  // Newly created credentials
  const [hiredCredentials, setHiredCredentials] = useState<{
    name: string
    role: string
    email: string
    password: string
    id: string
  } | null>(null)

  const triggerToast = (msg: string) => {
    setSuccessToast(msg)
    setTimeout(() => setSuccessToast(null), 5000)
  }

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch Financials
      const finRes = await fetch('/api/founder/financial-overview')
      if (!finRes.ok) throw new Error('Failed to fetch financial overview ledger')
      const finJson = await finRes.json()
      if (finJson.success) {
        setFinancialData(finJson.currentMonth)
        setTrendData(finJson.trend)
        setExchangeRate(finJson.exchangeRate)
      }

      // Fetch Academy Overview
      const acadRes = await fetch('/api/founder/academy-overview')
      if (!acadRes.ok) throw new Error('Failed to fetch academy overview logs')
      const acadJson = await acadRes.json()
      if (acadJson.success) {
        setAcademyData(acadJson)
      }

      // Fetch Staff Registry
      const staffRes = await fetch('/api/founder/staff')
      if (!staffRes.ok) throw new Error('Failed to fetch staff directory register')
      const staffJson = await staffRes.json()
      setStaffList(staffJson)

    } catch (err: any) {
      console.error('Error loading founder dashboard:', err)
      setError(err.message || 'An error occurred while loading database data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Handle staff addition
  const handleAddStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !newEmail.trim() || !newContact.trim() || !newJoinDate) return

    try {
      setLoading(true)
      const res = await fetch('/api/founder/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: newName,
          role: newRole,
          email: newEmail,
          contact: newContact,
          joining_date: newJoinDate
        })
      })

      if (!res.ok) {
        const errJson = await res.json()
        throw new Error(errJson.error || 'Failed to hire staff member')
      }

      const json = await res.json()
      if (json.success) {
        setHiredCredentials({
          name: newName,
          role: newRole,
          email: newEmail,
          password: json.generatedPassword,
          id: json.staffId
        })
        setActiveModal('hire-success')
        triggerToast(`Success: Staff member "${newName}" successfully hired.`)
        
        // Reset Form
        setNewName('')
        setNewEmail('')
        setNewRole('Teacher')
        setNewContact('')
        setNewJoinDate('')
        
        await loadData()
      }
    } catch (err: any) {
      alert(err.message)
      setLoading(false)
    }
  }

  // Handle staff termination
  const handleConfirmRemoveStaff = async () => {
    if (!selectedStaff || !removalReason.trim()) return

    try {
      setLoading(true)
      const res = await fetch('/api/founder/staff', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staff_id: selectedStaff.id,
          reason: removalReason
        })
      })

      if (!res.ok) {
        const errJson = await res.json()
        throw new Error(errJson.error || 'Failed to terminate staff member')
      }

      const json = await res.json()
      if (json.success) {
        triggerToast(`System Lock: "${selectedStaff.name}" has been terminated and portal access revoked.`)
        setSelectedStaff(null)
        setRemovalReason('')
        setActiveModal(null)
        await loadData()
      }
    } catch (err: any) {
      alert(err.message)
      setLoading(false)
    }
  }

  const filteredStaff = staffList.filter(s => {
    const nameMatch = (s.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    const emailMatch = (s.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    const idMatch = (s.id || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSearch = nameMatch || emailMatch || idMatch
    const matchesRole = roleFilter === 'All' || s.role === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <div className="flex h-screen w-screen bg-[#FAFAF7] text-zinc-800 select-none overflow-hidden font-sans relative">
      <GeometricPattern opacity={0.04} />

      {/* ========================================== */}
      {/* PERSISTENT LEFT SIDEBAR                    */}
      {/* ========================================== */}
      <aside className="w-80 shrink-0 border-r border-zinc-200 bg-white flex flex-col h-full overflow-hidden z-20">
        
        <div className="flex border-b border-zinc-155 px-6 py-5 items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img src="/weblogo-01.png" alt="Virtual Zawiyah Logo" className="h-9 w-auto object-contain" />
            <div>
              <span className="text-sm font-bold font-serif text-zinc-900 leading-tight block">Virtual Zawiyah</span>
              <span className="block text-[9px] uppercase tracking-wider text-[#1B6B3A] font-bold leading-none mt-0.5">FOUNDER PORTAL</span>
            </div>
          </div>
          <NotificationBell />
        </div>

        {/* Navigation Sidebar List */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {/* Financial Overview Tab */}
          <button 
            onClick={() => setActiveTab('financial')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold font-sans transition-all duration-150 active:scale-[0.98] ${
              activeTab === 'financial' 
                ? 'bg-[#1B6B3A] text-white shadow-xs' 
                : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <DollarSign className="h-4 w-4 shrink-0" />
              <span>Financial Overview</span>
            </div>
          </button>

          {/* Academy Overview Tab */}
          <button 
            onClick={() => setActiveTab('academy')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold font-sans transition-all duration-150 active:scale-[0.98] ${
              activeTab === 'academy' 
                ? 'bg-[#1B6B3A] text-white shadow-xs' 
                : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Building className="h-4 w-4 shrink-0" />
              <span>Academy Overview</span>
            </div>
          </button>

          {/* Staff Directory Tab */}
          <button 
            onClick={() => setActiveTab('staff')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold font-sans transition-all duration-150 active:scale-[0.98] ${
              activeTab === 'staff' 
                ? 'bg-[#1B6B3A] text-white shadow-xs' 
                : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 shrink-0" />
              <span>Staff Directory</span>
            </div>
          </button>

          {/* View Portals switcher Tab */}
          <button 
            onClick={() => setActiveTab('portals')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold font-sans transition-all duration-150 active:scale-[0.98] ${
              activeTab === 'portals' 
                ? 'bg-[#1B6B3A] text-white shadow-xs' 
                : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Briefcase className="h-4 w-4 shrink-0" />
              <span>View Portals (&quot;View As&quot;)</span>
            </div>
          </button>
        </nav>

        {/* Founder Profile Section */}
        <div className="border-t border-zinc-200 bg-[#1B6B3A]/5 p-4 shrink-0 mt-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-xl bg-white border border-[#C9A84C]/30 shadow-xs flex items-center justify-center text-[#1B6B3A] font-bold text-xs shrink-0">
              AS
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-zinc-800 leading-none">Abu Sulaiman</p>
              <span className="text-[9px] text-[#1B6B3A] block mt-1 font-bold">Owner & Founder</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white py-2 text-[10px] font-bold text-zinc-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 active:scale-95 transition-all"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
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
              {activeTab === 'financial' && 'Financial Ledger Overview'}
              {activeTab === 'academy' && 'Academy-Wide Academic Overview'}
              {activeTab === 'staff' && 'Central Staff Roster'}
              {activeTab === 'portals' && 'View As Role Switchboard'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-[10px] text-zinc-500 font-mono font-bold bg-zinc-50 border border-zinc-200/80 px-3 py-1.5 rounded-xl">
              SYSTEM PRIVILEGE: OWNER
            </div>
          </div>
        </header>

        {/* Viewport Content Area */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          
          {loading && staffList.length === 0 && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-50">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 text-[#1B6B3A] animate-spin" />
                <span className="text-xs text-zinc-650 font-bold uppercase tracking-wider">Loading Platform Data...</span>
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

          {/* Success Toast notifications */}
          {successToast && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 shadow-sm animate-fade-in-up">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
              <span>{successToast}</span>
            </div>
          )}

          {/* ========================================== */}
          {/* TAB 1: FINANCIAL OVERVIEW                  */}
          {/* ========================================== */}
          {activeTab === 'financial' && (
            <div className="space-y-8">
              
              {/* Highlight Prominent Net Balance Card */}
              <div className="border border-[#C9A84C]/40 bg-zinc-900 rounded-3xl p-8 text-white shadow-lg max-w-4xl relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10 translate-x-8 translate-y-8 select-none">
                  <Shield className="h-48 w-48 text-[#C9A84C]" />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">PROMINENT NET MONTHLY BALANCES</span>
                    <h3 className="text-4xl font-serif font-black text-[#C9A84C]">${financialData.netBalanceUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD <span className="text-xs font-sans text-zinc-300 font-semibold tracking-normal block sm:inline sm:ml-2">(Net Surplus Margin)</span></h3>
                  </div>
                  <span className="px-3 py-1 border border-[#C9A84C]/30 bg-[#C9A84C]/10 text-[#C9A84C] rounded-lg text-[9px] font-bold uppercase tracking-wider">
                    Executive Review
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 mt-6 border-t border-white/10 text-xs">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-zinc-400 block mb-0.5">Student Tuition Income</span>
                    <p className="font-bold text-emerald-400 font-mono text-lg">${financialData.feeIncomeUSD.toLocaleString()} USD</p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-zinc-400 block mb-0.5">Total Outgoing Expenses</span>
                    <p className="font-bold text-rose-400 font-mono text-lg">
                      Rs. {financialData.totalExpensesPKR.toLocaleString()} <span className="text-[10px] font-sans text-zinc-300 font-medium">(${financialData.totalExpensesUSD.toLocaleString('en-US', { maximumFractionDigits: 2 })} USD eq)</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Six Months Income vs Expenses Trend Chart */}
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xs max-w-4xl space-y-4">
                <h4 className="font-serif font-bold text-zinc-900 text-sm">Income vs Expenses (6-Month Trend)</h4>
                
                {/* SVG Line / Bar chart representation */}
                <div className="h-64 w-full relative pt-4">
                  <svg className="w-full h-full" viewBox="0 0 600 220" preserveAspectRatio="none">
                    {/* Y-Axis Gridlines */}
                    <line x1="40" y1="20" x2="580" y2="20" stroke="#F1F1EB" strokeWidth="1" />
                    <line x1="40" y1="70" x2="580" y2="70" stroke="#F1F1EB" strokeWidth="1" />
                    <line x1="40" y1="120" x2="580" y2="120" stroke="#F1F1EB" strokeWidth="1" />
                    <line x1="40" y1="170" x2="580" y2="170" stroke="#F1F1EB" strokeWidth="1" />
                    
                    {trendData.length > 0 ? trendData.map((item, index) => {
                      const maxVal = Math.max(...trendData.map(t => Math.max(t.feeIncomeUSD, t.totalExpensesUSD)), 1000)
                      const incHeight = (item.feeIncomeUSD / maxVal) * 150
                      const expHeight = (item.totalExpensesUSD / maxVal) * 150
                      const xBase = 70 + index * 90
                      return (
                        <g key={index}>
                          <text x={xBase} y="195" fill="#8E8E93" fontSize="9" fontWeight="bold" textAnchor="middle">{item.month}</text>
                          <rect x={xBase - 15} y={170 - incHeight} width="14" height={incHeight} rx="2" fill="#1B6B3A" fillOpacity="0.85" />
                          <rect x={xBase + 1} y={170 - expHeight} width="14" height={expHeight} rx="2" fill="#C9A84C" fillOpacity="0.85" />
                        </g>
                      )
                    }) : (
                      <text x="300" y="100" fill="#8E8E93" fontSize="11" textAnchor="middle">Loading trend logs...</text>
                    )}
                  </svg>
                  
                  <div className="flex justify-center gap-6 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mt-2">
                    <div className="flex items-center gap-1.5">
                      <span className="h-3 w-3 bg-[#1B6B3A] rounded-md" />
                      <span>Fee Income</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-3 w-3 bg-[#C9A84C] rounded-md" />
                      <span>Expenses</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Breakdown Ledger Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl">
                
                {/* Tuition Fee Card */}
                <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-2xs space-y-2">
                  <span className="text-[9px] font-bold text-zinc-450 uppercase block tracking-wider">Tuition Fee Revenue</span>
                  <h4 className="text-xl font-bold font-mono text-[#1B6B3A]">${financialData.feeIncomeUSD.toLocaleString()} USD</h4>
                  <p className="text-[10px] text-zinc-500 font-medium">Billed monthly from active pupils</p>
                </div>

                {/* Teacher Salaries */}
                <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-2xs space-y-2">
                  <span className="text-[9px] font-bold text-zinc-450 uppercase block tracking-wider">Faculty Payroll</span>
                  <h4 className="text-xl font-bold font-mono text-zinc-800">Rs. {financialData.teacherSalariesPKR.toLocaleString()} PKR</h4>
                  <p className="text-[10px] text-zinc-500 font-medium">Base salaries &amp; deductions</p>
                </div>

                {/* Other Staff Salaries */}
                <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-2xs space-y-2">
                  <span className="text-[9px] font-bold text-zinc-450 uppercase block tracking-wider">Support Staff Payroll</span>
                  <h4 className="text-xl font-bold font-mono text-zinc-800">Rs. {financialData.staffSalariesPKR.toLocaleString()} PKR</h4>
                  <p className="text-[10px] text-zinc-500 font-medium">Guards, cleaners, &amp; office boys</p>
                </div>

                {/* Petty Cash expenses */}
                <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-2xs space-y-2">
                  <span className="text-[9px] font-bold text-zinc-450 uppercase block tracking-wider">Logged Expenses</span>
                  <h4 className="text-xl font-bold font-mono text-zinc-800">Rs. {financialData.expensesPKR.toLocaleString()} PKR</h4>
                  <p className="text-[10px] text-zinc-500 font-medium">Utility bills and custom cash logs</p>
                </div>

              </div>

              {/* Link to view full finance details */}
              <div className="max-w-4xl flex justify-start">
                <button
                  onClick={() => window.location.href = '/finance/dashboard?from=founder'}
                  className="px-5 py-3 border border-[#C9A84C] text-[#C9A84C] bg-zinc-950 font-bold rounded-xl text-xs flex items-center gap-2 hover:bg-zinc-900 active:scale-95 transition-all shadow-md"
                >
                  <span>Open Full Finance Officer Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

            </div>
          )}

          {/* ========================================== */}
          {/* TAB 2: ACADEMY OVERVIEW                    */}
          {/* ========================================== */}
          {activeTab === 'academy' && (
            <div className="space-y-6 max-w-4xl">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Active Students Card */}
                <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xs space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                    <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Student Registry</h4>
                    <span className="text-[10px] font-mono text-zinc-500 bg-zinc-50 px-2 py-0.5 border border-zinc-150 rounded">Active</span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-bold text-zinc-900 font-serif">{academyData.studentsCount} Students Enrolled</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[9px] text-zinc-500 block">1:1 Individual</span>
                        <span className="font-bold text-[#1B6B3A]">{academyData.oneOnOneStudentsCount} pupils</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-500 block">Group Sessions</span>
                        <span className="font-bold text-zinc-700">{academyData.groupStudentsCount} pupils</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active Teachers Card */}
                <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xs space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                    <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Faculty Members</h4>
                    <span className="text-[10px] font-mono text-zinc-500 bg-zinc-50 px-2 py-0.5 border border-zinc-150 rounded">Active</span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-bold text-zinc-900 font-serif">{academyData.teachersCount} Teachers On Duty</h3>
                    <div className="grid grid-cols-3 gap-2 text-[10px]">
                      <div>
                        <span className="text-[9px] text-zinc-500 block">1:1 Scope</span>
                        <span className="font-bold text-[#1B6B3A]">{academyData.teacherTypesCount['1:1']} teachers</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-500 block">Nizami</span>
                        <span className="font-bold text-zinc-700">{academyData.teacherTypesCount['Dars-e-Nizami']} teachers</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-500 block">Tajweed</span>
                        <span className="font-bold text-zinc-700">{academyData.teacherTypesCount['Tajweed']} teachers</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Attendance and Warnings summary list */}
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xs space-y-6">
                <div className="border-b border-zinc-100 pb-3">
                  <h4 className="font-serif font-bold text-sm text-zinc-950">Supervisional warning stats &amp; trial metrics</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                  <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5">
                    <span className="text-[10px] font-bold text-zinc-500 block uppercase tracking-wider mb-1">Global Attendance</span>
                    <h3 className="text-3xl font-black text-[#1B6B3A] font-mono">{academyData.attendancePercent}%</h3>
                    <p className="text-[9px] text-zinc-450 mt-1 font-medium">Aggregated logs from all sectors</p>
                  </div>
                  <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5">
                    <span className="text-[10px] font-bold text-zinc-500 block uppercase tracking-wider mb-1">Active Trial Students</span>
                    <h3 className="text-3xl font-black text-blue-700 font-mono">{academyData.trialsCount}</h3>
                    <p className="text-[9px] text-zinc-450 mt-1 font-medium">Currently matching in matchmaking console</p>
                  </div>
                  <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5">
                    <span className="text-[10px] font-bold text-zinc-500 block uppercase tracking-wider mb-1">Pending Escalations</span>
                    <h3 className="text-3xl font-black text-rose-700 font-mono">{academyData.escalationsCount}</h3>
                    <p className="text-[9px] text-zinc-450 mt-1 font-medium">Awaiting director override decision</p>
                  </div>
                </div>
              </div>

              {/* Documentation & Audits Section */}
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xs space-y-4">
                <div className="border-b border-zinc-100 pb-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-serif font-bold text-sm text-zinc-950">System Documentation &amp; Audits</h4>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Download the complete guides and reference manuals for the Virtual Zawiyah system.</p>
                  </div>
                  <Shield className="h-5 w-5 text-[#1B6B3A] shrink-0" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <a
                    href="/COMPLETE_PROJECT_GUIDE.md"
                    download
                    className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200 rounded-2xl hover:bg-zinc-100 transition-all text-xs font-bold text-zinc-800"
                  >
                    <div className="space-y-1">
                      <span className="block font-bold">Complete Project Guide</span>
                      <span className="block text-[9px] text-zinc-500 font-normal">Reference handbook for staff, workflows &amp; triggers</span>
                    </div>
                    <Download className="h-4.5 w-4.5 text-[#1B6B3A] shrink-0" />
                  </a>

                  <a
                    href="/GAP_REPORT.md"
                    download
                    className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200 rounded-2xl hover:bg-zinc-100 transition-all text-xs font-bold text-zinc-800"
                  >
                    <div className="space-y-1">
                      <span className="block font-bold">Schema Gap Report</span>
                      <span className="block text-[9px] text-zinc-500 font-normal">Database audit and dashboard requirements analysis</span>
                    </div>
                    <Download className="h-4.5 w-4.5 text-[#1B6B3A] shrink-0" />
                  </a>
                </div>
              </div>

              {/* Link to view academic details */}
              <div className="flex justify-start">
                <button
                  onClick={() => window.location.href = '/director/dashboard?from=founder'}
                  className="px-5 py-3 border border-[#C9A84C] text-[#C9A84C] bg-zinc-950 font-bold rounded-xl text-xs flex items-center gap-2 hover:bg-zinc-900 active:scale-95 transition-all shadow-md"
                >
                  <span>Open Academic Director Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

            </div>
          )}

          {/* ========================================== */}
          {/* TAB 3: STAFF DIRECTORY                     */}
          {/* ========================================== */}
          {activeTab === 'staff' && (
            <div className="space-y-6 max-w-5xl">
              
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xs space-y-4">
                <div className="border-b border-zinc-150 pb-3 flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 font-serif">Central Academy Staff Registry</h3>
                    <p className="text-[10px] text-zinc-500 mt-1">Founding authority access: manage admissions, registrars, supervisors, finance officers, and faculty registers.</p>
                  </div>
                  <button
                    onClick={() => {
                      setNewName('')
                      setNewEmail('')
                      setNewContact('')
                      setNewJoinDate('')
                      setNewRole('Teacher')
                      setActiveModal('add-staff')
                    }}
                    className="px-4 py-2 bg-[#1B6B3A] text-white hover:bg-[#1B6B3A]/90 font-bold rounded-xl text-xs active:scale-[0.98] transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Hire New Staff</span>
                  </button>
                </div>

                {/* Roster Filters */}
                <div className="flex flex-wrap items-center gap-3 pb-3 border-b border-zinc-100">
                  <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Search staff by name, email, or ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-xl text-xs bg-zinc-50/50 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] text-zinc-800"
                    />
                  </div>
                  <div className="w-48 shrink-0">
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs bg-zinc-50/50 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] text-zinc-800"
                    >
                      <option value="All">All Roles</option>
                      <option value="Academic Director">Academic Director</option>
                      <option value="Supervisor">Supervisor</option>
                      <option value="Registrar">Registrar</option>
                      <option value="Content Manager">Content Manager</option>
                      <option value="Finance Officer">Finance Officer</option>
                      <option value="Teacher">Teacher</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                        <th className="pb-3 pr-4">Staff Member Details</th>
                        <th className="pb-3 px-4">Executive Role</th>
                        <th className="pb-3 px-4">Contact Phone</th>
                        <th className="pb-3 px-4">Hire Date</th>
                        <th className="pb-3 px-4">Status</th>
                        <th className="pb-3 pl-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-150 text-xs font-sans">
                      {filteredStaff.map(s => (
                        <tr key={s.id} className="hover:bg-zinc-50/20 transition-colors">
                          <td className="py-3 pr-4 font-bold text-zinc-900">
                            <div>
                              <span className="block font-sans text-xs text-zinc-850">{s.name}</span>
                              <span className="block text-[8px] text-zinc-450 font-mono mt-0.5">{s.id}</span>
                              <span className="block text-[8px] text-[#1B6B3A] font-medium font-sans mt-0.5">{s.email}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-zinc-700 font-medium">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              s.role === 'Academic Director' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                              s.role === 'Supervisor' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                              s.role === 'Registrar' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                              s.role === 'Finance Officer' ? 'bg-purple-50 text-purple-800 border border-purple-200' :
                              s.role === 'Content Manager' ? 'bg-indigo-50 text-indigo-800 border border-indigo-200' :
                              'bg-zinc-50 text-zinc-700 border border-zinc-200'
                            }`}>
                              {s.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-medium text-zinc-800">{s.contact}</td>
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
                                  setSelectedStaff(s)
                                  setRemovalReason('')
                                  setActiveModal('remove-staff')
                                }}
                                className="p-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors active:scale-95"
                                title="Terminate staff member"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredStaff.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-zinc-500 italic text-xs">
                            No staff records matched the search filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ========================================== */}
          {/* TAB 4: VIEW PORTALS SWITCHER               */}
          {/* ========================================== */}
          {activeTab === 'portals' && (
            <div className="space-y-6 max-w-5xl">
              
              <div className="bg-[#1B6B3A]/5 border border-[#1B6B3A]/20 rounded-3xl p-6 mb-6">
                <span className="text-[10px] font-bold text-[#1B6B3A] uppercase tracking-wider block mb-1">FOUNDING EXECUTIVE OVERRIDE</span>
                <h4 className="text-sm font-bold text-zinc-900 font-serif">View Portal As Role Dashboard Switchboard</h4>
                <p className="text-xs text-zinc-700 mt-1 leading-relaxed">
                  These links allow you to open any portal role dashboard exactly as that staff member sees it. Each target portal will render a persistent black top banner letting you easily return to this Owner Console page.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* 1. Finance Officer Portal */}
                <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xs flex flex-col justify-between h-48 hover:border-zinc-350 transition-all">
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-450 block">Finance Ledger</span>
                    <h4 className="text-xs font-bold text-zinc-900">Finance Officer Portal</h4>
                    <p className="text-[10px] text-zinc-550 leading-relaxed">Verifies tuition bank slips, configures payroll ledger structures, and marks payout releases.</p>
                  </div>
                  <button
                    onClick={() => window.open('/finance/dashboard?from=founder', '_blank')}
                    className="w-full py-2 bg-[#1B6B3A] hover:bg-[#1B6B3A]/90 text-white font-bold rounded-xl text-[10px] active:scale-95 transition-all shadow-xs flex items-center justify-center gap-1"
                  >
                    <span>Open Portal</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                {/* 2. Academic Director Portal */}
                <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xs flex flex-col justify-between h-48 hover:border-zinc-350 transition-all">
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-450 block">Operations Directorate</span>
                    <h4 className="text-xs font-bold text-zinc-900">Academic Director Portal</h4>
                    <p className="text-[10px] text-zinc-550 leading-relaxed">Manages supervisor metrics, reviews disciplinary recommendations, and handles non-teaching HR operations.</p>
                  </div>
                  <button
                    onClick={() => window.open('/director/dashboard?from=founder', '_blank')}
                    className="w-full py-2 bg-[#1B6B3A] hover:bg-[#1B6B3A]/90 text-white font-bold rounded-xl text-[10px] active:scale-95 transition-all shadow-xs flex items-center justify-center gap-1"
                  >
                    <span>Open Portal</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                {/* 3. Supervisor Portal */}
                <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xs flex flex-col justify-between h-48 hover:border-zinc-350 transition-all">
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-450 block">Disputes & Faculty</span>
                    <h4 className="text-xs font-bold text-zinc-900">Supervisor Portal</h4>
                    <p className="text-[10px] text-zinc-550 leading-relaxed">Monitors low attendance rates, marks warning actions, and resolves student-teacher class hours conflicts.</p>
                  </div>
                  <button
                    onClick={() => window.open('/supervisor/dashboard?from=founder', '_blank')}
                    className="w-full py-2 bg-[#1B6B3A] hover:bg-[#1B6B3A]/90 text-white font-bold rounded-xl text-[10px] active:scale-95 transition-all shadow-xs flex items-center justify-center gap-1"
                  >
                    <span>Open Portal</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                {/* 4. Registrar Portal */}
                <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xs flex flex-col justify-between h-48 hover:border-zinc-350 transition-all">
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-450 block">Admissions matching</span>
                    <h4 className="text-xs font-bold text-zinc-900">Registrar Portal</h4>
                    <p className="text-[10px] text-zinc-550 leading-relaxed">Runs matching matches on admissions, registers new active students, and approves trial session slots.</p>
                  </div>
                  <button
                    onClick={() => window.open('/registrar/dashboard?from=founder', '_blank')}
                    className="w-full py-2 bg-[#1B6B3A] hover:bg-[#1B6B3A]/90 text-white font-bold rounded-xl text-[10px] active:scale-95 transition-all shadow-xs flex items-center justify-center gap-1"
                  >
                    <span>Open Portal</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                {/* 5. Content Manager Portal */}
                <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xs flex flex-col justify-between h-48 hover:border-zinc-350 transition-all">
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-450 block">Curriculum Configs</span>
                    <h4 className="text-xs font-bold text-zinc-900">Content Manager Portal</h4>
                    <p className="text-[10px] text-zinc-550 leading-relaxed">Configures public tuition rates, publishes home announcements, and maps Dars-e-Nizami subjects.</p>
                  </div>
                  <button
                    onClick={() => window.open('/content-manager/dashboard?from=founder', '_blank')}
                    className="w-full py-2 bg-[#1B6B3A] hover:bg-[#1B6B3A]/90 text-white font-bold rounded-xl text-[10px] active:scale-95 transition-all shadow-xs flex items-center justify-center gap-1"
                  >
                    <span>Open Portal</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                {/* 6. Teacher Portal (1:1) */}
                <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xs flex flex-col justify-between h-48 hover:border-zinc-350 transition-all">
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-450 block">Classrooms logs</span>
                    <h4 className="text-xs font-bold text-zinc-900">Teacher Portal (1:1)</h4>
                    <p className="text-[10px] text-zinc-555 leading-relaxed">Mark attendances, updates sabaq/manzil lesson cards, and applies for 12-hour slots leave overrides.</p>
                  </div>
                  <button
                    onClick={() => window.open('/teacher/dashboard?from=founder', '_blank')}
                    className="w-full py-2 bg-[#1B6B3A] hover:bg-[#1B6B3A]/90 text-white font-bold rounded-xl text-[10px] active:scale-95 transition-all shadow-xs flex items-center justify-center gap-1"
                  >
                    <span>Open Portal</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>

      {/* HIRE STAFF MODAL */}
      {activeModal === 'add-staff' && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-scale-up">
            <h3 className="text-sm font-bold text-zinc-955 font-serif">Issue Executive Hire Order</h3>
            
            <form onSubmit={handleAddStaffSubmit} className="space-y-4 text-xs font-medium text-zinc-850">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1">Staff Full Name</label>
                <input 
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Brother Kamal"
                  className="w-full text-xs p-3 rounded-xl border border-zinc-300 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] text-zinc-800"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1">Email Address</label>
                <input 
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. kamal@test.com"
                  className="w-full text-xs p-3 rounded-xl border border-zinc-300 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] text-zinc-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1">Executive Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] text-zinc-800"
                  >
                    <option value="Academic Director">Academic Director</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Registrar">Registrar</option>
                    <option value="Content Manager">Content Manager</option>
                    <option value="Finance Officer">Finance Officer</option>
                    <option value="Teacher">Teacher</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1">Joining Date</label>
                  <input 
                    type="date"
                    required
                    value={newJoinDate}
                    onChange={(e) => setNewJoinDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] text-zinc-850"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1">Contact Phone Number</label>
                <input 
                  type="text"
                  required
                  value={newContact}
                  onChange={(e) => setNewContact(e.target.value)}
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
                  Issue Hire Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HIRE SUCCESS MODAL */}
      {activeModal === 'hire-success' && hiredCredentials && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-[#C9A84C]/45 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-scale-up text-zinc-850">
            <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
              <div className="p-2 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-955 font-serif">Executive Order Executed</h3>
                <p className="text-[10px] text-zinc-500 font-medium">New credentials generated successfully</p>
              </div>
            </div>
            
            <div className="space-y-3 text-xs bg-zinc-50 p-4 rounded-2xl border border-zinc-200/80 font-medium">
              <div className="grid grid-cols-3 gap-1">
                <span className="text-zinc-500 text-[10px]">Name:</span>
                <span className="col-span-2 text-zinc-800 font-bold">{hiredCredentials.name}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-zinc-500 text-[10px]">Role:</span>
                <span className="col-span-2 text-zinc-850 font-bold">{hiredCredentials.role}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-zinc-500 text-[10px]">Email:</span>
                <span className="col-span-2 text-zinc-800 font-mono select-all bg-white px-2 py-0.5 border border-zinc-150 rounded">{hiredCredentials.email}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-zinc-500 text-[10px]">Password:</span>
                <span className="col-span-2 text-zinc-800 font-mono select-all bg-white px-2 py-0.5 border border-zinc-150 rounded">{hiredCredentials.password}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-zinc-500 text-[10px]">System ID:</span>
                <span className="col-span-2 text-zinc-800 font-mono font-bold">{hiredCredentials.id}</span>
              </div>
            </div>

            <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200/50 p-3 rounded-xl font-semibold leading-relaxed text-center">
              ⚠️ Copy and share these credentials securely. The password cannot be recovered once this modal is closed.
            </p>

            <div className="flex justify-end pt-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setHiredCredentials(null)
                  setActiveModal(null)
                }}
                className="py-2.5 px-5 bg-zinc-900 hover:bg-zinc-950 text-white font-bold rounded-xl active:scale-95 transition-all w-full text-center"
              >
                Close &amp; Return
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TERMINATE STAFF MEMBER MODAL */}
      {activeModal === 'remove-staff' && selectedStaff && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl shrink-0">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-955 font-serif">Confirm Staff Termination</h4>
                <p className="text-xs text-zinc-700 font-medium mt-1 leading-relaxed">
                  You are about to permanently remove and strip credentials from <strong>{selectedStaff.name}</strong> ({selectedStaff.role}). This action is absolute and overrides all port guards.
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-2">Justification / Termination Reason Notes</label>
              <textarea
                value={removalReason}
                onChange={(e) => setRemovalReason(e.target.value)}
                placeholder="State the official grounds for termination override..."
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
                Terminate Credentials
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
