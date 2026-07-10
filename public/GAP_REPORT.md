# Virtual Zawiyah Database Schema Audit & Gap Report

This document presents a complete audit of the existing database schema (`schema.sql`) against the system requirements and high-fidelity portal functionalities built across all 8 dashboards (Student, Teacher, Registrar, Supervisor, Content Manager, Finance Officer, Academic Director, Founder).

---

## Section A: Tables Present and Correct

The following tables in `schema.sql` are structurally sound and represent correct core entities, although some columns in Section B require extensions:

1. **`profiles`**
   - **Purpose:** Centralized user profile record linked to Supabase auth.
   - **Correct Columns:** `id` (UUID PK), `email`, `full_name`, `whatsapp`, `country`, `city`, `timezone`, `gender`, `avatar_url`, `created_at`, `updated_at`.
2. **`class_schedules`**
   - **Purpose:** Weekly day and time slots mapping student-teacher matches.
   - **Correct Columns:** `id`, `assignment_id` (FK), `day_of_week`, `start_time`, `duration_minutes`.
3. **`academic_calendar`**
   - **Purpose:** Core calendar lookup for teaching days and holidays.
   - **Correct Columns:** `date` (PK), `is_teaching_day`, `description`.
4. **`attendance_unlock_log`**
   - **Purpose:** Supervisor security audit trail for unlocked attendance logs.
   - **Correct Columns:** `id`, `attendance_id` (FK), `unlocked_by` (FK), `reason`, `unlocked_at`.
5. **`lesson_private_notes`**
   - **Purpose:** Teacher-only notes linked to class records.
   - **Correct Columns:** `lesson_id` (PK, FK), `notes`, `created_at`.
6. **`teacher_wallet`**
   - **Purpose:** Available balance ledger for active faculty.
   - **Correct Columns:** `teacher_id` (PK, FK), `total_earned`, `available_balance`, `total_withdrawn`, `currency`.
7. **`parent_payments`**
   - **Purpose:** Verification portal for parent billing receipts.
   - **Correct Columns:** `id`, `parent_id` (FK), `total_amount`, `currency` (`USD`, `GBP`, `PKR`), `receipt_url`, `reference_number`, `status`, `verified_at`, `created_at`.
8. **`withdrawal_requests`**
   - **Purpose:** Wallet payout workflow for teachers.
   - **Correct Columns:** `id`, `teacher_id` (FK), `amount`, `bank_name`, `account_iban`, `status` (`pending`, `transferred`, `rejected`), `transfer_ref`, `processed_at`, `created_at`.
9. **`wallet_transactions`**
   - **Purpose:** Immutable audit ledger for wallet movements.
   - **Correct Columns:** `id`, `teacher_id` (FK), `type` (`fee_credit`, `withdrawal_debit`, `adjustment`), `amount`, `balance_after`, `description`, `reference_id`, `created_at`.
10. **`exchange_rate_log`**
    - **Purpose:** Currency exchange reference database.
    - **Correct Columns:** `id`, `date`, `usd_to_pkr`, `gbp_to_pkr`, `entered_by_admin_id` (FK).
11. **`disputes`**
    - **Purpose:** Billing conflicts tracking.
    - **Correct Columns:** `id`, `teacher_id` (FK), `fee_payment_id` (FK), `reason`, `status`, `admin_response`, `created_at`.
12. **`notifications`**
    - **Purpose:** Dashboard notification triggers.
    - **Correct Columns:** `id`, `user_id` (FK), `role`, `title`, `message`, `is_read`, `link`, `created_at`.

---

## Section B: Tables Present but Need Modification

The following existing database types and tables contain schema gaps or outdated mappings that contradict the actual system design:

### 1. `user_role` Enum & `profiles` Table
- **Gap:** The existing `user_role` enum (`admin`, `academic_director`, `supervisor`, `teacher`, `student`, `parent`) is missing the dashboard roles built in the UI: **`registrar`**, **`content_manager`**, and **`finance_officer`**. It also lacks the **`founder`** role.
- **Required Modifications:**
  - Update `user_role` enum to include `'registrar'`, `'content_manager'`, `'finance_officer'`, and `'founder'`.
  - Add a nullable `parent_id` UUID column to `profiles` referencing `profiles(id)` to map siblings sharing a single family account.
  - Add a `status` column to `profiles` (`'Active'`, `'Pending Director Approval'`, `'Suspended'`, `'Removed'`) to support the Supervisor's disciplinary states and Teacher removal recommendation flow.

### 2. `enrollment_requests` Table
- **Gap:** Currently lacks fields required for the Registrar's **Smart Teacher Matchmaker** interface.
- **Required Modifications:**
  - Add `student_gender` (TEXT) and `student_timezone` (TEXT) columns.
  - Add a `preferred_schedule` (JSONB) column to store candidate time slots.
  - Add a `course_type` (TEXT CHECK `course_type IN ('1:1', 'group')`) column to filter placement strategies.

### 3. `attendance_logs` Table
- **Gap:** Assumes all sessions are 1:1 and links directly to one student. Group courses attendance marked by teachers cannot be mapped to group entities.
- **Required Modifications:**
  - Add `class_type` (TEXT CHECK `class_type IN ('1:1', 'group')`) column.
  - Add a nullable `group_class_id` UUID column referencing a new `group_classes` table.

### 4. `lesson_logs` Table
- **Gap:** Only supports standard academic summaries (`topic_covered`, `next_plan`), leaving Hifz students (e.g. Ahmed Bilal) without their mandatory 3 Quranic memory logs.
- **Required Modifications:**
  - Add `log_type` (TEXT CHECK `log_type IN ('hifz', 'standard')`) column.
  - Add nullable Hifz fields: `sabaq` (TEXT), `sabaqi` (TEXT), `manzil` (TEXT).

### 5. `fee_payments` Table
- **Gap:** Currently links payments to a parent master ID but lacks any columns to register student payment extensions (deferrals) approved by the Finance Officer.
- **Required Modifications:**
  - Create a separate `fee_deferrals` table (Section C) or add columns: `deferral_requested` (BOOLEAN), `deferral_date` (DATE), `deferral_reason` (TEXT), `deferral_status` (TEXT).

### 6. `trial_requests` Table
- **Gap:** Lacks linking parameters to support conversion to active student state by the Registrar.
- **Required Modifications:**
  - Ensure student/teacher linkages can support transition flags.

---

## Section C: Tables Completely Missing

The following tables are entirely absent from `schema.sql` but are required to store dashboard records and state changes:

### 1. Curriculum & Course Catalog Tables
* **`courses`**
  - **Purpose:** Public courses details and tuition fee configurations managed by the Content Manager.
  - **Columns:** `id` (UUID PK), `title` (TEXT), `program_type` (TEXT: `'1:1'`, `'group'`), `base_fee` (NUMERIC), `currency` (TEXT), `duration_months` (INT), `active` (BOOLEAN), `created_at` (TIMESTAMPTZ).
* **`darse_nizami_curriculum`**
  - **Purpose:** Classical course syllabus mapping (Years 1 to 8) and textbook file downloads.
  - **Columns:** `id` (UUID PK), `year_level` (INT CHECK 1-8), `subject_title` (TEXT), `book_name` (TEXT), `pdf_file_url` (TEXT), `created_at` (TIMESTAMPTZ).

### 2. Group Classes Tables
* **`group_classes`**
  - **Purpose:** Live group program classes (Dars-e-Nizami / Tajweed) managed by supervisors.
  - **Columns:** `id` (UUID PK), `course_id` (UUID FK), `teacher_id` (UUID FK), `class_name` (TEXT), `year_level` (INT), `max_capacity` (INT DEFAULT 25), `enrolled_count` (INT DEFAULT 0), `created_at` (TIMESTAMPTZ).
* **`group_class_enrollments`**
  - **Purpose:** Roster linking students to group class slots.
  - **Columns:** `id` (UUID PK), `group_class_id` (UUID FK), `student_id` (UUID FK), `enrolled_at` (TIMESTAMPTZ), `UNIQUE(group_class_id, student_id)`.

### 3. Deferrals Table
* **`fee_deferrals`**
  - **Purpose:** Tuition extension requests submitted by students and validated by the Finance Officer.
  - **Columns:** `id` (UUID PK), `fee_payment_id` (UUID FK), `requested_date` (DATE), `reason` (TEXT), `status` (TEXT CHECK `'pending'`, `'approved'`, `'rejected'`), `reviewed_by` (UUID FK), `created_at` (TIMESTAMPTZ).

### 4. Leaves & Makeup Sessions Tables
* **`leave_requests`**
  - **Purpose:** Student, teacher, and non-teaching staff leave requests. Implements the teacher 12-hour application deadline rule.
  - **Columns:** `id` (UUID PK), `requester_id` (UUID FK), `role` (TEXT), `start_date` (DATE), `end_date` (DATE), `reason` (TEXT), `status` (TEXT CHECK `'pending'`, `'approved'`, `'rejected'`), `approved_by` (UUID FK), `created_at` (TIMESTAMPTZ).
* **`makeup_requests`**
  - **Purpose:** Schedules substitute classes for missed logs, approved by supervisors or matched by the Registrar.
  - **Columns:** `id` (UUID PK), `original_attendance_id` (UUID FK), `student_id` (UUID FK), `teacher_id` (UUID FK), `proposed_date` (DATE), `proposed_time` (TIME), `status` (TEXT CHECK `'pending'`, `'scheduled'`, `'completed'`, `'cancelled'`), `created_at` (TIMESTAMPTZ).

### 5. Non-Teaching Staff & Payroll Tables
* **`non_teaching_staff`**
  - **Purpose:** System database for office boys, guards, cleaners, and other administrators reviewed by the Director.
  - **Columns:** `id` (UUID PK), `name` (TEXT), `role` (TEXT: `'Security Guard'`, `'Office Boy'`, `'Cleaner'`, `'Supervisor'`, etc.), `contact` (TEXT), `joining_date` (DATE), `base_salary_pkr` (NUMERIC), `status` (TEXT: `'Active'`, `'Removed'`), `termination_reason` (TEXT), `created_at` (TIMESTAMPTZ).
* **`payroll_disbursements`**
  - **Purpose:** Monthly salary disbursements processed by the Finance Officer.
  - **Columns:** `id` (UUID PK), `recipient_id` (UUID FK), `recipient_type` (TEXT: `'teacher'`, `'staff'`), `month_year` (TEXT), `base_amount` (NUMERIC), `adjustments` (NUMERIC), `final_payout` (NUMERIC), `status` (TEXT: `'Processing'`, `'Paid'`), `payment_date` (TIMESTAMPTZ), `voucher_url` (TEXT), `created_at` (TIMESTAMPTZ).
* **`expenses_log`**
  - **Purpose:** Log of utility expenses, printing, building rents, and pantry refreshments maintained by the Finance Officer.
  - **Columns:** `id` (UUID PK), `category` (TEXT), `amount_pkr` (NUMERIC), `description` (TEXT), `receipt_url` (TEXT), `logged_by` (UUID FK), `created_at` (TIMESTAMPTZ).

### 6. Announcements Table
* **`announcements`**
  - **Purpose:** Targeting announcement banners configured by the Content Manager.
  - **Columns:** `id` (UUID PK), `title` (TEXT), `content` (TEXT), `applies_to` (TEXT: `'all'`, `'1:1'`, `'group'`), `start_date` (DATE), `end_date` (DATE), `published_by` (UUID FK), `created_at` (TIMESTAMPTZ).

### 7. Jitsi Classroom Sessions Table
* **`classroom_sessions`**
  - **Purpose:** Session metadata logs for self-hosted Jitsi conference rooms and class recordings.
  - **Columns:** `id` (UUID PK), `class_type` (TEXT), `meeting_id` (TEXT), `start_time` (TIMESTAMPTZ), `end_time` (TIMESTAMPTZ), `recording_url` (TEXT), `created_at` (TIMESTAMPTZ).

### 8. Audit Logs Table
* **`security_audit_logs`**
  - **Purpose:** Security trails tracking logins, administrative overrides, and client IP addresses.
  - **Columns:** `id` (UUID PK), `profile_id` (UUID FK), `event_type` (TEXT), `ip_address` (TEXT), `user_agent` (TEXT), `details` (TEXT), `created_at` (TIMESTAMPTZ).

---

## Section D: Tables Present but No Longer Needed

- **None.** All original tables represent valid entities in the system. Rather than deleting tables, the schema requires substantial expansion to support role permissions, group classes, curriculum records, payroll logs, and user security audits.
