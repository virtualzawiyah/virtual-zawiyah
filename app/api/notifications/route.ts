import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabaseUserClient = createRouteHandlerClient({ cookies })
    const { data: { session }, error: sessionError } = await supabaseUserClient.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 })
    }

    const userId = session.user.id
    const userRole = session.user.user_metadata?.role

    if (!userRole) {
      return NextResponse.json({ error: 'Unauthorized: User role not found' }, { status: 400 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch notifications matching user_id OR role
    const { data: notifications, error: fetchError } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${userId},role.eq.${userRole}`)
      .order('created_at', { ascending: false })
      .limit(50)

    if (fetchError) {
      console.error('Error fetching notifications:', fetchError.message)
      throw fetchError
    }

    // Calculate unread count (is_read = false)
    const unreadCount = (notifications || []).filter(n => !n.is_read).length

    return NextResponse.json({
      success: true,
      notifications: notifications || [],
      unreadCount
    })

  } catch (err: any) {
    console.error('Notifications GET exception:', err)
    return NextResponse.json({ success: false, error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabaseUserClient = createRouteHandlerClient({ cookies })
    const { data: { session }, error: sessionError } = await supabaseUserClient.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 })
    }

    const userId = session.user.id
    const payload = await request.json()
    const { notification_id, action } = payload

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    if (action === 'mark_read') {
      if (!notification_id) {
        return NextResponse.json({ error: 'notification_id is required' }, { status: 400 })
      }

      const { error: updateError } = await supabaseAdmin
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notification_id)

      if (updateError) {
        console.error(`Error marking notification ${notification_id} as read:`, updateError.message)
        throw updateError
      }
    } else if (action === 'mark_all_read') {
      const { error: updateError } = await supabaseAdmin
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)

      if (updateError) {
        console.error(`Error marking all notifications as read for user ${userId}:`, updateError.message)
        throw updateError
      }
    } else {
      return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 })
    }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('Notifications PATCH exception:', err)
    return NextResponse.json({ success: false, error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
