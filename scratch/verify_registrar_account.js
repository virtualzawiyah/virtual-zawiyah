require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkRegistrar() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, role, status')
    .eq('email', 'registrar@test.com')
    .maybeSingle();

  if (error) {
    console.error('Error finding registrar@test.com:', error.message);
  } else if (data) {
    console.log('registrar@test.com profile details:', data);
  } else {
    console.log('registrar@test.com profile does not exist! Creating a test registrar profile...');
    // Let's check if the user is in auth schema first
    const { data: users, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
      console.error('Error listing auth users:', authError.message);
      return;
    }
    const authUser = users.users.find(u => u.email === 'registrar@test.com');
    if (authUser) {
      console.log('registrar@test.com exists in auth schema with ID:', authUser.id);
      // Insert profile
      const { error: profileInsertError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.id,
          email: 'registrar@test.com',
          full_name: 'Registrar Staff Member',
          role: 'registrar',
          status: 'Active'
        });
      if (profileInsertError) {
        console.error('Error inserting registrar profile:', profileInsertError.message);
      } else {
        console.log('Successfully inserted registrar profile!');
      }
    } else {
      console.log('registrar@test.com does not exist in auth schema. Creating auth user...');
      const { data: newAuth, error: newAuthError } = await supabase.auth.admin.createUser({
        email: 'registrar@test.com',
        password: 'password123',
        email_confirm: true,
        user_metadata: { role: 'registrar' }
      });
      if (newAuthError) {
        console.error('Error creating auth user for registrar:', newAuthError.message);
        return;
      }
      console.log('Created auth user successfully. ID:', newAuth.user.id);
      const { error: profileInsertError } = await supabase
        .from('profiles')
        .insert({
          id: newAuth.user.id,
          email: 'registrar@test.com',
          full_name: 'Registrar Staff Member',
          role: 'registrar',
          status: 'Active'
        });
      if (profileInsertError) {
        console.error('Error inserting profile row:', profileInsertError.message);
      } else {
        console.log('Successfully inserted registrar profile!');
      }
    }
  }
}
checkRegistrar();
