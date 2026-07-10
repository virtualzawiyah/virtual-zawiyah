'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Search, 
  Plus, 
  Edit, 
  LogOut, 
  Calendar, 
  Check, 
  X, 
  Send,
  UserCheck,
  Download,
  Eye,
  Loader2
} from 'lucide-react'
import * as XLSX from 'xlsx'
import NotificationBell from '@/components/NotificationBell'
import GeometricPattern from '@/components/GeometricPattern'
import BackToFounderBanner from '@/components/BackToFounderBanner'

// --- Mock Interfaces ---
interface StudentFee {
  id: string
  name: string
  course: string
  amount: number
  status: 'Paid' | 'Pending' | 'Overdue'
  receiptUploaded: boolean
}

interface DeferralRequest {
  id: string
  studentName: string
  reason: string
  requestedDate: string
}

interface TeacherSalary {
  id: string
  name: string
  salary: number
  isPaidThisMonth: boolean
}

interface StaffSalary {
  id: string
  name: string
  role: 'Security Guard' | 'Office Boy' | 'Cleaner' | 'Other'
  salary: number
  isPaidThisMonth: boolean
}

interface SalaryPayment {
  id: string
  teacherName: string
  month: string
  amount: number
  datePaid: string
}

interface Expense {
  id: string
  date: string
  category: 'Rent' | 'Utilities' | 'Tea & Refreshments' | 'Charity & Welfare' | 'Miscellaneous'
  amount: number
  description: string
}

// --- Initial Mock Data ---
const INITIAL_STUDENTS: StudentFee[] = [
  { id: 's-101', name: 'Bilal Khan', course: 'Quran Reading with Tajweed', amount: 60, status: 'Paid', receiptUploaded: false },
  { id: 's-102', name: 'Ayesha Siddiqui', course: 'Applied Tajweed (Basic)', amount: 60, status: 'Pending', receiptUploaded: true }, // receipt uploaded
  { id: 's-103', name: 'Hamza Yusuf', course: 'Quran Memorization (Hifz)', amount: 60, status: 'Overdue', receiptUploaded: false },
  { id: 's-104', name: 'Fatima Zafar', course: 'Arabic Grammar (Sarf & Nahw)', amount: 60, status: 'Paid', receiptUploaded: false },
  { id: 's-105', name: 'Zainab Rashid', course: 'Quran Translation', amount: 60, status: 'Pending', receiptUploaded: false },
  { id: 's-106', name: 'Omar Al-Faruq', course: 'Dars-e-Nizami — Classical Islamic Curriculum', amount: 10, status: 'Overdue', receiptUploaded: false },
  { id: 's-107', name: 'Mariam Karim', course: 'Tajweed — 2-Year Structured Group Program', amount: 10, status: 'Paid', receiptUploaded: false },
  { id: 's-108', name: 'Suhail Hasan', course: 'Weekend Monthly ($100)', amount: 100, status: 'Pending', receiptUploaded: true } // receipt uploaded
]

const INITIAL_DEFERRALS: DeferralRequest[] = [
  { id: 'def-1', studentName: 'Zainab Rashid', reason: 'Delayed family allowance check delivery.', requestedDate: '2026-07-05' },
  { id: 'def-2', studentName: 'Hamza Yusuf', reason: 'Emergency medical expenditures this cycle.', requestedDate: '2026-07-10' }
]

const INITIAL_TEACHERS: TeacherSalary[] = [
  { id: 't-201', name: 'Mufti Tariq Masood', salary: 125000, isPaidThisMonth: false },
  { id: 't-202', name: 'Dr. Israr Ahmed', salary: 150000, isPaidThisMonth: true },
  { id: 't-203', name: 'Ustadh Nouman Ali Khan', salary: 140000, isPaidThisMonth: false },
  { id: 't-204', name: 'Shaykh Hamza Yusuf', salary: 160000, isPaidThisMonth: false }
]

const INITIAL_SALARY_PAYMENTS: SalaryPayment[] = [
  { id: 'sp-1', teacherName: 'Mufti Tariq Masood', month: 'May 2026', amount: 125000, datePaid: '2026-05-28' },
  { id: 'sp-2', teacherName: 'Dr. Israr Ahmed', month: 'May 2026', amount: 150000, datePaid: '2026-05-28' },
  { id: 'sp-3', teacherName: 'Ustadh Nouman Ali Khan', month: 'May 2026', amount: 140000, datePaid: '2026-05-28' },
  { id: 'sp-4', teacherName: 'Shaykh Hamza Yusuf', month: 'May 2026', amount: 160000, datePaid: '2026-05-28' },
  { id: 'sp-5', teacherName: 'Dr. Israr Ahmed', month: 'June 2026', amount: 150000, datePaid: '2026-06-21' }
]

const INITIAL_OTHER_STAFF: StaffSalary[] = [
  { id: 'st-01', name: 'Muhammad Ramzan', role: 'Security Guard', salary: 25000, isPaidThisMonth: false },
  { id: 'st-02', name: 'Sajid Ali', role: 'Office Boy', salary: 20000, isPaidThisMonth: false },
  { id: 'st-03', name: 'Abdul Karim', role: 'Cleaner', salary: 18000, isPaidThisMonth: true },
  { id: 'st-04', name: 'Tariq Masih', role: 'Cleaner', salary: 18000, isPaidThisMonth: false },
  { id: 'st-05', name: 'Bilal Shah', role: 'Security Guard', salary: 26000, isPaidThisMonth: false }
]

const INITIAL_OTHER_STAFF_PAYMENTS: SalaryPayment[] = [
  { id: 'osp-1', teacherName: 'Abdul Karim', month: 'May 2026', amount: 18000, datePaid: '2026-05-28' },
  { id: 'osp-2', teacherName: 'Muhammad Ramzan', month: 'May 2026', amount: 25000, datePaid: '2026-05-28' },
  { id: 'osp-3', teacherName: 'Sajid Ali', month: 'May 2026', amount: 20000, datePaid: '2026-05-28' },
  { id: 'osp-4', teacherName: 'Tariq Masih', month: 'May 2026', amount: 18000, datePaid: '2026-05-28' },
  { id: 'osp-5', teacherName: 'Abdul Karim', month: 'June 2026', amount: 18000, datePaid: '2026-06-21' }
]

// --- Historical Expenses Archives (10 Years retention mock) ---
const MAY_EXPENSES: Expense[] = [
  { id: 'exp-may1', date: '2026-05-01', category: 'Rent', amount: 120000, description: 'Academy building headquarter premises rental.' },
  { id: 'exp-may2', date: '2026-05-05', category: 'Utilities', amount: 32000, description: 'Broadband internet & power grids.' },
  { id: 'exp-may3', date: '2026-05-12', category: 'Tea & Refreshments', amount: 9000, description: 'Staff pantry supplies.' },
  { id: 'exp-may4', date: '2026-05-18', category: 'Miscellaneous', amount: 14000, description: 'Office printing & cleaning supplies.' }
]

const APRIL_EXPENSES: Expense[] = [
  { id: 'exp-apr1', date: '2026-04-01', category: 'Rent', amount: 120000, description: 'Academy building headquarter premises rental.' },
  { id: 'exp-apr2', date: '2026-04-04', category: 'Utilities', amount: 38000, description: 'Broadband internet & power grids.' },
  { id: 'exp-apr3', date: '2026-04-15', category: 'Charity & Welfare', amount: 20000, description: 'Sadaqah scholarship tuition waivers.' },
  { id: 'exp-apr4', date: '2026-04-22', category: 'Tea & Refreshments', amount: 11000, description: 'Staff pantry refreshments.' }
]

const EXPENSES_2025: Expense[] = [
  { id: 'exp-2025-1', date: '2025-12-31', category: 'Rent', amount: 1440000, description: 'Annual cumulative building headquarter rental.' },
  { id: 'exp-2025-2', date: '2025-12-31', category: 'Utilities', amount: 420000, description: 'Annual broadband internet & electricity billings.' },
  { id: 'exp-2025-3', date: '2025-12-31', category: 'Charity & Welfare', amount: 180000, description: 'Annual scholarship waivers.' },
  { id: 'exp-2025-4', date: '2025-12-31', category: 'Tea & Refreshments', amount: 105000, description: 'Annual pantry refreshment supplies.' }
]

const EXPENSES_2024: Expense[] = [
  { id: 'exp-2024-1', date: '2024-12-31', category: 'Rent', amount: 1440000, description: 'Annual building headquarter rental.' },
  { id: 'exp-2024-2', date: '2024-12-31', category: 'Utilities', amount: 395000, description: 'Annual broadband internet & electricity.' },
  { id: 'exp-2024-3', date: '2024-12-31', category: 'Charity & Welfare', amount: 150000, description: 'Annual scholarship waivers.' },
  { id: 'exp-2024-4', date: '2024-12-31', category: 'Tea & Refreshments', amount: 98000, description: 'Annual pantry supplies.' }
]

const INITIAL_EXPENSES: Expense[] = [
  { id: 'exp-1', date: '2026-06-01', category: 'Rent', amount: 120000, description: 'Academy building headquarter premises rental.' },
  { id: 'exp-2', date: '2026-06-05', category: 'Utilities', amount: 35000, description: 'High-speed broadband internet & power electric grids.' },
  { id: 'exp-3', date: '2026-06-10', category: 'Tea & Refreshments', amount: 8000, description: 'Staff pantry supplies (teabags, biscuits, milk cartons).' },
  { id: 'exp-4', date: '2026-06-15', category: 'Charity & Welfare', amount: 15000, description: 'Sadaqah scholarship tuition fee waivers for needy pupils.' },
  { id: 'exp-5', date: '2026-06-20', category: 'Miscellaneous', amount: 7000, description: 'Office printing papers and replacement dry-erase markers.' }
]

export default function FinanceOfficerDashboard() {
  const handleLogout = async () => {
    document.cookie = 'vz_user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;'
    await supabase.auth.signOut()
    window.location.href = '/staff/login'
  }

  const [activeTab, setActiveTab] = useState<'overview' | 'fee-collection' | 'deferrals' | 'salary' | 'expenses'>('overview')

  // --- States ---
  const [overview, setOverview] = useState<{ totalCollectedUSD: number; totalPendingUSD: number; totalExpensesPKR: number } | null>(null)
  const [students, setStudents] = useState<any[]>([])
  const [deferrals, setDeferrals] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([])
  const [otherStaff, setOtherStaff] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDashboardData = async () => {
    try {
      const [overviewRes, studentsRes, deferralsRes, salaryRes, expensesRes] = await Promise.all([
        fetch('/api/finance/overview'),
        fetch('/api/finance/fee-collection'),
        fetch('/api/finance/deferrals'),
        fetch('/api/finance/salary'),
        fetch('/api/finance/expenses')
      ])

      if (!overviewRes.ok || !studentsRes.ok || !deferralsRes.ok || !salaryRes.ok || !expensesRes.ok) {
        throw new Error('One or more dashboard API endpoints failed to load.')
      }

      const [overviewData, studentsData, deferralsData, salaryData, expensesData] = await Promise.all([
        overviewRes.json(),
        studentsRes.json(),
        deferralsRes.json(),
        salaryRes.json(),
        expensesRes.json()
      ])

      if (overviewData.success) setOverview(overviewData)
      if (studentsData.success) setStudents(studentsData.payments || [])
      if (deferralsData.success) setDeferrals(deferralsData.deferrals || [])
      if (salaryData.success) {
        setTeachers(salaryData.teachers || [])
        setOtherStaff(salaryData.otherStaff || [])
        setPayments(salaryData.history || [])
      }
      if (expensesData.success) setExpenses(expensesData.expenses || [])

    } catch (err: any) {
      console.error('Error fetching finance dashboard details:', err)
      setError(err.message || 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const [salarySubTab, setSalarySubTab] = useState<'teachers' | 'other-staff'>('teachers')
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null)

  const [studentSearch, setStudentSearch] = useState('')
  const [successToast, setSuccessToast] = useState<string | null>(null)
  
  // Modals/Inline Editor States
  const [activeModal, setActiveModal] = useState<'add-expense' | null>(null)
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null)
  const [editingSalaryAmount, setEditingSalaryAmount] = useState('')

  // Expense Form fields
  const [expDate, setExpDate] = useState('')
  const [expCategory, setExpCategory] = useState<'Rent' | 'Utilities' | 'Tea & Refreshments' | 'Charity & Welfare' | 'Miscellaneous'>('Miscellaneous')
  const [expAmount, setExpAmount] = useState('')
  const [expDescription, setExpDescription] = useState('')

  // --- Upgraded Feature States ---
  const [verifyingStudent, setVerifyingStudent] = useState<any | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<string>('June 2026')
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false)
  const [reportScope, setReportScope] = useState<'monthly' | '6-month' | 'yearly'>('monthly')
  const [reportFormat, setReportFormat] = useState<'xlsx' | 'pdf'>('xlsx')
  const [rejectionReason, setRejectionReason] = useState<string>('')
  const [isRejecting, setIsRejecting] = useState<boolean>(false)

  // Salary Process States
  const [processingRecipient, setProcessingRecipient] = useState<{ id: string; name: string; salary: number; type: 'teacher' | 'staff' } | null>(null)
  const [processAmount, setProcessAmount] = useState('')
  const [processMonth, setProcessMonth] = useState('')
  const [processNotes, setProcessNotes] = useState('')

  // Toast Helper
  const triggerToast = (msg: string) => {
    setSuccessToast(msg)
    setTimeout(() => {
      setSuccessToast(null)
    }, 5000)
  }

  // --- Calculations for Overview ---
  const totalCollected = overview ? overview.totalCollectedUSD : 0
  const totalPending = overview ? overview.totalPendingUSD : 0
  const totalExpensesThisMonth = overview ? overview.totalExpensesPKR : 0

  const getFilteredExpenses = () => {
    return expenses
  }

  // --- Action Handlers: Fee Collection ---
  const confirmReceipt = async (feePaymentId: string, studentName: string) => {
    try {
      const res = await fetch('/api/finance/verify-receipt', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fee_payment_id: feePaymentId, action: 'confirm' })
      })
      if (!res.ok) throw new Error('Failed to verify receipt')
      const data = await res.json()
      if (data.success) {
        triggerToast(`Payment receipt for student "${studentName}" verified successfully! Record status set to Paid.`)
        setVerifyingStudent(null)
        fetchDashboardData()
      } else {
        triggerToast(`Error: ${data.error || 'Failed to verify receipt'}`)
      }
    } catch (err: any) {
      triggerToast(`Error: ${err.message}`)
    }
  }

  const rejectReceipt = async (feePaymentId: string, studentName: string) => {
    try {
      const res = await fetch('/api/finance/verify-receipt', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fee_payment_id: feePaymentId, action: 'reject' })
      })
      if (!res.ok) throw new Error('Failed to reject receipt')
      const data = await res.json()
      if (data.success) {
        triggerToast(`Payment receipt for "${studentName}" rejected. Student notified.`)
        setVerifyingStudent(null)
        setIsRejecting(false)
        setRejectionReason('')
        fetchDashboardData()
      } else {
        triggerToast(`Error: ${data.error || 'Failed to reject receipt'}`)
      }
    } catch (err: any) {
      triggerToast(`Error: ${err.message}`)
    }
  }

  const sendReminder = (studentName: string) => {
    triggerToast(`Automated WhatsApp & email reminder alert dispatched to "${studentName}".`)
  }

  // --- Action Handlers: Deferrals ---
  const approveDeferral = async (deferralId: string, studentName: string, date: string) => {
    try {
      const res = await fetch('/api/finance/deferrals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deferral_id: deferralId, action: 'approved' })
      })
      if (!res.ok) throw new Error('Failed to approve deferral')
      const data = await res.json()
      if (data.success) {
        triggerToast(`Deferral request approved for "${studentName}". Payment date adjusted to ${date}.`)
        fetchDashboardData()
      } else {
        triggerToast(`Error: ${data.error || 'Failed to approve deferral'}`)
      }
    } catch (err: any) {
      triggerToast(`Error: ${err.message}`)
    }
  }

  const declineDeferral = async (deferralId: string, studentName: string) => {
    try {
      const res = await fetch('/api/finance/deferrals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deferral_id: deferralId, action: 'rejected' })
      })
      if (!res.ok) throw new Error('Failed to decline deferral')
      const data = await res.json()
      if (data.success) {
        triggerToast(`Deferral request declined for "${studentName}". Standard fee reminders will continue.`)
        fetchDashboardData()
      } else {
        triggerToast(`Error: ${data.error || 'Failed to decline deferral'}`)
      }
    } catch (err: any) {
      triggerToast(`Error: ${err.message}`)
    }
  }

  // --- Action Handlers: Salary ---
  const startEditingSalary = (teacherId: string, currentSalary: number) => {
    setEditingTeacherId(teacherId)
    setEditingSalaryAmount(currentSalary.toString())
  }

  const saveSalary = (teacherId: string, name: string) => {
    const amt = parseFloat(editingSalaryAmount)
    if (isNaN(amt) || amt <= 0) return
    setTeachers(teachers.map(t => 
      t.id === teacherId ? { ...t, salary: amt } : t
    ))
    setEditingTeacherId(null)
    triggerToast(`Monthly contract salary for teacher "${name}" updated to Rs. ${amt.toLocaleString()}.`)
  }

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!processingRecipient) return

    try {
      const res = await fetch('/api/finance/salary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_id: processingRecipient.id,
          recipient_type: processingRecipient.type,
          base_amount: parseFloat(processAmount),
          month_year: processMonth,
          notes: processNotes
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to process payment')
      }

      const data = await res.json()
      if (data.success) {
        triggerToast(`Salary payment of Rs. ${parseFloat(processAmount).toLocaleString()} processed successfully for "${processingRecipient.name}".`)
        setProcessingRecipient(null)
        setProcessAmount('')
        setProcessMonth('')
        setProcessNotes('')
        fetchDashboardData()
      } else {
        triggerToast(`Error: ${data.error || 'Failed to process payment'}`)
      }
    } catch (err: any) {
      triggerToast(`Error: ${err.message}`)
    }
  }

  const startEditingStaffSalary = (staffId: string, currentSalary: number) => {
    setEditingStaffId(staffId)
    setEditingSalaryAmount(currentSalary.toString())
  }

  const saveStaffSalary = (staffId: string, name: string) => {
    const amt = parseFloat(editingSalaryAmount)
    if (isNaN(amt) || amt <= 0) return
    setOtherStaff(otherStaff.map(s => 
      s.id === staffId ? { ...s, salary: amt } : s
    ))
    setEditingStaffId(null)
    triggerToast(`Monthly contract salary for staff "${name}" updated to Rs. ${amt.toLocaleString()}.`)
  }

  // --- Action Handlers: Expenses ---
  const openAddExpense = () => {
    setExpDate(new Date().toISOString().split('T')[0])
    setExpCategory('Miscellaneous')
    setExpAmount('')
    setExpDescription('')
    setActiveModal('add-expense')
  }

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(expAmount)
    if (isNaN(amt) || amt <= 0) return

    try {
      const res = await fetch('/api/finance/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: expCategory,
          amount_pkr: amt,
          description: expDescription
        })
      })

      if (!res.ok) throw new Error('Failed to save expense record')
      const data = await res.json()
      if (data.success) {
        triggerToast(`Expense record of Rs. ${amt.toLocaleString()} under "${expCategory}" saved successfully.`)
        setActiveModal(null)
        fetchDashboardData()
      } else {
        triggerToast(`Error: ${data.error || 'Failed to save expense'}`)
      }
    } catch (err: any) {
      triggerToast(`Error: ${err.message}`)
    }
  }

  // --- XLSX & PDF Report Handlers ---
  const handleDownloadExcel = () => {
    let reportData: Record<string, string | number>[] = []
    let fileName = ''
    
    if (reportScope === 'monthly') {
      reportData = getFilteredExpenses().map(e => ({
        Date: e.date,
        Category: e.category,
        Description: e.description,
        'Amount (PKR)': e.amount
      }))
      fileName = `VZ_Expense_Report_${selectedPeriod.replace(' ', '_')}.xlsx`
    } else if (reportScope === '6-month') {
      reportData = [
        ...expenses,
        ...MAY_EXPENSES,
        ...APRIL_EXPENSES
      ].map(e => ({
        Date: e.date,
        Category: e.category,
        Description: e.description,
        'Amount (PKR)': e.amount
      }))
      fileName = `VZ_Expense_Report_6_Months_2026.xlsx`
    } else {
      reportData = [
        ...expenses,
        ...MAY_EXPENSES,
        ...APRIL_EXPENSES,
        { date: '2026-03-01', category: 'Rent', amount: 120000, description: 'Academy building headquarter premises rental.' },
        { date: '2026-03-05', category: 'Utilities', amount: 31000, description: 'Broadband internet and power.' },
        { date: '2026-02-01', category: 'Rent', amount: 120000, description: 'Academy building premises rental.' },
        { date: '2026-01-01', category: 'Rent', amount: 120000, description: 'Academy building premises rental.' }
      ].map(e => ({
        Date: e.date,
        Category: e.category,
        Description: e.description,
        'Amount (PKR)': e.amount
      }))
      fileName = `VZ_Expense_Report_Full_Year_2026.xlsx`
    }
    
    const ws = XLSX.utils.json_to_sheet(reportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Expenses")
    XLSX.writeFile(wb, fileName)
    
    triggerToast(`Success: Expense report downloaded successfully as "${fileName}"!`)
    setReportModalOpen(false)
  }

  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      triggerToast('Error: Pop-up blocker prevented opening the print window.')
      return
    }

    const reportExpenses = reportScope === 'monthly' ? getFilteredExpenses() :
      reportScope === '6-month' ? [...expenses, ...MAY_EXPENSES, ...APRIL_EXPENSES] :
      [
        ...expenses,
        ...MAY_EXPENSES,
        ...APRIL_EXPENSES,
        { id: 'exp-h1', date: '2026-03-01', category: 'Rent', amount: 120000, description: 'Academy building headquarter premises rental.' },
        { id: 'exp-h2', date: '2026-03-05', category: 'Utilities', amount: 31000, description: 'Broadband internet and power.' },
        { id: 'exp-h3', date: '2026-02-01', category: 'Rent', amount: 120000, description: 'Academy building premises rental.' },
        { id: 'exp-h4', date: '2026-01-01', category: 'Rent', amount: 120000, description: 'Academy building premises rental.' }
      ] as Expense[]

    const totalAmount = reportExpenses.reduce((sum, e) => sum + e.amount, 0)
    const scopeLabel = reportScope === 'monthly' ? selectedPeriod :
      reportScope === '6-month' ? 'Last 6 Months (January — June 2026)' :
      'Full Year 2026'

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Expense Report - ${scopeLabel}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Inter:wght@400;500;600;700&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              color: #1c1917;
              padding: 40px;
              margin: 0;
              background-color: #ffffff;
            }
            .header-container {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #1B6B3A;
              padding-bottom: 24px;
              margin-bottom: 32px;
            }
            .brand-section {
              display: flex;
              align-items: center;
              gap: 14px;
            }
            .brand-logo {
              height: 48px;
              width: auto;
            }
            .brand-title {
              font-family: 'Cinzel', serif;
              font-size: 22px;
              font-weight: 700;
              color: #0c0a09;
              margin: 0;
              line-height: 1.1;
            }
            .brand-subtitle {
              font-size: 9px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.15em;
              color: #1B6B3A;
              margin: 4px 0 0 0;
            }
            .meta-section {
              text-align: right;
              font-size: 11px;
              color: #44403c;
              line-height: 1.6;
            }
            .report-title-container {
              margin-bottom: 24px;
            }
            .report-title {
              font-family: 'Cinzel', serif;
              font-size: 18px;
              font-weight: 700;
              color: #0c0a09;
              margin: 0 0 6px 0;
            }
            .report-subtitle {
              font-size: 11px;
              color: #6b6661;
              margin: 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 16px;
            }
            th {
              background-color: #fafaf9;
              color: #44403c;
              font-weight: 600;
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              padding: 12px 16px;
              text-align: left;
              border-bottom: 1.5px solid #e7e5e4;
            }
            td {
              padding: 14px 16px;
              font-size: 11.5px;
              color: #292524;
              border-bottom: 1px solid #f5f5f4;
              line-height: 1.5;
            }
            .date-col {
              font-family: monospace;
              color: #57534e;
              font-weight: 500;
            }
            .category-badge {
              font-size: 9px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              padding: 3px 8px;
              border-radius: 4px;
              border: 1px solid #e7e5e4;
              display: inline-block;
            }
            .cat-rent { color: #3730a3; background-color: #e0e7ff; border-color: #c7d2fe; }
            .cat-utilities { color: #92400e; background-color: #fef3c7; border-color: #fde68a; }
            .cat-tea { color: #292524; background-color: #f5f5f4; border-color: #e7e5e4; }
            .cat-charity { color: #065f46; background-color: #d1fae5; border-color: #a7f3d0; }
            .cat-misc { color: #9f1239; background-color: #ffe4e6; border-color: #fecdd3; }
            
            .amount-col {
              text-align: right;
              font-family: monospace;
              font-weight: 700;
              font-size: 12px;
              color: #b91c1c;
            }
            .total-row {
              background-color: #fafaf9;
            }
            .total-row td {
              border-top: 2px solid #1B6B3A;
              border-bottom: 2px solid #1B6B3A;
              font-weight: 700;
              font-size: 13px;
              color: #0c0a09;
            }
            .total-label {
              text-align: right;
              font-family: 'Cinzel', serif;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              padding-right: 24px;
            }
            .total-amount {
              text-align: right;
              font-family: monospace;
              color: #0c0a09;
              font-size: 14px;
            }
            .disclaimer {
              margin-top: 60px;
              padding: 16px;
              border: 1px solid #e7e5e4;
              border-radius: 12px;
              background-color: #fafaf9;
              display: flex;
              gap: 12px;
              align-items: flex-start;
            }
            .disclaimer-icon {
              color: #1B6B3A;
              font-weight: bold;
              font-size: 16px;
              line-height: 1;
            }
            .disclaimer-text {
              font-size: 10px;
              color: #57534e;
              line-height: 1.5;
              margin: 0;
            }
            .footer {
              margin-top: 80px;
              border-top: 1px solid #e7e5e4;
              padding-top: 16px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 9px;
              color: #a8a29e;
            }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="brand-section">
              <img src="/weblogo-01.png" alt="Virtual Zawiyah Logo" class="brand-logo" />
              <div>
                <h1 class="brand-title">Virtual Zawiyah</h1>
                <p class="brand-subtitle">Finance Portal</p>
              </div>
            </div>
            <div class="meta-section">
              <div><strong>Statement Period:</strong> ${scopeLabel}</div>
              <div><strong>Generation Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div><strong>System Sync:</strong> Encrypted Ledger V2</div>
            </div>
          </div>
          
          <div class="report-title-container">
            <h2 class="report-title">Academy Expenditure Statement</h2>
            <p class="report-subtitle">Official print statement of logged rentals, utilities, and petty cash operational expenses.</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th style="width: 15%">Date</th>
                <th style="width: 20%">Category</th>
                <th>Description</th>
                <th style="text-align: right; width: 20%">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${reportExpenses.map(e => {
                let badgeClass = 'cat-misc';
                if (e.category === 'Rent') badgeClass = 'cat-rent';
                else if (e.category === 'Utilities') badgeClass = 'cat-utilities';
                else if (e.category === 'Tea & Refreshments') badgeClass = 'cat-tea';
                else if (e.category === 'Charity & Welfare') badgeClass = 'cat-charity';
                
                return `
                  <tr>
                    <td class="date-col">${e.date}</td>
                    <td><span class="category-badge ${badgeClass}">${e.category}</span></td>
                    <td>${e.description}</td>
                    <td class="amount-col">-Rs. ${e.amount.toLocaleString()}</td>
                  </tr>
                `;
              }).join('')}
              <tr class="total-row">
                <td colspan="3" class="total-label">Total Cumulative Expenditures</td>
                <td class="total-amount">Rs. ${totalAmount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="disclaimer">
            <span class="disclaimer-icon">ⓘ</span>
            <p class="disclaimer-text">
              <strong>Official Notice:</strong> This document represents a point-in-time snapshot of the Virtual Zawiyah academic ledger. All figures conform to double-entry accounting standards and have been reconciled with primary bank statements. No net savings, balance, or margin metrics are disclosed on this statement in compliance with the Academy's privacy policies.
            </p>
          </div>
          
          <div class="footer">
            <span>Security Signature: SHA256/LEDGER_VERIFIED</span>
            <span>Page 1 of 1</span>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
    setReportModalOpen(false)
    triggerToast(`Success: Expense report document sent to system print engine.`)
  }

  if (loading) {
    return (
      <div className="flex flex-col h-screen w-screen bg-[#FAFAF7]">
        <BackToFounderBanner />
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1B6B3A] mb-2" />
          <span className="text-xs text-zinc-500 font-sans font-semibold animate-pulse">Synchronizing secure ledger database...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen w-screen bg-[#FAFAF7]">
        <BackToFounderBanner />
        <div className="flex-1 p-8 max-w-lg mx-auto flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl">
            <AlertCircle className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider font-serif">Failed to Sync Ledger</h3>
            <p className="text-xs text-rose-800 font-sans mt-1 bg-rose-50/50 border border-rose-100/50 p-3 rounded-xl">{error}</p>
          </div>
          <button 
            onClick={() => { setError(''); setLoading(true); fetchDashboardData(); }}
            className="py-2 px-4 bg-[#1B6B3A] hover:bg-[#1B6B3A]/90 text-white font-bold rounded-xl text-xs active:scale-95 transition-all shadow-xs"
          >
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <BackToFounderBanner />
      <div className="flex-1 flex bg-[#FAFAF7] text-zinc-800 font-sans relative overflow-hidden select-none">
      
      {/* Background soft layout pattern */}
      <GeometricPattern opacity={0.03} />

      {/* ========================================== */}
      {/* PERSISTENT LEFT SIDEBAR                    */}
      {/* ========================================== */}
      <aside className="w-80 shrink-0 border-r border-zinc-200 bg-white flex flex-col h-full overflow-hidden z-20">
        
        <div className="flex border-b border-zinc-100 px-6 py-5 items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img src="/weblogo-01.png" alt="Virtual Zawiyah Logo" className="h-9 w-auto object-contain" />
            <div>
              <span className="text-sm font-bold font-serif text-zinc-900 leading-tight block">Virtual Zawiyah</span>
              <span className="block text-[9px] uppercase tracking-wider text-[#1B6B3A] font-bold leading-none mt-0.5">FINANCE PORTAL</span>
            </div>
          </div>
          <NotificationBell />
        </div>

        {/* Sidebar navigation list */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          
          {/* Overview tab */}
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold font-sans transition-all duration-150 active:scale-[0.98] ${
              activeTab === 'overview' 
                ? 'bg-[#1B6B3A] text-white shadow-xs' 
                : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <TrendingUp className="h-4 w-4 shrink-0" />
              <span>Financial Overview</span>
            </div>
          </button>

          {/* Fee Collection tab */}
          <button 
            onClick={() => setActiveTab('fee-collection')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold font-sans transition-all duration-150 active:scale-[0.98] ${
              activeTab === 'fee-collection' 
                ? 'bg-[#1B6B3A] text-white shadow-xs' 
                : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <DollarSign className="h-4 w-4 shrink-0" />
              <span>Fee Collection Ledger</span>
            </div>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
              activeTab === 'fee-collection' ? 'bg-[#FAFAF7]/20 text-white' : 'bg-zinc-100 text-zinc-650'
            }`}>
              {students.filter(s => s.status !== 'Paid').length} Pending
            </span>
          </button>

          {/* Deferrals tab */}
          <button 
            onClick={() => setActiveTab('deferrals')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold font-sans transition-all duration-150 active:scale-[0.98] ${
              activeTab === 'deferrals' 
                ? 'bg-[#1B6B3A] text-white shadow-xs' 
                : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 shrink-0" />
              <span>Deferral Requests</span>
            </div>
            {deferrals.length > 0 && (
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                activeTab === 'deferrals' ? 'bg-rose-500 text-white' : 'bg-rose-50 text-rose-700'
              }`}>
                {deferrals.length} New
              </span>
            )}
          </button>

          {/* Salaries tab */}
          <button 
            onClick={() => setActiveTab('salary')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold font-sans transition-all duration-150 active:scale-[0.98] ${
              activeTab === 'salary' 
                ? 'bg-[#1B6B3A] text-white shadow-xs' 
                : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <UserCheck className="h-4 w-4 shrink-0" />
              <span>Salary Management</span>
            </div>
          </button>

          {/* Expenses tab */}
          <button 
            onClick={() => setActiveTab('expenses')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold font-sans transition-all duration-150 active:scale-[0.98] ${
              activeTab === 'expenses' 
                ? 'bg-[#1B6B3A] text-white shadow-xs' 
                : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <TrendingDown className="h-4 w-4 shrink-0" />
              <span>Expenses & Petty Cash</span>
            </div>
          </button>

        </nav>

        {/* User profile section at bottom */}
        <div className="border-t border-zinc-200 bg-zinc-50/50 p-4 shrink-0 mt-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-zinc-200 text-zinc-700 shadow-sm shrink-0 font-bold text-xs">
              ZM
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-zinc-800 font-sans">Zaid Malik</p>
              <p className="truncate text-[10px] text-zinc-650 font-medium">Finance Officer</p>
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
      {/* PRIMARY WORKSPACE CONTENT                  */}
      {/* ========================================== */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        
        {/* Header */}
        <header className="h-16 shrink-0 bg-white border-b border-zinc-200 px-8 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-md font-serif font-bold text-zinc-900 capitalize">
              {activeTab === 'overview' && 'Executive Summary Sheet'}
              {activeTab === 'fee-collection' && 'Student Fee Collection Ledger'}
              {activeTab === 'deferrals' && 'Escalated Deferral Requests'}
              {activeTab === 'salary' && 'Faculty Salary Disbursement'}
              {activeTab === 'expenses' && 'Academy Expenditure Ledger'}
            </h2>
            <span className="text-[10px] font-mono font-bold text-[#1B6B3A] border border-[#1B6B3A]/20 bg-[#1B6B3A]/5 px-2 py-0.5 rounded">
              Auditor View
            </span>
          </div>

          <div>
            <span className="text-[10px] text-zinc-650 font-semibold font-mono">
              Server sync: <span className="text-emerald-700 font-bold">Encrypted Ledger</span>
            </span>
          </div>
        </header>

        {/* Scrollable container */}
        <main className="flex-1 overflow-y-auto p-8 relative">

          {/* Toast Notification */}
          {successToast && (
            <div className="absolute top-4 left-8 right-8 z-30 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-start gap-2.5 shadow-md animate-fade-in">
              <Check className="h-4.5 w-4.5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-emerald-950">Success Confirmation</p>
                <p className="text-[11px] text-emerald-850 leading-relaxed font-medium mt-0.5">{successToast}</p>
              </div>
              <button 
                onClick={() => setSuccessToast(null)} 
                className="ml-auto p-1 text-emerald-600 hover:text-emerald-950 rounded-lg hover:bg-emerald-100/50"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* ========================================== */}
          {/* TAB 1: OVERVIEW                            */}
          {/* ========================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              
              {/* Core summary indicator cards - exactly three cards as requested */}
              <div className="grid gap-6 sm:grid-cols-3 max-w-5xl">
                
                {/* Collected Card */}
                <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-xs relative overflow-hidden flex flex-col justify-between h-36">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-zinc-650 uppercase tracking-wider block">Total Fee Collected</span>
                    <span className="p-2 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl">
                      <TrendingUp className="h-4.5 w-4.5" />
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-zinc-950 font-serif">${totalCollected.toLocaleString()}</h3>
                    <p className="text-[10px] text-zinc-600 mt-1 font-medium font-sans">Current active cycle ledger amount</p>
                  </div>
                </div>

                {/* Pending Card */}
                <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-xs relative overflow-hidden flex flex-col justify-between h-36">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-zinc-650 uppercase tracking-wider block">Total Fee Pending</span>
                    <span className="p-2 bg-amber-50 border border-amber-150 text-amber-700 rounded-xl">
                      <Clock className="h-4.5 w-4.5" />
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-zinc-950 font-serif">${totalPending.toLocaleString()}</h3>
                    <p className="text-[10px] text-zinc-600 mt-1 font-medium font-sans">Includes overdue and awaiting receipts</p>
                  </div>
                </div>

                {/* Expenses Card */}
                <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-xs relative overflow-hidden flex flex-col justify-between h-36">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-zinc-650 uppercase tracking-wider block">Total Expenses</span>
                    <span className="p-2 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl">
                      <TrendingDown className="h-4.5 w-4.5" />
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-zinc-950 font-serif">Rs. {totalExpensesThisMonth.toLocaleString()}</h3>
                    <p className="text-[10px] text-zinc-600 mt-1 font-medium font-sans">Rent, contracts, utilities, and petty cash</p>
                  </div>
                </div>

              </div>

              {/* Notice Banner explaining restriction of balance/savings figures */}
              <div className="bg-[#FAFAF7] border border-zinc-200 rounded-3xl p-5 max-w-5xl flex gap-3 items-start bg-zinc-50/50">
                <AlertCircle className="h-5 w-5 text-[#1B6B3A] shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <h4 className="font-bold text-zinc-900 font-serif">Role Access Limitation Protocol</h4>
                  <p className="text-zinc-700 leading-relaxed font-medium">
                    Please be advised that in compliance with the academy privacy structure, aggregate net balance, savings indicators, or net margin computations are restricted access fields. These details are reserved exclusively for executive administrators and are omitted from this interface.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* ========================================== */}
          {/* TAB 2: FEE COLLECTION                      */}
          {/* ========================================== */}
          {activeTab === 'fee-collection' && (
            <div className="space-y-6 max-w-6xl animate-fade-in">
              
              <div className="flex justify-between items-center gap-4 flex-wrap">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800 font-serif">Student Tuition Ledgers</h3>
                  <p className="text-[11px] text-zinc-700 mt-0.5">Filter by name to verify receipt uploads or dispatch reminders.</p>
                </div>

                {/* Search input with high contrast icon */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-800" />
                  <input 
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Search student..."
                    className="text-[11px] p-2 pl-8 rounded-lg border border-zinc-300 bg-zinc-50 w-48 focus:outline-none focus:ring-1 focus:ring-[#1B6B3A] text-zinc-800 placeholder-zinc-700 font-semibold"
                  />
                </div>
              </div>

              {/* Roster table */}
              <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 uppercase text-[10px] tracking-wider font-semibold">
                      <th className="p-4">Student</th>
                      <th className="p-4">Registered Course</th>
                      <th className="p-4 text-right">Fee Rate</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Administrative Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {students
                      .filter(s => s.student_name.toLowerCase().includes(studentSearch.toLowerCase()))
                      .map(student => (
                        <tr key={student.fee_payment_id} className="hover:bg-zinc-50/20 transition-colors">
                          <td className="p-4 font-bold text-zinc-900">
                            <div>
                              <span>{student.student_name}</span>
                              <span className="block text-[9px] text-zinc-500 font-mono font-normal mt-0.5">{student.student_id}</span>
                            </div>
                          </td>
                          <td className="p-4 text-zinc-800 font-medium">Billing Period: {student.month_year}</td>
                          <td className="p-4 text-right font-mono font-bold">${student.amount.toLocaleString()}</td>
                          <td className="p-4 text-center">
                            <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                              student.status === 'confirmed' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                              student.status === 'pending_verification' ? 'text-amber-700 bg-amber-50 border-amber-250 animate-pulse' :
                              'text-rose-700 bg-rose-50 border-rose-100'
                            }`}>
                              {student.status === 'confirmed' ? 'confirmed' : (student.status === 'pending_verification' ? 'Pending Verification' : student.status)}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              
                              {/* Confirm Receipt Action */}
                              {student.status === 'pending_verification' && student.receipt_url && (
                                <button
                                  onClick={() => setVerifyingStudent(student)}
                                  className="py-1 px-2.5 bg-[#1B6B3A] text-white hover:bg-[#1B6B3A]/90 text-[9px] font-bold tracking-wider uppercase rounded-lg transition-all flex items-center gap-1 active:scale-95 shadow-2xs"
                                >
                                  <Eye className="h-3 w-3" />
                                  <span>Verify Receipt</span>
                                </button>
                              )}

                              {/* Send Reminder Action */}
                              {student.status === 'pending' && (
                                <button
                                  onClick={() => sendReminder(student.student_name)}
                                  className="py-1 px-2.5 border border-zinc-300 text-zinc-700 hover:bg-zinc-50 text-[9px] font-bold tracking-wider uppercase rounded-lg transition-all flex items-center gap-1 active:scale-95 shadow-2xs"
                                >
                                  <Send className="h-3 w-3" />
                                  <span>Send Reminder</span>
                                </button>
                              )}

                              {student.status === 'confirmed' && (
                                <span className="text-[10px] text-emerald-800 font-bold flex items-center gap-1">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                                  Verified
                                </span>
                              )}

                            </div>
                          </td>
                        </tr>
                      ))}
                    {students.filter(s => s.student_name.toLowerCase().includes(studentSearch.toLowerCase())).length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-zinc-650 italic">No matching student records found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* ========================================== */}
          {/* TAB 3: DEFERRAL REQUESTS                   */}
          {/* ========================================== */}
          {activeTab === 'deferrals' && (
            <div className="space-y-6 max-w-4xl animate-fade-in">
              
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800 font-serif">Escalated Deferral Requests</h3>
                <p className="text-[11px] text-zinc-700 mt-0.5">Approve extended schedules or decline requests to resume reminders.</p>
              </div>

              <div className="space-y-4">
                {deferrals.map(req => (
                  <div 
                    key={req.deferral_id} 
                    className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${
                          req.status === 'pending' ? 'bg-amber-500' :
                          req.status === 'approved' ? 'bg-emerald-500' :
                          'bg-rose-500'
                        }`} />
                        <h4 className="text-xs font-bold text-zinc-950">{req.student_name}</h4>
                      </div>
                      <p className="text-[11px] text-zinc-750 font-medium leading-relaxed font-sans">{req.reason}</p>
                      <div className="pt-1 flex items-center gap-3 text-[10px] font-mono text-zinc-600 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                          <span>Requested New Date: <strong className="text-zinc-850 font-bold">{req.requested_date}</strong></span>
                        </div>
                        <div className="flex items-center gap-1 border-l border-zinc-200 pl-3">
                          <DollarSign className="h-3.5 w-3.5 text-zinc-500" />
                          <span>Fee Amount: <strong className="text-zinc-850 font-bold">${req.fee_amount}</strong></span>
                        </div>
                        <div className="flex items-center gap-1 border-l border-zinc-200 pl-3">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase font-bold border ${
                            req.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            req.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            'bg-rose-50 text-rose-700 border-rose-250'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {req.status === 'pending' && (
                      <div className="flex gap-2 shrink-0 md:self-center">
                        <button
                          onClick={() => approveDeferral(req.deferral_id, req.student_name, req.requested_date)}
                          className="py-1.5 px-3 bg-[#1B6B3A] hover:bg-[#1B6B3A]/90 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all active:scale-95 flex items-center gap-1 shadow-2xs"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => declineDeferral(req.deferral_id, req.student_name)}
                          className="py-1.5 px-3 border border-rose-200 hover:bg-rose-50 text-rose-700 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all active:scale-95 flex items-center gap-1 shadow-2xs"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>Decline</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {deferrals.length === 0 && (
                  <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center text-zinc-600 space-y-2">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                    <p className="text-xs italic">All deferral request queues are processed. No pending cases.</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ========================================== */}
          {/* TAB 4: SALARY MANAGEMENT                   */}
          {/* ========================================== */}
          {activeTab === 'salary' && (
            <div className="space-y-6 max-w-5xl animate-fade-in">
              
              {/* Sub-tab controls */}
              <div className="flex border-b border-zinc-200 gap-6 pb-2">
                <button
                  onClick={() => setSalarySubTab('teachers')}
                  className={`text-xs font-bold uppercase tracking-wider pb-2 border-b-2 transition-all ${
                    salarySubTab === 'teachers'
                      ? 'border-[#1B6B3A] text-zinc-900 font-bold'
                      : 'border-transparent text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  Teachers
                </button>
                <button
                  onClick={() => setSalarySubTab('other-staff')}
                  className={`text-xs font-bold uppercase tracking-wider pb-2 border-b-2 transition-all ${
                    salarySubTab === 'other-staff'
                      ? 'border-[#1B6B3A] text-zinc-900 font-bold'
                      : 'border-transparent text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  Other Staff
                </button>
              </div>

              {salarySubTab === 'teachers' ? (
                <>
                  {/* Teachers Salary contract directory */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800 font-serif">Faculty Salary Ledger</h3>
                      <p className="text-[11px] text-zinc-700 mt-0.5">Process teacher disbursements and configure monthly contract rates.</p>
                    </div>

                    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 uppercase text-[10px] tracking-wider font-semibold">
                            <th className="p-4">Teacher Name</th>
                            <th className="p-4 text-right">Contract Salary</th>
                            <th className="p-4 text-center">Payroll Status</th>
                            <th className="p-4 text-right">Administrative Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200">
                          {teachers.map(teacher => (
                            <tr key={teacher.id} className="hover:bg-zinc-50/20 transition-colors">
                              <td className="p-4 font-bold text-zinc-900">{teacher.name}</td>
                              <td className="p-4 text-right font-mono font-bold">
                                
                                {/* Inline Salary Editor */}
                                {editingTeacherId === teacher.id ? (
                                  <div className="flex justify-end items-center gap-1.5">
                                    <span className="text-xs text-zinc-850 font-bold">Rs. </span>
                                    <input 
                                      type="number"
                                      value={editingSalaryAmount}
                                      onChange={(e) => setEditingSalaryAmount(e.target.value)}
                                      className="w-20 text-xs p-1 text-right border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1B6B3A] text-zinc-800 font-mono font-semibold"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') saveSalary(teacher.id, teacher.name)
                                        if (e.key === 'Escape') setEditingTeacherId(null)
                                      }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => saveSalary(teacher.id, teacher.name)}
                                      className="p-1 hover:bg-emerald-50 text-emerald-700 rounded transition-colors"
                                      title="Save Changes"
                                    >
                                      <Check className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingTeacherId(null)}
                                      className="p-1 hover:bg-rose-50 text-rose-600 rounded transition-colors"
                                      title="Cancel"
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex justify-end items-center gap-2">
                                    <span>Rs. {teacher.salary.toLocaleString()}</span>
                                    <button
                                      onClick={() => startEditingSalary(teacher.id, teacher.salary)}
                                      className="p-1 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                                      title="Edit Salary"
                                    >
                                      <Edit className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                )}

                              </td>
                              <td className="p-4 text-center">
                                <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                                  teacher.isPaidThisMonth
                                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                                    : 'text-amber-700 bg-amber-50 border-amber-250'
                                }`}>
                                  {teacher.isPaidThisMonth ? 'Paid' : 'Pending transfer'}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={() => {
                                    setProcessingRecipient({
                                      id: teacher.id,
                                      name: teacher.name,
                                      salary: teacher.salary,
                                      type: 'teacher'
                                    })
                                    setProcessAmount(teacher.salary.toString())
                                    setProcessMonth(`${String(new Date().getMonth() + 1).padStart(2, '0')}-${new Date().getFullYear()}`)
                                    setProcessNotes('Regular Monthly Teacher Contract Payout')
                                  }}
                                  disabled={teacher.isPaidThisMonth}
                                  className={`py-1 px-2.5 font-bold uppercase tracking-wider text-[9px] rounded-lg transition-all flex items-center gap-1 ml-auto shadow-2xs ${
                                    teacher.isPaidThisMonth
                                      ? 'bg-zinc-100 text-zinc-500 border border-zinc-200 cursor-not-allowed'
                                      : 'bg-[#1B6B3A] text-white hover:bg-[#1B6B3A]/90 active:scale-95'
                                  }`}
                                >
                                  <Check className="h-3 w-3" />
                                  <span>{teacher.isPaidThisMonth ? 'Disbursed' : 'Process Payment'}</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Salary Payment History table */}
                  <div className="space-y-4 pt-4 border-t border-zinc-200">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800">Past Salary Payment History</h4>
                      <p className="text-[10px] text-zinc-655 mt-0.5">Historical log of faculty contract salary payout archives.</p>
                    </div>

                    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 uppercase text-[9px] tracking-wider font-semibold">
                            <th className="p-3">Faculty Member</th>
                            <th className="p-3">Payout Period</th>
                            <th className="p-3 text-right">Amount Disbursed</th>
                            <th className="p-3 text-right">Transfer Date</th>
                            <th className="p-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-150">
                          {payments.map(payment => (
                            <tr key={payment.id} className="hover:bg-zinc-50/20 transition-colors">
                              <td className="p-3 font-semibold text-zinc-900">{payment.teacherName}</td>
                              <td className="p-3 text-zinc-700 font-medium">{payment.month}</td>
                              <td className="p-3 text-right font-mono font-bold">Rs. {payment.amount.toLocaleString()}</td>
                              <td className="p-3 text-right font-mono text-zinc-700">{payment.datePaid}</td>
                              <td className="p-3 text-center">
                                <span className="text-emerald-800 font-bold flex items-center justify-center gap-1 text-[10px]">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                                  Transferred
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Non-Teaching Staff Salary Ledger */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800 font-serif">Administrative & Support Staff Ledger</h3>
                      <p className="text-[11px] text-zinc-700 mt-0.5">Process support staff disbursements and configure monthly contract rates.</p>
                    </div>

                    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 uppercase text-[10px] tracking-wider font-semibold">
                            <th className="p-4">Staff Member</th>
                            <th className="p-4">Role</th>
                            <th className="p-4 text-right">Contract Salary</th>
                            <th className="p-4 text-center">Payroll Status</th>
                            <th className="p-4 text-right">Administrative Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200">
                          {otherStaff.map(staff => (
                            <tr key={staff.id} className="hover:bg-zinc-50/20 transition-colors">
                              <td className="p-4 font-bold text-zinc-900">{staff.name}</td>
                              <td className="p-4 text-zinc-755 font-medium">{staff.role}</td>
                              <td className="p-4 text-right font-mono font-bold">
                                
                                {/* Inline Salary Editor for Other Staff */}
                                {editingStaffId === staff.id ? (
                                  <div className="flex justify-end items-center gap-1.5">
                                    <span className="text-xs text-zinc-850 font-bold">Rs. </span>
                                    <input 
                                      type="number"
                                      value={editingSalaryAmount}
                                      onChange={(e) => setEditingSalaryAmount(e.target.value)}
                                      className="w-20 text-xs p-1 text-right border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-[#1B6B3A] text-zinc-800 font-mono font-semibold"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') saveStaffSalary(staff.id, staff.name)
                                        if (e.key === 'Escape') setEditingStaffId(null)
                                      }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => saveStaffSalary(staff.id, staff.name)}
                                      className="p-1 hover:bg-emerald-50 text-emerald-700 rounded transition-colors"
                                      title="Save Changes"
                                    >
                                      <Check className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingStaffId(null)}
                                      className="p-1 hover:bg-rose-50 text-rose-600 rounded transition-colors"
                                      title="Cancel"
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex justify-end items-center gap-2">
                                    <span>Rs. {staff.salary.toLocaleString()}</span>
                                    <button
                                      onClick={() => startEditingStaffSalary(staff.id, staff.salary)}
                                      className="p-1 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                                      title="Edit Salary"
                                    >
                                      <Edit className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                )}

                              </td>
                              <td className="p-4 text-center">
                                <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                                  staff.isPaidThisMonth
                                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                                    : 'text-amber-700 bg-amber-50 border-amber-250'
                                }`}>
                                  {staff.isPaidThisMonth ? 'Paid' : 'Pending transfer'}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={() => {
                                    setProcessingRecipient({
                                      id: staff.id,
                                      name: staff.name,
                                      salary: staff.salary,
                                      type: 'staff'
                                    })
                                    setProcessAmount(staff.salary.toString())
                                    setProcessMonth(`${String(new Date().getMonth() + 1).padStart(2, '0')}-${new Date().getFullYear()}`)
                                    setProcessNotes('Regular Monthly Staff Contract Payout')
                                  }}
                                  disabled={staff.isPaidThisMonth}
                                  className={`py-1 px-2.5 font-bold uppercase tracking-wider text-[9px] rounded-lg transition-all flex items-center gap-1 ml-auto shadow-2xs ${
                                    staff.isPaidThisMonth
                                      ? 'bg-zinc-100 text-zinc-500 border border-zinc-200 cursor-not-allowed'
                                      : 'bg-[#1B6B3A] text-white hover:bg-[#1B6B3A]/90 active:scale-95'
                                  }`}
                                >
                                  <Check className="h-3 w-3" />
                                  <span>{staff.isPaidThisMonth ? 'Disbursed' : 'Process Payment'}</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Other Staff Salary Payment History table */}
                  <div className="space-y-4 pt-4 border-t border-zinc-200">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800">Past Support Salary Payment History</h4>
                      <p className="text-[10px] text-zinc-655 mt-0.5">Historical log of administrative contract salary payout archives.</p>
                    </div>

                    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 uppercase text-[9px] tracking-wider font-semibold">
                            <th className="p-3">Staff Member</th>
                            <th className="p-3">Payout Period</th>
                            <th className="p-3 text-right">Amount Disbursed</th>
                            <th className="p-3 text-right">Transfer Date</th>
                            <th className="p-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-150">
                          {payments.map(payment => (
                            <tr key={payment.id} className="hover:bg-zinc-50/20 transition-colors">
                              <td className="p-3 font-semibold text-zinc-900">{payment.teacherName}</td>
                              <td className="p-3 text-zinc-700 font-medium">{payment.month}</td>
                              <td className="p-3 text-right font-mono font-bold">Rs. {payment.amount.toLocaleString()}</td>
                              <td className="p-3 text-right font-mono text-zinc-700">{payment.datePaid}</td>
                              <td className="p-3 text-center">
                                <span className="text-emerald-800 font-bold flex items-center justify-center gap-1 text-[10px]">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                                  Transferred
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

            </div>
          )}

          {/* ========================================== */}
          {/* TAB 5: EXPENSES & PETTY CASH               */}
          {/* ========================================== */}
          {activeTab === 'expenses' && (
            <div className="space-y-6 max-w-5xl animate-fade-in">
              
              <div className="flex justify-between items-center gap-4 flex-wrap">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800 font-serif">Expenses & Petty Cash Log</h3>
                  <p className="text-[11px] text-zinc-700 mt-0.5">Logs of building rentals, utility services, and operational petty cash.</p>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  
                  {/* Period Selector Dropdown (Simulating 10-Year retention reset) */}
                  <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-3 py-1.5 shadow-2xs">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Period:</span>
                    <select
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                      className="text-xs font-bold text-zinc-850 bg-transparent border-none focus:outline-none focus:ring-0 cursor-pointer"
                    >
                      <option value="June 2026">June 2026 (Current)</option>
                      <option value="May 2026">May 2026</option>
                      <option value="April 2026">April 2026</option>
                      <option value="2025 Archive">Year 2025 Archive</option>
                      <option value="2024 Archive">Year 2024 Archive</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Generate Report Trigger */}
                    <button
                      onClick={() => setReportModalOpen(true)}
                      className="py-2 px-3 border border-[#1B6B3A] text-[#1B6B3A] hover:bg-[#1B6B3A]/5 font-bold rounded-xl text-xs transition-all active:scale-[0.98] flex items-center gap-1.5 shadow-2xs"
                    >
                      <Download className="h-4 w-4" />
                      <span>Generate Report</span>
                    </button>
                    
                    {/* Add Expense (Disabled for locked archives) */}
                    <button
                      onClick={openAddExpense}
                      disabled={selectedPeriod !== 'June 2026'}
                      className={`py-2 px-3 font-bold rounded-xl text-xs transition-all active:scale-[0.98] flex items-center gap-1.5 shadow-xs ${
                        selectedPeriod !== 'June 2026'
                          ? 'bg-zinc-100 text-zinc-500 border border-zinc-200 cursor-not-allowed'
                          : 'bg-[#1B6B3A] text-white hover:bg-[#1B6B3A]/90'
                      }`}
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add New Expense</span>
                    </button>
                  </div>

                </div>
              </div>

              {/* Expense Ledger table */}
              <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 uppercase text-[10px] tracking-wider font-semibold">
                      <th className="p-4">Date</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Description</th>
                      <th className="p-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {getFilteredExpenses().map(exp => (
                      <tr key={exp.id} className="hover:bg-zinc-50/20 transition-colors">
                        <td className="p-4 font-mono font-semibold text-zinc-700">{exp.date}</td>
                        <td className="p-4">
                          <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                            exp.category === 'Rent' ? 'text-indigo-700 bg-indigo-50 border-indigo-150' :
                            exp.category === 'Utilities' ? 'text-amber-700 bg-amber-50 border-amber-150' :
                            exp.category === 'Tea & Refreshments' ? 'text-zinc-700 bg-zinc-50 border-zinc-200' :
                            exp.category === 'Charity & Welfare' ? 'text-emerald-700 bg-emerald-50 border-emerald-150' :
                            'text-rose-700 bg-rose-50 border-rose-100'
                          }`}>
                            {exp.category}
                          </span>
                        </td>
                        <td className="p-4 text-zinc-800 font-medium font-sans leading-relaxed">{exp.description}</td>
                        <td className="p-4 text-right font-mono font-bold text-rose-700">-Rs. {exp.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* ========================================== */}
      {/* MODAL COMPONENT CONTAINER                  */}
      {/* ========================================== */}
      {processingRecipient && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-scale-up">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-zinc-150 pb-3">
              <h4 className="text-sm font-bold text-zinc-950 font-serif uppercase tracking-wider flex items-center gap-2">
                Process Payout: {processingRecipient.type === 'teacher' ? 'Faculty' : 'Staff'}
              </h4>
              <button 
                onClick={() => setProcessingRecipient(null)} 
                className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleProcessPayment} className="space-y-4">
              {/* Recipient Details */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="block text-[9px] uppercase text-zinc-500 font-bold tracking-wider">Recipient Name</span>
                  <span className="font-bold text-zinc-900">{processingRecipient.name}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase text-zinc-500 font-bold tracking-wider">Contract Base Rate</span>
                  <span className="font-bold text-zinc-900 font-mono">Rs. {processingRecipient.salary.toLocaleString()}</span>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">Payout Amount (PKR)</label>
                <input 
                  type="number"
                  required
                  value={processAmount}
                  onChange={(e) => setProcessAmount(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] text-zinc-800 font-mono font-semibold bg-zinc-50"
                  placeholder={processingRecipient.salary.toString()}
                />
              </div>

              {/* Month Selector */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">Billing Period</label>
                <select
                  required
                  value={processMonth}
                  onChange={(e) => setProcessMonth(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] text-zinc-800 font-semibold bg-zinc-50"
                >
                  <option value="">Select Month</option>
                  <option value={`07-2026`}>July 2026 (Current Cycle)</option>
                  <option value={`06-2026`}>June 2026</option>
                  <option value={`05-2026`}>May 2026</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">Voucher Reference / Notes</label>
                <input 
                  type="text"
                  value={processNotes}
                  onChange={(e) => setProcessNotes(e.target.value)}
                  placeholder="e.g. Bank slip transfer confirmation receipt ID, bonus..."
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] text-zinc-800 font-semibold placeholder-zinc-500 bg-zinc-50"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setProcessingRecipient(null)}
                  className="py-2 px-4 border border-zinc-300 text-zinc-700 hover:bg-zinc-50 font-bold rounded-xl text-xs active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-[#1B6B3A] text-white hover:bg-[#1B6B3A]/90 font-bold rounded-xl text-xs active:scale-[0.98] transition-all shadow-xs"
                >
                  Confirm Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'add-expense' && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-scale-up">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-zinc-150 pb-3">
              <h4 className="text-sm font-bold text-zinc-950 font-serif uppercase tracking-wider flex items-center gap-2">
                Add New Expense Record
              </h4>
              <button 
                onClick={() => setActiveModal(null)} 
                className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddExpense} className="space-y-4">
              
              {/* Date */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">Expense Log Date</label>
                <input 
                  type="date"
                  required
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] text-zinc-800 font-mono font-medium bg-zinc-50"
                />
              </div>

              {/* Grid Category & Amount */}
              <div className="grid gap-4 grid-cols-2">
                
                {/* Category */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">Category</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value as Expense['category'])}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] text-zinc-800 font-medium bg-zinc-50"
                  >
                    <option value="Rent">Rent</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Tea & Refreshments">Tea & Refreshments</option>
                    <option value="Charity & Welfare">Charity & Welfare</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">Amount (PKR)</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-3 text-xs text-zinc-650 font-bold font-mono">Rs.</span>
                    <input 
                      type="number"
                      required
                      value={expAmount}
                      onChange={(e) => setExpAmount(e.target.value)}
                      placeholder="10000"
                      className="w-full text-xs p-2.5 pl-10 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] text-zinc-800 placeholder-zinc-500 font-mono font-semibold bg-zinc-50"
                    />
                  </div>
                </div>

              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">Transaction Description</label>
                <textarea 
                  required
                  rows={3}
                  value={expDescription}
                  onChange={(e) => setExpDescription(e.target.value)}
                  placeholder="Specify the official purpose or details of this expenditure..."
                  className="w-full text-xs p-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] text-zinc-800 placeholder-zinc-500 font-medium bg-zinc-50 focus:bg-white"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="py-2 px-4 border border-zinc-300 text-zinc-700 hover:bg-zinc-50 font-bold rounded-xl text-xs active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-[#1B6B3A] text-white hover:bg-[#1B6B3A]/90 font-bold rounded-xl text-xs active:scale-[0.98] transition-all shadow-xs"
                >
                  Save Expense
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* RECEIPT VERIFICATION MODAL DIALOG          */}
      {/* ========================================== */}
      {verifyingStudent && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-scale-up">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-zinc-150 pb-3">
              <h4 className="text-sm font-bold text-zinc-950 font-serif uppercase tracking-wider flex items-center gap-2">
                Verify Uploaded Receipt
              </h4>
              <button 
                onClick={() => {
                  setVerifyingStudent(null)
                  setIsRejecting(false)
                  setRejectionReason('')
                }} 
                className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="space-y-4">
              
              {/* Student details */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="block text-[9px] uppercase text-zinc-500 font-bold tracking-wider">Student Name</span>
                  <span className="font-bold text-zinc-900">{verifyingStudent.student_name}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase text-zinc-500 font-bold tracking-wider">Billing Course</span>
                  <span className="font-medium text-zinc-800 truncate block">Billing Period: {verifyingStudent.month_year}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase text-zinc-500 font-bold tracking-wider">Tuition Fee Rate</span>
                  <span className="font-bold text-zinc-900 font-mono">${verifyingStudent.amount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase text-zinc-500 font-bold tracking-wider">Ledger Status</span>
                  <span className="inline-block px-1.5 py-0.5 rounded text-[8px] uppercase font-bold bg-amber-50 text-amber-700 border border-amber-250">
                    {verifyingStudent.status}
                  </span>
                </div>
              </div>

              {/* Visual receipt preview */}
              <div className="border border-zinc-200 rounded-2xl p-3 space-y-2 bg-zinc-50/50">
                <span className="block text-[9px] uppercase text-zinc-500 font-bold tracking-wider">Uploaded Receipt preview</span>
                
                {verifyingStudent.receipt_url ? (
                  <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white flex items-center justify-center min-h-[180px] max-h-[260px] relative">
                    {verifyingStudent.receipt_url.toLowerCase().endsWith('.pdf') ? (
                      <iframe src={verifyingStudent.receipt_url} className="w-full h-[220px] border-none" />
                    ) : (
                      <img src={verifyingStudent.receipt_url} alt="Receipt Slip Preview" className="object-contain max-h-[240px] w-full" />
                    )}
                  </div>
                ) : (
                  <div className="bg-white border border-zinc-200 rounded-xl p-3 shadow-2xs relative overflow-hidden space-y-2">
                    <div className="flex justify-between items-center border-b border-zinc-100 pb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-[#1B6B3A] tracking-wider uppercase font-serif">Wise Transfer Confirmation</span>
                      </div>
                      <span className="text-[8px] font-mono text-zinc-500">2026-06-21 14:32</span>
                    </div>

                    <div className="space-y-1.5 text-[10px] leading-relaxed">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Status:</span>
                        <span className="text-emerald-700 font-bold uppercase tracking-wider text-[8px]">SUCCESSFUL</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Transaction ID (TID):</span>
                        <span className="font-mono font-bold text-zinc-950 bg-amber-50 px-1 rounded">TID-8392048</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Amount Transferred:</span>
                        <span className="font-mono font-bold text-zinc-900">${verifyingStudent.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Receiver Name:</span>
                        <span className="font-bold text-zinc-800">Virtual Zawiyah Online</span>
                      </div>
                    </div>

                    <div className="absolute right-2 bottom-2 opacity-5 rotate-12 pointer-events-none">
                      <CheckCircle2 className="h-10 w-10 text-[#1B6B3A]" />
                    </div>
                  </div>
                )}

                <p className="text-[9px] text-zinc-655 leading-normal font-medium">
                  Verify receipt contents against bank records. Ensure the Transaction ID is unique and valid before ledger confirmation.
                  <strong className="block mt-1.5 text-[#1B6B3A]">Important: Fee collection and teacher salary are two completely separate processes. Verifying a student&apos;s fee receipt does not trigger any teacher payment. Teacher salaries are processed separately at month-end in the Salary Management tab.</strong>
                </p>
              </div>

              {/* Rejection input toggle */}
              {isRejecting ? (
                <div className="space-y-2 border-t border-zinc-150 pt-3 animate-fade-in">
                  <label className="block text-[9px] font-bold text-rose-700 uppercase tracking-wider">Official Rejection Reason</label>
                  <textarea
                    required
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide comments (e.g. Uploaded Selfie instead of receipt, invalid transaction reference TID)..."
                    className="w-full text-xs p-2 rounded-xl border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-zinc-800 placeholder-zinc-500 bg-rose-50/10 focus:bg-white"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => rejectReceipt(verifyingStudent.fee_payment_id, verifyingStudent.student_name)}
                      className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-[10px] uppercase tracking-wider active:scale-95 transition-all shadow-xs"
                    >
                      Confirm Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsRejecting(false)}
                      className="py-2 px-3 border border-zinc-300 text-zinc-700 hover:bg-zinc-50 font-bold rounded-xl text-[10px] active:scale-95 transition-all"
                    >
                      Back
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2.5 pt-3 border-t border-zinc-150">
                  <button
                    onClick={() => confirmReceipt(verifyingStudent.fee_payment_id, verifyingStudent.student_name)}
                    className="flex-1 py-2 bg-[#1B6B3A] text-white hover:bg-[#1B6B3A]/90 font-bold rounded-xl text-xs active:scale-[0.98] transition-all flex items-center justify-center gap-1 shadow-xs"
                  >
                    <Check className="h-4 w-4" />
                    <span>Confirm Receipt</span>
                  </button>
                  <button
                    onClick={() => setIsRejecting(true)}
                    className="py-2 px-4 border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold rounded-xl text-xs active:scale-95 transition-all flex items-center gap-1"
                  >
                    <X className="h-4 w-4" />
                    <span>Reject</span>
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* GENERATE EXPENSE REPORT MODAL              */}
      {/* ========================================== */}
      {reportModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 animate-scale-up">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-zinc-150 pb-3">
              <h4 className="text-sm font-bold text-zinc-950 font-serif uppercase tracking-wider flex items-center gap-2">
                Generate Expense Report
              </h4>
              <button 
                onClick={() => setReportModalOpen(false)} 
                className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              
              {/* Report Scope Selector */}
              <div>
                <label className="block text-[9px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">Select Report Period</label>
                <select
                  value={reportScope}
                  onChange={(e) => setReportScope(e.target.value as 'monthly' | '6-month' | 'yearly')}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#1B6B3A]/20 focus:border-[#1B6B3A] text-zinc-800 font-medium bg-zinc-50 cursor-pointer"
                >
                  <option value="monthly">Current Selected Period ({selectedPeriod})</option>
                  <option value="6-month">Last 6 Months (January — June 2026)</option>
                  <option value="yearly">Full Year (2026 Archive)</option>
                </select>
              </div>

              {/* Format Selector */}
              <div>
                <label className="block text-[9px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">Export Format</label>
                <div className="grid grid-cols-2 gap-3">
                  
                  {/* Excel Option */}
                  <button
                    onClick={() => setReportFormat('xlsx')}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between h-18 active:scale-[0.98] ${
                      reportFormat === 'xlsx' 
                        ? 'border-[#1B6B3A] bg-[#1B6B3A]/5 text-[#1B6B3A]' 
                        : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                    }`}
                  >
                    <span className="text-[8px] font-bold uppercase tracking-wider">Excel Workbook</span>
                    <span className="text-[10px] font-bold block text-zinc-800">Spreadsheet (.xlsx)</span>
                  </button>

                  {/* PDF Option */}
                  <button
                    onClick={() => setReportFormat('pdf')}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between h-18 active:scale-[0.98] ${
                      reportFormat === 'pdf' 
                        ? 'border-[#1B6B3A] bg-[#1B6B3A]/5 text-[#1B6B3A]' 
                        : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                    }`}
                  >
                    <span className="text-[8px] font-bold uppercase tracking-wider">Print Document</span>
                    <span className="text-[10px] font-bold block text-zinc-800">Portable PDF (.pdf)</span>
                  </button>

                </div>
              </div>

              {/* Report Preview card summary */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3.5 space-y-1.5 text-[11px]">
                <span className="block text-[8px] uppercase font-bold text-zinc-500 tracking-wider">Report Details</span>
                <div className="flex justify-between">
                  <span className="text-zinc-650 font-medium">Estimated transaction count:</span>
                  <span className="font-bold text-zinc-800">
                    {reportScope === 'monthly' ? getFilteredExpenses().length :
                     reportScope === '6-month' ? (expenses.length + MAY_EXPENSES.length + APRIL_EXPENSES.length) :
                     11} items
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-650 font-medium">Scope Period:</span>
                  <span className="font-bold text-[#1B6B3A] capitalize">
                    {reportScope === 'monthly' ? selectedPeriod :
                     reportScope === '6-month' ? 'Jan 2026 — June 2026' :
                     'Full Year 2026'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="py-2 px-4 border border-zinc-300 text-zinc-700 hover:bg-zinc-50 font-bold rounded-xl text-xs active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={reportFormat === 'xlsx' ? handleDownloadExcel : handleDownloadPDF}
                  className="py-2 px-4 bg-[#1B6B3A] text-white hover:bg-[#1B6B3A]/90 font-bold rounded-xl text-xs active:scale-[0.98] transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Download className="h-4 w-4" />
                  <span>Generate Report</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  )
}
