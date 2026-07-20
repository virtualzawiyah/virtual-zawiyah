/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getCourseMetadata, updateCourseMetadata } from '@/lib/contentStore'

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

    // GET is allowed publicly to render /fee page, but dashboard role is checked
    // We fetch only active courses for fee cards
    const { data: coursesData, error } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Transform courses to match FeeCard structure + original fields
    const feeCards = (coursesData || []).map(course => {
      const meta = getCourseMetadata(course.title, course.program_type)
      const priceStr = `$${Number(course.base_fee)}`
      
      return {
        id: course.id,
        title: `${course.title} (${course.program_type})`,
        price: priceStr,
        base_fee: Number(course.base_fee),
        program_type: course.program_type,
        currency: course.currency,
        features: meta.features,
        // Also keep course fields for full compliance
        title_original: course.title,
        active: course.active
      }
    })

    return NextResponse.json(feeCards)
  } catch (err: any) {
    console.error('Fee Cards GET error:', err)
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
    const { id, base_fee, features } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing course ID' }, { status: 400 })
    }

    // Fetch existing course details
    const { data: course, error: fetchErr } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchErr || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    let updates: any = {}
    if (base_fee !== undefined) {
      // Remove '$' if included in the price input
      const cleanFee = String(base_fee).replace('$', '')
      updates.base_fee = Number(cleanFee)
    }

    // Update in database
    const { data: updatedCourse, error } = await supabaseAdmin
      .from('courses')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Update features list in contentStore
    if (features !== undefined && Array.isArray(features)) {
      updateCourseMetadata(course.title, { features }, course.program_type)
    }

    const meta = getCourseMetadata(course.title, course.program_type)
    const priceStr = `$${Number(updatedCourse.base_fee)}`

    return NextResponse.json({
      id: updatedCourse.id,
      title: `${updatedCourse.title} (${updatedCourse.program_type})`,
      price: priceStr,
      base_fee: Number(updatedCourse.base_fee),
      program_type: updatedCourse.program_type,
      currency: updatedCourse.currency,
      features: meta.features,
      title_original: updatedCourse.title,
      active: updatedCourse.active
    })
  } catch (err: any) {
    console.error('Fee Cards PATCH error:', err)
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

    const { title, program_type, base_fee, features } = await request.json()

    if (!title || !base_fee) {
      return NextResponse.json({ error: 'Missing required title or fee price' }, { status: 400 })
    }

    const cleanFee = Number(String(base_fee).replace('$', ''))
    const programType = program_type || '1:1'

    const { data: newCourse, error } = await supabaseAdmin
      .from('courses')
      .insert([{
        title,
        program_type: programType,
        base_fee: cleanFee,
        currency: 'USD',
        active: true
      }])
      .select()
      .single()

    if (error) throw error

    if (features && Array.isArray(features)) {
      updateCourseMetadata(title, { features }, programType)
    }

    const meta = getCourseMetadata(newCourse.title, newCourse.program_type)

    return NextResponse.json({
      success: true,
      feeCard: {
        id: newCourse.id,
        title: `${newCourse.title} (${newCourse.program_type})`,
        price: `$${Number(newCourse.base_fee)}`,
        base_fee: Number(newCourse.base_fee),
        program_type: newCourse.program_type,
        currency: newCourse.currency,
        features: meta.features,
        title_original: newCourse.title,
        active: newCourse.active
      }
    })
  } catch (err: any) {
    console.error('Fee Cards POST error:', err)
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

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing fee card ID' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('courses')
      .update({ active: false })
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true, message: 'Fee card deleted successfully' })
  } catch (err: any) {
    console.error('Fee Cards DELETE error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
