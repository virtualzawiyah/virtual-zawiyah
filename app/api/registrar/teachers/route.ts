import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // 1. Authenticate user and verify role
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

    // 2. Parse query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const teacherType = searchParams.get('teacherType')

    // 3. Initialize admin client (bypasses RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 4. Construct and execute profiles query
    let query = supabaseAdmin
      .from('profiles')
      .select('id, full_name, gender, teacher_type, status, created_at')
      .eq('role', 'teacher')

    if (status) {
      query = query.eq('status', status)
    }
    if (teacherType) {
      query = query.eq('teacher_type', teacherType)
    }

    const { data, error: queryError } = await query.order('created_at', { ascending: false })

    if (queryError) {
      console.error('Error fetching teachers from server:', queryError)
      return NextResponse.json({ error: queryError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, teachers: data || [] })

  } catch (err: any) {
    console.error('Teachers query handler exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
