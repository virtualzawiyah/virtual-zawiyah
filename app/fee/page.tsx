'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle2, Users, Video, Calendar } from 'lucide-react'
import PublicNavbar from '@/components/PublicNavbar'
import PublicFooter from '@/components/PublicFooter'
import GeometricPattern from '@/components/GeometricPattern'

export default function PricingPage() {
  const [oneOnOnePlans, setOneOnOnePlans] = useState<any[]>([])
  const [groupPlans, setGroupPlans] = useState<any[]>([])
  const [weekendPlans, setWeekendPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/public/fee-cards')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load pricing configurations')
        return res.json()
      })
      .then(data => {
        const oneOnOne = data
          .filter((fc: any) => fc.program_type === '1:1')
          .map((fc: any, idx: number) => ({
            id: fc.id,
            duration: '30 min',
            label: fc.title_original || fc.title,
            price: fc.base_fee,
            perLesson: Math.round(Number(fc.base_fee) / 12),
            popular: idx === 1,
            features: fc.features || []
          }))

        const group = data
          .filter((fc: any) => fc.program_type === 'group')
          .map((fc: any) => ({
            id: fc.id,
            duration: '120 min',
            label: fc.title_original || fc.title,
            price: fc.base_fee,
            features: fc.features || []
          }))

        const weekend = data
          .filter((fc: any) => fc.program_type === 'weekend' || (fc.title_original && fc.title_original.toLowerCase().includes('weekend')))
          .map((fc: any) => ({
            id: fc.id,
            duration: '30 min',
            label: fc.title_original || fc.title,
            price: fc.base_fee,
            features: fc.features || []
          }))

        setOneOnOnePlans(oneOnOne)
        setGroupPlans(group)
        setWeekendPlans(weekend)
      })
      .catch(err => {
        console.error('Error fetching fee cards:', err)
        setError(err.message || 'Unable to sync with tuition details.')
      })
      .finally(() => setLoading(false))
  }, [])

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
            <span className="text-foreground font-semibold">Tuition & Fees</span>
          </nav>
          <span className="text-xs font-semibold uppercase tracking-widest text-secondary">Transparent Pricing</span>
          <h1 className="font-serif font-bold text-4xl md:text-5xl mt-3 mb-5" style={{ color: "#1A1A1A" }}>
            Tuition & Fees
          </h1>
          <p className="text-lg max-w-2xl mx-auto text-gray-600">
            Simple, affordable pricing with no hidden costs. Choose the plan that fits your schedule and learning goals — and start with a 3-day trial.
          </p>
        </div>
      </section>

      {/* Loading & Error States */}
      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center py-24 bg-white">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="text-sm text-gray-500 font-semibold mt-4">Loading dynamic tuition fee cards...</p>
        </div>
      )}

      {error && (
        <div className="flex-1 flex flex-col items-center justify-center py-24 bg-white px-4">
          <div className="p-4 bg-rose-50 border border-rose-150 rounded-2xl text-center max-w-md">
            <p className="font-bold text-rose-900 mb-1">Could Not Load Fee Plans</p>
            <p className="text-xs text-rose-750">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
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

              {oneOnOnePlans.length === 0 ? (
                <p className="text-sm text-gray-500 italic text-center py-10 bg-zinc-50 rounded-xl max-w-lg mx-auto">No 1:1 plan structures found.</p>
              ) : (
                <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
                  {oneOnOnePlans.map((plan, i) => (
                    <div
                      key={plan.id || i}
                      className={`relative rounded-2xl border flex flex-col overflow-hidden transition-all duration-300 w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] ${
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
                          {plan.features.map((f: any, j: any) => (
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
              )}
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

              {groupPlans.length === 0 ? (
                <p className="text-sm text-gray-500 italic text-center py-10 bg-white border border-gray-150 rounded-xl max-w-md mx-auto">No Group plan structures found.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  {groupPlans.map((plan, i) => (
                    <div
                      key={plan.id || i}
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
                            <span className="text-sm mb-1 text-gray-555">/month</span>
                          </div>
                          <ul className="space-y-3.5 mb-7">
                            {plan.features.map((f: any, j: any) => (
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
              )}
            </div>
          </section>
        </>
      )}

      {/* Weekend Plan */}
      {weekendPlans.length > 0 && (
        <section className="py-24 bg-white relative z-10">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 mb-3 px-4 py-2 rounded-full bg-[#E8F5EE] border border-primary/10">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Weekend Classes</span>
              </div>
              <h2 className="font-serif font-bold text-3xl md:text-4xl text-gray-900">
                {weekendPlans[0].label || 'Dedicated Weekend Plan'}
              </h2>
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
                    <span className="font-serif font-bold text-primary" style={{ fontSize: "4.5rem", lineHeight: 1 }}>
                      ${weekendPlans[0].price}
                    </span>
                    <span className="text-base mb-2 text-gray-500">/month</span>
                  </div>
                  <p className="text-xs mt-2 text-gray-400 font-semibold">30 minutes per session</p>
                </div>
                <ul className="space-y-4 mb-8">
                  {weekendPlans[0].features.map((f: any, i: number) => (
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
      )}

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
              { title: "3-Day Trial Period", body: "Every new student receives a 3-day trial period. Tuition payment is completed in advance before sessions begin." },
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
          <h2 className="font-serif font-bold text-3xl md:text-4xl mb-4">Start with a 3-Day Trial</h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            Apply today, complete your enrollment fee, and begin your 3-day trial with confidence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/enrollment" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-secondary text-white hover:bg-secondary/95 py-3.5 px-8 font-semibold shadow-lg text-sm text-center"
            >
              Apply for Trial Period
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
