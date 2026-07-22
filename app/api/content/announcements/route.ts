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

function parseContentWithDates(rawContent: string) {
  let displayDate = ''
  let customStartDate = ''
  let customEndDate = ''
  let content = rawContent || ''

  if (content.startsWith('__META_DATES:')) {
    const endIdx = content.indexOf('__\n')
    if (endIdx !== -1) {
      const metaStr = content.substring(13, endIdx)
      const parts = metaStr.split('|')
      displayDate = parts[0] || ''
      customStartDate = parts[1] || ''
      customEndDate = parts[2] || ''
      content = content.substring(endIdx + 3)
    }
  } else if (content.startsWith('__DATE:')) {
    const endIdx = content.indexOf('__\n')
    if (endIdx !== -1) {
      displayDate = content.substring(7, endIdx)
      content = content.substring(endIdx + 3)
    }
  }

  return { displayDate, customStartDate, customEndDate, content }
}

function buildContentWithDates(text: string, displayDate?: string, startDate?: string, endDate?: string) {
  const cleanDisplay = (displayDate || '').trim()
  const cleanStart = (startDate || '').trim()
  const cleanEnd = (endDate || '').trim()

  if (cleanDisplay || cleanStart || cleanEnd) {
    return `__META_DATES:${cleanDisplay}|${cleanStart}|${cleanEnd}__\n${text}`
  }
  return text
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

    const enriched = (data || []).map((ann: any) => {
      const { displayDate, customStartDate, customEndDate, content } = parseContentWithDates(ann.content)
      return {
        ...ann,
        content,
        display_date: displayDate,
        custom_start_date: customStartDate,
        custom_end_date: customEndDate
      }
    })

    return NextResponse.json(enriched)
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
    const { title, content, applies_to, display_date, start_date, end_date } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    const todayStr = new Date().toISOString().split('T')[0]
    const finalStartDate = start_date || todayStr
    const finalEndDate = end_date || '2099-12-31'

    const finalContent = buildContentWithDates(content, display_date, start_date, end_date)

    // Map applies_to to lowercase check constraint ('all', '1:1', 'group')
    let mappedAppliesTo = (applies_to || 'all').toLowerCase()
    if (mappedAppliesTo.includes('1:1')) mappedAppliesTo = '1:1'
    if (mappedAppliesTo.includes('group')) mappedAppliesTo = 'group'
    if (mappedAppliesTo.includes('all')) mappedAppliesTo = 'all'

    const { data, error } = await supabaseAdmin
      .from('announcements')
      .insert({
        title,
        content: finalContent,
        applies_to: mappedAppliesTo,
        start_date: finalStartDate,
        end_date: finalEndDate,
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
    const { id, action, title, content, applies_to, display_date, start_date, end_date } = body

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
        updates.start_date = now.toISOString().split('T')[0]
        updates.end_date = thirtyDaysLater.toISOString().split('T')[0]
      } else {
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
      }
    } else {
      // General edits
      if (title !== undefined) updates.title = title
      if (content !== undefined || display_date !== undefined || start_date !== undefined || end_date !== undefined) {
        const { data: existing } = await supabaseAdmin.from('announcements').select('content').eq('id', id).single()
        const parsed = parseContentWithDates(existing?.content || '')

        const textPart = content !== undefined ? content : parsed.content
        const datePart = display_date !== undefined ? display_date : parsed.displayDate
        const startPart = start_date !== undefined ? start_date : parsed.customStartDate
        const endPart = end_date !== undefined ? end_date : parsed.customEndDate

        updates.content = buildContentWithDates(textPart, datePart, startPart, endPart)
      }
      if (applies_to !== undefined) {
        let mappedAppliesTo = applies_to.toLowerCase()
        if (mappedAppliesTo.includes('1:1')) mappedAppliesTo = '1:1'
        if (mappedAppliesTo.includes('group')) mappedAppliesTo = 'group'
        if (mappedAppliesTo.includes('all')) mappedAppliesTo = 'all'
        updates.applies_to = mappedAppliesTo
      }
      if (start_date !== undefined) updates.start_date = start_date ? start_date : new Date().toISOString().split('T')[0]
      if (end_date !== undefined) updates.end_date = end_date ? end_date : '2099-12-31'
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
