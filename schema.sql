-- ============================================
-- VIRTUAL ZAWIYAH v3.0 – FULL DATABASE SCHEMA
-- Includes public enrollment + internal platform
-- ============================================

-- Enums
CREATE TYPE user_role AS ENUM ('admin', 'academic_director', 'supervisor', 'teacher', 'student', 'parent');
CREATE TYPE payment_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE withdrawal_status AS ENUM ('pending', 'transferred', 'rejected');
CREATE TYPE dispute_status AS ENUM ('pending', 'resolved', 'rejected');

-- ─────────────────────────────────────────────
-- Profiles
-- ─────────────────────────────────────────────
CREATE TABLE profiles (
    id          UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email       TEXT UNIQUE NOT NULL,
    full_name   TEXT NOT NULL,
    role        user_role NOT NULL DEFAULT 'student',
    whatsapp    TEXT,
    country     TEXT,
    city        TEXT,
    timezone    TEXT DEFAULT 'UTC',
    gender      TEXT CHECK (gender IN ('male', 'female')),
    avatar_url  TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

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
                             CHECK (status IN ('pending', 'reviewed', 'enrolled', 'rejected')),
    assigned_teacher_id  UUID REFERENCES profiles(id),
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
    id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    student_id UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    class_date DATE DEFAULT CURRENT_DATE NOT NULL,
    status     TEXT CHECK (status IN ('present', 'absent', 'leave')) NOT NULL,
    locked     BOOLEAN DEFAULT FALSE NOT NULL,
    notes      TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
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
    id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id   UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    student_id   UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    class_date   DATE DEFAULT CURRENT_DATE NOT NULL,
    topic_covered TEXT NOT NULL,
    next_plan    TEXT NOT NULL,
    performance  TEXT CHECK (performance IN ('excellent', 'good', 'average', 'needs_improvement')) NOT NULL,
    created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
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
    currency          TEXT DEFAULT 'PKR' NOT NULL
);

-- ─────────────────────────────────────────────
-- Parent Payments (master receipt)
-- ─────────────────────────────────────────────
CREATE TABLE parent_payments (
    id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id        UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    total_amount     NUMERIC(10, 2) NOT NULL,
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
    original_currency TEXT NOT NULL CHECK (original_currency IN ('USD', 'GBP', 'PKR')),
    original_amount   NUMERIC(10, 2) NOT NULL,
    pkr_amount        NUMERIC(12, 2),
    commission_amount NUMERIC(12, 2),
    teacher_amount    NUMERIC(12, 2),
    status            payment_status DEFAULT 'pending' NOT NULL,
    receipt_url       TEXT,
    reference_number  TEXT,
    verified_at       TIMESTAMPTZ,
    created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_student_month UNIQUE (student_id, month_year)
);
CREATE INDEX idx_fee_payments_status ON fee_payments(status);
CREATE INDEX idx_fee_payments_teacher ON fee_payments(teacher_id);
CREATE INDEX idx_fee_payments_student_month ON fee_payments(student_id, month_year);

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
    id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id   UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    type         TEXT CHECK (type IN ('fee_credit', 'withdrawal_debit', 'adjustment')) NOT NULL,
    amount       NUMERIC(12, 2) NOT NULL,
    balance_after NUMERIC(12, 2) NOT NULL,
    description  TEXT NOT NULL,
    reference_id UUID,
    created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_wallet_transactions_teacher_created ON wallet_transactions(teacher_id, created_at DESC);

-- ─────────────────────────────────────────────
-- Exchange Rate Log (audit only)
-- ─────────────────────────────────────────────
CREATE TABLE exchange_rate_log (
    id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date               DATE DEFAULT CURRENT_DATE NOT NULL,
    usd_to_pkr         NUMERIC(8, 2) NOT NULL,
    gbp_to_pkr         NUMERIC(8, 2) NOT NULL,
    entered_by_admin_id UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    created_at         TIMESTAMPTZ DEFAULT NOW() NOT NULL
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
    id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
    teacher_id     UUID REFERENCES profiles(id) ON DELETE RESTRICT,
    student_name   TEXT,
    parent_email   TEXT,
    requested_date DATE NOT NULL,
    status         TEXT CHECK (status IN ('pending', 'scheduled', 'completed', 'cancelled'))
                       DEFAULT 'pending' NOT NULL,
    class_link     TEXT,
    feedback       TEXT,
    created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_trial_requests_status ON trial_requests(status);

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
-- RLS: Profiles
-- ─────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile"   ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Admin can read all profiles"  ON profiles FOR SELECT
    USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- ─────────────────────────────────────────────
-- RLS: Enrollment Requests
-- ─────────────────────────────────────────────
ALTER TABLE enrollment_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert enrollment" ON enrollment_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can read enrollment"    ON enrollment_requests FOR SELECT
    USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admin can update enrollment"  ON enrollment_requests FOR UPDATE
    USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- ─────────────────────────────────────────────
-- RLS: Attendance Logs
-- ─────────────────────────────────────────────
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY teacher_owns_attendance    ON attendance_logs        USING (teacher_id = auth.uid());
CREATE POLICY student_reads_own_attendance ON attendance_logs FOR SELECT USING (student_id = auth.uid());
CREATE POLICY admin_all_attendance       ON attendance_logs
    USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- ─────────────────────────────────────────────
-- RLS: Lesson Logs
-- ─────────────────────────────────────────────
ALTER TABLE lesson_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY teacher_owns_lesson      ON lesson_logs        USING (teacher_id = auth.uid());
CREATE POLICY student_reads_own_lesson ON lesson_logs FOR SELECT USING (student_id = auth.uid());
CREATE POLICY admin_all_lesson         ON lesson_logs
    USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- ─────────────────────────────────────────────
-- RLS: Private Notes
-- ─────────────────────────────────────────────
ALTER TABLE lesson_private_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY teacher_owns_private_note ON lesson_private_notes
    USING (EXISTS (
        SELECT 1 FROM lesson_logs
        WHERE lesson_logs.id = lesson_id
          AND lesson_logs.teacher_id = auth.uid()
    ));
CREATE POLICY admin_all_private_note ON lesson_private_notes
    USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- ─────────────────────────────────────────────
-- RLS: Teacher Wallet
-- ─────────────────────────────────────────────
ALTER TABLE teacher_wallet ENABLE ROW LEVEL SECURITY;
CREATE POLICY teacher_read_own_wallet ON teacher_wallet FOR SELECT USING (teacher_id = auth.uid());
CREATE POLICY admin_all_wallet        ON teacher_wallet
    USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- ─────────────────────────────────────────────
-- RLS: Withdrawal Requests
-- ─────────────────────────────────────────────
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY teacher_manage_own_withdrawals ON withdrawal_requests USING (teacher_id = auth.uid());
CREATE POLICY admin_all_withdrawals          ON withdrawal_requests
    USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- ─────────────────────────────────────────────
-- RLS: Fee Payments
-- ─────────────────────────────────────────────
ALTER TABLE fee_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY student_read_own_fee ON fee_payments FOR SELECT USING (student_id = auth.uid());
CREATE POLICY admin_all_fee        ON fee_payments
    USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- ─────────────────────────────────────────────
-- RLS: Parent Payments
-- ─────────────────────────────────────────────
ALTER TABLE parent_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY parent_own_payments       ON parent_payments USING (parent_id = auth.uid());
CREATE POLICY admin_all_parent_payments ON parent_payments
    USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- ─────────────────────────────────────────────
-- RLS: Trial Requests
-- ─────────────────────────────────────────────
ALTER TABLE trial_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert trial request"        ON trial_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Teacher can read own trial requests"    ON trial_requests FOR SELECT
    USING (teacher_id = auth.uid());
CREATE POLICY "Admin all trial requests"               ON trial_requests
    USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- ─────────────────────────────────────────────
-- RLS: Notifications
-- ─────────────────────────────────────────────
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_read_own_notifications ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY admin_all_notifications     ON notifications
    USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- ─────────────────────────────────────────────
-- Trigger 1: Parent payment verified → update child fees
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

-- ─────────────────────────────────────────────
-- Trigger 2: Fee verified → commission + wallet credit
-- ─────────────────────────────────────────────
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

        INSERT INTO notifications (user_id, role, title, message)
        VALUES (NEW.teacher_id, 'teacher', 'Fee Payment Credited',
                'PKR ' || NEW.teacher_amount || ' added to wallet.');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_fee_verified
    BEFORE UPDATE ON fee_payments
    FOR EACH ROW EXECUTE FUNCTION process_verified_fee();

-- ─────────────────────────────────────────────
-- Trigger 3: Withdrawal request → reserve balance
-- ─────────────────────────────────────────────
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

-- ─────────────────────────────────────────────
-- Trigger 4: Withdrawal processed → finalize or refund
-- ─────────────────────────────────────────────
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

        INSERT INTO notifications (user_id, role, title, message)
        VALUES (NEW.teacher_id, 'teacher', 'Withdrawal Processed',
                'PKR ' || NEW.amount || ' sent.');

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

        INSERT INTO notifications (user_id, role, title, message)
        VALUES (NEW.teacher_id, 'teacher', 'Withdrawal Rejected', 'Funds returned to wallet.');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_withdrawal_processed
    AFTER UPDATE ON withdrawal_requests
    FOR EACH ROW EXECUTE FUNCTION process_withdrawal_request_update();
