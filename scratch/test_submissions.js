require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const PORT = 3000; // Local dev port

async function testEnrollment() {
  console.log('Testing Enrollment API endpoint...');
  const payload = {
    student_name: 'Fatima Zahra',
    parent_name: 'Muhammad Zahra',
    parent_email: 'test.enrollment@gmail.com',
    parent_whatsapp: '+923001111111',
    student_gender: 'female',
    student_age: 12,
    country: 'Pakistan',
    state: 'Punjab',
    course_interest: 'Quran Reading with Tajweed',
    course_type: '1:1',
    preferred_teacher_gender: 'female',
    student_timezone: 'Asia/Karachi',
    preferred_schedule: {
      days: ['Monday', 'Wednesday'],
      time1: '18:00',
      time2: '19:00'
    },
    message: 'Test enrollment special needs message'
  };

  try {
    const res = await fetch(`http://localhost:${PORT}/api/public/enrollment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    console.log('Enrollment API Response:', res.status, json);
    
    if (json.success) {
      console.log('✅ Enrollment API test passed!');
    } else {
      console.error('❌ Enrollment API test failed:', json.error);
    }
  } catch (err) {
    console.error('❌ Enrollment API request failed:', err.message);
  }
}

async function testContact() {
  console.log('Testing Contact API endpoint...');
  const payload = {
    full_name: 'Muhammad Zahra',
    email: 'test.enrollment@gmail.com',
    message: 'Hello, this is a test contact message minimum 10 characters long'
  };

  try {
    const res = await fetch(`http://localhost:${PORT}/api/public/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const json = await res.json();
    console.log('Contact API Response:', res.status, json);

    if (json.success) {
      console.log('✅ Contact API test passed!');
    } else {
      console.error('❌ Contact API test failed:', json.error);
    }
  } catch (err) {
    console.error('❌ Contact API request failed:', err.message);
  }
}

async function run() {
  await testEnrollment();
  await testContact();
}
run();
