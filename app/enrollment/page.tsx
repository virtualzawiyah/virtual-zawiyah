'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle2, ChevronRight, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import PublicNavbar from '@/components/PublicNavbar'
import PublicFooter from '@/components/PublicFooter'
import GeometricPattern from '@/components/GeometricPattern'

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Pakistan",
  "Saudi Arabia", "United Arab Emirates", "Qatar", "Kuwait", "Bahrain",
  "Oman", "Germany", "France", "Norway", "Sweden", "Malaysia", "Singapore",
  "Afghanistan", "Albania", "Algeria", "Argentina", "Austria", "Azerbaijan",
  "Bangladesh", "Belgium", "Bosnia", "Brazil", "China", "Denmark",
  "Egypt", "Ethiopia", "Finland", "Ghana", "Greece", "Hungary",
  "India", "Indonesia", "Iran", "Iraq", "Ireland", "Italy", "Japan", "Jordan", "Kazakhstan",
  "Kenya", "Lebanon", "Libya", "Maldives", "Mali", "Mauritania",
  "Morocco", "Netherlands", "New Zealand", "Nigeria", "Palestine", "Philippines", "Portugal", "Russia",
  "Senegal", "Somalia", "South Africa", "Spain", "Sri Lanka", "Sudan", "Switzerland", "Syria",
  "Tanzania", "Tunisia", "Turkey", "Uganda", "Ukraine", "Uzbekistan", "Yemen", "Other"
]

const TIMEZONES = Intl.supportedValuesOf ? Intl.supportedValuesOf("timeZone") : [
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "America/Toronto", "America/Vancouver", "Europe/London", "Europe/Paris", "Europe/Berlin",
  "Asia/Dubai", "Asia/Karachi", "Asia/Kolkata", "Asia/Dhaka", "Asia/Kuala_Lumpur",
  "Asia/Singapore", "Asia/Tokyo", "Africa/Cairo", "Africa/Lagos", "Australia/Sydney",
  "Pacific/Auckland"
]

const COURSES = [
  "Quran Reading with Tajweed",
  "Applied Tajweed (Basic)",
  "Quran Memorization (Hifz)",
  "40 Hadith Memorization",
  "Quran Translation",
  "Arabic Grammar (Sarf & Nahw)",
  "Dars-e-Nizami",
  "Tajweed Group Program",
]

const COURSE_FORMAT: Record<string, "One-on-One" | "Group"> = {
  "Quran Reading with Tajweed":   "One-on-One",
  "Applied Tajweed (Basic)":      "One-on-One",
  "Quran Memorization (Hifz)":    "One-on-One",
  "40 Hadith Memorization":       "One-on-One",
  "Quran Translation":            "One-on-One",
  "Arabic Grammar (Sarf & Nahw)": "One-on-One",
  "Dars-e-Nizami":                "Group",
  "Tajweed Group Program":        "Group",
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const COUNTRY_DIAL_CODES: Record<string, string> = {
  "United States": "+1", "United Kingdom": "+44", "Canada": "+1", "Australia": "+61", "Pakistan": "+92",
  "Saudi Arabia": "+966", "United Arab Emirates": "+971", "Qatar": "+974", "Kuwait": "+965", "Bahrain": "+973",
  "Oman": "+968", "Germany": "+49", "France": "+33", "Norway": "+47", "Sweden": "+46", "Malaysia": "+60",
  "Singapore": "+65", "Afghanistan": "+93", "Albania": "+355", "Algeria": "+213", "Argentina": "+54",
  "Austria": "+43", "Azerbaijan": "+994", "Bangladesh": "+880", "Belgium": "+32", "Bosnia": "+387", "Brazil": "+55",
  "China": "+86", "Denmark": "+45", "Egypt": "+20", "Ethiopia": "+251", "Finland": "+358", "Ghana": "+233",
  "Greece": "+30", "Hungary": "+36", "India": "+91", "Indonesia": "+62", "Iran": "+98", "Iraq": "+964",
  "Ireland": "+353", "Italy": "+39", "Japan": "+81", "Jordan": "+962", "Kazakhstan": "+7", "Kenya": "+254",
  "Lebanon": "+961", "Libya": "+218", "Maldives": "+960", "Mali": "+223", "Mauritania": "+222", "Morocco": "+212",
  "Netherlands": "+31", "New Zealand": "+64", "Nigeria": "+234", "Palestine": "+970", "Philippines": "+63",
  "Portugal": "+351", "Russia": "+7", "Senegal": "+221", "Somalia": "+252", "South Africa": "+27", "Spain": "+34",
  "Sri Lanka": "+94", "Sudan": "+249", "Switzerland": "+41", "Syria": "+963", "Tanzania": "+255", "Tunisia": "+216",
  "Turkey": "+90", "Uganda": "+256", "Ukraine": "+380", "Uzbekistan": "+998", "Yemen": "+967", "Other": ""
}

const ONE_ON_ONE_PLANS = [
  { value: "30min-3x-weekly", label: "30 min · 3 lessons/week ($60/month)", price: "$60/month" },
  { value: "30min-5x-weekly", label: "30 min · 5 lessons/week ($100/month)", price: "$100/month", popular: true },
  { value: "60min-3x-weekly", label: "60 min · 3 lessons/week ($120/month)", price: "$120/month" },
  { value: "60min-5x-weekly", label: "60 min · 5 lessons/week ($200/month)", price: "$200/month" },
  { value: "30min-weekend",   label: "30 min · Weekend (Sat & Sun) ($100/month)", price: "$100/month" },
]

const GROUP_PLANS = [
  { value: "120min-5x-weekly-group", label: "120 min · 5 lessons/week ($40/month)", price: "$40/month" },
]

export default function EnrollmentPage() {
  const [activeTab, setActiveTab] = useState<'admission' | 'trial'>('admission')
  
  // Shared Form Fields
  const [studentName, setStudentName] = useState('')
  const [parentEmail, setParentEmail] = useState('')
  const [course, setCourse] = useState('')
  const [classFormat, setClassFormat] = useState<'One-on-One' | 'Group'>('One-on-One')
  const [timezone, setTimezone] = useState('UTC')
  const [preferredTeacherGender, setPreferredTeacherGender] = useState<'Male' | 'Female'>('Male')
  const [additionalNotes, setAdditionalNotes] = useState('')
  
  // Full Admission Fields
  const [fathersName, setFathersName] = useState('')
  const [guardianName, setGuardianName] = useState('')
  const [guardianRelationship, setGuardianRelationship] = useState<'Father' | 'Mother' | 'Brother' | 'Other'>('Father')
  const [studentGender, setStudentGender] = useState<'Male' | 'Female'>('Male')
  const [studentAge, setStudentAge] = useState('')
  const [country, setCountry] = useState('')
  const [stateProvince, setStateProvince] = useState('')
  const [guardianWhatsapp, setGuardianWhatsapp] = useState('')
  const [studentWhatsapp, setStudentWhatsapp] = useState('')
  const [darsENizamiYear, setDarsENizamiYear] = useState('')
  const [preferredDuration, setPreferredDuration] = useState('')
  const [currentLevel, setCurrentLevel] = useState('')
  const [preferredTime1, setPreferredTime1] = useState('')
  const [preferredTime2, setPreferredTime2] = useState('')
  const [daysAvailable, setDaysAvailable] = useState<string[]>([])
  const [specialNeeds, setSpecialNeeds] = useState('')
  const [howDidYouHear, setHowDidYouHear] = useState('')
  
  // Trial Fields
  const [requestedDate, setRequestedDate] = useState('')

  // State control
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Dial code tracking
  const dialCode = COUNTRY_DIAL_CODES[country] || ""

  // URL tab detection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const tabParam = params.get('tab')
      if (tabParam === 'trial') {
        setActiveTab('trial')
      }
    }
  }, [])

  // Auto-detect timezone
  useEffect(() => {
    try {
      const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone
      if (detectedTz) {
        setTimezone(detectedTz)
      }
    } catch (e) {
      console.error('Failed to detect timezone:', e)
    }
  }, [])

  // Auto-set class format from course selection
  useEffect(() => {
    if (!course) return
    const format = COURSE_FORMAT[course]
    if (format) {
      setClassFormat(format)
      setPreferredDuration('')
    }
  }, [course])

  // Auto-fill dial codes into WhatsApp inputs
  useEffect(() => {
    if (!dialCode) return
    if (!guardianWhatsapp || !guardianWhatsapp.replace(/\D/g, "")) {
      setGuardianWhatsapp(dialCode)
    }
    if (!studentWhatsapp || !studentWhatsapp.replace(/\D/g, "")) {
      setStudentWhatsapp(dialCode)
    }
  }, [country, dialCode])

  const handleDayToggle = (day: string) => {
    setDaysAvailable((prev) => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  const handleAdmissionSubmit = async () => {
    if (!studentName || !fathersName || !parentEmail || !guardianWhatsapp || !country || !stateProvince || !course) {
      throw new Error('Please fill in all required fields marked with *.')
    }

    const prependedMessage = [
      `[Gender: ${studentGender}]`,
      `[Relationship: ${guardianRelationship}]`,
      `[Fathers Name: ${fathersName}]`,
      `[Guardian Name: ${guardianName || 'N/A'}]`,
      `[Country: ${country}]`,
      `[State/Province: ${stateProvince}]`,
      `[Student WhatsApp: ${studentWhatsapp || 'N/A'}]`,
      `[Class Format: ${classFormat}]`,
      `[Preferred Duration/Plan: ${preferredDuration || 'N/A'}]`,
      `[Preferred Teacher Gender: ${preferredTeacherGender}]`,
      `[Dars-e-Nizami Year: ${darsENizamiYear || 'N/A'}]`,
      `[Current Experience Level: ${currentLevel || 'N/A'}]`,
      `[Preferred Time 1: ${preferredTime1 || 'N/A'}]`,
      `[Preferred Time 2: ${preferredTime2 || 'N/A'}]`,
      `[Days Available: ${daysAvailable.join(', ') || 'N/A'}]`,
      `[Special Needs: ${specialNeeds || 'None'}]`,
      `[Referral: ${howDidYouHear || 'N/A'}]`,
      `Notes: ${additionalNotes || 'None'}`
    ].join(' | ')

    const { error } = await supabase
      .from('enrollment_requests')
      .insert({
        student_name: studentName,
        student_age: studentAge ? parseInt(studentAge, 10) : null,
        parent_name: fathersName,
        parent_email: parentEmail,
        parent_whatsapp: guardianWhatsapp,
        course_interest: course,
        message: prependedMessage,
        timezone: timezone,
        status: 'pending'
      })

    if (error) throw error
  }

  const handleTrialSubmit = async () => {
    if (!studentName || !parentEmail || !requestedDate || !course || !guardianWhatsapp) {
      throw new Error('Please fill in all required fields.')
    }

    const feedbackNotes = [
      `Course interest: ${course}`,
      `Preferred Teacher Gender: ${preferredTeacherGender}`,
      `Parent WhatsApp: ${guardianWhatsapp}`,
      `Notes: ${additionalNotes || 'None'}`
    ].join(' | ')

    const { error } = await supabase
      .from('trial_requests')
      .insert({
        student_name: studentName,
        parent_email: parentEmail,
        requested_date: requestedDate,
        timezone: timezone,
        feedback: feedbackNotes,
        status: 'pending'
      })

    if (error) throw error
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg('')

    try {
      if (activeTab === 'admission') {
        await handleAdmissionSubmit()
      } else {
        await handleTrialSubmit()
      }
      setSubmitted(true)
    } catch (err) {
      console.error('Submission error:', err)
      const errorMsg = err instanceof Error ? err.message : 'An error occurred during submission. Please try again.'
      setErrorMsg(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getMinDate = () => {
    const today = new Date()
    today.setDate(today.getDate() + 1)
    return today.toISOString().split('T')[0]
  }

  if (submitted) {
    return (
      <div className="public-page min-h-screen flex flex-col font-sans">
        <PublicNavbar />
        <section className="min-h-[80vh] flex items-center justify-center py-20" style={{ background: "#E8F5EE" }}>
          <div className="max-w-lg w-full mx-auto text-center px-4 animate-fade-in-up">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mx-auto mb-6 shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="font-serif font-bold text-3xl mb-4 text-gray-900">Application Received!</h2>
            <p className="text-sm sm:text-base leading-relaxed mb-6 text-gray-700">
              Jazakallah khair. Your request has been logged successfully. Our coordinators will review your details and contact you within 24 hours via WhatsApp at <strong className="text-primary">{guardianWhatsapp}</strong> to configure timings and match you with a teacher.
            </p>
            <p className="text-xs text-gray-500 mb-8">May Allah bless your learning journey.</p>
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
              <Link 
                href="/" 
                className="w-full sm:w-auto bg-primary hover:bg-primary/95 text-white font-semibold py-3 px-8 rounded-md text-sm shadow-md"
              >
                Return to Home
              </Link>
              <a 
                href="https://wa.me/923355777312"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto border border-primary text-primary hover:bg-primary/5 font-semibold py-3 px-8 rounded-md text-sm"
              >
                Chat with Support
              </a>
            </div>
          </div>
        </section>
        <PublicFooter />
      </div>
    )
  }

  return (
    <div className="public-page min-h-screen flex flex-col font-sans">
      <PublicNavbar />

      {/* Hero Header */}
      <section 
        className="relative overflow-hidden py-16" 
        style={{ background: "linear-gradient(135deg, #E8F5EE 0%, #FAFAF7 100%)" }}
      >
        <GeometricPattern opacity={0.07} />
        <div className="container mx-auto px-4 relative z-10 text-center animate-fade-in-up">
          <nav className="text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground font-semibold">Admission</span>
          </nav>
          <h1 className="font-serif font-bold text-4xl md:text-5xl mb-4" style={{ color: "#1A1A1A" }}>Admission Portal</h1>
          <p className="text-base sm:text-lg max-w-2xl mx-auto text-gray-600">
            Submit your application details below. Our academic team will match you with a verified Alim/Alimah and activate your classes.
          </p>
        </div>
      </section>

      {/* Main Intake Form Section */}
      <section className="py-16 bg-white relative z-10">
        <div className="container mx-auto px-4 max-w-3xl">
          
          {/* Tab Switcher */}
          <div className="flex p-1 rounded-lg bg-gray-100 border border-gray-200/50 shadow-inner max-w-md mx-auto mb-10">
            <button
              type="button"
              onClick={() => {
                setActiveTab('admission')
                setErrorMsg('')
              }}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
                activeTab === 'admission'
                  ? 'bg-primary text-white shadow'
                  : 'text-gray-500 hover:text-primary'
              }`}
            >
              Full Admission
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('trial')
                setErrorMsg('')
              }}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
                activeTab === 'trial'
                  ? 'bg-primary text-white shadow'
                  : 'text-gray-500 hover:text-primary'
              }`}
            >
              3-Day Free Trial
            </button>
          </div>

          {errorMsg && (
            <div className="mb-8 p-4 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold animate-fade-in-up">
              {errorMsg}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-12 animate-fade-in-up" noValidate>
            
            {/* SECTION 1: Personal Details */}
            <div className="rounded-2xl border border-primary/10 p-6 sm:p-10 bg-white shadow-sm space-y-6">
              
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-serif font-bold text-base">
                  1
                </div>
                <h2 className="font-serif font-bold text-2xl text-gray-900">Personal Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-1.5">
                  <label htmlFor="studentName" className="text-xs font-bold text-gray-700">
                    Student Full Name <span className="text-rose-600">*</span>
                  </label>
                  <input 
                    type="text"
                    id="studentName"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Muhammad Abdullah"
                    required
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-transparent outline-none h-10 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="fathersName" className="text-xs font-bold text-gray-700">
                    Father&apos;s / Sponsor&apos;s Name <span className="text-rose-600">*</span>
                  </label>
                  <input 
                    type="text"
                    id="fathersName"
                    value={fathersName}
                    onChange={(e) => setFathersName(e.target.value)}
                    placeholder="Father's full name"
                    required
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-transparent outline-none h-10 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                </div>

                {activeTab === 'admission' && (
                  <>
                    <div className="space-y-1.5">
                      <label htmlFor="guardianName" className="text-xs font-bold text-gray-700">
                        Guardian Name <span className="text-gray-400 font-normal">(if different from father)</span>
                      </label>
                      <input 
                        type="text"
                        id="guardianName"
                        value={guardianName}
                        onChange={(e) => setGuardianName(e.target.value)}
                        placeholder="Guardian's name"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-transparent outline-none h-10 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="guardianRelationship" className="text-xs font-bold text-gray-700">
                        Guardian Relationship <span className="text-rose-600">*</span>
                      </label>
                      <select
                        id="guardianRelationship"
                        value={guardianRelationship}
                        onChange={(e) => setGuardianRelationship(e.target.value as 'Father' | 'Mother' | 'Brother' | 'Other')}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white outline-none h-10 focus:border-primary transition-all"
                      >
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Brother">Brother</option>
                        <option value="Other">Other Guardian</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="studentGender" className="text-xs font-bold text-gray-700">
                        Student Gender <span className="text-rose-600">*</span>
                      </label>
                      <select
                        id="studentGender"
                        value={studentGender}
                        onChange={(e) => setStudentGender(e.target.value as 'Male' | 'Female')}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white outline-none h-10 focus:border-primary transition-all"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="studentAge" className="text-xs font-bold text-gray-700">
                        Student Age <span className="text-rose-600">*</span>
                      </label>
                      <input 
                        type="number"
                        id="studentAge"
                        value={studentAge}
                        onChange={(e) => setStudentAge(e.target.value)}
                        placeholder="Age in years"
                        min={4}
                        max={100}
                        required
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-transparent outline-none h-10 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="country" className="text-xs font-bold text-gray-700">
                    Country <span className="text-rose-600">*</span>
                  </label>
                  <select
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white outline-none h-10 focus:border-primary transition-all"
                  >
                    <option value="">Select country</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="stateProvince" className="text-xs font-bold text-gray-700">
                    State / Province <span className="text-rose-600">*</span>
                  </label>
                  <input 
                    type="text"
                    id="stateProvince"
                    value={stateProvince}
                    onChange={(e) => setStateProvince(e.target.value)}
                    placeholder="e.g. Ontario, Punjab, Texas"
                    required
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-transparent outline-none h-10 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="guardianWhatsapp" className="text-xs font-bold text-gray-700">
                    Guardian WhatsApp Number <span className="text-rose-600">*</span>
                  </label>
                  <div className="flex rounded-md border border-gray-300 overflow-hidden focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
                    <div className="flex items-center justify-center px-3 border-r bg-gray-50 text-xs font-bold text-primary shrink-0 select-none min-w-[4rem]">
                      {dialCode || "+?"}
                    </div>
                    <input 
                      type="tel"
                      id="guardianWhatsapp"
                      value={guardianWhatsapp.startsWith(dialCode) ? guardianWhatsapp.slice(dialCode.length) : guardianWhatsapp}
                      onChange={(e) => setGuardianWhatsapp(dialCode + e.target.value.replace(/\D/g, ""))}
                      placeholder="e.g. 335 5777312"
                      required
                      className="flex-1 px-3 py-2 text-sm bg-transparent outline-none h-10"
                    />
                  </div>
                </div>

                {activeTab === 'admission' && (
                  <div className="space-y-1.5">
                    <label htmlFor="studentWhatsapp" className="text-xs font-bold text-gray-700">
                      Student WhatsApp Number <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <div className="flex rounded-md border border-gray-300 overflow-hidden focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
                      <div className="flex items-center justify-center px-3 border-r bg-gray-50 text-xs font-bold text-primary shrink-0 select-none min-w-[4rem]">
                        {dialCode || "+?"}
                      </div>
                      <input 
                        type="tel"
                        id="studentWhatsapp"
                        value={studentWhatsapp.startsWith(dialCode) ? studentWhatsapp.slice(dialCode.length) : studentWhatsapp}
                        onChange={(e) => setStudentWhatsapp(dialCode + e.target.value.replace(/\D/g, ""))}
                        placeholder="e.g. 335 5777312"
                        className="flex-1 px-3 py-2 text-sm bg-transparent outline-none h-10"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5 md:col-span-2">
                  <label htmlFor="parentEmail" className="text-xs font-bold text-gray-700">
                    Parent Email Address <span className="text-rose-600">*</span>
                  </label>
                  <input 
                    type="email"
                    id="parentEmail"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    placeholder="sponsor@email.com"
                    required
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-transparent outline-none h-10 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                </div>

                {activeTab === 'trial' && (
                  <div className="space-y-1.5 md:col-span-2">
                    <label htmlFor="requestedDate" className="text-xs font-bold text-gray-700">
                      Preferred Trial Class Starting Date <span className="text-rose-600">*</span>
                    </label>
                    <input 
                      type="date"
                      id="requestedDate"
                      value={requestedDate}
                      onChange={(e) => setRequestedDate(e.target.value)}
                      min={getMinDate()}
                      required
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-transparent outline-none h-10 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                    />
                  </div>
                )}

              </div>
            </div>

            {/* SECTION 2: Academic Details */}
            <div className="rounded-2xl border border-primary/10 p-6 sm:p-10 bg-white shadow-sm space-y-6">
              
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-serif font-bold text-base">
                  2
                </div>
                <h2 className="font-serif font-bold text-2xl text-gray-900">Academic Preferences</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-1.5">
                  <label htmlFor="course" className="text-xs font-bold text-gray-700">
                    Select Course of Interest <span className="text-rose-600">*</span>
                  </label>
                  <select
                    id="course"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    required
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white outline-none h-10 focus:border-primary transition-all"
                  >
                    <option value="">Select a course</option>
                    {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Class Format</label>
                  <div
                    className={`flex items-center gap-2 h-10 px-4 rounded-md border text-sm font-semibold select-none ${
                      classFormat === "Group" 
                        ? "border-blue-200 bg-blue-50/50 text-blue-700" 
                        : "border-green-200 bg-green-50/50 text-green-700"
                    }`}
                  >
                    <span>{classFormat === "Group" ? "🧑‍🤝‍🧑" : "👤"}</span>
                    <span>{classFormat} Format</span>
                  </div>
                </div>

                {activeTab === 'admission' && (
                  <div className="space-y-1.5 md:col-span-2 animate-fade-in-up">
                    <label htmlFor="preferredDuration" className="text-xs font-bold text-gray-700">
                      Select Lesson Plan / Duration Options
                    </label>
                    <select
                      id="preferredDuration"
                      value={preferredDuration}
                      onChange={(e) => setPreferredDuration(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white outline-none h-10 focus:border-primary transition-all"
                    >
                      <option value="">Select a plan</option>
                      {(classFormat === "One-on-One" ? ONE_ON_ONE_PLANS : GROUP_PLANS).map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {course === "Dars-e-Nizami" && activeTab === 'admission' && (
                  <div className="space-y-1.5 animate-fade-in-up">
                    <label htmlFor="darsENizamiYear" className="text-xs font-bold text-gray-700">
                      Dars-e-Nizami Program Year <span className="text-rose-600">*</span>
                    </label>
                    <select
                      id="darsENizamiYear"
                      value={darsENizamiYear}
                      onChange={(e) => setDarsENizamiYear(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white outline-none h-10 focus:border-primary transition-all"
                    >
                      <option value="">Select year (1–8)</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(y => (
                        <option key={y} value={y.toString()}>Year {y}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="preferredTeacherGender" className="text-xs font-bold text-gray-700">
                    Preferred Teacher Staff Gender <span className="text-rose-600">*</span>
                  </label>
                  <select
                    id="preferredTeacherGender"
                    value={preferredTeacherGender}
                    onChange={(e) => setPreferredTeacherGender(e.target.value as 'Male' | 'Female')}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white outline-none h-10 focus:border-primary transition-all"
                  >
                    <option value="Male">Male Teacher</option>
                    <option value="Female">Female Teacher</option>
                  </select>
                  <p className="text-[10px] text-gray-400 leading-normal mt-1">
                    Female students are strictly matched with female staff, male students with male staff.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="currentLevel" className="text-xs font-bold text-gray-700">
                    Current Quran/Arabic Level <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input 
                    type="text"
                    id="currentLevel"
                    value={currentLevel}
                    onChange={(e) => setCurrentLevel(e.target.value)}
                    placeholder="e.g. absolute beginner, read basic Quran, etc."
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-transparent outline-none h-10 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                </div>

                {classFormat === "One-on-One" && activeTab === 'admission' && (
                  <>
                    <div className="space-y-1.5">
                      <label htmlFor="preferredTime1" className="text-xs font-bold text-gray-700">
                        Preferred Time choice — 1st Priority
                      </label>
                      <input 
                        type="time"
                        id="preferredTime1"
                        value={preferredTime1}
                        onChange={(e) => setPreferredTime1(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-transparent outline-none h-10 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="preferredTime2" className="text-xs font-bold text-gray-700">
                        Preferred Time choice — 2nd Priority <span className="text-gray-400 font-normal">(optional)</span>
                      </label>
                      <input 
                        type="time"
                        id="preferredTime2"
                        value={preferredTime2}
                        onChange={(e) => setPreferredTime2(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-transparent outline-none h-10 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-1.5 md:col-span-2">
                  <label htmlFor="timezone" className="text-xs font-bold text-gray-700">
                    Detected Local Timezone <span className="text-primary font-semibold">(Auto-detected)</span>
                  </label>
                  <select
                    id="timezone"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    required
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white outline-none h-10 focus:border-primary transition-all font-mono text-xs"
                  >
                    <option value={timezone}>{timezone} (Current)</option>
                    {TIMEZONES.filter(tz => tz !== timezone).map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>

                {classFormat === "One-on-One" && preferredDuration !== "30min-weekend" && activeTab === 'admission' && (
                  <div className="space-y-2.5 md:col-span-2 animate-fade-in-up">
                    <label className="text-xs font-bold text-gray-700">Days Available for Scheduling *</label>
                    <div className="flex flex-wrap gap-x-5 gap-y-2.5">
                      {DAYS.map(day => (
                        <label key={day} className="flex items-center gap-2 cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={daysAvailable.includes(day)}
                            onChange={() => handleDayToggle(day)}
                            className="rounded text-primary border-gray-350 focus:ring-primary/20 w-4 h-4"
                          />
                          <span className="text-sm font-medium text-gray-800">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {(classFormat === "Group" || preferredDuration === "30min-weekend") && activeTab === 'admission' && (
                  <div className="space-y-1.5 md:col-span-2 animate-fade-in-up">
                    <label className="text-xs font-bold text-gray-700">Fixed Weekly Schedule</label>
                    <div className="text-xs rounded-md px-4 py-3 border border-primary/15 bg-green-50/50 text-primary">
                      {classFormat === "Group" 
                        ? "Group programs run systematically Monday – Friday (5 days a week). The weekly timeline is fixed." 
                        : "Weekend programs run exclusively Saturday & Sunday. The weekly timeline is fixed."}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* SECTION 3: Additional Notes & Submit */}
            <div className="rounded-2xl border border-primary/10 p-6 sm:p-10 bg-white shadow-sm space-y-6">
              
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-serif font-bold text-base">
                  3
                </div>
                <h2 className="font-serif font-bold text-2xl text-gray-900">Additional Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {activeTab === 'admission' && (
                  <div className="space-y-1.5 md:col-span-2">
                    <label htmlFor="specialNeeds" className="text-xs font-bold text-gray-700">
                      Special Learning Needs or Disabilities <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <textarea 
                      id="specialNeeds"
                      value={specialNeeds}
                      onChange={(e) => setSpecialNeeds(e.target.value)}
                      placeholder="Please let us know so we can accommodate and match you appropriately."
                      rows={3}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-transparent outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-sans"
                    />
                  </div>
                )}

                <div className="space-y-1.5 md:col-span-2">
                  <label htmlFor="additionalNotes" className="text-xs font-bold text-gray-700">
                    Additional Notes / Requests <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea 
                    id="additionalNotes"
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Anything else you'd like our academic supervisor to know?"
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-transparent outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-sans"
                  />
                </div>

                {activeTab === 'admission' && (
                  <div className="space-y-1.5 md:col-span-2">
                    <label htmlFor="howDidYouHear" className="text-xs font-bold text-gray-700">
                      How did you hear about Virtual Zawiyah?
                    </label>
                    <select
                      id="howDidYouHear"
                      value={howDidYouHear}
                      onChange={(e) => setHowDidYouHear(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white outline-none h-10 focus:border-primary transition-all"
                    >
                      <option value="">Select option</option>
                      <option value="Social Media">Social Media</option>
                      <option value="Friend">Friend or Family</option>
                      <option value="Google">Google Search</option>
                      <option value="Other">Other Referral</option>
                    </select>
                  </div>
                )}

              </div>
            </div>

            {/* Submit Bar */}
            <div className="text-center pt-2 pb-8 space-y-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-white font-bold px-12 h-14 text-base shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
                data-testid="btn-submit-admission"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  <>
                    Submit Application
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500 font-medium">
                No payment information required upfront. We will contact you within 24 hours via WhatsApp after reviewing your details.
              </p>
            </div>

          </form>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
