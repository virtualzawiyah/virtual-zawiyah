import { Layout, GeometricPattern } from "@/components/layout";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { fadeUp } from "@/lib/animations";
import { CheckCircle2, ChevronRight, Users, Video, Calendar } from "lucide-react";

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
];

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
];

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
};

export default function Fees() {
  return (
    <Layout>
      {/* Page Header */}
      <section className="relative py-20 overflow-hidden" style={{ background: "linear-gradient(135deg, #E8F5EE 0%, #FAFAF7 60%, #E8F5EE 100%)" }}>
        <GeometricPattern opacity={0.06} />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <span className="text-sm font-semibold uppercase tracking-widest" style={{ color: "#C9A84C" }}>Transparent Pricing</span>
            <h1 className="font-serif font-bold text-4xl md:text-5xl mt-3 mb-5" style={{ color: "#1A1A1A" }}>
              Tuition & Fees
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "#555" }}>
              Simple, affordable pricing with no hidden costs. Choose the plan that fits your schedule and learning goals — and start with a 3-day free trial.
            </p>
          </motion.div>
        </div>
      </section>

      {/* One-on-One Plans */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-14" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="inline-flex items-center gap-2 mb-3 px-4 py-2 rounded-full" style={{ background: "#E8F5EE" }}>
              <Video className="w-4 h-4" style={{ color: "#1B6B3A" }} />
              <span className="text-sm font-semibold" style={{ color: "#1B6B3A" }}>One-on-One Classes</span>
            </div>
            <h2 className="font-serif font-bold text-3xl md:text-4xl" style={{ color: "#1A1A1A" }}>Personal Instruction</h2>
            <p className="mt-3 max-w-xl mx-auto text-base" style={{ color: "#666" }}>
              Your dedicated teacher, your pace, your schedule. The most effective way to learn Quran and Islamic studies.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {oneOnOnePlans.map((plan, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}
                className={`relative rounded-2xl border flex flex-col overflow-hidden transition-all ${plan.popular ? "shadow-xl ring-2" : "shadow-sm hover:shadow-md"}`}
                style={{
                  borderColor: plan.popular ? "#1B6B3A" : "rgba(27,107,58,0.15)",
                  ...(plan.popular ? { "--tw-ring-color": "#1B6B3A" } as React.CSSProperties : {}),
                  background: plan.popular ? "#1B6B3A" : "#fff",
                }}
              >
                {plan.popular && (
                  <div className="text-center py-2 text-xs font-bold uppercase tracking-widest" style={{ background: "#C9A84C", color: "#1A1A1A" }}>
                    Most Popular
                  </div>
                )}
                <div className="p-7 flex flex-col flex-1">
                  <div className="mb-5">
                    <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${plan.popular ? "text-white/60" : ""}`} style={plan.popular ? {} : { color: "#999" }}>
                      {plan.duration} · {plan.label}
                    </p>
                    <div className="flex items-end gap-1 mt-2">
                      <span className={`font-serif font-bold text-5xl leading-none ${plan.popular ? "text-white" : ""}`} style={plan.popular ? {} : { color: "#1A1A1A" }}>
                        ${plan.price}
                      </span>
                      <span className={`text-sm mb-1 ${plan.popular ? "text-white/70" : ""}`} style={plan.popular ? {} : { color: "#888" }}>/month</span>
                    </div>
                    <p className={`text-xs mt-1 ${plan.popular ? "text-white/60" : ""}`} style={plan.popular ? {} : { color: "#aaa" }}>
                      ${plan.perLesson} per lesson
                    </p>
                  </div>

                  <ul className="space-y-3 flex-1 mb-7">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${plan.popular ? "text-secondary" : "text-primary"}`} />
                        <span className={plan.popular ? "text-white/85" : ""} style={plan.popular ? {} : { color: "#444" }}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    className={`w-full font-semibold h-11 ${plan.popular ? "bg-secondary text-secondary-foreground hover:bg-secondary/90" : "border-primary text-primary hover:bg-primary hover:text-white"}`}
                    variant={plan.popular ? "default" : "outline"}
                    style={plan.popular ? { background: "#C9A84C", color: "#1A1A1A" } : {}}
                  >
                    <Link href="/admission">Apply Now <ChevronRight className="ml-1 w-4 h-4" /></Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Group Plans */}
      <section className="py-24" style={{ background: "#FAFAF7" }}>
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-14" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="inline-flex items-center gap-2 mb-3 px-4 py-2 rounded-full" style={{ background: "#E8F5EE" }}>
              <Users className="w-4 h-4" style={{ color: "#1B6B3A" }} />
              <span className="text-sm font-semibold" style={{ color: "#1B6B3A" }}>Group Classes</span>
            </div>
            <h2 className="font-serif font-bold text-3xl md:text-4xl" style={{ color: "#1A1A1A" }}>Learn Together</h2>
            <p className="mt-3 max-w-xl mx-auto text-base" style={{ color: "#666" }}>
              Group sessions with a structured curriculum — collaborative, affordable, and effective.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {groupPlans.map((plan, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}
                className="rounded-2xl border bg-white shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden"
                style={{ borderColor: "rgba(27,107,58,0.15)" }}
              >
                <div className="p-8 flex flex-col flex-1">
                  <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#999" }}>
                    {plan.duration} · 5 Lessons / Week
                  </p>
                  <p className="font-serif font-bold text-xl mb-2" style={{ color: "#1A1A1A" }}>{plan.label}</p>
                  <div className="flex items-end gap-1 mb-6">
                    <span className="font-serif font-bold text-5xl leading-none" style={{ color: "#1B6B3A" }}>
                      ${plan.price}
                    </span>
                    <span className="text-sm mb-1" style={{ color: "#888" }}>/month</span>
                  </div>
                  <ul className="space-y-3 flex-1 mb-7">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                        <span style={{ color: "#444" }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild variant="outline" className="w-full font-semibold h-11 border-primary text-primary hover:bg-primary hover:text-white">
                    <Link href="/admission">Apply Now <ChevronRight className="ml-1 w-4 h-4" /></Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Weekend Plan */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-14" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="inline-flex items-center gap-2 mb-3 px-4 py-2 rounded-full" style={{ background: "#E8F5EE" }}>
              <Calendar className="w-4 h-4" style={{ color: "#1B6B3A" }} />
              <span className="text-sm font-semibold" style={{ color: "#1B6B3A" }}>Weekend Classes</span>
            </div>
            <h2 className="font-serif font-bold text-3xl md:text-4xl" style={{ color: "#1A1A1A" }}>Dedicated Weekend Plan</h2>
            <p className="mt-3 max-w-xl mx-auto text-base" style={{ color: "#666" }}>
              Perfect for students who can only attend on weekends — a consistent Saturday & Sunday routine at a dedicated rate.
            </p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="max-w-lg mx-auto rounded-2xl overflow-hidden shadow-xl border-2"
            style={{ borderColor: "#C9A84C" }}
          >
            {/* Gold header bar */}
            <div className="py-4 text-center font-bold text-sm uppercase tracking-widest" style={{ background: "#C9A84C", color: "#1A1A1A" }}>
              Saturday & Sunday · One-on-One
            </div>
            <div className="p-10 bg-white">
              <div className="text-center mb-8">
                <div className="flex items-end justify-center gap-1">
                  <span className="font-serif font-bold" style={{ fontSize: "4.5rem", lineHeight: 1, color: "#1B6B3A" }}>$100</span>
                  <span className="text-base mb-2" style={{ color: "#888" }}>/month</span>
                </div>
                <p className="text-sm mt-2" style={{ color: "#aaa" }}>30 minutes per session</p>
              </div>
              <ul className="space-y-4 mb-8">
                {weekendPlan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                    <span style={{ color: "#444" }}>{f}</span>
                  </li>
                ))}
              </ul>
              <Button asChild size="lg" className="w-full font-semibold h-12 text-base" style={{ background: "#1B6B3A", color: "#fff" }}>
                <Link href="/admission">Apply for Weekend Classes <ChevronRight className="ml-2 w-5 h-5" /></Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Notes & FAQ */}
      <section className="py-20" style={{ background: "#FAFAF7" }}>
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="font-serif font-bold text-2xl md:text-3xl mb-8 text-center" style={{ color: "#1A1A1A" }}>
              Good to Know
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { title: "Free Trial Included", body: "Every new student receives a 3-day free trial before committing to any plan. No payment required upfront." },
                { title: "Monthly Billing", body: "All plans are billed monthly with no long-term contract. Cancel or change your plan at any time." },
                { title: "Gender-Segregated Teaching", body: "Female students are always matched with female teachers; male students with male teachers — at no extra cost." },
                { title: "Flexible Rescheduling", body: "Missed a class? Sessions can be rescheduled with 12 hours' advance notice at no penalty." },
                { title: "All Ages Welcome", body: "Our plans cover children, teens, and adults. The curriculum and pace are tailored to the student's age and level." },
                { title: "Currency & Payment", body: "Fees are listed in USD. Payment is accepted via bank transfer, Wise, or other agreed methods." },
              ].map((note, i) => (
                <motion.div
                  key={i}
                  initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}
                  className="rounded-xl border p-6"
                  style={{ borderColor: "rgba(27,107,58,0.15)", background: "#fff" }}
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-primary" />
                    <div>
                      <p className="font-semibold text-sm mb-1" style={{ color: "#1A1A1A" }}>{note.title}</p>
                      <p className="text-sm leading-relaxed" style={{ color: "#666" }}>{note.body}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary relative overflow-hidden">
        <GeometricPattern opacity={0.05} />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="font-serif font-bold text-3xl md:text-4xl text-white mb-4">Start with 3 Days Free</h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              No payment needed to begin. Apply today, try your chosen plan for 3 days, and enrol with confidence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="font-semibold px-10 h-14 text-base w-full sm:w-auto shadow-lg" style={{ background: "#C9A84C", color: "#1A1A1A" }}>
                <Link href="/admission">Apply for Free Trial <ChevronRight className="ml-2 w-5 h-5" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-semibold px-10 h-14 text-base w-full sm:w-auto border-white/40 text-white hover:bg-white/10 hover:border-white">
                <Link href="/contact">Have a Question?</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
