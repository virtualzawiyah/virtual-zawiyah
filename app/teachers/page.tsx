'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Award, Globe } from 'lucide-react'
import PublicNavbar from '@/components/PublicNavbar'
import PublicFooter from '@/components/PublicFooter'
import GeometricPattern from '@/components/GeometricPattern'
import { supabase } from '@/lib/supabaseClient'

type FilterType = "All" | "Male" | "Female"

interface Teacher {
  name: string
  gender: "Male" | "Female"
  qualifications: string
  courses: string
  languages: string
  bio: string
  avatar: string
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
]

const genderColors: Record<"Male" | "Female", { bg: string; text: string }> = {
  Male: { bg: "rgba(27,107,58,0.1)", text: "#1B6B3A" },
  Female: { bg: "rgba(236,72,153,0.1)", text: "#be185d" },
}

export default function TeachersPage() {
  const [filter, setFilter] = useState<FilterType>("All")
  const [teacherList, setTeacherList] = useState<Teacher[]>(teachers)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTeachers() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, gender, avatar_url, education, experience, teacher_type')
          .eq('role', 'teacher')
          .eq('status', 'Active')

        if (error) throw error

        if (data && data.length > 0) {
          const mapped = data.map((t: any) => {
            const nameClean = t.full_name
            const genderClean = t.gender === 'female' ? 'Female' : 'Male' as "Male" | "Female"
            
            // Try to find matching hardcoded teacher for default languages/courses
            const match = teachers.find(ht => 
              ht.name.toLowerCase().includes(nameClean.toLowerCase()) || 
              nameClean.toLowerCase().includes(ht.name.toLowerCase())
            )
            
            return {
              name: nameClean,
              gender: genderClean,
              qualifications: t.education || match?.qualifications || 'Qualified Scholar, Tajweed Instructor',
              courses: t.teacher_type === 'Group' 
                ? 'Tajweed Group Class, Dars-e-Nizami' 
                : (match?.courses || '1:1 Quran Recitation & Islamic Studies'),
              languages: match?.languages || 'English, Urdu, Arabic',
              bio: t.experience || match?.bio || 'Dedicated faculty scholar teaching at Virtual Zawiyah.',
              avatar: t.avatar_url || match?.avatar || nameClean.split(' ').map((p: any) => p[0]).join('').substring(0,2).toUpperCase()
            }
          })
          setTeacherList(mapped)
        }
      } catch (err) {
        console.error('Error fetching dynamic teachers:', err)
      } finally {
        setLoading(false)
      }
    }
    loadTeachers()
  }, [])

  const filtered = filter === "All" ? teacherList : teacherList.filter(t => t.gender === filter)

  return (
    <div className="public-page min-h-screen flex flex-col font-sans">
      <PublicNavbar />

      {/* Hero */}
      <section 
        className="relative overflow-hidden py-16" 
        style={{ background: "linear-gradient(135deg, #E8F5EE 0%, #FAFAF7 100%)" }}
      >
        <GeometricPattern opacity={0.07} />
        <div className="container mx-auto px-4 relative z-10 text-center animate-fade-in-up">
          <nav className="text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground font-semibold">Teachers</span>
          </nav>
          <h1 className="font-serif font-bold text-4xl md:text-5xl mb-4" style={{ color: "#1A1A1A" }}>Our Teachers</h1>
          <p className="text-lg max-w-2xl mx-auto text-gray-650">
            Every teacher at Virtual Zawiyah holds formal Islamic qualifications and is carefully vetted for character, knowledge, and teaching ability.
          </p>
        </div>
      </section>

      {/* Intro + Filter */}
      <section className="py-12 bg-white border-b border-gray-200/60 relative z-10">
        <div className="container mx-auto px-4">
          <p
            className="text-center max-w-2xl mx-auto mb-8 leading-relaxed text-sm text-gray-600 animate-fade-in-up"
          >
            We maintain strict hiring standards: all teachers must hold traditional Islamic qualifications from recognized institutions, have a proven teaching background, and demonstrate excellent character. Our gender segregation policy is strictly upheld — male teachers teach male students only, female teachers teach female students only.
          </p>

          {/* Filter */}
          <div className="flex items-center justify-center gap-3 flex-wrap animate-fade-in-up">
            {(["All", "Male", "Female"] as FilterType[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-full text-xs font-bold border transition-all ${
                  filter === f 
                    ? "bg-primary text-white border-primary" 
                    : "border-gray-250 text-gray-700 hover:border-primary hover:text-primary bg-white"
                }`}
                data-testid={`filter-${f.toLowerCase()}`}
              >
                {f === "All" ? "All Teachers" : `${f} Teachers`}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Teacher Grid */}
      <section className="py-24 bg-white relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((teacher, i) => (
              <div
                key={teacher.name}
                className="rounded-2xl p-8 border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/[0.04] flex flex-col justify-between"
                style={{ borderColor: "rgba(27,107,58,0.15)" }}
                data-testid={`teacher-card-${i}`}
              >
                {/* Avatar */}
                <div className="flex flex-col items-center text-center mb-6">
                  {teacher.avatar && (teacher.avatar.startsWith('http') || teacher.avatar.startsWith('/')) ? (
                    <img 
                      src={teacher.avatar} 
                      alt={teacher.name} 
                      className="w-24 h-24 rounded-full object-cover mb-4 border-2 shadow-sm"
                      style={{ borderColor: "rgba(27,107,58,0.25)" }}
                    />
                  ) : (
                    <div
                      className="w-24 h-24 rounded-full flex items-center justify-center mb-4 border-2 font-serif font-bold text-2xl text-primary animate-pulse-slow"
                      style={{ background: "#E8F5EE", borderColor: "rgba(27,107,58,0.25)" }}
                    >
                      {teacher.avatar}
                    </div>
                  )}
                  <span
                    className="mb-3 text-[10px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full"
                    style={{ 
                      background: genderColors[teacher.gender].bg, 
                      color: genderColors[teacher.gender].text 
                    }}
                  >
                    {teacher.gender} Teacher
                  </span>
                  <h3 className="font-serif font-bold text-xl mb-1 text-gray-900">{teacher.name}</h3>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-6 text-sm flex-1">
                  <div className="flex items-start gap-2">
                    <Award className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-gray-650 text-xs">{teacher.qualifications}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Globe className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-gray-650 text-xs">{teacher.languages}</span>
                  </div>
                  <div className="pt-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-1 text-secondary">Courses Taught</div>
                    <p className="text-xs text-gray-500 font-semibold">{teacher.courses}</p>
                  </div>
                  <div className="pt-1 border-t border-gray-100 mt-2">
                    <p className="text-xs leading-relaxed italic text-gray-600">&quot;{teacher.bio}&quot;</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative z-10" style={{ background: "#E8F5EE" }}>
        <div className="container mx-auto px-4 text-center animate-fade-in-up">
          <h2 className="font-serif font-bold text-3xl mb-4" style={{ color: "#1A1A1A" }}>Ready to Learn?</h2>
          <p className="text-lg mb-8 max-w-md mx-auto text-gray-650">Apply now and we will match you with the best teacher for your goals.</p>
          <Link 
            href="/enrollment" 
            className="inline-flex items-center justify-center bg-primary hover:bg-primary/95 text-white py-3.5 px-10 font-semibold shadow-md transition-colors"
            data-testid="btn-apply-teachers-cta"
          >
            Apply Now
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
