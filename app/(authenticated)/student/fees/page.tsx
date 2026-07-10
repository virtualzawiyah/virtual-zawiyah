'use client'

import { useState, useEffect } from 'react'
import { 
  CreditCard, 
  Upload, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  Users,
  FileText,
  HelpCircle
} from 'lucide-react'

export default function StudentFeesPage() {
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null)
  
  // Sibling states (to populate tab switchers and checkboxes)
  const [siblings, setSiblings] = useState<any[]>([])
  const [isLoadingSiblings, setIsLoadingSiblings] = useState(true)

  // Sibling selected checkboxes for receipt upload
  const [selectedForPayment, setSelectedForPayment] = useState<Record<string, boolean>>({})

  // Fee details for activeStudentId
  const [currentFee, setCurrentFee] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form States & Feedback alerts
  const [uploadSuccess, setUploadSuccess] = useState('')
  const [uploading, setUploading] = useState(false)
  const [deferralSuccess, setDeferralSuccess] = useState('')
  const [showDeferralModal, setShowDeferralModal] = useState(false)
  const [deferralDate, setDeferralDate] = useState('')
  const [deferralReason, setDeferralReason] = useState('')

  // Helper to format 'MM-YYYY' to month name and year (e.g. '07-2026' -> 'July 2026')
  const formatMonthYear = (monthYearStr: string) => {
    if (!monthYearStr || !monthYearStr.includes('-')) return monthYearStr
    const [m, y] = monthYearStr.split('-')
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    const monthIdx = parseInt(m, 10) - 1
    return `${monthNames[monthIdx] || m} ${y}`
  }

  // Calculate 8th day of month-year as the due date
  const getDueDate = (monthYearStr: string) => {
    if (!monthYearStr || !monthYearStr.includes('-')) return 'N/A'
    const [m, y] = monthYearStr.split('-')
    return `${y}-${m}-08`
  }

  // Status check helper
  const getPaymentStatus = (item: any) => {
    if (!item) return 'Paid'
    if (item.status === 'verified') return 'Paid'
    if (item.status === 'rejected') return 'Rejected'
    if (item.deferral_requested) return 'Deferred'
    if (item.receipt_url) return 'Pending Verification'
    return 'Pending'
  }

  // Helper for color coding status badges
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200'
      case 'Pending Verification':
        return 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
      case 'Pending':
        return 'bg-red-100 text-red-800 border border-red-200 animate-pulse-slow'
      case 'Deferred':
        return 'bg-sky-100 text-sky-900 border border-sky-200'
      default:
        return 'bg-red-100 text-red-800 border border-red-200'
    }
  }

  const fetchFees = async (studentId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/student/fees?student_id=${studentId}`)
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to fetch sibling fee ledger')

      setCurrentFee(result.currentFee)
      setHistory(result.history || [])
    } catch (err: any) {
      console.error('Error fetching fees:', err)
      setError(err.message || 'Failed to load fee ledger.')
    } finally {
      setLoading(false)
    }
  }

  const fetchSiblings = async () => {
    setIsLoadingSiblings(true)
    try {
      const response = await fetch('/api/student/siblings')
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to fetch sibling profiles')

      const sibs = result.siblings || []
      setSiblings(sibs)

      // Set default selected checkboxes for receipt uploads
      const defaultCheck: Record<string, boolean> = {}
      sibs.forEach((s: any) => {
        defaultCheck[s.id] = s.id === activeStudentId
      })
      setSelectedForPayment(defaultCheck)

      // Initialize selected student profile context if not already loaded from localStorage
      if (sibs.length > 0 && !activeStudentId) {
        let savedId = null
        if (typeof window !== 'undefined') {
          savedId = localStorage.getItem('activeStudentId')
        }
        const activeId = savedId || sibs[0].id
        setActiveStudentId(activeId)
      }
    } catch (err) {
      console.error('Error loading siblings:', err)
    } finally {
      setIsLoadingSiblings(false)
    }
  }

  useEffect(() => {
    fetchSiblings()
  }, [])

  useEffect(() => {
    if (activeStudentId) {
      fetchFees(activeStudentId)
      // Automatically keep checkboxes checked for the active student tab
      setSelectedForPayment(prev => ({
        ...prev,
        [activeStudentId]: true
      }))
    }
  }, [activeStudentId])

  // Handle student switcher toggle
  const handleStudentSwitch = (key: string) => {
    setActiveStudentId(key)
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeStudentId', key)
      localStorage.setItem('selectedKey', key)
    }
    console.log(`Switched fee history view to student: ${key}`)
  }

  // Handle payment checkbox change
  const handleCheckboxChange = (key: string) => {
    setSelectedForPayment(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  // --- Upload Receipt Slip ---
  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedSibs = Object.keys(selectedForPayment).filter(k => selectedForPayment[k])
    
    if (selectedSibs.length === 0) {
      alert('Please check at least one sibling to apply this payment to.')
      return
    }

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setUploading(true)
      setUploadSuccess('')
      
      try {
        // Loop over checked siblings and upload file
        for (const sibId of selectedSibs) {
          const res = await fetch(`/api/student/fees?student_id=${sibId}`)
          const data = await res.json()
          
          if (res.ok && data.currentFee && (data.currentFee.status === 'pending' || data.currentFee.status === 'rejected')) {
            const paymentId = data.currentFee.id
            const uploadFormData = new FormData()
            uploadFormData.append('fee_payment_id', paymentId)
            uploadFormData.append('file', file)

            const uploadRes = await fetch('/api/student/fees/upload-receipt', {
              method: 'POST',
              body: uploadFormData
            })
            const uploadResult = await uploadRes.json()
            if (!uploadRes.ok) throw new Error(uploadResult.error || 'Upload failed')
          }
        }

        setUploadSuccess(`Receipt "${file.name}" uploaded successfully for verification!`)
        if (activeStudentId) {
          fetchFees(activeStudentId)
        }
        setTimeout(() => setUploadSuccess(''), 6000)
      } catch (err: any) {
        console.error(err)
        alert(`Upload failed: ${err.message || 'Error occurred during file transfer'}`)
      } finally {
        setUploading(false)
      }
    }
  }

  // --- Deferral Request Submission ---
  const handleDeferralSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!deferralDate || !deferralReason || !currentFee) return

    setDeferralSuccess('')
    try {
      const response = await fetch('/api/student/fees/deferral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fee_payment_id: currentFee.id,
          requested_date: deferralDate,
          reason: deferralReason
        })
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to submit deferral')

      setDeferralSuccess(`Deferral request submitted successfully. Expected payment date: ${deferralDate}.`)
      setShowDeferralModal(false)
      setDeferralReason('')
      setDeferralDate('')
      
      if (activeStudentId) {
        fetchFees(activeStudentId)
      }
      setTimeout(() => setDeferralSuccess(''), 5000)
    } catch (err: any) {
      console.error(err)
      alert(`Failed to submit deferral request: ${err.message || 'Error occurred'}`)
    }
  }

  if (isLoadingSiblings) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B6B3A]" />
      </div>
    )
  }

  const activeStudentProfile = siblings.find(s => s.id === activeStudentId) || siblings[0]

  return (
    <div className="space-y-8 pb-16 font-sans">
      {/* 1. STUDENT SWITCHER CONTAINER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-[#1B6B3A]" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-700">View Sibling Payment History</span>
        </div>
        <div className="flex gap-2">
          {siblings.map((sib) => (
            <button
              key={sib.id}
              onClick={() => handleStudentSwitch(sib.id)}
              className={`rounded-xl px-4 py-2 text-xs font-bold tracking-wide transition-all border ${
                activeStudentId === sib.id
                  ? 'bg-[#1B6B3A]/10 border-[#1B6B3A]/30 text-[#1B6B3A] shadow-sm'
                  : 'bg-zinc-50 border-zinc-300 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
              }`}
            >
              {sib.fullName} ({sib.courseName.split(' ')[0]})
            </button>
          ))}
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-[#1B6B3A]/5 blur-[80px] pointer-events-none" />
        <div>
          <h1 className="text-3xl font-bold font-serif tracking-tight text-zinc-900 flex items-center gap-2">
            <CreditCard className="h-8 w-8 text-[#1B6B3A]" /> Tuition Fees & Ledger
          </h1>
          <p className="mt-2 text-zinc-700 max-w-xl text-sm leading-relaxed font-sans">
            Upload manual bank transfer details, request tuition deferral terms, or review payment ledger history for siblings linked to your account.
          </p>
        </div>
      </div>

      {/* Global Alerts */}
      {uploadSuccess && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-100 p-4 text-xs font-bold text-emerald-800 flex items-center gap-2 font-sans">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {uploadSuccess}
        </div>
      )}
      {deferralSuccess && (
        <div className="rounded-xl border border-sky-200 bg-sky-100 p-4 text-xs font-bold text-sky-900 flex items-center gap-2 font-sans">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {deferralSuccess}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1B6B3A]" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm max-w-xl mx-auto space-y-4 my-12 font-sans">
          <h2 className="text-lg font-bold text-red-800">Error Loading Fee Ledger</h2>
          <p className="text-sm text-red-700">{error}</p>
          <button 
            onClick={() => fetchFees(activeStudentId!)}
            className="rounded-xl bg-red-600 text-white px-4 py-2 text-xs font-bold hover:bg-red-700 transition-all"
          >
            Retry Load
          </button>
        </div>
      ) : (
        /* MAIN TWO-COLUMN LAYOUT */
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column: Sibling Billing Selector & Upload */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Sibling Billing Ledger Overview */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-6">
              <h2 className="text-xl font-bold font-serif text-zinc-900 flex items-center gap-2 border-b border-zinc-200 pb-4">
                <Users className="h-5 w-5 text-[#1B6B3A]" /> Sibling Account Billing Overview
              </h2>

              <div className="grid gap-4">
                {siblings.map((sib) => {
                  const isSelected = selectedForPayment[sib.id]
                  // Fetch state values dynamically or fall back to mock
                  const isCurrentActive = activeStudentId === sib.id
                  const resolvedFeeAmount = isCurrentActive && currentFee ? currentFee.original_amount : '60.00'
                  const resolvedCurrency = isCurrentActive && currentFee ? currentFee.original_currency : 'USD'
                  const resolvedStatus = isCurrentActive && currentFee ? getPaymentStatus(currentFee) : 'Pending'
                  const resolvedDueDate = isCurrentActive && currentFee ? getDueDate(currentFee.month_year) : 'N/A'

                  return (
                    <div 
                      key={sib.id} 
                      className={`rounded-xl border p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans ${
                        isSelected 
                          ? 'border-emerald-300 bg-emerald-50/40 shadow-sm' 
                          : 'border-zinc-200 bg-zinc-50/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox to select sibling for payment slip application */}
                        <input 
                          type="checkbox"
                          id={`pay-${sib.id}`}
                          checked={!!selectedForPayment[sib.id]}
                          onChange={() => handleCheckboxChange(sib.id)}
                          className="mt-1 h-4 w-4 rounded border-zinc-300 bg-white text-[#1B6B3A] focus:ring-[#1B6B3A]"
                        />
                        <div>
                          <label htmlFor={`pay-${sib.id}`} className="font-bold text-zinc-800 text-sm cursor-pointer hover:text-[#1B6B3A]">
                            {sib.fullName}
                          </label>
                          <p className="text-xs text-zinc-700 mt-0.5">{sib.courseName}</p>
                          <div className="flex items-center gap-2 mt-2 font-mono text-[10px] text-zinc-700">
                            <span>Due Date: {resolvedDueDate}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2">
                        <span className="text-zinc-900 font-black text-sm">
                          {resolvedCurrency === 'USD' ? '$' : 'Rs. '}{resolvedFeeAmount}
                        </span>
                        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeClass(resolvedStatus)}`}>
                          {resolvedStatus}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              <div className="flex items-start gap-2 bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 text-xs text-zinc-700 font-sans">
                <HelpCircle className="h-4 w-4 shrink-0 mt-0.5 text-zinc-500" />
                <p className="leading-relaxed">
                  Check the boxes next to each sibling&apos;s name to apply your uploaded receipt document to their respective fee records. Sibling records carry fully independent fee amounts, deferrals, and payment histories.
                </p>
              </div>
            </div>

            {/* Receipt Upload Panel */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-6">
              <h2 className="text-xl font-bold font-serif text-zinc-900 flex items-center gap-2 border-b border-zinc-200 pb-4">
                <Upload className="h-5 w-5 text-[#1B6B3A]" /> Upload Transfer Receipt
              </h2>

              <div className="space-y-4 font-sans">
                <p className="text-xs text-zinc-700">
                  After performing a manual bank transfer, upload your payment confirmation receipt here. The admin team will verify the receipt amount matches the total due for all checked siblings.
                </p>

                <div className="border border-dashed border-zinc-300 rounded-2xl bg-zinc-50/50 py-10 px-4 flex flex-col items-center justify-center relative cursor-pointer group hover:border-[#1B6B3A]/45 transition-colors">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleReceiptUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2 text-[#1B6B3A]">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <span className="text-xs font-semibold">Uploading transfer receipt...</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-zinc-500 group-hover:text-[#1B6B3A] transition-colors mb-3" />
                      <span className="text-sm font-semibold text-zinc-700">Click or Drag receipt here to submit</span>
                      <span className="text-xs text-zinc-750 mt-1">Supports PDF, PNG, JPG up to 10MB</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Single Sibling Detail Logs */}
          <div className="space-y-8">
            {/* Active Sibling Ledger Status */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-6">
              <h2 className="text-xl font-bold font-serif text-zinc-900 flex items-center gap-2 border-b border-zinc-200 pb-4">
                <FileText className="h-5 w-5 text-[#1B6B3A]" /> {activeStudentProfile?.fullName} Details
              </h2>

              <div className="space-y-4 text-xs font-sans">
                {!currentFee ? (
                  <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-center text-zinc-400 italic">
                    No active fee records found.
                  </div>
                ) : (
                  <>
                    <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-700">Monthly Tuition Rate:</span>
                        <span className="text-zinc-900 font-bold">
                          {currentFee.original_currency === 'USD' ? '$' : 'Rs. '}{currentFee.original_amount}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-t border-zinc-200 pt-2">
                        <span className="text-zinc-700">Due Date:</span>
                        <span className="text-zinc-750 font-mono font-bold">{getDueDate(currentFee.month_year)}</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-zinc-200 pt-2">
                        <span className="text-zinc-700">Current Status:</span>
                        <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-bold uppercase tracking-wider text-[9px] ${getStatusBadgeClass(getPaymentStatus(currentFee))}`}>
                          {getPaymentStatus(currentFee)}
                        </span>
                      </div>
                    </div>

                    {getPaymentStatus(currentFee) === 'Pending' && (
                      <button
                        onClick={() => setShowDeferralModal(true)}
                        className="w-full text-center rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-all active:scale-[0.99]"
                      >
                        Submit Fee Deferral Request
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Active Sibling Payment Logs */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-6">
              <h2 className="text-xl font-bold font-serif text-zinc-900 flex items-center gap-2 border-b border-zinc-200 pb-4">
                <Clock className="h-5 w-5 text-[#1B6B3A]" /> Payment History
              </h2>

              <div className="divide-y divide-zinc-200 bg-zinc-50 rounded-xl border border-zinc-200 overflow-hidden font-sans">
                {history.length === 0 ? (
                  <div className="p-4 text-center text-zinc-400 italic text-xs bg-zinc-50">No payment history found.</div>
                ) : (
                  history.map((item) => (
                    <div key={item.id} className="p-3 flex items-center justify-between text-xs hover:bg-zinc-100 transition-colors">
                      <div>
                        <p className="font-bold text-zinc-900">
                          {item.original_currency === 'USD' ? '$' : 'Rs. '}{item.original_amount}
                        </p>
                        <p className="text-[10px] text-zinc-650 mt-0.5 font-sans">
                          Month: {formatMonthYear(item.month_year)} • Date: {item.created_at.split('T')[0]}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${getStatusBadgeClass(getPaymentStatus(item))}`}>
                        {getPaymentStatus(item)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MOCK FEE DEFERRAL MODAL --- */}
      {showDeferralModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm font-sans">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl relative font-sans">
            <h3 className="text-base font-bold text-zinc-900 mb-4 font-serif">Request Fee Deferral: {activeStudentProfile?.fullName}</h3>
            
            <form onSubmit={handleDeferralSubmit} className="space-y-4 font-sans">
              <div>
                <label className="text-[10px] text-zinc-700 block mb-1">Expected Payment Date</label>
                <input
                  type="date"
                  required
                  value={deferralDate}
                  onChange={(e) => setDeferralDate(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-white py-2 px-3 text-xs text-zinc-800 outline-none focus:border-[#1B6B3A]/50"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-700 block mb-1">Reason for Deferral</label>
                <textarea
                  required
                  rows={3}
                  value={deferralReason}
                  onChange={(e) => setDeferralReason(e.target.value)}
                  placeholder="Justification for deferral request..."
                  className="w-full rounded-lg border border-zinc-200 bg-white py-2 px-3 text-xs text-zinc-800 outline-none focus:border-[#1B6B3A]/50 resize-none font-sans"
                />
              </div>
              
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeferralModal(false)}
                  className="rounded-lg bg-zinc-100 hover:bg-zinc-200 px-4 py-2 text-xs font-bold text-zinc-750 hover:text-zinc-900 transition-all border border-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#1B6B3A] hover:bg-[#1B6B3A]/90 px-4 py-2 text-xs font-bold text-white transition-all shadow-sm active:scale-[0.98]"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
