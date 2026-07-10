const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  console.log('Testing insert with features...');
  const { data, error } = await supabase
    .from('courses')
    .insert([{
      title: 'Test Course with Features',
      program_type: '1:1',
      base_fee: 60.00,
      duration_months: 12,
      features: ['Feature 1', 'Feature 2']
    }])
    .select();
    
  if (error) {
    console.error('Insert failed:', error.message, 'Code:', error.code);
  } else {
    console.log('Insert succeeded! Data:', data);
    // clean up
    await supabase.from('courses').delete().eq('id', data[0].id);
  }
}

test();
