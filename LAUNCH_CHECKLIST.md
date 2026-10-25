# SchoolFlow — Pre-launch acceptance checklist
Last reviewed: 25 October 2026
Status: PRE-LAUNCH. Do not onboard paying schools until critical tests pass.

## Verified by connected project inspection
- [x] Supabase project reports ACTIVE_HEALTHY
- [x] Core Edge Functions report ACTIVE
- [x] GitHub admin.html parses without JavaScript syntax errors
- [x] Main app includes fees, wages, attendance, assessments, combined reports, grading, and remarks
- [x] All inspected public tables report row-level security enabled
- [ ] Execute signed-in end-to-end tests with realistic role accounts
- [ ] Check mobile layouts and print layout across devices
- [ ] Confirm SMTP/invitation email delivery and password-reset flow
- [ ] Verify Stripe or alternative billing/payment process if paid subscriptions are enabled
- [ ] Configure and verify production hostname, TLS and Supabase auth redirect allowlist

## Security audit progress — 25 October 2026
- [x] Reviewed core RLS policies: school membership, administrator and attendance-class checks reference school ID, with active-school checks in helper functions
- [x] Verified teacher-exam backend validates authenticated teacher, school membership, active profile, allocated class and subject, and per-student class membership
- [x] Added active-school enforcement in admin finance/results, teacher exams, absence-email, calendar, kiosk PIN and kiosk attendance submission functions
- [x] Removed unnecessary anon/authenticated direct grants on report grading and remarks tables; privileged administration remains server-authorised
- [x] Verified teacher-photo storage bucket is private; school-logo bucket is public by design
- [ ] Audit remaining privileged backend functions for suspension enforcement, rate limiting, and object-level authorisation
- [ ] Execute genuine school-A/school-B impersonation tests with separate real user sessions (not simulated by code inspection)
- [ ] Confirm user sessions actually fail access after school suspension, including existing kiosk session tokens
- [ ] Verify unauthorised requests return 401/403 in a staging environment, without exposing pupil data

## P0 — security and reliability, launch blockers
- [ ] Multi-tenant isolation: School A administrator cannot read or change School B students, fees, teachers, exam results, photos, reports or configuration (try both browser and API)
- [ ] Teacher scope: attendance only assigned class, exam marks only allocated class/subject; cannot tamper with student/school IDs
- [ ] Unauthenticated and expired-token requests are rejected by each user-accessible backend function
- [ ] Review functions with verify_jwt:false for explicit server-side token validation, rate limits and authorisation
- [ ] Verify teacher kiosk PIN throttling, location/geofence rules and photo permissions on real devices
- [ ] Confirm school suspension/expired subscription blocks appropriate access without deleting records
- [ ] Confirm backups and exercise restoring a test snapshot; document restoration owner and procedure
- [ ] Confirm production error handling, logs and operational support contacts
- [ ] Have a data-protection / retention policy and secure disposal procedure before using real pupil data

## P1 — complete workflow tests
- [ ] Create new school, logo, locale/timezone, school admin
- [ ] Admin sign-in/sign-out and session expiry; teacher password invite, first login and password change
- [ ] Teacher assigned attendance class; present/late/absent/excused; reports on correct date/timezone
- [ ] Fee assignment, family discounts, payment, partial payment, unpaid search and reminder preview
- [ ] Teacher wage assignment, payment records and reporting
- [ ] Teacher 1 submits Maths, Teacher 2 submits Science for same student; admin sees both
- [ ] A student marked absent has no numeric zero and is excluded from percentage denominator
- [ ] Report period filters, grade bands, saved remark reload, CSV export, print A4 report card
- [ ] Year transition/promotion preview and confirmation with audit trail
- [ ] School-specific settings and subscriptions
- [ ] Mobile review: teacher marks, attendance, kiosk, admin critical tasks

## P2 — launch preparation
- [ ] Publish SchoolFlow at a dedicated subdomain if desired
- [ ] Finalise pricing (per-school plan, student limits, trial, billing and renewal)
- [ ] Create parent website for Skylight Business and link SchoolFlow
- [ ] Publish clear terms, privacy notice and customer support contact
- [ ] Create school onboarding guide and support troubleshooting page
- [ ] Pilot with one school using consented/appropriate test data and obtain acceptance
- [ ] Add uptime alerts and a regression smoke test for the admin and teacher screens

## Known caveats
- Static syntax validation is not equivalent to signed-in/browser testing.
- The new report-card and grade/remarks workflows require user acceptance testing.
- Several module tables have RLS enabled but no public policy: audit backend authorisation on all corresponding service-role routes.
- Keep production student personal data out of development tests unless legally and operationally appropriate.
