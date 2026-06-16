-- =====================================================================
-- DATABASE SCHEMA UPDATE: VIRTUAL ZAWIYAH v3.0 -> v5.0
-- Run this in the Supabase SQL Editor
-- =====================================================================

-- 1. Create student_status enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'student_status') THEN
        CREATE TYPE student_status AS ENUM ('trial', 'active', 'suspended_temporary', 'suspended_forever', 'left');
    END IF;
END
$$;

-- 2. Add student_status and status_change_reason to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS student_status student_status DEFAULT 'active',
ADD COLUMN IF NOT EXISTS status_change_reason TEXT;

-- 3. Create teacher_work_slots table
CREATE TABLE IF NOT EXISTS teacher_work_slots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    slot_start TIME NOT NULL,
    slot_end TIME NOT NULL,
    break_start TIME,
    break_end TIME,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_teacher_work_slots ON teacher_work_slots(teacher_id, day_of_week);

-- RLS for teacher_work_slots
ALTER TABLE teacher_work_slots ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Teacher own slots') THEN
        CREATE POLICY "Teacher own slots" ON teacher_work_slots FOR ALL USING (teacher_id = auth.uid());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin read slots') THEN
        CREATE POLICY "Admin read slots" ON teacher_work_slots FOR SELECT USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
    END IF;
END
$$;

-- 4. Create student_status_history table
CREATE TABLE IF NOT EXISTS student_status_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    previous_status student_status NOT NULL,
    new_status student_status NOT NULL,
    changed_by UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    reason TEXT,
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for student_status_history
ALTER TABLE student_status_history ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin read status history') THEN
        CREATE POLICY "Admin read status history" ON student_status_history FOR SELECT USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
    END IF;
END
$$;

-- 5. Create student_status_import_logs table
CREATE TABLE IF NOT EXISTS student_status_import_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_by UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    month_year DATE NOT NULL,
    records_imported INT DEFAULT 0,
    status TEXT CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for student_status_import_logs
ALTER TABLE student_status_import_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin read import logs') THEN
        CREATE POLICY "Admin read import logs" ON student_status_import_logs FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
    END IF;
END
$$;

-- 6. Create or replace teacher_weekly_workload view
CREATE OR REPLACE VIEW teacher_weekly_workload AS
SELECT 
    tsa.teacher_id,
    p.full_name AS teacher_name,
    COUNT(DISTINCT cs.id) AS weekly_slots_occupied
FROM teacher_student_assignments tsa
JOIN class_schedules cs ON cs.assignment_id = tsa.id
JOIN profiles p ON p.id = tsa.teacher_id
WHERE tsa.is_active = true
GROUP BY tsa.teacher_id, p.full_name;

-- 7. Add student status log trigger function and trigger
CREATE OR REPLACE FUNCTION log_student_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.student_status IS DISTINCT FROM NEW.student_status THEN
    INSERT INTO student_status_history (student_id, previous_status, new_status, changed_by, reason)
    VALUES (NEW.id, OLD.student_status, NEW.student_status, auth.uid(), NEW.status_change_reason);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger (drop if exists first)
DROP TRIGGER IF EXISTS trg_student_status_change ON profiles;
CREATE TRIGGER trg_student_status_change
    AFTER UPDATE OF student_status ON profiles
    FOR EACH ROW EXECUTE FUNCTION log_student_status_change();
