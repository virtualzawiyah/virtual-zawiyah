/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabaseAdmin
      .from('group_classes')
      .select(`
        id,
        class_name,
        year_level,
        max_capacity,
        enrolled_count,
        teacher_id,
        profiles:teacher_id ( full_name ),
        courses:course_id ( title )
      `)

    if (error) throw error

    return NextResponse.json({ classes: data || [] })
  } catch (err: any) {
    console.error('Group classes GET error:', err)
    return NextResponse.json({ error: err.message || 'Failed to load group classes' }, { status: 500 })
  }
}
