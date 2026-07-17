import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

export async function GET(_request: Request) {
  try {
    const supabaseUserClient = createRouteHandlerClient({ cookies })
    const { data: { session }, error: sessionError } = await supabaseUserClient.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verify content manager / admin role
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile?.role !== 'content_manager' && profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Content Manager role required' }, { status: 403 })
    }

    // Fetch all testimonials
    const { data: testimonials, error: testimonialErr } = await supabaseAdmin
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false })

    if (testimonialErr) throw testimonialErr

    return NextResponse.json({ success: true, feedbacks: testimonials })
  } catch (err: any) {
    console.error('Error fetching testimonials for CM:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabaseUserClient = createRouteHandlerClient({ cookies })
    const { data: { session }, error: sessionError } = await supabaseUserClient.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verify content manager / admin role
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile?.role !== 'content_manager' && profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Content Manager role required' }, { status: 403 })
    }

    const { feedbackId, action } = await request.json()

    if (!feedbackId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    const statusValue = action === 'approve' ? 'approved' : 'rejected'

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('testimonials')
      .update({ status: statusValue, updated_at: new Date().toISOString() })
      .eq('id', feedbackId)
      .select()
      .single()

    if (updateErr) throw updateErr

    return NextResponse.json({ success: true, feedback: updated })
  } catch (err: any) {
    console.error('Error resolving feedback:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
