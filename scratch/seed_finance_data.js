const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seed() {
  console.log('Seeding finance test accounts...');

  // 1. Seed Finance Officer: finance@test.com / password123
  let financeUser;
  const { data: listData } = await supabase.auth.admin.listUsers();
  const existingFinance = listData.users.find(u => u.email === 'finance@test.com');
  
  if (existingFinance) {
    console.log('Finance officer auth user already exists.');
    financeUser = existingFinance;
  } else {
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email: 'finance@test.com',
      password: 'password123',
      email_confirm: true,
      user_metadata: { role: 'finance_officer' }
    });
    
    if (createError) {
      console.error('Error creating finance auth user:', createError.message);
      return;
    }
    console.log('Finance officer auth user created.');
    financeUser = createData.user;
  }

  // Update/insert profiles table for finance officer
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: financeUser.id,
      email: 'finance@test.com',
      full_name: 'Finance Officer',
      role: 'finance_officer',
      status: 'Active'
    });

  if (profileError) {
    console.error('Error upserting finance profile:', profileError.message);
    return;
  }
  console.log('Finance officer profile upserted.');

  // 2. Update existing teacher's name to "Mufti Tariq Masood"
  const { error: teacherUpdateError } = await supabase
    .from('profiles')
    .update({ full_name: 'Mufti Tariq Masood' })
    .eq('email', 'teacher@test.com');

  if (teacherUpdateError) {
    console.error('Error updating teacher profile name:', teacherUpdateError.message);
  } else {
    console.log('Teacher profile name updated to Mufti Tariq Masood.');
  }

  // 3. Seed Non-Teaching Staff (e.g. Sajid Ali, Muhammad Ramzan)
  const staffToSeed = [
    { email: 'ramzan@test.com', name: 'Muhammad Ramzan', role: 'Security Guard', salary: 25000 },
    { email: 'sajid@test.com', name: 'Sajid Ali', role: 'Office Boy', salary: 20000 }
  ];

  for (const staff of staffToSeed) {
    let authUser = listData.users.find(u => u.email === staff.email);
    if (!authUser) {
      const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        email: staff.email,
        password: 'password123',
        email_confirm: true,
        user_metadata: { role: 'registrar' } // placeholder role in user_metadata
      });
      if (createError) {
        console.error(`Error creating auth user for ${staff.name}:`, createError.message);
        continue;
      }
      authUser = createData.user;
      console.log(`Auth user created for ${staff.name}.`);
    }

    // Upsert into profiles
    const { error: profErr } = await supabase
      .from('profiles')
      .upsert({
        id: authUser.id,
        email: staff.email,
        full_name: staff.name,
        role: 'registrar', // valid user_role
        status: 'Active'
      });
    if (profErr) {
      console.error(`Error upserting profile for ${staff.name}:`, profErr.message);
      continue;
    }

    // Upsert into non_teaching_staff
    const { error: staffErr } = await supabase
      .from('non_teaching_staff')
      .upsert({
        id: authUser.id,
        name: staff.name,
        role: staff.role,
        contact: '+92 300 1234567',
        joining_date: '2026-01-01',
        base_salary_pkr: staff.salary,
        status: 'Active'
      });
    if (staffErr) {
      console.error(`Error upserting non_teaching_staff for ${staff.name}:`, staffErr.message);
    } else {
      console.log(`Non-teaching staff record upserted for ${staff.name}.`);
    }
  }

  console.log('Seeding complete!');
}

seed();
