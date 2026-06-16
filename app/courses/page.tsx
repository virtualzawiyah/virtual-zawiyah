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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <PublicNavbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumbs */}
          <nav className="flex mb-6 text-xs text-zinc-500 uppercase tracking-wider font-semibold">
            <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
            <span className="mx-2 text-zinc-700">/</span>
            <span className="text-emerald-400">Courses</span>
          </nav>

          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent mb-4">
              Our Courses
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed font-sans mb-8">
              Comprehensive Islamic education — from Quran recitation to classical scholarship. Every course taught by qualified scholars.
            </p>

            {/* Badges Bar */}
            <div className="inline-flex flex-wrap items-center justify-center gap-3 p-1.5 rounded-2xl bg-slate-900 border border-white/5 shadow-inner">
              <span className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                From $60 / month (1:1)
              </span>
              <span className="px-3 py-1 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold">
                $40 / month (Group)
              </span>
              <span className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                3 Days Free Trial
              </span>
            </div>
            
            <p className="mt-4 text-xs text-zinc-500">
              Full pricing breakdown with all plan options on our{' '}
              <Link href="/pricing" className="text-emerald-400 underline underline-offset-2 hover:text-emerald-300">
                Tuition & Fees page
              </Link>
              .
            </p>
          </div>

          {/* One-on-One Section */}
          <div className="mb-20">
            <div className="border-l-4 border-emerald-500 pl-4 mb-8">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
                One-on-One Courses
              </h2>
              <p className="text-xs text-zinc-400 mt-1 font-sans">
                Personalized instruction tailored to your pace and learning style. From $60/month · 3 days free trial.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {oneOnOneCourses.map((course) => {
                const Icon = course.icon
                return (
                  <div
                    key={course.id}
                    className="group relative flex flex-col justify-between rounded-2xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-sm transition-all hover:border-emerald-500/30 hover:bg-slate-900/80 hover:shadow-xl hover:shadow-emerald-500/[0.02]"
                  >
                    <div>
                      {/* Course Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                          <Icon className="h-5.5 w-5.5" />
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-zinc-300 border border-white/5">
                            One-on-One
                          </span>
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                            3 Days Free
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors mb-2.5">
                        {course.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-zinc-400 leading-relaxed font-sans mb-4 min-h-[72px]">
                        {course.description}
                      </p>

                      <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-4 border-b border-white/5 pb-2.5">
                        Duration: {course.duration}
                      </div>

                      {/* Feature Bullet Points */}
                      <ul className="space-y-2 mb-6">
                        {course.points.map((pt, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-zinc-400">
                            <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-4">
                      <Link
                        href="/enrollment"
                        className="flex-grow flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow shadow-emerald-500/10 hover:bg-emerald-500 active:scale-[0.98] transition-all"
                      >
                        Apply Now
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                      <Link
                        href="/pricing"
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-all"
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
            <div className="border-l-4 border-teal-500 pl-4 mb-8">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
                Group Courses
              </h2>
              <p className="text-xs text-zinc-400 mt-1 font-sans">
                Structured group learning with fellow students. $40/month · 120 min · 5 days/week.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {groupCourses.map((course) => {
                const Icon = course.icon
                return (
                  <div
                    key={course.id}
                    className="group relative flex flex-col justify-between rounded-2xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-sm transition-all hover:border-teal-500/30 hover:bg-slate-900/80 hover:shadow-xl hover:shadow-teal-500/[0.02]"
                  >
                    <div>
                      {/* Course Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-all">
                          <Icon className="h-5.5 w-5.5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-zinc-300 border border-white/5">
                          Group
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-bold text-white group-hover:text-teal-400 transition-colors mb-2.5">
                        {course.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-zinc-400 leading-relaxed font-sans mb-4 min-h-[48px]">
                        {course.description}
                      </p>

                      <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-4 border-b border-white/5 pb-2.5">
                        Duration: {course.duration}
                      </div>

                      {/* Feature Bullet Points */}
                      <ul className="space-y-2 mb-6">
                        {course.points.map((pt, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-zinc-400">
                            <Check className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-4">
                      <Link
                        href="/enrollment"
                        className="flex-grow flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 py-2.5 text-xs font-bold text-white shadow shadow-teal-500/10 hover:bg-teal-500 active:scale-[0.98] transition-all"
                      >
                        Apply Now
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                      <Link
                        href="/pricing"
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-all"
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
          <div className="mt-16 rounded-3xl border border-white/5 bg-gradient-to-r from-emerald-950/40 to-slate-900/60 p-8 text-center backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-2.5">
              Not sure which course is right for you?
            </h3>
            <p className="text-xs text-zinc-400 max-w-xl mx-auto mb-6">
              Our admissions team will help match you with the perfect course and teacher based on your current level, goals, and availability.
            </p>
            <Link
              href="/enrollment"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 py-3 px-6 text-sm font-bold text-white shadow hover:bg-emerald-500 active:scale-[0.98] transition-all"
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
