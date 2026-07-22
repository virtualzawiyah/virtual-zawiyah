/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getMetadataFromSupabase, saveMetadataToSupabase, updateCourseMetadata } from '@/lib/contentStore'

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
    const { items } = body

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid items array' }, { status: 400 })
    }

    // 1. Fetch metadata once from Supabase
    const dbMetadata = await getMetadataFromSupabase(supabaseAdmin)

    // 2. Atomically update sortOrder for all courses in memory
    for (const item of items) {
      if (item.title && item.sortOrder !== undefined) {
        updateCourseMetadata(
          item.title,
          { sortOrder: Number(item.sortOrder) },
          item.program_type || '1:1',
          dbMetadata
        )
      }
    }

    // 3. Save single atomic metadata object back to Supabase
    await saveMetadataToSupabase(supabaseAdmin, dbMetadata)

    return NextResponse.json({ success: true, message: 'Course order updated atomically' })
  } catch (err: any) {
    console.error('Batch Course Reorder POST error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
