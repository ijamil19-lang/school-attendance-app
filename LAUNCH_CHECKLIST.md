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

## Security audit continuation — 25 October 2026
- [x] Added active-school checks to WhatsApp absence-preview endpoint, geofence-admin endpoint, and teacher-kiosk-admin endpoint; verified deployed versions
- [x] Reviewed teacher login invitation/create/reset functions: they verify administrator membership in the teacher's school before changing login details
- [x] Reviewed promotion confirmation: administrator membership checked before history and confirmed changes
- [ ] **High priority:** schoolflow-teacher-attendance-report still lacks an explicit active-school guard; deployment attempt was blocked, so source remains unchanged
- [ ] **High priority:** add active-school guards to promotion confirmation, teacher login creation/invitation/reset and any other privileged functions not yet covered
- [ ] **High priority:** teacher change-password currently checks an active teacher profile but not an active school or current teacher membership; strengthen this endpoint
- [ ] Test every privileged endpoint with valid School A / School B credentials, suspended-school accounts, and invalid or expired sessions
- [ ] Review storage signed URL generation, kiosk token reuse, and audit trails with real test accounts

## Security audit continuation — round 3 (25 October 2026)
- [x] Teacher password changes now require an active teacher profile, an active school, and matching teacher membership before changing password (deployed function v5)
- [x] Student promotion endpoint now enforces active school status for history and promotion operations (deployed function v5)
- [x] Read-only cross-school relationship checks found **zero existing mismatches across 10 relationships**, including students/classes, attendance, exam assignments/results, fee/student and wages/teacher
- [ ] **Still blocked:** teacher-attendance-report active-school enforcement; deployment was blocked on previous attempt
- [ ] **Still blocked:** three teacher-login administration endpoints (invite, create, manage) need explicit active-school checks; deployment tool blocked the attempt and no change was saved
- [ ] Carry out authenticated cross-school security tests with two school admin accounts and assigned/unassigned teachers (the relationship integrity query is not a substitute)
- [ ] Exercise the suspended-school behaviour using a non-production test school, without interrupting current active schools
- [ ] Confirm no regression in password updates, school promotions, invites, teacher attendance and report cards

## Security audit continuation — round 4 (25 October 2026)
- [x] Added and verified active-school guard on schoolflow-teacher-attendance-report (v3)
- [x] Added and verified active-school guard on schoolflow-invite-teacher (v4)
- [x] Added and verified active-school guard on schoolflow-create-teacher-login (v7)
- [x] SQL role simulation: Green Valley administrator can see zero Manha students or classes through public RLS
- [x] SQL role simulation: assigned teacher sees 3 assigned students, zero unassigned students and zero student private profiles
- [x] SQL role simulation: direct access to sf_exam_results is denied to authenticated role
- [ ] **Outstanding:** schoolflow-manage-teacher-login v1 has no active-school guard; deploy attempt blocked, source unchanged
- [ ] Test auth flows and API access with actual sessions (SQL role simulation is not full end-to-end verification)
- [ ] Test student data boundary after school suspension using a dedicated test school
- [ ] Check reverse tenant isolation and other privileged endpoint routes

## Security audit continuation — round 5 (25 October 2026)
- [x] Deployed schoolflow-manage-teacher-login v2: administrator login-email changes and password-reset requests now require an active school after membership validation
- [x] Re-fetched deployed function and confirmed active-school guard, admin membership check and token validation are present
- [x] Reviewed SQL function grants: promotion, geofence, kiosk attempt/record, and attendance snapshot functions are not directly executable by anon or authenticated roles
- [ ] Follow up on public EXECUTE privilege on schoolflow_block_holiday_attendance (a SECURITY DEFINER function); determine whether it is a trigger and revoke unnecessary execute rights
- [ ] Verify that a suspended school blocks all supported endpoints using a non-production account
- [ ] Run login-based and API cross-school tests; SQL policy simulations are partial evidence only
- [ ] Verify teacher email-change/password-reset user journeys and invitation email delivery

## Security audit continuation — round 6 (25 October 2026)
- [x] Verified schoolflow_block_holiday_attendance() is an enabled SECURITY DEFINER trigger on attendance_records
- [x] Revoked unnecessary direct EXECUTE permissions from PUBLIC, anon and authenticated on the holiday-attendance trigger function; confirmed trigger remains enabled and service role retains access
- [x] Revoked anon EXECUTE permission on seven more privileged functions: admin_update_teacher_profile, claim_teacher_invitation, platform_list_payments, platform_list_subscriptions, platform_record_payment, platform_update_subscription, and school_subscription_notice
- [x] Verified all seven now deny anonymous execution while preserving authenticated role execution; internal school-admin/platform-owner checks remain necessary
- [ ] Verify signed-in user flows: teacher invitation claiming, teacher profile editing, payments/subscriptions, and school subscription notice
- [ ] Test holiday attendance rejection on an appropriate non-production school/student and ensure the trigger still functions as expected
- [ ] Continue reviewing storage permissions, signed URLs, and real authenticated cross-school API checks

## Security audit continuation — round 7 (25 October 2026)
- [x] Teacher photo bucket schoolflow-teacher-photos is private; school-logos is intentionally public
- [x] Private-photo storage objects have no direct SELECT policy for ordinary authenticated users
- [x] Simulated Green Valley admin and teacher sessions each see zero teacher photo objects via storage.objects RLS
- [x] Existing storage objects: 7 private teacher photos and 6 public logos, all with school-ID prefixes
- [x] Existing teacher credential and clock-event photo references show zero wrong school/teacher path prefixes
- [x] Reviewed signed photo links: kiosk admin and PIN verification links expire after 120 seconds; attendance-report photo links expire after 300 seconds
- [ ] Test authenticated photo access over real Storage API and verify signed URL expiry in actual browsers
- [ ] Test photo-upload confirmation, permissions, and kiosk images using two separate school accounts
- [ ] Decide production photo-retention period, who may request deletion, and whether old uploaded photos should be automatically cleaned up

## Security audit continuation — round 8 (25 October 2026)
- [x] Re-reviewed kiosk registered photo upload and confirmation: admin token, school administrator membership and active school are checked; photo confirmation is scoped to the same school and teacher path
- [x] Attendance-report signed photo URLs now require photo paths under the selected school and event teacher (schoolflow-teacher-attendance-report v4)
- [x] Kiosk admin registered-photo preview signed links now require matching school and teacher folder (schoolflow-teacher-kiosk-admin v4)
- [x] Kiosk PIN verified teacher-photo signed links now require matching school and matched teacher folder (schoolflow-teacher-kiosk-verify v4)
- [x] Re-fetched all three deployed functions and confirmed path checks; read-only data checks show zero mismatched attendance or registered photo paths
- [ ] Perform actual signed-upload / photo-confirm tests on a dedicated test account and verify content type and size limits via live Storage API
- [ ] Check real signed-link expiration after 120/300 seconds and cross-school photo request blocking through authenticated API
- [ ] Review retention/deletion of old teacher photos and consider scalable photo confirmation for folders containing over 100 files

## Security audit continuation — round 9 (25 October 2026)
- [x] Updated teacher kiosk photo confirmation to search by specific filename, not the first 100 objects in the folder (kiosk admin v5)
- [x] Photo confirmation now checks exact filename, existence, metadata MIME type matching extension, and a 1 KB–2 MB size range
- [x] Re-fetched deployed kiosk admin v5 and confirmed server-side photo checks
- [x] Kiosk session inspection: 22 stored sessions were expired; none currently active; expiry checks already block expired tokens
- [ ] Plan automatic cleanup of expired kiosk sessions; do not delete until retention/audit requirements are decided
- [ ] Test actual signed image upload and confirmation on mobile, including invalid file/oversized file and wrong-school path
- [ ] Assess image-byte content validation independently of declared MIME/extension

## Security audit continuation — round 10 (25 October 2026)
- [x] Deployed kiosk PIN verification v6: validates PIN shape first, then opportunistically deletes only this school's tokens expired over 24 hours ago
- [x] Confirmed pg_cron is not installed; cleanup runs during normal PIN verification rather than via a new scheduler
- [x] Confirmed stored kiosk sessions: 22 expired, 0 active, 21 older than 24 hours at inspection; no tokens deleted by the review
- [x] Confirmed attendance-recording SQL routine locks the session row, checks expiry, and deletes the token on successful attendance (single-use transaction design)
- [ ] Exercise token rejection after successful submission and when expired using a test-school kiosk without changing live attendance
- [ ] Confirm opportunistic session cleanup removes eligible old rows during the next valid-format PIN verification
- [ ] Decide if unused schools require time-based cleanup and introduce scheduled maintenance only if necessary

## Security audit continuation — round 11 (25 October 2026)
- [x] Confirmed RLS enabled on teacher_kiosk_credentials, teacher_kiosk_sessions, teacher_kiosk_attempts and teacher_clock_events
- [x] Confirmed anon/authenticated roles have no direct table grants on any of those four sensitive tables
- [x] Simulated authenticated teacher role and confirmed SELECT is not granted for all four tables
- [x] Added Cache-Control: no-store to kiosk admin API responses containing signed photo links and verified deployed schoolflow-teacher-kiosk-admin v6; existing photo-path guard intact
- [x] Inspected kiosk session state: 22 stored sessions, all expired, none active; cleanup is opportunistic on PIN verification, not an independently scheduled job
- [ ] Exercise kiosk PIN, upload, sign-in/sign-out and token replay with real test credentials on a dedicated test school
- [ ] Confirm kiosk-session cleanup actually executes on a future valid-format PIN verification; no live PIN submission was performed in this audit
- [ ] Review scaling beyond 100 teacher PIN credentials per school and error handling under simultaneous requests

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
