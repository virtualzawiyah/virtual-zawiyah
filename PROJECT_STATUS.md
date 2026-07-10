# Virtual Zawiyah — Project Status & Reference Documentation

Welcome to the Virtual Zawiyah status and documentation guide. This document serves as a complete reference of everything designed and built in the project. Because the application currently operates as a high-fidelity static design/UI powered by mock datasets, this document outlines the mock state structures, user roles, routing architecture, and key design constraints to guide future database integration.

---

## 1. Project Overview
**Virtual Zawiyah** is a web-based, institution-neutral online Islamic learning platform designed to facilitate structured Islamic studies. The core offering centers on live, browser-based 1:1 and group courses conducted via a self-hosted Jitsi Meet classroom portal (to run inside the student/teacher portal environment).

The platform does not rely on third-party client software (such as Zoom or MS Teams). Instead, it runs natively inside web browsers on both desktop and mobile devices. A large-screen device (such as a laptop, desktop computer, or tablet) is recommended for students to easily follow along with textbook scripts and the teacher's whiteboard screen.

---

## 2. Infrastructure Status & Mock Layer
The platform is currently built as a static frontend UI. The following infrastructure elements **do not exist yet** and must be built in future development phases:
- **No Active Database:** All page content, schedules, teacher rosters, and billing data are static or stored in client-side React state. 
- **Database Wiring Rollback:** Form database wiring for the Admission and Contact pages was once attempted and subsequently rolled back per request. These forms currently process submission handlers and validate input but do not persist data anywhere.
- **No Custom Domain:** The app runs locally on `http://localhost:3000`. No public domain has been configured yet.
- **No VPS Hosting:** The site is hosted in local and temporary sandbox spaces. A private Virtual Private Server (VPS) is needed for deployment.
- **No Self-Hosted Jitsi Server:** The self-hosted Jitsi classroom integration is blocked on acquiring a dedicated VPS and setting up secure WebRTC video conferencing.

---

## 3. Public Website Pages
The public-facing website consists of clean, styled routes designed with an institution-neutral brand identity:

1. **Home (`/`)**
   - Branded hero section with a fading typewriter animation rotating through Arabic Quranic/Hadith phrases (with tightly condensed diacritics and correct LTR/RTL layout alignments) and English translations.
   - Highlights the core values, curriculum highlights, quick links to enroll, and introductory video mockups.
2. **About Us (`/about`)**
   - Details Virtual Zawiyah's background, online learning methodology, educational standards, and faculty profiles.
3. **Courses Catalog (`/courses`)**
   - Showcases the curriculum catalog across five major programs: Quran Memorization (Hifz), Quran Reading with Tajweed (Nazra), Tajweed 2-Year Group Program, Dars-e-Nizami Classical Islamic Curriculum, and Islamic Studies.
4. **Tuition & Fee (`/fee`)**
   - Lists tuition programs and tier rates, and features a mock currency switcher (supporting PKR, USD, GBP, etc.).
5. **Contact Us (`/contact`)**
   - Includes a contact form and clearly separated, clickable action buttons for contact channels:
     - **WhatsApp Support:** `+92 325 5777312` (clickable `https://wa.me/923255777312` link with custom SVG icon)
     - **Direct Voice Call:** `+92 325 5777312` (clickable `tel:+923255777312` link)
6. **Admission Intake Form (`/enrollment`)**
   - A multi-step admission intake form with inputs for student demographics, course selection, scheduling preferences, and sibling registration gates. Features input validation and clean success screens pointing to chat support.
7. **Teachers Directory (`/teachers`)**
   - Allows public visitors to view and filter profiles of male and female faculty members by gender and language.
8. **Unified Login Portal (`/login`)**
   - A single gateway login screen. Provides easy-to-use shortcut credentials to bypass auth and quickly inspect the student, teacher, registrar, supervisor, content manager, and finance dashboards.
9. **FAQ (`/faq`)**
   - A collapsible accordion page detailing policies: custom browser classroom requirements (no Zoom/Teams), Ramadan start dates, and 1:1 eligibility for the 3-day trial.
10. **Terms of Service (`/terms`)**
    - Standard legal disclaimers, including strict refund policies and the 1:1 free trial restriction.
11. **Privacy Policy (`/privacy`)**
    - Discloses data collection rules. All generic video conferencing (e.g. Zoom) references are replaced by our custom classroom portal. Features styled, clickable email contacts.

---

## 4. Authenticated Dashboards Built
Bypassed from Supabase auth redirects via custom middleware public routes, these dashboards render as complete, mock-state staff and client portals:

### A. Student Portal
- **Dashboard (`/student/dashboard`)**
  - **Sibling Selector Gate ("Who's Going to Learn First?"):** Stored in local component state. Swaps the entire dashboard views between `Ahmed Bilal` (Hifz program, trial status) and `Sara Bilal` (Dars-e-Nizami program, active status).
  - **Academic Overview Panel:** Shows overall and monthly attendance percentages, course progress meters, and teacher feedback.
  - **Lesson Logs List:** Ahmed's Hifz logs show Sabaq (new verse), Sabaqi (recent revision), and Manzil (old memorization Juz). Sara's Dars-e-Nizami logs show standard lesson topics and next lesson plan.
  - **Leave/Makeup Requests:** Form to submit leave/makeup requests with history logs.
- **My Schedule (`/student/schedule`)**
  - Displays weekly time slots.
  - **Jitsi Classroom Trigger:** Automatically generates a mockup "Live Now" class slot based on the current system time. Clicking **"Launch Online Classroom"** opens a browser window for Jitsi integration testing.
- **Fees & Billing (`/student/fees`)**
  - Toggle billing records between siblings. Shows pending fee statements.
  - **Receipt Upload:** Upload selector allowing students to select a JPEG/PDF slip of bank transfer and submit (updates page status to pending verification).
  - **Deferral Request Form:** Modal form to request payment date extensions with reason logging.

### B. Teacher Portal
- **Roster & Class Manager (`/teacher/dashboard`)**
  - **Three-Panel Layout:**
    - **Today's Schedule (Left Column):** Lists live, upcoming, and completed classes.
    - **Active Classroom Workspace (Middle Column):** Displays the active student's info, lesson plan helper, a join button for the classroom, and a live input form to log Sabaq, Sabaqi, and Manzil reports.
    - **Student Roster (Right Column):** Lists all assigned students with search filtering and expanders to view their full lesson log histories.
- **Sidebar & Administrative Forms (`/teacher/layout.tsx`)**
  - **12-Hour Leave Check:** An advanced leave application form that compares inputs against system time. Rejects submission if the request is placed less than 12 hours before class time.
  - **Student Makeup Approvals:** Accept or decline makeup classes requested by student families.
  - **Attendance Stats:** Displays month-to-date and overall attendance metrics.
- **Teacher Wallet (`/teacher/wallet`)**
  - Displays monthly salary configuration matching base salary (Rs. 110,000) and excess leave deduction formulas (Rs. 4,230.77/day).
  - **Payroll parameters calculator:** Expands to show details of leave penalties and calculations.
  - **Payslips List:** Shows historical statements (Paid vs Processing) with print/view options.
  - Displays Bank Account credentials on file.

### C. Registrar Portal (`/registrar/dashboard`)
- **New Admissions & Assignments:** Shows pending applications. Clicking a 1:1 student opens the **Smart Teacher Matchmaker** showing scores and timezone slots. Clicking a Group student opens the **Assign to Group Class** list showing year-level capacities.
- **Trial Lesson Management:** Tracks students undergoing trials. Shows teacher feedback notes and lets the Registrar convert them to active enrollment or decline them.
- **Teacher Onboarding Form:** Adds new teachers to the active roster with teaching categories (1:1, Dars-e-Nizami, or Tajweed 2-Year) and language preferences.
- **Unassigned Makeup Requests:** Roster of makeup slots requiring teacher matching.

### D. Supervisor Portal (`/supervisor/dashboard`)
- **Attendance & Alerts Panel:** Displays low attendance and trial expiration alert logs.
- **Lesson Disputes:** Reviews student vs teacher disputes. Supervisor records reasoning notes and resolves disputes.
- **Teacher Reassignments:** Approves or declines teacher switch requests.
- **Class transfers:** Handles group class migrations, checking capacity limits.
- **Disciplinary Actions Modal:** Provides actions to issue warning letters, suspend students, expel students, or recommend teacher removals to the Academic Director (requiring justification notes).
- **Reports Tab:** Generates PDF summary files of supervisor activities.

### E. Content Manager Portal (`/content-manager/dashboard`)
- **Announcements Board:** Publishes high-priority announcement popups that appear on the public website landing page (Home page). Supports targeting specific course formats (All / 1:1 Only / Group Only) and enforces date validations (Start/End dates) without pinning concepts.
- **Courses Catalog:** Adds new courses and modifies years/subjects (from Years 1 to 8 in Dars-e-Nizami).
- **Fee Cards Configurator:** Edits rates (PKR/USD/GBP), currencies, and detail bullet points displayed on the public pricing page.

### F. Finance Officer Portal (`/finance/dashboard`)
- **Financial Overview:** Shows totals collected/pending and logs petty cash expense balances.
- **Student Fee Collection:** Verifies uploaded bank slip files to mark fees paid or reject files. Sends WhatsApp reminders.
- **Escalated Deferrals:** Approves or declines fee extension requests passed from the student panel.
- **Salary Management (Sub-Tabs):**
  - **Teachers sub-tab:** Manages faculty salary rates and processes June 2026 payout disbursements.
  - **Other Staff sub-tab:** Manages salary rates for non-teaching staff (Muhammad Ramzan, Sajid Ali, etc.). Allows processing monthly payouts and editing contract rates inline.
  - **History logs:** Table automatically displays payment history for either teachers or other staff depending on the active sub-tab.
- **Expenses & Petty Cash:** Tracks utility expenses, printing, building rents, and pantry refreshments. Includes detailed Excel sheet exports and formatted PDF prints.

### G. Academic Director Portal (`/director/dashboard`)
- **Executive Overview:** High-level statistics tracking supervisor pools, total teachers/students, platform average attendance, and overall tuition collection statuses ($7,440 collected of $12,400 expected).
- **Supervisors Performance Ledger:** Performance lists tracking supervised teacher/student ratios and disputes resolved/pending per supervisor.
- **Escalations Resolution:** Reviews and resolves disputes escalated by supervisors with Approve/Decline actions and final decision note inputs.
- **Teacher Disciplinary Approvals:** Approves or declines teacher removal recommendations submitted by Supervisors, requiring final director decision notes before committing.
- **Non-Teaching Staff HR:** Manages support employees (Security Guards, Office Boys, Cleaners), processes staff additions or removals (reason required), and reviews pending leave applications.
- **Academy Reports:** Displays generated operational audit sheets and supervision report file downloads.

### H. Founder/Owner Portal (`/founder/dashboard`)
- **Financial Overview:** Showcases monthly tuition income ($2,700 USD) vs outgoing expenses side-by-side. Highlights the **Prominent Net Surplus Margin** ($1,628.57 USD surplus) as the primary metrics value. Features an SVG six-month historical trend chart.
- **Academy Overview:** Provides a high-level summary of active students (1:1 vs group), faculty size (1:1, Nizami, Tajweed), attendance (94.1%), trial registry status count, and pending dispute escalations.
- **Staff Directory Roster:** Complete administrative listing of all system employees (Academic Director, Supervisors, Registrar, Content Manager, Finance Officer, Teachers) with hiring and fire/removal override modals.
- **View Portals Switchboard:** "View As" page switchboard linking directly to specific portal dashboard routes (adding a query param `?from=founder` that displays a persistent top banner to allow returning to the Founder console).

---

## 5. Key Architectural Decisions
The following constraints and ownership structures must be respected in future sessions:

### HR Admin is NOT a Separate Dashboard Role
- The standalone `/hr/dashboard` page exists solely as a high-fidelity static prototype.
- **Long-term design decision:** Non-teaching staff directories, leave tracking, and employee queries will **not** be in a separate HR dashboard. Instead, these controls will be merged directly into the **Registrar Portal** or a future **Academic Director Portal**.

### Task Ownership Guardrails (No Role Duplications)
No single task or management function is duplicated across roles:
- **Admissions & Matching:** Registrar only.
- **Fee Deferrals & Receipt Approval:** Finance Officer only.
- **Teacher-Student Disciplinary Warnings & Removals:** Supervisor only.
- **Course & Announcement Publishing:** Content Manager only.
- **Leave Request Approvals (Faculty):** Supervisor only (Teacher layout form just submits request).
- **Leave Request Approvals (Non-teaching Staff):** HR Admin / Academic Director.

### Attendance Rules
- **1:1 Classes:** Marked automatically upon lesson log submission in the teacher panel.
- **Group Classes:** Attendance must be marked manually by the teacher inside the dashboard during or immediately after the class session.

### Teacher Assignment Rules
- Teachers are exclusively assigned to **one course type only**: 1:1 classes, Dars-e-Nizami group classes, or Tajweed 2-Year group classes.
- A teacher can never mix 1:1 courses with Group program classes in their teaching roster.

### Branding Guardrails
- The platform is strictly **institution-neutral**. Avoid using the word "academy" anywhere in client-facing public copy or student/teacher portals to keep the branding open for future institutional expansions.

---

## 6. Known Operational Issue & Safeguard
There is a known styling and Next.js cache corruption bug:
- **The Issue:** Running `npm run build` while `npm run dev` is active corrupts the `.next` compilation cache, breaking CSS stylesheet compilation and throwing class mismatch warnings.
- **The Safeguard:** The `"dev"` script in `package.json` contains a pre-execution hook that checks for and recursively deletes the `.next` folder before starting the server:
  ```json
  "dev": "node -e \"const fs = require('fs'); if (fs.existsSync('.next')) { fs.rmSync('.next', { recursive: true, force: true }); }\" && next dev"
  ```
- **The Recovery Process:** If styles break, stop all terminal processes, run `rm -rf .next` (or delete the folder manually), and restart the server using `npm run dev`.

---

## 7. Next Steps Checklist
1. Connect the frontend pages to a **Supabase Postgres Database** (wiring schema tables, student/teacher rosters, lessons history, and auth user profiles).
2. Deploy the application to a dedicated **VPS Server** with SSL certificates.
3. Set up the **self-hosted Jitsi classroom server** on the VPS.
