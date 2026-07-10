import { createNotification } from '@/lib/notifications'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const { user_id, role, title, message, link } = payload

    if (!title || !message) {
      return NextResponse.json({ error: 'title and message are required' }, { status: 400 })
    }

    if (!user_id && !role) {
      return NextResponse.json({ error: 'Either user_id or role must be provided' }, { status: 400 })
    }

    await createNotification({
      user_id,
      role,
      title,
      message,
      link
    })

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('Notifications create POST exception:', err)
    return NextResponse.json({ success: false, error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
