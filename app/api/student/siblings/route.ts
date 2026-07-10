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

    const userId = session.user.id

    // 2. Initialize admin client (bypasses RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 3. Query the logged-in user's own profile record
    const { data: ownProfile, error: ownProfileErr } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (ownProfileErr || !ownProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // 4. Determine family sibling student profiles list
    let studentProfiles: any[] = []

    if (ownProfile.role === 'parent') {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('parent_id', userId)
        .eq('role', 'student')
      if (error) throw error
      studentProfiles = data || []
    } else if (ownProfile.role === 'student') {
      if (ownProfile.parent_id) {
        const { data, error } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('parent_id', ownProfile.parent_id)
          .eq('role', 'student')
        if (error) throw error
        studentProfiles = data || []
      } else {
        studentProfiles = [ownProfile]
      }
    } else {
      // Handle other roles viewing the page
      studentProfiles = ownProfile.role === 'student' ? [ownProfile] : []
    }

    // 5. Query enrollment requests to match course interests
    const { data: enrollments } = await supabaseAdmin
      .from('enrollment_requests')
      .select('student_name, course_interest')

    // 6. Map profiles to cards expected format
    const mappedSiblings = studentProfiles.map(p => {
      const names = p.full_name.trim().split(/\s+/)
      const initials = names.map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()

      let courseName = 'Quran Reading (Nazra)' // fallback standard course
      if (enrollments) {
        const match = enrollments.find(e => 
          e.student_name && e.student_name.toLowerCase() === p.full_name.toLowerCase()
        )
        if (match) {
          courseName = match.course_interest
        }
      }

      return {
        id: p.id,
        fullName: p.full_name,
        courseName,
        avatarUrl: initials
      }
    })

    return NextResponse.json({ success: true, siblings: mappedSiblings })

  } catch (err: any) {
    console.error('Siblings query handler exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
