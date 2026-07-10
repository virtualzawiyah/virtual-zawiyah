'use client'

import { useState, useEffect } from 'react'
import { 
  Landmark, 
  Clock, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  AlertCircle,
  Award,
  Loader2
} from 'lucide-react'

export default function TeacherWalletPage() {
  const [isCalcExpanded, setIsCalcExpanded] = useState(false)
  const [selectedStatementId, setSelectedStatementId] = useState<string | null>(null)

  const [wallet, setWallet] = useState<{ total_earned: number; available_balance: number; total_withdrawn: number; currency: string } | null>(null)
  const [payrollHistory, setPayrollHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadWalletData = async () => {
      try {
        const res = await fetch('/api/teacher/wallet')
        if (!res.ok) throw new Error('Failed to load wallet data')
        const data = await res.json()
        if (data.success) {
          setWallet(data.wallet)
          setPayrollHistory(data.payrollHistory || [])
        } else {
          setError(data.error || 'Failed to load wallet data')
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }
    loadWalletData()
  }, [])

  const isCurrentMonth = (monthYearStr: string) => {
    if (!monthYearStr) return false
    const now = new Date()
    const currentMonthNum = now.getMonth() + 1 // 1-12
    const currentYear = now.getFullYear()
    
    const parts = monthYearStr.split('-')
    if (parts.length === 2) {
      const p0 = parseInt(parts[0], 10)
      const p1 = parseInt(parts[1], 10)
      if ((p0 === currentMonthNum && p1 === currentYear) || (p0 === currentYear && p1 === currentMonthNum)) {
        return true
      }
    }
    return false
  }

  const formatMonthYear = (my: string) => {
    if (!my) return ''
    const parts = my.split('-')
    if (parts.length !== 2) return my
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const p0 = parseInt(parts[0], 10)
    const p1 = parseInt(parts[1], 10)
    if (p0 > 12) {
      const y = p0
      const m = p1
      return `${months[m - 1]} ${y}`
    } else {
      const m = p0
      const y = p1
      return `${months[m - 1]} ${y}`
    }
  }

  const currentRecord = payrollHistory.find(item => isCurrentMonth(item.month_year))
  const selectedStatement = payrollHistory.find(s => s.id === selectedStatementId)
  const helpBaseSalary = currentRecord ? Number(currentRecord.base_amount) : (payrollHistory[0] ? Number(payrollHistory[0].base_amount) : 110000.00)

  if (loading) {
    return (
      <main className="flex-1 bg-[#FAFAF7] flex flex-col items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B6B3A] mb-2" />
        <span className="text-sm text-zinc-550 font-sans">Loading wallet statements...</span>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex-1 bg-[#FAFAF7] p-4 sm:p-6 lg:p-8 h-full space-y-6">
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 font-sans flex items-start gap-2">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-700 mt-0.5" />
          <div>
            <h4 className="font-bold">Error Loading Wallet</h4>
            <p className="mt-1">{error}</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 bg-[#FAFAF7] overflow-y-auto p-4 sm:p-6 lg:p-8 h-full space-y-6">
      
      {/* Title Header */}
      <div className="border-b border-zinc-200 pb-5">
        <h1 className="text-3xl font-serif font-bold text-zinc-900">
          Salary & Wallet Statements
        </h1>
        <p className="text-sm text-zinc-655 mt-1 font-sans">
          Monitor your monthly salary parameters, check leave allowances, review payout schedules, and view historic payslips.
        </p>
      </div>

      {/* Three-Tier Wallet Cards Banner */}
      <div className="grid gap-4 sm:grid-cols-3 font-sans">
        <div className="bg-emerald-50 border border-emerald-250 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 rounded-full bg-emerald-500/10 blur-xl pointer-events-none" />
          <span className="block text-[10px] font-bold text-[#1B6B3A] uppercase tracking-wider">Available Balance</span>
          <h3 className="text-2xl font-serif font-bold text-[#1B6B3A] mt-2">
            Rs. {Number(wallet?.available_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <span className="block text-[9px] text-zinc-500 mt-1">Ready for next disbursement cycle</span>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
          <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Total Earned</span>
          <h3 className="text-2xl font-serif font-bold text-zinc-800 mt-2">
            Rs. {Number(wallet?.total_earned || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <span className="block text-[9px] text-zinc-500 mt-1">Cumulative career earnings</span>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
          <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Total Withdrawn</span>
          <h3 className="text-2xl font-serif font-bold text-zinc-800 mt-2">
            Rs. {Number(wallet?.total_withdrawn || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <span className="block text-[9px] text-zinc-500 mt-1">Transferred to settled bank account</span>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Left Column: Current Salary Summary & visual balance gauges */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Salary Summary Card */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-[#1B6B3A]/5 blur-3xl pointer-events-none" />
            
            <div className="flex justify-between items-center pb-4 border-b border-zinc-150">
              <div>
                <span className="text-[10px] font-bold text-[#1B6B3A] uppercase tracking-widest bg-[#1B6B3A]/10 border border-[#1B6B3A]/20 px-2.5 py-1 rounded-lg font-sans">
                  {currentRecord ? formatMonthYear(currentRecord.month_year) : 'Current Month'}
                </span>
                <h2 className="text-lg font-serif font-bold text-zinc-900 mt-2">Monthly Salary Statement</h2>
              </div>
              <div className="text-right font-sans">
                <span className="block text-[9px] font-mono text-zinc-400 uppercase tracking-widest">Payout Date</span>
                <span className="block text-xs font-bold text-zinc-700 mt-0.5">
                  {currentRecord?.payment_date ? new Date(currentRecord.payment_date).toLocaleDateString() : 'Pending Release'}
                </span>
              </div>
            </div>

            {/* Calculations Breakdown */}
            {currentRecord ? (
              <div className="py-4 space-y-3 font-sans">
                <div className="flex justify-between text-xs text-zinc-650">
                  <span>Base Contract Salary</span>
                  <span className="font-semibold text-zinc-800">Rs. {Number(currentRecord.base_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                <div className="flex justify-between text-xs text-zinc-655 pb-2 border-b border-dashed border-zinc-150">
                  <span>Adjustments (Leaves/Penalties)</span>
                  <span className={`font-semibold ${Number(currentRecord.adjustments) >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {Number(currentRecord.adjustments) >= 0 ? '+' : ''}Rs. {Number(currentRecord.adjustments).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Net Payout */}
                <div className="flex justify-between items-center pt-4">
                  <div>
                    <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider block">Net Salary (Processed)</span>
                    <span className="text-[10px] text-zinc-500 font-sans block mt-0.5">Status: <span className="font-bold text-[#1B6B3A]">{currentRecord.status}</span></span>
                  </div>
                  <span className="text-2xl font-serif font-black text-[#1B6B3A]">
                    Rs. {Number(currentRecord.final_payout).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-zinc-500 bg-zinc-50 rounded-xl border border-dashed border-zinc-200 font-sans my-4">
                Salary for this month has not been processed yet
              </div>
            )}

            {/* How is this calculated? Expandable section */}
            <div className="border-t border-zinc-150 pt-3">
              <button 
                onClick={() => setIsCalcExpanded(!isCalcExpanded)}
                className="w-full flex items-center justify-between text-xs font-bold text-zinc-700 hover:text-zinc-950 transition-colors py-1.5 focus:outline-none"
              >
                <span className="flex items-center gap-1.5 font-sans">
                  <HelpCircle className="h-4.5 w-4.5 text-[#1B6B3A]" /> How is this calculated?
                </span>
                {isCalcExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {isCalcExpanded && (
                <div className="mt-3 bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 space-y-2.5 text-xs text-zinc-655 leading-relaxed font-sans animate-fade-in">
                  <p>
                    Your salary is calculated according to the Virtual Zawiyah standard teacher compensation model:
                  </p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>
                      <strong className="text-zinc-800">Per-Minute Payout & Deduction Rate</strong>:
                      <div className="mt-1 font-mono text-[10px] bg-zinc-150 p-2 rounded border border-zinc-250">
                        Monthly Salary ÷ Days in Month ÷ 480 minutes = Per Minute Rate<br />
                        e.g. Rs. {helpBaseSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })} ÷ 30 days ÷ 480 mins = Rs. {(helpBaseSalary / 30 / 480).toFixed(2)} per minute
                      </div>
                    </li>
                    <li>
                      <strong className="text-zinc-800">Leave Allowance</strong>: You are allowed up to 2 paid leave days each calendar month. Excess absences are deducted at the per-minute rate.
                    </li>
                    <li>
                      <strong className="text-zinc-850">Unapproved Absences</strong>: Unapproved absence slots are subject to immediate deductions using the same per-minute rate based on actual minutes missed.
                    </li>
                    <li>
                      <strong className="text-zinc-800">Lesson Report Penalty</strong>: Each late lesson report (submitted after 24 hours of slot time) is subject to a <span className="font-mono">Rs. 1,500.00</span> late log penalty.
                    </li>
                  </ul>
                </div>
              )}
            </div>

          </div>

          {/* Payment History Table */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-2 font-sans">
              <Clock className="h-4.5 w-4.5 text-[#1B6B3A]" /> Payout History Ledger
            </h3>

            {payrollHistory.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-400 bg-zinc-50 rounded-xl border border-dashed border-zinc-200 font-sans">
                No salary records yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-sans">
                  <thead>
                    <tr className="border-b border-zinc-200 text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-50/50">
                      <th className="py-3 px-3">Billing Month</th>
                      <th className="py-3 px-3">Base Salary</th>
                      <th className="py-3 px-3 text-right">Deductions/Adjustments</th>
                      <th className="py-3 px-3 text-right">Net Amount</th>
                      <th className="py-3 px-3 text-right">Payout Date</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-150 text-xs text-zinc-700">
                    {payrollHistory.map((tx) => (
                      <tr key={tx.id} className="hover:bg-zinc-50/30 transition-colors">
                        <td className="py-3 px-3 font-semibold text-zinc-900">{formatMonthYear(tx.month_year)}</td>
                        <td className="py-3 px-3 font-mono">Rs. {Number(tx.base_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className={`py-3 px-3 text-right font-mono ${Number(tx.adjustments) >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {Number(tx.adjustments) >= 0 ? '+' : ''}Rs. {Number(tx.adjustments).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-[#1B6B3A] font-mono">
                          Rs. {Number(tx.final_payout).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-zinc-500">
                          {tx.payment_date ? new Date(tx.payment_date).toLocaleDateString() : 'Processing'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setSelectedStatementId(tx.id)}
                            className="text-[10px] bg-zinc-100 hover:bg-zinc-200/80 border border-zinc-300 font-bold px-2 py-1 rounded-lg text-zinc-700 transition-all active:scale-95"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Visual balance gauges, banks details, and payout slips */}
        <div className="space-y-6">
          
          {/* Leaves balance gauge */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs text-center space-y-4 font-sans">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider text-left">Leave Balance Card</h4>
            
            <div className="relative flex items-center justify-center py-2">
              {/* Simple progress ring representation */}
              <div className="h-28 w-28 rounded-full border-8 border-zinc-100 flex items-center justify-center relative">
                {/* Visual half-circle filled wrapper */}
                <div className="absolute inset-0 rounded-full border-8 border-[#1B6B3A] border-t-transparent border-r-transparent animate-pulse" />
                
                <div className="text-center z-10">
                  <span className="block text-2xl font-serif font-black text-zinc-800 leading-none">1 / 2</span>
                  <span className="block text-[8px] font-bold text-zinc-450 uppercase tracking-wider mt-1">Days Used</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-zinc-650 bg-[#E8F5EE] border border-[#1B6B3A]/10 p-3 rounded-xl">
              <span className="font-bold text-[#1B6B3A] block">1.0 Paid Leave Day Left</span>
              <span className="text-[10px] text-zinc-500 block mt-0.5">Resets on first day of next month.</span>
            </div>
          </div>

          {/* Settled Bank Account Info */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs space-y-4 font-sans">
            <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
              <Landmark className="h-4.5 w-4.5 text-[#1B6B3A]" /> Payout Bank Settlement
            </h4>
            
            <div className="space-y-3 text-xs bg-zinc-50 border border-zinc-200 p-3.5 rounded-xl">
              <div>
                <span className="block text-[9px] font-bold text-zinc-450 uppercase tracking-wider">Settlement Bank</span>
                <span className="text-zinc-800 font-semibold block mt-0.5">Bank details are managed by the Finance Officer</span>
              </div>

              <div className="pt-1.5 flex gap-1.5 items-center text-[9px] text-[#1B6B3A] font-bold uppercase tracking-wider border-t border-zinc-250">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#1B6B3A]" /> Settlement Method Active
              </div>
            </div>
            
            <p className="text-[10px] text-zinc-500 leading-tight italic">
              *Payout updates or bank account changes are managed by the Admin. Please contact support to submit modifications.
            </p>
          </div>

          {/* Welfare & Benefits Entitlements Section */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs space-y-4 font-sans">
            <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-150 pb-2">
              <Award className="h-4.5 w-4.5 text-[#1B6B3A]" /> Welfare & Benefits Entitlements
            </h4>
            
            <div className="space-y-3.5 text-xs bg-zinc-50 border border-zinc-200 p-3.5 rounded-xl leading-relaxed">
              <div>
                <span className="block text-[9px] font-bold text-zinc-505 uppercase tracking-wider">Medical Reimbursement</span>
                <p className="text-zinc-700 mt-1 font-sans">
                  • Rs. 5,000 or less: <strong>100% full reimbursement</strong><br />
                  • Rs. 5,001 to Rs. 20,000: <strong>50% reimbursement</strong><br />
                  • Rs. 20,001 or more: <strong>Capped at Rs. 10,000 fixed</strong>
                </p>
              </div>

              <div className="border-t border-zinc-200 pt-2.5">
                <span className="block text-[9px] font-bold text-zinc-505 uppercase tracking-wider">Marriage Bonus</span>
                <p className="text-zinc-700 mt-1 font-sans">
                  <strong>One month&apos;s basic salary</strong> paid as a one-time bonus upon submission of proof of marriage.
                </p>
              </div>

              <div className="border-t border-zinc-200 pt-2.5">
                <span className="block text-[9px] font-bold text-zinc-505 uppercase tracking-wider">Family Bereavement Support</span>
                <p className="text-zinc-700 mt-1 font-sans">
                  <strong>Rs. 5,000 + 3 days paid leave</strong> paid upon death of:
                  <br />• Parent (if employee is unmarried)
                  <br />• Spouse or Child (if employee is married)
                </p>
              </div>

              <div className="border-t border-zinc-200 pt-2.5">
                <span className="block text-[9px] font-bold text-zinc-505 uppercase tracking-wider">Eid-ul-Fitr Annual Bonus</span>
                <p className="text-zinc-700 mt-1 font-sans">
                  Discretionary bonus based on months of service (1 June–31 May), calculated as average monthly salary divided by 360 × days worked in permanent status. <strong>Capped at Rs. 50,000 base salary.</strong>
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Statement Payout Details Modal (State Slip) */}
      {selectedStatement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setSelectedStatementId(null)}
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs transition-opacity duration-300"
          />
          
          <div className="relative w-full max-w-md bg-white border border-zinc-200 rounded-2xl shadow-2xl p-6 z-10 animate-fade-in space-y-4">
            
            {/* Header info */}
            <div className="flex justify-between items-start border-b border-zinc-150 pb-4 font-sans">
              <div>
                <h3 className="text-lg font-serif font-bold text-zinc-900">Payout Details Slip</h3>
                <span className="text-xs text-zinc-500 font-sans mt-1">{formatMonthYear(selectedStatement.month_year)} Billing</span>
              </div>
              <span className="text-[10px] bg-emerald-100 text-[#1B6B3A] border border-emerald-250 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                {selectedStatement.status}
              </span>
            </div>

            {/* Ledger items */}
            <div className="space-y-3 text-xs py-2 font-sans">
              <div className="flex justify-between text-zinc-650">
                <span>Base Contract Amount</span>
                <span className="font-mono text-zinc-900">Rs. {Number(selectedStatement.base_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              
              <div className="flex justify-between text-zinc-650">
                <span>Adjustments / Deductions</span>
                <span className={`font-mono ${Number(selectedStatement.adjustments) >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {Number(selectedStatement.adjustments) >= 0 ? '+' : ''}Rs. {Number(selectedStatement.adjustments).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between text-zinc-650">
                <span>Payment Settlement Date</span>
                <span className="font-mono text-zinc-900">
                  {selectedStatement.payment_date ? new Date(selectedStatement.payment_date).toLocaleDateString() : 'Processing'}
                </span>
              </div>

              <div className="flex justify-between text-zinc-650">
                <span>Settled Method</span>
                <span className="font-semibold text-zinc-800">Direct Bank Deposit</span>
              </div>

              <div className="flex justify-between text-zinc-650">
                <span>Transfer Reference</span>
                <span className="font-mono text-zinc-700 bg-zinc-100 px-1.5 py-0.5 rounded">
                  TXN-{selectedStatement.id.substring(0, 8).toUpperCase()}-VZ
                </span>
              </div>
            </div>

            {/* Total Paid */}
            <div className="flex justify-between items-center pt-4 border-t border-zinc-150 bg-zinc-50/30 p-3 rounded-xl font-sans">
              <div>
                <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider block">Net Paid Amount</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">Cleared & Settled</span>
              </div>
              <span className="text-xl font-serif font-black text-[#1B6B3A] font-mono">
                Rs. {Number(selectedStatement.final_payout).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Close button */}
            <button
              onClick={() => setSelectedStatementId(null)}
              className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 font-bold rounded-xl text-xs text-zinc-750 transition-all active:scale-[0.98]"
            >
              Close Payslip Details
            </button>
            
          </div>
        </div>
      )}

    </main>
  )
}
