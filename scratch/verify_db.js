require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function verify() {
  console.log('--- Database Verification Queries ---');

  // 1. Check enrollment_requests
  const { data: enrollment, error: enrollmentError } = await supabase
    .from('enrollment_requests')
    .select('*')
    .eq('parent_email', 'test.enrollment@gmail.com')
    .order('created_at', { ascending: false })
    .limit(1);

  if (enrollmentError) {
    console.error('❌ Error selecting enrollment request:', enrollmentError.message);
  } else if (enrollment && enrollment.length > 0) {
    console.log('✅ Enrollment Request found in database:', enrollment[0]);
  } else {
    console.error('❌ Enrollment Request NOT found in database.');
  }

  // 2. Check notifications
  const { data: notifications, error: notifError } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (notifError) {
    console.error('❌ Error selecting notifications:', notifError.message);
  } else if (notifications && notifications.length > 0) {
    const relevantNotif = notifications.find(n => n.title === 'New Enrollment Request' && n.message.includes('Fatima Zahra'));
    if (relevantNotif) {
      console.log('✅ Notification successfully created:', relevantNotif);
    } else {
      console.error('❌ Relevant notification NOT found. Latest notifications:', notifications);
    }
  } else {
    console.error('❌ Notifications table is empty.');
  }

  // 3. Check contact_messages
  const { data: contact, error: contactError } = await supabase
    .from('contact_messages')
    .select('*')
    .eq('email', 'test.enrollment@gmail.com')
    .order('created_at', { ascending: false })
    .limit(1);

  if (contactError) {
    console.error('❌ Error selecting contact message:', contactError.message);
  } else if (contact && contact.length > 0) {
    console.log('✅ Contact Message found in database:', contact[0]);
  } else {
    console.error('❌ Contact Message NOT found in database.');
  }
}

verify();
