# COMPLETE PROJECT GUIDE: VIRTUAL ZAWIYAH

This guide serves as the master project reference manual for the Virtual Zawiyah platform. It has been compiled after a comprehensive, page-by-page browser audit of the running application. It reflects the exact structural components, navigation links, forms, tables, currency configurations, business logic rules, and remaining integration requirements.

---

## SECTION 1: PROJECT OVERVIEW

### 1.1 Mission & Scope
**Virtual Zawiyah** is an online, institution-neutral Islamic learning platform designed to connect students with qualified scholars (Alims/Alimahs) for structured traditional Islamic education. The curriculum includes:
- One-on-One (1:1) private classes: Quran Memorization (Hifz), Quran Reading with Tajweed (Nazra), and classical Arabic Grammar.
- Structured Group programs: 8-Year Dars-e-Nizami Classical Curriculum and the 2-Year Tajweed Program.

Unlike platforms that rely on external software downloads like Zoom or Skype, Virtual Zawiyah integrates a self-hosted **Jitsi Meet** video environment directly into the dashboard portals. The design is optimized for desktop and large-screen devices (tablets/laptops) to facilitate reading classical scripts and interacting with the teacher's virtual whiteboard.

### 1.2 Technology Stack
- **Core Frontend:** Next.js (App Router, Client Components, React state managers).
- **Styling:** Vanilla CSS (`index.css`) utilizing customized HSL color variables (sage greens, deep olives `#1B6B3A`, and warm golds `#C9A84C`).
- **Database (Planned):** Supabase PostgreSQL Database, connected using the Supabase client library `@/lib/supabaseClient`.
- **Authentication (Planned):** Supabase Auth for email/password validation and role-based route mapping.
- **Video Infrastructure:** Self-hosted Jitsi Meet WebRTC server with Jibri for session recordings.
- **Communications:** WhatsApp Business API integration templates for lesson logs, warnings, and fee reminders.

### 1.3 State of the Application
The codebase is currently structured as a **high-fidelity static design (UI Prototype)**. All user portals, forms, alerts, and navigation sidebars are fully functional in the browser, powered by rich mock datasets. The Supabase database wiring is currently bypassed to allow testing. All forms use local states and display success alerts, while database queries are represented by hardcoded arrays.

---

## SECTION 2: PUBLIC WEBSITE — COMPLETE DETAIL

The public-facing website consists of 9 fully styled pages:

### 2.1 Home Page (`/`)
- **Purpose:** Primary landing page for marketing and initial visitor intake.
- **Sections & Elements:**
  - **Typewriter Hero:** An automated text fade displaying Arabic Quranic verses/Hadith quotations with correct RTL rendering, alongside English translations.
  - **Action Buttons:** "Start 3-Day Trial" (links to `/enrollment`) and "View Courses" (links to `/courses`).
  - **Platform Standards:** Bullet features covering 1:1 Class Format, Strict Gender Matching, Structured Lesson Reports, Flexible Global Scheduling, 3-Day Trial Period, and the 100% Browser-Based Platform.
  - **Curriculum Cards:** Split overview showing 1:1 Private Mentorship ($60/mo) and Group Learning ($10/mo) with "Learn More" links.
  - **Four-Step Roadmap:** "Submit Admission Form" -> "Get Matched with Teacher" -> "3-Day Trial (1:1)" -> "Begin Regular Classes".
  - **Testimonial Slides:** Client quotes from families based in the UK, USA, and Canada.
  - **Popup Modal:** "Important Announcement" popup containing details for Dars-e-Nizami group admissions (Start Date: July 1st, 2026, applies to Group format). Includes an "Acknowledge" button to dismiss.
  - **WhatsApp Floating Widget:** Bottom-right floating icon linking to `https://wa.me/923255777312`.

### 2.2 About Page (`/about`)
- **Purpose:** Build trust by detailing the platform's history, methodology, and organizational hierarchy.
- **Sections & Elements:**
  - **Main Story:** Narrative explaining why Virtual Zawiyah was founded and the traditional definition of a *Zawiyah* (educational corner).
  - **Principles:** Sections covering Authentic Islamic Knowledge, Qualified Teachers, Safe and Respectful Environment, and Global Accessibility.
  - **Gender Policy:** Explains the platform's strict gender segregation rules.
  - **Organizational Structure Card:** Explains the hierarchy from Admin, Supervisor, Teacher, to Student.
  - **CTA Button:** "Begin Your Journey" (links to `/enrollment`).

### 2.3 Courses Page (`/courses`)
- **Purpose:** Present the detailed curriculum catalog.
- **Sections & Elements:**
  - **1:1 Program Grid:** Individual cards for Quran Reading with Tajweed, Applied Tajweed (Basic), Quran Memorization (Hifz), 40 Hadith Memorization, Quran Translation, and Arabic Grammar.
  - **Group Program Grid:** Cards for the 8-Year Dars-e-Nizami Curriculum and the 2-Year Tajweed Program ($10/mo, 120-min classes, 5 days/week).
  - **Actions:** Each card contains a "View Fees & Plans" link (pointing to `/fee`) and an "Apply Now" button (pointing to `/enrollment`).

### 2.4 Tuition & Fees Page (`/fee`)
- **Purpose:** Pricing plans and billing policy details.
- **Sections & Elements:**
  - **1:1 Tuition Cards:** Plans for 3 lessons/week ($60/mo for 30-min; $120/mo for 60-min) and 5 lessons/week ($100/mo for 30-min; $200/mo for 60-min).
  - **Group Class Card:** 5 lessons/week ($10/mo, 120-min session length).
  - **Weekend Card:** Saturday & Sunday 1:1 option ($100/mo, 30-min session length).
  - **Policies List:** Details covering the 3-day trial, monthly billing, gender segregation, 12-hour rescheduling, and currency acceptance (USD primary).

### 2.5 Contact Page (`/contact`)
- **Purpose:** Lead generation and customer support.
- **Sections & Elements:**
  - **Inquiry Form:** Name (`name`), Email (`email`), and Message (`message`) input fields with a "Send Message" button.
  - **WhatsApp Channel Card:** Direct link button "Chat on WhatsApp" (`https://wa.me/923255777312`).
  - **Contact Links:** Structured anchors for email (`info@virtualzawiyah.com`), voice call (`+92 325 5777312`), and WhatsApp.

### 2.6 Enrollment Page (`/enrollment`)
- **Purpose:** Sibling-aware student registration portal.
- **Sections & Elements:**
  - **Toggle Tabs:** Tab switch between "Full Admission" and "3-Day Trial".
  - **Form Fields (Full Admission):**
    - Personal: Student Name, Father's Name, Guardian Name, Relationship Select, Student Gender, Student Age, Country Select, State, Guardian WhatsApp, Student WhatsApp, Parent Email.
    - Academic: Course Select, Class Format (One-on-One display), Preferred Duration, Teacher Gender, Current Level, Preferred Times (1st & 2nd choice), Timezone (auto-detected), Days Available (checkboxes).
    - Details: Special Learning Needs, Additional Notes, Referral source.
  - **Form Fields (3-Day Trial):** Simplified form requesting name, guardian details, WhatsApp, email, starting date, course, teacher gender, level, timezone, and notes.

### 2.7 Teachers Directory (`/teachers`)
- **Purpose:** Showcase the verified teaching faculty.
- **Sections & Elements:**
  - **Filters:** Buttons to filter by "All Teachers", "Male Teachers", and "Female Teachers".
  - **Teacher Cards:** Detailed profiles for Ustadh Ahmad Bilal, Ustadha Fatima Zahra, Ustadh Yusuf Qasim, Ustadha Khadija Malik, Ustadh Ibrahim Hassan, and Ustadha Maryam Siddiqua. Shows languages, qualifications, and specialties.

### 2.8 FAQ Page (`/faq`)
- **Purpose:** Self-service policy lookups.
- **Sections & Elements:** Accordion panels grouped by: Enrollment, Courses & Curriculum, Schedule & Classes, Fees & Payment, Technical Requirements, and Teachers.

### 2.9 Login Page (`/login`)
- **Purpose:** Access control portal.
- **Sections & Elements:** Email and Password input fields, "Sign In" button, and "Request Enrollment" link (points to `/enrollment`).

---

## SECTION 3: ALL DASHBOARDS — COMPLETE DETAIL

The authenticated section of the app contains 8 distinct dashboards:

### 3.1 Student Dashboard (`/student/dashboard`, `/student/schedule`, `/student/fees`)
- **Users:** Enrolled students and their parent sponsors.
- **Sidebar Elements:** Logo header ("Virtual Zawiyah student Portal"), "Dashboard" link, "My Schedule" link, "Fees" link, student email tag, and "Sign Out" button.
- **Interactive Elements & Features:**
  - **Sibling Selector Gate:** Initial modal screen: "Who is going to learn first?" options to continue as `Ahmed Bilal` (Hifz, trial) or `Sara Bilal` (Dars-e-Nizami, active).
  - **Dashboard context switcher:** Toggle header at top to switch views between Ahmed Bilal and Sara Bilal.
  - **Academic Progress Panels:** Displays attendance rates (e.g. Ahmed 94% this month, Sara 72% this month), teacher notes, and feedback histories.
  - **Leave Application Form:** Class Date, Time, and Reason for Leave inputs with "Submit Leave Application" button.
  - **Makeup Request Form (1:1 Only):** Dropdown list of missed classes, target date, target time, and submit button. Disabled for group students.
  - **Weekly Calendar (`/student/schedule`):** Calendar displaying slots. Ahmed's Wednesday class has an active green **"Join Class Now"** button launching Jitsi Meet.
  - **Billing & Receipt Upload (`/student/fees`):** Displays pending fees (Sara Bilal $60.00 pending). Features a drag-and-drop file uploader for bank transfer receipts.
  - **Fee Deferral Request Modal:** Date input and Reason textarea to submit extensions.
- **Mock vs. Real:** progress stats, schedules, and billing registers are loaded from mock React states. Real data will query `attendance_logs`, `lesson_logs`, `fee_payments`, and `fee_deferrals` tables.

### 3.2 Teacher Dashboard (`/teacher/dashboard`, `/teacher/wallet`)
- **Users:** Faculty members.
- **Sidebar Elements:** Logo header ("Virtual Zawiyah TEACHER PORTAL"), "Dashboard" link, "My Wallet" link, Student Search input, "Today's Classes" list (Ahmed Bilal, Sara Bilal, Yusuf Khan), and "All Assigned Students" roster list (Anisa Fatima, Zainab Ali).
- **Interactive Elements & Features:**
  - **Split Workspace Layout:** Selecting a student from the sidebar updates the workspace view.
  - **Student Session Manager (Left):** Displays selected student details, last logged lesson report, and **Submit Today's Lesson Report Form**. For Hifz students (Ahmed), the form renders inputs for `Sabaq`, `Sabaqi`, and `Manzil`. For standard students (Sara), it renders topics and next plans.
  - **Jitsi Classroom Card (Right):** Displays an active green **"Start Class Room"** button pointing to Jitsi.
  - **Pending Reports Console:** Lists finished sessions requiring reports (Yusuf Khan) with a "Log Now" trigger.
  - **Wallet Page (`/teacher/wallet`):** Displays current month's contract base salary (Rs. 110,000.00), leave counts, and calculated deductions.
  - **Calculation Accordion:** Detailed payout formulas (e.g., late report penalty of Rs. 1,500.00).
  - **Payout History Ledger:** Renders payment history table (May, April, March, February 2026 logs) with a "View Details" payslip popup modal.
  - **Settlement Section:** Displays read-only bank settlement details (Meezan Bank, IBAN PK97MEZN0001092837465012).
- **Mock vs. Real:** Wallet payouts, transaction logs, and student registers will load from `teacher_wallet`, `payroll_disbursements`, and `teacher_student_assignments` tables.

### 3.3 Registrar Dashboard (`/registrar/dashboard`)
- **Users:** Registrars matching students to teacher slots.
- **Sidebar Elements:** "Pending Admissions", "Trial Management", "Teacher Onboarding", "Makeup Requests", Registrar email ("ayesha.registrar@virtualzawiyah.com"), and "Sign Out" button.
- **Interactive Elements & Features:**
  - **Admissions Ledger:** Lists pending intake files. Selecting Zayd Mansoor displays timezone, gender preference, and time slots.
  - **Smart Teacher Matchmaker:** Renders a list of teachers ranked by compatibility score (e.g. 98% Match for Ustadh Hammad Ali) with an "Assign & Start Trial" button.
  - **Trial Student Management Tab:** Displays active trial roster (Ali Raza, Aamina Yousuf). Renders a "Convert to Regular Student" selector or an "End Trial / Reject student" button.
  - **Teacher Onboarding Hub Tab:** Onboarding form with Name, Gender, Spoken Languages, Qualifications, and Teacher Type Role Allocation ("1:1 Custom slots", "Dars-e-Nizami course", "Tajweed batch classes"). Includes a registered faculty ledger table.
  - **Makeup Scheduling Desk Tab:** Renders pending missed classes (Bilal Khan). Clicking "Schedule Slot" opens an inline modal with Date and Time inputs to assign substitute teachers.
- **Mock vs. Real:** Onboarding inserts profiles. Smart matchmaker matches profiles based on availability and timezone preferences in `profiles` and `class_schedules`.

### 3.4 Supervisor Dashboard (`/supervisor/dashboard`)
- **Users:** Male/Female Supervisors.
- **Sidebar Elements:** "Attendance Reports", "Leave & Makeup Disputes", "Teacher Change Requests", "Group Class Management", "Disciplinary Actions", "Monthly Reports", Supervisor email ("kamal.supervisor@virtualzawiyah.com"), and "Sign Out" button.
- **Interactive Elements & Features:**
  - **Attendance Reports Tab:** Renders a "Faculty Attendance Ledger" (Khalid Rahman, Tariq Mahmood) and a sorted list of student attendances (lowest first: Bilal Khan 78%).
  - **Leave & Makeup Disputes Tab:** Lists disputed sessions (disp-1, disp-2). The Supervisor can enter reasoning notes and click "Approve Dispute", "Decline Dispute", or "Resolve & Split".
  - **Teacher Reassignment Tab:** Renders pending switch requests from students. Includes "Approve Request" and "Decline Request" buttons.
  - **Group Class Management Tab:** Lists year-batches, teacher assigned, schedule, and capacity metrics (e.g. 22 / 25 Students). Includes a "Move Class Enrollment" transfer student widget.
  - **Disciplinary Action Center Tab:** Lists teachers with a trash icon to open the **Recommend Teacher Removal Modal**. For students, it provides "Suspend" and "Remove" action buttons.
  - **Monthly Reports Tab:** Download links for performance summary sheets.
- **Mock vs. Real:** Warning triggers and dispute cards will query `attendance_logs`, `disputes`, and `profiles`.

### 3.5 Content Manager Dashboard (`/content-manager/dashboard`)
- **Users:** Content managers.
- **Sidebar Navigation:** "Announcements", "Courses Directory", "Fee Cards Manager", Content Manager details ("Mariam Ahmed"), and "Sign Out" button.
- **Interactive Elements & Features:**
  - **Announcements Board Tab:** Lists active website popups. Includes a "Create New Announcement" button opening a modal with Title, Message, Scope dropdown (All, 1:1, Group), Start Date, and End Date inputs.
  - **Courses Catalog Tab:** Lists 1:1 and Group courses with "Edit Course" and "Remove Course" buttons. Includes an "Add New Course" button opening a modal.
  - **Fee Cards Manager Tab:** Configures the public pricing cards. Clicking "Configure Features" opens a modal with a price rate input (with `$` prefix) and a features manager list (allowing item deletions and additions).
- **Database Wiring:** Updates will write to `announcements`, `courses`, and `darse_nizami_curriculum` tables.

### 3.6 Finance Dashboard (`/finance/dashboard`)
- **Users:** Finance Officers.
- **Sidebar Navigation:** "Financial Overview", "Fee Collection Ledger", "Deferral Requests", "Salary Management", "Expenses & Petty Cash", Finance info ("Zaid Malik"), and "Sign Out" button.
- **Interactive Elements & Features:**
  - **Executive Summary Tab:** Displays Total Fee Collected ($130), Fee Pending ($290), and Total Expenses (Rs. 185,000). Renders an "Auditor View" disclaimer explaining that the Net Balance calculation is hidden from this dashboard.
  - **Fee Collection Ledger Tab:** Lists students (Bilal Khan, Ayesha Siddiqui). Clicking "Verify Receipt" opens a Wise slip simulation showing the transaction details, receipt image, and "Confirm Receipt" or "Reject" buttons.
  - **Deferral Requests Tab:** Lists Zainab Rashid and Hamza Yusuf's deferral requests with "Approve" and "Decline" buttons.
  - **Salary Management Tab:** Renders "Teachers" and "Other Staff" payroll lists. Clicking "Process Payment" logs payouts. Clicking "Edit Salary" enables an inline input field (e.g. `Rs. [ 25,000 ]`) with check/cancel icons.
  - **Expenses Log Tab:** Lists utility and rent logs. Clicking "Add New Expense" opens a modal with Date, Category, Amount (with `Rs.` prefix), and Description fields.
- **Database Wiring:** Ledger entries and salary edits will update `teacher_wallet`, `payroll_disbursements`, and `expenses_log` tables.

### 3.7 Academic Director Portal (`/director/dashboard`)
- **Users:** Academic Director.
- **Sidebar Navigation:** "Executive Overview", "Supervisors Performance", "Escalated Disputes", "Teacher Disciplinary", "Non-Teaching Staff", "Academy Reports", Director info ("Dr. Sulaiman Ali"), and "Exit Portal" button.
- **Interactive Elements & Features:**
  - **Executive Overview Tab:** Renders overall stats (3 Supervisors, 18 Faculty, 124 Pupils) and a USD Tuition Collection progress bar (60% Progress, $7,440 collected of $12,400 expected).
  - **Supervisors Performance Tab:** Performance ledger tracking active supervisors.
  - **Escalated Disputes Tab:** Renders escalated student issues (ESC-201, ESC-202) with "Approve Exception", "Decline Exception", and "Resolve Otherwise" buttons.
  - **Teacher Disciplinary Tab:** Displays supervisor teacher removal recommendations. The Director can click "Approve Termination" or "Decline & Retain Teacher".
  - **Non-Teaching Staff Tab:** Non-teaching staff register table with trash icon buttons. Includes an **"Add New Operations Staff"** form modal (Name, Role select, Join Date, Phone). Lists non-teaching leave applications (Muhammad Ramzan) with "Approve" and "Decline" buttons.
  - **Academy Reports Tab:** Table of downloadable operations summary PDFs.
- **Database Wiring:** Removal approvals write to `profiles` and update staff status.

### 3.8 Founder Dashboard (`/founder/dashboard`)
- **Users:** Founder / Executive Owner.
- **Sidebar Navigation:** "Financial Overview", "Academy Overview", "Staff Directory", 'View Portals ("View As")', Founder details ("Abu Sulaiman"), and "Sign Out" button.
- **Interactive Elements & Features:**
  - **Executive Banner Override:** Displays a gold/green banner at the top of other dashboards when opened via the switchboard, allowing the Founder to return easily.
  - **Financial Overview Tab:** Net Monthly Balances card displaying `$ 1,628.57 USD` (Tuition minus PKR salary conversions). Includes a 6-month historical trend chart.
  - **Academy Overview Tab:** Aggregated student and teacher counts.
  - **Staff Directory Tab:** Central Staff Registry. Clicking "Hire New Staff" opens a modal with Name, Role, Joining Date, and Phone inputs. Clicking the trash icon on a row opens a **Confirm Staff Termination Modal** with a justification notes textarea.
  - **View Portals Tab:** Grid of buttons to view dashboards as specific roles.
- **Database Wiring:** Net balance calculates actual collections minus payroll and expenses.

---

## SECTION 4: STAFF ROLES AND RESPONSIBILITIES

### 4.1 Student (and Parent)
- **Role & Access:** Client role (`student`). Accesses `/student/*` sub-routes.
- **Dashboard:** Student Portal.
- **Responsibilities:** Attend live classrooms; submit leave applications; toggle sibling profiles; upload bank slips to pay fees; submit fee deferral requests.
- **Boundaries:** Cannot modify schedule slots, edit attendance records, view teacher wallets, or bypass matching gates.
- **Reporting:** Reports to assigned Teacher and Supervisor.

### 4.2 Teacher (1:1 Scope)
- **Role & Access:** Faculty role (`teacher`). Accesses `/teacher/*` sub-routes.
- **Dashboard:** Teacher Portal.
- **Responsibilities:** Join live 1:1 classes; log Hifz lesson logs (Sabaq, Sabaqi, Manzil) or Nazra logs; review and approve makeup requests; apply for leaves.
- **Boundaries:** Cannot teach group courses or modify base salary rates.
- **Reporting:** Reports to assigned Supervisor.

### 4.3 Teacher (Group Scope)
- **Role & Access:** Faculty role (`teacher`). Accesses `/teacher/*` sub-routes.
- **Dashboard:** Teacher Portal.
- **Responsibilities:** Conduct Dars-e-Nizami or Tajweed group classes; manually mark attendance for the cohort; log standard lesson logs.
- **Boundaries:** Cannot conduct 1:1 lessons; cannot adjust group class capacities.
- **Reporting:** Reports to assigned Supervisor.

### 4.4 Registrar
- **Role & Access:** Administrative role (`registrar`). Accesses `/registrar/*` sub-routes.
- **Dashboard:** Registrar Portal.
- **Responsibilities:** Screen pending admissions; run the Smart Matchmaker to match 1:1 students; place group students in cohorts; convert trial students to regular status; schedule unassigned makeups.
- **Boundaries:** Cannot resolve disputes, issue warning letters, process teacher payroll, or update website announcements.
- **Reporting:** Reports to Academic Director.

### 4.5 Supervisor
- **Role & Access:** Administrative role (`supervisor`). Accesses `/supervisor/*` sub-routes.
- **Dashboard:** Supervisor Portal.
- **Responsibilities:** Monitor low student attendance; resolve leave and makeup disputes; review teacher change requests; transfer students between group classes; recommend teacher removals to the Director; suspend or expel students.
- **Boundaries:** Cannot authorize final teacher removals; cannot edit payroll disbursements or public website pricing.
- **Reporting:** Reports to Academic Director.

### 4.6 Content Manager
- **Role & Access:** Administrative role (`content_manager`). Accesses `/content-manager/*` sub-routes.
- **Dashboard:** Content Manager Portal.
- **Responsibilities:** Configure landing page announcements with date bounds; update the courses catalog; edit fee card rates.
- **Boundaries:** Cannot access student attendance logs, payroll, or dispute centers.
- **Reporting:** Reports to Academic Director.

### 4.7 Finance Officer
- **Role & Access:** Administrative role (`finance_officer`). Accesses `/finance/*` sub-routes.
- **Dashboard:** Finance Dashboard.
- **Responsibilities:** Audit uploaded bank receipts to verify fees; review and approve fee deferrals; calculate teacher and support staff payroll; log expenses.
- **Boundaries:** Cannot see the net financial balance of the academy.
- **Reporting:** Reports to Academic Director.

### 4.8 Academic Director
- **Role & Access:** Executive role (`academic_director`). Accesses `/director/*` sub-routes.
- **Dashboard:** Academic Director Portal.
- **Responsibilities:** Review supervisor dispute logs; approve or decline teacher removals; manage support staff hires, leaves, and removals.
- **Boundaries:** Subject to overrides by the Founder.
- **Reporting:** Reports to Founder/Owner.

### 4.9 Founder/Owner
- **Role & Access:** Executive Owner (`founder`). Accesses `/founder/*` sub-routes.
- **Dashboard:** Founder Dashboard.
- **Responsibilities:** Audit net monthly balances; review academic statistics; hire or terminate any staff member; override director-level decisions.
- **Boundaries:** None. Holds absolute system access.

---

## SECTION 5: HOW THE COMPLETE SYSTEM WILL WORK (END-TO-END WORKFLOWS)

Once database integrations are complete, the system will operate via the following workflows:

### 5.1 New Student Enrollment
1. The parent submits the intake form on /enrollment.
2. The system creates a row in enrollment_requests (status: pending) and sends an in-app + email notification to the Supervisor.
3. The Registrar views the application in the Registrar Portal.
4. The Registrar opens the Smart Matchmaker, which filters teachers by gender, course, timezone, preferred time slots, available days, slot utilization, and past trial history.
5. The Registrar selects the most suitable teacher from the filtered list and submits the assignment recommendation to the Supervisor.
6. The Supervisor reviews the recommendation and either approves or declines it.
7. If approved, the system creates the student's portal account (STU-XXXX ID), sets status to TRIAL, sends credentials to the guardian via WhatsApp and email, and notifies the assigned teacher.

### 5.2 Trial Period
1. A 1:1 student is assigned a 3-day trial period.
2. The teacher conducts 3 trial sessions.
3. The system tracks trial session counts via `attendance_logs`.
4. After 3 sessions, the teacher logs final feedback.
5. The Registrar reviews the feedback and either converts the student to `REGULAR` status or declines enrollment.

### 5.3 Group Class Enrollment
1. The parent submits the intake form for a group course (e.g. Dars-e-Nizami).
2. The Registrar reviews the application.
3. The Registrar assigns the student directly to a group class cohort.
4. The system updates the cohort's enrollment count and creates the student profile (status: `Active`). Group students bypass the trial period.

### 5.4 A Normal Class Day — 1:1
1. The teacher logs into `/teacher/dashboard`.
2. The system checks the schedule and displays the classroom link if a class is active.
3. The teacher clicks "Start Class", opening the Jitsi classroom inside the portal.
4. The student clicks "Launch Online Classroom" in `/student/schedule`, joining the session.
5. Jitsi API detects concurrent presence and automatically marks the student present in `attendance_logs`.
6. After class, the teacher logs the lesson report (Sabaq, Sabaqi, Manzil), which is saved to `lesson_logs` and shared with the parent via WhatsApp templates.

### 5.5 A Normal Class Day — Group
1. The group teacher joins the Jitsi room from `/teacher/dashboard`.
2. Group students join the session from `/student/schedule`.
3. The teacher manually marks attendance checkboxes in the workspace.
4. The teacher submits the attendance log, updating `attendance_logs`.
5. The teacher logs a standard lesson report (topics covered and next plans) for the group.

### 5.6 Monthly Fee Collection
1. On the 1st of the month, the system generates a `fee_payments` row (status: `pending`) for each student.
2. The parent views the pending fee statement in `/student/fees` and uploads a receipt.
3. The Finance Officer views the receipt in `/finance/dashboard`.
4. The Finance Officer verifies the receipt, updating the payment status to `verified`.
5. Once the fee is confirmed, the Finance Officer records the collection. Teacher salaries are processed separately at the end of the month by the Finance Officer — they are not automatically derived from student fees. The fee collection and salary payment are two completely independent processes.

### 5.7 Fee Deferral Request
1. The parent submits a date extension request via `/student/fees`.
2. The system logs a row in `fee_deferrals` (status: `pending`).
3. The Finance Officer reviews the request in `/finance/dashboard`.
4. The Finance Officer approves or declines the extension, updating the request status.

### 5.8 Fee Suspension and Reinstatement
1. If a tuition fee remains unpaid by the grace period deadline, the system flags the student's account.
2. The Supervisor reviews the account and suspends access, updating the student's status to `Suspended`.
3. The student's dashboard displays a suspension notice, blocking classroom access.
4. Once the Finance Officer verifies the payment, the student's status is updated to `Active` and classroom access is restored.

### 5.9 Teacher Leave
1. The teacher submits a leave request through their dashboard.
2. The system checks if the request is submitted at least 12 hours before class.
3. If valid, the request is sent to the Supervisor for approval.
4. The Supervisor approves the leave, marking the day's class as a cancelled leave.
5. The system calculates a salary deduction per excess absent day using this formula: Monthly Salary ÷ Number of Days in That Calendar Month ÷ 480 minutes × total absent minutes. The per-day rate differs for every teacher depending on their individual monthly salary and the number of days in the month — there is no fixed universal deduction amount.

### 5.10 Student Leave
1. The parent submits a leave request at least 12 hours before class.
2. The system records the request and notifies the teacher.
3. The class status is updated to `leave` in `attendance_logs`.

### 5.11 Makeup Class
1. When a class is missed, a makeup request is logged in the system.
2. The teacher reviews the request and proposes an alternative day and time.
3. The parent accepts or declines the proposal.
4. If approved, the system adds the makeup slot to `class_schedules`.

### 5.12 Teacher Change Request
1. A parent requests a teacher change.
2. The Supervisor reviews the request in `/supervisor/dashboard`.
3. If approved, the Supervisor updates the student's assignment record.
4. The Registrar re-assigns the student to a new teacher using the Smart Matchmaker.

### 5.13 Teacher Disciplinary Action
1. The Supervisor recommends removing a teacher due to performance or disciplinary issues.
2. The teacher's status is updated to `Pending Director Approval`.
3. The Academic Director reviews the recommendation in `/director/dashboard`.
4. If approved, the Academic Director terminates the teacher's credentials, updating their status to `Removed`. The Founder holds executive override authority to reinstate profiles.

### 5.14 Student Suspension and Removal
1. The Supervisor issues disciplinary warnings to a student.
2. If violations continue, the Supervisor suspends or expels the student.
3. The system updates the student's status to `Suspended` or `Removed` and logs the action.

### 5.15 Publishing an Announcement
1. The Content Manager configures an announcement in `/content-manager/dashboard`.
2. The Content Manager sets target course scopes (All, 1:1, or Group) and active dates.
3. The announcement is saved to the database.
4. The public homepage queries the database and displays active announcements.

### 5.16 Adding a New Course
1. The Content Manager adds a course in `/content-manager/dashboard`.
2. The system writes the course to the database.
3. The public `/courses` page queries the database and renders the new catalog card.

### 5.17 Fee Rate Change
1. The Content Manager updates a fee rate card in `/content-manager/dashboard`.
2. The system writes the updated rate to the database.
3. The public `/fee` page queries the database and displays the updated rate.

### 5.18 Monthly Salary Processing
1. At the end of the month, the Finance Officer reviews payroll calculations in `/finance/dashboard`.
2. The Finance Officer processes payouts, creating transactions in `payroll_disbursements`.
3. The system updates `teacher_wallet` balances and notifies teachers of the payout.

### 5.19 Academy Expense Recording
1. The Finance Officer logs utility, rent, or maintenance expenses in `/finance/dashboard`.
2. The system writes the items to `expenses_log`.
3. The Founder's dashboard queries the log and updates the net balance panel.

### 5.20 Audit Log
1. Administrative actions (approvals, removals, overrides) are logged in `security_audit_logs`.
2. The system records the action type, profile ID, timestamp, IP address, and details.
3. Supervisors and directors query these logs to generate compliance reports.

### 5.21 Salary, Allowances, Deductions, and Welfare Policy

SALARY SETTING
All staff salaries are set individually by the Admin/Finance Officer based on qualifications, experience, and role. There are no fixed universal salary scales — each contract is negotiated individually.

DEDUCTION FORMULA (applies to all staff)
All late-minute and absence deductions are calculated based on the actual number of days in that calendar month (28, 29, 30, or 31). The formula is:
  Monthly Salary ÷ Days in Month ÷ 480 minutes × Late or Absent Minutes = Deduction Amount
Overtime (extra minutes worked beyond contracted hours) uses the same formula:
  Monthly Salary ÷ Days in Month ÷ 480 minutes × Overtime Minutes = Overtime Payment
Example: If monthly salary is Rs. 10,000, month has 31 days, employee was 63 minutes late and worked 200 minutes overtime:
  Late deduction = 10,000 ÷ 31 ÷ 480 × 63 = Rs. 42
  Overtime payment = 10,000 ÷ 31 ÷ 480 × 200 = Rs. 134

TEACHERS — EXTRA CLASS ALLOWANCE (instead of overtime)
Teachers are not on hourly contracts, so the above overtime formula does not apply to them. Instead:
- For each additional student a teacher is assigned (taught at least 3 days/week), the teacher receives Rs. 1,500 extra per month.
- Condition: The extra student's classes must run for a minimum of 2 weeks in that month. If classes ran for only 1 week or less, no allowance is paid for that student that month.
- This allowance is per additional student, not per class session.

UNAUTHORIZED ABSENCE
If a staff member is absent without prior notice or approval, a single deduction (not double) is applied using the formula above.

ANNUAL INCREMENT
Salary increments are reviewed and applied every July. The increment amount is decided by the Finance Officer and Academic Director based on performance during the past year.

INCOME TAX
Staff members whose salary exceeds the government-mandated taxable threshold will have income tax deducted from their monthly salary. Filing of the annual tax return is the employee's own responsibility.

EID-UL-FITR ANNUAL BONUS
- Bonus is paid once per year at Eid-ul-Fitr. It is treated as a reward (not an entitlement) granted at the institution's discretion.
- Bonus eligibility period: 1st June of the previous year to 31st May of the current year.
- Only staff who are actively employed at the time of bonus payment are eligible. Staff who have resigned, been terminated, or whose contract was cancelled before payment are not eligible — even if they worked during the eligibility period.
- Bonus calculation: The average monthly salary across the eligible months is calculated, divided by 360 days, and multiplied by the number of days the employee worked in permanent status during the eligibility period. Each month is counted as 30 days regardless of calendar month length.
- Staff earning more than Rs. 50,000/month receive bonus calculated on Rs. 50,000 only, regardless of actual salary.
- If salary changed during the year, the average of all months in permanent status is used.
- Any month in which the employee was on full unpaid leave or absent for the entire month is excluded from both the bonus calculation and the average salary calculation.
- If an employee was in a role that does not qualify for bonus, then moved to a qualifying role mid-year, bonus is calculated only from the month the qualifying role began.
- Partial pre-Ramadan payment: Bonus months completed before Ramadan are paid before Ramadan begins. Remaining months (up to 31 May) are paid with the May salary.

MARRIAGE BONUS
Staff members receive one month's salary as a one-time marriage bonus upon submitting proof of marriage.

MEDICAL WELFARE
Upon submission of original doctor's report and pharmacy/hospital bills (verified for authenticity):
- Total bill Rs. 5,000 or less → Full reimbursement
- Total bill Rs. 5,001 to Rs. 20,000 → 50% reimbursement
- Total bill more than Rs. 20,000 → Fixed Rs. 10,000 reimbursement (no more)
All bills are verified before payment to confirm authenticity.

FAMILY BEREAVEMENT WELFARE
Rs. 5,000 is paid and 3 days of paid emergency leave are granted in the following cases only:
- Unmarried employees: upon the death of a parent (father or mother).
- Married employees: upon the death of a spouse or a child.
No other family relationships qualify for this welfare payment.

---

## SECTION 6: WHAT REMAINS TO BE BUILT

The following steps are required to connect the static frontend to a live database:

### 6.1 Database Schema Initialization
Audited schema tables must be deployed in Supabase:
- **`profiles` Modifications:** Add `parent_id` (FK to self) and `status` (TEXT).
- **`courses` & `darse_nizami_curriculum`:** Catalogs for program levels and years 1 to 8.
- **`group_classes` & `group_class_enrollments`:** Roster trackers and cohort allocations.
- **`fee_deferrals`:** Logs student date extension requests.
- **`leave_requests` & `makeup_requests`:** Trackers for student/teacher leave days.
- **`non_teaching_staff` & `payroll_disbursements`:** Database for staff HR registers and monthly payroll files.
- **`expenses_log` & `announcements`:** Ledgers for utilities and targeted overlays.
- **`classroom_sessions` & `security_audit_logs`:** Metadatas for Jitsi connections and IP access.

### 6.2 Authentication System
- **Supabase Auth Integration:** Connect `/login` portal form to Supabase client auth sign-ins.
- **Role Detection:** Read user roles on sign-in and redirect users to the correct dashboard.
- **Session Rules:** Enforce 30-minute session timeouts, concurrent login limits, and IP tracking.

### 6.3 Row Level Security (RLS)
- Configure Row Level Security (RLS) policies on new tables to secure data access by role.

### 6.4 Connecting Dashboards to Real Data
- Replace mock React states with database queries.
- Wire form inputs to database write queries, replacing static success alerts with actual database insertions.

### 6.5 Jitsi VPS Setup
- Deploy a self-hosted Jitsi Meet server on a VPS.
- Configure Jibri to record sessions and save them to private storage.
- Integrate Jitsi scripts into the portal classroom component.
- Set up auto-attendance logging (1:1 only) via the Jitsi connection webhook.

### 6.6 Notification System
Implement triggers to send in-app and/or email/WhatsApp notifications for the following 24 events:

1.  New admission form submitted → Supervisor (In-app + Email)
2.  Portal credentials created → Guardian (WhatsApp wa.me + Email)
3.  Student assigned to teacher or group class → Teacher + Student (In-app + Email)
4.  Class starting in 15 minutes → Teacher + Student (In-app)
5.  Class starting in 5 minutes → Teacher + Student (In-app)
6.  Class not started after grace period expires → Supervisor (In-app)
7.  Attendance marked → Teacher + Student (In-app)
8.  Lesson report saved → Teacher confirmation (In-app)
9.  Leave request submitted → Supervisor (In-app + Email)
10. Leave approved or rejected → Applicant (In-app + Email)
11. Makeup class requested → Teacher (In-app)
12. Makeup class accepted or refused → Student (In-app)
13. Teacher change request submitted → Supervisor (In-app + Email)
14. Fee receipt uploaded → Supervisor (In-app + Email)
15. Fee deferral request submitted → Finance Officer (In-app + Email)
16. Fee deferral approved or declined → Student (In-app + Email)
17. Fee payment confirmed → Student (In-app + Email)
18. Fee unpaid after 8th (no deferral active) → Student + Supervisor (In-app + Email)
19. Fee reminder on 5th of month → Student (In-app + Email)
20. Trial ending — day 3 → Student + Supervisor (In-app + Email)
21. Trial converted to Regular status → Student + Teacher (In-app + Email)
22. Teacher resignation submitted → Academic Director + Supervisor (In-app + Email)
23. Student re-assigned to new teacher → Student + New Teacher (In-app + Email)
24. Fee suspension lifted — new slot assigned → Student (In-app + Email)

### 6.7 Domain and Hosting Deployment
- **Domain:** Configure `virtualzawiyah.com` with Namecheap DNS records.
- **Frontend Hosting:** Deploy the Next.js app to Vercel.
- **Jitsi Server:** Deploy to DigitalOcean or Hetzner VPS with SSL certificates.

---

## SECTION 7: IMPORTANT DECISIONS AND CONSTRAINTS

The following decisions must be respected in future development phases:

1. **No Mobile Apps:** Strictly browser-based; no dedicated mobile apps.
2. **Human-in-the-Loop Matchmaker:** Matchmaking is suggested by the system but manually assigned by the Registrar.
3. **Exclusive Faculty Categories:** Teachers are assigned to only one course category (1:1, Nizami group, or Tajweed group) and cannot mix formats in their roster.
4. **Manual Group Attendance:** Group class attendance must be marked manually by the teacher; Jitsi auto-attendance is restricted to 1:1 sessions.
5. **Day Boundaries:** The operational day changes at **07:00 AM PST** to align with student and teacher timezones, rather than midnight.
6. **Currency Standards:** Student fees are billed in **USD** (or local currency equivalents), while staff salaries are calculated and paid in **PKR**.
7. **No Sibling Discounts:** Sibling accounts share a login parent ID, but their fees and enrollments remain independent; sibling discounts are not supported.
8. **Concurrent Login Limits:** Accounts are restricted to one active session at a time; new logins terminate existing sessions.
9. **Recordings Retention Policy:** Class recordings are retained for 90 days in active storage, archived for 1 year, and then deleted.
10. **Financial Privacy:** USD profit margins and net balances are visible only to the Founder; these metrics are hidden from the Finance Officer.
11. **Merged HR Role:** There is no separate HR dashboard; support staff management is folded into the Academic Director's portal.
12. **Neutral Branding:** The brand is strictly institution-neutral; the word "academy" must not appear in public-facing copy or student/teacher portals.

---

## SECTION 8: OBSERVED DISCREPANCIES

During the systematic browser audit, the following UI/UX discrepancies were observed relative to the ideal design system:

1. **Breadcrumb Inconsistency (Tuition & Fees):** Navigating to the Tuition & Fees page (`/fee`) displays the breadcrumb `Home / Pricing` instead of `Home / Tuition & Fees` or `Home / Fee`.
2. **Text Alignment (Faculty Page):** The navigation header uses the label `Teachers` but the breadcrumb on that page reads `Home / Teachers` and the headings read `Our Teachers`.
3. **Hardcoded Payment Dates:** In the Student Fees section (`/student/fees`), the due dates for all sibling accounts and fee entries are hardcoded as `2026-06-10` which is in the past.
4. **Hardcoded Expenses Log Dates:** In `/finance/dashboard`, the expenses log dates show dates in June 2026 (`2026-06-01` to `2026-06-20`), while the system date in other parts of the dashboard represents July 2026.
5. **Jitsi Meet Links:** Classroom URLs are currently mocked to point to public Jitsi spaces (`https://meet.jit.si/virtual-zawiyah-...`) rather than private classroom channels.
6. **Authentication Exemption:** The `publicPaths` configuration in `middleware.ts` exposes all dashboard routes publicly without authentication. While this is intentional for the static design validation, in a production system these must be behind an auth gate.
