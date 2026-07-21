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

    // Transform courses to match FeeCard structure
    const feeCards = (coursesData || []).map(course => {
      const meta = getCourseMetadata(course.title, course.program_type)
      const priceStr = `$${Number(course.base_fee)}`
      
      return {
        id: course.id,
        title: `${course.title} (${course.program_type})`,
        price: priceStr,
        base_fee: Number(course.base_fee),
        program_type: course.program_type,
        currency: course.currency,
        features: meta.features,
        title_original: course.title,
        active: course.active
      }
    })

    return NextResponse.json(feeCards)
  } catch (err: any) {
    console.error('Public Fee Cards GET error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
