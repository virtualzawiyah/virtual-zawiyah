# VIRTUAL ZAWIYAH DATABASE SCHEMA GUIDE (v3.0)

This guide provides a comprehensive reference manual for the Virtual Zawiyah PostgreSQL database schema (`schema.sql`). It details the schema architecture, entity relationships, Row Level Security (RLS) configurations, trigger operations, and core operational constraints.

---

## 1. GENERAL OPERATIONAL RULES

- **Operational Day Boundary:** The database day boundary rolls over at **07:00 AM Pakistan Standard Time (PST)** to align with international timezone coordinates for students in North America/Europe and teachers in Pakistan, rather than at midnight.
- **Base Currencies:** Student tuition invoices and parent payments are calculated and stored in **USD**, while all staff salaries, teacher wallets, and local academy expenses are managed strictly in **PKR**.

---

## 2. TABLE DIRECTORY & ENTITY RELATIONSHIPS

The database consists of **31 tables** structured to map the various user roles and system resources.

| Table Name | Description / Plain Language Purpose | Primary & Foreign Keys |
| :--- | :--- | :--- |
| **`profiles`** | Master profile repository for all registered users, linked to Supabase authentication. | `id` (PK, references auth.users), `parent_id` (FK references `profiles.id` for sibling groups) |
| **`courses`** | Catalog of academic courses and base pricing configurations. | `id` (PK) |
| **`darse_nizami_curriculum`** | Book syllabus registry for the 8-Year Dars-e-Nizami program, containing textbook PDF locations. | `id` (PK) |
| **`group_classes`** | Roster cohorts for group programs (e.g. Dars-e-Nizami or Tajweed courses). | `id` (PK), `course_id` (FK references `courses`), `teacher_id` (FK references `profiles`) |
| **`group_class_enrollments`** | Cohort assignments allocating individual students to group classes. | `id` (PK), `group_class_id` (FK references `group_classes`), `student_id` (FK references `profiles`) |
| **`enrollment_requests`** | Intake portal submissions for prospective students (trials and full admissions). | `id` (PK), `preferred_teacher_id` (FK references `profiles`), `assigned_teacher_id` (FK references `profiles`) |
| **`teacher_student_assignments`** | Active matching registry linking students to 1:1 teachers. | `id` (PK), `teacher_id` (FK references `profiles`), `student_id` (FK references `profiles`) |
| **`class_schedules`** | Weekly schedule slots (day, start time, and duration) assigned to active student-teacher pairs. | `id` (PK), `assignment_id` (FK references `teacher_student_assignments`) |
| **`academic_calendar`** | Repository tracking institutional holidays, teaching days, and scheduling exceptions. | `date` (PK) |
| **`attendance_logs`** | Daily log tracking student session attendance status (`present`, `absent`, `leave`). | `id` (PK), `teacher_id` (FK references `profiles`), `student_id` (FK references `profiles`), `group_class_id` (FK references `group_classes`) |
| **`attendance_unlock_log`** | Audit trail recording Supervisor authorization for modifying locked attendance logs. | `id` (PK), `attendance_id` (FK references `attendance_logs`), `unlocked_by` (FK references `profiles`) |
| **`lesson_logs`** | Daily class reports tracking student topic progress, assignments, and Hifz memory metrics. | `id` (PK), `teacher_id` (FK references `profiles`), `student_id` (FK references `profiles`) |
| **`lesson_private_notes`** | Teacher-only note cards attached to lesson reports for internal recording. | `lesson_id` (PK, FK references `lesson_logs`) |
| **`teacher_wallet`** | Ledger balance tracker tracking teacher credit, available balance, and withdrawals. | `teacher_id` (PK, FK references `profiles`) |
| **`parent_payments`** | Verification invoices submitted by parents when uploading fee transaction receipts. | `id` (PK), `parent_id` (FK references `profiles`) |
| **`fee_payments`** | Individual student monthly tuition payment records and processing status. | `id` (PK), `parent_payment_id` (FK references `parent_payments`), `student_id` (FK references `profiles`), `teacher_id` (FK references `profiles`) |
| **`fee_deferrals`** | Date extension requests filed by parents/students to bypass fee deadlines. | `id` (PK), `fee_payment_id` (FK references `fee_payments`), `reviewed_by` (FK references `profiles`) |
| **`leave_requests`** | Absence applications filed by students, teachers, or non-teaching administrators. | `id` (PK), `requester_id` (FK references `profiles`), `approved_by` (FK references `profiles`) |
| **`makeup_requests`** | Substitution logs linking original missed classes to proposed replacement times. | `id` (PK), `original_attendance_id` (FK references `attendance_logs`), `student_id` (FK references `profiles`), `teacher_id` (FK references `profiles`) |
| **`withdrawal_requests`** | Cash disbursement requests filed by teachers to process wallet balances to bank accounts. | `id` (PK), `teacher_id` (FK references `profiles`) |
| **`wallet_transactions`** | Immutable financial audit ledger recording credits and debits from teacher wallets. | `id` (PK), `teacher_id` (FK references `profiles`), `reference_id` (generic UUID FK) |
| **`exchange_rate_log`** | Historical exchange rate conversions entered manually by administrators. | `id` (PK), `entered_by_admin_id` (FK references `profiles`) |
| **`disputes`** | Conflict forms filed by teachers regarding wallet transaction inaccuracies. | `id` (PK), `teacher_id` (FK references `profiles`), `fee_payment_id` (FK references `fee_payments`) |
| **`trial_requests`** | Tracker mapping trial scheduling, class links, and conversions to active student statuses. | `id` (PK), `student_id` (FK references `profiles`), `teacher_id` (FK references `profiles`), `converted_student_id` (FK references `profiles`) |
| **`non_teaching_staff`** | Employee directory for utility administrators, guards, cleaners, and supervisor payrolls. | `id` (PK) |
| **`payroll_disbursements`** | Record of monthly salary payments processed for teachers and support staff. | `id` (PK), `recipient_id` (FK references `profiles`) |
| **`expenses_log`** | Ledger tracking pantry refreshments, office printing, building rents, and utility logs. | `id` (PK), `logged_by` (FK references `profiles`) |
| **`announcements`** | System announcement alerts configured for dashboard overlays. | `id` (PK), `published_by` (FK references `profiles`) |
| **`classroom_sessions` | Jitsi classrooms WebRTC conference logs and lesson video file URLs. | `id` (PK) |
| **`security_audit_logs`** | Security audit trails tracking login events, client IP addresses, and administrative status changes. | `id` (PK), `profile_id` (FK references `profiles`) |
| **`notifications`** | Target notification inbox messages rendered across role dashboards. | `id` (PK), `user_id` (FK references `profiles`) |

---

## 3. ROW LEVEL SECURITY (RLS) POLICY MATRIX

All database tables have Row Level Security enabled. Below is the access authorization matrix across user groups.

### RLS Policies by Role
1. **Founder:**
   - Possesses complete database superuser status (bypass/full access) on all tables.
   - The only role authorized to select from `security_audit_logs`.
2. **Academic Director:**
   - Authorized to read all tables.
   - Authorized to insert/update profiles in the directory, change profile statuses, and manage the `non_teaching_staff` employee roster.
3. **Supervisor:**
   - Authorized to read and write profiles and academic logs (attendance, lesson progress, schedules) for their assigned teachers and students.
   - Can approve/decline admissions and process attendance unlocks.
4. **Registrar:**
   - Authorized to select from `enrollment_requests` and `trial_requests`.
   - Can select and insert student/teacher profiles and manage class assignments and weekly schedules.
5. **Content Manager:**
   - Can read and write to the catalog tables: `courses`, `darse_nizami_curriculum`, and `announcements`.
6. **Finance Officer:**
   - Can read and write to financial tables: `fee_payments`, `fee_deferrals`, `parent_payments`, `withdrawal_requests`, `wallet_transactions`, `payroll_disbursements`, and `expenses_log`.
   - Restrained from modifying teacher assignments, schedules, or lesson content.
7. **Teacher:**
   - Restricted to selecting/updating their own profile.
   - Can select, insert, and update `attendance_logs`, `lesson_logs`, and `lesson_private_notes` where `teacher_id = auth.uid()`.
   - Can view student profile details only for students currently assigned to them in `teacher_student_assignments`.
   - Can view and manage their own `teacher_wallet` ledger and file `withdrawal_requests`.
8. **Student / Parent:**
   - Student can only view their own profile, assignments, lesson logs, attendance record, and active fee payments.
   - Parent can view their own billing history and the academic logs of their associated children (where `profiles.parent_id = parent_id`).
9. **Public (Unauthenticated):**
   - Can only read:
     - `courses` (where `active = true`)
     - `announcements` (where `start_date <= CURRENT_DATE` and `end_date >= CURRENT_DATE`)
     - Can submit `enrollment_requests` and `trial_requests` (insert-only access).

---

## 4. EVENT NOTIFICATION TRIGGERS (24 EVENTS)

PostgreSQL triggers and scheduled procedures automate in-app alerts by inserting message rows into the `notifications` table.

### 4.1 Database Event Triggers (Trigger-Activated)

These events fire instantly on specific `INSERT` or `UPDATE` operations:

1. **New Admission Form Submitted:**
   - *Table:* `enrollment_requests` [INSERT]
   - *Logic:* Fires on new form submission and alerts all `supervisor` profiles.
2. **Portal Credentials Created:**
   - *Table:* `profiles` [INSERT]
   - *Logic:* If a student profile with a `parent_id` is created, it alerts the parent.
3. **Student Assigned to Teacher/Group Class:**
   - *Table:* `teacher_student_assignments` [INSERT]
   - *Logic:* Inserts an alert in the Student's inbox and the Teacher's inbox.
4. **Attendance Marked:**
   - *Table:* `attendance_logs` [INSERT/UPDATE]
   - *Logic:* Fires when attendance status is submitted, informing the student.
5. **Lesson Report Saved:**
   - *Table:* `lesson_logs` [INSERT]
   - *Logic:* Automatically places a confirmation in the teacher's dashboard.
6. **Leave Request Submitted:**
   - *Table:* `leave_requests` [INSERT]
   - *Logic:* Routes the request to all Supervisors for review.
7. **Leave Request Decision:**
   - *Table:* `leave_requests` [UPDATE]
   - *Logic:* If status becomes `approved` or `rejected`, alerts the applicant.
8. **Makeup Class Requested:**
   - *Table:* `makeup_requests` [INSERT]
   - *Logic:* Sends an invite alert to the teacher.
9. **Makeup Class Decision:**
   - *Table:* `makeup_requests` [UPDATE]
   - *Logic:* If status changes, routes the outcome back to the student.
10. **Fee Receipt Uploaded:**
    - *Table:* `parent_payments` [INSERT]
    - *Logic:* Alerts the supervisor that a parent receipt is pending validation.
11. **Fee Deferral Submitted:**
    - *Table:* `fee_deferrals` [INSERT]
    - *Logic:* Inserts a notice for all Finance Officers.
12. **Fee Deferral Decision:**
    - *Table:* `fee_deferrals` [UPDATE]
    - *Logic:* Alerts the student/parent regarding the extension outcome.
13. **Fee Payment Confirmed:**
    - *Table:* `fee_payments` [UPDATE]
    - *Logic:* Fires when payment status changes to `verified`, alerting the student.
14. **Trial Converted to Regular:**
    - *Table:* `trial_requests` [UPDATE]
    - *Logic:* When `is_converted_active` is toggled to true, alerts the student and teacher.
15. **Teacher Removal Recommendation:**
    - *Table:* `profiles` [UPDATE]
    - *Logic:* If a teacher's status shifts to `Pending Director Approval`, it alerts the Academic Director and Supervisor.
16. **Student Re-assigned to New Teacher:**
    - *Table:* `teacher_student_assignments` [UPDATE]
    - *Logic:* If `teacher_id` changes on an assignment, notifies the student and the new teacher.
17. **Suspension Lifted / Restored:**
    - *Table:* `profiles` [UPDATE]
    - *Logic:* If a student profile status moves from `Suspended` to `Active`, sends a welcome-back alert to the student.

---

### 4.2 Time-Based Scheduled Jobs (Procedural Functions)

These events cannot be fired by table triggers because they depend on the clock. They are written as PostgreSQL functions designed to be executed at regular intervals (e.g. hourly or daily via `pg_cron`):

18. **Class Starting in 15 Minutes:**
    - *Function:* `check_upcoming_classes()`
    - *Frequency:* Runs every minute. Matches classes starting in 10–16 minutes, alerting the student and teacher.
19. **Class Starting in 5 Minutes:**
    - *Function:* `check_upcoming_classes()`
    - *Frequency:* Runs every minute. Matches classes starting in 2–6 minutes, alerting the student and teacher.
20. **Grace Period Expiration Warning:**
    - *Function:* `check_grace_period_missed()`
    - *Frequency:* Runs every minute. Checks active classes starting 10 minutes ago where no attendance log has been initialized, alerting the supervisor.
21. **Tuition Overdue (After 8th):**
    - *Function:* `check_unpaid_fees()`
    - *Frequency:* Runs daily. If current day is > 8th, finds pending `fee_payments` without active deferrals and alerts the student (overdue) and supervisor.
22. **Tuition Payment Reminder (5th of Month):**
    - *Function:* `send_fee_reminders()`
    - *Frequency:* Runs daily. If current day is 5th, sends reminders to all students with unpaid pending fees.
23. **Trial Day 3 Expiration:**
    - *Function:* `check_trial_warnings()`
    - *Frequency:* Runs daily. Matches trials scheduled exactly 2 days ago (third day of trial) and alerts student and supervisor.

---

## 5. DATABASE CONSTRAINTS & AUDITING RULES

1. **Currency Enforcements:**
   - Student tuition payments in `fee_payments` are constrained to USD via `CHECK (original_currency = 'USD')`.
   - Teacher contracts, support staff payroll disbursements, and expense records must be recorded in PKR:
     - `CHECK (currency = 'PKR')` on `teacher_wallet` and `payroll_disbursements`
     - `expenses_log` stores `amount_pkr` directly as a positive numeric column.
2. **Exclusive Teacher Roles:**
   - A teacher can only be assigned to a single course category. Enforced in `profiles` via a role check constraint:
     ```sql
     CONSTRAINT check_teacher_role_type CHECK (
         (role = 'teacher' AND teacher_type IN ('1:1', 'Dars-e-Nizami', 'Tajweed')) OR
         (role <> 'teacher' AND teacher_type IS NULL)
     )
     ```
3. **Cohort Capacity Limits:**
   - Roster counts in `group_classes` are automatically tracked via group enrollment triggers. The class capacity limit is enforced by a check constraint:
     ```sql
     CONSTRAINT enrolled_limit CHECK (enrolled_count <= max_capacity)
     ```
     By default, `max_capacity` is set to `25`.
4. **Audit Trail Recording:**
   - Status modifications on `profiles` (e.g. `Suspended`, `Removed`) are written to the immutable `security_audit_logs` table via the `trg_log_profile_status_change` trigger.
5. **Classroom Recording Retention:**
   - In `classroom_sessions`, the `recording_url` column is nullable. A value of `NULL` represents a session not yet recorded or a recording that has been purged (respecting the 90-day active/1-year archive deletion policy).
