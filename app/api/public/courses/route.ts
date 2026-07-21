/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getCourseMetadata } from '@/lib/contentStore'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: coursesData, error } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Enrich courses with metadata from contentStore
    const enrichedCourses = (coursesData || []).map(course => {
      const meta = getCourseMetadata(course.title, course.program_type)
      return {
        ...course,
        description: meta.description,
        icon: meta.icon,
        highlights: meta.highlights,
        duration: meta.duration,
        freeTrial: meta.freeTrial
      }
    })

    return NextResponse.json(enrichedCourses)
  } catch (err: any) {
    console.error('Public Courses GET error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
