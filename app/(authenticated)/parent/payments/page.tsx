'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Calendar, Clock, Download, ChevronDown, ChevronUp, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

interface FeePayment {
  id: string
  student_name: string
  teacher_name: string
  month_year: string
  original_amount: number
  original_currency: string
  pkr_amount: number | null
  teacher_amount: number | null
  commission_amount: number | null
  status: string
}

interface ParentPayment {
  id: string
  created_at: string
  total_amount: number
  currency: string
  receipt_url: string
  reference_number: string | null
  status: string
  feePayments: FeePayment[]
  isExpanded?: boolean
}

interface ParentFeeRecord {
  id: string
  month_year: string
  original_amount: number
  original_currency: string
  pkr_amount: number | null
  teacher_amount: number | null
  commission_amount: number | null
  status: string
  student: { full_name: string } | { full_name: string }[] | null
  teacher: { full_name: string } | { full_name: string }[] | null
}

export default function ParentPaymentsHistoryPage() {
  const [payments, setPayments] = useState<ParentPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) return

        // 1. Fetch parent payments
        const { data: pps, error: ppError } = await supabase
          .from('parent_payments')
          .select('*')
          .eq('parent_id', session.user.id)
          .order('created_at', { ascending: false })

        if (ppError) throw ppError

        const loadedPayments: ParentPayment[] = []

        if (pps) {
          for (const pp of pps) {
            // 2. Fetch associated child fee splits
            const { data: fees } = await supabase
              .from('fee_payments')
              .select(`
                id,
                month_year,
                original_amount,
                original_currency,
                pkr_amount,
                teacher_amount,
                commission_amount,
                status,
                student:profiles!student_id(full_name),
                teacher:profiles!teacher_id(full_name)
              `)
              .eq('parent_payment_id', pp.id)

            const formattedFees: FeePayment[] = []
            if (fees) {
              const feeRecords = (fees as unknown as ParentFeeRecord[]) || []
              feeRecords.forEach((f) => {
                const studentProfile = Array.isArray(f.student) ? f.student[0] : f.student
                const teacherProfile = Array.isArray(f.teacher) ? f.teacher[0] : f.teacher
                formattedFees.push({
                  id: f.id,
                  student_name: studentProfile?.full_name || 'Unknown Student',
                  teacher_name: teacherProfile?.full_name || 'Unknown Teacher',
                  month_year: f.month_year,
                  original_amount: Number(f.original_amount),
                  original_currency: f.original_currency,
                  pkr_amount: f.pkr_amount ? Number(f.pkr_amount) : null,
                  teacher_amount: f.teacher_amount ? Number(f.teacher_amount) : null,
                  commission_amount: f.commission_amount ? Number(f.commission_amount) : null,
                  status: f.status
                })
              })
            }

            loadedPayments.push({
              id: pp.id,
              created_at: pp.created_at,
              total_amount: Number(pp.total_amount),
              currency: pp.currency,
              receipt_url: pp.receipt_url,
              reference_number: pp.reference_number,
              status: pp.status,
              feePayments: formattedFees,
              isExpanded: false
            })
          }
        }

        setPayments(loadedPayments)
      } catch (err) {
        console.error('Error fetching payments:', err)
        setErrorMsg('Failed to load transaction history.')
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [])

  const toggleExpand = (id: string) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, isExpanded: !p.isExpanded } : p))
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
        <h1 className="text-3xl font-bold tracking-tight text-white">Tuition Payments History</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Track verified receipts, verify exchange rates conversion, and see pro-rated commission/teacher allocations.
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {errorMsg}
        </div>
      )}

      {payments.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center text-zinc-500 text-sm">
          No payments recorded yet. Visit the payment gateway to submit tuition fees.
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => {
            const dateStr = new Date(payment.created_at).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })

            return (
              <div key={payment.id} className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden backdrop-blur-md">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4 border-b border-white/5 bg-black/10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      <Calendar className="h-3.5 w-3.5" />
                      {dateStr}
                    </div>
                    <div className="text-lg font-bold text-white flex items-center gap-2">
                      <span>{payment.currency} {payment.total_amount.toFixed(2)}</span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                        payment.status === 'verified' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        payment.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}>
                        {payment.status === 'verified' ? <CheckCircle2 className="h-3 w-3" /> :
                         payment.status === 'rejected' ? <XCircle className="h-3 w-3" /> :
                         <Clock className="h-3 w-3" />}
                        {payment.status}
                      </span>
                    </div>
                    {payment.reference_number && (
                      <p className="text-xs text-zinc-500">Ref: <span className="font-mono text-zinc-400">{payment.reference_number}</span></p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <a
                      href={payment.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2 px-4 text-xs font-bold text-zinc-300 hover:bg-white/10 active:scale-[0.98] transition-all duration-150"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download Receipt
                    </a>
                    {payment.feePayments.length > 0 && (
                      <button
                        onClick={() => toggleExpand(payment.id)}
                        className="inline-flex items-center justify-center rounded-xl bg-zinc-800 p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                      >
                        {payment.isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Splits Panel */}
                {payment.isExpanded && payment.feePayments.length > 0 && (
                  <div className="p-6 bg-black/25 space-y-4 border-t border-white/5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Child Allocation & Splits Summary</h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {payment.feePayments.map((fee) => (
                        <div key={fee.id} className="rounded-xl border border-white/5 bg-white/[0.01] p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-bold text-white">{fee.student_name}</p>
                              <p className="text-xs text-zinc-500">Taught by {fee.teacher_name}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-zinc-400">Month: {fee.month_year}</p>
                            </div>
                          </div>

                          <div className="border-t border-white/5 pt-3 grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <p className="text-zinc-500">Original Tuition</p>
                              <p className="font-semibold text-white">{fee.original_currency} {fee.original_amount.toFixed(2)}</p>
                            </div>
                            {fee.pkr_amount !== null && (
                              <div>
                                <p className="text-zinc-500">PKR Conversion</p>
                                <p className="font-semibold text-emerald-400">PKR {fee.pkr_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                              </div>
                            )}
                          </div>

                          {fee.pkr_amount !== null && fee.teacher_amount !== null && fee.commission_amount !== null && (
                            <div className="border-t border-white/5 pt-3 grid grid-cols-2 gap-2 text-[11px] text-zinc-400">
                              <div>
                                <p className="text-zinc-500">Teacher Wallet Payout (90%)</p>
                                <p className="font-semibold text-white">PKR {fee.teacher_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                              </div>
                              <div>
                                <p className="text-zinc-500">Platform Fee (10%)</p>
                                <p className="font-semibold text-white">PKR {fee.commission_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
