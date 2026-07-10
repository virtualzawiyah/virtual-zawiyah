const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error('Error fetching courses:', error.message);
  } else {
    console.log('Courses columns:', data.length > 0 ? Object.keys(data[0]) : 'no rows');
  }
}

check();
