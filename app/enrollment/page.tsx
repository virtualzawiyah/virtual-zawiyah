'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import PublicNavbar from '@/components/PublicNavbar'
import PublicFooter from '@/components/PublicFooter'
import { supabase } from '@/lib/supabaseClient'
import { CheckCircle2, ChevronRight, Loader2, ArrowRight } from 'lucide-react'

interface Teacher {
  id: string
  full_name: string
}

export default function EnrollmentPage() {
  // State for teachers list
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loadingTeachers, setLoadingTeachers] = useState(true)

  // Form states
  const [studentName, setStudentName] = useState('')
  const [studentAge, setStudentAge] = useState('')
  const [studentGender, setStudentGender] = useState('')
  const [parentName, setParentName] = useState('')
  const [parentEmail, setParentEmail] = useState('')
  const [parentWhatsapp, setParentWhatsapp] = useState('')
  const [guardianRelationship, setGuardianRelationship] = useState('')
  const [studentWhatsapp, setStudentWhatsapp] = useState('')
  const [stateProvince, setStateProvince] = useState('')
  const [country, setCountry] = useState('')
  const [courseInterest, setCourseInterest] = useState('')
  const [preferredTeacherId, setPreferredTeacherId] = useState('')
  const [timezone, setTimezone] = useState('UTC')
  const [additionalNotes, setAdditionalNotes] = useState('')
  
  // Submission & Validation
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')

    // Basic Validation
    if (!studentName || !parentName || !parentEmail || !parentWhatsapp || !courseInterest) {
      setErrorMessage('Please fill in all required fields.')
      setIsSubmitting(false)
      return
    }

    // Format prepended message containing timezone and other inputs that don't map to enrollment_requests columns
    const prependedMessage = [
      `[Timezone: ${timezone}]`,
      `[Gender: ${studentGender || 'N/A'}]`,
      `[Relationship: ${guardianRelationship || 'N/A'}]`,
      `[State/Province: ${stateProvince || 'N/A'}]`,
      `[Country: ${country || 'N/A'}]`,
      `[Student WhatsApp: ${studentWhatsapp || 'N/A'}]`,
      `Notes: ${additionalNotes || 'None'}`
    ].join(' | ')

    try {
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

      setSubmitSuccess(true)
    } catch (err) {
      console.error('Enrollment submission error:', err)
      const errorMsg = err instanceof Error ? err.message : 'An error occurred during submission. Please try again.'
      setErrorMessage(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Common list of countries
  const countriesList = [
    'United States', 'United Kingdom', 'Canada', 'Australia', 'Pakistan', 
    'Saudi Arabia', 'United Arab Emirates', 'Qatar', 'Kuwait', 'Bahrain', 
    'Oman', 'Germany', 'France', 'Norway', 'Sweden', 'Malaysia', 'Singapore'
  ]

  // Courses list
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

  // Timezones list
  const timezonesList = [
    'UTC', 'Asia/Karachi', 'Asia/Riyadh', 'Asia/Dubai', 'Europe/London', 
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 
    'Australia/Sydney', 'Australia/Melbourne'
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <PublicNavbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumbs */}
          <nav className="flex mb-6 text-xs text-zinc-500 uppercase tracking-wider font-semibold">
            <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
            <span className="mx-2 text-zinc-700">/</span>
            <span className="text-emerald-400">Admission</span>
          </nav>

          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h1 className="text-3xl font-extrabold tracking-tight font-sans bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent mb-3">
              Admission Application
            </h1>
            <p className="text-xs text-zinc-450 leading-relaxed font-sans">
              Fill out the form below to apply. Our team will review your application and contact you within 24 hours via WhatsApp.
            </p>
          </div>

          {submitSuccess ? (
            /* Success State */
            <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/60 p-8 text-center backdrop-blur-md max-w-2xl mx-auto shadow-xl shadow-emerald-950/5">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mb-6">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold text-white mb-3">Application Submitted Successfully!</h2>
              <p className="text-xs text-zinc-400 leading-relaxed mb-6 font-sans">
                Jazakallah khair. Your admission request has been received. Our support team will review the details and reach out to you via WhatsApp at <strong className="text-emerald-400">{parentWhatsapp}</strong> within 24 hours to match you with a teacher and schedule your trial classes.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-3 px-6 text-xs font-bold text-white shadow hover:bg-emerald-500 active:scale-[0.98] transition-all"
                >
                  Return to Home
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="https://wa.me/923355777312"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 py-3 px-6 text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 transition-all"
                >
                  Message Support on WhatsApp
                </a>
              </div>
            </div>
          ) : (
            /* Form Card */
            <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 sm:p-8 backdrop-blur-md shadow-xl">
              
              {errorMessage && (
                <div className="mb-6 p-4 rounded-xl bg-rose-500/15 border border-rose-500/25 text-rose-300 text-xs font-semibold">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* 1. Personal Information */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 border-b border-white/5 pb-2.5 mb-5">
                    1. Personal Information
                  </h3>
                  <div className="grid gap-6 sm:grid-cols-2">
                    
                    {/* Student Name */}
                    <div>
                      <label htmlFor="studentName" className="block text-xs font-bold text-zinc-300 mb-2">
                        Student Full Name *
                      </label>
                      <input
                        type="text"
                        id="studentName"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="e.g. Muhammad Abdullah"
                        required
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-xs text-slate-100 placeholder-zinc-650 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                      />
                    </div>

                    {/* Student Age */}
                    <div>
                      <label htmlFor="studentAge" className="block text-xs font-bold text-zinc-300 mb-2">
                        Student Age
                      </label>
                      <input
                        type="number"
                        id="studentAge"
                        value={studentAge}
                        onChange={(e) => setStudentAge(e.target.value)}
                        placeholder="Age in years"
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-xs text-slate-100 placeholder-zinc-650 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                      />
                    </div>

                    {/* Father's Name / Parent Name */}
                    <div>
                      <label htmlFor="parentName" className="block text-xs font-bold text-zinc-300 mb-2">
                        Father / Parent Name *
                      </label>
                      <input
                        type="text"
                        id="parentName"
                        value={parentName}
                        onChange={(e) => setParentName(e.target.value)}
                        placeholder="Father's or Parent's full name"
                        required
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-xs text-slate-100 placeholder-zinc-650 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                      />
                    </div>

                    {/* Guardian Relationship */}
                    <div>
                      <label htmlFor="guardianRelationship" className="block text-xs font-bold text-zinc-300 mb-2">
                        Guardian Relationship
                      </label>
                      <select
                        id="guardianRelationship"
                        value={guardianRelationship}
                        onChange={(e) => setGuardianRelationship(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                      >
                        <option value="">Select relationship</option>
                        <option value="father">Father</option>
                        <option value="mother">Mother</option>
                        <option value="brother">Brother</option>
                        <option value="sister">Sister</option>
                        <option value="other">Other Guardian</option>
                      </select>
                    </div>

                    {/* Student Gender */}
                    <div>
                      <label htmlFor="studentGender" className="block text-xs font-bold text-zinc-300 mb-2">
                        Student Gender *
                      </label>
                      <select
                        id="studentGender"
                        value={studentGender}
                        onChange={(e) => setStudentGender(e.target.value)}
                        required
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>

                    {/* Country */}
                    <div>
                      <label htmlFor="country" className="block text-xs font-bold text-zinc-300 mb-2">
                        Country *
                      </label>
                      <select
                        id="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        required
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                      >
                        <option value="">Select country</option>
                        {countriesList.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {/* State / Province */}
                    <div>
                      <label htmlFor="stateProvince" className="block text-xs font-bold text-zinc-300 mb-2">
                        State / Province *
                      </label>
                      <input
                        type="text"
                        id="stateProvince"
                        value={stateProvince}
                        onChange={(e) => setStateProvince(e.target.value)}
                        placeholder="e.g. Ontario, Punjab, Texas"
                        required
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-xs text-slate-100 placeholder-zinc-650 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                      />
                    </div>

                    {/* Email Address */}
                    <div>
                      <label htmlFor="parentEmail" className="block text-xs font-bold text-zinc-300 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="parentEmail"
                        value={parentEmail}
                        onChange={(e) => setParentEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-xs text-slate-100 placeholder-zinc-650 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                      />
                    </div>

                    {/* Parent WhatsApp Number */}
                    <div>
                      <label htmlFor="parentWhatsapp" className="block text-xs font-bold text-zinc-300 mb-2">
                        Parent WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        id="parentWhatsapp"
                        value={parentWhatsapp}
                        onChange={(e) => setParentWhatsapp(e.target.value)}
                        placeholder="e.g. +1 555 000 0000"
                        required
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-xs text-slate-100 placeholder-zinc-650 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                      />
                    </div>

                    {/* Student WhatsApp Number */}
                    <div>
                      <label htmlFor="studentWhatsapp" className="block text-xs font-bold text-zinc-300 mb-2">
                        Student WhatsApp Number (optional)
                      </label>
                      <input
                        type="tel"
                        id="studentWhatsapp"
                        value={studentWhatsapp}
                        onChange={(e) => setStudentWhatsapp(e.target.value)}
                        placeholder="e.g. +1 555 000 0000"
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-xs text-slate-100 placeholder-zinc-650 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                      />
                    </div>

                  </div>
                </div>

                {/* 2. Academic Information */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 border-b border-white/5 pb-2.5 mb-5">
                    2. Academic Information
                  </h3>
                  <div className="grid gap-6 sm:grid-cols-2">
                    
                    {/* Course */}
                    <div>
                      <label htmlFor="courseInterest" className="block text-xs font-bold text-zinc-300 mb-2">
                        Selected Course *
                      </label>
                      <select
                        id="courseInterest"
                        value={courseInterest}
                        onChange={(e) => setCourseInterest(e.target.value)}
                        required
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                      >
                        <option value="">Select a course</option>
                        {coursesList.map((course) => (
                          <option key={course} value={course}>{course}</option>
                        ))}
                      </select>
                    </div>

                    {/* Preferred Teacher */}
                    <div>
                      <label htmlFor="preferredTeacher" className="block text-xs font-bold text-zinc-300 mb-2">
                        Preferred Teacher
                      </label>
                      <select
                        id="preferredTeacher"
                        value={preferredTeacherId}
                        onChange={(e) => setPreferredTeacherId(e.target.value)}
                        disabled={loadingTeachers}
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 disabled:opacity-55"
                      >
                        <option value="">
                          {loadingTeachers ? 'Loading teachers list...' : 'Select preferred teacher (optional)'}
                        </option>
                        {teachers.map((teacher) => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.full_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Timezone */}
                    <div>
                      <label htmlFor="timezone" className="block text-xs font-bold text-zinc-300 mb-2 flex items-center justify-between">
                        <span>Timezone *</span>
                        <span className="text-[10px] text-emerald-400 font-semibold">(Auto-detected)</span>
                      </label>
                      <select
                        id="timezone"
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        required
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                      >
                        <option value={timezone}>{timezone} (Current)</option>
                        {timezonesList.filter(tz => tz !== timezone).map((tz) => (
                          <option key={tz} value={tz}>{tz}</option>
                        ))}
                      </select>
                    </div>

                    {/* Format Preview */}
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 mb-2">
                        Class Format
                      </label>
                      <div className="w-full rounded-xl border border-white/5 bg-slate-950/60 px-4 py-3 text-xs text-zinc-500">
                        {courseInterest 
                          ? (courseInterest.includes('Group') || courseInterest.includes('Dars-e-Nizami') 
                            ? 'Structured Group Format' 
                            : 'Personalized One-on-One Format') 
                          : 'Select a course to auto-detect class format'}
                      </div>
                    </div>

                  </div>
                </div>

                {/* 3. Additional Information */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 border-b border-white/5 pb-2.5 mb-5">
                    3. Additional Information
                  </h3>
                  <div className="space-y-6">
                    
                    {/* Additional Notes */}
                    <div>
                      <label htmlFor="additionalNotes" className="block text-xs font-bold text-zinc-300 mb-2">
                        Additional Notes / Special Needs
                      </label>
                      <textarea
                        id="additionalNotes"
                        rows={4}
                        value={additionalNotes}
                        onChange={(e) => setAdditionalNotes(e.target.value)}
                        placeholder="Please share any current Quran reading experience, preferred schedules, or special learning requirements."
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-xs text-slate-100 placeholder-zinc-650 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-y"
                      ></textarea>
                    </div>

                  </div>
                </div>

                {/* Submit Panel */}
                <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-[10px] text-zinc-500 max-w-md text-center sm:text-left leading-normal font-sans">
                    By submitting this application, you agree to start a 3-day free trial. Our team will verify credentials and schedule your sessions via WhatsApp.
                  </p>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-3.5 text-xs font-bold text-white shadow shadow-emerald-500/10 hover:bg-emerald-500 active:scale-[0.98] transition-all disabled:opacity-55"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Application
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
