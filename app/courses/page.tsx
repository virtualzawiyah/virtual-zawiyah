'use client'

import Link from 'next/link'
import PublicNavbar from '@/components/PublicNavbar'
import PublicFooter from '@/components/PublicFooter'
import { BookOpen, Target, Moon, Scroll, Globe, PenTool, Home, ArrowRight, Check } from 'lucide-react'

const oneOnOneCourses = [
  {
    id: 'quran-reading',
    title: 'Quran Reading with Tajweed',
    icon: BookOpen,
    description: 'Learn to read the Holy Quran correctly with proper Tajweed rules. This foundational course is suitable for beginners and those looking to improve their recitation. Progress at your own pace with personalized guidance.',
    duration: '30 / 60 / 90 min per session',
    points: [
      'Makhaarij (articulation points)',
      'Rules of Noon Sakinah & Tanween',
      'Rules of Madd',
      'Practice with Quran passages'
    ]
  },
  {
    id: 'applied-tajweed',
    title: 'Applied Tajweed (Basic)',
    icon: Target,
    description: 'A focused course on mastering the foundational rules of Tajweed with practical application. Ideal for students who can read Arabic but want to perfect their recitation quality.',
    duration: '30 / 60 / 90 min per session',
    points: [
      'All Tajweed rules systematically',
      'Audio feedback and correction',
      'Practical recitation exercises',
      'Recitation evaluation reports'
    ]
  },
  {
    id: 'quran-memorization',
    title: 'Quran Memorization (Hifz)',
    icon: Moon,
    description: 'Embark on the noble journey of becoming a Hafiz or Hafizah. This personalized course uses proven memorization techniques adapted to your schedule and learning style.',
    duration: '30 / 60 / 90 min per session',
    points: [
      'Personalized memorization plan',
      'Daily revision (muraja\'ah) sessions',
      'Tajweed-accurate memorization',
      'Progress tracking and reports'
    ]
  },
  {
    id: 'hadith-memorization',
    title: '40 Hadith Memorization',
    icon: Scroll,
    description: 'Memorize Imam Nawawi\'s collection of 40 essential Hadiths — the prophetic traditions every Muslim should know. Each Hadith is explained in context.',
    duration: '30 / 60 / 90 min per session',
    points: [
      'Full Arabic text memorization',
      'Meaning and explanation of each Hadith',
      'Chain of narration introduction',
      'Regular revision'
    ]
  },
  {
    id: 'quran-translation',
    title: 'Quran Translation',
    icon: Globe,
    description: 'Understand the meaning of the Quran in English. This course helps students connect with the Quran\'s message, themes, and wisdom beyond recitation.',
    duration: '30 / 60 / 90 min per session',
    points: [
      'Word-for-word translation',
      'Thematic understanding',
      'Tafsir introduction',
      'Contemporary application'
    ]
  },
  {
    id: 'arabic-grammar',
    title: 'Arabic Grammar (Sarf & Nahw)',
    icon: PenTool,
    description: 'Master classical Arabic grammar — the key that unlocks the Quran, Hadith, and Islamic texts. Covers both morphology (Sarf) and syntax (Nahw) in a structured sequence.',
    duration: '30 / 60 / 90 min per session',
    points: [
      'Arabic word morphology (Sarf)',
      'Arabic sentence structure (Nahw)',
      'Classical text reading',
      'Application to Quranic Arabic'
    ]
  }
]

const groupCourses = [
  {
    id: 'dars-e-nizami',
    title: 'Dars-e-Nizami — Classical Islamic Curriculum',
    icon: Home,
    description: 'The complete 8-year classical Islamic scholarship curriculum taught in traditional seminaries worldwide. Students select their year of entry at admission. Subjects include Fiqh, Hadith, Tafsir, Aqeedah, Arabic Grammar, Mantiq (Logic), Balagha (Rhetoric), and more.',
    duration: '120 min · 5 days/week',
    points: [
      '8-year structured curriculum',
      'Fiqh, Hadith, Tafsir, Aqeedah',
      'Mantiq, Balagha, and more',
      'Select Year 1 to 8 at enrollment'
    ]
  },
  {
    id: 'tajweed-group',
    title: 'Tajweed — 2-Year Structured Group Program',
    icon: Target,
    description: 'A comprehensive two-year group course covering all Tajweed rules from beginner to advanced level. Students progress through a structured curriculum alongside peers and benefit from group recitation practice.',
    duration: '120 min · 5 days/week',
    points: [
      'Complete Tajweed rules over 2 years',
      'Group recitation practice',
      'Regular assessments',
      'Certificate upon completion'
    ]
  }
]

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-x-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 inset-x-0 h-[600px] pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full bg-grid-pattern opacity-30" />
        <div className="absolute top-[10%] left-[20%] w-[300px] h-[300px] rounded-full bg-emerald-500/5 blur-[120px]" />
      </div>

      <PublicNavbar />

      <main className="flex-grow pt-32 pb-24 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 animate-fade-in-up">
          
          {/* Breadcrumbs */}
          <nav className="flex mb-8 text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">
            <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
            <span className="mx-2 text-zinc-700">/</span>
            <span className="text-emerald-400">Courses</span>
          </nav>

          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-sans bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
              Our Courses
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-sans font-light">
              Comprehensive Islamic education — from Quran recitation to classical scholarship. Every course taught by qualified scholars.
            </p>

            {/* Badges Bar */}
            <div className="inline-flex flex-wrap items-center justify-center gap-3 p-2 rounded-2xl bg-slate-900/50 border border-white/5 shadow-inner">
              <span className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                From $60 / month (1:1)
              </span>
              <span className="px-3 py-1 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-bold uppercase tracking-wider">
                $40 / month (Group)
              </span>
              <span className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                3 Days Free Trial
              </span>
            </div>
            
            <p className="text-xs text-zinc-500">
              Full pricing breakdown with all plan options on our{' '}
              <Link href="/pricing" className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors">
                Tuition & Fees page
              </Link>
              .
            </p>
          </div>

          {/* One-on-One Section */}
          <div className="mb-24">
            <div className="border-l-4 border-emerald-500 pl-5 mb-10 space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-white font-sans">
                One-on-One Courses
              </h2>
              <p className="text-xs text-zinc-450 font-sans font-light">
                Personalized instruction tailored to your pace and learning style. From $60/month · 3 days free trial.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {oneOnOneCourses.map((course) => {
                const Icon = course.icon
                return (
                  <div
                    key={course.id}
                    className="group relative flex flex-col justify-between rounded-2xl border border-white/5 bg-slate-900/20 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/20 hover:bg-slate-900/60 hover:shadow-xl hover:shadow-emerald-500/[0.01]"
                  >
                    <div>
                      {/* Course Header */}
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:bg-[#c19b4c] group-hover:text-slate-950 group-hover:border-transparent transition-all duration-500">
                          <Icon className="h-5.5 w-5.5" />
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/5">
                            One-on-One
                          </span>
                          <span className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                            3 Days Free
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors mb-3">
                        {course.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-zinc-400 leading-relaxed font-sans font-light mb-5 min-h-[72px]">
                        {course.description}
                      </p>

                      <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold mb-4 border-b border-white/5 pb-3">
                        Duration: {course.duration}
                      </div>

                      {/* Feature Bullet Points */}
                      <ul className="space-y-2.5 mb-8">
                        {course.points.map((pt, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-zinc-400 font-light">
                            <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 border-t border-white/5 pt-5">
                      <Link
                        href="/enrollment"
                        className="flex-grow flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 text-xs font-bold text-white shadow shadow-emerald-500/10 active:scale-[0.98] transition-all"
                      >
                        Apply Now
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                      <Link
                        href="/pricing"
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-zinc-300 hover:bg-white/10 hover:text-white transition-all active:scale-[0.98]"
                      >
                        Fees
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Group Section */}
          <div className="mb-12">
            <div className="border-l-4 border-teal-500 pl-5 mb-10 space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-white font-sans">
                Group Courses
              </h2>
              <p className="text-xs text-zinc-450 font-sans font-light">
                Structured group learning with fellow students. $40/month · 120 min · 5 days/week.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {groupCourses.map((course) => {
                const Icon = course.icon
                return (
                  <div
                    key={course.id}
                    className="group relative flex flex-col justify-between rounded-2xl border border-white/5 bg-slate-900/20 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-500/20 hover:bg-slate-900/60 hover:shadow-xl hover:shadow-teal-500/[0.01]"
                  >
                    <div>
                      {/* Course Header */}
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 group-hover:bg-[#c19b4c] group-hover:text-slate-950 group-hover:border-transparent transition-all duration-500">
                          <Icon className="h-5.5 w-5.5" />
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/5">
                          Group
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors mb-3">
                        {course.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-zinc-400 leading-relaxed font-sans font-light mb-5 min-h-[48px]">
                        {course.description}
                      </p>

                      <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold mb-4 border-b border-white/5 pb-3">
                        Duration: {course.duration}
                      </div>

                      {/* Feature Bullet Points */}
                      <ul className="space-y-2.5 mb-8">
                        {course.points.map((pt, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-zinc-400 font-light">
                            <Check className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 border-t border-white/5 pt-5">
                      <Link
                        href="/enrollment"
                        className="flex-grow flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 py-3 text-xs font-bold text-white shadow shadow-teal-500/10 active:scale-[0.98] transition-all"
                      >
                        Apply Now
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                      <Link
                        href="/pricing"
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-zinc-300 hover:bg-white/10 hover:text-white transition-all active:scale-[0.98]"
                      >
                        Fees
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Bottom Banner */}
          <div className="mt-20 rounded-3xl border border-white/5 bg-gradient-to-r from-emerald-950/40 to-slate-900/60 p-8 sm:p-12 text-center backdrop-blur-sm relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-44 h-44 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            <h3 className="text-xl font-bold text-white mb-2.5">
              Not sure which course is right for you?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto mb-8 font-sans font-light">
              Our admissions team will help match you with the perfect course and teacher based on your current level, goals, and availability.
            </p>
            <Link
              href="/enrollment"
              className="inline-flex items-center gap-2 rounded-xl bg-[#c19b4c] hover:bg-[#b08b3e] text-slate-950 py-3.5 px-8 text-xs font-bold shadow-lg shadow-[#c19b4c]/10 active:scale-[0.98] transition-all"
            >
              Apply Now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
