/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Standard Academic Courses Offered by Virtual Zawiyah
const ACADEMIC_COURSES = [
  {
    id: 'course-1',
    title: 'Quran Reading with Tajweed',
    program_type: '1:1',
    active: true,
    icon: '📖',
    description: 'Learn to read the Holy Quran correctly with proper Tajweed rules. Suitable for beginners and intermediate learners.',
    duration: '30 / 60 min per session',
    base_fee: 60,
    freeTrial: true,
    highlights: ["Makhaarij (articulation points)", "Rules of Noon Sakinah & Tanween", "Rules of Madd", "Practice with Quran passages"]
  },
  {
    id: 'course-2',
    title: 'Applied Tajweed (Basic & Advanced)',
    program_type: '1:1',
    active: true,
    icon: '🎯',
    description: 'A focused course on mastering the foundational rules of Tajweed with practical application and recitation evaluation.',
    duration: '30 / 60 min per session',
    base_fee: 60,
    freeTrial: true,
    highlights: ["All Tajweed rules systematically", "Audio feedback and correction", "Practical recitation exercises", "Recitation evaluation reports"]
  },
  {
    id: 'course-3',
    title: 'Quran Memorization (Hifz)',
    program_type: '1:1',
    active: true,
    icon: '🌙',
    description: 'Embark on the noble journey of becoming a Hafiz or Hafizah with personalized memorization & daily revision techniques.',
    duration: '30 / 60 min per session',
    base_fee: 100,
    freeTrial: true,
    highlights: ["Personalized memorization plan", "Daily revision (muraja'ah) sessions", "Tajweed-accurate memorization", "Progress tracking and reports"]
  },
  {
    id: 'course-4',
    title: '40 Hadith Memorization',
    program_type: '1:1',
    active: true,
    icon: '📜',
    description: "Memorize Imam Nawawi's collection of 40 essential Hadiths — the prophetic traditions every Muslim should know.",
    duration: '30 / 60 min per session',
    base_fee: 60,
    freeTrial: true,
    highlights: ["Full Arabic text memorization", "Meaning and explanation of each Hadith", "Chain of narration introduction", "Regular revision"]
  },
  {
    id: 'course-5',
    title: 'Quran Translation & Tafseer',
    program_type: '1:1',
    active: true,
    icon: '🌐',
    description: "Understand the meaning of the Quran in English. Connect with the Quran's message, themes, and wisdom beyond recitation.",
    duration: '30 / 60 min per session',
    base_fee: 60,
    freeTrial: true,
    highlights: ["Word-for-word translation", "Thematic understanding", "Tafsir introduction", "Contemporary application"]
  },
  {
    id: 'course-6',
    title: 'Arabic Grammar (Sarf & Nahw)',
    program_type: '1:1',
    active: true,
    icon: '✍️',
    description: 'Master classical Arabic grammar — the key that unlocks the Quran, Hadith, and classical Islamic scholarship.',
    duration: '30 / 60 min per session',
    base_fee: 60,
    freeTrial: true,
    highlights: ["Arabic word morphology (Sarf)", "Arabic sentence structure (Nahw)", "Classical text reading", "Application to Quranic Arabic"]
  },
  {
    id: 'course-7',
    title: 'Dars-e-Nizami — Classical Islamic Curriculum',
    program_type: 'group',
    active: true,
    icon: '🕌',
    description: 'The complete 8-year classical Islamic scholarship curriculum. Subjects include Fiqh, Hadith, Tafsir, Aqeedah, and Mantiq.',
    duration: '120 min per session (5 days/week)',
    base_fee: 10,
    freeTrial: false,
    highlights: ["8-year structured curriculum", "Fiqh, Hadith, Tafsir, Aqeedah", "Mantiq, Balagha, and more", "Select Year 1 to 8 at enrollment"]
  },
  {
    id: 'course-8',
    title: 'Tajweed — 2-Year Structured Group Program',
    program_type: 'group',
    active: true,
    icon: '✨',
    description: 'A comprehensive two-year group course covering all Tajweed rules from beginner to advanced level alongside peers.',
    duration: '120 min per session (5 days/week)',
    base_fee: 10,
    freeTrial: false,
    highlights: ["Complete Tajweed rules over 2 years", "Group recitation practice", "Regular assessments", "Certificate upon completion"]
  }
]

import { getCourseMetadata } from '@/lib/contentStore'

export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: coursesData } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('active', true)

    // Filter database rows that represent actual academic courses (not pricing plan fee cards)
    const dbAcademicCourses = (coursesData || []).filter(c => {
      const titleLower = c.title.toLowerCase()
      return titleLower.includes('quran') || 
             titleLower.includes('tajweed') || 
             titleLower.includes('hadith') || 
             titleLower.includes('arabic') || 
             titleLower.includes('dars-e-nizami') ||
             titleLower.includes('memorization')
    })

    if (dbAcademicCourses.length > 0) {
      // Enrich database academic courses using contentStore
      const enriched = dbAcademicCourses.map(c => {
        const meta = getCourseMetadata(c.title, c.program_type)
        return {
          ...c,
          icon: meta.icon || '📖',
          description: c.description || meta.description,
          duration: meta.duration || '30 / 60 min per session',
          freeTrial: meta.freeTrial !== undefined ? meta.freeTrial : true,
          highlights: meta.highlights || []
        }
      })
      return NextResponse.json(enriched)
    }

    // Default to academic courses catalog if database only contains fee cards
    return NextResponse.json(ACADEMIC_COURSES)
  } catch (err: any) {
    console.error('Public Courses GET error:', err)
    return NextResponse.json(ACADEMIC_COURSES)
  }
}
