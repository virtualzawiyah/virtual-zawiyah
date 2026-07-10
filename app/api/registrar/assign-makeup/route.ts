import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // 1. Authenticate user and verify staff privileges
    const supabaseUserClient = createRouteHandlerClient({ cookies })
    const { data: { session }, error: sessionError } = await supabaseUserClient.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 })
    }

    const role = session.user.user_metadata?.role as string
    const authorizedRoles = ['registrar', 'admin', 'supervisor', 'academic_director', 'founder']
    
    if (!authorizedRoles.includes(role)) {
      return NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 })
    }

    // 2. Parse body parameters
    const body = await request.json()
    const { makeupId, proposedDate, proposedTime } = body

    if (!makeupId || !proposedDate || !proposedTime) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 452 })
    }

    // 3. Initialize admin client (bypasses RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 4. Update makeup request row
    const { error: updateError } = await supabaseAdmin
      .from('makeup_requests')
      .update({
        proposed_date: proposedDate,
        proposed_time: proposedTime,
        status: 'scheduled'
      })
      .eq('id', makeupId)

    if (updateError) {
      console.error('Error updating makeup request row:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Makeup slot scheduled successfully' })

  } catch (err: any) {
    console.error('Makeup assignment handler exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
