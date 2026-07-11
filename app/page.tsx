'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ChevronRight, Star, 
  Video, Clock, ShieldCheck, 
  ArrowRight, Quote, BookOpen,
  CheckCircle, FileText, Smartphone,
  Mic, Video as VideoIcon, VideoOff, Monitor, PhoneOff, Lock,
  MousePointer, Edit3, Highlighter, Trash2, X, Megaphone
} from 'lucide-react'
import PublicNavbar from '@/components/PublicNavbar'
import PublicFooter from '@/components/PublicFooter'
import GeometricPattern from '@/components/GeometricPattern'

// Simple animated waveform component to show active speaking
function Waveform() {
  const [heights, setHeights] = useState([8, 16, 24, 12, 18, 6])

  useEffect(() => {
    const interval = setInterval(() => {
      setHeights(prev => prev.map(() => Math.floor(Math.random() * 20) + 6))
    }, 120)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-0.5 h-6">
      {heights.map((h, i) => (
        <span 
          key={i} 
          className="w-1 bg-[#C9A84C] rounded-full transition-all duration-100 ease-in-out" 
          style={{ height: `${h}px` }}
        />
      ))}
    </div>
  )
}
const FATIHA_WORDS = [
  [
    { code: "أ", color: "" },
    { code: "ب", color: "" },
    { code: "ت", color: "text-[#C9A84C]" },
    { code: "ث", color: "text-[#1B6B3A]" }
  ],
  [
    { code: "ج", color: "" },
    { code: "ح", color: "" },
    { code: "خ", color: "" },
    { code: "د", color: "text-[#C9A84C]" }
  ],
  [
    { code: "ذ", color: "text-[#1B6B3A]" },
    { code: "ر", color: "" },
    { code: "ز", color: "" },
    { code: "س", color: "" }
  ],
  [
    { code: "ش", color: "" },
    { code: "ص", color: "text-[#C9A84C]" },
    { code: "ض", color: "" },
    { code: "ط", color: "" }
  ],
  [
    { code: "ظ", color: "" },
    { code: "ع", color: "text-[#1B6B3A]" },
    { code: "غ", color: "" },
    { code: "ف", color: "" }
  ],
  [
    { code: "ق", color: "text-rose-600" },
    { code: "ك", color: "" },
    { code: "ل", color: "" },
    { code: "م", color: "" }
  ],
  [
    { code: "ن", color: "" },
    { code: "هـ", color: "" },
    { code: "و", color: "" },
    { code: "ي", color: "" }
  ]
]

// --- Typewriter Rotating Heading Static Config ---
const TYPEWRITER_ITEMS = [
  {
    line1: "Structured Islamic Studies with",
    line2: "Live Human Teachers",
    dir: "ltr",
    isArabic: false
  },
  {
    line1: "خَيْرُكُم مَّن تَعَلَّمَ ٱلْقُرْءَانَ وَعَلَمَّهُۥ",
    line2: "The best among you are those who learn the Quran and teach it.",
    dir: "rtl",
    isArabic: true
  },
  {
    line1: "أَفْضَلُ ٱلْعِبَادَةِ قِرَاءَةُ ٱلْقُرْءَانِ",
    line2: "The best form of worship is reading the Quran.",
    dir: "rtl",
    isArabic: true
  },
  {
    line1: "مَن قَرَأَ مِنَ ٱلْقُرْءَانِ حَرْفًا فَلَهُۥ عَشْرُ حَسَنَـٰتٍ",
    line2: "Whoever reads a letter from the Quran will have ten rewards.",
    dir: "rtl",
    isArabic: true
  }
]

export default function Home() {
  const isMuted = false
  const isVideoOff = false

  // --- Typewriter Rotating Heading Logic ---
  const [itemIndex, setItemIndex] = useState(0)
  const [text1, setText1] = useState('')
  const [text2, setText2] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentItem = TYPEWRITER_ITEMS[itemIndex]
    const fullLine1 = currentItem.line1
    const fullLine2 = currentItem.line2
    const totalLength = fullLine1.length + fullLine2.length

    let timer: ReturnType<typeof setTimeout>

    if (!isDeleting) {
      // Typing phase: type character-by-character
      const currentLength = text1.length + text2.length
      if (currentLength < totalLength) {
        timer = setTimeout(() => {
          if (text1.length < fullLine1.length) {
            setText1(fullLine1.slice(0, text1.length + 1))
          } else {
            setText2(fullLine2.slice(0, text2.length + 1))
          }
        }, 50) // typing speed: 50ms per character
      } else {
        // Complete display: hold for 3 seconds
        timer = setTimeout(() => {
          setIsDeleting(true)
        }, 3000)
      }
    } else {
      // Deleting phase: backspace simulation from end to start
      const currentLength = text1.length + text2.length
      if (currentLength > 0) {
        timer = setTimeout(() => {
          if (text2.length > 0) {
            setText2(fullLine2.slice(0, text2.length - 1))
          } else {
            setText1(fullLine1.slice(0, text1.length - 1))
          }
        }, 30) // deleting speed: 30ms per character
      } else {
        // Reset and rotate to next heading item
        setIsDeleting(false)
        setItemIndex((prev) => (prev + 1) % TYPEWRITER_ITEMS.length)
      }
    }

    return () => clearTimeout(timer)
  }, [text1, text2, isDeleting, itemIndex])

  const [activeAnnouncement, setActiveAnnouncement] = useState<{
    title: string
    message: string
    startDate: string
    endDate: string
    appliesTo: string
  } | null>(null)

  const [oneOnOneCourses, setOneOnOneCourses] = useState<any[]>([])
  const [groupCourses, setGroupCourses] = useState<any[]>([])
  const [loadingCourses, setLoadingCourses] = useState(true)

  useEffect(() => {
    // Fetch active announcement
    fetch('/api/public/announcements')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch announcements')
        return res.json()
      })
      .then(data => {
        const referenceDate = new Date('2026-06-30T12:00:00')
        const active = data.find((ann: any) => {
          const start = new Date(ann.start_date + 'T00:00:00')
          const end = new Date(ann.end_date + 'T23:59:59')
          return referenceDate >= start && referenceDate <= end
        })

        if (active) {
          let appliesTo = 'All'
          if (active.applies_to === '1:1') appliesTo = '1:1 Only'
          if (active.applies_to === 'group') appliesTo = 'Group Only'

          setActiveAnnouncement({
            title: active.title,
            message: active.content,
            startDate: active.start_date,
            endDate: active.end_date,
            appliesTo
          })
        }
      })
      .catch(err => console.error('Error fetching active announcement:', err))

    // Fetch active courses
    fetch('/api/public/courses')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch courses')
        return res.json()
      })
      .then(data => {
        const active = data.filter((c: any) => c.active)
        setOneOnOneCourses(active.filter((c: any) => c.program_type === '1:1'))
        setGroupCourses(active.filter((c: any) => c.program_type === 'group'))
      })
      .catch(err => console.error('Error fetching courses:', err))
      .finally(() => setLoadingCourses(false))
  }, [])
  
  // Real differentiators
  const highlights = [
    {
      icon: Video,
      title: "Live 1:1 Class Format",
      desc: "Interactive, real-time sessions with a dedicated teacher in a private browser environment. No pre-recorded videos."
    },
    {
      icon: ShieldCheck,
      title: "Strict Gender Matching",
      desc: "Male teachers are strictly assigned to male students, and female teachers to female students to ensure complete comfort."
    },
    {
      icon: FileText,
      title: "Structured Lesson Reports",
      desc: "Receive a detailed lesson summary and feedback report on your student portal dashboard immediately after every session."
    },
    {
      icon: Clock,
      title: "Flexible Global Scheduling",
      desc: "Select your preferred times. Our self-hosted scheduling system supports flexible timetables across all global timezones."
    },
    {
      icon: Star,
      title: "3-Day Trial Period",
      desc: "Try any of our 1:1 programs for three days with confidence. Start after completing your enrollment fee."
    },
    {
      icon: Smartphone,
      title: "100% Browser-Based Platform",
      desc: "Zero software or apps to install. Join classes instantly on mobile, tablet, or desktop via our self-hosted Jitsi Meet gateway."
    }
  ]

  // How it works steps
  const steps = [
    {
      number: "01",
      title: "Submit Admission Form",
      desc: "Choose your course, state your preferred days, and specify your teacher gender requirement in our secure form."
    },
    {
      number: "02",
      title: "Get Matched with Teacher",
      desc: "Our academic coordinator reviews your background and pairs you with a qualified, gender-matched scholar."
    },
    {
      number: "03",
      title: "3-Day Trial (1:1)",
      desc: "Meet your teacher, experience our Jitsi classroom portal, and receive a starting recitation level evaluation."
    },
    {
      number: "04",
      title: "Begin Regular Classes",
      desc: "Confirm your monthly plan ($60/mo for 1:1, $10/mo for Group) to establish your permanent slot on the calendar."
    }
  ]

  return (
    <div className="public-page min-h-screen flex flex-col font-sans bg-[#FAFAF7]">
      <PublicNavbar />

      {/* Hero Section */}
      <section 
        className="relative overflow-hidden min-h-[85vh] flex items-center bg-gradient-to-b from-[#E8F5EE] via-[#FAFAF7] to-[#FAFAF7]"
        aria-labelledby="hero-heading"
      >
        <GeometricPattern opacity={0.06} />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-6 text-left animate-fade-in-up">
              <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full text-xs font-bold uppercase tracking-wider border border-[#1B6B3A]/20 bg-[#1B6B3A]/5 text-[#1B6B3A]">
                <span className="w-2 h-2 rounded-full bg-[#1B6B3A] animate-ping" />
                Live 1:1 &amp; Group Islamic Learning
              </div>
              
              <h1 
                id="hero-heading"
                className="font-serif font-bold leading-tight text-gray-900 hero-title"
                style={{ 
                  fontSize: "clamp(2.2rem, 4.5vw, 3.5rem)",
                  minHeight: "160px" // Prevent content jump shifts during typing transitions
                }}
                dir={TYPEWRITER_ITEMS[itemIndex].dir === 'rtl' ? 'rtl' : 'ltr'}
              >
                {/* Line 1 - Primary heading statement (standard Cormorant Garamond vs Amiri Arabic font fallback) */}
                <span 
                  className={`block line-1 ${TYPEWRITER_ITEMS[itemIndex].isArabic ? 'arabic-font' : ''}`}
                  dir={TYPEWRITER_ITEMS[itemIndex].dir === 'rtl' ? 'rtl' : 'ltr'}
                  style={{
                    textAlign: TYPEWRITER_ITEMS[itemIndex].dir === 'rtl' ? 'right' : 'left',
                    fontWeight: TYPEWRITER_ITEMS[itemIndex].isArabic ? 'normal' : 'bold',
                    lineHeight: TYPEWRITER_ITEMS[itemIndex].isArabic ? '1.5' : '1.2'
                  }}
                >
                  {text1}
                  {/* Blinking text cursor for line 1 */}
                  {!isDeleting && text1.length < TYPEWRITER_ITEMS[itemIndex].line1.length && (
                    <span className={`animate-pulse ${TYPEWRITER_ITEMS[itemIndex].dir === 'rtl' ? 'mr-1' : 'ml-1'}`}>|</span>
                  )}
                </span>
                
                {/* Line 2 - Highlight green label / English translation */}
                <span 
                  className="line-2 block text-[#00b894] italic font-serif"
                  dir="ltr"
                  style={{
                    textAlign: 'left'
                  }}
                >
                  {text2}
                  {/* Blinking text cursor for line 2 */}
                  {!isDeleting && text1.length >= TYPEWRITER_ITEMS[itemIndex].line1.length && text2.length < TYPEWRITER_ITEMS[itemIndex].line2.length && (
                    <span className="animate-pulse ml-1">|</span>
                  )}
                  {/* Persistent blinking cursor when typing is complete */}
                  {!isDeleting && text1.length + text2.length === TYPEWRITER_ITEMS[itemIndex].line1.length + TYPEWRITER_ITEMS[itemIndex].line2.length && (
                    <span className="animate-pulse ml-1">|</span>
                  )}
                </span>
              </h1>
              
              <p className="text-base sm:text-lg text-gray-650 leading-relaxed max-w-xl">
                A fully browser-based platform offering authentic Quranic recitation, classical Arabic, and theological courses. Experience focused mentorship with strict gender-matched assignments, live lesson logs, and zero app installations.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <Link
                  href="/admission"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#1B6B3A] hover:bg-[#1B6B3A]/95 text-white active:scale-[0.98] py-4 px-8 font-bold shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#1B6B3A] focus:ring-offset-2"
                >
                  Start 3-Day Trial
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/courses"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border-2 border-[#1B6B3A] text-[#1B6B3A] hover:bg-[#1B6B3A]/5 active:scale-[0.98] py-4 px-8 font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#1B6B3A] focus:ring-offset-2"
                >
                  View Courses
                </Link>
              </div>

              {/* Quick info note */}
              <div className="pt-2 flex items-center gap-6 text-xs text-gray-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4.5 h-4.5 text-[#C9A84C]" />
                  3-Day Trial
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4.5 h-4.5 text-[#C9A84C]" />
                  Jitsi Meet Integrated
                </span>
              </div>
            </div>

            {/* Right Visual Column - The Signature Jitsi Meet Mockup */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end animate-fade-in-up">
              <div 
                className="w-full max-w-[500px] bg-gray-950 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden flex flex-col transition-all hover:scale-[1.01] hover:border-[#1B6B3A]/30 duration-300 select-none"
                style={{ aspectRatio: "4/3", userSelect: "none", WebkitUserSelect: "none" }}
              >
                {/* Inner wrapper to disable pointer events on all elements inside */}
                <div className="pointer-events-none flex flex-col h-full w-full flex-grow">

                  {/* Jitsi Window Header */}
                  <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                        <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                        <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                      </div>
                      <span className="text-[10px] sm:text-xs text-gray-400 font-semibold ml-2 font-mono truncate max-w-[180px] sm:max-w-none">
                        classroom.virtualzawiyah.com/live
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] text-emerald-400 font-bold font-mono tracking-wider uppercase">
                        Live (Jitsi)
                      </span>
                    </div>
                  </div>

                  {/* Classroom Video Viewport */}
                  <div className="flex-grow bg-gray-950 relative p-4 flex flex-col md:flex-row gap-3">
                    
                    {/* Left: Shared Screen - Digital Mushaf (Surah Al-Fatiha) */}
                    <div className="flex-grow bg-[#FAFAF8] rounded-xl border border-gray-200/30 p-3 sm:p-4 flex flex-col justify-between shadow-inner relative text-[#1A1A1A] overflow-hidden select-none">
                      
                      {/* Whiteboard Header with Toolbar */}
                      <div className="flex items-center justify-between border-b border-gray-200/80 pb-2 mb-2 font-sans">
                        <span className="text-[8px] sm:text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                          Shared Board
                        </span>
                        
                        {/* Interactive-looking whiteboard toolbar */}
                        <div className="flex items-center gap-1 bg-gray-100/80 rounded-lg p-0.5 border border-gray-200 shadow-xs scale-90 sm:scale-100 origin-right">
                          <button className="p-0.5 sm:p-1 rounded bg-white text-primary border border-gray-200 shadow-xs" title="Cursor Select">
                            <MousePointer className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          </button>
                          <button className="p-0.5 sm:p-1 rounded text-gray-500 hover:bg-white hover:text-gray-900 transition-all" title="Drawing Tool">
                            <Edit3 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          </button>
                          <button className="p-0.5 sm:p-1 rounded text-gray-500 hover:bg-white hover:text-gray-900 transition-all" title="Highlight Rule">
                            <Highlighter className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          </button>
                          <span className="w-[1px] h-3 bg-gray-300 mx-0.5" />
                          <div className="flex gap-0.5 px-0.5">
                            <span className="w-3 h-3 rounded-full bg-emerald-600 border border-emerald-700 cursor-pointer shadow-xs" title="Tajweed Ikhfa (Green)" />
                            <span className="w-3 h-3 rounded-full bg-[#C9A84C] border border-[#C9A84C]/80 cursor-pointer shadow-xs" title="Tajweed Madd (Gold)" />
                            <span className="w-3 h-3 rounded-full bg-rose-600 border border-rose-700 cursor-pointer shadow-xs" title="Tajweed Qalqalah (Red)" />
                          </div>
                          <span className="w-[1px] h-3 bg-gray-300 mx-0.5" />
                          <button className="p-0.5 sm:p-1 rounded text-gray-500 hover:bg-white hover:text-gray-900 transition-all" title="Clear Canvas">
                            <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Quranic Board Area */}
                      <div className="flex-grow flex flex-col items-center justify-center py-2 sm:py-3 border-2 border-dashed border-gray-200 rounded-lg bg-[#FDFDFB] shadow-inner relative overflow-hidden">
                        
                        {/* Decorative Mushaf Margin Borders */}
                        <div className="absolute inset-1 border border-[#C9A84C]/25 rounded-md pointer-events-none" />
                        <div className="absolute inset-1.5 border border-[#C9A84C]/15 rounded-md pointer-events-none" />
                        
                        {/* Quranic Calligraphy rendered page-by-page */}
                        <div className="w-full flex flex-col items-center justify-center space-y-1 sm:space-y-1.5 md:space-y-2 select-none" dir="rtl">
                          {FATIHA_WORDS.map((line, lineIdx) => (
                            <div 
                              key={lineIdx} 
                              className="flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 text-[13px] sm:text-base md:text-lg lg:text-[21px] font-normal leading-[1.8] text-gray-900 whitespace-nowrap"
                            >
                              {line.map((word, wordIdx) => (
                                <span 
                                  key={wordIdx} 
                                  className={`relative inline-block transition-colors hover:text-primary ${word.color}`}
                                >
                                  {word.code}
                                  
                                  {/* Anchored Teacher laser pointer overlay */}
                                  {word.code === "ق" && (
                                    <div className="absolute -bottom-5 -left-12 pointer-events-none flex items-center gap-1 z-20 animate-float scale-90 sm:scale-100">
                                      <span className="w-2 h-2 rounded-full bg-rose-500 ring-4 ring-rose-500/30 inline-block animate-pulse" />
                                      <span className="text-[7px] bg-rose-600 text-white font-bold px-1 py-0.5 rounded shadow-md font-sans whitespace-nowrap">
                                        Ustadh Ahmad
                                      </span>
                                    </div>
                                  )}
                                </span>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-2 flex items-center justify-between text-[8px] sm:text-[9px] font-semibold text-gray-500 font-sans">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                          Tajweed Mode: Enabled
                        </span>
                        <span className="text-[#1B6B3A] font-mono">Surah Al-Fatiha • Page 1</span>
                      </div>
                    </div>

                    {/* Right Sidebar: Video Feeds */}
                    <div className="w-full md:w-36 flex md:flex-col gap-2 shrink-0">
                      
                      {/* Teacher Video Feed */}
                      <div className="flex-1 bg-gray-900 rounded-xl overflow-hidden border border-gray-800 p-2 flex flex-col items-center justify-center text-center relative aspect-square md:aspect-auto">
                        <div className="w-10 h-10 rounded-full bg-[#1B6B3A]/20 border border-[#1B6B3A]/40 flex items-center justify-center mb-1 relative">
                          <span className="text-white text-xs font-serif font-bold">AB</span>
                          <div className="absolute -bottom-1 -right-1 bg-emerald-500 p-0.5 rounded-full text-white">
                            <CheckCircle className="w-3.5 h-3.5 fill-[#1B6B3A]" />
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-gray-200 truncate max-w-full">Ustadh Ahmad</span>
                        <span className="text-[8px] text-[#C9A84C] font-semibold">Teacher</span>
                        
                        {/* Interactive audio display */}
                        <div className="absolute top-1.5 right-2">
                          <Waveform />
                        </div>
                      </div>

                      {/* Student Video Feed */}
                      <div className="flex-1 bg-gray-900 rounded-xl overflow-hidden border border-gray-800 p-2 flex flex-col items-center justify-center text-center relative aspect-square md:aspect-auto">
                        {isVideoOff ? (
                          <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center mb-1">
                            <VideoOff className="w-4 h-4 text-gray-500" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#C9A84C]/25 border border-[#C9A84C]/40 flex items-center justify-center mb-1 relative">
                            <span className="text-white text-xs font-semibold">You</span>
                          </div>
                        )}
                        
                        <span className="text-[10px] font-bold text-gray-300">Suhail (Student)</span>
                        <span className="text-[8px] text-gray-500 font-semibold">Live Match</span>

                        {/* Microphone display */}
                        <div className="absolute top-2 right-2">
                          {isMuted ? (
                            <Mic className="w-3 h-3 text-rose-500" />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          )}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Live Lesson Log / Feedback Ticker */}
                  <div className="bg-gray-900 border-t border-gray-800 px-4 py-2 flex items-center gap-2">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#C9A84C] bg-[#C9A84C]/10 border border-[#C9A84C]/20 px-1.5 py-0.5 rounded shrink-0">
                      Live Feedback
                    </span>
                    <p className="text-[10px] text-gray-300 truncate italic">
                      &quot;Makhraj of letters corrected: Tajweed on letter [ق] corrected by Ustadh Ahmad&quot;
                    </p>
                  </div>

                  {/* Jitsi Bottom Control Panel */}
                  <div className="bg-gray-900 border-t border-gray-800 px-4 py-3 flex items-center justify-between">
                    <div className="flex gap-2">
                      <div className="p-2 rounded-lg bg-gray-800 text-gray-300">
                        <Mic className="w-4 h-4" />
                      </div>
                      <div className="p-2 rounded-lg bg-gray-800 text-gray-300">
                        <VideoIcon className="w-4 h-4" />
                      </div>
                      <div className="p-2 rounded-lg bg-gray-800 text-gray-300">
                        <Monitor className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-rose-650 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5">
                        <PhoneOff className="w-3.5 h-3.5" />
                        Disconnect
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Highlights / Differentiators Section */}
      <section 
        className="py-24 bg-white relative z-10 border-t border-gray-200/40"
        aria-labelledby="highlights-heading"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#C9A84C] block">Designed for Authentic Learning</span>
            <h2 id="highlights-heading" className="font-serif font-bold text-3xl sm:text-4xl text-gray-900">
              The Virtual Zawiyah Standard
            </h2>
            <p className="text-sm text-gray-500">
              We focus on structure, academic integrity, and student convenience. Learn how we set the standard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {highlights.map((h, i) => {
              const Icon = h.icon
              return (
                <div 
                  key={i} 
                  className="bg-[#FAFAF7] rounded-2xl p-7 border border-[#1B6B3A]/10 hover:border-[#1B6B3A]/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-within:ring-2 focus-within:ring-[#1B6B3A]"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#1B6B3A]/10 text-[#1B6B3A] flex items-center justify-center mb-5 shadow-sm">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif font-bold text-lg text-gray-900 mb-2.5">
                    {h.title}
                  </h3>
                  <p className="text-sm text-gray-650 leading-relaxed">
                    {h.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Course Preview Section */}
      <section 
        className="py-24 bg-[#FAFAF7] relative z-10 border-t border-gray-200/40"
        aria-labelledby="courses-heading"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#C9A84C] block">Our Syllabus</span>
            <h2 id="courses-heading" className="font-serif font-bold text-3xl sm:text-4xl text-gray-900">
              Islamic Studies Curriculum
            </h2>
            <p className="text-sm text-gray-500">
              Select between individual mentorship programs or structured classical group studies.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
            
            {/* 1:1 Classes Card */}
            <div className="bg-white rounded-2xl border border-[#1B6B3A]/15 shadow-md p-8 md:p-10 flex flex-col justify-between hover:shadow-xl transition-all duration-300">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest bg-[#1B6B3A]/10 text-[#1B6B3A] border border-[#1B6B3A]/20 px-3 py-1 rounded-full mb-1">
                      1:1 Private Mentorship
                    </span>
                    <h3 className="font-serif font-bold text-2xl text-gray-900 mt-2">Individual Classes</h3>
                  </div>
                  <div className="bg-[#E8F5EE] border border-[#1B6B3A]/15 rounded-xl px-5 py-3 text-center">
                    <span className="block text-[9px] uppercase font-bold tracking-wider text-[#1B6B3A]">Tuition Plan</span>
                    <span className="text-2xl font-bold text-[#1B6B3A] font-serif">
                      ${oneOnOneCourses.length > 0 ? Number(oneOnOneCourses[0].base_fee) : 60}
                    </span>
                    <span className="text-xs font-semibold text-gray-500">/mo</span>
                  </div>
                </div>

                <p className="text-sm text-gray-650 mb-6 leading-relaxed">
                  Personalized, pace-adjusted instruction with a dedicated scholar. Classes run 30-minute standard durations. Includes a 3-day trial.
                </p>

                <div className="border-t border-gray-100 pt-6 mb-8">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-550 mb-4">Available 1:1 Courses</h4>
                  {loadingCourses ? (
                    <p className="text-xs text-gray-500 italic">Loading courses...</p>
                  ) : oneOnOneCourses.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">No courses currently available.</p>
                  ) : (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm text-gray-700">
                      {oneOnOneCourses.map((course, idx) => (
                        <li key={course.id || idx} className="flex items-start gap-2.5">
                          <CheckCircle className="w-4.5 h-4.5 text-[#C9A84C] shrink-0 mt-0.5" />
                          <span>{course.title}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-gray-50 mt-6">
                <span className="text-xs text-emerald-700 font-bold bg-[#E8F5EE] px-3 py-1 rounded-md border border-emerald-200">
                  ★ 3-Day Trial Available
                </span>
                <Link 
                  href="/courses" 
                  className="inline-flex items-center gap-1 text-sm font-bold text-[#1B6B3A] hover:underline focus:outline-none focus:ring-2 focus:ring-[#1B6B3A] rounded p-1"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Group Classes Card */}
            <div className="bg-white rounded-2xl border border-[#C9A84C]/25 shadow-md p-8 md:p-10 flex flex-col justify-between hover:shadow-xl transition-all duration-300">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest bg-[#C9A84C]/15 text-[#8B6914] border border-[#C9A84C]/35 px-3 py-1 rounded-full mb-1">
                      Structured Group Learning
                    </span>
                    <h3 className="font-serif font-bold text-2xl text-gray-900 mt-2">Group Programs</h3>
                  </div>
                  <div className="bg-[#FAFAF7] border border-[#C9A84C]/25 rounded-xl px-5 py-3 text-center">
                    <span className="block text-[9px] uppercase font-bold tracking-wider text-[#8B6914]">Tuition Plan</span>
                    <span className="text-2xl font-bold text-[#8B6914] font-serif">
                      ${groupCourses.length > 0 ? Number(groupCourses[0].base_fee) : 10}
                    </span>
                    <span className="text-xs font-semibold text-gray-500">/mo</span>
                  </div>
                </div>

                <p className="text-sm text-gray-650 mb-6 leading-relaxed">
                  Rigorous, multi-year group classes structured with fellow global peers. Ideal for complete seminary qualifications. Standard curriculum (No trial).
                </p>

                <div className="border-t border-gray-100 pt-6 mb-8">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-550 mb-4">Offered Group Curriculums</h4>
                  {loadingCourses ? (
                    <p className="text-xs text-gray-500 italic">Loading courses...</p>
                  ) : groupCourses.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">No courses currently available.</p>
                  ) : (
                    <ul className="flex flex-col gap-4 text-sm text-gray-700">
                      {groupCourses.map((course, idx) => (
                        <li key={course.id || idx} className="flex items-start gap-3">
                          <div className="p-1 rounded bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#8B6914] shrink-0 mt-0.5">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div>
                            <strong className="block text-gray-900 font-bold">{course.title}</strong>
                            <span className="text-xs text-gray-500 block mt-0.5">{course.description}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-gray-50 mt-6">
                <span className="text-xs text-gray-500 font-semibold italic">
                  Classes run 6 days/week (Mon–Sat)
                </span>
                <Link 
                  href="/courses" 
                  className="inline-flex items-center gap-1 text-sm font-bold text-[#1B6B3A] hover:underline focus:outline-none focus:ring-2 focus:ring-[#1B6B3A] rounded p-1"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section 
        className="py-24 bg-white relative overflow-hidden z-10 border-t border-gray-200/40"
        aria-labelledby="how-it-works-heading"
      >
        <GeometricPattern opacity={0.04} />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#C9A84C] block">Your Path to Learning</span>
            <h2 id="how-it-works-heading" className="font-serif font-bold text-3xl sm:text-4xl text-gray-900">
              Admission to Class in 4 Steps
            </h2>
            <p className="text-sm text-gray-500">
              A structured roadmap from submission to starting regular curriculum studies.
            </p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {/* Timeline connector line for desktop */}
            <div className="hidden md:block absolute top-[44px] left-[12%] right-[12%] h-[1.5px] bg-gray-200 z-0" />
            
            {steps.map((s, i) => (
              <div key={i} className="text-center relative z-10 group flex flex-col items-center">
                <div className="w-20 h-20 rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center mb-6 transition-all group-hover:border-[#1B6B3A] group-hover:shadow-md duration-300 ring-4 ring-[#FAFAF7]">
                  <span className="font-serif font-extrabold text-2xl text-[#1B6B3A]">
                    {s.number}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-lg text-gray-900 mb-2.5">
                  {s.title}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed max-w-[210px]">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link 
              href="/admission"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1B6B3A] hover:bg-[#1B6B3A]/95 text-white active:scale-[0.98] py-4 px-10 font-bold shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#1B6B3A] focus:ring-offset-2"
            >
              Submit Your Admission Application
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section 
        className="py-24 bg-[#FAFAF7] relative z-10 border-t border-gray-200/40"
        aria-labelledby="testimonials-heading"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#C9A84C] block">Client Verification</span>
            <h2 id="testimonials-heading" className="font-serif font-bold text-3xl sm:text-4xl text-gray-900">
              Feedback from Our Families
            </h2>
            {/* Testimonials Section - Placeholder reviews to be replaced by client quotes later */}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Testimonial 1 */}
            <div className="bg-white rounded-2xl border border-gray-200/70 p-8 flex flex-col justify-between shadow-sm relative">
              <div>
                <Quote className="w-7 h-7 text-[#C9A84C] mb-4 opacity-70" />
                <p className="text-sm italic text-gray-650 leading-relaxed mb-6">
                  &quot;We requested a female teacher for our 9-year-old daughter. The strict gender matching gives us total peace of mind. Her teacher, Ustadha Mariam, is incredibly patient and structured. The portal lesson reports keep us fully updated after every class.&quot;
                </p>
              </div>
              <div className="flex items-center gap-3.5 border-t border-gray-100 pt-5">
                <div className="w-10 h-10 rounded-full bg-[#1B6B3A]/10 text-[#1B6B3A] flex items-center justify-center font-bold text-sm">
                  KS
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-900">Khalid Siddiqui</h4>
                  <span className="text-[10px] text-gray-500 block">Parent (UK) • Applied Tajweed 1:1</span>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white rounded-2xl border border-gray-200/70 p-8 flex flex-col justify-between shadow-sm relative">
              <div>
                <Quote className="w-7 h-7 text-[#C9A84C] mb-4 opacity-70" />
                <p className="text-sm italic text-gray-650 leading-relaxed mb-6">
                  &quot;As a working professional in the US, standard fixed local schedules were impossible. The flexible timezone matching here let me coordinate late evening classes directly on the browser. Highly recommend the Quranic Grammar 1:1 syllabus.&quot;
                </p>
              </div>
              <div className="flex items-center gap-3.5 border-t border-gray-100 pt-5">
                <div className="w-10 h-10 rounded-full bg-[#1B6B3A]/10 text-[#1B6B3A] flex items-center justify-center font-bold text-sm">
                  ZH
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-900">Zaynul Haroon</h4>
                  <span className="text-[10px] text-gray-500 block">Student (US) • Arabic Grammar 1:1</span>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white rounded-2xl border border-gray-200/70 p-8 flex flex-col justify-between shadow-sm relative">
              <div>
                <Quote className="w-7 h-7 text-[#C9A84C] mb-4 opacity-70" />
                <p className="text-sm italic text-gray-650 leading-relaxed mb-6">
                  &quot;I entered Year 2 of the Dars-e-Nizami classical group program. The curriculum is extremely structured, covering deep Fiqh and Hadith. The self-hosted Jitsi classroom is crystal clear and completely browser-only, meaning I can join from my iPad easily.&quot;
                </p>
              </div>
              <div className="flex items-center gap-3.5 border-t border-gray-100 pt-5">
                <div className="w-10 h-10 rounded-full bg-[#1B6B3A]/10 text-[#1B6B3A] flex items-center justify-center font-bold text-sm">
                  FM
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-900">Faheem Malik</h4>
                  <span className="text-[10px] text-gray-500 block">Student (Canada) • Dars-e-Nizami Group</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Final Call-to-Action Band */}
      <section 
        className="py-20 relative bg-[#1B6B3A] text-white z-10 overflow-hidden"
        aria-labelledby="cta-heading"
      >
        <GeometricPattern opacity={0.06} />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6 animate-fade-in-up">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#C9A84C] bg-white/10 px-3.5 py-1 rounded-full border border-white/10 inline-block">
            Start Learning This Week
          </span>
          <h2 id="cta-heading" className="font-serif font-bold text-3xl sm:text-4xl text-white">
            Begin Your 3-Day Trial
          </h2>
          <p className="text-white/80 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Submit your preferences for class schedules and teacher genders. Our coordinators will match you and set up your trial credentials.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href="/admission"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#C9A84C] text-[#091E36] hover:bg-[#C9A84C]/90 active:scale-[0.98] py-4 px-10 font-bold shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:ring-offset-2"
            >
              Start Trial Class
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/courses"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 text-white hover:bg-white/10 active:scale-[0.98] py-4 px-10 font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-white"
            >
              See What You&apos;ll Learn
            </Link>
          </div>
          
          <div className="pt-4 flex items-center justify-center gap-2 text-xs text-white/60">
            <Lock className="w-4 h-4 shrink-0" />
            <span>Secure 256-bit Encrypted Student Portals</span>
          </div>
        </div>
      </section>

      {/* Announcement Popup Overlay */}
      {activeAnnouncement && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div 
            className="bg-white border-2 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up m-4"
            style={{ borderColor: "#1B6B3A" }}
          >
            {/* Header */}
            <div className="bg-[#1B6B3A] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-white/10 rounded-lg">
                  <Megaphone className="h-4.5 w-4.5 text-white" />
                </span>
                <h3 className="text-sm font-bold uppercase tracking-wider font-serif">
                  Important Announcement
                </h3>
              </div>
              <button 
                onClick={() => setActiveAnnouncement(null)}
                className="p-1 hover:bg-white/10 text-white/80 hover:text-white rounded-lg transition-colors focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6 space-y-4 text-left">
              <h4 className="text-sm font-bold text-gray-900 leading-snug">
                {activeAnnouncement.title}
              </h4>
              <p className="text-xs text-gray-655 leading-relaxed font-sans font-medium">
                {activeAnnouncement.message}
              </p>
              
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-[10px] font-medium text-gray-505">
                <div>
                  <span className="block text-[9px] uppercase font-bold tracking-wider">Date Span</span>
                  <span className="text-gray-700 font-mono font-bold">
                    {activeAnnouncement.startDate} to {activeAnnouncement.endDate}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-[9px] uppercase font-bold tracking-wider">Scope</span>
                  <span className="text-gray-800 font-bold">{activeAnnouncement.appliesTo}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-zinc-50 px-6 py-3.5 flex justify-end">
              <button
                onClick={() => setActiveAnnouncement(null)}
                className="px-5 py-2 bg-[#1B6B3A] hover:bg-[#1B6B3A]/95 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}

      <PublicFooter />
    </div>
  )
}
