import { Layout, GeometricPattern } from "@/components/layout";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Award, Globe } from "lucide-react";
import { fadeUp } from "@/lib/animations";

type FilterType = "All" | "Male" | "Female";

interface Teacher {
  name: string;
  gender: "Male" | "Female";
  qualifications: string;
  courses: string;
  languages: string;
  bio: string;
  avatar: string;
}

const teachers: Teacher[] = [
  {
    name: "Ustadh Ahmad Bilal",
    gender: "Male",
    qualifications: "Hafiz, Alim (Dars-e-Nizami graduate), Tajweed Certified",
    courses: "Quran Reading, Hifz, Applied Tajweed",
    languages: "Urdu, English, Arabic",
    bio: "Ustadh Ahmad completed his Hifz at age 12 and graduated from Darul Uloom with distinction. He has been teaching Quran and Islamic sciences for over 10 years, serving students across 15 countries.",
    avatar: "AB",
  },
  {
    name: "Ustadha Fatima Zahra",
    gender: "Female",
    qualifications: "Hafizah, Tajweed Certified, Alimah",
    courses: "Quran Reading, Hifz, Tajweed Group",
    languages: "Arabic, English, French",
    bio: "Ustadha Fatima is a graduate of Al-Azhar and a Hafizah with a specialization in Tajweed. She brings warmth, patience, and deep expertise to every lesson, particularly for children and sisters.",
    avatar: "FZ",
  },
  {
    name: "Ustadh Yusuf Qasim",
    gender: "Male",
    qualifications: "Alim, Arabic Grammar Specialist (Sarf & Nahw)",
    courses: "Arabic Grammar, Quran Translation, Dars-e-Nizami",
    languages: "Arabic, English, Urdu",
    bio: "Ustadh Yusuf spent 12 years studying Arabic linguistics and Islamic jurisprudence in Medina and Lahore. His grammar classes are known for making complex rules approachable and practical.",
    avatar: "YQ",
  },
  {
    name: "Ustadha Khadija Malik",
    gender: "Female",
    qualifications: "Hafizah, Alimah, Tajweed Instructor",
    courses: "Quran Reading, 40 Hadith, Tajweed Group",
    languages: "English, Urdu, Bengali",
    bio: "Ustadha Khadija has a gift for connecting with students of all ages. She specializes in making Quran learning accessible and meaningful for sisters, children, and those new to Islamic studies.",
    avatar: "KM",
  },
  {
    name: "Ustadh Ibrahim Hassan",
    gender: "Male",
    qualifications: "Hafiz, Alim, Hadith Scholar",
    courses: "40 Hadith, Dars-e-Nizami, Quran Memorization",
    languages: "Arabic, English, Swahili",
    bio: "Ustadh Ibrahim is a graduate of a renowned Islamic institution in Egypt with a specialization in Hadith sciences. He serves students across Africa, Europe, and North America with dedication.",
    avatar: "IH",
  },
  {
    name: "Ustadha Maryam Siddiqua",
    gender: "Female",
    qualifications: "Hafizah, Alimah, Quran Translation Expert",
    courses: "Quran Translation, Arabic Grammar, Quran Reading",
    languages: "English, Arabic, Urdu, Pashto",
    bio: "Ustadha Maryam holds an advanced degree in Islamic studies and has a particular passion for helping students understand the meaning and message of the Quran. Her translation classes transform how students relate to the Book of Allah.",
    avatar: "MS",
  },
];

const genderColors: Record<"Male" | "Female", { bg: string; text: string }> = {
  Male: { bg: "rgba(27,107,58,0.1)", text: "#1B6B3A" },
  Female: { bg: "rgba(236,72,153,0.1)", text: "#be185d" },
};

export default function Teachers() {
  const [filter, setFilter] = useState<FilterType>("All");

  const filtered = filter === "All" ? teachers : teachers.filter(t => t.gender === filter);

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
              <span className="text-foreground font-medium">Teachers</span>
            </nav>
            <h1 className="font-serif font-bold text-4xl md:text-5xl mb-4" style={{ color: "#1A1A1A" }}>Our Teachers</h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "#666666" }}>
              Every teacher at Virtual Zawiyah holds formal Islamic qualifications and is carefully vetted for character, knowledge, and teaching ability.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Intro + Filter */}
      <section className="py-12 bg-background border-b" style={{ borderColor: "rgba(27,107,58,0.1)" }}>
        <div className="container mx-auto px-4">
          <motion.p
            className="text-center max-w-2xl mx-auto mb-8 leading-relaxed"
            style={{ color: "#444" }}
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          >
            We maintain strict hiring standards: all teachers must hold traditional Islamic qualifications from recognized institutions, have a proven teaching background, and demonstrate excellent character. Our gender segregation policy is strictly upheld — male teachers teach male students only, female teachers teach female students only.
          </motion.p>

          {/* Filter */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {(["All", "Male", "Female"] as FilterType[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all ${filter === f ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground hover:border-primary hover:text-primary bg-background"}`}
                data-testid={`filter-${f.toLowerCase()}`}
              >
                {f === "All" ? "All Teachers" : `${f} Teachers`}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Teacher Grid */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((teacher, i) => (
              <motion.div
                key={teacher.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                whileHover={{ y: -5, boxShadow: "0 16px 40px rgba(27,107,58,0.12)" }}
                className="rounded-2xl p-8 border bg-background transition-all flex flex-col"
                style={{ borderColor: "rgba(27,107,58,0.15)" }}
                data-testid={`teacher-card-${i}`}
              >
                {/* Avatar */}
                <div className="flex flex-col items-center text-center mb-6">
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center mb-4 border-2 font-serif font-bold text-2xl text-primary"
                    style={{ background: "#E8F5EE", borderColor: "rgba(27,107,58,0.25)" }}
                  >
                    {teacher.avatar}
                  </div>
                  <Badge
                    variant="outline"
                    className="mb-3 text-xs font-semibold"
                    style={{ background: genderColors[teacher.gender].bg, color: genderColors[teacher.gender].text, borderColor: "transparent" }}
                  >
                    {teacher.gender} Teacher
                  </Badge>
                  <h3 className="font-serif font-bold text-xl mb-1" style={{ color: "#1A1A1A" }}>{teacher.name}</h3>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-6 text-sm flex-1">
                  <div className="flex items-start gap-2">
                    <Award className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span style={{ color: "#555" }}>{teacher.qualifications}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Globe className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span style={{ color: "#555" }}>{teacher.languages}</span>
                  </div>
                  <div className="pt-1">
                    <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#C9A84C" }}>Courses Taught</div>
                    <p className="text-xs" style={{ color: "#666" }}>{teacher.courses}</p>
                  </div>
                  <div className="pt-1">
                    <p className="text-xs leading-relaxed italic" style={{ color: "#555" }}>{teacher.bio}</p>
                  </div>
                </div>

                <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" data-testid={`btn-apply-teacher-${i}`}>
                  <Link href="/admission">Apply to Learn with This Teacher</Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20" style={{ background: "#E8F5EE" }}>
        <div className="container mx-auto px-4 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="font-serif font-bold text-3xl mb-4" style={{ color: "#1A1A1A" }}>Ready to Learn?</h2>
            <p className="text-lg mb-8 max-w-md mx-auto" style={{ color: "#666" }}>Apply now and we will match you with the best teacher for your goals.</p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-10 h-14 shadow-md" data-testid="btn-apply-teachers-cta">
              <Link href="/admission">Apply Now</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
