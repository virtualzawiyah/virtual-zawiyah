# Database & Billing Design Notes

## Sibling Accounts & Billing Separation Requirement

> [!IMPORTANT]
> **Fee and Billing Independence:**
> Fee/billing must be tracked per individual student profile (`profiles.role = 'student'`), not per shared login/auth account.
> 
> **Rationale:**
> Siblings sharing a single parent or account login may:
> 1. Be enrolled in different courses (e.g. one in Quran Hifz, another in Dars-e-Nizami).
> 2. Have different monthly fee amounts.
> 3. Have independent due dates and payment statuses.
> 4. Require separate fee deferral requests.
> 5. Be suspended independently without affecting their sibling's active status.
> 
> **Schema Design:**
> *   The `fee_payments` ledger table MUST link to the individual `student_id` (referencing `profiles.id`) rather than the shared `parent_id` or parent login account ID.
> *   Receipt uploads create a master transaction in `parent_payments` linked to the parent account. This master transaction is then broken down into separate `fee_payments` rows for each selected student.
