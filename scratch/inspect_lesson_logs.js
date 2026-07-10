const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectSchema() {
  const { data, error } = await supabase
    .from('lesson_logs')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error:', error);
  } else {
    // If table is empty, data is []
    console.log('Empty select data:', data);
  }
}

// Let's run a check by attempting to select individual fields one by one to see which ones fail
async function testSingleField(fieldName) {
  const { error } = await supabase
    .from('lesson_logs')
    .select(fieldName)
    .limit(1);
  if (error) {
    console.log(`Column '${fieldName}': DOES NOT EXIST (${error.message})`);
  } else {
    console.log(`Column '${fieldName}': EXISTS`);
  }
}

async function run() {
  const fields = [
    'id', 'student_id', 'teacher_id', 'class_date', 
    'log_type', 'sabaq', 'sabaqi', 'manzil', 
    'topic_covered', 'next_plan', 'notes', 'performance', 
    'created_at'
  ];
  for (const f of fields) {
    await testSingleField(f);
  }
}

run();
