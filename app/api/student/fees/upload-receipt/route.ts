import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createNotification } from '@/lib/notifications'

export async function POST(request: Request) {
  try {
    // 1. Authenticate user from session cookie
    const supabaseUserClient = createRouteHandlerClient({ cookies })
    const { data: { session }, error: sessionError } = await supabaseUserClient.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 })
    }

    const userId = session.user.id

    // 2. Parse form data
    const formData = await request.formData()
    const feePaymentId = formData.get('fee_payment_id') as string
    const file = formData.get('file') as File

    if (!feePaymentId || !file) {
      return NextResponse.json({ error: 'Missing fee_payment_id or file parameters' }, { status: 400 })
    }

    // 3. Initialize admin client (bypasses RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 4. Retrieve target fee payment to resolve student ID
    const { data: feePayment, error: feeErr } = await supabaseAdmin
      .from('fee_payments')
      .select('student_id')
      .eq('id', feePaymentId)
      .single()

    if (feeErr || !feePayment) {
      return NextResponse.json({ error: 'Fee payment record not found' }, { status: 404 })
    }

    const studentId = feePayment.student_id

    // 5. Security check: verify logged-in user is authorized to edit this student's records
    if (userId !== studentId) {
      const { data: targetProfile, error: profErr } = await supabaseAdmin
        .from('profiles')
        .select('parent_id')
        .eq('id', studentId)
        .single()

      if (profErr || !targetProfile || targetProfile.parent_id !== userId) {
        return NextResponse.json({ error: 'Forbidden: Insufficient permissions to upload receipt' }, { status: 403 })
      }
    }

    // 6. Convert file to buffer for storage upload
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const fileType = file.type
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const storagePath = `${studentId}/${feePaymentId}/${sanitizedFilename}`

    // 7. Upload file to private storage bucket 'receipts'
    const { error: uploadErr } = await supabaseAdmin
      .storage
      .from('receipts')
      .upload(storagePath, fileBuffer, {
        contentType: fileType,
        upsert: true
      })

    if (uploadErr) {
      console.error('Storage upload error details:', uploadErr)
      throw uploadErr
    }

    // Get public URL path for database record
    const { data: { publicUrl } } = supabaseAdmin.storage.from('receipts').getPublicUrl(storagePath)

    // 8. Update database record status and URL
    // Note: status is kept as 'pending' matching enum limits while waiting for registrar verification
    const { data: updatedPayment, error: updateErr } = await supabaseAdmin
      .from('fee_payments')
      .update({
        receipt_url: publicUrl,
        status: 'pending'
      })
      .eq('id', feePaymentId)
      .select()
      .single()

    if (updateErr) throw updateErr

    // Create registrar notification (Trigger 8)
    try {
      const { data: studentProfile } = await supabaseAdmin
        .from('profiles')
        .select('full_name')
        .eq('id', studentId)
        .single()

      const studentName = studentProfile?.full_name || 'Student'


      await createNotification({
        role: 'registrar',
        title: 'New Fee Receipt Uploaded',
        message: `New fee receipt uploaded by ${studentName}`
      })
    } catch (notifErr: any) {
      console.error('Failed to send notification for fee receipt upload (non-fatal):', notifErr.message)
    }

    return NextResponse.json({
      success: true,
      updatedPayment
    })

  } catch (err: any) {
    console.error('Receipt upload handler exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
