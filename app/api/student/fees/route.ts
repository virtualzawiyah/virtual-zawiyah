import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // 1. Authenticate user from session cookie
    const supabaseUserClient = createRouteHandlerClient({ cookies })
    const { data: { session }, error: sessionError } = await supabaseUserClient.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 })
    }

    // 2. Parse query parameters
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('student_id')

    if (!studentId) {
      return NextResponse.json({ error: 'Missing student_id query parameter' }, { status: 400 })
    }

    // 3. Initialize admin client (bypasses RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 4. Security check: verify logged-in user has permission to access this student's data
    const userId = session.user.id
    if (userId !== studentId) {
      // Check parent linkage
      const { data: targetProfile, error: profErr } = await supabaseAdmin
        .from('profiles')
        .select('parent_id')
        .eq('id', studentId)
        .single()

      if (profErr || !targetProfile || targetProfile.parent_id !== userId) {
        return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 })
      }
    }

    // 5. Fetch all fee payments for this student
    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from('fee_payments')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })

    if (paymentsError) throw paymentsError

    // 6. Find current month's fee payment
    const now = new Date()
    const currentMonthYear = `${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`
    
    const currentFee = (payments || []).find(p => p.month_year === currentMonthYear) || null
    const history = payments || []

    return NextResponse.json({
      success: true,
      currentFee,
      history
    })

  } catch (err: any) {
    console.error('Fees query handler exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
