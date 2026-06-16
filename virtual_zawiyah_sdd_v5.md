# Virtual Zawiyah
### Public Website + Internal Platform
> For implementation by any professional developer – no ambiguity

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack-mandatory)
3. [Public Website (Landing + Enrollment)](#3-public-website-landing--enrollment)
4. [Complete Database Schema](#4-complete-database-schema-with-all-fixes)
5. [Row Level Security Policies](#5-row-level-security-policies-included-in-schema)
6. [Triggers](#6-triggers-included-in-schema)
7. [Frontend Page Structure](#7-frontend-page-structure-nextjs-14-app-router)
8. [Critical Code Examples](#8-critical-code-examples)
   - [8.1 Middleware for Route Protection](#81-middleware-for-route-protection)
   - [8.2 File Upload (Receipt) Example](#82-file-upload-for-fee-receipt)
   - [8.3 Pro-rated Teacher Split](#83-pro-rated-teacher-split-edge-function--admin-ui)
   - [8.4 Attendance Auto-Lock Cron Job](#84-attendance-auto-lock-cron-job)
   - [8.5 Enrollment → User Account Creation](#85-enrollment--user-account-creation-edge-function)
9. [Environment Variables](#9-environment-variables-envlocal)
10. [Developer Setup Instructions](#10-developer-setup-instructions)
11. [Testing Checklist](#11-testing-checklist)
12. [Deployment](#12-deployment)
13. [Additional Notes](#13-additional-notes)

---

## 1. Project Overview

Virtual Zawiyah has two parts:

- **Public website** – Landing, courses, enrollment, trial request, contact.
- **Internal platform** – Role dashboards (Admin, Teacher, Student, Parent) with attendance, lesson logs, fee collection (10% hidden commission), teacher wallet, withdrawals (semi-automatic), Jitsi Meet integration, and pro-rated teacher changes.

---

## 2. Technology Stack (Mandatory)

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Backend (BaaS) | Supabase (PostgreSQL, Auth, Storage) |
| Video | Jitsi Meet (meet.jit.si or self-hosted) |
| Hosting | Vercel (frontend) + Supabase (database) |
| Payment | Manual bank transfer (admin verifies receipts) |

---

## 3. Public Website (Landing + Enrollment)

### Pages (No Auth Required)

| Route | Purpose |
|---|---|
| `/` | Landing page with hero, features, courses highlights |
| `/courses` | List of courses (Quran, Tajweed, Hifz, Arabic, Islamic sciences) |
| `/about` | Mission, vision, teacher profiles (static) |
| `/pricing` | Monthly fee plans (USD/GBP) |
| `/enrollment` | Enrollment form – inserts into `enrollment_requests` |
| `/trial-request` | Trial class request – inserts into `trial_requests` (`student_id` optional) |
| `/contact` | Contact form (optional, can email) |

### Enrollment Workflow (Fully Specified)

1. User submits enrollment form → row created in `enrollment_requests` with `status = 'pending'`.
2. Admin dashboard shows pending enrollment requests.
3. Admin reviews and can click **"Create Account"** button (custom admin UI), which calls a Supabase Edge Function or performs these steps:
   - Creates a Supabase Auth user using `parent_email` and a random temporary password.
   - Inserts a profile with `role = 'student'` and `full_name = student_name`.
   - Sends an email to the parent with login credentials (Supabase email template).
   - Updates `enrollment_requests.status = 'enrolled'` and links to the new `student_id`.
   - Alternatively, admin creates user manually (fallback).
4. New student can log in and see their dashboard.

> Edge Function code is provided in [Section 8.5](#85-enrollment--user-account-creation-edge-function).

---

## 4. Complete Database Schema (with all fixes)

Run the entire script below in the **Supabase SQL Editor**. It includes:

- All tables (including `enrollment_requests`)
- Missing indexes (e.g., on `enrollment_requests.status`)
- `updated_at` trigger for `profiles`
- All RLS policies
- All triggers (commission, withdrawal, fee verification)

```sql
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
```

---

## 5. Row Level Security Policies (included in schema)

All RLS policies are included in the SQL script above. They ensure:

- Users can only access their own data.
- Admin has full access to all tables.
- Public (unauthenticated) users can insert enrollment and trial requests.

```sql
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
```

---

## 6. Triggers (included in schema)

All triggers are included in the SQL script above:

| Trigger | Table | Purpose |
|---|---|---|
| `trg_profiles_updated_at` | `profiles` | Auto-updates `updated_at` timestamp |
| `trg_parent_payment_verified` | `parent_payments` | Cascades verification to child `fee_payments` |
| `trg_fee_verified` | `fee_payments` | Calculates 10% commission, credits teacher wallet |
| `trg_withdrawal_requested` | `withdrawal_requests` | Reserves balance immediately on insert |
| `trg_withdrawal_processed` | `withdrawal_requests` | Finalizes or refunds withdrawal on status update |

```sql
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

CREATE TRIGGER trg_parent_payment_verified
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

CREATE TRIGGER trg_fee_verified
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

CREATE TRIGGER trg_withdrawal_requested
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

CREATE TRIGGER trg_withdrawal_processed
    AFTER UPDATE ON withdrawal_requests
    FOR EACH ROW EXECUTE FUNCTION process_withdrawal_request_update();

SELECT 'All tables, policies, and triggers created successfully.' AS status;
```

---

## 7. Frontend Page Structure (Next.js 14 App Router)

### Public Routes (no auth)

```
app/
├── page.js
├── courses/page.js
├── about/page.js
├── pricing/page.js
├── enrollment/page.js
├── trial-request/page.js
├── contact/page.js
├── layout.js
└── globals.css
```

### Authenticated Routes

```
app/
├── login/page.js
├── middleware.js
│
├── teacher/
│   ├── dashboard/page.js
│   ├── attendance/page.js
│   ├── wallet/page.js
│   └── settings/page.js
│
├── student/
│   ├── dashboard/page.js
│   └── fee-payment/page.js
│
├── parent/
│   ├── dashboard/page.js
│   └── payments/page.js
│
├── admin/
│   ├── dashboard/page.js
│   ├── fee-verification/page.js
│   ├── withdrawals/page.js
│   ├── assignments/page.js     ← includes pro-rated split UI
│   ├── enrollment-requests/page.js
│   └── calendar/page.js
│
└── lib/
    └── supabaseClient.js
```

---

## 8. Critical Code Examples

### 8.1 Middleware for Route Protection

**File:** `middleware.js` (project root)

```javascript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { user } } = await supabase.auth.getUser()

  const publicPaths = [
    '/', '/courses', '/about', '/pricing',
    '/enrollment', '/trial-request', '/contact', '/login'
  ]
  const isPublicPath = publicPaths.includes(req.nextUrl.pathname)

  if (!user && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role
    const path = req.nextUrl.pathname

    if (path.startsWith('/teacher') && role !== 'teacher')
      return NextResponse.redirect(new URL('/dashboard', req.url))
    if (path.startsWith('/student') && role !== 'student')
      return NextResponse.redirect(new URL('/dashboard', req.url))
    if (path.startsWith('/parent') && role !== 'parent')
      return NextResponse.redirect(new URL('/dashboard', req.url))
    if (path.startsWith('/admin') && role !== 'admin')
      return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}
```

---

### 8.2 File Upload for Fee Receipt

**File:** `app/student/fee-payment/page.js` (excerpt)

```javascript
const uploadReceipt = async (file) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('receipts')
    .upload(`public/${fileName}`, file)

  if (error) throw error
  return data.path
}

// In submit handler:
const receiptUrl = await uploadReceipt(receiptFile)
```

---

### 8.3 Pro-rated Teacher Split (Edge Function + Admin UI)

**Admin UI logic:**

1. When admin reassigns a student (update `teacher_student_assignments` — set `end_date` on old row, create new `is_active` row), check if the current month fee exists and is already paid.
2. If paid, calculate the split:
   - `total_days` = days in month (e.g., 30)
   - `old_days` = days from 1st of month to reassignment date
   - `new_days` = `total_days − old_days`
   - Old teacher keeps `(old_days / total_days) × fee_amount`
   - New teacher receives `(new_days / total_days) × fee_amount`
3. Show preview: *"Old teacher will transfer PKR X to new teacher."*
4. On confirm, call Edge Function:

```javascript
// Supabase Edge Function: prorate-adjust
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  const {
    student_id,
    old_teacher_id,
    new_teacher_id,
    month_year,
    reassign_date
  } = req.body

  // Calculate shares
  // Insert adjustment wallet_transactions:
  //   - Old teacher: negative amount (deduct from available_balance)
  //   - New teacher: positive amount (credit to available_balance)
  // Both recorded with type = 'adjustment'

  return res.json({ success: true })
}
```

> **MVP simplification:** Admin manually creates adjustment transactions via a simple form in the admin panel.

---

### 8.4 Attendance Auto-Lock Cron Job

#### Option A – Vercel Cron Jobs (Vercel Pro)

**File:** `app/api/cron/lock-attendance/route.js`

```javascript
import { createClient } from '@supabase/supabase-js'

export async function GET(req) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  await supabase.rpc('lock_old_attendance') // SQL function to be created
  return new Response('OK')
}
```

**File:** `vercel.json`

```json
{
  "crons": [
    { "path": "/api/cron/lock-attendance", "schedule": "0 0 * * *" }
  ]
}
```

#### Option B – Supabase pg_cron (Supabase Pro)

```sql
SELECT cron.schedule(
  'lock-attendance',
  '0 0 * * *',
  $$
    UPDATE attendance_logs
    SET locked = TRUE
    WHERE class_date < (CURRENT_DATE - INTERVAL '1 day')
      AND locked = FALSE;
  $$
);
```

> **Free tier fallback:** Use a free cron service such as [cron-job.org](https://cron-job.org) to hit a public API endpoint that triggers the update.

---

### 8.5 Enrollment → User Account Creation (Edge Function)

**Edge Function:** `create-user-from-enrollment`

```javascript
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  const {
    enrollment_id,
    parent_email,
    student_name,
    temporary_password
  } = req.body

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // 1. Create auth user
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: parent_email,
    password: temporary_password,
    email_confirm: true,
    user_metadata: { full_name: student_name }
  })
  if (authError) return res.status(400).json({ error: authError.message })

  // 2. Create profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert([{
      id: authUser.user.id,
      email: parent_email,
      full_name: student_name,
      role: 'student'
    }])
  if (profileError) return res.status(400).json({ error: profileError.message })

  // 3. Mark enrollment as complete
  await supabase
    .from('enrollment_requests')
    .update({ status: 'enrolled' })
    .eq('id', enrollment_id)

  // 4. Send email with credentials (Supabase built-in email or Resend)

  return res.json({ success: true })
}
```

Admin calls this function from the admin panel.

---

## 9. Environment Variables (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_JITSI_DOMAIN=meet.jit.si
```

> `SUPABASE_SERVICE_ROLE_KEY` is used exclusively for cron jobs and admin Edge Functions. Never expose it client-side.

---

## 10. Developer Setup Instructions

1. Clone the repo and run `npm install`.
2. Create a new Supabase project (free tier is sufficient to start).
3. Run the complete SQL schema from [Section 4](#4-complete-database-schema-with-all-fixes) in the Supabase SQL Editor.
4. Disable email confirmation: **Supabase → Authentication → Providers → Email → toggle OFF**.
5. Create a storage bucket named **`receipts`** (set Public = false). RLS policies are already included in the SQL.
6. Add the environment variables to `.env.local`.
7. Run `npm run dev` and visit `http://localhost:3000`.

---

## 11. Testing Checklist

- [ ] Public pages load: `/`, `/courses`, `/enrollment`, etc.
- [ ] Enrollment form inserts a row into `enrollment_requests`.
- [ ] Admin can see pending enrollments and create a user account (Edge Function or manual).
- [ ] New student can log in.
- [ ] Admin assigns student to teacher (`teacher_student_assignments`).
- [ ] Teacher dashboard shows assigned student.
- [ ] Teacher marks attendance + lesson logs → saved correctly.
- [ ] Attendance locks after 24 hours (cron test).
- [ ] Admin verifies a fee payment → teacher wallet receives 90%, commission recorded.
- [ ] Teacher requests withdrawal → balance reserved, admin sees request.
- [ ] Admin marks `transferred` → wallet finalizes.
- [ ] Parent pays for multiple children → admin enters PKR per child, sum matches total.
- [ ] Teacher reassigned mid-month → pro-rated adjustment works (manual or Edge Function).

---

## 12. Deployment

| Component | Platform |
|---|---|
| Frontend | Vercel (connect GitHub repo, set env vars) |
| Database | Supabase (already hosted) |
| Cron Jobs | Vercel Cron Jobs **or** Supabase pg_cron |

---

## 13. Additional Notes

| Topic | Detail |
|---|---|
| **Currency conversion** | Manual only. Admin enters PKR amount when verifying fees. No automatic exchange rate APIs. |
| **Commission visibility** | Hidden from teachers. The 10% deduction is never displayed on the teacher dashboard. |
| **Withdrawals** | Semi-automatic. Teacher requests → admin transfers manually → marks as `transferred`. |
| **Jitsi room access** | Only teachers and their assigned students see the "Join Class" button. Room name format: `virtual-zawiyah-teacher-{teacher_id}`. No public exposure. |
| **Parent payment split** | Admin enters PKR amount for each child on the verification page. The sum must equal the total receipt amount — system validates before saving. |
| **Timestamps** | All stored as UTC (`TIMESTAMPTZ`). Frontend converts to local time using `timezone` from the user's `profiles` row. |
