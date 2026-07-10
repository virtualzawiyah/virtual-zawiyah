const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  console.log('Querying table structures and data counts...');
  
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
    const { data, error, count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`Table ${table} error:`, error.message);
    } else {
      console.log(`Table ${table}: exact count = ${count}`);
    }
  }

  // Check some records in fee_payments
  const { data: payments } = await supabase.from('fee_payments').select('*').limit(5);
  console.log('Fee Payments sample:', payments);

  // Check some records in fee_deferrals
  const { data: deferrals } = await supabase.from('fee_deferrals').select('*').limit(5);
  console.log('Fee Deferrals sample:', deferrals);

  // Check some records in teacher_wallet
  const { data: wallets } = await supabase.from('teacher_wallet').select('*').limit(5);
  console.log('Teacher Wallets sample:', wallets);

  // Check some records in non_teaching_staff
  const { data: nonTeaching } = await supabase.from('non_teaching_staff').select('*').limit(5);
  console.log('Non Teaching Staff sample:', nonTeaching);
}

check();
