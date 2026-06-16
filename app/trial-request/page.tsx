'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import PublicNavbar from '@/components/PublicNavbar'
import PublicFooter from '@/components/PublicFooter'
import { supabase } from '@/lib/supabaseClient'
import { CheckCircle, Calendar, Mail, User, Users, Loader2, ArrowRight } from 'lucide-react'

interface Teacher {
  id: string
  full_name: string
}

export default function TrialRequestPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loadingTeachers, setLoadingTeachers] = useState(true)

  // Form states
  const [studentName, setStudentName] = useState('')
  const [parentEmail, setParentEmail] = useState('')
  const [requestedDate, setRequestedDate] = useState('')
  const [teacherId, setTeacherId] = useState('')
  
  // Submission & Validation States
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    async function loadTeachers() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('role', 'teacher')
        
        if (error) throw error
        if (data) {
          setTeachers(data)
        }
      } catch (err) {
        console.error('Error fetching teachers for trial:', err)
      } finally {
        setLoadingTeachers(false)
      }
    }
    loadTeachers()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg('')

    if (!studentName || !parentEmail || !requestedDate) {
      setErrorMsg('Please fill in all required fields.')
      setIsSubmitting(false)
      return
    }

    try {
      const { error } = await supabase
        .from('trial_requests')
        .insert({
          student_name: studentName,
          parent_email: parentEmail,
          requested_date: requestedDate,
          teacher_id: teacherId || null,
          status: 'pending'
        })

      if (error) throw error
      setSuccess(true)
    } catch (err) {
      console.error('Trial request error:', err)
      const errorMsg = err instanceof Error ? err.message : 'An error occurred while submitting your trial request. Please try again.'
      setErrorMsg(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const today = new Date()
    today.setDate(today.getDate() + 1)
    return today.toISOString().split('T')[0]
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <PublicNavbar />

      <main className="flex-grow pt-24 pb-16 flex items-center justify-center">
        <div className="mx-auto max-w-lg w-full px-4 sm:px-6">
          
          {/* Breadcrumbs */}
          <nav className="flex justify-center mb-6 text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">
            <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
            <span className="mx-2 text-zinc-700">/</span>
            <span className="text-emerald-400">Trial Request</span>
          </nav>

          {success ? (
            /* Success State */
            <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/60 p-8 text-center backdrop-blur-md shadow-xl shadow-emerald-950/5">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mb-6">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold text-white mb-3">Trial Reserved Successfully!</h2>
              <p className="text-xs text-zinc-400 leading-relaxed mb-6 font-sans">
                Jazakallah khair. Your request for a 3-day free trial on <strong className="text-emerald-400">{requestedDate}</strong> has been received. We will contact you at <strong className="text-white">{parentEmail}</strong> shortly to coordinate timings and set up your student login credentials.
              </p>
              <Link
                href="/"
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow hover:bg-emerald-500 active:scale-[0.98] transition-all"
              >
                Back to Home Page
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            /* Form Panel */
            <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 sm:p-8 backdrop-blur-md shadow-xl">
              
              <div className="text-center mb-6">
                <h1 className="text-2xl font-extrabold tracking-tight font-sans bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent mb-2">
                  Book a Free Trial
                </h1>
                <p className="text-xs text-zinc-450 font-sans">
                  Experience a 3-day class evaluation session with a scholar before enrolling.
                </p>
              </div>

              {errorMsg && (
                <div className="mb-5 p-4 rounded-xl bg-rose-500/15 border border-rose-500/25 text-rose-300 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Student Name */}
                <div>
                  <label htmlFor="studentName" className="block text-xs font-bold text-zinc-300 mb-2">
                    Student Full Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-500">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      id="studentName"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="e.g. Muhammad Abdullah"
                      required
                      className="w-full rounded-xl border border-white/10 bg-slate-950 pl-10 pr-4 py-3 text-xs text-slate-100 placeholder-zinc-650 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                    />
                  </div>
                </div>

                {/* Parent Email */}
                <div>
                  <label htmlFor="parentEmail" className="block text-xs font-bold text-zinc-300 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-500">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      id="parentEmail"
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full rounded-xl border border-white/10 bg-slate-950 pl-10 pr-4 py-3 text-xs text-slate-100 placeholder-zinc-650 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                    />
                  </div>
                </div>

                {/* Requested Date */}
                <div>
                  <label htmlFor="requestedDate" className="block text-xs font-bold text-zinc-300 mb-2">
                    Preferred Starting Date *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-500">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <input
                      type="date"
                      id="requestedDate"
                      value={requestedDate}
                      onChange={(e) => setRequestedDate(e.target.value)}
                      min={getMinDate()}
                      required
                      className="w-full rounded-xl border border-white/10 bg-slate-950 pl-10 pr-4 py-3 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                    />
                  </div>
                </div>

                {/* Preferred Teacher */}
                <div>
                  <label htmlFor="teacher" className="block text-xs font-bold text-zinc-300 mb-2">
                    Preferred Teacher (optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-500">
                      <Users className="h-4 w-4" />
                    </div>
                    <select
                      id="teacher"
                      value={teacherId}
                      onChange={(e) => setTeacherId(e.target.value)}
                      disabled={loadingTeachers}
                      className="w-full rounded-xl border border-white/10 bg-slate-950 pl-10 pr-4 py-3 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 disabled:opacity-55"
                    >
                      <option value="">
                        {loadingTeachers ? 'Loading teachers list...' : 'No preference'}
                      </option>
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>{t.full_name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-xs font-bold text-white shadow shadow-emerald-500/10 hover:bg-emerald-500 active:scale-[0.98] transition-all disabled:opacity-55 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      Booking Free Trial...
                    </>
                  ) : (
                    <>
                      Book Free Trial
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <p className="text-[10px] text-zinc-500 text-center leading-relaxed mt-4">
                  No payment method required. Booking this trial creates a request in our scheduling queues. We will contact you via email shortly.
                </p>

              </form>
            </div>
          )}

        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
