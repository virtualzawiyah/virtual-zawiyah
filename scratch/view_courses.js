const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function view() {
  const { data, error } = await supabase
    .from('courses')
    .select('*');
    
  if (error) {
    console.error('Error fetching courses:', error.message);
  } else {
    console.log('Total courses in database:', data.length);
    console.log(data.map(c => ({ id: c.id, title: c.title, program_type: c.program_type, base_fee: c.base_fee, active: c.active })));
  }
}

view();
