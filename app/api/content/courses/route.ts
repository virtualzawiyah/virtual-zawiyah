/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getCourseMetadata, updateCourseMetadata } from '@/lib/contentStore'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function checkAuth(supabaseUserClient: any, supabaseAdmin: any) {
  const { data: { session }, error: sessionError } = await supabaseUserClient.auth.getSession()
  if (sessionError || !session) {
    return false
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profileError || !profile || (profile.role !== 'content_manager' && profile.role !== 'founder')) {
    return false
  }

  return true
}

export async function GET(request: Request) {
  try {
    const supabaseUserClient = createRouteHandlerClient({ cookies })
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const authorized = await checkAuth(supabaseUserClient, supabaseAdmin)

    const { data: coursesData, error } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Enrich courses with metadata from contentStore
    const enrichedCourses = (coursesData || []).map(course => {
      const meta = getCourseMetadata(course.title, course.program_type)
      return {
        ...course,
        description: meta.description,
        icon: meta.icon,
        highlights: meta.highlights,
        duration: meta.duration,
        freeTrial: meta.freeTrial
      }
    })

    return NextResponse.json(enrichedCourses)
  } catch (err: any) {
    console.error('Courses GET error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabaseUserClient = createRouteHandlerClient({ cookies })
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const authorized = await checkAuth(supabaseUserClient, supabaseAdmin)
    if (!authorized) {
      return NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 })
    }

    const body = await request.json()
    const { title, program_type, base_fee, duration_months, description } = body

    if (!title || !program_type || base_fee === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Insert course in database
    const { data: newCourse, error } = await supabaseAdmin
      .from('courses')
      .insert({
        title,
        program_type,
        base_fee: Number(base_fee),
        duration_months: duration_months ? Number(duration_months) : 12,
        currency: 'USD',
        active: true
      })
      .select()
      .single()

    if (error) throw error

    // Store description in contentStore
    if (description) {
      updateCourseMetadata(title, { description }, program_type)
    }

    const meta = getCourseMetadata(title, program_type)

    return NextResponse.json({
      ...newCourse,
      description: meta.description,
      icon: meta.icon,
      highlights: meta.highlights,
      duration: meta.duration,
      freeTrial: meta.freeTrial
    })
  } catch (err: any) {
    console.error('Courses POST error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabaseUserClient = createRouteHandlerClient({ cookies })
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const authorized = await checkAuth(supabaseUserClient, supabaseAdmin)
    if (!authorized) {
      return NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 })
    }

    const body = await request.json()
    const { id, title, program_type, base_fee, duration_months, description, active } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing course ID' }, { status: 400 })
    }

    // Fetch existing course first to know its details for metadata mapping
    const { data: existingCourse, error: fetchErr } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchErr || !existingCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    let updates: any = {}
    if (title !== undefined) updates.title = title
    if (program_type !== undefined) updates.program_type = program_type
    if (base_fee !== undefined) updates.base_fee = Number(base_fee)
    if (duration_months !== undefined) updates.duration_months = Number(duration_months)
    if (active !== undefined) updates.active = active

    const { data: updatedCourse, error } = await supabaseAdmin
      .from('courses')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // If description changed or title changed, update metadata
    const finalTitle = title !== undefined ? title : existingCourse.title
    const finalProgramType = program_type !== undefined ? program_type : existingCourse.program_type

    if (description !== undefined) {
      updateCourseMetadata(finalTitle, { description }, finalProgramType)
    } else if (title !== undefined && title.toLowerCase() !== existingCourse.title.toLowerCase()) {
      // Transfer old description to the new title key in metadata
      const oldMeta = getCourseMetadata(existingCourse.title, existingCourse.program_type)
      updateCourseMetadata(finalTitle, { description: oldMeta.description }, finalProgramType)
    }

    const meta = getCourseMetadata(finalTitle, finalProgramType)

    return NextResponse.json({
      ...updatedCourse,
      description: meta.description,
      icon: meta.icon,
      highlights: meta.highlights,
      duration: meta.duration,
      freeTrial: meta.freeTrial
    })
  } catch (err: any) {
    console.error('Courses PATCH error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabaseUserClient = createRouteHandlerClient({ cookies })
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const authorized = await checkAuth(supabaseUserClient, supabaseAdmin)
    if (!authorized) {
      return NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 })
    }

    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing course ID' }, { status: 400 })
    }

    // Hard delete course row
    const { error } = await supabaseAdmin
      .from('courses')
      .delete()
      .eq('id', id)

    if (error) {
      // Fallback to soft delete if foreign keys prevent hard delete
      await supabaseAdmin
        .from('courses')
        .update({ active: false })
        .eq('id', id)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Courses DELETE error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
