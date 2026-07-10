import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { fullName, gender, qualifications, teacherType } = body

    if (!fullName || !gender || !teacherType) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // 1. Initialize Supabase Admin Client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 2. Generate Email
    const cleanName = fullName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '.')
    const email = `${cleanName}@virtualzawiyah.staff`

    // 3. Generate Password (12 character random alphanumeric/special string)
    const generatePassword = () => {
      const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
      let pwd = ''
      for (let i = 0; i < 12; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return pwd
    }
    const password = generatePassword()

    // 4. Create auth user via admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'teacher' }
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    const user = authData.user
    if (!user) {
      return NextResponse.json({ error: 'Failed to retrieve created user object' }, { status: 500 })
    }

    // 5. Map fields to database constraints
    const mappedGender = gender.toLowerCase() === 'female' ? 'female' : 'male'
    
    let mappedTeacherType = '1:1'
    if (teacherType === 'Dars-e-Nizami') {
      mappedTeacherType = 'Dars-e-Nizami'
    } else if (teacherType === 'Tajweed 2-Year' || teacherType === 'Tajweed') {
      mappedTeacherType = 'Tajweed'
    }

    // 6. Insert profile row
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: user.id,
        email,
        full_name: fullName,
        role: 'teacher',
        gender: mappedGender,
        teacher_type: mappedTeacherType,
        status: 'Active'
      })

    if (profileError) {
      console.error('Error creating profile entry:', profileError)
      // Attempt cleanup of the created auth user to avoid orphan accounts
      await supabaseAdmin.auth.admin.deleteUser(user.id)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    // 7. Format success portal ID format using first 4 chars of user UUID
    const portalId = `TCH-${user.id.substring(0, 4).toUpperCase()}`

    return NextResponse.json({
      success: true,
      teacherId: portalId,
      email,
      password
    })

  } catch (err: any) {
    console.error('Create teacher handler exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
