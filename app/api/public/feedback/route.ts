import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ success: true, testimonials: data })
  } catch (err: any) {
    console.error('Error fetching testimonials:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { author_name, author_role, content, rating } = await request.json()

    if (!author_name || !author_role || !content || !rating) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('testimonials')
      .insert([{
        author_name,
        author_role,
        content,
        rating,
        status: 'pending'
      }])
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, feedback: data })
  } catch (err: any) {
    console.error('Error submitting feedback:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
