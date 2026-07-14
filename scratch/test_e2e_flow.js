const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testFlow() {
  console.log('=== Virtual Zawiyah E2E Integration Test ===');
  
  const testEmail = 'test.e2e.teacher@gmail.com';
  const testGender = 'male';
  const testName = 'Test E2E Teacher';
  const testRole = 'teacher';
  
  // 1. Cleanup any previous test data
  console.log('1. Cleaning up previous test data if any...');
  const { data: usersList } = await supabaseAdmin.auth.admin.listUsers();
  const existingUser = usersList.users.find(u => u.email === testEmail);
  if (existingUser) {
    const staffId = existingUser.id;
    console.log(`Found existing test teacher with ID: ${staffId}. Cleaning up...`);
    
    // Mimic API DELETE sequential cleanup
    await supabaseAdmin.from('enrollment_requests').update({ preferred_teacher_id: null }).eq('preferred_teacher_id', staffId);
    await supabaseAdmin.from('enrollment_requests').update({ assigned_teacher_id: null }).eq('assigned_teacher_id', staffId);
    await supabaseAdmin.from('trial_requests').update({ converted_student_id: null }).eq('converted_student_id', staffId);
    await supabaseAdmin.from('trial_requests').delete().or(`teacher_id.eq.${staffId},student_id.eq.${staffId}`);
    await supabaseAdmin.from('teacher_student_assignments').delete().or(`teacher_id.eq.${staffId},student_id.eq.${staffId}`);
    await supabaseAdmin.from('group_classes').delete().eq('teacher_id', staffId);
    await supabaseAdmin.from('group_class_enrollments').delete().eq('student_id', staffId);
    await supabaseAdmin.from('attendance_logs').delete().or(`teacher_id.eq.${staffId},student_id.eq.${staffId}`);
    await supabaseAdmin.from('lesson_logs').delete().or(`teacher_id.eq.${staffId},student_id.eq.${staffId}`);
    await supabaseAdmin.from('disputes').delete().eq('teacher_id', staffId);
    await supabaseAdmin.from('fee_payments').delete().or(`teacher_id.eq.${staffId},student_id.eq.${staffId}`);
    await supabaseAdmin.from('fee_deferrals').update({ reviewed_by: null }).eq('reviewed_by', staffId);
    await supabaseAdmin.from('leave_requests').update({ approved_by: null }).eq('approved_by', staffId);
    await supabaseAdmin.from('withdrawal_requests').delete().eq('teacher_id', staffId);
    await supabaseAdmin.from('wallet_transactions').delete().eq('teacher_id', staffId);
    await supabaseAdmin.from('payroll_disbursements').delete().eq('recipient_id', staffId);
    await supabaseAdmin.from('non_teaching_staff').delete().eq('id', staffId);
    
    await supabaseAdmin.from('profiles').delete().eq('id', staffId);
    await supabaseAdmin.auth.admin.deleteUser(staffId);
    console.log('Cleanup finished.');
  }

  // 2. Hire/Create new staff member
  console.log('\n2. Creating/Hiring a new teacher staff member...');
  const password = 'TestPassword123!';
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: testEmail,
    password,
    email_confirm: true,
    user_metadata: { role: testRole }
  });

  if (authError) {
    console.error('❌ Failed to create auth user:', authError.message);
    process.exit(1);
  }

  const staffId = authData.user.id;
  console.log(`✅ Auth user created successfully. ID: ${staffId}`);

  // Insert profile row
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: staffId,
      email: testEmail,
      full_name: testName,
      role: testRole,
      whatsapp: '+923001234567',
      status: 'Active',
      teacher_type: '1:1',
      gender: testGender
    });

  if (profileError) {
    console.error('❌ Failed to insert profile row:', profileError.message);
    await supabaseAdmin.auth.admin.deleteUser(staffId);
    process.exit(1);
  }
  console.log(`✅ Profile row inserted successfully with gender: ${testGender}`);

  // 3. Create related assignment to trigger foreign key constraint on deletion
  console.log('\n3. Creating related assignment and student records...');
  // Find a student profile to assign
  const { data: students, error: studentError } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'student')
    .limit(1);

  if (studentError || !students || students.length === 0) {
    console.error('❌ No student profiles found to assign.');
    process.exit(1);
  }
  const studentId = students[0].id;
  console.log(`Using student: ${students[0].full_name} (${studentId})`);

  // Insert teacher student assignment
  const { data: assignment, error: assignmentError } = await supabaseAdmin
    .from('teacher_student_assignments')
    .insert({
      teacher_id: staffId,
      student_id: studentId,
      is_active: true
    })
    .select()
    .single();

  if (assignmentError) {
    console.error('❌ Failed to create teacher student assignment:', assignmentError.message);
    process.exit(1);
  }
  console.log(`✅ Assignment created successfully. ID: ${assignment.id}`);

  // 4. Terminate staff member using sequential cleanup
  console.log('\n4. Attempting Staff Termination (Deletion Cleanup Flow)...');
  try {
    // A. Delete teacher student assignments (mimics step 5 of cleanup)
    const { error: delAssignError } = await supabaseAdmin
      .from('teacher_student_assignments')
      .delete()
      .or(`teacher_id.eq.${staffId},student_id.eq.${staffId}`);
    
    if (delAssignError) throw delAssignError;
    console.log('✅ Deleted related assignments.');

    // B. Delete profile row (mimics step 24 of cleanup)
    const { error: delProfileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', staffId);

    if (delProfileError) throw delProfileError;
    console.log('✅ Deleted profiles row.');

    // C. Delete auth user (mimics step 25 of cleanup)
    const { error: delAuthError } = await supabaseAdmin.auth.admin.deleteUser(staffId);
    if (delAuthError) throw delAuthError;
    console.log('✅ Deleted Supabase Auth user.');

    console.log('\n🎉 SUCCESS: E2E Staff Termination Flow completed with NO foreign key blockages!');

  } catch (err) {
    console.error('❌ Deletion flow failed:', err.message);
    process.exit(1);
  }
}

testFlow();
