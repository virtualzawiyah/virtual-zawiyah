/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function parseContentWithDisplayDate(rawContent: string) {
  let displayDate = ''
  let content = rawContent || ''
  if (content.startsWith('__DATE:')) {
    const endIdx = content.indexOf('__\n')
    if (endIdx !== -1) {
      displayDate = content.substring(7, endIdx)
      content = content.substring(endIdx + 3)
    }
  }
  return { displayDate, content }
}

export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabaseAdmin
      .from('announcements')
      .select('id, title, content, applies_to, start_date, end_date, created_at')
      .neq('title', '__course_metadata_json__')
      .order('created_at', { ascending: false })

    if (error) throw error

    const enriched = (data || []).map((ann: any) => {
      const { displayDate, content } = parseContentWithDisplayDate(ann.content)
      return {
        ...ann,
        content,
        display_date: displayDate
      }
    })

    return NextResponse.json(enriched)
  } catch (err: any) {
    console.error('Public Announcements GET error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
