const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkTable() {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .limit(1);

  if (error) {
    console.log('Error querying contact_messages:', error.message, error.code);
  } else {
    console.log('contact_messages table exists! Data:', data);
  }
}
checkTable();
