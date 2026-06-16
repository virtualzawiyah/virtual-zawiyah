'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Wallet, Landmark, Send, Clock, ChevronRight, Loader2, CheckCircle2, XCircle, ArrowUpRight, ArrowDownLeft, AlertCircle } from 'lucide-react'

interface WalletInfo {
  total_earned: number
  available_balance: number
  total_withdrawn: number
  currency: string
}

interface WalletTransaction {
  id: string
  type: 'fee_credit' | 'withdrawal_debit' | 'adjustment'
  amount: number
  balance_after: number
  description: string
  created_at: string
}

interface WithdrawalRequest {
  id: string
  amount: number
  bank_name: string
  account_iban: string
  status: 'pending' | 'transferred' | 'rejected'
  transfer_ref: string | null
  created_at: string
}

export default function TeacherWalletPage() {
  const [wallet, setWallet] = useState<WalletInfo | null>(null)
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([])
  const [teacherId, setTeacherId] = useState<string | null>(null)
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Withdrawal Form State
  const [amount, setAmount] = useState('')
  const [bankName, setBankName] = useState('')
  const [iban, setIban] = useState('')

  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const loadWalletData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return
      const tId = session.user.id
      setTeacherId(tId)

      // 1. Fetch Teacher Wallet Info
      const { data: walletData, error: walletErr } = await supabase
        .from('teacher_wallet')
        .select('*')
        .eq('teacher_id', tId)
        .single()

      if (walletErr) {
        if (walletErr.code === 'PGRST116') {
          // Wallet row doesn't exist yet (created on first verified payment)
          setWallet({
            total_earned: 0,
            available_balance: 0,
            total_withdrawn: 0,
            currency: 'PKR'
          })
        } else {
          throw walletErr
        }
      } else if (walletData) {
        setWallet({
          total_earned: Number(walletData.total_earned),
          available_balance: Number(walletData.available_balance),
          total_withdrawn: Number(walletData.total_withdrawn),
          currency: walletData.currency
        })
      }

      // 2. Fetch Wallet Transactions Ledger
      const { data: txs, error: txsErr } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('teacher_id', tId)
        .order('created_at', { ascending: false })

      if (txsErr) throw txsErr
      setTransactions((txs as unknown as WalletTransaction[]) || [])

      // 3. Fetch Withdrawal Requests history
      const { data: wds, error: wdsErr } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('teacher_id', tId)
        .order('created_at', { ascending: false })

      if (wdsErr) throw wdsErr
      setWithdrawals((wds as unknown as WithdrawalRequest[]) || [])
    } catch (err) {
      console.error('Error fetching wallet data:', err)
      setErrorMsg('Failed to load wallet dashboard metrics.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWalletData()
  }, [])

  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teacherId || !wallet) return
    
    const reqAmount = Number(amount)
    if (isNaN(reqAmount) || reqAmount <= 0) {
      setErrorMsg('Please specify a positive withdrawal amount.')
      return
    }

    if (reqAmount > wallet.available_balance) {
      setErrorMsg('Requested payout amount exceeds your available balance.')
      return
    }

    if (!bankName.trim() || !iban.trim()) {
      setErrorMsg('Please supply valid bank details and account IBAN.')
      return
    }

    setSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      // Insert withdrawal request
      const { error: reqError } = await supabase
        .from('withdrawal_requests')
        .insert([{
          teacher_id: teacherId,
          amount: reqAmount,
          bank_name: bankName.trim(),
          account_iban: iban.trim().toUpperCase(),
          status: 'pending'
        }])

      if (reqError) throw reqError

      setSuccessMsg(`Withdrawal request for PKR ${reqAmount.toLocaleString()} has been submitted.`)
      setAmount('')
      setBankName('')
      setIban('')

      // Reload wallet details (trigger updates available balance since database trigger deducts it)
      await loadWalletData()
    } catch (err) {
      console.error('Error creating withdrawal request:', err)
      setErrorMsg(err instanceof Error ? err.message : 'Withdrawal request failed.')
    } finally {
      setSubmitting(false)
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
        <h1 className="text-3xl font-bold tracking-tight text-white">Teacher Wallet Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Monitor your earnings balance ledger, submit withdrawal payout requests, and view settlements.
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Financial Metrics Cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        {/* Available balance card */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 backdrop-blur-md relative overflow-hidden group shadow-lg shadow-emerald-500/5">
          <div className="absolute top-4 right-4 h-10 w-10 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
            <Wallet className="h-5 w-5" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400/80">Available Payout Balance</p>
          <h3 className="mt-4 text-3xl font-black text-white">
            PKR {wallet?.available_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-zinc-400 mt-2">Instantly withdrawable to bank account</p>
        </div>

        {/* Lifetime Earnings */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-4 right-4 h-10 w-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
            <ArrowUpRight className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Lifetime Gross Earnings</p>
          <h3 className="mt-4 text-3xl font-black text-white">
            PKR {wallet?.total_earned.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-zinc-500 mt-2">Includes both paid out and pending funds</p>
        </div>

        {/* Total Withdrawn */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-4 right-4 h-10 w-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
            <ArrowDownLeft className="h-5 w-5 text-zinc-400" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Settled / Withdrawn</p>
          <h3 className="mt-4 text-3xl font-black text-white">
            PKR {wallet?.total_withdrawn.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-zinc-500 mt-2">Transferred to bank IBAN account</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Request payout form */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md h-fit space-y-4">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Landmark className="h-5 w-5 text-emerald-400" /> Payout Request
          </h2>

          <form onSubmit={handleWithdrawalRequest} className="space-y-4">
            {/* Amount (PKR) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Withdrawal Amount (PKR)</label>
              <input
                type="number"
                required
                min="1"
                max={wallet?.available_balance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 15000"
                className="w-full rounded-xl border border-white/10 bg-black/25 py-2.5 px-3.5 text-sm text-white outline-none focus:border-emerald-500/50"
              />
            </div>

            {/* Bank Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Bank Name</label>
              <input
                type="text"
                required
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. Meezan Bank / Alfalah"
                className="w-full rounded-xl border border-white/10 bg-black/25 py-2.5 px-3.5 text-sm text-white outline-none focus:border-emerald-500/50"
              />
            </div>

            {/* Account IBAN */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Account IBAN / Number</label>
              <input
                type="text"
                required
                value={iban}
                onChange={(e) => setIban(e.target.value)}
                placeholder="PK24MEZN0000000123456789"
                className="w-full rounded-xl border border-white/10 bg-black/25 py-2.5 px-3.5 text-sm text-white outline-none focus:border-emerald-500/50 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !wallet || wallet.available_balance <= 0}
              className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-semibold text-white transition-all duration-150 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting Request...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Withdrawal
                </>
              )}
            </button>
          </form>
        </div>

        {/* Ledger logs */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ChevronRight className="h-5 w-5 text-emerald-400" /> Wallet Statements & History
          </h2>

          {/* Past Withdrawals */}
          {withdrawals.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-zinc-500" /> Payout Requests History
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {withdrawals.map((w) => {
                  const reqDate = new Date(w.created_at).toLocaleDateString()
                  return (
                    <div key={w.id} className="rounded-xl border border-white/5 bg-black/20 p-3 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-white">PKR {Number(w.amount).toLocaleString()}</p>
                        <p className="text-[10px] text-zinc-500">{w.bank_name} - {reqDate}</p>
                        {w.transfer_ref && (
                          <p className="text-[10px] text-zinc-400 italic">Ref: {w.transfer_ref}</p>
                        )}
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        w.status === 'transferred' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' :
                        w.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/15' :
                        'bg-yellow-500/10 text-yellow-400 border border-yellow-500/15'
                      }`}>
                        {w.status === 'transferred' ? <CheckCircle2 className="h-3 w-3" /> :
                         w.status === 'rejected' ? <XCircle className="h-3 w-3" /> :
                         <Clock className="h-3 w-3" />}
                        {w.status}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Transactions Ledger */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Wallet className="h-4 w-4 text-zinc-500" /> Wallet Transactions Ledger
            </h3>
            {transactions.length === 0 ? (
              <p className="text-center py-6 text-zinc-500 text-xs">No transactions recorded yet.</p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-white/5 bg-black/10">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-white/[0.01]">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                      <th className="py-2.5 px-3 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs text-zinc-300">
                    {transactions.map((tx) => {
                      const txDate = new Date(tx.created_at).toLocaleDateString()
                      const isCredit = tx.type === 'fee_credit' || (tx.type === 'adjustment' && Number(tx.amount) > 0)
                      return (
                        <tr key={tx.id} className="hover:bg-white/[0.01]">
                          <td className="py-3 px-3 text-zinc-500">{txDate}</td>
                          <td className="py-3 px-3">
                            <span className="font-semibold block text-white">{tx.description}</span>
                            <span className={`inline-block text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold mt-1 ${
                              tx.type === 'fee_credit' ? 'bg-emerald-500/10 text-emerald-400' :
                              tx.type === 'withdrawal_debit' ? 'bg-zinc-800 text-zinc-400' :
                              'bg-yellow-500/10 text-yellow-400'
                            }`}>{tx.type.replace('_', ' ')}</span>
                          </td>
                          <td className={`py-3 px-3 text-right font-bold ${isCredit ? 'text-emerald-400' : 'text-zinc-400'}`}>
                            {isCredit ? '+' : '-'} PKR {Math.abs(Number(tx.amount)).toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-zinc-400">
                            PKR {Number(tx.balance_after).toLocaleString()}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
