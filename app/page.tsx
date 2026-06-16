'use client'

import Link from 'next/link'
import PublicNavbar from '@/components/PublicNavbar'
import PublicFooter from '@/components/PublicFooter'
import { Sparkles, ArrowRight, GraduationCap, Calendar, ShieldCheck, BookOpen, Moon, Target, Compass } from 'lucide-react'

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
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    },
    {
      title: 'Qualified Scholars',
      description: 'All teachers hold traditional Islamic qualifications — Hafiz, Alim, and Tajweed-certified.',
      icon: Sparkles,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[80px]" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid gap-12 lg:grid-cols-12 items-center">
            
            {/* Left Column: Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mx-auto lg:mx-0">
                <Sparkles className="h-3.5 w-3.5" />
                Authentic Islamic Education Online
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent font-sans leading-tight">
                Learn the Quran From Anywhere in the World
              </h1>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Virtual Zawiyah offers live, structured Islamic education with qualified scholars — accessible to every Muslim, wherever they are.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/enrollment"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 px-8 text-xs font-bold text-white shadow shadow-emerald-500/10 hover:bg-emerald-500 active:scale-[0.98] transition-all"
                >
                  Apply Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/courses"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3.5 px-8 text-xs font-bold text-zinc-205 hover:bg-white/10 hover:text-white transition-all"
                >
                  Explore Courses
                </Link>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-2 text-xs text-zinc-500">
                <span>🌟 3 Days Free Trial</span>
                <span className="text-zinc-700">•</span>
                <span>Gender-Segregated Staff</span>
                <span className="text-zinc-700">•</span>
                <span>One-on-One Focus</span>
              </div>
            </div>

            {/* Right Column: Compliant Abstract Graphics instead of Female Imagery */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[380px] aspect-square rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900/60 to-slate-950 p-6 flex flex-col justify-between shadow-2xl shadow-emerald-950/10 overflow-hidden">
                <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl" />
                
                {/* Visual Accent Quran/Islam Emblem */}
                <div className="flex-grow flex flex-col items-center justify-center space-y-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <Compass className="h-10 w-10 animate-spin-slow" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-sm font-serif font-bold text-white tracking-wide">الزاوية الافتراضية</h3>
                    <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-semibold mt-1">Virtual Zawiyah</p>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 text-center">
                  <p className="text-[10px] text-zinc-500 leading-relaxed font-sans">
                    Structured Tajweed, Fiqh, and Arabic grammar. Taught by verified Alims & Alimahs.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-emerald-900/40 border-y border-emerald-800/30 py-8 backdrop-blur-sm relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-2xl sm:text-3xl font-extrabold text-white">{stat.value}</div>
                <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              Why Choose Us
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-2">
              Why Virtual Zawiyah
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {corePillars.map((pillar, idx) => {
              const Icon = pillar.icon
              return (
                <div key={idx} className="rounded-2xl border border-white/5 bg-slate-900/30 p-6 transition-all hover:border-emerald-500/20 hover:bg-slate-900/60">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg border mb-4 ${pillar.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">{pillar.title}</h3>
                  <p className="text-xs text-zinc-450 leading-relaxed font-sans">{pillar.description}</p>
                </div>
              )
            })}
          </div>

        </div>
      </section>

      {/* Curriculum Highlight Section */}
      <section className="py-20 border-t border-white/5 bg-slate-900/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                Our Curriculum
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-2">
                Explore Our Courses
              </h2>
            </div>
            <Link
              href="/courses"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2.5 px-5 text-xs font-bold text-zinc-300 hover:bg-white/10 hover:text-white transition-all"
            >
              View All Courses
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredCourses.map((course, idx) => {
              const Icon = course.icon
              return (
                <div key={idx} className="group rounded-2xl border border-white/5 bg-slate-900/40 p-6 transition-all hover:border-emerald-500/20 hover:bg-slate-900/80">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/5">
                      {course.badge}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors mb-2">
                    {course.title}
                  </h3>
                  <p className="text-xs text-zinc-450 leading-relaxed font-sans mb-4 min-h-[48px]">
                    {course.description}
                  </p>
                  <Link
                    href="/courses"
                    className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold hover:text-emerald-300"
                  >
                    Learn More
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              )
            })}
          </div>

        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-emerald-950/20 border-y border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              Simple Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-2">
              How It Works
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {howItWorks.map((item, idx) => (
              <div key={idx} className="relative rounded-2xl border border-white/5 bg-slate-900/30 p-6 transition-all hover:bg-slate-900/60">
                <div className="absolute top-4 right-4 text-3xl font-black text-emerald-500/10">{item.step}</div>
                <h3 className="text-sm font-bold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-zinc-450 leading-relaxed font-sans">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/enrollment"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 py-3.5 px-8 text-xs font-bold text-white shadow hover:bg-emerald-500 active:scale-[0.98] transition-all"
            >
              Start with a Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              Student Stories
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-2">
              What Our Students Say
            </h2>
            <p className="text-xs text-zinc-400 mt-2">
              Families from across the globe trust Virtual Zawiyah with their Islamic education.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {testimonials.map((test, idx) => (
              <div key={idx} className="rounded-2xl border border-white/5 bg-slate-900/35 p-6 flex flex-col justify-between">
                <p className="text-xs text-zinc-350 leading-relaxed font-sans italic mb-6">
                  &ldquo;{test.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold text-xs">
                    {test.letter}
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-white">{test.author}</span>
                    <span className="block text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">{test.country}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Featured Teachers Section */}
      <section className="py-20 border-t border-white/5 bg-slate-900/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              Meet The Faculty
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-2">
              Featured Teachers
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {featuredTeachers.map((teacher, idx) => (
              <div key={idx} className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-extrabold text-sm mb-4">
                  {teacher.letter}
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{teacher.name}</h3>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-500 mb-3">
                  {teacher.role}
                </span>
                <p className="text-xs text-zinc-450 leading-normal font-sans">
                  {teacher.qualifications}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/courses"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2.5 px-6 text-xs font-bold text-zinc-350 hover:bg-white/10 hover:text-white transition-all"
            >
              View All Courses & syllabus
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-white/5 bg-gradient-to-b from-slate-950 to-emerald-950/20 relative overflow-hidden">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            Begin Today
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-4 mb-3">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-450 leading-relaxed max-w-xl mx-auto mb-8">
            Apply for a free 3-day trial today and experience authentic Islamic education from qualified scholars — wherever you are in the world.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/enrollment"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 px-6 text-xs font-bold text-white shadow hover:bg-emerald-500 active:scale-[0.98] transition-all"
            >
              Apply for Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/courses"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3.5 px-6 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-all"
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
