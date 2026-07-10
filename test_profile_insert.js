const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testInsert() {
  const randomId = '11111111-2222-3333-4444-555555555555';
  console.log('Testing insert into profiles table with ID:', randomId);
  const { data, error } = await supabase
    .from('profiles')
    .insert([{
      id: randomId,
      email: 'test_insert_random@example.com',
      full_name: 'Test Profile Insert',
      role: 'student',
      status: 'Active'
    }]);

  if (error) {
    console.error('Insert failed:', error.message, 'Code:', error.code);
  } else {
    console.log('Insert succeeded! Data:', data);
    // Cleanup if succeeded
    await supabase.from('profiles').delete().eq('id', randomId);
  }
}

testInsert();
