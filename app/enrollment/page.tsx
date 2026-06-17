'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import PublicNavbar from '@/components/PublicNavbar'
import PublicFooter from '@/components/PublicFooter'
import { supabase } from '@/lib/supabaseClient'
import { CheckCircle2, ChevronRight, Loader2, ArrowRight, User, Mail, Calendar, Users, Globe, Shield } from 'lucide-react'

interface Teacher {
  id: string
  full_name: string
}

type TabType = 'trial' | 'admission'

export default function EnrollmentPage() {
  const [activeTab, setActiveTab] = useState<TabType>('admission')
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loadingTeachers, setLoadingTeachers] = useState(true)

  // Form fields (Shared / Trial & Admission)
  const [studentName, setStudentName] = useState('')
  const [parentEmail, setParentEmail] = useState('')
  const [preferredTeacherId, setPreferredTeacherId] = useState('')
  
  // Trial-specific fields
  const [requestedDate, setRequestedDate] = useState('')
  const [trialCourse, setTrialCourse] = useState('')

  // Admission-specific fields
  const [studentAge, setStudentAge] = useState('')
  const [studentGender, setStudentGender] = useState('')
  const [parentName, setParentName] = useState('')
  const [parentWhatsapp, setParentWhatsapp] = useState('')
  const [guardianRelationship, setGuardianRelationship] = useState('')
  const [studentWhatsapp, setStudentWhatsapp] = useState('')
  const [stateProvince, setStateProvince] = useState('')
  const [country, setCountry] = useState('')
  const [courseInterest, setCourseInterest] = useState('')
  const [timezone, setTimezone] = useState('UTC')
  const [additionalNotes, setAdditionalNotes] = useState('')
  
  // Submission & Validation States
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Detect default tab from URL parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const tabParam = params.get('tab')
      if (tabParam === 'trial') {
        setActiveTab('trial')
      } else {
        setActiveTab('admission')
      }
    }
  }, [])

  // Load teachers and detect timezone
  useEffect(() => {
    async function loadData() {
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
        console.error('Error fetching teachers:', err)
      } finally {
        setLoadingTeachers(false)
      }
    }

    loadData()

    // Detect browser timezone
    try {
      const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone
      if (detectedTz) {
        setTimezone(detectedTz)
      }
    } catch (e) {
      console.error('Failed to detect timezone:', e)
    }
  }, [])

  const handleAdmissionSubmit = async () => {
    if (!studentName || !parentName || !parentEmail || !parentWhatsapp || !courseInterest) {
      throw new Error('Please fill in all required fields.')
    }

    // Format prepended message
    const prependedMessage = [
      `[Timezone: ${timezone}]`,
      `[Gender: ${studentGender || 'N/A'}]`,
      `[Relationship: ${guardianRelationship || 'N/A'}]`,
      `[State/Province: ${stateProvince || 'N/A'}]`,
      `[Country: ${country || 'N/A'}]`,
      `[Student WhatsApp: ${studentWhatsapp || 'N/A'}]`,
      `Notes: ${additionalNotes || 'None'}`
    ].join(' | ')

    const { error } = await supabase
      .from('enrollment_requests')
      .insert({
        student_name: studentName,
        student_age: studentAge ? parseInt(studentAge, 10) : null,
        parent_name: parentName,
        parent_email: parentEmail,
        parent_whatsapp: parentWhatsapp,
        course_interest: courseInterest,
        preferred_teacher_id: preferredTeacherId || null,
        message: prependedMessage,
        status: 'pending'
      })

    if (error) throw error
  }

  const handleTrialSubmit = async () => {
    if (!studentName || !parentEmail || !requestedDate || !trialCourse) {
      throw new Error('Please fill in all required fields.')
    }

    const feedbackNotes = `Course interest: ${trialCourse} | Captured client timezone: ${timezone}`

    const { error } = await supabase
      .from('trial_requests')
      .insert({
        student_name: studentName,
        parent_email: parentEmail,
        requested_date: requestedDate,
        teacher_id: preferredTeacherId || null,
        feedback: feedbackNotes,
        status: 'pending'
      })

    if (error) throw error
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')

    try {
      if (activeTab === 'admission') {
        await handleAdmissionSubmit()
      } else {
        await handleTrialSubmit()
      }
      setSubmitSuccess(true)
    } catch (err) {
      console.error('Submission error:', err)
      const errorMsg = err instanceof Error ? err.message : 'An error occurred during submission. Please try again.'
      setErrorMessage(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getMinDate = () => {
    const today = new Date()
    today.setDate(today.getDate() + 1)
    return today.toISOString().split('T')[0]
  }

  const countriesList = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 'Pakistan', 
    'Saudi Arabia', 'United Arab Emirates', 'Qatar', 'Kuwait', 'Bahrain', 
    'Oman', 'Germany', 'France', 'Norway', 'Sweden', 'Malaysia', 'Singapore'
  ]

  const coursesList = [
    'Quran Reading with Tajweed',
    'Applied Tajweed (Basic)',
    'Quran Memorization (Hifz)',
    '40 Hadith Memorization',
    'Quran Translation',
    'Arabic Grammar (Sarf & Nahw)',
    'Dars-e-Nizami — Classical Islamic Curriculum',
    'Tajweed — 2-Year Structured Group Program'
  ]

  const timezonesList = [
    'UTC', 'Asia/Karachi', 'Asia/Riyadh', 'Asia/Dubai', 'Europe/London', 
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 
    'Australia/Sydney', 'Australia/Melbourne'
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-x-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 inset-x-0 h-[600px] pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full bg-grid-pattern opacity-[0.25]" />
        <div className="absolute top-[12%] left-[10%] w-[350px] h-[350px] rounded-full bg-emerald-500/[0.06] blur-[130px]" />
      </div>

      <PublicNavbar />

      <main className="flex-grow pt-36 pb-24 relative z-10 animate-fade-in-up">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">

          {/* Breadcrumbs */}
          <nav className="flex mb-8 text-[10px] text-zinc-550 uppercase tracking-widest font-semibold">
            <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
            <span className="mx-2 text-zinc-800">/</span>
            <span className="text-emerald-450">Admissions Portal</span>
          </nav>

          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#c19b4c] bg-[#c19b4c]/10 border border-[#c19b4c]/20 px-3.5 py-1.5 rounded-full shadow">
              Student Intake
            </span>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight font-serif bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
              Admissions & Trial Registrations
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-sans font-light">
              Submit your request below. Our support team will coordinate details and match you with a teacher within 24 hours.
            </p>
          </div>

          {submitSuccess ? (
            /* Success State */
            <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/20 p-8 sm:p-12 text-center backdrop-blur-md max-w-2xl mx-auto shadow-2xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mb-6 border border-emerald-500/25">
                <CheckCircle2 className="h-8 w-8 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Request Submitted Successfully!</h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-8 font-sans font-light">
                Jazakallah khair. Your request has been logged successfully. Our coordinators will contact you at <strong className="text-[#c19b4c]">{parentEmail}</strong> or via WhatsApp to configure login credentials and schedule trial sessions.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#c19b4c] hover:bg-[#b08b3e] text-slate-950 py-3.5 px-6 text-xs font-bold shadow active:scale-[0.98] transition-all"
                >
                  Return to Home
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="https://wa.me/923355777312"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 py-3.5 px-6 text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 transition-all active:scale-[0.98]"
                >
                  Message Support on WhatsApp
                </a>
              </div>
            </div>
          ) : (
            /* Main Form */
            <div className="rounded-2xl border border-white/5 bg-slate-900/10 p-6 sm:p-10 backdrop-blur-md shadow-2xl space-y-10">
              
              {/* Tab Switcher */}
              <div className="flex p-1 rounded-2xl bg-slate-950 border border-white/5 shadow-inner max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('admission');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                    activeTab === 'admission'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-zinc-500 hover:text-zinc-350'
                  }`}
                >
                  Full Admission
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('trial');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                    activeTab === 'trial'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-zinc-500 hover:text-zinc-350'
                  }`}
                >
                  3-Day Free Trial
                </button>
              </div>

              {errorMessage && (
                <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/25 text-rose-300 text-xs font-semibold">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* 1. Shared / Student & Parent Core */}
                <div className="space-y-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#c19b4c] border-b border-white/5 pb-3">
                    1. General Information
                  </h3>
                  <div className="grid gap-6 sm:grid-cols-2">
                    
                    {/* Student Full Name */}
                    <div>
                      <label htmlFor="studentName" className="block text-xs font-bold text-zinc-300 mb-2.5">
                        Student Full Name *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-650">
                          <User className="h-4 w-4" />
                        </div>
                        <input
                          type="text"
                          id="studentName"
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                          placeholder="e.g. Muhammad Abdullah"
                          required
                          className="w-full rounded-xl border border-white/10 bg-slate-950 pl-10 pr-4 py-3.5 text-xs text-slate-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                        />
                      </div>
                    </div>

                    {/* Parent Email */}
                    <div>
                      <label htmlFor="parentEmail" className="block text-xs font-bold text-zinc-300 mb-2.5">
                        Parent Email Address *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-650">
                          <Mail className="h-4 w-4" />
                        </div>
                        <input
                          type="email"
                          id="parentEmail"
                          value={parentEmail}
                          onChange={(e) => setParentEmail(e.target.value)}
                          placeholder="your@email.com"
                          required
                          className="w-full rounded-xl border border-white/10 bg-slate-950 pl-10 pr-4 py-3.5 text-xs text-slate-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                        />
                      </div>
                    </div>

                    {activeTab === 'trial' ? (
                      /* Free Trial Specific fields */
                      <>
                        {/* Preferred Starting Date */}
                        <div>
                          <label htmlFor="requestedDate" className="block text-xs font-bold text-zinc-300 mb-2.5">
                            Preferred Starting Date *
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-650">
                              <Calendar className="h-4 w-4" />
                            </div>
                            <input
                              type="date"
                              id="requestedDate"
                              value={requestedDate}
                              onChange={(e) => setRequestedDate(e.target.value)}
                              min={getMinDate()}
                              required={activeTab === 'trial'}
                              className="w-full rounded-xl border border-white/10 bg-slate-950 pl-10 pr-4 py-3.5 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                            />
                          </div>
                        </div>

                        {/* Selected Course Interest */}
                        <div>
                          <label htmlFor="trialCourse" className="block text-xs font-bold text-zinc-300 mb-2.5">
                            Course Interest *
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-650">
                              <Globe className="h-4 w-4" />
                            </div>
                            <select
                              id="trialCourse"
                              value={trialCourse}
                              onChange={(e) => setTrialCourse(e.target.value)}
                              required={activeTab === 'trial'}
                              className="w-full rounded-xl border border-white/10 bg-slate-950 pl-10 pr-4 py-3.5 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                            >
                              <option value="">Select a course</option>
                              {coursesList.map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </>
                    ) : (
                      /* Admission Specific details */
                      <>
                        {/* Student Age */}
                        <div>
                          <label htmlFor="studentAge" className="block text-xs font-bold text-zinc-300 mb-2.5">
                            Student Age
                          </label>
                          <input
                            type="number"
                            id="studentAge"
                            value={studentAge}
                            onChange={(e) => setStudentAge(e.target.value)}
                            placeholder="Age in years"
                            className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3.5 text-xs text-slate-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                          />
                        </div>

                        {/* Father / Parent Name */}
                        <div>
                          <label htmlFor="parentName" className="block text-xs font-bold text-zinc-300 mb-2.5">
                            Father / Parent Name *
                          </label>
                          <input
                            type="text"
                            id="parentName"
                            value={parentName}
                            onChange={(e) => setParentName(e.target.value)}
                            placeholder="Father's or Parent's full name"
                            required={activeTab === 'admission'}
                            className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3.5 text-xs text-slate-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                          />
                        </div>
                      </>
                    )}

                  </div>
                </div>

                {activeTab === 'admission' && (
                  /* Additional Admission-specific panels */
                  <>
                    <div className="space-y-6">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-[#c19b4c] border-b border-white/5 pb-3">
                        2. Detailed Profile
                      </h3>
                      <div className="grid gap-6 sm:grid-cols-2">
                        
                        {/* Student Gender */}
                        <div>
                          <label htmlFor="studentGender" className="block text-xs font-bold text-zinc-300 mb-2.5">
                            Student Gender *
                          </label>
                          <select
                            id="studentGender"
                            value={studentGender}
                            onChange={(e) => setStudentGender(e.target.value)}
                            required={activeTab === 'admission'}
                            className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3.5 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                          >
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                          </select>
                        </div>

                        {/* Guardian Relationship */}
                        <div>
                          <label htmlFor="guardianRelationship" className="block text-xs font-bold text-zinc-300 mb-2.5">
                            Guardian Relationship
                          </label>
                          <select
                            id="guardianRelationship"
                            value={guardianRelationship}
                            onChange={(e) => setGuardianRelationship(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3.5 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                          >
                            <option value="">Select relationship</option>
                            <option value="father">Father</option>
                            <option value="mother">Mother</option>
                            <option value="brother">Brother</option>
                            <option value="sister">Sister</option>
                            <option value="other">Other Guardian</option>
                          </select>
                        </div>

                        {/* Country */}
                        <div>
                          <label htmlFor="country" className="block text-xs font-bold text-zinc-300 mb-2.5">
                            Country *
                          </label>
                          <select
                            id="country"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            required={activeTab === 'admission'}
                            className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3.5 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                          >
                            <option value="">Select country</option>
                            {countriesList.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>

                        {/* State / Province */}
                        <div>
                          <label htmlFor="stateProvince" className="block text-xs font-bold text-zinc-300 mb-2.5">
                            State / Province *
                          </label>
                          <input
                            type="text"
                            id="stateProvince"
                            value={stateProvince}
                            onChange={(e) => setStateProvince(e.target.value)}
                            placeholder="e.g. Ontario, Punjab, Texas"
                            required={activeTab === 'admission'}
                            className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3.5 text-xs text-slate-100 placeholder-zinc-650 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                          />
                        </div>

                        {/* Parent WhatsApp */}
                        <div>
                          <label htmlFor="parentWhatsapp" className="block text-xs font-bold text-zinc-300 mb-2.5">
                            Parent WhatsApp Number *
                          </label>
                          <input
                            type="tel"
                            id="parentWhatsapp"
                            value={parentWhatsapp}
                            onChange={(e) => setParentWhatsapp(e.target.value)}
                            placeholder="e.g. +1 555 000 0000"
                            required={activeTab === 'admission'}
                            className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3.5 text-xs text-slate-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                          />
                        </div>

                        {/* Student WhatsApp */}
                        <div>
                          <label htmlFor="studentWhatsapp" className="block text-xs font-bold text-zinc-300 mb-2.5">
                            Student WhatsApp Number (optional)
                          </label>
                          <input
                            type="tel"
                            id="studentWhatsapp"
                            value={studentWhatsapp}
                            onChange={(e) => setStudentWhatsapp(e.target.value)}
                            placeholder="e.g. +1 555 000 0000"
                            className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3.5 text-xs text-slate-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                          />
                        </div>

                      </div>
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-[#c19b4c] border-b border-white/5 pb-3">
                        3. Course Registration
                      </h3>
                      <div className="grid gap-6 sm:grid-cols-2">
                        
                        {/* Course Interest */}
                        <div>
                          <label htmlFor="courseInterest" className="block text-xs font-bold text-zinc-300 mb-2.5">
                            Selected Course *
                          </label>
                          <select
                            id="courseInterest"
                            value={courseInterest}
                            onChange={(e) => setCourseInterest(e.target.value)}
                            required={activeTab === 'admission'}
                            className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3.5 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                          >
                            <option value="">Select a course</option>
                            {coursesList.map((course) => (
                              <option key={course} value={course}>{course}</option>
                            ))}
                          </select>
                        </div>

                        {/* Format Preview */}
                        <div>
                          <label className="block text-xs font-bold text-zinc-550 mb-2.5">
                            Class Format
                          </label>
                          <div className="w-full rounded-xl border border-white/5 bg-slate-950/65 px-4 py-3.5 text-xs text-zinc-500">
                            {courseInterest 
                              ? (courseInterest.includes('Group') || courseInterest.includes('Dars-e-Nizami') 
                                ? 'Structured Group Format' 
                                : 'Personalized One-on-One Format') 
                              : 'Select a course to auto-detect class format'}
                          </div>
                        </div>

                      </div>
                    </div>
                  </>
                )}

                {/* Preferred Teacher & Timezone (Shared bottom components) */}
                <div className="space-y-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#c19b4c] border-b border-white/5 pb-3">
                    {activeTab === 'trial' ? '2. Prefs & Scheduling' : '4. Prefs & Scheduling'}
                  </h3>
                  <div className="grid gap-6 sm:grid-cols-2">
                    
                    {/* Preferred Teacher */}
                    <div>
                      <label htmlFor="preferredTeacher" className="block text-xs font-bold text-zinc-300 mb-2.5">
                        Preferred Teacher (optional)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-650">
                          <Users className="h-4 w-4" />
                        </div>
                        <select
                          id="preferredTeacher"
                          value={preferredTeacherId}
                          onChange={(e) => setPreferredTeacherId(e.target.value)}
                          disabled={loadingTeachers}
                          className="w-full rounded-xl border border-white/10 bg-slate-950 pl-10 pr-4 py-3.5 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all disabled:opacity-55"
                        >
                          <option value="">
                            {loadingTeachers ? 'Loading teachers list...' : 'Select preferred teacher'}
                          </option>
                          {teachers.map((teacher) => (
                            <option key={teacher.id} value={teacher.id}>
                              {teacher.full_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Timezone */}
                    <div>
                      <label htmlFor="timezone" className="block text-xs font-bold text-zinc-300 mb-2.5 flex items-center justify-between">
                        <span>Timezone *</span>
                        <span className="text-[10px] text-emerald-400 font-semibold">(Auto-detected)</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-655">
                          <Globe className="h-4 w-4" />
                        </div>
                        <select
                          id="timezone"
                          value={timezone}
                          onChange={(e) => setTimezone(e.target.value)}
                          required
                          className="w-full rounded-xl border border-white/10 bg-slate-950 pl-10 pr-4 py-3.5 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                        >
                          <option value={timezone}>{timezone} (Current)</option>
                          {timezonesList.filter(tz => tz !== timezone).map((tz) => (
                            <option key={tz} value={tz}>{tz}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                  </div>
                </div>

                {activeTab === 'admission' && (
                  /* Additional Notes block for Admissions */
                  <div className="space-y-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#c19b4c] border-b border-white/5 pb-3">
                      5. Additional Notes
                    </h3>
                    <div>
                      <label htmlFor="additionalNotes" className="block text-xs font-bold text-zinc-300 mb-2.5">
                        Additional Notes / Special Needs
                      </label>
                      <textarea
                        id="additionalNotes"
                        rows={4}
                        value={additionalNotes}
                        onChange={(e) => setAdditionalNotes(e.target.value)}
                        placeholder="Please share any current Quran reading experience, preferred schedules, or special learning requirements."
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3.5 text-xs text-slate-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all resize-y font-sans font-light"
                      ></textarea>
                    </div>
                  </div>
                )}

                {/* Submit Panel */}
                <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <p className="text-[10px] text-zinc-500 max-w-md text-center sm:text-left leading-normal font-sans font-light flex items-start gap-1.5">
                    <Shield className="h-4 w-4 text-emerald-555 shrink-0 mt-0.5" />
                    <span>
                      By submitting this form, you request a 3-day class validation trial with verified academic coordinators. No payment required upfront.
                    </span>
                  </p>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-8 py-4 text-xs font-bold text-white shadow shadow-emerald-500/10 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-55"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Request
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>

              </form>

            </div>
          )}

        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
