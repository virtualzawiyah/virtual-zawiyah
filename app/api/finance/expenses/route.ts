import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createNotification } from '@/lib/notifications'

export async function GET(_request: Request) {
  try {
    const supabaseUserClient = createRouteHandlerClient({ cookies })
    const { data: { session }, error: sessionError } = await supabaseUserClient.auth.getSession()
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check user role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profileError || !profile || (profile.role !== 'finance_officer' && profile.role !== 'founder')) {
      return NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 })
    }

    // Query expenses
    const { data: expenses, error: expensesError } = await supabaseAdmin
      .from('expenses_log')
      .select('id, category, amount_pkr, description, created_at')
      .order('created_at', { ascending: false })

    if (expensesError) throw expensesError

    const formattedExpenses = (expenses || []).map((e: any) => ({
      id: e.id,
      category: e.category,
      amount: Number(e.amount_pkr),
      description: e.description,
      date: e.created_at.split('T')[0] // Format date string
    }))

    return NextResponse.json({
      success: true,
      expenses: formattedExpenses
    })

  } catch (err: any) {
    console.error('Expenses GET exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabaseUserClient = createRouteHandlerClient({ cookies })
    const { data: { session }, error: sessionError } = await supabaseUserClient.auth.getSession()
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized: Session missing' }, { status: 401 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check user role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profileError || !profile || (profile.role !== 'finance_officer' && profile.role !== 'founder')) {
      return NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 })
    }

    const { category, amount_pkr, description } = await request.json()
    if (!category || !amount_pkr) {
      return NextResponse.json({ error: 'Missing required fields: category and amount_pkr' }, { status: 400 })
    }

    const parsedAmount = parseFloat(amount_pkr)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than zero' }, { status: 400 })
    }

    // Insert expense record
    const { data: newExpense, error: insertError } = await supabaseAdmin
      .from('expenses_log')
      .insert({
        category,
        amount_pkr: parsedAmount,
        description: description || null,
        logged_by: session.user.id
      })
      .select('id, category, amount_pkr, description, created_at')
      .single()

    if (insertError) throw insertError

    // Trigger 23: Expense log created
    try {
      await createNotification({
        role: 'founder',
        title: 'New Expense Logged',
        message: `New expense logged: ${description || category} - ${parsedAmount} PKR`
      })
    } catch (notifErr: any) {
      console.error('Failed to send expense log notification (non-fatal):', notifErr.message)
    }

    return NextResponse.json({
      success: true,
      expense: {
        id: newExpense.id,
        category: newExpense.category,
        amount: Number(newExpense.amount_pkr),
        description: newExpense.description,
        date: newExpense.created_at.split('T')[0]
      }
    })

  } catch (err: any) {
    console.error('Expenses POST exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
