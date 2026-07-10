-- ============================================
-- VIRTUAL ZAWIYAH v3.0 – FULL DATABASE SCHEMA
-- Includes public enrollment + internal platform
-- Note: Operational day switch boundary is 07:00 AM PST
-- ============================================

-- ─────────────────────────────────────────────
-- Enums
-- ─────────────────────────────────────────────
CREATE TYPE user_role AS ENUM (
    'admin', 
    'academic_director', 
    'supervisor', 
    'teacher', 
    'student', 
    'parent',
    'registrar',
    'content_manager',
    'finance_officer',
    'founder'
);
CREATE TYPE payment_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE withdrawal_status AS ENUM ('pending', 'transferred', 'rejected');
CREATE TYPE dispute_status AS ENUM ('pending', 'resolved', 'rejected');

-- ─────────────────────────────────────────────
-- Profiles
-- ─────────────────────────────────────────────
CREATE TABLE profiles (
    id            UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email         TEXT UNIQUE NOT NULL,
    full_name     TEXT NOT NULL,
    role          user_role NOT NULL DEFAULT 'student',
    whatsapp      TEXT,
    country       TEXT,
    city          TEXT,
    timezone      TEXT DEFAULT 'UTC',
    gender        TEXT CHECK (gender IN ('male', 'female')),
    avatar_url    TEXT,
    parent_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status        TEXT DEFAULT 'Active' NOT NULL CHECK (status IN ('Active', 'Pending Director Approval', 'Suspended', 'Removed')),
    teacher_type  TEXT CHECK (teacher_type IS NULL OR teacher_type IN ('1:1', 'Dars-e-Nizami', 'Tajweed')),
    created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT check_teacher_role_type CHECK (
        (role = 'teacher' AND teacher_type IN ('1:1', 'Dars-e-Nizami', 'Tajweed')) OR
        (role <> 'teacher' AND teacher_type IS NULL)
    )
);

CREATE INDEX idx_profiles_parent ON profiles(parent_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Auto-update updated_at helper
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────
-- Courses (Missing Table - Section C)
-- ─────────────────────────────────────────────
CREATE TABLE courses (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title           TEXT NOT NULL,
    program_type    TEXT NOT NULL CHECK (program_type IN ('1:1', 'group')),
    base_fee        NUMERIC(10, 2) NOT NULL CHECK (base_fee >= 0),
    currency        TEXT DEFAULT 'USD' NOT NULL CHECK (currency = 'USD'),
    duration_months INT NOT NULL CHECK (duration_months > 0),
    active          BOOLEAN DEFAULT TRUE NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_courses_active ON courses(active);

-- ─────────────────────────────────────────────
-- Dars-e-Nizami Curriculum Catalog (Missing Table - Section C)
-- ─────────────────────────────────────────────
CREATE TABLE darse_nizami_curriculum (
    id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    year_level    INT NOT NULL CHECK (year_level BETWEEN 1 AND 8),
    subject_title TEXT NOT NULL,
    book_name     TEXT NOT NULL,
    pdf_file_url  TEXT NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_curriculum_year ON darse_nizami_curriculum(year_level);

-- ─────────────────────────────────────────────
-- Group Classes Cohorts (Missing Table - Section C)
-- ─────────────────────────────────────────────
CREATE TABLE group_classes (
    id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id      UUID REFERENCES courses(id) ON DELETE RESTRICT NOT NULL,
    teacher_id     UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    class_name     TEXT NOT NULL,
    year_level     INT NOT NULL CHECK (year_level BETWEEN 1 AND 8),
    max_capacity   INT DEFAULT 25 NOT NULL CHECK (max_capacity > 0),
    enrolled_count INT DEFAULT 0 NOT NULL CHECK (enrolled_count >= 0),
    created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT enrolled_limit CHECK (enrolled_count <= max_capacity)
);

CREATE INDEX idx_group_classes_teacher ON group_classes(teacher_id);
CREATE INDEX idx_group_classes_course ON group_classes(course_id);

-- ─────────────────────────────────────────────
-- Group Class Enrollments (Missing Table - Section C)
-- ─────────────────────────────────────────────
CREATE TABLE group_class_enrollments (
    id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_class_id UUID REFERENCES group_classes(id) ON DELETE CASCADE NOT NULL,
    student_id     UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    enrolled_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(group_class_id, student_id)
);

CREATE INDEX idx_group_enrollments_student ON group_class_enrollments(student_id);
CREATE INDEX idx_group_enrollments_class ON group_class_enrollments(group_class_id);

-- ─────────────────────────────────────────────
-- Enrollment Requests
-- ─────────────────────────────────────────────
CREATE TABLE enrollment_requests (
    id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_name         TEXT NOT NULL,
    student_age          INT,
    parent_name          TEXT NOT NULL,
    parent_email         TEXT NOT NULL,
    parent_whatsapp      TEXT,
    course_interest      TEXT,
    preferred_teacher_id UUID REFERENCES profiles(id),
    message              TEXT,
    status               TEXT DEFAULT 'pending'
                             CHECK (status IN ('pending', 'reviewed', 'enrolled', 'rejected', 'Pending Supervisor Approval', 'Trial Started', 'processing', 'completed')),
    assigned_teacher_id  UUID REFERENCES profiles(id),
    student_gender       TEXT CHECK (student_gender IN ('male', 'female')),
    student_timezone     TEXT DEFAULT 'UTC',
    preferred_schedule   JSONB,
    course_type          TEXT CHECK (course_type IN ('1:1', 'group')),
    created_at           TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_enrollment_requests_status ON enrollment_requests(status);

-- ─────────────────────────────────────────────
-- Teacher-Student Assignments
-- ─────────────────────────────────────────────
CREATE TABLE teacher_student_assignments (
    id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id    UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    student_id    UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    assigned_date DATE DEFAULT CURRENT_DATE NOT NULL,
    end_date      DATE,
    is_active     BOOLEAN DEFAULT TRUE NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_assignments_teacher_active ON teacher_student_assignments(teacher_id, is_active);
CREATE INDEX idx_assignments_student_active ON teacher_student_assignments(student_id, is_active);

-- ─────────────────────────────────────────────
-- Class Schedules
-- ─────────────────────────────────────────────
CREATE TABLE class_schedules (
    id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id    UUID REFERENCES teacher_student_assignments(id) ON DELETE CASCADE NOT NULL,
    day_of_week      INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time       TIME NOT NULL,
    duration_minutes INT DEFAULT 30 NOT NULL,
    created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_schedules_assignment ON class_schedules(assignment_id);

-- ─────────────────────────────────────────────
-- Academic Calendar
-- ─────────────────────────────────────────────
CREATE TABLE academic_calendar (
    date            DATE PRIMARY KEY,
    is_teaching_day BOOLEAN DEFAULT TRUE NOT NULL,
    description     TEXT
);

CREATE INDEX idx_academic_calendar_date ON academic_calendar(date);

-- ─────────────────────────────────────────────
-- Attendance Logs
-- ─────────────────────────────────────────────
CREATE TABLE attendance_logs (
    id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id     UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    student_id     UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    class_date     DATE DEFAULT CURRENT_DATE NOT NULL,
    status         TEXT CHECK (status IN ('present', 'absent', 'leave')) NOT NULL,
    locked         BOOLEAN DEFAULT FALSE NOT NULL,
    notes          TEXT,
    class_type     TEXT DEFAULT '1:1' NOT NULL CHECK (class_type IN ('1:1', 'group')),
    group_class_id UUID REFERENCES group_classes(id) ON DELETE SET NULL,
    created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(student_id, class_date)
);

CREATE INDEX idx_attendance_teacher_date ON attendance_logs(teacher_id, class_date);
CREATE INDEX idx_attendance_student_date ON attendance_logs(student_id, class_date);

-- ─────────────────────────────────────────────
-- Attendance Unlock Log
-- ─────────────────────────────────────────────
CREATE TABLE attendance_unlock_log (
    id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    attendance_id UUID REFERENCES attendance_logs(id) ON DELETE CASCADE NOT NULL,
    unlocked_by   UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    reason        TEXT NOT NULL,
    unlocked_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─────────────────────────────────────────────
-- Lesson Logs
-- ─────────────────────────────────────────────
CREATE TABLE lesson_logs (
    id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id    UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    student_id    UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    class_date    DATE DEFAULT CURRENT_DATE NOT NULL,
    topic_covered TEXT NOT NULL,
    next_plan     TEXT NOT NULL,
    performance   TEXT CHECK (performance IN ('excellent', 'good', 'average', 'needs_improvement')) NOT NULL,
    log_type      TEXT DEFAULT 'standard' NOT NULL CHECK (log_type IN ('hifz', 'standard')),
    sabaq         TEXT,
    sabaqi        TEXT,
    manzil        TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_lesson_logs_teacher_date ON lesson_logs(teacher_id, class_date);
CREATE INDEX idx_lesson_logs_student_date ON lesson_logs(student_id, class_date);

-- ─────────────────────────────────────────────
-- Private Notes
-- ─────────────────────────────────────────────
CREATE TABLE lesson_private_notes (
    lesson_id  UUID REFERENCES lesson_logs(id) ON DELETE CASCADE PRIMARY KEY,
    notes      TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─────────────────────────────────────────────
-- Teacher Wallet
-- ─────────────────────────────────────────────
CREATE TABLE teacher_wallet (
    teacher_id        UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
    total_earned      NUMERIC(12, 2) DEFAULT 0.00 NOT NULL CHECK (total_earned >= 0),
    available_balance NUMERIC(12, 2) DEFAULT 0.00 NOT NULL CHECK (available_balance >= 0),
    total_withdrawn   NUMERIC(12, 2) DEFAULT 0.00 NOT NULL CHECK (total_withdrawn >= 0),
    currency          TEXT DEFAULT 'PKR' NOT NULL CHECK (currency = 'PKR')
);

-- ─────────────────────────────────────────────
-- Parent Payments
-- ─────────────────────────────────────────────
CREATE TABLE parent_payments (
    id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id        UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    total_amount     NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    currency         TEXT NOT NULL CHECK (currency IN ('USD', 'GBP', 'PKR')),
    receipt_url      TEXT NOT NULL,
    reference_number TEXT,
    status           payment_status DEFAULT 'pending' NOT NULL,
    verified_at      TIMESTAMPTZ,
    created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_parent_payments_status ON parent_payments(status);
CREATE INDEX idx_parent_payments_parent ON parent_payments(parent_id);

-- ─────────────────────────────────────────────
-- Fee Payments
-- ─────────────────────────────────────────────
CREATE TABLE fee_payments (
    id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_payment_id UUID REFERENCES parent_payments(id) ON DELETE CASCADE,
    student_id        UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    teacher_id        UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    month_year        TEXT NOT NULL,
    original_currency TEXT DEFAULT 'USD' NOT NULL CHECK (original_currency = 'USD'),
    original_amount   NUMERIC(10, 2) NOT NULL CHECK (original_amount >= 0),
    pkr_amount        NUMERIC(12, 2),
    commission_amount NUMERIC(12, 2),
    teacher_amount    NUMERIC(12, 2),
    status            payment_status DEFAULT 'pending' NOT NULL,
    receipt_url       TEXT,
    reference_number  TEXT,
    deferral_requested BOOLEAN DEFAULT FALSE NOT NULL,
    deferral_date     DATE,
    deferral_reason   TEXT,
    deferral_status   TEXT CHECK (deferral_status IN ('pending', 'approved', 'rejected')),
    verified_at       TIMESTAMPTZ,
    created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_student_month UNIQUE (student_id, month_year)
);

CREATE INDEX idx_fee_payments_status ON fee_payments(status);
CREATE INDEX idx_fee_payments_teacher ON fee_payments(teacher_id);
CREATE INDEX idx_fee_payments_student_month ON fee_payments(student_id, month_year);

-- ─────────────────────────────────────────────
-- Fee Deferrals (Missing Table - Section C)
-- ─────────────────────────────────────────────
CREATE TABLE fee_deferrals (
    id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fee_payment_id UUID REFERENCES fee_payments(id) ON DELETE CASCADE NOT NULL,
    requested_date DATE NOT NULL,
    reason         TEXT NOT NULL,
    status         TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by    UUID REFERENCES profiles(id) ON DELETE RESTRICT,
    created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_deferrals_status ON fee_deferrals(status);

-- ─────────────────────────────────────────────
-- Leave Requests (Missing Table - Section C)
-- ─────────────────────────────────────────────
CREATE TABLE leave_requests (
    id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    role         TEXT NOT NULL,
    start_date   DATE NOT NULL,
    end_date     DATE NOT NULL,
    reason       TEXT NOT NULL,
    status       TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by  UUID REFERENCES profiles(id) ON DELETE RESTRICT,
    created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT check_dates CHECK (start_date <= end_date)
);

CREATE INDEX idx_leaves_status ON leave_requests(status);
CREATE INDEX idx_leaves_requester ON leave_requests(requester_id);

-- ─────────────────────────────────────────────
-- Makeup Substitution Requests (Missing Table - Section C)
-- ─────────────────────────────────────────────
CREATE TABLE makeup_requests (
    id                     UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    original_attendance_id UUID REFERENCES attendance_logs(id) ON DELETE CASCADE,
    student_id             UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    teacher_id             UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    proposed_date          DATE NOT NULL,
    proposed_time          TIME NOT NULL,
    status                 TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'scheduled', 'completed', 'cancelled')),
    created_at             TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_makeups_status ON makeup_requests(status);
CREATE INDEX idx_makeups_student ON makeup_requests(student_id);

-- ─────────────────────────────────────────────
-- Withdrawal Requests
-- ─────────────────────────────────────────────
CREATE TABLE withdrawal_requests (
    id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id   UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    amount       NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    bank_name    TEXT NOT NULL,
    account_iban TEXT NOT NULL,
    status       withdrawal_status DEFAULT 'pending' NOT NULL,
    transfer_ref TEXT,
    processed_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_withdrawal_requests_teacher_status ON withdrawal_requests(teacher_id, status);

-- ─────────────────────────────────────────────
-- Wallet Transactions
-- ─────────────────────────────────────────────
CREATE TABLE wallet_transactions (
    id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id    UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    type          TEXT CHECK (type IN ('fee_credit', 'withdrawal_debit', 'adjustment')) NOT NULL,
    amount        NUMERIC(12, 2) NOT NULL,
    balance_after NUMERIC(12, 2) NOT NULL,
    description   TEXT NOT NULL,
    reference_id  UUID,
    created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_wallet_transactions_teacher_created ON wallet_transactions(teacher_id, created_at DESC);

-- ─────────────────────────────────────────────
-- Exchange Rate Log
-- ─────────────────────────────────────────────
CREATE TABLE exchange_rate_log (
    id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date                DATE DEFAULT CURRENT_DATE NOT NULL,
    usd_to_pkr          NUMERIC(8, 2) NOT NULL,
    gbp_to_pkr          NUMERIC(8, 2) NOT NULL,
    entered_by_admin_id UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    created_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─────────────────────────────────────────────
-- Disputes
-- ─────────────────────────────────────────────
CREATE TABLE disputes (
    id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id     UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    fee_payment_id UUID REFERENCES fee_payments(id) ON DELETE CASCADE NOT NULL,
    reason         TEXT NOT NULL,
    status         dispute_status DEFAULT 'pending' NOT NULL,
    admin_response TEXT,
    created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─────────────────────────────────────────────
-- Trial Requests
-- ─────────────────────────────────────────────
CREATE TABLE trial_requests (
    id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id          UUID REFERENCES profiles(id) ON DELETE CASCADE,
    teacher_id          UUID REFERENCES profiles(id) ON DELETE RESTRICT,
    student_name        TEXT,
    parent_email        TEXT,
    requested_date      DATE NOT NULL,
    status              TEXT CHECK (status IN ('pending', 'scheduled', 'completed', 'cancelled', 'converted', 'rejected', 'active'))
                            DEFAULT 'pending' NOT NULL,
    class_link          TEXT,
    feedback            TEXT,
    is_converted_active BOOLEAN DEFAULT FALSE NOT NULL,
    converted_student_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_trial_requests_status ON trial_requests(status);

-- ─────────────────────────────────────────────
-- Non-Teaching HR Staff Directory (Missing Table - Section C)
-- ─────────────────────────────────────────────
CREATE TABLE non_teaching_staff (
    id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name               TEXT NOT NULL,
    role               TEXT NOT NULL CHECK (role IN ('Security Guard', 'Office Boy', 'Cleaner', 'Supervisor', 'Registrar', 'Content Manager', 'Finance Officer')),
    contact            TEXT NOT NULL,
    joining_date       DATE NOT NULL,
    base_salary_pkr    NUMERIC(12, 2) NOT NULL CHECK (base_salary_pkr >= 0),
    status             TEXT DEFAULT 'Active' NOT NULL CHECK (status IN ('Active', 'Removed')),
    termination_reason TEXT,
    created_at         TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_staff_status ON non_teaching_staff(status);

-- ─────────────────────────────────────────────
-- Payroll Disbursements (Missing Table - Section C)
-- ─────────────────────────────────────────────
CREATE TABLE payroll_disbursements (
    id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipient_id   UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    recipient_type TEXT NOT NULL CHECK (recipient_type IN ('teacher', 'staff')),
    month_year     TEXT NOT NULL,
    base_amount    NUMERIC(12, 2) NOT NULL CHECK (base_amount >= 0),
    adjustments    NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    final_payout   NUMERIC(12, 2) NOT NULL CHECK (final_payout >= 0),
    currency       TEXT DEFAULT 'PKR' NOT NULL CHECK (currency = 'PKR'),
    status         TEXT DEFAULT 'Processing' NOT NULL CHECK (status IN ('Processing', 'Paid')),
    payment_date   TIMESTAMPTZ,
    voucher_url    TEXT,
    created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_payroll_recipient ON payroll_disbursements(recipient_id);

-- ─────────────────────────────────────────────
-- Expenses Log (Missing Table - Section C)
-- ─────────────────────────────────────────────
CREATE TABLE expenses_log (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category    TEXT NOT NULL,
    amount_pkr  NUMERIC(12, 2) NOT NULL CHECK (amount_pkr >= 0),
    description TEXT,
    receipt_url TEXT,
    logged_by   UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_expenses_category ON expenses_log(category);

-- ─────────────────────────────────────────────
-- Content Manager Announcements (Missing Table - Section C)
-- ─────────────────────────────────────────────
CREATE TABLE announcements (
    id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title        TEXT NOT NULL,
    content      TEXT NOT NULL,
    applies_to   TEXT NOT NULL CHECK (applies_to IN ('all', '1:1', 'group')),
    start_date   DATE NOT NULL,
    end_date     DATE NOT NULL,
    published_by UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT check_ann_dates CHECK (start_date <= end_date)
);

CREATE INDEX idx_announcements_range ON announcements(start_date, end_date);

-- ─────────────────────────────────────────────
-- Classroom Sessions (Missing Table - Section C)
-- ─────────────────────────────────────────────
CREATE TABLE classroom_sessions (
    id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    class_type    TEXT NOT NULL CHECK (class_type IN ('1:1', 'group')),
    meeting_id    TEXT NOT NULL,
    start_time    TIMESTAMPTZ NOT NULL,
    end_time      TIMESTAMPTZ,
    recording_url TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─────────────────────────────────────────────
-- Security Audit Logs (Missing Table - Section C)
-- ─────────────────────────────────────────────
CREATE TABLE security_audit_logs (
    id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    details    TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_security_logs_created ON security_audit_logs(created_at DESC);

-- ─────────────────────────────────────────────
-- Notifications
-- ─────────────────────────────────────────────
CREATE TABLE notifications (
    id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    role       user_role NOT NULL,
    title      TEXT NOT NULL,
    message    TEXT NOT NULL,
    is_read    BOOLEAN DEFAULT FALSE NOT NULL,
    link       TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read, created_at DESC);


-- ─────────────────────────────────────────────
-- RLS Helper Functions & Security Contexts
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS user_role AS $$
DECLARE
    r user_role;
BEGIN
    IF user_uuid IS NULL THEN
        RETURN NULL;
    END IF;
    -- Query auth.users metadata first to avoid profiles RLS recursion
    SELECT (raw_user_meta_data->>'role')::user_role FROM auth.users WHERE id = user_uuid INTO r;
    IF r IS NOT NULL THEN
        RETURN r;
    END IF;
    
    -- Fallback: query profiles only if not querying current logged in user to avoid recursion loop
    IF auth.uid() IS NULL OR user_uuid != auth.uid() THEN
        SELECT role FROM profiles WHERE id = user_uuid INTO r;
        RETURN r;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─────────────────────────────────────────────
-- Row Level Security (RLS) Configuration
-- ─────────────────────────────────────────────

-- 1. Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_select_policy ON profiles FOR SELECT USING (
    id = auth.uid() OR
    parent_id = auth.uid() OR
    (get_user_role(auth.uid()) = 'teacher' AND EXISTS (
        SELECT 1 FROM teacher_student_assignments WHERE teacher_id = auth.uid() AND student_id = profiles.id AND is_active = true
    )) OR
    get_user_role(auth.uid()) IN ('registrar', 'supervisor', 'academic_director', 'founder')
);
CREATE POLICY profiles_update_policy ON profiles FOR UPDATE USING (
    id = auth.uid() OR
    get_user_role(auth.uid()) IN ('supervisor', 'academic_director', 'founder')
);
CREATE POLICY profiles_insert_policy ON profiles FOR INSERT WITH CHECK (
    get_user_role(auth.uid()) IN ('registrar', 'academic_director', 'founder')
);

-- 2. Enrollment Requests
ALTER TABLE enrollment_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY enrollment_select ON enrollment_requests FOR SELECT USING (
    get_user_role(auth.uid()) IN ('registrar', 'supervisor', 'academic_director', 'founder')
);
CREATE POLICY enrollment_update ON enrollment_requests FOR UPDATE USING (
    get_user_role(auth.uid()) IN ('registrar', 'supervisor', 'academic_director', 'founder')
);
CREATE POLICY enrollment_insert ON enrollment_requests FOR INSERT WITH CHECK (true);

-- 3. Assignments
ALTER TABLE teacher_student_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY assignments_select ON teacher_student_assignments FOR SELECT USING (
    student_id = auth.uid() OR
    teacher_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = student_id AND parent_id = auth.uid()) OR
    get_user_role(auth.uid()) IN ('registrar', 'supervisor', 'academic_director', 'founder')
);
CREATE POLICY assignments_all ON teacher_student_assignments FOR ALL USING (
    get_user_role(auth.uid()) IN ('registrar', 'supervisor', 'academic_director', 'founder')
);

-- 4. Schedules
ALTER TABLE class_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY schedules_select ON class_schedules FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM teacher_student_assignments tsa
        WHERE tsa.id = assignment_id AND (
            tsa.student_id = auth.uid() OR
            tsa.teacher_id = auth.uid() OR
            EXISTS (SELECT 1 FROM profiles WHERE id = tsa.student_id AND parent_id = auth.uid())
        )
    ) OR
    get_user_role(auth.uid()) IN ('registrar', 'supervisor', 'academic_director', 'founder')
);
CREATE POLICY schedules_all ON class_schedules FOR ALL USING (
    get_user_role(auth.uid()) IN ('registrar', 'supervisor', 'academic_director', 'founder')
);

-- 5. Academic Calendar
ALTER TABLE academic_calendar ENABLE ROW LEVEL SECURITY;
CREATE POLICY calendar_select ON academic_calendar FOR SELECT USING (true);
CREATE POLICY calendar_all ON academic_calendar FOR ALL USING (
    get_user_role(auth.uid()) IN ('academic_director', 'founder')
);

-- 6. Attendance Logs
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY attendance_select ON attendance_logs FOR SELECT USING (
    student_id = auth.uid() OR
    teacher_id = auth.uid() OR
    get_user_role(auth.uid()) IN ('supervisor', 'academic_director', 'founder')
);
CREATE POLICY attendance_modify ON attendance_logs FOR ALL USING (
    teacher_id = auth.uid() OR
    get_user_role(auth.uid()) IN ('supervisor', 'academic_director', 'founder')
);

-- 7. Unlock Logs
ALTER TABLE attendance_unlock_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY unlock_log_all ON attendance_unlock_log FOR ALL USING (
    get_user_role(auth.uid()) IN ('supervisor', 'academic_director', 'founder')
);

-- 8. Lesson Logs
ALTER TABLE lesson_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY lesson_select ON lesson_logs FOR SELECT USING (
    student_id = auth.uid() OR
    teacher_id = auth.uid() OR
    get_user_role(auth.uid()) IN ('supervisor', 'academic_director', 'founder')
);
CREATE POLICY lesson_modify ON lesson_logs FOR ALL USING (
    teacher_id = auth.uid() OR
    get_user_role(auth.uid()) IN ('supervisor', 'academic_director', 'founder')
);

-- 9. Private Notes
ALTER TABLE lesson_private_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY private_notes_all ON lesson_private_notes FOR ALL USING (
    EXISTS (
        SELECT 1 FROM lesson_logs l
        WHERE l.id = lesson_id AND l.teacher_id = auth.uid()
    ) OR
    get_user_role(auth.uid()) IN ('academic_director', 'founder')
);

-- 10. Teacher Wallet
ALTER TABLE teacher_wallet ENABLE ROW LEVEL SECURITY;
CREATE POLICY wallet_select ON teacher_wallet FOR SELECT USING (
    teacher_id = auth.uid() OR
    get_user_role(auth.uid()) IN ('finance_officer', 'academic_director', 'founder')
);
CREATE POLICY wallet_update ON teacher_wallet FOR UPDATE USING (
    get_user_role(auth.uid()) IN ('finance_officer', 'academic_director', 'founder')
);

-- 11. Parent Payments
ALTER TABLE parent_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY parent_payments_select ON parent_payments FOR SELECT USING (
    parent_id = auth.uid() OR
    get_user_role(auth.uid()) IN ('finance_officer', 'academic_director', 'founder')
);
CREATE POLICY parent_payments_insert ON parent_payments FOR INSERT WITH CHECK (
    parent_id = auth.uid() OR
    get_user_role(auth.uid()) IN ('finance_officer', 'founder')
);
CREATE POLICY parent_payments_update ON parent_payments FOR UPDATE USING (
    get_user_role(auth.uid()) IN ('finance_officer', 'founder')
);

-- 12. Fee Payments
ALTER TABLE fee_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY fee_select ON fee_payments FOR SELECT USING (
    student_id = auth.uid() OR
    teacher_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = student_id AND parent_id = auth.uid()) OR
    get_user_role(auth.uid()) IN ('finance_officer', 'academic_director', 'founder')
);
CREATE POLICY fee_modify ON fee_payments FOR ALL USING (
    get_user_role(auth.uid()) IN ('finance_officer', 'founder')
);

-- 13. Withdrawal Requests
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY withdrawal_select ON withdrawal_requests FOR SELECT USING (
    teacher_id = auth.uid() OR
    get_user_role(auth.uid()) IN ('finance_officer', 'academic_director', 'founder')
);
CREATE POLICY withdrawal_insert ON withdrawal_requests FOR INSERT WITH CHECK (
    teacher_id = auth.uid()
);
CREATE POLICY withdrawal_update ON withdrawal_requests FOR UPDATE USING (
    get_user_role(auth.uid()) IN ('finance_officer', 'founder')
);

-- 14. Wallet Transactions
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY transactions_select ON wallet_transactions FOR SELECT USING (
    teacher_id = auth.uid() OR
    get_user_role(auth.uid()) IN ('finance_officer', 'academic_director', 'founder')
);
CREATE POLICY transactions_all ON wallet_transactions FOR ALL USING (
    get_user_role(auth.uid()) IN ('finance_officer', 'founder')
);

-- 15. Exchange Rate Logs
ALTER TABLE exchange_rate_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY rate_select ON exchange_rate_log FOR SELECT USING (
    get_user_role(auth.uid()) IN ('finance_officer', 'academic_director', 'founder')
);
CREATE POLICY rate_all ON exchange_rate_log FOR ALL USING (
    get_user_role(auth.uid()) IN ('finance_officer', 'founder')
);

-- 16. Disputes
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
CREATE POLICY disputes_select ON disputes FOR SELECT USING (
    teacher_id = auth.uid() OR
    get_user_role(auth.uid()) IN ('finance_officer', 'academic_director', 'founder')
);
CREATE POLICY disputes_insert ON disputes FOR INSERT WITH CHECK (
    teacher_id = auth.uid()
);
CREATE POLICY disputes_update ON disputes FOR UPDATE USING (
    get_user_role(auth.uid()) IN ('finance_officer', 'founder')
);

-- 17. Trial Requests
ALTER TABLE trial_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY trial_select ON trial_requests FOR SELECT USING (
    student_id = auth.uid() OR
    teacher_id = auth.uid() OR
    get_user_role(auth.uid()) IN ('registrar', 'supervisor', 'academic_director', 'founder')
);
CREATE POLICY trial_insert ON trial_requests FOR INSERT WITH CHECK (true);
CREATE POLICY trial_update ON trial_requests FOR UPDATE USING (
    get_user_role(auth.uid()) IN ('registrar', 'supervisor', 'academic_director', 'founder')
);

-- 18. Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY notifications_select ON notifications FOR SELECT USING (
    user_id = auth.uid()
);
CREATE POLICY notifications_update ON notifications FOR UPDATE USING (
    user_id = auth.uid()
);

-- 19. Courses
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY courses_select ON courses FOR SELECT USING (true);
CREATE POLICY courses_modify ON courses FOR ALL USING (
    get_user_role(auth.uid()) IN ('content_manager', 'founder')
);

-- 20. Nizami Curriculum
ALTER TABLE darse_nizami_curriculum ENABLE ROW LEVEL SECURITY;
CREATE POLICY darse_select ON darse_nizami_curriculum FOR SELECT USING (true);
CREATE POLICY darse_modify ON darse_nizami_curriculum FOR ALL USING (
    get_user_role(auth.uid()) IN ('content_manager', 'founder')
);

-- 21. Group Classes
ALTER TABLE group_classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY group_classes_select ON group_classes FOR SELECT USING (
    teacher_id = auth.uid() OR
    EXISTS (SELECT 1 FROM group_class_enrollments e WHERE e.group_class_id = id AND e.student_id = auth.uid()) OR
    get_user_role(auth.uid()) IN ('registrar', 'supervisor', 'academic_director', 'founder')
);
CREATE POLICY group_classes_all ON group_classes FOR ALL USING (
    get_user_role(auth.uid()) IN ('supervisor', 'founder')
);

-- 22. Group Class Enrollments
ALTER TABLE group_class_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY group_enroll_select ON group_class_enrollments FOR SELECT USING (
    student_id = auth.uid() OR
    EXISTS (SELECT 1 FROM group_classes c WHERE c.id = group_class_id AND c.teacher_id = auth.uid()) OR
    get_user_role(auth.uid()) IN ('registrar', 'supervisor', 'academic_director', 'founder')
);
CREATE POLICY group_enroll_all ON group_class_enrollments FOR ALL USING (
    get_user_role(auth.uid()) IN ('registrar', 'supervisor', 'founder')
);

-- 23. Deferrals
ALTER TABLE fee_deferrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY deferrals_select ON fee_deferrals FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM fee_payments fp
        WHERE fp.id = fee_payment_id AND (
            fp.student_id = auth.uid() OR
            EXISTS (SELECT 1 FROM profiles p WHERE p.id = fp.student_id AND p.parent_id = auth.uid())
        )
    ) OR
    get_user_role(auth.uid()) IN ('finance_officer', 'founder')
);
CREATE POLICY deferrals_insert ON fee_deferrals FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM fee_payments fp
        WHERE fp.id = fee_payment_id AND (
            fp.student_id = auth.uid() OR
            EXISTS (SELECT 1 FROM profiles p WHERE p.id = fp.student_id AND p.parent_id = auth.uid())
        )
    )
);
CREATE POLICY deferrals_update ON fee_deferrals FOR UPDATE USING (
    get_user_role(auth.uid()) IN ('finance_officer', 'founder')
);

-- 24. Leave Requests
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY leave_select ON leave_requests FOR SELECT USING (
    requester_id = auth.uid() OR
    get_user_role(auth.uid()) IN ('supervisor', 'academic_director', 'founder')
);
CREATE POLICY leave_insert ON leave_requests FOR INSERT WITH CHECK (
    requester_id = auth.uid()
);
CREATE POLICY leave_update ON leave_requests FOR UPDATE USING (
    get_user_role(auth.uid()) IN ('supervisor', 'academic_director', 'founder')
);

-- 25. Makeup Substitution Requests
ALTER TABLE makeup_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY makeup_select ON makeup_requests FOR SELECT USING (
    student_id = auth.uid() OR
    teacher_id = auth.uid() OR
    get_user_role(auth.uid()) IN ('registrar', 'supervisor', 'academic_director', 'founder')
);
CREATE POLICY makeup_insert ON makeup_requests FOR INSERT WITH CHECK (
    teacher_id = auth.uid() OR
    get_user_role(auth.uid()) IN ('registrar', 'supervisor')
);
CREATE POLICY makeup_update ON makeup_requests FOR UPDATE USING (
    student_id = auth.uid() OR
    teacher_id = auth.uid() OR
    get_user_role(auth.uid()) IN ('registrar', 'supervisor', 'founder')
);

-- 26. Non-Teaching Staff
ALTER TABLE non_teaching_staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY non_teaching_all ON non_teaching_staff FOR ALL USING (
    get_user_role(auth.uid()) IN ('academic_director', 'founder')
);

-- 27. Payroll Disbursements
ALTER TABLE payroll_disbursements ENABLE ROW LEVEL SECURITY;
CREATE POLICY payroll_select ON payroll_disbursements FOR SELECT USING (
    recipient_id = auth.uid() OR
    get_user_role(auth.uid()) IN ('finance_officer', 'founder')
);
CREATE POLICY payroll_all ON payroll_disbursements FOR ALL USING (
    get_user_role(auth.uid()) IN ('finance_officer', 'founder')
);

-- 28. Expenses Log
ALTER TABLE expenses_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY expenses_all ON expenses_log FOR ALL USING (
    get_user_role(auth.uid()) IN ('finance_officer', 'founder')
);

-- 29. Announcements
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY announcements_select ON announcements FOR SELECT USING (
    (start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE) OR
    get_user_role(auth.uid()) IN ('content_manager', 'founder')
);
CREATE POLICY announcements_modify ON announcements FOR ALL USING (
    get_user_role(auth.uid()) IN ('content_manager', 'founder')
);

-- 30. Classroom Sessions
ALTER TABLE classroom_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY classroom_select ON classroom_sessions FOR SELECT USING (
    get_user_role(auth.uid()) IN ('teacher', 'registrar', 'supervisor', 'academic_director', 'founder') OR
    get_user_role(auth.uid()) = 'student'
);
CREATE POLICY classroom_all ON classroom_sessions FOR ALL USING (
    get_user_role(auth.uid()) IN ('teacher', 'registrar', 'supervisor', 'founder')
);

-- 31. Security Audit Logs
ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_select ON security_audit_logs FOR SELECT USING (
    get_user_role(auth.uid()) = 'founder'
);


-- ─────────────────────────────────────────────
-- Triggers and Procedural Calculations
-- ─────────────────────────────────────────────

-- 1. Auto-update group class enrollment count on insert/delete
CREATE OR REPLACE FUNCTION update_group_class_enrolled_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE group_classes
        SET enrolled_count = enrolled_count + 1
        WHERE id = NEW.group_class_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE group_classes
        SET enrolled_count = enrolled_count - 1
        WHERE id = OLD.group_class_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_group_class_enrolled_count
    AFTER INSERT OR DELETE ON group_class_enrollments
    FOR EACH ROW EXECUTE FUNCTION update_group_class_enrolled_count();


-- 2. Procedure to auto-create monthly student invoices (intended for cron scheduling)
CREATE OR REPLACE FUNCTION generate_monthly_billing(target_month TEXT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO fee_payments (student_id, teacher_id, month_year, original_currency, original_amount, status)
    SELECT 
        tsa.student_id, 
        tsa.teacher_id, 
        target_month, 
        'USD', 
        60.00, -- Default base fee
        'pending'
    FROM teacher_student_assignments tsa
    JOIN profiles student ON tsa.student_id = student.id
    WHERE tsa.is_active = true AND student.status = 'Active'
    ON CONFLICT (student_id, month_year) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Security Audit Trigger: status column changes
CREATE OR REPLACE FUNCTION log_profile_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO security_audit_logs (profile_id, event_type, details)
        VALUES (
            NEW.id,
            'PROFILE_STATUS_CHANGE',
            'Status changed from ' || COALESCE(OLD.status, 'NULL') || ' to ' || NEW.status
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_log_profile_status_change
    AFTER UPDATE OF status ON profiles
    FOR EACH ROW EXECUTE FUNCTION log_profile_status_change();


-- ─────────────────────────────────────────────
-- Notifications System Helper Functions & Triggers (24 Events)
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION notify_role(role_name user_role, n_title TEXT, n_message TEXT)
RETURNS VOID AS $$
DECLARE
    u_id UUID;
BEGIN
    FOR u_id IN SELECT id FROM profiles WHERE role = role_name LOOP
        INSERT INTO notifications (user_id, role, title, message)
        VALUES (u_id, role_name, n_title, n_message);
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION notify_user(user_uuid UUID, n_title TEXT, n_message TEXT)
RETURNS VOID AS $$
DECLARE
    u_role user_role;
BEGIN
    SELECT role FROM profiles WHERE id = user_uuid INTO u_role;
    IF u_role IS NOT NULL THEN
        INSERT INTO notifications (user_id, role, title, message)
        VALUES (user_uuid, u_role, n_title, n_message);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on enrollment_requests
CREATE OR REPLACE FUNCTION trg_func_enrollment()
RETURNS TRIGGER AS $$
BEGIN
    -- Event 1: New admission form submitted
    IF TG_OP = 'INSERT' THEN
        PERFORM notify_role('supervisor', 'New Admission Request', 'A new student admission intake has been submitted: ' || NEW.student_name);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_enrollment_notifications
    AFTER INSERT ON enrollment_requests
    FOR EACH ROW EXECUTE FUNCTION trg_func_enrollment();

-- Trigger on profiles
CREATE OR REPLACE FUNCTION trg_func_profiles()
RETURNS TRIGGER AS $$
BEGIN
    -- Event 2: Portal credentials created
    IF TG_OP = 'INSERT' THEN
        IF NEW.role IN ('student', 'parent') THEN
            IF NEW.parent_id IS NOT NULL THEN
                PERFORM notify_user(NEW.parent_id, 'Portal Credentials Created', 'Your child ' || NEW.full_name || ' has been registered.');
            END IF;
        END IF;
    -- Event 22 & 24
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            IF NEW.status = 'Pending Director Approval' AND NEW.role = 'teacher' THEN
                PERFORM notify_role('academic_director', 'Removal Recommendation', 'Removal recommendation submitted for Teacher: ' || NEW.full_name);
                PERFORM notify_role('supervisor', 'Removal Recommendation Pending', 'Removal recommendation pending director approval for Teacher: ' || NEW.full_name);
            ELSIF NEW.status = 'Active' AND OLD.status = 'Suspended' AND NEW.role = 'student' THEN
                PERFORM notify_user(NEW.id, 'Account Restored', 'Your suspension has been lifted. Welcome back!');
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_profiles_notifications
    AFTER INSERT OR UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION trg_func_profiles();

-- Trigger on assignments
CREATE OR REPLACE FUNCTION trg_func_assignments()
RETURNS TRIGGER AS $$
BEGIN
    -- Event 3: Student assigned to teacher
    IF TG_OP = 'INSERT' THEN
        PERFORM notify_user(NEW.student_id, 'Teacher Assigned', 'You have been assigned to Teacher: ' || (SELECT full_name FROM profiles WHERE id = NEW.teacher_id));
        PERFORM notify_user(NEW.teacher_id, 'New Student Assigned', 'You have been assigned a new student: ' || (SELECT full_name FROM profiles WHERE id = NEW.student_id));
    -- Event 23: Student re-assigned
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.teacher_id IS DISTINCT FROM NEW.teacher_id THEN
            PERFORM notify_user(NEW.student_id, 'Teacher Re-assigned', 'You have been re-assigned to Teacher: ' || (SELECT full_name FROM profiles WHERE id = NEW.teacher_id));
            PERFORM notify_user(NEW.teacher_id, 'New Student Re-assigned', 'You have been assigned a student: ' || (SELECT full_name FROM profiles WHERE id = NEW.student_id));
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_assignments_notifications
    AFTER INSERT OR UPDATE ON teacher_student_assignments
    FOR EACH ROW EXECUTE FUNCTION trg_func_assignments();

-- Trigger on attendance_logs
CREATE OR REPLACE FUNCTION trg_func_attendance()
RETURNS TRIGGER AS $$
BEGIN
    -- Event 7: Attendance marked
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
        PERFORM notify_user(NEW.student_id, 'Attendance Marked', 'Your attendance on ' || NEW.class_date || ' was marked as: ' || NEW.status);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_attendance_notifications
    AFTER INSERT OR UPDATE ON attendance_logs
    FOR EACH ROW EXECUTE FUNCTION trg_func_attendance();

-- Trigger on lesson_logs
CREATE OR REPLACE FUNCTION trg_func_lesson_logs()
RETURNS TRIGGER AS $$
BEGIN
    -- Event 8: Lesson report saved
    IF TG_OP = 'INSERT' THEN
        PERFORM notify_user(NEW.teacher_id, 'Lesson Report Confirmed', 'Lesson report for ' || NEW.class_date || ' has been successfully logged.');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_lesson_logs_notifications
    AFTER INSERT ON lesson_logs
    FOR EACH ROW EXECUTE FUNCTION trg_func_lesson_logs();

-- Trigger on leave_requests
CREATE OR REPLACE FUNCTION trg_func_leaves()
RETURNS TRIGGER AS $$
BEGIN
    -- Event 9: Leave request submitted
    IF TG_OP = 'INSERT' THEN
        PERFORM notify_role('supervisor', 'New Leave Request', 'Leave request submitted by: ' || (SELECT full_name FROM profiles WHERE id = NEW.requester_id));
    -- Event 10: Leave approved/rejected
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            PERFORM notify_user(NEW.requester_id, 'Leave Request ' || NEW.status, 'Your leave request starting ' || NEW.start_date || ' has been ' || NEW.status);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_leave_notifications
    AFTER INSERT OR UPDATE ON leave_requests
    FOR EACH ROW EXECUTE FUNCTION trg_func_leaves();

-- Trigger on makeup_requests
CREATE OR REPLACE FUNCTION trg_func_makeups()
RETURNS TRIGGER AS $$
BEGIN
    -- Event 11: Makeup class requested
    IF TG_OP = 'INSERT' THEN
        PERFORM notify_user(NEW.teacher_id, 'Makeup Class Requested', 'A substitute makeup class has been proposed for ' || NEW.proposed_date);
    -- Event 12: Makeup accepted or refused
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            PERFORM notify_user(NEW.student_id, 'Makeup Class ' || NEW.status, 'The makeup class proposed for ' || NEW.proposed_date || ' has been ' || NEW.status);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_makeup_notifications
    AFTER INSERT OR UPDATE ON makeup_requests
    FOR EACH ROW EXECUTE FUNCTION trg_func_makeups();

-- Trigger on parent_payments
CREATE OR REPLACE FUNCTION trg_func_parent_payments()
RETURNS TRIGGER AS $$
BEGIN
    -- Event 14: Fee receipt uploaded
    IF TG_OP = 'INSERT' THEN
        PERFORM notify_role('supervisor', 'Fee Receipt Uploaded', 'Parent ' || (SELECT full_name FROM profiles WHERE id = NEW.parent_id) || ' uploaded a new payment receipt.');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_parent_payments_notifications
    AFTER INSERT ON parent_payments
    FOR EACH ROW EXECUTE FUNCTION trg_func_parent_payments();

-- Trigger on fee_deferrals
CREATE OR REPLACE FUNCTION trg_func_deferrals()
RETURNS TRIGGER AS $$
DECLARE
    s_id UUID;
BEGIN
    -- Event 15: Fee deferral request submitted
    IF TG_OP = 'INSERT' THEN
        PERFORM notify_role('finance_officer', 'New Deferral Request', 'A new tuition deferral request has been submitted for review.');
    -- Event 16: Fee deferral approved/declined
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            SELECT student_id FROM fee_payments WHERE id = NEW.fee_payment_id INTO s_id;
            IF s_id IS NOT NULL THEN
                PERFORM notify_user(s_id, 'Deferral Request ' || NEW.status, 'Your deferral request has been ' || NEW.status);
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_deferrals_notifications
    AFTER INSERT OR UPDATE ON fee_deferrals
    FOR EACH ROW EXECUTE FUNCTION trg_func_deferrals();

-- Trigger on fee_payments
CREATE OR REPLACE FUNCTION trg_func_fee_payments()
RETURNS TRIGGER AS $$
BEGIN
    -- Event 17: Fee payment confirmed
    IF TG_OP = 'UPDATE' THEN
        IF OLD.status = 'pending' AND NEW.status = 'verified' THEN
            PERFORM notify_user(NEW.student_id, 'Tuition Payment Verified', 'Your tuition payment for ' || NEW.month_year || ' has been verified.');
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_fee_payments_notifications
    AFTER UPDATE ON fee_payments
    FOR EACH ROW EXECUTE FUNCTION trg_func_fee_payments();

-- Trigger on trial_requests
CREATE OR REPLACE FUNCTION trg_func_trials()
RETURNS TRIGGER AS $$
BEGIN
    -- Event 21: Trial converted to Regular status
    IF TG_OP = 'UPDATE' THEN
        IF OLD.is_converted_active = false AND NEW.is_converted_active = true THEN
            PERFORM notify_user(NEW.student_id, 'Trial Converted', 'Your trial period has successfully converted to Regular student status.');
            PERFORM notify_user(NEW.teacher_id, 'Trial Converted', 'Trial student ' || NEW.student_name || ' has converted to Regular status.');
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_trials_notifications
    AFTER UPDATE ON trial_requests
    FOR EACH ROW EXECUTE FUNCTION trg_func_trials();


-- ─────────────────────────────────────────────
-- Time-Based Procedural Calculations (Scheduled Cron Functions)
-- ─────────────────────────────────────────────

-- Utility function for checking classes starting in 15 or 5 minutes (Event 4 & 5)
CREATE OR REPLACE FUNCTION check_upcoming_classes()
RETURNS VOID AS $$
DECLARE
    r RECORD;
    curr_day INT;
BEGIN
    curr_day := EXTRACT(DOW FROM NOW());
    -- checking 15 mins upcoming
    FOR r IN 
        SELECT tsa.student_id, tsa.teacher_id, cs.start_time
        FROM class_schedules cs
        JOIN teacher_student_assignments tsa ON cs.assignment_id = tsa.id
        WHERE tsa.is_active = true AND cs.day_of_week = curr_day
          AND cs.start_time >= (NOW()::TIME + INTERVAL '10 minutes')
          AND cs.start_time <= (NOW()::TIME + INTERVAL '16 minutes')
    LOOP
        PERFORM notify_user(r.student_id, 'Class Starting Soon', 'Your class is starting in 15 minutes.');
        PERFORM notify_user(r.teacher_id, 'Class Starting Soon', 'Your class with student is starting in 15 minutes.');
    END LOOP;

    -- checking 5 mins upcoming
    FOR r IN 
        SELECT tsa.student_id, tsa.teacher_id, cs.start_time
        FROM class_schedules cs
        JOIN teacher_student_assignments tsa ON cs.assignment_id = tsa.id
        WHERE tsa.is_active = true AND cs.day_of_week = curr_day
          AND cs.start_time >= (NOW()::TIME + INTERVAL '2 minutes')
          AND cs.start_time <= (NOW()::TIME + INTERVAL '6 minutes')
    LOOP
        PERFORM notify_user(r.student_id, 'Class Starting in 5 Mins', 'Your class is starting in 5 minutes.');
        PERFORM notify_user(r.teacher_id, 'Class Starting in 5 Mins', 'Your class is starting in 5 minutes.');
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Utility function for grace period checking (Event 6)
CREATE OR REPLACE FUNCTION check_grace_period_missed()
RETURNS VOID AS $$
DECLARE
    r RECORD;
    curr_day INT;
BEGIN
    curr_day := EXTRACT(DOW FROM NOW());
    FOR r IN 
        SELECT tsa.student_id, tsa.teacher_id, cs.start_time
        FROM class_schedules cs
        JOIN teacher_student_assignments tsa ON cs.assignment_id = tsa.id
        WHERE tsa.is_active = true AND cs.day_of_week = curr_day
          -- started 10 minutes ago
          AND cs.start_time >= (NOW()::TIME - INTERVAL '11 minutes')
          AND cs.start_time <= (NOW()::TIME - INTERVAL '9 minutes')
          -- check if attendance is marked
          AND NOT EXISTS (
              SELECT 1 FROM attendance_logs al 
              WHERE al.student_id = tsa.student_id AND al.class_date = CURRENT_DATE
          )
    LOOP
        PERFORM notify_role('supervisor', 'Class Grace Period Expired', 'Class between Teacher ' || r.teacher_id || ' and Student ' || r.student_id || ' has not started after grace period.');
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Utility function for unpaid fees checking (Event 18)
CREATE OR REPLACE FUNCTION check_unpaid_fees()
RETURNS VOID AS $$
DECLARE
    r RECORD;
    curr_month TEXT;
BEGIN
    curr_month := TO_CHAR(CURRENT_DATE, 'YYYY-MM');
    IF EXTRACT(DAY FROM CURRENT_DATE) > 8 THEN
        FOR r IN 
            SELECT DISTINCT student_id, teacher_id
            FROM fee_payments
            WHERE month_year = curr_month AND status = 'pending'
              AND deferral_requested = false
        LOOP
            PERFORM notify_user(r.student_id, 'Tuition Overdue', 'Your tuition payment is overdue. Please settle or submit a deferral.');
            PERFORM notify_role('supervisor', 'Tuition Overdue Alert', 'Tuition for student ' || r.student_id || ' remains unpaid after the 8th.');
        END LOOP;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Utility function for fee reminders on 5th (Event 19)
CREATE OR REPLACE FUNCTION send_fee_reminders()
RETURNS VOID AS $$
DECLARE
    r RECORD;
    curr_month TEXT;
BEGIN
    curr_month := TO_CHAR(CURRENT_DATE, 'YYYY-MM');
    IF EXTRACT(DAY FROM CURRENT_DATE) = 5 THEN
        FOR r IN 
            SELECT DISTINCT student_id
            FROM fee_payments
            WHERE month_year = curr_month AND status = 'pending'
        LOOP
            PERFORM notify_user(r.student_id, 'Tuition Payment Reminder', 'This is a friendly reminder to process your tuition invoice before the 8th of the month.');
        END LOOP;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Utility function for day 3 of trial tracking (Event 20)
CREATE OR REPLACE FUNCTION check_trial_warnings()
RETURNS VOID AS $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT id, student_name, student_id, teacher_id, requested_date
        FROM trial_requests
        WHERE status = 'scheduled'
          AND requested_date = CURRENT_DATE - 2 -- Third day of trial
    LOOP
        PERFORM notify_user(r.student_id, 'Final Trial Session Today', 'Today is the third day of your trial classes. Contact the registrar to confirm transition.');
        PERFORM notify_role('supervisor', 'Trial Period Expiration', 'Student ' || r.student_name || ' trial period is on day 3 and requires registrar review.');
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─────────────────────────────────────────────
-- Core Trigger Verifications (Verification Trigger)
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION process_verified_parent_payment()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'verified' AND OLD.status = 'pending' THEN
        UPDATE fee_payments
        SET status = 'verified', verified_at = NOW()
        WHERE parent_payment_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_parent_payment_verified
    AFTER UPDATE ON parent_payments
    FOR EACH ROW EXECUTE FUNCTION process_verified_parent_payment();

CREATE OR REPLACE FUNCTION process_verified_fee()
RETURNS TRIGGER AS $$
DECLARE wallet_row RECORD;
BEGIN
    IF NEW.status = 'verified' AND OLD.status = 'pending' THEN
        NEW.commission_amount := NEW.pkr_amount * 0.10;
        NEW.teacher_amount    := NEW.pkr_amount * 0.90;
        NEW.verified_at       := NOW();

        INSERT INTO teacher_wallet (teacher_id, total_earned, available_balance, total_withdrawn)
        VALUES (NEW.teacher_id, 0, 0, 0) ON CONFLICT DO NOTHING;

        UPDATE teacher_wallet
        SET total_earned      = total_earned      + NEW.teacher_amount,
            available_balance = available_balance + NEW.teacher_amount
        WHERE teacher_id = NEW.teacher_id
        RETURNING available_balance INTO wallet_row;

        INSERT INTO wallet_transactions
            (teacher_id, type, amount, balance_after, description, reference_id)
        VALUES
            (NEW.teacher_id, 'fee_credit', NEW.teacher_amount, wallet_row.available_balance,
             'Fee credit for ' || NEW.month_year || ' Student: ' || NEW.student_id, NEW.id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_fee_verified
    BEFORE UPDATE ON fee_payments
    FOR EACH ROW EXECUTE FUNCTION process_verified_fee();

CREATE OR REPLACE FUNCTION process_withdrawal_request_insert()
RETURNS TRIGGER AS $$
DECLARE current_balance NUMERIC(12,2);
BEGIN
    INSERT INTO teacher_wallet (teacher_id, total_earned, available_balance, total_withdrawn)
    VALUES (NEW.teacher_id, 0, 0, 0) ON CONFLICT DO NOTHING;

    SELECT available_balance FROM teacher_wallet
    WHERE teacher_id = NEW.teacher_id FOR UPDATE INTO current_balance;

    IF current_balance < NEW.amount THEN
        RAISE EXCEPTION 'Insufficient balance';
    END IF;

    UPDATE teacher_wallet
    SET available_balance = available_balance - NEW.amount
    WHERE teacher_id = NEW.teacher_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_withdrawal_requested
    BEFORE INSERT ON withdrawal_requests
    FOR EACH ROW EXECUTE FUNCTION process_withdrawal_request_insert();

CREATE OR REPLACE FUNCTION process_withdrawal_request_update()
RETURNS TRIGGER AS $$
DECLARE wallet_row RECORD;
BEGIN
    IF OLD.status = 'pending' AND NEW.status = 'transferred' THEN
        UPDATE teacher_wallet
        SET total_withdrawn = total_withdrawn + NEW.amount
        WHERE teacher_id = NEW.teacher_id
        RETURNING available_balance INTO wallet_row;

        INSERT INTO wallet_transactions
            (teacher_id, type, amount, balance_after, description, reference_id)
        VALUES
            (NEW.teacher_id, 'withdrawal_debit', NEW.amount, wallet_row.available_balance,
             'Withdrawal to IBAN: ' || NEW.account_iban, NEW.id);

    ELSIF OLD.status = 'pending' AND NEW.status = 'rejected' THEN
        UPDATE teacher_wallet
        SET available_balance = available_balance + NEW.amount
        WHERE teacher_id = NEW.teacher_id
        RETURNING available_balance INTO wallet_row;

        INSERT INTO wallet_transactions
            (teacher_id, type, amount, balance_after, description, reference_id)
        VALUES
            (NEW.teacher_id, 'adjustment', NEW.amount, wallet_row.available_balance,
             'Refunded rejected withdrawal', NEW.id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_withdrawal_processed
    AFTER UPDATE ON withdrawal_requests
    FOR EACH ROW EXECUTE FUNCTION process_withdrawal_request_update();
