'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { CreditCard, Upload, Calendar, DollarSign, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface AssignedTeacher {
  teacher_id: string
  teacher_name: string
}

export default function StudentFeePaymentPage() {
  const [studentId, setStudentId] = useState<string | null>(null)
  const [assignedTeachers, setAssignedTeachers] = useState<AssignedTeacher[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form State
  const [monthYear, setMonthYear] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<'USD' | 'GBP' | 'PKR'>('USD')
  const [teacherId, setTeacherId] = useState('')
  const [refNumber, setRefNumber] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    const fetchSessionAndTeachers = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) return
        setStudentId(session.user.id)

        // Fetch active teachers assigned to this student
        const { data: assigns, error: assignsErr } = await supabase
          .from('teacher_student_assignments')
          .select(`
            teacher_id,
            teacher:profiles!teacher_id(full_name)
          `)
          .eq('student_id', session.user.id)
          .eq('is_active', true)

        if (assignsErr) throw assignsErr

        interface QueryAssign {
          teacher_id: string
          teacher: { full_name: string } | { full_name: string }[] | null
        }

        if (assigns) {
          const list = (assigns as unknown as QueryAssign[]).map(a => {
            const teacherProfile = Array.isArray(a.teacher) ? a.teacher[0] : a.teacher
            return {
              teacher_id: a.teacher_id,
              teacher_name: teacherProfile?.full_name || 'Unknown Teacher'
            }
          })
          setAssignedTeachers(list)
          if (list.length > 0) {
            setTeacherId(list[0].teacher_id)
          }
        }
      } catch (err) {
        console.error('Error loading page details:', err)
        setErrorMsg('Failed to load active teacher assignments.')
      } finally {
        setLoading(false)
      }
    }

    fetchSessionAndTeachers()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentId || !teacherId) return
    if (!amount || Number(amount) <= 0) {
      setErrorMsg('Please enter a valid payment amount.')
      return
    }
    if (!file) {
      setErrorMsg('Please upload a bank transfer receipt file.')
      return
    }

    setSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      // 1. Upload receipt to storage bucket 'receipts'
      const fileExt = file.name.split('.').pop()
      const fileName = `receipt-${studentId}-${Date.now()}.${fileExt}`
      const filePath = `${studentId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, file)

      if (uploadError) throw new Error(`Failed to upload receipt slip: ${uploadError.message}`)

      // Retrieve public URL of the uploaded receipt
      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(filePath)

      // 2. Insert into parent_payments (which acts as main transaction header)
      const { data: parentPayment, error: ppError } = await supabase
        .from('parent_payments')
        .insert([{
          parent_id: studentId,
          total_amount: Number(amount),
          currency: currency,
          receipt_url: publicUrl,
          reference_number: refNumber.trim() || null,
          status: 'pending'
        }])
        .select()

      if (ppError) throw ppError
      if (!parentPayment || parentPayment.length === 0) {
        throw new Error('Failed to record payment transaction.')
      }

      const parentPaymentId = parentPayment[0].id

      // 3. Insert into fee_payments (which maps this payment to the specific child student & teacher slot)
      const { error: feeError } = await supabase
        .from('fee_payments')
        .insert([{
          parent_payment_id: parentPaymentId,
          student_id: studentId,
          teacher_id: teacherId,
          month_year: monthYear,
          original_currency: currency,
          original_amount: Number(amount),
          status: 'pending',
          receipt_url: publicUrl,
          reference_number: refNumber.trim() || null
        }])

      if (feeError) {
        // Cleanup parent_payment to keep database clean
        await supabase.from('parent_payments').delete().eq('id', parentPaymentId)
        throw feeError
      }

      setSuccessMsg('Your fee payment receipt has been submitted and is pending verification.')
      setAmount('')
      setRefNumber('')
      setFile(null)
    } catch (err) {
      const error = err as Error
      console.error('Error submitting payment:', error)
      setErrorMsg(error.message || 'Payment submission failed.')
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
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Fee Payment Gateway</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Upload manual bank transfer details and receipt image to submit your monthly tuition fee.
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
          <CheckCircle className="h-5 w-5 shrink-0" />
          {successMsg}
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-emerald-400" /> Submit Tuition Payment
        </h2>

        <form onSubmit={handleSubmitPayment} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Target Month */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Billing Month
              </label>
              <input
                type="month"
                required
                value={monthYear}
                onChange={(e) => setMonthYear(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/25 py-2.5 px-3.5 text-sm text-white outline-none focus:border-emerald-500/50"
              />
            </div>

            {/* Teacher Selector */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Billing Teacher
              </label>
              <select
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-black/25 py-2.5 px-3.5 text-sm text-white outline-none focus:border-emerald-500/50"
              >
                {assignedTeachers.length === 0 ? (
                  <option value="" className="bg-slate-900">No assigned teachers</option>
                ) : (
                  assignedTeachers.map((t) => (
                    <option key={t.teacher_id} value={t.teacher_id} className="bg-slate-900">
                      {t.teacher_name}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Currency Selector */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Payment Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as 'USD' | 'GBP' | 'PKR')}
                className="w-full rounded-xl border border-white/10 bg-black/25 py-2.5 px-3.5 text-sm text-white outline-none focus:border-emerald-500/50"
              >
                <option value="USD" className="bg-slate-900">USD ($)</option>
                <option value="GBP" className="bg-slate-900">GBP (£)</option>
                <option value="PKR" className="bg-slate-900">PKR (Rs)</option>
              </select>
            </div>

            {/* Amount input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5" /> Paid Amount
              </label>
              <input
                type="number"
                step="0.01"
                required
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 50.00"
                className="w-full rounded-xl border border-white/10 bg-black/25 py-2.5 px-3.5 text-sm text-white outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* Reference number */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Bank Transaction / Reference Number (Optional)
            </label>
            <input
              type="text"
              value={refNumber}
              onChange={(e) => setRefNumber(e.target.value)}
              placeholder="e.g. TXN98172635"
              className="w-full rounded-xl border border-white/10 bg-black/25 py-2.5 px-3.5 text-sm text-white outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Receipt Upload File Area */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
              <Upload className="h-3.5 w-3.5" /> Transfer Receipt Copy (Image or PDF)
            </label>
            <div className="flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl bg-black/10 py-6 px-4 hover:border-emerald-500/30 transition-colors cursor-pointer relative group">
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                required
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className="h-8 w-8 text-zinc-500 group-hover:text-emerald-400 transition-colors mb-2" />
              <p className="text-sm font-semibold text-white">
                {file ? file.name : 'Click to select or drag and drop file'}
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Supported formats: PNG, JPG, JPEG, PDF (max 5MB)
              </p>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || assignedTeachers.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 text-sm font-semibold text-white transition-all duration-150 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Submitting Payment...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5" />
                Submit Payment Receipt
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
