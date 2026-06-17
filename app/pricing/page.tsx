'use client'

import Link from 'next/link'
import { CheckCircle2, Users, Video, Calendar } from 'lucide-react'
import PublicNavbar from '@/components/PublicNavbar'
import PublicFooter from '@/components/PublicFooter'
import GeometricPattern from '@/components/GeometricPattern'

const oneOnOnePlans = [
  {
    duration: "30 min",
    perWeek: 3,
    label: "3 Lessons / Week",
    price: 60,
    perLesson: 20,
    popular: false,
    features: [
      "12 live sessions per month",
      "Dedicated personal teacher",
      "30-minute focused session",
      "Progress reports",
      "Flexible scheduling",
    ],
  },
  {
    duration: "30 min",
    perWeek: 5,
    label: "5 Lessons / Week",
    price: 100,
    perLesson: 20,
    popular: true,
    features: [
      "20 live sessions per month",
      "Dedicated personal teacher",
      "30-minute focused session",
      "Weekly progress report",
      "Flexible scheduling",
      "Priority teacher matching",
    ],
  },
  {
    duration: "60 min",
    perWeek: 3,
    label: "3 Lessons / Week",
    price: 120,
    perLesson: 40,
    popular: false,
    features: [
      "12 live sessions per month",
      "Dedicated personal teacher",
      "60-minute in-depth session",
      "Progress reports",
      "Flexible scheduling",
    ],
  },
  {
    duration: "60 min",
    perWeek: 5,
    label: "5 Lessons / Week",
    price: 200,
    perLesson: 40,
    popular: false,
    features: [
      "20 live sessions per month",
      "Dedicated personal teacher",
      "60-minute in-depth session",
      "Weekly progress report",
      "Flexible scheduling",
      "Priority teacher matching",
    ],
  },
]

const groupPlans = [
  {
    duration: "120 min",
    perWeek: 5,
    label: "Group",
    price: 40,
    features: [
      "20 live sessions per month",
      "Group sessions",
      "120-minute session",
      "Structured curriculum",
      "Deeper coverage per session",
      "Q&A time included",
    ],
  },
]

const weekendPlan = {
  price: 100,
  duration: "30 min",
  label: "Saturday & Sunday",
  features: [
    "8 dedicated weekend sessions/month",
    "Personal one-on-one teacher",
    "30-minute focused session",
    "Perfect for working adults & school students",
    "Consistent weekend routine",
    "Progress reports",
  ],
}

export default function PricingPage() {
  return (
    <div className="public-page min-h-screen flex flex-col font-sans">
      <PublicNavbar />

      {/* Page Header */}
      <section 
        className="relative py-20 overflow-hidden" 
        style={{ background: "linear-gradient(135deg, #E8F5EE 0%, #FAFAF7 60%, #E8F5EE 100%)" }}
      >
        <GeometricPattern opacity={0.06} />
        <div className="container mx-auto px-4 relative z-10 text-center animate-fade-in-up">
          <nav className="text-sm text-gray-505 mb-6">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground font-semibold">Pricing</span>
          </nav>
          <span className="text-xs font-semibold uppercase tracking-widest text-secondary">Transparent Pricing</span>
          <h1 className="font-serif font-bold text-4xl md:text-5xl mt-3 mb-5" style={{ color: "#1A1A1A" }}>
            Tuition & Fees
          </h1>
          <p className="text-lg max-w-2xl mx-auto text-gray-600">
            Simple, affordable pricing with no hidden costs. Choose the plan that fits your schedule and learning goals — and start with a 3-day free trial.
          </p>
        </div>
      </section>

      {/* One-on-One Plans */}
      <section className="py-24 bg-white relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 mb-3 px-4 py-2 rounded-full bg-[#E8F5EE] border border-primary/10">
              <Video className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">One-on-One Classes</span>
            </div>
            <h2 className="font-serif font-bold text-3xl md:text-4xl text-gray-900">Personal Instruction</h2>
            <p className="mt-3 max-w-xl mx-auto text-base text-gray-600">
              Your dedicated teacher, your pace, your schedule. The most effective way to learn Quran and Islamic studies.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {oneOnOnePlans.map((plan, i) => (
              <div
                key={i}
                className={`relative rounded-2xl border flex flex-col overflow-hidden transition-all duration-300 ${
                  plan.popular 
                    ? "shadow-xl ring-2 ring-primary border-primary bg-primary text-white" 
                    : "shadow-sm hover:shadow-md border-primary/15 bg-white text-gray-900"
                }`}
                data-testid={`pricing-card-${i}`}
              >
                {plan.popular && (
                  <div className="text-center py-2 text-[10px] font-extrabold uppercase tracking-widest bg-secondary text-white">
                    Most Popular
                  </div>
                )}
                <div className="p-7 flex flex-col flex-1 justify-between">
                  <div className="mb-5">
                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${
                      plan.popular ? "text-white/60" : "text-gray-400"
                    }`}>
                      {plan.duration} · {plan.label}
                    </p>
                    <div className="flex items-end gap-1 mt-2">
                      <span className="font-serif font-bold text-5xl leading-none">
                        ${plan.price}
                      </span>
                      <span className={`text-sm mb-1 ${plan.popular ? "text-white/70" : "text-gray-500"}`}>/month</span>
                    </div>
                    <p className={`text-xs mt-1.5 ${plan.popular ? "text-white/65" : "text-gray-450"}`}>
                      ${plan.perLesson} per lesson
                    </p>
                  </div>

                  <ul className="space-y-3.5 flex-1 mb-7 border-t border-gray-150/10 pt-4 mt-2">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${plan.popular ? "text-secondary" : "text-primary"}`} />
                        <span className={plan.popular ? "text-white/85" : "text-gray-700"}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/enrollment"
                    className={`w-full font-bold h-11 inline-flex items-center justify-center rounded-md text-sm transition-colors text-center ${
                      plan.popular 
                        ? "bg-secondary text-white hover:bg-secondary/95 shadow-md" 
                        : "border border-primary text-primary bg-primary/5 hover:bg-primary/10"
                    }`}
                  >
                    Apply Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Group Plans */}
      <section className="py-24 relative z-10" style={{ background: "#FAFAF7" }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-14 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 mb-3 px-4 py-2 rounded-full bg-[#E8F5EE] border border-primary/10">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Group Classes</span>
            </div>
            <h2 className="font-serif font-bold text-3xl md:text-4xl text-gray-900">Learn Together</h2>
            <p className="mt-3 max-w-xl mx-auto text-base text-gray-650">
              Group sessions with a structured curriculum — collaborative, affordable, and effective.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {groupPlans.map((plan, i) => (
              <div
                key={i}
                className="rounded-2xl border bg-white border-primary/15 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden"
              >
                <div className="p-8 flex flex-col flex-1 justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-gray-400">
                      {plan.duration} · 5 Lessons / Week
                    </p>
                    <p className="font-serif font-bold text-xl mb-2 text-gray-900">{plan.label}</p>
                    <div className="flex items-end gap-1 mb-6 border-b border-gray-100 pb-4">
                      <span className="font-serif font-bold text-5xl leading-none text-primary">
                        ${plan.price}
                      </span>
                      <span className="text-sm mb-1 text-gray-505">/month</span>
                    </div>
                    <ul className="space-y-3.5 mb-7">
                      {plan.features.map((f, j) => (
                        <li key={j} className="flex items-start gap-2 text-xs text-gray-700">
                          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link 
                    href="/enrollment" 
                    className="w-full font-bold h-11 inline-flex items-center justify-center rounded-md text-sm border border-primary text-primary hover:bg-primary/5 text-center transition-colors"
                  >
                    Apply Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Weekend Plan */}
      <section className="py-24 bg-white relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 mb-3 px-4 py-2 rounded-full bg-[#E8F5EE] border border-primary/10">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Weekend Classes</span>
            </div>
            <h2 className="font-serif font-bold text-3xl md:text-4xl text-gray-900">Dedicated Weekend Plan</h2>
            <p className="mt-3 max-w-xl mx-auto text-base text-gray-650">
              Perfect for students who can only attend on weekends — a consistent Saturday & Sunday routine at a dedicated rate.
            </p>
          </div>

          <div
            className="max-w-lg mx-auto rounded-2xl overflow-hidden shadow-xl border-2 animate-fade-in-up"
            style={{ borderColor: "#C9A84C" }}
          >
            {/* Gold header bar */}
            <div className="py-4 text-center font-bold text-xs uppercase tracking-widest bg-[#C9A84C] text-white">
              Saturday & Sunday · One-on-One
            </div>
            <div className="p-10 bg-white">
              <div className="text-center mb-8 border-b border-gray-150 pb-6">
                <div className="flex items-end justify-center gap-1">
                  <span className="font-serif font-bold text-primary" style={{ fontSize: "4.5rem", lineHeight: 1 }}>$100</span>
                  <span className="text-base mb-2 text-gray-500">/month</span>
                </div>
                <p className="text-xs mt-2 text-gray-400 font-semibold">30 minutes per session</p>
              </div>
              <ul className="space-y-4 mb-8">
                {weekendPlan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs text-gray-700">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link 
                href="/enrollment" 
                className="w-full inline-flex items-center justify-center bg-primary hover:bg-primary/95 text-white font-semibold py-3.5 px-6 rounded-md shadow-md text-sm text-center"
              >
                Apply for Weekend Classes
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Notes & FAQ */}
      <section className="py-20 relative z-10" style={{ background: "#FAFAF7" }}>
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="font-serif font-bold text-2xl md:text-3xl" style={{ color: "#1A1A1A" }}>
              Good to Know
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { title: "Free Trial Included", body: "Every new student receives a 3-day free trial before committing to any plan. No payment required upfront." },
              { title: "Monthly Billing", body: "All plans are billed monthly with no long-term contract. Cancel or change your plan at any time." },
              { title: "Gender-Segregated Teaching", body: "Female students are always matched with female teachers; male students with male teachers — at no extra cost." },
              { title: "Flexible Rescheduling", body: "Missed a class? Sessions can be rescheduled with 12 hours' advance notice at no penalty." },
              { title: "All Ages Welcome", body: "Our plans cover children, teens, and adults. The curriculum and pace are tailored to the student's age and level." },
              { title: "Currency & Payment", body: "Fees are listed in USD. Payment is accepted via bank transfer, Wise, or other online methods." },
            ].map((note, i) => (
              <div
                key={i}
                className="rounded-xl border border-primary/10 p-6 bg-white shadow-sm animate-fade-in-up"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-primary" />
                  <div>
                    <p className="font-bold text-sm mb-1 text-gray-900">{note.title}</p>
                    <p className="text-xs leading-relaxed text-gray-600">{note.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary relative overflow-hidden z-10 text-white">
        <GeometricPattern opacity={0.05} />
        <div className="container mx-auto px-4 text-center relative z-10 animate-fade-in-up">
          <h2 className="font-serif font-bold text-3xl md:text-4xl mb-4">Start with 3 Days Free</h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            No payment needed to begin. Apply today, try your chosen plan for 3 days, and enroll with confidence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/enrollment" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-secondary text-white hover:bg-secondary/95 py-3.5 px-8 font-semibold shadow-lg text-sm text-center"
            >
              Apply for Free Trial
            </Link>
            <Link 
              href="/contact" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md border border-white/40 text-white hover:bg-white/10 hover:border-white py-3.5 px-8 font-semibold text-sm text-center"
            >
              Have a Question?
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
