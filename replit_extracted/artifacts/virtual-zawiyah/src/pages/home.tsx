import { Layout, GeometricPattern } from "@/components/layout";
import { Link } from "wouter";
import {
  ChevronRight, Users, Globe, BookOpen, Star,
  Video, Clock, ShieldCheck, CheckCircle2,
  ArrowRight, Quote
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useEmblaCarousel from "embla-carousel-react";
import { fadeUp } from "@/lib/animations";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1800;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <div ref={ref} className="font-serif font-bold text-5xl mb-1">{count}{suffix}</div>;
}


const testimonials = [
  { name: "Aisha Rahman", country: "United Kingdom", rating: 5, text: "My son has memorized 5 juz in just 8 months. The teachers are incredibly patient and knowledgeable. Virtual Zawiyah has been a blessing for our family." },
  { name: "Omar Al-Farooq", country: "United States", rating: 5, text: "The Dars-e-Nizami program is exactly what I was looking for. Structured, authentic, and taught by true scholars. I recommend this academy to every serious student." },
  { name: "Maryam Siddiqui", country: "Canada", rating: 5, text: "The female teachers are so warm and professional. My daughter loves her Tajweed classes and her recitation has improved beyond recognition." },
  { name: "Ibrahim Hassan", country: "Australia", rating: 5, text: "The flexible scheduling works perfectly with my job. I never miss a class. The live format keeps me engaged in a way recorded lessons never could." },
  { name: "Fatima Al-Zahra", country: "Germany", rating: 5, text: "Gender-segregated classes gave our family the confidence to enroll. Our daughters are now learning Quran with wonderful female teachers. Jazakallah khair." },
];

const features = [
  { icon: Video, title: "Live One-on-One Classes", desc: "Personalized attention from qualified teachers in real-time sessions tailored to your pace." },
  { icon: Users, title: "Qualified Scholars", desc: "All teachers hold traditional Islamic qualifications — Hafiz, Alim, and Tajweed-certified." },
  { icon: Clock, title: "Flexible Scheduling", desc: "Choose your preferred days and times. Classes fit around your life, not the other way around." },
  { icon: ShieldCheck, title: "Gender-Segregated Teaching", desc: "Male teachers for male students, female teachers for female students — always." },
];

const coursePreview = [
  { icon: "📖", name: "Quran Reading with Tajweed", desc: "Master correct Quranic recitation with professional Tajweed rules from a qualified teacher.", type: "One-on-One" },
  { icon: "🌙", name: "Quran Memorization (Hifz)", desc: "Embark on the noble journey of Quran memorization with dedicated personal instruction.", type: "One-on-One" },
  { icon: "📜", name: "Arabic Grammar (Sarf & Nahw)", desc: "Understand the classical Arabic language that unlocks the Quran and Islamic texts.", type: "One-on-One" },
  { icon: "🕌", name: "Dars-e-Nizami", desc: "The complete 8-year classical Islamic curriculum — from Fiqh to Hadith to Aqeedah.", type: "Group" },
  { icon: "📚", name: "40 Hadith Memorization", desc: "Memorize and understand Imam Nawawi's essential collection of prophetic traditions.", type: "One-on-One" },
  { icon: "✨", name: "Applied Tajweed", desc: "A focused one-on-one program to master Tajweed rules and perfect your Quranic recitation.", type: "One-on-One" },
];

const teachers = [
  { name: "Ustadh Ahmad Bilal", qualification: "Hafiz, Alim", subject: "Quran & Tajweed", gender: "Male" },
  { name: "Ustadha Fatima Zahra", qualification: "Hafizah, Tajweed Certified", subject: "Quran & Hifz", gender: "Female" },
  { name: "Ustadh Yusuf Qasim", qualification: "Alim, Arabic Specialist", subject: "Arabic Grammar", gender: "Male" },
];

export default function Home() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[88vh] flex items-center" style={{ background: "linear-gradient(135deg, #E8F5EE 0%, #FAFAF7 60%, #E8F5EE 100%)" }}>
        <GeometricPattern opacity={0.06} />
        <div className="container mx-auto px-4 relative z-10 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <motion.span
                variants={fadeUp} custom={0}
                className="inline-block py-1.5 px-4 rounded-full text-sm font-semibold mb-6 border"
                style={{ background: "rgba(201,168,76,0.15)", borderColor: "rgba(201,168,76,0.4)", color: "#8B6914" }}
              >
                Authentic Islamic Education Online
              </motion.span>
              <motion.h1
                variants={fadeUp} custom={1}
                className="font-serif font-bold leading-tight mb-6"
                style={{ fontSize: "clamp(2rem, 5vw, 3.6rem)", color: "#1A1A1A" }}
              >
                Learn the Quran From Anywhere in the World
              </motion.h1>
              <motion.p
                variants={fadeUp} custom={2}
                className="text-lg mb-8"
                style={{ color: "#666666", maxWidth: "520px" }}
              >
                Virtual Zawiyah offers live, structured Islamic education with qualified scholars — accessible to every Muslim, wherever they are.
              </motion.p>
              <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-start gap-4">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 h-14 text-base w-full sm:w-auto shadow-md" data-testid="btn-apply-hero">
                  <Link href="/admission">Apply Now <ChevronRight className="ml-1 w-5 h-5" /></Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-14 px-8 text-base w-full sm:w-auto border-primary text-primary hover:bg-primary/5 font-semibold" data-testid="btn-courses-hero">
                  <Link href="/courses">Explore Courses</Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Right: Hero Image */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
              className="relative flex justify-center lg:justify-end"
            >
              <div className="relative w-full max-w-lg">
                {/* Decorative ring */}
                <div
                  className="absolute -inset-3 rounded-3xl opacity-20"
                  style={{ background: "linear-gradient(135deg, #1B6B3A, #C9A84C)" }}
                />
                <img
                  src="/hero-quran-students.png"
                  alt="Young Muslim students reading the Holy Quran"
                  className="relative rounded-2xl shadow-2xl w-full object-cover"
                  style={{ aspectRatio: "4/3" }}
                />
                {/* Floating badge */}
                <div
                  className="absolute -bottom-4 -left-4 rounded-xl px-4 py-3 shadow-lg text-white text-sm font-semibold flex items-center gap-2"
                  style={{ background: "#1B6B3A" }}
                >
                  <span className="text-lg">🌟</span>
                  <span>3 Days Free Trial</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Active Students", target: 500, suffix: "+" },
              { label: "Qualified Teachers", target: 20, suffix: "+" },
              { label: "Countries Served", target: 30, suffix: "+" },
              { label: "Courses Offered", target: 8, suffix: "" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex flex-col items-center"
                data-testid={`stat-${i}`}
              >
                <AnimatedCounter target={stat.target} suffix={stat.suffix} />
                <div className="text-primary-foreground/80 font-medium text-sm md:text-base">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Virtual Zawiyah */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          >
            <span className="text-sm font-semibold uppercase tracking-widest" style={{ color: "#C9A84C" }}>Why Choose Us</span>
            <h2 className="font-serif font-bold text-3xl md:text-4xl mt-2" style={{ color: "#1A1A1A" }}>Why Virtual Zawiyah</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}
                whileHover={{ y: -6, boxShadow: "0 12px 32px rgba(27,107,58,0.12)" }}
                className="rounded-xl p-8 text-center border transition-all cursor-default"
                style={{ background: "#E8F5EE", borderColor: "rgba(27,107,58,0.12)" }}
                data-testid={`feature-card-${i}`}
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <f.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-serif font-bold text-lg mb-3" style={{ color: "#1A1A1A" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#666666" }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Course Preview */}
      <section className="py-24" style={{ background: "#FAFAF7" }}>
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <span className="text-sm font-semibold uppercase tracking-widest" style={{ color: "#C9A84C" }}>Our Curriculum</span>
            <h2 className="font-serif font-bold text-3xl md:text-4xl mt-2" style={{ color: "#1A1A1A" }}>Explore Our Courses</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coursePreview.map((course, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}
                whileHover={{ y: -5, boxShadow: "0 16px 40px rgba(27,107,58,0.14)" }}
                className="rounded-xl p-7 border bg-background transition-all cursor-default"
                style={{ borderColor: "rgba(27,107,58,0.15)" }}
                data-testid={`course-card-${i}`}
              >
                <div className="text-4xl mb-4">{course.icon}</div>
                <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3 ${course.type === "Group" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"}`}>
                  {course.type}
                </span>
                <h3 className="font-serif font-bold text-xl mb-2" style={{ color: "#1A1A1A" }}>{course.name}</h3>
                <p className="text-sm leading-relaxed mb-5" style={{ color: "#666666" }}>{course.desc}</p>
                <Button asChild variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold">
                  <Link href="/courses">Learn More About Our Courses <ArrowRight className="ml-1 w-3.5 h-3.5" /></Link>
                </Button>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold px-8" data-testid="btn-view-all-courses">
              <Link href="/courses">View All Courses</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <GeometricPattern opacity={0.05} />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <span className="text-sm font-semibold uppercase tracking-widest text-secondary">Simple Process</span>
            <h2 className="font-serif font-bold text-3xl md:text-4xl mt-2 text-primary-foreground">How It Works</h2>
          </motion.div>
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10 max-w-4xl mx-auto">
            {/* Connector line behind the steps */}
            <div className="hidden md:block absolute top-10 left-[calc(16.67%+2.5rem)] right-[calc(16.67%+2.5rem)] h-0.5" style={{ background: "rgba(201,168,76,0.3)" }} />
            {[
              { step: "01", title: "Apply Online", desc: "Fill out our simple application form with your details and preferred course. Takes just 5 minutes." },
              { step: "02", title: "Get Matched", desc: "Our team reviews your application within 24 hours and matches you with the ideal teacher." },
              { step: "03", title: "Start Learning", desc: "Begin your Islamic learning journey with a free trial session — no commitment required." },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}
                className="text-center text-primary-foreground relative z-10"
                data-testid={`step-${i}`}
              >
                <div className="w-20 h-20 rounded-full border-2 border-secondary flex items-center justify-center mx-auto mb-6 bg-primary">
                  <span className="font-serif font-bold text-2xl text-secondary">{s.step}</span>
                </div>
                <h3 className="font-serif font-bold text-xl mb-3">{s.title}</h3>
                <p className="text-primary-foreground/75 text-sm leading-relaxed max-w-xs mx-auto">{s.desc}</p>
              </motion.div>
            ))}
          </div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mt-12">
            <Button asChild size="lg" className="font-semibold px-10 h-12" style={{ background: "#C9A84C", color: "#1A1A1A" }}>
              <Link href="/admission">Start with a Free Trial <ChevronRight className="ml-1 w-5 h-5" /></Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <span className="text-sm font-semibold uppercase tracking-widest" style={{ color: "#C9A84C" }}>Student Stories</span>
            <h2 className="font-serif font-bold text-3xl md:text-4xl mt-2" style={{ color: "#1A1A1A" }}>What Our Students Say</h2>
            <p className="mt-3 text-base max-w-xl mx-auto" style={{ color: "#666" }}>Families from across the globe trust Virtual Zawiyah with their Islamic education.</p>
          </motion.div>
          <div className="overflow-hidden max-w-5xl mx-auto" ref={emblaRef}>
            <div className="flex gap-6">
              {testimonials.map((t, i) => (
                <div key={i} className="flex-none w-full md:w-[calc(50%-12px)] min-w-0">
                  <Card className="h-full border" style={{ borderColor: "rgba(27,107,58,0.15)", background: "#E8F5EE" }}>
                    <CardContent className="p-8">
                      <Quote className="w-8 h-8 mb-4" style={{ color: "#C9A84C" }} />
                      <p className="text-sm leading-relaxed mb-6 italic" style={{ color: "#333" }}>"{t.text}"</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                          {t.name[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-sm" style={{ color: "#1A1A1A" }}>{t.name}</div>
                          <div className="text-xs" style={{ color: "#666" }}>{t.country}</div>
                        </div>
                        <div className="ml-auto flex gap-0.5">
                          {Array.from({ length: t.rating }).map((_, j) => (
                            <Star key={j} className="w-4 h-4 fill-current" style={{ color: "#C9A84C" }} />
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
          {/* Carousel navigation */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => emblaApi?.scrollPrev()}
              aria-label="Previous testimonial"
              className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all hover:bg-primary hover:border-primary hover:text-white"
              style={{ borderColor: "#1B6B3A", color: "#1B6B3A" }}
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
            <button
              onClick={() => emblaApi?.scrollNext()}
              aria-label="Next testimonial"
              className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all hover:bg-primary hover:border-primary hover:text-white"
              style={{ borderColor: "#1B6B3A", color: "#1B6B3A" }}
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Teacher Spotlight */}
      <section className="py-24" style={{ background: "#FAFAF7" }}>
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <span className="text-sm font-semibold uppercase tracking-widest" style={{ color: "#C9A84C" }}>Meet the Faculty</span>
            <h2 className="font-serif font-bold text-3xl md:text-4xl mt-2" style={{ color: "#1A1A1A" }}>Featured Teachers</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {teachers.map((t, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} variants={fadeUp}
                whileHover={{ y: -4 }}
                className="rounded-xl p-8 text-center border bg-background transition-all"
                style={{ borderColor: "rgba(27,107,58,0.15)" }}
                data-testid={`teacher-spotlight-${i}`}
              >
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 border-2 border-primary/20">
                  <span className="font-serif font-bold text-2xl text-primary">{t.name.split(" ")[1]?.[0] || t.name[0]}</span>
                </div>
                <span className="inline-block text-xs px-3 py-1 rounded-full mb-3 font-semibold"
                  style={{ background: t.gender === "Female" ? "rgba(236,72,153,0.1)" : "rgba(27,107,58,0.1)", color: t.gender === "Female" ? "#be185d" : "#1B6B3A" }}>
                  {t.gender} Teacher
                </span>
                <h3 className="font-serif font-bold text-lg mb-1" style={{ color: "#1A1A1A" }}>{t.name}</h3>
                <p className="text-xs font-semibold mb-1" style={{ color: "#C9A84C" }}>{t.qualification}</p>
                <p className="text-sm" style={{ color: "#666" }}>{t.subject}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold px-8" data-testid="btn-view-teachers">
              <Link href="/teachers">View All Teachers</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 relative overflow-hidden" style={{ background: "#1B6B3A" }}>
        <GeometricPattern opacity={0.05} />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <span className="inline-block text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "#C9A84C" }}>Begin Today</span>
            <h2 className="font-serif font-bold text-3xl md:text-4xl text-white mb-4">Ready to Begin Your Journey?</h2>
            <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">Apply for a free 3-day trial today and experience authentic Islamic education from qualified scholars — wherever you are in the world.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="font-semibold px-10 h-14 text-base shadow-lg w-full sm:w-auto" style={{ background: "#C9A84C", color: "#1A1A1A" }} data-testid="btn-apply-cta">
                <Link href="/admission">Apply for Free Trial <ChevronRight className="ml-2 w-5 h-5" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-semibold px-10 h-14 text-base w-full sm:w-auto border-white/40 text-white hover:bg-white/10 hover:border-white" data-testid="btn-courses-cta">
                <Link href="/courses">Browse Courses</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
