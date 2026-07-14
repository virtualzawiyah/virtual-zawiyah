-- =====================================================================
-- DATABASE MIGRATION: ALTER FOREIGN KEYS FOR CASCADE DELETION
-- Run this in the Supabase SQL Editor to enable automatic cascading deletes
-- =====================================================================

-- 1. teacher_student_assignments
ALTER TABLE teacher_student_assignments 
  DROP CONSTRAINT IF EXISTS teacher_student_assignments_teacher_id_fkey,
  DROP CONSTRAINT IF EXISTS teacher_student_assignments_student_id_fkey;

ALTER TABLE teacher_student_assignments
  ADD CONSTRAINT teacher_student_assignments_teacher_id_fkey 
    FOREIGN KEY (teacher_id) REFERENCES profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT teacher_student_assignments_student_id_fkey 
    FOREIGN KEY (student_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 2. attendance_logs
ALTER TABLE attendance_logs
  DROP CONSTRAINT IF EXISTS attendance_logs_teacher_id_fkey,
  DROP CONSTRAINT IF EXISTS attendance_logs_student_id_fkey;

ALTER TABLE attendance_logs
  ADD CONSTRAINT attendance_logs_teacher_id_fkey
    FOREIGN KEY (teacher_id) REFERENCES profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT attendance_logs_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 3. lesson_logs
ALTER TABLE lesson_logs
  DROP CONSTRAINT IF EXISTS lesson_logs_teacher_id_fkey,
  DROP CONSTRAINT IF EXISTS lesson_logs_student_id_fkey;

ALTER TABLE lesson_logs
  ADD CONSTRAINT lesson_logs_teacher_id_fkey
    FOREIGN KEY (teacher_id) REFERENCES profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT lesson_logs_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 4. fee_payments
ALTER TABLE fee_payments
  DROP CONSTRAINT IF EXISTS fee_payments_teacher_id_fkey,
  DROP CONSTRAINT IF EXISTS fee_payments_student_id_fkey;

ALTER TABLE fee_payments
  ADD CONSTRAINT fee_payments_teacher_id_fkey
    FOREIGN KEY (teacher_id) REFERENCES profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT fee_payments_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 5. fee_deferrals (reviewed_by)
ALTER TABLE fee_deferrals
  DROP CONSTRAINT IF EXISTS fee_deferrals_reviewed_by_fkey;

ALTER TABLE fee_deferrals
  ADD CONSTRAINT fee_deferrals_reviewed_by_fkey
    FOREIGN KEY (reviewed_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- 6. leave_requests (approved_by)
ALTER TABLE leave_requests
  DROP CONSTRAINT IF EXISTS leave_requests_approved_by_fkey;

ALTER TABLE leave_requests
  ADD CONSTRAINT leave_requests_approved_by_fkey
    FOREIGN KEY (approved_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- 7. withdrawal_requests
ALTER TABLE withdrawal_requests
  DROP CONSTRAINT IF EXISTS withdrawal_requests_teacher_id_fkey;

ALTER TABLE withdrawal_requests
  ADD CONSTRAINT withdrawal_requests_teacher_id_fkey
    FOREIGN KEY (teacher_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 8. wallet_transactions
ALTER TABLE wallet_transactions
  DROP CONSTRAINT IF EXISTS wallet_transactions_teacher_id_fkey;

ALTER TABLE wallet_transactions
  ADD CONSTRAINT wallet_transactions_teacher_id_fkey
    FOREIGN KEY (teacher_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 9. disputes
ALTER TABLE disputes
  DROP CONSTRAINT IF EXISTS disputes_teacher_id_fkey;

ALTER TABLE disputes
  ADD CONSTRAINT disputes_teacher_id_fkey
    FOREIGN KEY (teacher_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 10. trial_requests
ALTER TABLE trial_requests
  DROP CONSTRAINT IF EXISTS trial_requests_teacher_id_fkey;

ALTER TABLE trial_requests
  ADD CONSTRAINT trial_requests_teacher_id_fkey
    FOREIGN KEY (teacher_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 11. payroll_disbursements
ALTER TABLE payroll_disbursements
  DROP CONSTRAINT IF EXISTS payroll_disbursements_recipient_id_fkey;

ALTER TABLE payroll_disbursements
  ADD CONSTRAINT payroll_disbursements_recipient_id_fkey
    FOREIGN KEY (recipient_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 12. group_classes
ALTER TABLE group_classes
  DROP CONSTRAINT IF EXISTS group_classes_teacher_id_fkey;

ALTER TABLE group_classes
  ADD CONSTRAINT group_classes_teacher_id_fkey
    FOREIGN KEY (teacher_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 13. group_class_enrollments
ALTER TABLE group_class_enrollments
  DROP CONSTRAINT IF EXISTS group_class_enrollments_student_id_fkey;

ALTER TABLE group_class_enrollments
  ADD CONSTRAINT group_class_enrollments_student_id_fkey
    FOREIGN KEY (student_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 14. enrollment_requests
ALTER TABLE enrollment_requests
  DROP CONSTRAINT IF EXISTS enrollment_requests_preferred_teacher_id_fkey,
  DROP CONSTRAINT IF EXISTS enrollment_requests_assigned_teacher_id_fkey;

ALTER TABLE enrollment_requests
  ADD CONSTRAINT enrollment_requests_preferred_teacher_id_fkey
    FOREIGN KEY (preferred_teacher_id) REFERENCES profiles(id) ON DELETE SET NULL,
  ADD CONSTRAINT enrollment_requests_assigned_teacher_id_fkey
    FOREIGN KEY (assigned_teacher_id) REFERENCES profiles(id) ON DELETE SET NULL;
