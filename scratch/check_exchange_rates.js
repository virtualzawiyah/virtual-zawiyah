const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data, error, count } = await supabase
    .from('exchange_rate_log')
    .select('*', { count: 'exact' });
    
  if (error) {
    console.error('Error fetching exchange_rate_log:', error.message);
  } else {
    console.log(`exchange_rate_log count: ${count}`, data);
  }
}

check();
