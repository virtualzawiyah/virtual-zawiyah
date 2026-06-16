'use client'

import { useState } from 'react'
import Link from 'next/link'
import PublicNavbar from '@/components/PublicNavbar'
import PublicFooter from '@/components/PublicFooter'
import { Check, ArrowRight, Info, ShieldCheck, Calendar, Users, RefreshCw, Sparkles } from 'lucide-react'

type Currency = 'USD' | 'GBP'

export default function PricingPage() {
  const [currency, setCurrency] = useState<Currency>('USD')

  const currencySymbol = currency === 'USD' ? '$' : '£'

  // Pricing definitions in USD and GBP
  const oneOnOnePlans = [
    {
      id: '1',
      duration: '30 Min',
      lessonsPerWeek: '3 Lessons / Week',
      price: { USD: 60, GBP: 45 },
      perLesson: { USD: 20, GBP: 15 },
      features: [
        '12 live sessions per month',
        'Dedicated personal teacher',
        '30-minute focused session',
        'Monthly progress reports',
        'Flexible scheduling options'
      ],
      ctaText: 'Apply Now',
      popular: false
    },
    {
      id: '2',
      duration: '30 Min',
      lessonsPerWeek: '5 Lessons / Week',
      price: { USD: 100, GBP: 75 },
      perLesson: { USD: 20, GBP: 15 },
      features: [
        '20 live sessions per month',
        'Dedicated personal teacher',
        '30-minute focused session',
        'Weekly progress reports',
        'Flexible scheduling options',
        'Priority teacher matching'
      ],
      ctaText: 'Apply Now',
      popular: true
    },
    {
      id: '3',
      duration: '60 Min',
      lessonsPerWeek: '3 Lessons / Week',
      price: { USD: 120, GBP: 90 },
      perLesson: { USD: 40, GBP: 30 },
      features: [
        '12 live sessions per month',
        'Dedicated personal teacher',
        '60-minute in-depth session',
        'Monthly progress reports',
        'Flexible scheduling options'
      ],
      ctaText: 'Apply Now',
      popular: false
    },
    {
      id: '4',
      duration: '60 Min',
      lessonsPerWeek: '5 Lessons / Week',
      price: { USD: 200, GBP: 150 },
      perLesson: { USD: 40, GBP: 30 },
      features: [
        '20 live sessions per month',
        'Dedicated personal teacher',
        '60-minute in-depth session',
        'Weekly progress reports',
        'Flexible scheduling options',
        'Priority teacher matching'
      ],
      ctaText: 'Apply Now',
      popular: false
    }
  ]

  const groupPlan = {
    duration: '120 Min',
    lessonsPerWeek: '5 Lessons / Week',
    price: { USD: 40, GBP: 30 },
    features: [
      '20 live sessions per month',
      'Collaborative group sessions',
      '120-minute immersive class',
      'Structured group curriculum',
      'Deeper coverage per session',
      'Dedicated Q&A time included'
    ]
  }

  const weekendPlan = {
    name: 'Saturday & Sunday',
    type: 'One-on-One',
    price: { USD: 100, GBP: 75 },
    duration: '30 Min per session',
    features: [
      '8 dedicated weekend sessions/month',
      'Personal one-on-one teacher',
      '30-minute focused session',
      'Perfect for working adults & school students',
      'Consistent weekend routine',
      'Monthly progress reports'
    ]
  }

  const goodToKnow = [
    {
      title: 'Free Trial Included',
      description: 'Every new student receives a 3-day free trial before committing to any plan. No payment required upfront.',
      icon: Sparkles,
      iconColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    },
    {
      title: 'Monthly Billing',
      description: 'All plans are billed monthly with no long-term contracts. Cancel or change your plan settings at any time.',
      icon: Calendar,
      iconColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    },
    {
      title: 'Gender-Segregated Classes',
      description: 'Female students are always matched with female teachers; male students with male teachers — at no extra cost.',
      icon: Users,
      iconColor: 'text-teal-400 bg-teal-500/10 border-teal-500/20'
    },
    {
      title: 'Flexible Rescheduling',
      description: 'Missed a class? Sessions can be rescheduled easily with 12 hours\' advance notice at no penalty.',
      icon: RefreshCw,
      iconColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
    },
    {
      title: 'All Ages Welcome',
      description: 'Our plans cover children, teens, and adults. The curriculum and teaching speed are tailored to the student\'s level.',
      icon: Info,
      iconColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    },
    {
      title: 'Currency & Payment',
      description: 'Fees can be paid in USD or GBP. We support bank transfer, Wise, card payments, and other direct methods.',
      icon: ShieldCheck,
      iconColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
    }
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <PublicNavbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Breadcrumbs */}
          <nav className="flex mb-6 text-xs text-zinc-500 uppercase tracking-wider font-semibold">
            <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
            <span className="mx-2 text-zinc-700">/</span>
            <span className="text-emerald-400">Pricing</span>
          </nav>

          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              Transparent Pricing
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent mt-3 mb-4">
              Tuition & Fees
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed font-sans mb-8">
              Simple, affordable pricing with no hidden costs. Choose the plan that fits your schedule and learning goals — and start with a 3-day free trial.
            </p>

            {/* Currency Selector */}
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-900 border border-white/5 shadow-inner">
              <button
                onClick={() => setCurrency('USD')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  currency === 'USD'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                USD ($)
              </button>
              <button
                onClick={() => setCurrency('GBP')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  currency === 'GBP'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                GBP (£)
              </button>
            </div>
          </div>

          {/* One-on-One Pricing Section */}
          <div className="mb-20">
            <div className="border-l-4 border-emerald-500 pl-4 mb-8">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
                One-on-One Classes
              </h2>
              <p className="text-xs text-zinc-400 mt-1 font-sans">
                Your dedicated teacher, your pace, your schedule. The most effective way to learn Quran and Islamic studies.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {oneOnOnePlans.map((plan) => {
                const priceVal = plan.price[currency]
                const perLessonVal = plan.perLesson[currency]
                return (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col justify-between rounded-2xl border bg-slate-900/40 p-6 backdrop-blur-sm transition-all hover:bg-slate-900/85 hover:shadow-xl ${
                      plan.popular
                        ? 'border-amber-500/50 shadow-lg shadow-amber-500/[0.02]'
                        : 'border-white/5 hover:border-emerald-500/20'
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-extrabold uppercase tracking-widest text-slate-950 bg-gradient-to-r from-amber-400 to-amber-600 px-3 py-1 rounded-full shadow-md">
                        Most Popular
                      </span>
                    )}

                    <div>
                      {/* Plan Spec */}
                      <div className="flex items-baseline justify-between mb-4 border-b border-white/5 pb-3">
                        <span className="text-xs font-bold text-emerald-400">{plan.duration}</span>
                        <span className="text-[10px] text-zinc-400 uppercase font-semibold">{plan.lessonsPerWeek}</span>
                      </div>

                      {/* Pricing */}
                      <div className="mb-6">
                        <div className="flex items-baseline text-white">
                          <span className="text-3xl font-extrabold tracking-tight">{currencySymbol}{priceVal}</span>
                          <span className="text-xs text-zinc-500 ml-1">/ month</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 italic block mt-1">
                          Approx. {currencySymbol}{perLessonVal} per lesson
                        </span>
                      </div>

                      {/* Features */}
                      <ul className="space-y-2.5 mb-8">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-zinc-400">
                            <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action */}
                    <Link
                      href="/enrollment"
                      className={`w-full flex items-center justify-center gap-1.5 rounded-xl py-3 text-xs font-bold transition-all active:scale-[0.98] ${
                        plan.popular
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold hover:from-amber-400 hover:to-amber-500'
                          : 'border border-white/10 bg-white/5 text-zinc-300 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20'
                      }`}
                    >
                      {plan.ctaText}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Group & Weekend Pricing Section */}
          <div className="grid gap-8 md:grid-cols-2 mb-20">
            {/* Group Classes Card */}
            <div>
              <div className="border-l-4 border-teal-500 pl-4 mb-6">
                <h3 className="text-lg font-bold text-white font-sans">Group Classes</h3>
                <p className="text-xs text-zinc-400">Learn together with a structured academy syllabus.</p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-sm hover:border-teal-500/20 transition-all hover:bg-slate-900/80">
                <div className="flex justify-between items-baseline mb-4 border-b border-white/5 pb-3">
                  <span className="text-xs font-bold text-teal-400">{groupPlan.duration}</span>
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold">{groupPlan.lessonsPerWeek}</span>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline text-white">
                    <span className="text-3xl font-extrabold tracking-tight">{currencySymbol}{groupPlan.price[currency]}</span>
                    <span className="text-xs text-zinc-500 ml-1">/ month</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 italic block mt-1">
                    Group tuition format · Daily schedule
                  </span>
                </div>

                <ul className="space-y-2.5 mb-8">
                  {groupPlan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-zinc-400">
                      <Check className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/enrollment"
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-semibold text-zinc-300 hover:bg-teal-500/10 hover:text-teal-400 hover:border-teal-500/20 active:scale-[0.98] transition-all"
                >
                  Apply Now
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Weekend Classes Card */}
            <div>
              <div className="border-l-4 border-indigo-500 pl-4 mb-6">
                <h3 className="text-lg font-bold text-white font-sans">Weekend Classes</h3>
                <p className="text-xs text-zinc-400">Dedicated weekend schedule for busy pupils.</p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-sm hover:border-indigo-500/20 transition-all hover:bg-slate-900/80">
                <div className="flex justify-between items-baseline mb-4 border-b border-white/5 pb-3">
                  <span className="text-xs font-bold text-indigo-400">{weekendPlan.name}</span>
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold">{weekendPlan.type}</span>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline text-white">
                    <span className="text-3xl font-extrabold tracking-tight">{currencySymbol}{weekendPlan.price[currency]}</span>
                    <span className="text-xs text-zinc-500 ml-1">/ month</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 italic block mt-1">
                    {weekendPlan.duration}
                  </span>
                </div>

                <ul className="space-y-2.5 mb-8">
                  {weekendPlan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-zinc-400">
                      <Check className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/enrollment"
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow hover:bg-emerald-500 active:scale-[0.98] transition-all"
                >
                  Apply for Weekend Classes
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Good to Know Section */}
          <div className="mb-12">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
                Good to Know
              </h3>
              <p className="text-xs text-zinc-400 mt-1.5">
                Answers to frequently asked pricing, schedule, and policy questions.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {goodToKnow.map((item, idx) => {
                const Icon = item.icon
                return (
                  <div
                    key={idx}
                    className="flex gap-4 rounded-2xl border border-white/5 bg-slate-900/20 p-5 backdrop-blur-sm"
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-base ${item.iconColor}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1.5">
                        {item.title}
                      </h4>
                      <p className="text-xs text-zinc-450 leading-relaxed font-sans">
                        {item.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* CTA Banner */}
          <div className="mt-16 rounded-3xl border border-white/5 bg-gradient-to-r from-emerald-950/40 to-slate-900/60 p-8 text-center backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-2">
              Start with 3 Days Free
            </h3>
            <p className="text-xs text-zinc-400 max-w-xl mx-auto mb-6">
              No payment details needed to begin. Apply today, try your chosen tuition plan for 3 full days, and enrol with absolute confidence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/enrollment"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 px-6 text-sm font-bold text-white shadow hover:bg-emerald-500 active:scale-[0.98] transition-all"
              >
                Apply for Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 px-6 text-sm font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-all"
              >
                Have a Question?
              </Link>
            </div>
          </div>

        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
