'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { CreditCard, CheckCircle2, XCircle, AlertCircle, Loader2, Download, DollarSign, Calendar, RefreshCw, Eye } from 'lucide-react'

interface FeePaymentAudit {
  id: string
  student_name: string
  teacher_name: string
  month_year: string
  original_amount: number
  original_currency: string
  pkr_amount: string
}

interface PendingPayment {
  id: string
  parent_name: string
  total_amount: number
  currency: string
  receipt_url: string
  reference_number: string | null
  created_at: string
  feePayments: FeePaymentAudit[]
}

interface ParentPaymentRecord {
  id: string
  total_amount: number
  currency: string
  receipt_url: string
  reference_number: string | null
  created_at: string
  parent: { full_name: string } | { full_name: string }[] | null
}

interface FeeRecord {
  id: string
  month_year: string
  original_amount: number
  original_currency: string
  student: { full_name: string } | { full_name: string }[] | null
  teacher: { full_name: string } | { full_name: string }[] | null
}

export default function AdminFeeVerificationPage() {
  const [payments, setPayments] = useState<PendingPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [verifyingId, setVerifyingId] = useState<string | null>(null)
  const [adminId, setAdminId] = useState<string | null>(null)

  // Exchange Rates State
  const [usdToPkr, setUsdToPkr] = useState('278.50')
  const [gbpToPkr, setGbpToPkr] = useState('353.20')

  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Modal State for viewing receipt details
  const [activeReceiptUrl, setActiveReceiptUrl] = useState<string | null>(null)

  const fetchPendingPayments = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setAdminId(session.user.id)
      }

      // Fetch pending parent payments
      const { data: pps, error: ppErr } = await supabase
        .from('parent_payments')
        .select(`
          id,
          total_amount,
          currency,
          receipt_url,
          reference_number,
          created_at,
          parent:profiles!parent_id(full_name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true })

      if (ppErr) throw ppErr

      const loadedPending: PendingPayment[] = []
      const parentPayments = (pps as unknown as ParentPaymentRecord[]) || []

      for (const pp of parentPayments) {
        // Fetch child fee payments
        const { data: fees } = await supabase
          .from('fee_payments')
          .select(`
            id,
            month_year,
            original_amount,
            original_currency,
            student:profiles!student_id(full_name),
            teacher:profiles!teacher_id(full_name)
          `)
          .eq('parent_payment_id', pp.id)

        const formattedFees: FeePaymentAudit[] = []
        const feeRecords = (fees as unknown as FeeRecord[]) || []

        feeRecords.forEach((f) => {
          const studentProfile = Array.isArray(f.student) ? f.student[0] : f.student
          const teacherProfile = Array.isArray(f.teacher) ? f.teacher[0] : f.teacher
          
          // Calculate default PKR estimation
          let estimatedPkr = Number(f.original_amount)
          if (f.original_currency === 'USD') {
            estimatedPkr = Number(f.original_amount) * Number(usdToPkr || 278)
          } else if (f.original_currency === 'GBP') {
            estimatedPkr = Number(f.original_amount) * Number(gbpToPkr || 353)
          }

          formattedFees.push({
            id: f.id,
            student_name: studentProfile?.full_name || 'Unknown Student',
            teacher_name: teacherProfile?.full_name || 'Unknown Teacher',
            month_year: f.month_year,
            original_amount: Number(f.original_amount),
            original_currency: f.original_currency,
            pkr_amount: estimatedPkr.toFixed(2)
          })
        })

        const parentNameProfile = Array.isArray(pp.parent) ? pp.parent[0] : pp.parent

        loadedPending.push({
          id: pp.id,
          parent_name: parentNameProfile?.full_name || 'Unknown Parent',
          total_amount: Number(pp.total_amount),
          currency: pp.currency,
          receipt_url: pp.receipt_url,
          reference_number: pp.reference_number,
          created_at: pp.created_at,
          feePayments: formattedFees
        })
      }

      setPayments(loadedPending)
    } catch (err) {
      console.error('Error fetching pending payments:', err)
      setErrorMsg('Failed to load pending payments list.')
    } finally {
      setLoading(false)
    }
  }, [usdToPkr, gbpToPkr])

  useEffect(() => {
    fetchPendingPayments()
  }, [fetchPendingPayments])

  // Update PKR estimated amounts when currency exchange rates change
  const handleRecalculateEstimates = () => {
    setPayments(prev => prev.map(p => {
      const updatedFees = p.feePayments.map(fee => {
        let estimatedPkr = fee.original_amount
        if (fee.original_currency === 'USD') {
          estimatedPkr = fee.original_amount * Number(usdToPkr || 278)
        } else if (fee.original_currency === 'GBP') {
          estimatedPkr = fee.original_amount * Number(gbpToPkr || 353)
        }
        return { ...fee, pkr_amount: estimatedPkr.toFixed(2) }
      })
      return { ...p, feePayments: updatedFees }
    }))
  }

  const handlePkrChange = (paymentId: string, feeId: string, value: string) => {
    setPayments(prev => prev.map(p => {
      if (p.id !== paymentId) return p
      const updatedFees = p.feePayments.map(fee => 
        fee.id === feeId ? { ...fee, pkr_amount: value } : fee
      )
      return { ...p, feePayments: updatedFees }
    }))
  }

  const handleVerifyPayment = async (payment: PendingPayment) => {
    if (!adminId) return
    
    // Check if any manual pkr amounts are invalid
    const invalidFee = payment.feePayments.find(fee => !fee.pkr_amount || Number(fee.pkr_amount) <= 0)
    if (invalidFee) {
      setErrorMsg(`Invalid PKR amount for student ${invalidFee.student_name}.`)
      return
    }

    setVerifyingId(payment.id)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      // 1. Log Exchange Rates used
      const { error: rateErr } = await supabase
        .from('exchange_rate_log')
        .insert([{
          usd_to_pkr: Number(usdToPkr),
          gbp_to_pkr: Number(gbpToPkr),
          entered_by_admin_id: adminId
        }])
      
      if (rateErr) {
        console.warn('Logging exchange rate failed, continuing:', rateErr.message)
      }

      // 2. Verify each individual child fee log and assign its manual PKR value
      for (const fee of payment.feePayments) {
        const { error: feeUpdateErr } = await supabase
          .from('fee_payments')
          .update({
            pkr_amount: Number(fee.pkr_amount),
            status: 'verified',
            verified_at: new Date().toISOString()
          })
          .eq('id', fee.id)

        if (feeUpdateErr) throw feeUpdateErr
      }

      // 3. Update the parent payment header to verified
      const { error: ppUpdateErr } = await supabase
        .from('parent_payments')
        .update({
          status: 'verified',
          verified_at: new Date().toISOString()
        })
        .eq('id', payment.id)

      if (ppUpdateErr) throw ppUpdateErr

      setSuccessMsg(`Tuition fee verified and pro-rated split applied successfully for ${payment.parent_name}.`)
      setPayments(prev => prev.filter(p => p.id !== payment.id))
    } catch (err) {
      const error = err as Error
      console.error('Error verifying payment:', error)
      setErrorMsg(error.message || 'Verification failed.')
    } finally {
      setVerifyingId(null)
    }
  }

  const handleRejectPayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to reject this payment receipt?')) return

    setVerifyingId(paymentId)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      // 1. Reject parent payment
      const { error: ppErr } = await supabase
        .from('parent_payments')
        .update({ status: 'rejected' })
        .eq('id', paymentId)

      if (ppErr) throw ppErr

      // 2. Reject child fee payments
      const { error: feeErr } = await supabase
        .from('fee_payments')
        .update({ status: 'rejected' })
        .eq('parent_payment_id', paymentId)

      if (feeErr) throw feeErr

      setSuccessMsg('Payment receipt status marked as rejected.')
      setPayments(prev => prev.filter(p => p.id !== paymentId))
    } catch (err) {
      const error = err as Error
      console.error('Error rejecting payment:', error)
      setErrorMsg(error.message || 'Operation failed.')
    } finally {
      setVerifyingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Tuition Receipts Verification</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Review uploaded bank transfer sheets, specify exchange rate indexes, input manual PKR amounts per student, and audit splits.
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">
          {successMsg}
        </div>
      )}

      {/* Exchange Rate Controls */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-emerald-400 animate-spin-slow" /> Exchange Rates Base Indexes
        </h2>
        <div className="grid gap-4 sm:grid-cols-3 items-end">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">USD to PKR Index</label>
            <input
              type="number"
              step="0.01"
              value={usdToPkr}
              onChange={(e) => setUsdToPkr(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/25 py-2 px-3.5 text-sm text-white outline-none focus:border-emerald-500/50"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">GBP to PKR Index</label>
            <input
              type="number"
              step="0.01"
              value={gbpToPkr}
              onChange={(e) => setGbpToPkr(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/25 py-2 px-3.5 text-sm text-white outline-none focus:border-emerald-500/50"
            />
          </div>
          <button
            onClick={handleRecalculateEstimates}
            className="rounded-xl bg-zinc-800 hover:bg-zinc-700 py-2.5 px-4 text-sm font-semibold text-zinc-200 transition-colors"
          >
            Apply & Recalculate Estimates
          </button>
        </div>
      </div>

      {/* Pending Payments List */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-yellow-500" /> Pending verifications ({payments.length})
        </h2>

        {payments.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center text-zinc-500 text-sm">
            No pending tuition receipts found.
          </div>
        ) : (
          payments.map((payment) => {
            const dateStr = new Date(payment.created_at).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })

            return (
              <div key={payment.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md space-y-6">
                
                {/* Header Information */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-white/5">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white">{payment.parent_name}</h3>
                    <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      Submitted on {dateStr}
                    </p>
                    {payment.reference_number && (
                      <p className="text-xs text-zinc-500">Ref: <span className="font-mono text-zinc-400">{payment.reference_number}</span></p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right sm:text-left">
                      <p className="text-xs uppercase tracking-wider font-semibold text-zinc-400 leading-none mb-1">Total Paid</p>
                      <p className="text-xl font-black text-emerald-400 leading-none">{payment.currency} {payment.total_amount.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => setActiveReceiptUrl(payment.receipt_url)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 p-2 text-xs font-bold text-zinc-300 hover:bg-white/10 active:scale-[0.98] transition-all duration-150"
                    >
                      <Eye className="h-4 w-4" />
                      View Slip
                    </button>
                    <a
                      href={payment.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-300 hover:bg-white/10 transition-all duration-150"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                </div>

                {/* Audit splits / manual entries */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Audit Child Fee splits</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    {payment.feePayments.map((fee) => (
                      <div key={fee.id} className="rounded-xl border border-white/5 bg-black/20 p-4 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-bold text-white">{fee.student_name}</p>
                            <p className="text-xs text-zinc-400">Teacher: {fee.teacher_name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-zinc-500">Month: {fee.month_year}</p>
                            <p className="text-xs font-semibold text-white">Original: {fee.original_currency} {fee.original_amount.toFixed(2)}</p>
                          </div>
                        </div>

                        {/* Manual PKR Input */}
                        <div className="space-y-1">
                          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                            <DollarSign className="h-3.5 w-3.5 text-emerald-400" /> Verified PKR equivalent
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={fee.pkr_amount}
                            onChange={(e) => handlePkrChange(payment.id, fee.id, e.target.value)}
                            placeholder="Enter manual PKR value"
                            className="w-full rounded-xl border border-white/10 bg-black/25 py-2 px-3 text-sm text-white outline-none focus:border-emerald-500/50"
                          />
                        </div>

                        {/* Estimates guidance display */}
                        {Number(fee.pkr_amount) > 0 && (
                          <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-500 border-t border-white/5 pt-2">
                            <div>
                              <p>Teacher Share (90%)</p>
                              <p className="font-semibold text-zinc-300">PKR {(Number(fee.pkr_amount) * 0.9).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                            </div>
                            <div>
                              <p>Academy Fee (10%)</p>
                              <p className="font-semibold text-zinc-300">PKR {(Number(fee.pkr_amount) * 0.1).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verification Actions */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => handleRejectPayment(payment.id)}
                    disabled={verifyingId === payment.id}
                    className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/5 py-2 px-4 text-xs font-semibold text-red-400 hover:bg-red-500/10 active:scale-[0.98] transition-all duration-150"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject Slip
                  </button>
                  <button
                    onClick={() => handleVerifyPayment(payment)}
                    disabled={verifyingId === payment.id}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-2.5 px-5 text-xs font-semibold text-white transition-all duration-150 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98]"
                  >
                    {verifyingId === payment.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Verify & Credit Wallet
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Slip Preview Modal */}
      {activeReceiptUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Receipt Slip Preview</h3>
              <button
                onClick={() => setActiveReceiptUrl(null)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
            <div className="p-4 flex items-center justify-center max-h-[70vh] overflow-y-auto bg-black/50">
              {activeReceiptUrl.endsWith('.pdf') ? (
                <iframe src={activeReceiptUrl} className="w-full h-[60vh] border-0 rounded-xl" />
              ) : (
                <img src={activeReceiptUrl} alt="Receipt copy" className="max-w-full max-h-[60vh] rounded-xl object-contain shadow-md" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
