require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function resetPassword() {
  const { data: profile, error: findError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', 'registrar@test.com')
    .single();

  if (findError || !profile) {
    console.error('Could not find registrar profile:', findError?.message);
    return;
  }

  console.log('Resetting password for registrar ID:', profile.id);

  const { data, error } = await supabase.auth.admin.updateUserById(
    profile.id,
    { password: 'password123' }
  );

  if (error) {
    console.error('Error resetting password:', error.message);
  } else {
    console.log('Successfully set password for registrar@test.com to password123!');
  }
}

resetPassword();
