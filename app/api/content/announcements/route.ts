/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createNotification } from '@/lib/notifications'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Helper to verify if session has content_manager or founder role
async function checkAuth(supabaseUserClient: any, supabaseAdmin: any) {
  const { data: { session }, error: sessionError } = await supabaseUserClient.auth.getSession()
  if (sessionError || !session) {
    return { authorized: false, userId: null }
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profileError || !profile || (profile.role !== 'content_manager' && profile.role !== 'founder')) {
    return { authorized: false, userId: session.user.id }
  }

  return { authorized: true, userId: session.user.id }
}

export async function GET(request: Request) {
  try {
    const supabaseUserClient = createRouteHandlerClient({ cookies })
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { authorized } = await checkAuth(supabaseUserClient, supabaseAdmin)

    let query = supabaseAdmin
      .from('announcements')
      .select('id, title, content, applies_to, start_date, end_date, created_at')
      .neq('title', '__course_metadata_json__')

    if (!authorized) {
      // Public view: return only active announcements
      const todayStr = new Date().toISOString().split('T')[0]
      query = query
        .lte('start_date', todayStr)
        .gte('end_date', todayStr)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (err: any) {
    console.error('Announcements GET error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabaseUserClient = createRouteHandlerClient({ cookies })
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { authorized, userId } = await checkAuth(supabaseUserClient, supabaseAdmin)
    if (!authorized || !userId) {
      return NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 })
    }

    const body = await request.json()
    const { title, content, applies_to, start_date, end_date } = body

    if (!title || !content || !applies_to || !start_date || !end_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Map applies_to to lowercase check constraint ('all', '1:1', 'group')
    let mappedAppliesTo = applies_to.toLowerCase()
    if (mappedAppliesTo.includes('1:1')) mappedAppliesTo = '1:1'
    if (mappedAppliesTo.includes('group')) mappedAppliesTo = 'group'
    if (mappedAppliesTo.includes('all')) mappedAppliesTo = 'all'

    const { data, error } = await supabaseAdmin
      .from('announcements')
      .insert({
        title,
        content,
        applies_to: mappedAppliesTo,
        start_date,
        end_date,
        published_by: userId
      })
      .select()
      .single()

    if (error) throw error

    // Trigger 22: Content announcement published
    try {

      await createNotification({
        role: 'student',
        title: 'New Announcement',
        message: title
      })
    } catch (notifErr: any) {
      console.error('Failed to send announcement notification (non-fatal):', notifErr.message)
    }

    return NextResponse.json(data)
  } catch (err: any) {
    console.error('Announcements POST error:', err)
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

    const { authorized } = await checkAuth(supabaseUserClient, supabaseAdmin)
    if (!authorized) {
      return NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 })
    }

    const body = await request.json()
    const { id, action, title, content, applies_to, start_date, end_date } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing announcement ID' }, { status: 400 })
    }

    let updates: any = {}

    if (action) {
      const now = new Date()
      if (action === 'deactivate') {
        const yesterday = new Date(now)
        yesterday.setDate(now.getDate() - 1)
        updates.end_date = yesterday.toISOString().split('T')[0]
      } else if (action === 'activate') {
        const thirtyDaysLater = new Date(now)
        thirtyDaysLater.setDate(now.getDate() + 30)
        // Also ensure start_date is not in the future when activating
        updates.start_date = now.toISOString().split('T')[0]
        updates.end_date = thirtyDaysLater.toISOString().split('T')[0]
      } else {
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
      }
    } else {
      // General edits
      if (title !== undefined) updates.title = title
      if (content !== undefined) updates.content = content
      if (applies_to !== undefined) {
        let mappedAppliesTo = applies_to.toLowerCase()
        if (mappedAppliesTo.includes('1:1')) mappedAppliesTo = '1:1'
        if (mappedAppliesTo.includes('group')) mappedAppliesTo = 'group'
        if (mappedAppliesTo.includes('all')) mappedAppliesTo = 'all'
        updates.applies_to = mappedAppliesTo
      }
      if (start_date !== undefined) updates.start_date = start_date
      if (end_date !== undefined) updates.end_date = end_date
    }

    const { data, error } = await supabaseAdmin
      .from('announcements')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (err: any) {
    console.error('Announcements PATCH error:', err)
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

    const { authorized } = await checkAuth(supabaseUserClient, supabaseAdmin)
    if (!authorized) {
      return NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 })
    }

    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing announcement ID' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('announcements')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Announcements DELETE error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
