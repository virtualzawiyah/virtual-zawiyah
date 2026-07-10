import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createNotification } from '@/lib/notifications'

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    const { profile_id, role, full_name, timezone } = await req.json()

    if (!profile_id || !role) {
      return NextResponse.json({ error: 'Missing profile_id or role' }, { status: 400 })
    }

    // Prepare update payload
    const updatePayload: any = {}
    if (full_name !== undefined) updatePayload.full_name = full_name
    if (timezone !== undefined) updatePayload.timezone = timezone

    if (Object.keys(updatePayload).length > 0) {
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update(updatePayload)
        .eq('id', profile_id)

      if (updateError) throw updateError
    }

    // Trigger 18: HR profile updated
    await createNotification({
      user_id: profile_id,
      role,
      title: 'Profile Updated',
      message: 'Your profile information has been updated by HR'
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('HR update-profile exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
