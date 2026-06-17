'use client'

import Link from 'next/link'
import PublicNavbar from '@/components/PublicNavbar'
import PublicFooter from '@/components/PublicFooter'
import { Sparkles, ArrowRight, GraduationCap, Calendar, ShieldCheck, BookOpen, Moon, Target, Compass, ChevronRight } from 'lucide-react'

export default function Home() {
  const stats = [
    { value: '500+', label: 'Active Students' },
    { value: '20+', label: 'Qualified Teachers' },
    { value: '30+', label: 'Countries Served' },
    { value: '8', label: 'Courses Offered' }
  ]

  const corePillars = [
    {
      title: 'Live One-on-One Classes',
      description: 'Personalized attention from qualified teachers in real-time sessions tailored to your pace.',
      icon: GraduationCap,
      color: 'text-[#c19b4c] bg-[#c19b4c]/10 border-[#c19b4c]/20'
    },
    {
      title: 'Qualified Scholars',
      description: 'All teachers hold traditional Islamic qualifications — Hafiz, Alim, and Tajweed-certified.',
      icon: Sparkles,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    },
    {
      title: 'Flexible Scheduling',
      description: 'Choose your preferred days and times. Classes fit around your life, not the other way around.',
      icon: Calendar,
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/20'
    },
    {
      title: 'Gender-Segregated Teaching',
      description: 'Male teachers for male students, female teachers for female students — always.',
      icon: ShieldCheck,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
    }
  ]

  const featuredCourses = [
    {
      title: 'Quran Reading with Tajweed',
      description: 'Master correct Quranic recitation with professional Tajweed rules from a qualified teacher.',
      icon: BookOpen,
      badge: 'One-on-One'
    },
    {
      title: 'Quran Memorization (Hifz)',
      description: 'Embark on the noble journey of Quran memorization with dedicated personal instruction.',
      icon: Moon,
      badge: 'One-on-One'
    },
    {
      title: 'Arabic Grammar (Sarf & Nahw)',
      description: 'Understand the classical Arabic language that unlocks the Quran and Islamic texts.',
      icon: Compass,
      badge: 'One-on-One'
    },
    {
      title: 'Dars-e-Nizami',
      description: 'The complete 8-year classical Islamic curriculum — from Fiqh to Hadith to Aqeedah.',
      icon: GraduationCap,
      badge: 'Group Class'
    },
    {
      title: '40 Hadith Memorization',
      description: 'Memorize and understand Imam Nawawi\'s essential collection of prophetic traditions.',
      icon: Target,
      badge: 'One-on-One'
    },
    {
      title: 'Applied Tajweed',
      description: 'A focused one-on-one program to master Tajweed rules and perfect your Quranic recitation.',
      icon: Sparkles,
      badge: 'One-on-One'
    }
  ]

  const howItWorks = [
    {
      step: '01',
      title: 'Apply Online',
      description: 'Fill out our simple application form with your details and preferred course. Takes just 5 minutes.'
    },
    {
      step: '02',
      title: 'Get Matched',
      description: 'Our team reviews your application within 24 hours and matches you with the ideal teacher.'
    },
    {
      step: '03',
      title: 'Start Learning',
      description: 'Begin your Islamic learning journey with a free trial session — no commitment required.'
    }
  ]

  const testimonials = [
    {
      quote: "My son has memorized 5 juz in just 8 months. The teachers are incredibly patient and knowledgeable. Virtual Zawiyah has been a blessing for our family.",
      author: "Aisha Rahman",
      country: "United Kingdom",
      letter: "A"
    },
    {
      quote: "The Dars-e-Nizami program is exactly what I was looking for. Structured, authentic, and taught by true scholars. I recommend this academy to every serious student.",
      author: "Omar Al-Farooq",
      country: "United States",
      letter: "O"
    },
    {
      quote: "The female teachers are so warm and professional. My daughter loves her Tajweed classes and her recitation has improved beyond recognition.",
      author: "Maryam Siddiqui",
      country: "Canada",
      letter: "M"
    },
    {
      quote: "Gender-segregated classes gave our family the confidence to enroll. Our daughters are now learning Quran with wonderful female teachers. Jazakallah khair.",
      author: "Fatima Al-Zahra",
      country: "Germany",
      letter: "F"
    }
  ]

  const featuredTeachers = [
    {
      name: "Ustadh Ahmad Bilal",
      role: "Male Teacher",
      qualifications: "Hafiz, Alim - Quran & Tajweed",
      letter: "AB"
    },
    {
      name: "Ustadha Fatima Zahra",
      role: "Female Teacher",
      qualifications: "Hafizah, Tajweed Certified - Quran & Hifz",
      letter: "FZ"
    },
    {
      name: "Ustadh Yusuf Qasim",
      role: "Male Teacher",
      qualifications: "Alim, Arabic Specialist - Arabic Grammar",
      letter: "YQ"
    }
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-x-hidden">
      {/* Background decoration grid overlays */}
      <div className="absolute top-0 inset-x-0 h-[900px] pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full bg-grid-pattern opacity-[0.25]" />
        <div className="absolute top-[8%] left-[12%] w-[400px] h-[400px] rounded-full bg-emerald-500/[0.08] blur-[140px]" />
        <div className="absolute top-[22%] right-[12%] w-[350px] h-[350px] rounded-full bg-amber-500/[0.04] blur-[120px]" />
      </div>

      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative pt-40 pb-28 lg:pt-52 lg:pb-40 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-12 items-center">
            
            {/* Left Column: Hero Text */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 text-[10px] font-bold uppercase tracking-wider mx-auto lg:mx-0 shadow-md">
                <Sparkles className="h-3.5 w-3.5 text-[#c19b4c]" />
                Authentic Islamic Education Online
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight font-serif leading-[1.15]">
                Learn the Holy Quran <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-[#C19B4C] via-white to-emerald-400 bg-clip-text text-transparent font-serif italic">From Anywhere</span>
              </h1>
              
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl mx-auto lg:mx-0 font-sans font-light">
                Virtual Zawiyah offers live, structured Islamic education with qualified scholars — accessible to every Muslim, wherever they are.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/enrollment"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#c19b4c] hover:bg-[#b08b3e] text-slate-950 py-3.5 px-8 text-xs font-bold shadow-lg shadow-[#c19b4c]/10 hover:shadow-[#c19b4c]/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  Apply Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/courses"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3.5 px-8 text-xs font-bold text-zinc-200 hover:bg-white/10 hover:text-white transition-all active:scale-[0.99]"
                >
                  Explore Courses
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2.5 text-[11px] text-zinc-500 pt-3 font-semibold tracking-wide uppercase">
                <span className="flex items-center gap-1.5"><span className="text-[#c19b4c] text-sm">★</span> 3 Days Free Trial</span>
                <span className="hidden sm:inline text-zinc-800">•</span>
                <span className="flex items-center gap-1.5"><span className="text-emerald-500 text-sm">✔</span> Gender-Segregated Staff</span>
                <span className="hidden sm:inline text-zinc-800">•</span>
                <span className="flex items-center gap-1.5"><span className="text-[#c19b4c] text-sm">✦</span> One-on-One focus</span>
              </div>
            </div>

            {/* Right Column: Premium Custom Geometric Frame */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end animate-float">
              <div className="relative w-full max-w-[390px] aspect-square rounded-3xl border border-white/5 bg-slate-900/10 p-8 flex flex-col justify-between shadow-2xl shadow-emerald-950/20 backdrop-blur-md group hover:border-[#c19b4c]/30 transition-all duration-500">
                <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/15 transition-all duration-500" />
                <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-[#c19b4c]/5 rounded-full blur-3xl pointer-events-none" />

                {/* Asymmetric Ornament */}
                <div className="flex-grow flex flex-col items-center justify-center space-y-6">
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-emerald-400 group-hover:border-[#c19b4c]/40 group-hover:rotate-6 transition-all duration-500">
                    <div className="absolute inset-1 border border-dashed border-emerald-500/30 rounded-xl" />
                    <Compass className="h-10 w-10 animate-spin-slow text-emerald-400" />
                  </div>
                  <div className="text-center space-y-1">
                    <h3 className="text-2xl font-serif font-bold text-white tracking-wider">الزاوية الافتراضية</h3>
                    <p className="text-[10px] text-[#c19b4c] uppercase tracking-widest font-extrabold">Virtual Zawiyah</p>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-5 text-center">
                  <p className="text-xs text-zinc-450 leading-relaxed font-sans font-light">
                    Providing structured Tajweed, Fiqh, and Arabic grammar taught by verified Alims & Alimahs.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-emerald-950/20 border-y border-white/5 py-12 backdrop-blur-md relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x-0 md:divide-x divide-white/5">
            {stats.map((stat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{stat.value}</div>
                <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#c19b4c]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-28 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#c19b4c] bg-[#c19b4c]/10 border border-[#c19b4c]/20 px-3.5 py-1.5 rounded-full">
              WHY CHOOSE US
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white font-serif italic">
              Why Virtual Zawiyah
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {corePillars.map((pillar, idx) => {
              const Icon = pillar.icon
              return (
                <div 
                  key={idx} 
                  className="group rounded-2xl border border-white/5 bg-slate-900/10 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/20 hover:bg-slate-900/30 hover:shadow-xl"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl border mb-6 transition-transform duration-550 group-hover:scale-105 ${pillar.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2.5 group-hover:text-[#c19b4c] transition-colors">{pillar.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans font-light">{pillar.description}</p>
                </div>
              )
            })}
          </div>

        </div>
      </section>

      {/* Curriculum Highlight Section */}
      <section className="py-28 border-t border-white/5 bg-slate-900/10 relative z-10">
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[550px] h-[550px] rounded-full bg-emerald-500/[0.02] blur-[150px] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row items-center justify-between mb-20 gap-4">
            <div className="text-center sm:text-left space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#c19b4c]">
                OUR CURRICULUM
              </span>
              <h2 className="text-3xl font-semibold tracking-tight text-white font-serif italic">
                Explore Our Courses
              </h2>
            </div>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 px-6 text-xs font-bold text-zinc-200 hover:bg-white/10 hover:text-white transition-all"
            >
              View All Courses
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredCourses.map((course, idx) => {
              const Icon = course.icon
              return (
                <div 
                  key={idx} 
                  className="group rounded-2xl border border-white/5 bg-slate-900/10 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#c19b4c]/20 hover:bg-slate-900/40 hover:shadow-xl"
                >
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:bg-[#c19b4c] group-hover:text-slate-950 group-hover:border-transparent transition-all duration-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded bg-white/5 text-zinc-400 border border-white/5">
                      {course.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors mb-2.5">
                    {course.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans font-light mb-5 min-h-[48px]">
                    {course.description}
                  </p>
                  <Link
                    href="/courses"
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-450 font-bold hover:text-emerald-350 transition-all group-hover:translate-x-1"
                  >
                    Learn More
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )
            })}
          </div>

        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-28 bg-slate-900/10 border-t border-white/5 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#c19b4c]">
              SIMPLE PROCESS
            </span>
            <h2 className="text-3xl font-semibold tracking-tight text-white font-serif italic">
              How It Works
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {howItWorks.map((item, idx) => (
              <div 
                key={idx} 
                className="relative rounded-2xl border border-white/5 bg-slate-900/10 p-6 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/10"
              >
                <div className="absolute top-4 right-4 text-4xl font-black text-[#c19b4c]/5 select-none">{item.step}</div>
                <h3 className="text-base font-bold text-white mb-2.5">{item.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans font-light">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <Link
              href="/enrollment?tab=trial"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 px-8 text-xs font-bold shadow-lg shadow-emerald-950/15 active:scale-[0.98] transition-all"
            >
              Start with a Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-28 border-t border-white/5 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#c19b4c] bg-[#c19b4c]/10 border border-[#c19b4c]/20 px-3.5 py-1.5 rounded-full">
              STUDENT STORIES
            </span>
            <h2 className="text-3xl font-semibold tracking-tight text-white font-serif italic">
              What Our Students Say
            </h2>
            <p className="text-xs text-zinc-400 font-sans font-light">
              Families from across the globe trust Virtual Zawiyah with their Islamic education.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {testimonials.map((test, idx) => (
              <div 
                key={idx} 
                className="group rounded-2xl border border-white/5 bg-slate-900/10 p-6 flex flex-col justify-between hover:border-emerald-500/10 hover:bg-slate-900/20 transition-all duration-300"
              >
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans italic mb-6 font-light">
                  &ldquo;{test.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold text-xs group-hover:bg-[#c19b4c] group-hover:text-slate-950 group-hover:border-transparent transition-all duration-500">
                    {test.letter}
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-white">{test.author}</span>
                    <span className="block text-[9px] text-[#c19b4c] uppercase tracking-widest font-extrabold mt-0.5">{test.country}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Featured Teachers Section */}
      <section className="py-28 border-t border-white/5 bg-slate-900/10 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#c19b4c]">
              MEET THE FACULTY
            </span>
            <h2 className="text-3xl font-semibold tracking-tight text-white font-serif italic">
              Featured Teachers
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {featuredTeachers.map((teacher, idx) => (
              <div 
                key={idx} 
                className="group rounded-2xl border border-white/5 bg-slate-900/20 p-6 text-center hover:border-emerald-500/20 transition-all duration-300"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-extrabold text-sm mb-4 group-hover:scale-105 transition-transform duration-500">
                  {teacher.letter}
                </div>
                <h3 className="text-sm font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">{teacher.name}</h3>
                <span className="block text-[10px] font-extrabold uppercase tracking-widest text-[#c19b4c] mb-3">
                  {teacher.role}
                </span>
                <p className="text-xs text-zinc-400 leading-normal font-sans font-light">
                  {teacher.qualifications}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 px-6 text-xs font-bold text-zinc-200 hover:bg-white/10 hover:text-white transition-all active:scale-[0.98]"
            >
              View All Courses & syllabus
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="py-28 border-t border-white/5 bg-gradient-to-b from-slate-950 via-slate-950 to-emerald-950/20 relative z-10 overflow-hidden">
        <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full shadow-lg">
            BEGIN TODAY
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white font-serif leading-tight">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-450 leading-relaxed max-w-xl mx-auto font-sans font-light">
            Apply for a free 3-day trial today and experience authentic Islamic education from qualified scholars — wherever you are in the world.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/enrollment?tab=trial"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#c19b4c] hover:bg-[#b08b3e] text-slate-950 py-3.5 px-8 text-xs font-bold shadow-lg shadow-[#c19b4c]/10 active:scale-[0.98] transition-all"
            >
              Apply for Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/courses"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3.5 px-8 text-xs font-bold text-zinc-200 hover:bg-white/10 hover:text-white transition-all active:scale-[0.98]"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
