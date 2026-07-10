const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  console.log('Checking database status...');
  
  // 1. Check profiles
  const { data: profiles, error: pError } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, status')
    .limit(10);
    
  if (pError) {
    console.error('Error fetching profiles:', pError.message);
  } else {
    console.log('Existing profiles:', profiles);
  }

  // 2. Check auth users count or list
  const { data: usersData, error: uError } = await supabase.auth.admin.listUsers();
  if (uError) {
    console.error('Error listing auth users:', uError.message);
  } else {
    console.log('Auth users list:', usersData.users.map(u => ({ id: u.id, email: u.email, metadata: u.user_metadata })));
  }
}

check();
