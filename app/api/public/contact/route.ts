import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const { full_name, email, phone, subject, message } = payload

    // Validation
    if (!full_name || typeof full_name !== 'string' || full_name.trim() === '') {
      return NextResponse.json({ success: false, error: 'Full name is required' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || typeof email !== 'string' || !emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: 'A valid email address is required' }, { status: 400 })
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return NextResponse.json({ success: false, error: 'Message must be at least 10 characters long' }, { status: 400 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Insert into contact_messages
    const { error: insertError } = await supabaseAdmin
      .from('contact_messages')
      .insert({
        full_name,
        email,
        phone: phone || null,
        subject: subject || null,
        message,
        status: 'unread'
      })

    if (insertError) {
      console.error('Contact messages insert error:', insertError)
      return NextResponse.json({ success: false, error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Your message has been received. We will get back to you within 24 hours.'
    })

  } catch (err: any) {
    console.error('Contact POST exception:', err)
    return NextResponse.json({ success: false, error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
