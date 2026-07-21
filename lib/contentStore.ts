import fs from 'fs'
import path from 'path'

// Path to metadata JSON file in the same project directory
const METADATA_PATH = path.join(process.cwd(), 'lib', 'course_metadata.json')

export interface CourseMetadata {
  description: string
  features: string[]
  icon: string
  highlights: string[]
  duration: string
  freeTrial: boolean
}

// Default metadata for the 8 standard courses
const DEFAULT_METADATA: Record<string, CourseMetadata> = {
  'quran reading with tajweed': {
    description: 'Learn to read the Holy Quran correctly with proper Tajweed rules. This foundational course is suitable for beginners and those looking to improve their recitation. Progress at your own pace with personalized guidance.',
    features: [
      '12 live sessions per month',
      'Dedicated personal teacher',
      '30-minute focused session',
      'Progress reports',
      'Flexible scheduling'
    ],
    icon: '📖',
    highlights: ["Makhaarij (articulation points)", "Rules of Noon Sakinah & Tanween", "Rules of Madd", "Practice with Quran passages"],
    duration: '30 / 60 / 90 min per session',
    freeTrial: true
  },
  'applied tajweed (basic)': {
    description: 'A focused course on mastering the foundational rules of Tajweed with practical application. Ideal for students who can read Arabic but want to perfect their recitation quality.',
    features: [
      '12 live sessions per month',
      'Dedicated personal teacher',
      '30-minute focused session',
      'Progress reports',
      'Flexible scheduling'
    ],
    icon: '🎯',
    highlights: ["All Tajweed rules systematically", "Audio feedback and correction", "Practical recitation exercises", "Recitation evaluation reports"],
    duration: '30 / 60 / 90 min per session',
    freeTrial: true
  },
  'quran memorization (hifz)': {
    description: 'Embark on the noble journey of becoming a Hafiz or Hafizah. This personalized course uses proven memorization techniques adapted to your schedule and learning style.',
    features: [
      '12 live sessions per month',
      'Dedicated personal teacher',
      '30-minute focused session',
      'Progress reports',
      'Flexible scheduling'
    ],
    icon: '🌙',
    highlights: ["Personalized memorization plan", "Daily revision (muraja'ah) sessions", "Tajweed-accurate memorization", "Progress tracking and reports"],
    duration: '30 / 60 / 90 min per session',
    freeTrial: true
  },
  '40 hadith memorization': {
    description: "Memorize Imam Nawawi's collection of 40 essential Hadiths — the prophetic traditions every Muslim should know. Each Hadith is explained in context.",
    features: [
      '12 live sessions per month',
      'Dedicated personal teacher',
      '30-minute focused session',
      'Progress reports',
      'Flexible scheduling'
    ],
    icon: '📜',
    highlights: ["Full Arabic text memorization", "Meaning and explanation of each Hadith", "Chain of narration introduction", "Regular revision"],
    duration: '30 / 60 / 90 min per session',
    freeTrial: true
  },
  'quran translation': {
    description: "Understand the meaning of the Quran in English. This course helps students connect with the Quran's message, themes, and wisdom beyond recitation.",
    features: [
      '12 live sessions per month',
      'Dedicated personal teacher',
      '30-minute focused session',
      'Progress reports',
      'Flexible scheduling'
    ],
    icon: '🌐',
    highlights: ["Word-for-word translation", "Thematic understanding", "Tafsir introduction", "Contemporary application"],
    duration: '30 / 60 / 90 min per session',
    freeTrial: true
  },
  'arabic grammar (sarf & nahw)': {
    description: 'Master classical Arabic grammar — the key that unlocks the Quran, Hadith, and Islamic texts. Covers both morphology (Sarf) and syntax (Nahw) in a structured sequence.',
    features: [
      '12 live sessions per month',
      'Dedicated personal teacher',
      '30-minute focused session',
      'Progress reports',
      'Flexible scheduling'
    ],
    icon: '✍️',
    highlights: ["Arabic word morphology (Sarf)", "Arabic sentence structure (Nahw)", "Classical text reading", "Application to Quranic Arabic"],
    duration: '30 / 60 / 90 min per session',
    freeTrial: true
  },
  'dars-e-nizami — classical islamic curriculum': {
    description: 'The complete 8-year classical Islamic scholarship curriculum taught in traditional seminaries worldwide. Students select their year of entry at admission. Subjects include Fiqh, Hadith, Tafsir, Aqeedah, Arabic Grammar, Mantiq (Logic), Balagha (Rhetoric), and more.',
    features: [
      '20 live sessions per month',
      'Group sessions',
      '120-minute session',
      'Structured curriculum',
      'Deeper coverage per session',
      'Q&A time included'
    ],
    icon: '🕌',
    highlights: ["8-year structured curriculum", "Fiqh, Hadith, Tafsir, Aqeedah", "Mantiq, Balagha, and more", "Select Year 1 to 8 at enrollment"],
    duration: '120 min · 5 days/week',
    freeTrial: false
  },
  'tajweed — 2-year structured group program': {
    description: 'A comprehensive two-year group course covering all Tajweed rules from beginner to advanced level. Students progress through a structured curriculum alongside peers and benefit from group recitation practice.',
    features: [
      '20 live sessions per month',
      'Group sessions',
      '120-minute session',
      'Structured curriculum',
      'Deeper coverage per session',
      'Q&A time included'
    ],
    icon: '✨',
    highlights: ["Complete Tajweed rules over 2 years", "Group recitation practice", "Regular assessments", "Certificate upon completion"],
    duration: '120 min · 5 days/week',
    freeTrial: false
  },
  'dedicated weekend plan': {
    description: 'Saturday & Sunday dedicated one-on-one sessions at a special rate.',
    features: [
      '8 dedicated weekend sessions/month',
      'Personal one-on-one teacher',
      '30-minute focused session',
      'Perfect for working adults & school students',
      'Consistent weekend routine',
      'Progress reports'
    ],
    icon: '📅',
    highlights: ["Saturday & Sunday classes", "Flexible scheduling", "Dedicated teacher"],
    duration: '30 min',
    freeTrial: true
  }
}

export function loadMetadata(): Record<string, CourseMetadata> {
  try {
    if (fs.existsSync(METADATA_PATH)) {
      const content = fs.readFileSync(METADATA_PATH, 'utf-8')
      return JSON.parse(content)
    }
  } catch (err) {
    console.error('Error loading course metadata:', err)
  }
  return DEFAULT_METADATA
}

export function saveMetadata(data: Record<string, CourseMetadata>) {
  try {
    fs.writeFileSync(METADATA_PATH, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.error('Error saving course metadata:', err)
  }
}

export function getCourseMetadata(title: string, programType: string): CourseMetadata {
  const metadata = loadMetadata()
  const key = title.toLowerCase().trim()
  if (metadata[key]) {
    return metadata[key]
  }
  
  const is60 = key.includes('60') || key.includes('hour') || key.includes('extended') || key.includes('immersion')
  const is5Days = key.includes('5 day') || key.includes('5-day') || key.includes('daily') || key.includes('intensive')
  const isWeekend = programType === 'weekend' || key.includes('weekend') || key.includes('sat')

  let defaultFeatures: string[] = []
  let defaultDuration = '30 min per session'

  if (programType === 'group' || key.includes('group')) {
    defaultDuration = '120 min · 5 days/week'
    defaultFeatures = [
      '20 live group sessions/month (5 days/week)',
      '120-minute structured interactive class',
      'Learn alongside peers with live Q&A',
      'Comprehensive curriculum for all subjects',
      'Certificate upon course completion'
    ]
  } else if (isWeekend) {
    defaultDuration = is60 ? '60 min per session (Sat & Sun)' : '30 min per session (Sat & Sun)'
    defaultFeatures = [
      '8 dedicated 1:1 sessions/month (Sat & Sun)',
      'Personal dedicated teacher (Male/Female)',
      is60 ? '60-minute in-depth sessions' : '30-minute focused sessions',
      'Learn any subject (Quran, Tajweed, Arabic, Hifz, Fiqh)',
      'Tailored weekend routine & progress reports'
    ]
  } else if (is5Days) {
    defaultDuration = is60 ? '60 min per session (5 days/week)' : '30 min per session (5 days/week)'
    defaultFeatures = [
      '20 live 1:1 sessions/month (5 days/week, Mon–Fri)',
      'Personal dedicated teacher (Male/Female)',
      is60 ? '60-minute daily comprehensive lessons' : '30-minute daily focused lessons',
      'Learn any subject tailored to student goals',
      'Accelerated progress & monthly report cards'
    ]
  } else {
    defaultDuration = is60 ? '60 min per session (3 days/week)' : '30 min per session (3 days/week)'
    defaultFeatures = [
      '12 live 1:1 sessions/month (3 days/week)',
      'Personal dedicated teacher (Male/Female)',
      is60 ? '60-minute extended 1:1 sessions' : '30-minute focused 1:1 sessions',
      'Learn any subject at your own pace',
      '3-Day Free Trial & flexible scheduling'
    ]
  }

  return {
    description: 'Learn any subject of your choice under qualified guidance tailored for your personal pace.',
    features: defaultFeatures,
    icon: isWeekend ? '📅' : programType === 'group' ? '🕌' : '📖',
    highlights: [],
    duration: defaultDuration,
    freeTrial: programType !== 'group'
  }
}

export function updateCourseMetadata(title: string, updates: Partial<CourseMetadata>, programType: string) {
  const metadata = loadMetadata()
  const key = title.toLowerCase().trim()
  const current = metadata[key] || getCourseMetadata(title, programType)
  metadata[key] = {
    ...current,
    ...updates
  }
  saveMetadata(metadata)
}
