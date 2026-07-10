/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

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

  if (profileError || !profile || (profile.role !== 'academic_director' && profile.role !== 'founder')) {
    return { authorized: false, userId: session.user.id }
  }

  return { authorized: true, userId: session.user.id }
}

export async function GET() {
  try {
    const supabaseUserClient = createRouteHandlerClient({ cookies })
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { authorized } = await checkAuth(supabaseUserClient, supabaseAdmin)
    if (!authorized) {
      return NextResponse.json({ error: 'Forbidden: Access denied' }, { status: 403 })
    }

    const reports = [
      { id: 'REP-01', title: 'June 2026 — Academy-Wide Summary', dateGenerated: '2026-06-30', category: 'Operational Audit', fileSize: '1.4 MB' },
      { id: 'REP-02', title: 'May 2026 — Faculty Performance & Disputes Report', dateGenerated: '2026-05-31', category: 'Supervision Ledger', fileSize: '2.1 MB' },
      { id: 'REP-03', title: 'Q2 2026 — Platform Audit & Operations Report', dateGenerated: '2026-06-15', category: 'Strategic Review', fileSize: '4.8 MB' }
    ]

    return NextResponse.json(reports)

  } catch (err: any) {
    console.error('Director reports route GET exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
