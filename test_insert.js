const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase
    .from('enrollment_requests')
    .insert([{
      student_name: 'Test Timezone Column',
      parent_name: 'Test Parent',
      parent_email: 'test@example.com',
      timezone: 'UTC' // test if this column exists
    }])
    .select();

  if (error) {
    console.error('Insert error details:', error.message, error.code);
  } else {
    console.log('Insert success! Column timezone exists. Inserted data:', data);
    // Cleanup
    await supabase.from('enrollment_requests').delete().eq('id', data[0].id);
  }
}
check();
