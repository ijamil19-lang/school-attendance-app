# SchoolFlow — audit of 28 RLS tables without policies
Date: 27 October 2026

## Read-only database findings
All 28 tables identified by the Supabase Security Advisor have:
- Row-level security **enabled**.
- **Zero** RLS policies.

**25 tables** have no direct SELECT/INSERT/UPDATE/DELETE privileges for either `authenticated` or `anon` (for anonymous users, SELECT was checked; other operation grants on the three exceptions should be reviewed separately).

**Three exceptions** grant SELECT, INSERT, UPDATE and DELETE to `authenticated`, and at least SELECT to `anon`, but still have RLS enabled and **no allow policies**, so ordinary API access remains default-denied:
1. `sf_school_subjects`
2. `sf_teacher_attendance_classes`
3. `sf_teacher_exam_classes`

These excessive grants are **least-privilege hardening opportunities**, not evidence of successful data access. Do not add broad allow policies to silence the advisor.

## Grouped inventory (28)
### School administration / scheduling (7)
`school_academic_years`, `school_attendance_geofences`, `school_holidays`, `school_payments`, `school_subscriptions`, `school_timetable`, `parent_absence_notifications`

### Financial, family, exam and grading (13)
`sf_exam_results`, `sf_exams`, `sf_families`, `sf_family_discounts`, `sf_family_students`, `sf_fee_payments`, `sf_school_grade_scales`, `sf_school_subjects`, `sf_student_fees`, `sf_student_report_remarks`, `sf_teacher_wages`, `sf_wage_payments`, `student_class_history`

### Other school workflows and kiosk (8)
`sf_teacher_attendance_classes`, `sf_teacher_exam_classes`, `student_promotion_audit`, `teacher_clock_events`, `teacher_kiosk_attempts`, `teacher_kiosk_credentials`, `teacher_kiosk_pin_guess_limits`, `teacher_kiosk_sessions`

## Release actions
1. Trace each table's intended access through guarded RPCs / edge functions; confirm real School A vs School B identities cannot retrieve or update the other's records.
2. After confirming no direct client access is required, revoke unnecessary client-role grants for the three exceptions **in staging first**; re-run attendance/exam subject allocation and reporting.
3. Inspect privileged functions called by unauthenticated kiosk endpoints, including internal role separation and rate limiting; absence of direct-table policies does not secure a poorly guarded SECURITY DEFINER RPC.
4. Document deliberate default-deny tables; consider explicitly false policies only if necessary for advisor clarity—do not add allow policies.
5. Re-run advisors and authenticated tenant-isolation tests after changes.

## Scope and limits
This was a read-only catalog and privilege inspection; no school data was accessed or modified. No end-to-end authenticated functional tests were performed. This audit does not attest that every privileged function or storage policy is safe.

References:
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/observability/advisors?lint=0008_rls_enabled_no_policy
