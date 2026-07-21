/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getCourseMetadata, updateCourseMetadata } from '@/lib/contentStore'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function checkAuth(supabaseUserClient: any, supabaseAdmin: any) {
  const { data: { session }, error: sessionError } = await supabaseUserClient.auth.getSession()
  if (sessionError || !session) {
    return false
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profileError || !profile || (profile.role !== 'content_manager' && profile.role !== 'founder')) {
    return false
  }

  return true
}

const DEFAULT_ACADEMIC_COURSES = [
  {
    id: 'ac-1',
    title: 'Quran Reading with Tajweed',
    program_type: '1:1',
    base_fee: 60,
    currency: 'USD',
    duration_months: 12,
    active: true,
    description: 'Learn to read the Holy Quran correctly with proper Tajweed rules. Suitable for beginners and intermediate learners.'
  },
  {
    id: 'ac-2',
    title: 'Applied Tajweed (Basic & Advanced)',
    program_type: '1:1',
    base_fee: 60,
    currency: 'USD',
    duration_months: 12,
    active: true,
    description: 'A focused course on mastering the foundational rules of Tajweed with practical application and recitation evaluation.'
  },
  {
    id: 'ac-3',
    title: 'Quran Memorization (Hifz)',
    program_type: '1:1',
    base_fee: 100,
    currency: 'USD',
    duration_months: 12,
    active: true,
    description: 'Embark on the noble journey of becoming a Hafiz or Hafizah with personalized memorization & daily revision techniques.'
  },
  {
    id: 'ac-4',
    title: '40 Hadith Memorization',
    program_type: '1:1',
    base_fee: 60,
    currency: 'USD',
    duration_months: 12,
    active: true,
    description: "Memorize Imam Nawawi's collection of 40 essential Hadiths — the prophetic traditions every Muslim should know."
  },
  {
    id: 'ac-5',
    title: 'Quran Translation & Tafseer',
    program_type: '1:1',
    base_fee: 60,
    currency: 'USD',
    duration_months: 12,
    active: true,
    description: "Understand the meaning of the Quran in English. Connect with the Quran's message, themes, and wisdom beyond recitation."
  },
  {
    id: 'ac-6',
    title: 'Arabic Grammar (Sarf & Nahw)',
    program_type: '1:1',
    base_fee: 60,
    currency: 'USD',
    duration_months: 12,
    active: true,
    description: 'Master classical Arabic grammar — the key that unlocks the Quran, Hadith, and classical Islamic scholarship.'
  },
  {
    id: 'ac-7',
    title: 'Dars-e-Nizami — Classical Islamic Curriculum',
    program_type: 'group',
    base_fee: 10,
    currency: 'USD',
    duration_months: 12,
    active: true,
    description: 'The complete 8-year classical Islamic scholarship curriculum. Subjects include Fiqh, Hadith, Tafsir, Aqeedah, and Mantiq.'
  },
  {
    id: 'ac-8',
    title: 'Tajweed — 2-Year Structured Group Program',
    program_type: 'group',
    base_fee: 10,
    currency: 'USD',
    duration_months: 12,
    active: true,
    description: 'A comprehensive two-year group course covering all Tajweed rules from beginner to advanced level alongside peers.'
  }
]

export async function GET(request: Request) {
  try {
    const supabaseUserClient = createRouteHandlerClient({ cookies })
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const authorized = await checkAuth(supabaseUserClient, supabaseAdmin)

    const { data: coursesData, error } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Filter rows that are academic subjects vs fee cards
    const academicRows = (coursesData || []).filter(c => {
      const t = c.title.toLowerCase()
      return t.includes('quran') || t.includes('tajweed') || t.includes('hadith') || t.includes('arabic') || t.includes('dars-e-nizami') || t.includes('memorization')
    })

    const finalCourses = academicRows.length > 0 ? academicRows : DEFAULT_ACADEMIC_COURSES

    // Enrich courses with metadata from contentStore
    const enrichedCourses = finalCourses.map(course => {
      const meta = getCourseMetadata(course.title, course.program_type)
      return {
        ...course,
        description: course.description || meta.description,
        icon: meta.icon,
        highlights: meta.highlights,
        duration: meta.duration,
        freeTrial: meta.freeTrial
      }
    })

    return NextResponse.json(enrichedCourses)
  } catch (err: any) {
    console.error('Courses GET error:', err)
    return NextResponse.json(DEFAULT_ACADEMIC_COURSES)
  }
}

export async function POST(request: Request) {
  try {
    const supabaseUserClient = createRouteHandlerClient({ cookies })
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const authorized = await checkAuth(supabaseUserClient, supabaseAdmin)
    if (!authorized) {
      return NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 })
    }

    const body = await request.json()
    const { title, program_type, base_fee, duration_months, description, highlights, icon } = body

    if (!title || !program_type || base_fee === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Insert course in database
    const { data: newCourse, error } = await supabaseAdmin
      .from('courses')
      .insert({
        title,
        program_type,
        base_fee: Number(base_fee),
        duration_months: duration_months ? Number(duration_months) : 12,
        currency: 'USD',
        active: true
      })
      .select()
      .single()

    if (error) throw error

    // Store metadata in contentStore
    if (description || (highlights && Array.isArray(highlights)) || icon) {
      updateCourseMetadata(title, {
        ...(description && { description }),
        ...(highlights && { highlights }),
        ...(icon && { icon })
      }, program_type)
    }

    const meta = getCourseMetadata(title, program_type)

    return NextResponse.json({
      ...newCourse,
      description: meta.description,
      icon: meta.icon,
      highlights: meta.highlights,
      duration: meta.duration,
      freeTrial: meta.freeTrial
    })
  } catch (err: any) {
    console.error('Courses POST error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabaseUserClient = createRouteHandlerClient({ cookies })
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const authorized = await checkAuth(supabaseUserClient, supabaseAdmin)
    if (!authorized) {
      return NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 })
    }

    const body = await request.json()
    const { id, title, program_type, base_fee, duration_months, description, highlights, icon, active } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing course ID' }, { status: 400 })
    }

    // Fetch existing course first to know its details for metadata mapping
    const { data: existingCourse, error: fetchErr } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchErr || !existingCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    let updates: any = {}
    if (title !== undefined) updates.title = title
    if (program_type !== undefined) updates.program_type = program_type
    if (base_fee !== undefined) updates.base_fee = Number(base_fee)
    if (duration_months !== undefined) updates.duration_months = Number(duration_months)
    if (active !== undefined) updates.active = active

    const { data: updatedCourse, error } = await supabaseAdmin
      .from('courses')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // If description/highlights/icon changed or title changed, update metadata
    const finalTitle = title !== undefined ? title : existingCourse.title
    const finalProgramType = program_type !== undefined ? program_type : existingCourse.program_type

    if (description !== undefined || (highlights && Array.isArray(highlights)) || icon !== undefined) {
      updateCourseMetadata(finalTitle, {
        ...(description !== undefined && { description }),
        ...(highlights && { highlights }),
        ...(icon !== undefined && { icon })
      }, finalProgramType)
    } else if (title !== undefined && title.toLowerCase() !== existingCourse.title.toLowerCase()) {
      // Transfer old metadata to the new title key in metadata
      const oldMeta = getCourseMetadata(existingCourse.title, existingCourse.program_type)
      updateCourseMetadata(finalTitle, { description: oldMeta.description, highlights: oldMeta.highlights, icon: oldMeta.icon }, finalProgramType)
    }

    const meta = getCourseMetadata(finalTitle, finalProgramType)

    return NextResponse.json({
      ...updatedCourse,
      description: meta.description,
      icon: meta.icon,
      highlights: meta.highlights,
      duration: meta.duration,
      freeTrial: meta.freeTrial
    })
  } catch (err: any) {
    console.error('Courses PATCH error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabaseUserClient = createRouteHandlerClient({ cookies })
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const authorized = await checkAuth(supabaseUserClient, supabaseAdmin)
    if (!authorized) {
      return NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 })
    }

    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing course ID' }, { status: 400 })
    }

    // Hard delete course row
    const { error } = await supabaseAdmin
      .from('courses')
      .delete()
      .eq('id', id)

    if (error) {
      // Fallback to soft delete if foreign keys prevent hard delete
      await supabaseAdmin
        .from('courses')
        .update({ active: false })
        .eq('id', id)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Courses DELETE error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
