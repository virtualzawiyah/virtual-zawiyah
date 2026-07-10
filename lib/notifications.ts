import { createClient } from '@supabase/supabase-js'

export interface CreateNotificationPayload {
  user_id?: string
  role?: string
  title: string
  message: string
  link?: string
}

export async function createNotification(payload: CreateNotificationPayload) {
  const { user_id, role, title, message, link } = payload

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. If role is 'all', notify all active profiles
  if (role === 'all') {
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .eq('status', 'Active')
    
    if (profileError) {
      console.error('Error fetching active profiles for "all" notification:', profileError.message)
      throw profileError
    }

    if (profiles && profiles.length > 0) {
      const rows = profiles.map(p => ({
        user_id: p.id,
        role: p.role,
        title,
        message,
        link: link || null,
        is_read: false
      }))

      const { error } = await supabaseAdmin
        .from('notifications')
        .insert(rows)
      
      if (error) {
        console.error('Error inserting batch notifications for "all":', error.message)
        throw error
      }
    }
    return { success: true }
  }

  // 2. If user_id is provided but role is not, fetch role from profile
  if (user_id && !role) {
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user_id)
      .maybeSingle()
    
    if (profileError) {
      console.error(`Error fetching role for user_id ${user_id}:`, profileError.message)
      throw profileError
    }
    
    if (profile) {
      const { error } = await supabaseAdmin
        .from('notifications')
        .insert({
          user_id,
          role: profile.role,
          title,
          message,
          link: link || null,
          is_read: false
        })
      if (error) {
        console.error(`Error inserting notification for user_id ${user_id}:`, error.message)
        throw error
      }
      return { success: true }
    }
  }

  // 3. If role is provided but user_id is not, query all profiles with that role and create one notification for each
  if (role && !user_id) {
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('role', role)
      .eq('status', 'Active')
    
    if (profileError) {
      console.error(`Error fetching profiles for role ${role}:`, profileError.message)
      throw profileError
    }

    if (profiles && profiles.length > 0) {
      const rows = profiles.map(p => ({
        user_id: p.id,
        role,
        title,
        message,
        link: link || null,
        is_read: false
      }))

      const { error } = await supabaseAdmin
        .from('notifications')
        .insert(rows)
      
      if (error) {
        console.error(`Error batch inserting notifications for role ${role}:`, error.message)
        throw error
      }
    }
    return { success: true }
  }

  // 4. If both user_id and role are provided
  if (user_id && role) {
    const { error } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id,
        role,
        title,
        message,
        link: link || null,
        is_read: false
      })
    
    if (error) {
      console.error(`Error inserting notification for user_id ${user_id} role ${role}:`, error.message)
      throw error
    }
    return { success: true }
  }

  throw new Error('Either user_id or role must be provided to create a notification')
}
export default createNotification;
