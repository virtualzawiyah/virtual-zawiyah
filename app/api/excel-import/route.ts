import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function POST(req: Request) {
  const cookieStore = cookies()
  const userClient = createRouteHandlerClient({ cookies: () => cookieStore })

  // 1. Authenticate user
  const { data: { session } } = await userClient.auth.getSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized: Session not found.' }, { status: 401 })
  }

  // 2. Fetch user role
  const { data: profile, error: profileErr } = await userClient
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profileErr || !profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 403 })
  }

  // 3. Initialize Service Role client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Server configuration error: Service role credentials missing.' }, { status: 500 })
  }
  const serviceClient = createClient(supabaseUrl, supabaseServiceKey)

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const uploadedBy = formData.get('uploaded_by') as string || session.user.id

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 })
    }

    // Upload file to the 'imports' private bucket
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`
    const { data: uploadData } = await serviceClient
      .storage
      .from('imports')
      .upload(fileName, file)

    const fileUrl = uploadData ? uploadData.path : `imports/${fileName}`

    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    if (workbook.SheetNames.length === 0) {
      throw new Error('The uploaded Excel file has no sheet pages.')
    }

    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json(sheet) as Array<{
      student_email?: string
      student_status?: string
      reason?: string
    }>

    let successCount = 0
    let failedCount = 0
    const errors: string[] = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const email = row.student_email?.trim()
      const status = row.student_status?.trim().toLowerCase()
      const reason = row.reason?.trim() || 'Imported via Excel status update'

      if (!email || !status) {
        errors.push(`Row ${i + 2}: Missing student_email or student_status.`)
        failedCount++
        continue
      }

      // Check for valid status values matching the enum
      const validStatuses = ['trial', 'active', 'suspended_temporary', 'suspended_forever', 'left']
      if (!validStatuses.includes(status)) {
        errors.push(`Row ${i + 2} (${email}): Invalid status "${status}". Allowed values: ${validStatuses.join(', ')}`)
        failedCount++
        continue
      }

      // Retrieve student profile
      const { data: targetProfile, error: profileFindErr } = await serviceClient
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()

      if (profileFindErr || !targetProfile) {
        errors.push(`Row ${i + 2}: Student profile for email "${email}" not found.`)
        failedCount++
        continue
      }

      // Update student profile status
      const { error: updateError } = await serviceClient
        .from('profiles')
        .update({
          student_status: status,
          status_change_reason: reason
        })
        .eq('id', targetProfile.id)

      if (updateError) {
        errors.push(`Row ${i + 2} (${email}): Database update failed: ${updateError.message}`)
        failedCount++
        continue
      }

      successCount++
    }

    // Log the import execution details
    const { error: logError } = await serviceClient
      .from('student_status_import_logs')
      .insert({
        file_name: file.name,
        file_url: fileUrl,
        uploaded_by: uploadedBy,
        month_year: new Date().toISOString().slice(0, 10),
        records_imported: successCount,
        status: failedCount > 0 && successCount === 0 ? 'failed' : 'completed',
        error_message: errors.length > 0 ? errors.join('\n') : null
      })

    if (logError) {
      console.error('Failed to create student status import log:', logError)
    }

    return NextResponse.json({
      status: 'success',
      imported: successCount,
      failed: failedCount,
      errors: errors
    })
  } catch (err) {
    const error = err as Error
    console.error('Excel import failed:', error)
    return NextResponse.json({ error: error.message || 'Internal server error while parsing file.' }, { status: 500 })
  }
}
