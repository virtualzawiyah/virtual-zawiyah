const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const tables = [
    'profiles',
    'fee_payments',
    'fee_deferrals',
    'expenses_log',
    'payroll_disbursements',
    'teacher_wallet',
    'non_teaching_staff'
  ];
  
  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);
      
    if (error) {
      console.log(`Table ${table} error:`, error.message);
    } else {
      const columns = data.length > 0 ? Object.keys(data[0]) : 'no rows';
      console.log(`Table ${table} columns:`, columns);
    }
  }
}

check();
