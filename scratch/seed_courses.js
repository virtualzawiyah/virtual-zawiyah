const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const courses = [
  { title: 'Quran Reading with Tajweed', program_type: '1:1', base_fee: 60.00, currency: 'USD', duration_months: 12, active: true },
  { title: 'Applied Tajweed (Basic)', program_type: '1:1', base_fee: 60.00, currency: 'USD', duration_months: 12, active: true },
  { title: 'Quran Memorization (Hifz)', program_type: '1:1', base_fee: 60.00, currency: 'USD', duration_months: 12, active: true },
  { title: '40 Hadith Memorization', program_type: '1:1', base_fee: 60.00, currency: 'USD', duration_months: 12, active: true },
  { title: 'Quran Translation', program_type: '1:1', base_fee: 60.00, currency: 'USD', duration_months: 12, active: true },
  { title: 'Arabic Grammar (Sarf & Nahw)', program_type: '1:1', base_fee: 60.00, currency: 'USD', duration_months: 12, active: true },
  { title: 'Dars-e-Nizami — Classical Islamic Curriculum', program_type: 'group', base_fee: 10.00, currency: 'USD', duration_months: 12, active: true },
  { title: 'Tajweed — 2-Year Structured Group Program', program_type: 'group', base_fee: 10.00, currency: 'USD', duration_months: 12, active: true }
];

async function seed() {
  console.log('Seeding courses database...');
  
  const { data: existing, error: fetchError } = await supabase
    .from('courses')
    .select('title');
    
  if (fetchError) {
    console.error('Error fetching existing courses:', fetchError.message);
    process.exit(1);
  }
  
  const existingTitles = new Set((existing || []).map(c => c.title.toLowerCase().trim()));
  const toInsert = courses.filter(c => !existingTitles.has(c.title.toLowerCase().trim()));
  
  if (toInsert.length === 0) {
    console.log('All default courses already exist in the database.');
  } else {
    console.log(`Inserting ${toInsert.length} new courses...`);
    const { data, error } = await supabase
      .from('courses')
      .insert(toInsert)
      .select();
      
    if (error) {
      console.error('Error inserting courses:', error.message);
      process.exit(1);
    }
    console.log('Courses seeded successfully:', data.map(c => c.title));
  }
  process.exit(0);
}

seed();
