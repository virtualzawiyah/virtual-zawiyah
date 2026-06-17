import { Layout, GeometricPattern } from "@/components/layout";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, CheckCircle2, Award } from "lucide-react";
import { fadeUp } from "@/lib/animations";

interface Course {
  icon: string;
  name: string;
  description: string;
  format: "One-on-One" | "Group";
  duration: string;
  fee: number;
  feeLabel: string;
  freeTrial: boolean;
  highlights: string[];
}

const oneOnOneCourses: Course[] = [
  {
    icon: "📖",
    name: "Quran Reading with Tajweed",
    description: "Learn to read the Holy Quran correctly with proper Tajweed rules. This foundational course is suitable for beginners and those looking to improve their recitation. Progress at your own pace with personalized guidance.",
    format: "One-on-One",
    duration: "30 / 60 / 90 min per session",
    fee: 60,
    feeLabel: "$60 / month",
    freeTrial: true,
    highlights: ["Makhaarij (articulation points)", "Rules of Noon Sakinah & Tanween", "Rules of Madd", "Practice with Quran passages"],
  },
  {
    icon: "🎯",
    name: "Applied Tajweed (Basic)",
    description: "A focused course on mastering the foundational rules of Tajweed with practical application. Ideal for students who can read Arabic but want to perfect their recitation quality.",
    format: "One-on-One",
    duration: "30 / 60 / 90 min per session",
    fee: 60,
    feeLabel: "$60 / month",
    freeTrial: true,
    highlights: ["All Tajweed rules systematically", "Audio feedback and correction", "Practical recitation exercises", "Recitation evaluation reports"],
  },
  {
    icon: "🌙",
    name: "Quran Memorization (Hifz)",
    description: "Embark on the noble journey of becoming a Hafiz or Hafizah. This personalized course uses proven memorization techniques adapted to your schedule and learning style.",
    format: "One-on-One",
    duration: "30 / 60 / 90 min per session",
    fee: 60,
    feeLabel: "$60 / month",
    freeTrial: true,
    highlights: ["Personalized memorization plan", "Daily revision (muraja'ah) sessions", "Tajweed-accurate memorization", "Progress tracking and reports"],
  },
  {
    icon: "📜",
    name: "40 Hadith Memorization",
    description: "Memorize Imam Nawawi's collection of 40 essential Hadiths — the prophetic traditions every Muslim should know. Each Hadith is explained in context.",
    format: "One-on-One",
    duration: "30 / 60 / 90 min per session",
    fee: 60,
    feeLabel: "$60 / month",
    freeTrial: true,
    highlights: ["Full Arabic text memorization", "Meaning and explanation of each Hadith", "Chain of narration introduction", "Regular revision"],
  },
  {
    icon: "🌐",
    name: "Quran Translation",
    description: "Understand the meaning of the Quran in English. This course helps students connect with the Quran's message, themes, and wisdom beyond recitation.",
    format: "One-on-One",
    duration: "30 / 60 / 90 min per session",
    fee: 60,
    feeLabel: "$60 / month",
    freeTrial: true,
    highlights: ["Word-for-word translation", "Thematic understanding", "Tafsir introduction", "Contemporary application"],
  },
  {
    icon: "✍️",
    name: "Arabic Grammar (Sarf & Nahw)",
    description: "Master classical Arabic grammar — the key that unlocks the Quran, Hadith, and Islamic texts. Covers both morphology (Sarf) and syntax (Nahw) in a structured sequence.",
    format: "One-on-One",
    duration: "30 / 60 / 90 min per session",
    fee: 60,
    feeLabel: "$60 / month",
    freeTrial: true,
    highlights: ["Arabic word morphology (Sarf)", "Arabic sentence structure (Nahw)", "Classical text reading", "Application to Quranic Arabic"],
  },
];

const groupCourses: Course[] = [
  {
    icon: "🕌",
    name: "Dars-e-Nizami — Classical Islamic Curriculum",
    description: "The complete 8-year classical Islamic scholarship curriculum taught in traditional seminaries worldwide. Students select their year of entry at admission. Subjects include Fiqh, Hadith, Tafsir, Aqeedah, Arabic Grammar, Mantiq (Logic), Balagha (Rhetoric), and more.",
    format: "Group",
    duration: "120 min · 5 days/week",
    fee: 40,
    feeLabel: "$40 / month",
    freeTrial: false,
    highlights: ["8-year structured curriculum", "Fiqh, Hadith, Tafsir, Aqeedah", "Mantiq, Balagha, and more", "Select Year 1 to 8 at enrollment"],
  },
  {
    icon: "✨",
    name: "Tajweed — 2-Year Structured Group Program",
    description: "A comprehensive two-year group course covering all Tajweed rules from beginner to advanced level. Students progress through a structured curriculum alongside peers and benefit from group recitation practice.",
    format: "Group",
    duration: "120 min · 5 days/week",
    fee: 40,
    feeLabel: "$40 / month",
    freeTrial: false,
    highlights: ["Complete Tajweed rules over 2 years", "Group recitation practice", "Regular assessments", "Certificate upon completion"],
  },
];

function CourseCard({ course, index }: { course: Course; index: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      custom={index}
      variants={fadeUp}
      whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(27,107,58,0.12)" }}
      className="rounded-2xl p-8 border bg-background transition-all flex flex-col"
      style={{ borderColor: "rgba(27,107,58,0.15)" }}
      data-testid={`course-card-${index}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="text-4xl">{course.icon}</div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant="outline" className={course.format === "Group" ? "border-blue-300 text-blue-700 bg-blue-50" : "border-green-300 text-green-700 bg-green-50"}>
            {course.format}
          </Badge>
          {course.freeTrial && (
            <Badge className="text-xs font-semibold" style={{ background: "#C9A84C", color: "#1A1A1A" }}>
              3 Days Free Trial
            </Badge>
          )}
        </div>
      </div>
      <h3 className="font-serif font-bold text-xl mb-3" style={{ color: "#1A1A1A" }}>{course.name}</h3>
      <p className="text-sm leading-relaxed mb-5" style={{ color: "#666" }}>{course.description}</p>

      <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
        <div className="flex items-center gap-2" style={{ color: "#555" }}>
          <Clock className="w-4 h-4 text-primary shrink-0" />
          <span>{course.duration}</span>
        </div>
        <div className="flex items-center gap-2 font-semibold" style={{ color: "#1B6B3A" }}>
          <Award className="w-4 h-4 shrink-0" />
          <Link href="/fees" className="underline underline-offset-2 hover:opacity-75 transition-opacity">View Fees →</Link>
        </div>
      </div>

      <ul className="space-y-2 mb-7">
        {course.highlights.map((h, i) => (
          <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "#555" }}>
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>{h}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto">
        <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" data-testid={`btn-apply-course-${index}`}>
          <Link href="/admission">Apply Now</Link>
        </Button>
      </div>
    </motion.div>
  );
}

export default function Courses() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden py-20" style={{ background: "linear-gradient(135deg, #E8F5EE 0%, #FAFAF7 100%)" }}>
        <GeometricPattern opacity={0.07} />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <nav className="text-sm text-muted-foreground mb-6">
              <Link href="/" className="hover:text-primary">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-foreground font-medium">Courses</span>
            </nav>
            <h1 className="font-serif font-bold text-4xl md:text-5xl mb-4" style={{ color: "#1A1A1A" }}>Our Courses</h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "#666666" }}>
              Comprehensive Islamic education — from Quran recitation to classical scholarship. Every course taught by qualified scholars.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Note */}
      <section className="py-10 bg-background border-b" style={{ borderColor: "rgba(27,107,58,0.1)" }}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-center gap-8 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-bold text-lg" style={{ color: "#1B6B3A" }}>From $60 / month</div>
                <div className="text-sm" style={{ color: "#666" }}>One-on-One Classes</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="font-bold text-lg text-blue-700">$40 / month</div>
                <div className="text-sm" style={{ color: "#666" }}>Group Classes</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(201,168,76,0.15)" }}>
                <Award className="w-5 h-5" style={{ color: "#C9A84C" }} />
              </div>
              <div className="text-left">
                <div className="font-bold text-lg" style={{ color: "#C9A84C" }}>3 Days Free</div>
                <div className="text-sm" style={{ color: "#666" }}>Trial for 1:1 Courses</div>
              </div>
            </div>
          </div>
          <p className="text-center text-sm mt-6" style={{ color: "#999" }}>
            Full pricing breakdown with all plan options on our{" "}
            <Link href="/fees" className="font-medium underline" style={{ color: "#1B6B3A" }}>Tuition & Fees</Link> page.
          </p>
        </div>
      </section>

      {/* One-on-One Courses */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div className="mb-14" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="font-serif font-bold text-3xl md:text-4xl" style={{ color: "#1A1A1A" }}>One-on-One Courses</h2>
            <p className="mt-2 text-base" style={{ color: "#666" }}>Personalized instruction tailored to your pace and learning style. From $60/month · 3 days free trial.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {oneOnOneCourses.map((course, i) => (
              <CourseCard key={i} course={course} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Group Courses */}
      <section className="py-24" style={{ background: "#FAFAF7" }}>
        <div className="container mx-auto px-4">
          <motion.div className="mb-14" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="font-serif font-bold text-3xl md:text-4xl" style={{ color: "#1A1A1A" }}>Group Courses</h2>
            <p className="mt-2 text-base" style={{ color: "#666" }}>Structured group learning with fellow students. $40/month · 120 min · 5 days/week.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {groupCourses.map((course, i) => (
              <CourseCard key={i} course={course} index={oneOnOneCourses.length + i} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary relative overflow-hidden">
        <GeometricPattern opacity={0.05} />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="font-serif font-bold text-3xl text-white mb-4">Not sure which course is right for you?</h2>
            <p className="text-white/80 mb-8 max-w-md mx-auto">Our admissions team will help match you with the perfect course and teacher.</p>
            <Button asChild size="lg" className="font-semibold px-10 h-14 shadow-lg" style={{ background: "#C9A84C", color: "#1A1A1A" }} data-testid="btn-apply-courses-cta">
              <Link href="/admission">Apply Now</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
