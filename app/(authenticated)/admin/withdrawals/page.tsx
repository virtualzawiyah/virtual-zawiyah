'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Wallet, XCircle, AlertCircle, Loader2, Calendar, User, Landmark, ShieldCheck } from 'lucide-react'

interface PendingWithdrawal {
  id: string
  amount: number
  bank_name: string
  account_iban: string
  created_at: string
  teacher_name: string
  teacher_id: string
}

interface WithdrawalRecord {
  id: string
  amount: number
  bank_name: string
  account_iban: string
  created_at: string
  teacher_id: string
  teacher: { full_name: string } | { full_name: string }[] | null
}

export default function AdminWithdrawalsPage() {
  const [requests, setRequests] = useState<PendingWithdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Settlement Dialog Modal State
  const [activeRequest, setActiveRequest] = useState<PendingWithdrawal | null>(null)
  const [transferRef, setTransferRef] = useState('')

  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const fetchPendingRequests = async () => {
    try {
      const { data: wds, error: wdsErr } = await supabase
        .from('withdrawal_requests')
        .select(`
          id,
          amount,
          bank_name,
          account_iban,
          created_at,
          teacher_id,
          teacher:profiles!teacher_id(full_name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true })

      if (wdsErr) throw wdsErr

      const formatted: PendingWithdrawal[] = []
      const records = (wds as unknown as WithdrawalRecord[]) || []

      records.forEach((w) => {
        const teacherProfile = Array.isArray(w.teacher) ? w.teacher[0] : w.teacher
        formatted.push({
          id: w.id,
          amount: Number(w.amount),
          bank_name: w.bank_name,
          account_iban: w.account_iban,
          created_at: w.created_at,
          teacher_name: teacherProfile?.full_name || 'Unknown Teacher',
          teacher_id: w.teacher_id
        })
      })

      setRequests(formatted)
    } catch (err) {
      console.error('Error fetching withdrawal requests:', err)
      setErrorMsg('Failed to query pending payouts requests.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingRequests()
  }, [])

  const handleConfirmTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeRequest || !transferRef.trim()) return

    setUpdatingId(activeRequest.id)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const { error } = await supabase
        .from('withdrawal_requests')
        .update({
          status: 'transferred',
          transfer_ref: transferRef.trim(),
          processed_at: new Date().toISOString()
        })
        .eq('id', activeRequest.id)

      if (error) throw error

      // Trigger 21: Teacher withdrawal approved
      try {
        await fetch('/api/notifications/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: activeRequest.teacher_id,
            role: 'teacher',
            title: 'Withdrawal Approved',
            message: `Your withdrawal request for ${activeRequest.amount} PKR has been approved`
          })
        })
      } catch (notifErr: any) {
        console.error('Failed to send notification for withdrawal approval (non-fatal):', notifErr.message)
      }

      setSuccessMsg(`Payout of PKR ${activeRequest.amount.toLocaleString()} settled successfully.`)
      setRequests(prev => prev.filter(r => r.id !== activeRequest.id))
      setActiveRequest(null)
      setTransferRef('')
    } catch (err) {
      const error = err as Error
      console.error('Error settling transfer:', error)
      setErrorMsg(error.message || 'Settlement update failed.')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleRejectRequest = async (request: PendingWithdrawal) => {
    if (!confirm(`Are you sure you want to reject the withdrawal request for PKR ${request.amount.toLocaleString()}? This will refund their wallet.`)) return

    setUpdatingId(request.id)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const { error } = await supabase
        .from('withdrawal_requests')
        .update({
          status: 'rejected',
          processed_at: new Date().toISOString()
        })
        .eq('id', request.id)

      if (error) throw error

      // Trigger 21: Teacher withdrawal rejected
      try {
        await fetch('/api/notifications/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: request.teacher_id,
            role: 'teacher',
            title: 'Withdrawal Rejected',
            message: `Your withdrawal request for ${request.amount} PKR has been rejected`
          })
        })
      } catch (notifErr: any) {
        console.error('Failed to send notification for withdrawal rejection (non-fatal):', notifErr.message)
      }

      setSuccessMsg('Withdrawal request rejected. Funds refunded to teacher wallet.')
      setRequests(prev => prev.filter(r => r.id !== request.id))
    } catch (err) {
      const error = err as Error
      console.error('Error rejecting withdrawal:', error)
      setErrorMsg(error.message || 'Operation failed.')
    } finally {
      setUpdatingId(null)
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
        <h1 className="text-3xl font-bold tracking-tight text-white">Withdrawal Settlements Console</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Process pending payout requests submitted by teachers. Mark transfers as completed or reject requests.
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

      {/* Requests table */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Wallet className="h-5 w-5 text-yellow-500 animate-pulse" /> Pending Settlements ({requests.length})
        </h2>

        {requests.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 text-sm">
            No pending withdrawal requests found in the database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  <th className="pb-3 pr-4">Teacher Name</th>
                  <th className="pb-3 px-4">Bank & IBAN</th>
                  <th className="pb-3 px-4 text-right">Requested Amount</th>
                  <th className="pb-3 px-4">Request Date</th>
                  <th className="pb-3 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-zinc-300">
                {requests.map((req) => {
                  const reqDate = new Date(req.created_at).toLocaleDateString()
                  return (
                    <tr key={req.id} className="hover:bg-white/[0.01]">
                      <td className="py-4 pr-4 font-semibold text-white">
                        <div className="flex items-center gap-1.5">
                          <User className="h-4 w-4 text-zinc-500" />
                          {req.teacher_name}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <span className="font-medium text-white flex items-center gap-1 text-xs">
                            <Landmark className="h-3.5 w-3.5 text-zinc-500" />
                            {req.bank_name}
                          </span>
                          <span className="block font-mono text-[11px] text-zinc-400">{req.account_iban}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right font-black text-emerald-400">
                        PKR {req.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-4 text-zinc-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {reqDate}
                        </div>
                      </td>
                      <td className="py-4 pl-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            disabled={updatingId === req.id}
                            onClick={() => handleRejectRequest(req)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/5 py-1.5 px-3 text-xs font-semibold text-red-400 hover:bg-red-500/10 active:scale-[0.98] transition-all duration-150"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Reject
                          </button>
                          <button
                            disabled={updatingId === req.id}
                            onClick={() => setActiveRequest(req)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 py-1.5 px-3 text-xs font-bold text-white hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] transition-all duration-150"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Confirm Transfer
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation modal for bank transfer reference */}
      {activeRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" /> Settle Bank Transfer
            </h3>
            
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              Confirm transfer of <strong className="text-white">PKR {activeRequest.amount.toLocaleString()}</strong> to <strong className="text-white">{activeRequest.teacher_name}</strong> ({activeRequest.bank_name}).
            </p>

            <form onSubmit={handleConfirmTransfer} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Bank Settlement Reference / TXN ID</label>
                <input
                  type="text"
                  required
                  value={transferRef}
                  onChange={(e) => setTransferRef(e.target.value)}
                  placeholder="e.g. FT26093782163"
                  className="w-full rounded-xl border border-white/10 bg-black/25 py-2.5 px-3.5 text-sm text-white outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setActiveRequest(null); setTransferRef(''); }}
                  className="rounded-xl border border-white/10 bg-white/5 py-2 px-4 text-xs font-semibold text-zinc-300 hover:bg-white/10 active:scale-[0.98] transition-all duration-150"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingId === activeRequest.id}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-2 px-4 text-xs font-semibold text-white transition-all duration-150 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98]"
                >
                  {updatingId === activeRequest.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-3.5 w-3.5" />
                  )}
                  Mark Settled
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
