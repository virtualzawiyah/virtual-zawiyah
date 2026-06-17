'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ChevronRight, Users, Star, 
  Video, Clock, ShieldCheck, 
  ArrowRight, Quote, Compass
} from 'lucide-react'
import PublicNavbar from '@/components/PublicNavbar'
import PublicFooter from '@/components/PublicFooter'
import GeometricPattern from '@/components/GeometricPattern'

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const duration = 1500
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [target])

  return <div className="font-serif font-bold text-5xl mb-1 text-primary">{count}{suffix}</div>
}

const testimonials = [
  { name: "Aisha Rahman", country: "United Kingdom", rating: 5, text: "My son has memorized 5 juz in just 8 months. The teachers are incredibly patient and knowledgeable. Virtual Zawiyah has been a blessing for our family." },
  { name: "Omar Al-Farooq", country: "United States", rating: 5, text: "The Dars-e-Nizami program is exactly what I was looking for. Structured, authentic, and taught by true scholars. I recommend this academy to every serious student." },
  { name: "Maryam Siddiqui", country: "Canada", rating: 5, text: "The female teachers are so warm and professional. My daughter loves her Tajweed classes and her recitation has improved beyond recognition." },
  { name: "Ibrahim Hassan", country: "Australia", rating: 5, text: "The flexible scheduling works perfectly with my job. I never miss a class. The live format keeps me engaged in a way recorded lessons never could." },
  { name: "Fatima Al-Zahra", country: "Germany", rating: 5, text: "Gender-segregated classes gave our family the confidence to enroll. Our daughters are now learning Quran with wonderful female teachers. Jazakallah khair." },
]

const features = [
  { icon: Video, title: "Live One-on-One Classes", desc: "Personalized attention from qualified teachers in real-time sessions tailored to your pace." },
  { icon: Users, title: "Qualified Scholars", desc: "All teachers hold traditional Islamic qualifications — Hafiz, Alim, and Tajweed-certified." },
  { icon: Clock, title: "Flexible Scheduling", desc: "Choose your preferred days and times. Classes fit around your life, not the other way around." },
  { icon: ShieldCheck, title: "Gender-Segregated Teaching", desc: "Male teachers for male students, female teachers for female students — always." },
]

const coursePreview = [
  { icon: "📖", name: "Quran Reading with Tajweed", desc: "Master correct Quranic recitation with professional Tajweed rules from a qualified teacher.", type: "One-on-One" },
  { icon: "🌙", name: "Quran Memorization (Hifz)", desc: "Embark on the noble journey of Quran memorization with dedicated personal instruction.", type: "One-on-One" },
  { icon: "📜", name: "Arabic Grammar (Sarf & Nahw)", desc: "Understand the classical Arabic language that unlocks the Quran and Islamic texts.", type: "One-on-One" },
  { icon: "🕌", name: "Dars-e-Nizami", desc: "The complete 8-year classical Islamic curriculum — from Fiqh to Hadith to Aqeedah.", type: "Group" },
  { icon: "📚", name: "40 Hadith Memorization", desc: "Memorize and understand Imam Nawawi's essential collection of prophetic traditions.", type: "One-on-One" },
  { icon: "✨", name: "Applied Tajweed", desc: "A focused one-on-one program to master Tajweed rules and perfect your Quranic recitation.", type: "One-on-One" },
]

const teachersList = [
  { name: "Ustadh Ahmad Bilal", qualification: "Hafiz, Alim", subject: "Quran & Tajweed", gender: "Male", letter: "AB" },
  { name: "Ustadha Fatima Zahra", qualification: "Hafizah, Tajweed Certified", subject: "Quran & Hifz", gender: "Female", letter: "FZ" },
  { name: "Ustadh Yusuf Qasim", qualification: "Alim, Arabic Specialist", subject: "Arabic Grammar", gender: "Male", letter: "YQ" },
]

export default function Home() {
  const [carouselIndex, setCarouselIndex] = useState(0)

  const handleNextTestimonial = () => {
    setCarouselIndex((prev) => (prev + 1) % testimonials.length)
  }

  const handlePrevTestimonial = () => {
    setCarouselIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  // Get active testimonials to display (1 on mobile, 2 on desktop)
  const activeTestimonials = [
    testimonials[carouselIndex],
    testimonials[(carouselIndex + 1) % testimonials.length]
  ]

  return (
    <div className="public-page min-h-screen flex flex-col font-sans">
      <PublicNavbar />

      {/* Hero */}
      <section 
        className="relative overflow-hidden min-h-[85vh] flex items-center" 
        style={{ background: "linear-gradient(135deg, #E8F5EE 0%, #FAFAF7 60%, #E8F5EE 100%)" }}
      >
        <GeometricPattern opacity={0.06} />
        <div className="container mx-auto px-4 relative z-10 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left: Text Content */}
            <div className="space-y-6 animate-fade-in-up">
              <span
                className="inline-block py-1.5 px-4 rounded-full text-xs font-semibold uppercase tracking-wider border"
                style={{ background: "rgba(201,168,76,0.15)", borderColor: "rgba(201,168,76,0.4)", color: "#8B6914" }}
              >
                Authentic Islamic Education Online
              </span>
              <h1
                className="font-serif font-bold leading-tight"
                style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)", color: "#1A1A1A" }}
              >
                Learn the Quran <br />
                <span className="text-primary italic">From Anywhere</span>
              </h1>
              <p
                className="text-lg leading-relaxed max-w-xl"
                style={{ color: "#666666" }}
              >
                Virtual Zawiyah offers live, structured Islamic education with qualified scholars — accessible to every Muslim, wherever they are.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <Link
                  href="/enrollment"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-white py-3.5 px-8 font-semibold shadow-md transition-all active:scale-[0.98]"
                >
                  Apply Now 
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/courses"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md border border-primary text-primary hover:bg-primary/5 py-3.5 px-8 font-semibold transition-all active:scale-[0.98]"
                >
                  Explore Courses
                </Link>
              </div>
            </div>

            {/* Right: Custom Decorative Badge Ornaments */}
            <div className="relative flex justify-center lg:justify-end animate-fade-in-up">
              <div 
                className="relative w-full max-w-[420px] aspect-square rounded-3xl border p-8 flex flex-col justify-between shadow-2xl backdrop-blur-md transition-all duration-500 hover:border-primary/30"
                style={{ background: "rgba(232, 245, 238, 0.4)", borderColor: "rgba(27,107,58,0.15)" }}
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex-grow flex flex-col items-center justify-center space-y-6 py-8">
                  <div 
                    className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-[#C9A84C]/10 border border-primary/20 text-primary transition-all duration-500 hover:rotate-6"
                  >
                    <div className="absolute inset-1 border border-dashed border-primary/30 rounded-xl" />
                    <Compass className="h-12 w-12 text-primary" />
                  </div>
                  <div className="text-center space-y-1">
                    <h3 className="text-3xl font-serif font-bold text-gray-900 tracking-wider">الزاوية الافتراضية</h3>
                    <p className="text-[10px] text-secondary font-extrabold uppercase tracking-widest">Virtual Zawiyah</p>
                  </div>
                </div>

                <div className="border-t border-gray-200/50 pt-5 text-center flex items-center justify-center gap-2">
                  <span className="text-lg">🌟</span>
                  <span className="text-sm font-semibold text-primary">3 Days Free Trial Evaluation Class</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-16 bg-primary text-white relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Active Students", target: 500, suffix: "+" },
              { label: "Qualified Teachers", target: 20, suffix: "+" },
              { label: "Countries Served", target: 30, suffix: "+" },
              { label: "Courses Offered", target: 8, suffix: "" },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <AnimatedCounter target={stat.target} suffix={stat.suffix} />
                <div className="text-white/80 font-medium text-sm md:text-base mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-background relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-secondary">Why Choose Us</span>
            <h2 className="font-serif font-bold text-3xl md:text-4xl" style={{ color: "#1A1A1A" }}>Why Virtual Zawiyah</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <div
                  key={i}
                  className="rounded-xl p-8 text-center border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/[0.04]"
                  style={{ background: "#E8F5EE", borderColor: "rgba(27,107,58,0.12)" }}
                >
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-serif font-bold text-lg mb-3" style={{ color: "#1A1A1A" }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-600">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Course Preview */}
      <section className="py-24 relative z-10" style={{ background: "#FAFAF7" }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-secondary">Our Curriculum</span>
            <h2 className="font-serif font-bold text-3xl md:text-4xl" style={{ color: "#1A1A1A" }}>Explore Our Courses</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coursePreview.map((course, i) => (
              <div
                key={i}
                className="rounded-xl p-7 border bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/[0.05]"
                style={{ borderColor: "rgba(27,107,58,0.15)" }}
              >
                <div className="text-4xl mb-4">{course.icon}</div>
                <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3 ${
                  course.type === "Group" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"
                }`}>
                  {course.type}
                </span>
                <h3 className="font-serif font-bold text-xl mb-2" style={{ color: "#1A1A1A" }}>{course.name}</h3>
                <p className="text-sm leading-relaxed text-gray-600 mb-5 min-h-[48px]">{course.desc}</p>
                <Link 
                  href="/courses"
                  className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline transition-all"
                >
                  Learn More About Our Courses 
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link 
              href="/courses"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 font-semibold transition-colors shadow-sm"
            >
              View All Courses
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-primary relative overflow-hidden z-10">
        <GeometricPattern opacity={0.05} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-secondary">Simple Process</span>
            <h2 className="font-serif font-bold text-3xl md:text-4xl text-white">How It Works</h2>
          </div>
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10 max-w-4xl mx-auto">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[calc(16.67%+2.5rem)] right-[calc(16.67%+2.5rem)] h-0.5 bg-secondary/30" />
            {[
              { step: "01", title: "Apply Online", desc: "Fill out our simple application form with your details and preferred course. Takes just 5 minutes." },
              { step: "02", title: "Get Matched", desc: "Our team reviews your application within 24 hours and matches you with the ideal teacher." },
              { step: "03", title: "Start Learning", desc: "Begin your Islamic learning journey with a free trial session — no commitment required." },
            ].map((s, i) => (
              <div key={i} className="text-center text-white relative z-10">
                <div className="w-20 h-20 rounded-full border-2 border-secondary flex items-center justify-center mx-auto mb-6 bg-primary">
                  <span className="font-serif font-bold text-2xl text-secondary">{s.step}</span>
                </div>
                <h3 className="font-serif font-bold text-xl mb-3">{s.title}</h3>
                <p className="text-white/75 text-sm leading-relaxed max-w-xs mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-14">
            <Link 
              href="/enrollment"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-secondary text-white hover:bg-secondary/90 py-3.5 px-10 font-bold shadow-md transition-all active:scale-[0.98]"
            >
              Start with a Free Trial 
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-background relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-secondary">Student Stories</span>
            <h2 className="font-serif font-bold text-3xl md:text-4xl" style={{ color: "#1A1A1A" }}>What Our Students Say</h2>
            <p className="max-w-xl mx-auto text-sm text-gray-500 mt-2">
              Families from across the globe trust Virtual Zawiyah with their Islamic education.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            {/* Mobile Carousel (single slide) / Desktop layout (two slides side-by-side) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-500">
              {activeTestimonials.map((t, i) => (
                <div key={i} className={`p-8 rounded-xl border border-primary/15 bg-card text-card-foreground shadow-sm flex flex-col justify-between ${
                  i === 1 ? 'hidden md:flex' : 'flex'
                }`}>
                  <div>
                    <Quote className="w-8 h-8 mb-4 text-secondary" />
                    <p className="text-sm leading-relaxed mb-6 italic text-gray-700">&quot;{t.text}&quot;</p>
                  </div>
                  <div className="flex items-center gap-3 border-t border-gray-200/50 pt-4">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                      {t.name[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-gray-900">{t.name}</div>
                      <div className="text-xs text-gray-500">{t.country}</div>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-secondary text-secondary" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Carousel navigation controls */}
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                onClick={handlePrevTestimonial}
                aria-label="Previous testimonial"
                className="w-10 h-10 rounded-full border border-primary/20 text-primary hover:bg-primary hover:text-white flex items-center justify-center transition-colors bg-white shadow-sm"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
              <button
                onClick={handleNextTestimonial}
                aria-label="Next testimonial"
                className="w-10 h-10 rounded-full border border-primary/20 text-primary hover:bg-primary hover:text-white flex items-center justify-center transition-colors bg-white shadow-sm"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Faculty / Teachers */}
      <section className="py-24 relative z-10" style={{ background: "#FAFAF7" }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-secondary">Meet the Faculty</span>
            <h2 className="font-serif font-bold text-3xl md:text-4xl" style={{ color: "#1A1A1A" }}>Featured Teachers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {teachersList.map((t, i) => (
              <div
                key={i}
                className="rounded-xl p-8 text-center border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/20"
                style={{ borderColor: "rgba(27,107,58,0.15)" }}
              >
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/10">
                  <span className="font-serif font-bold text-2xl text-primary">{t.letter}</span>
                </div>
                <span className={`inline-block text-[10px] px-3 py-1 rounded-full mb-3 font-bold uppercase tracking-wider ${
                  t.gender === "Female" ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"
                }`}>
                  {t.gender} Teacher
                </span>
                <h3 className="font-serif font-bold text-lg mb-1" style={{ color: "#1A1A1A" }}>{t.name}</h3>
                <p className="text-xs font-semibold mb-1 text-secondary">{t.qualification}</p>
                <p className="text-xs text-gray-500">{t.subject}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link 
              href="/courses"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 font-semibold transition-colors shadow-sm"
            >
              View All Courses & Syllabus
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 relative overflow-hidden bg-primary text-white z-10">
        <GeometricPattern opacity={0.05} />
        <div className="container mx-auto px-4 text-center relative z-10">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-4 text-secondary">Begin Today</span>
          <h2 className="font-serif font-bold text-3xl md:text-4xl mb-4 text-white">Ready to Begin Your Journey?</h2>
          <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Apply for a free 3-day trial today and experience authentic Islamic education from qualified scholars — wherever you are in the world.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/enrollment"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-secondary text-white hover:bg-secondary/95 py-3.5 px-10 font-semibold shadow-lg transition-all active:scale-[0.98]"
            >
              Apply for Free Trial 
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/courses"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md border border-white/40 text-white hover:bg-white/10 hover:border-white py-3.5 px-10 font-semibold transition-all active:scale-[0.98]"
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
