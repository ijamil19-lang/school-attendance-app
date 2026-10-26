## School-branded reports and exports — 26 October 2026
- [x] Daily attendance, monthly attendance, individual student attendance and teacher attendance PDFs now use school name as heading and attempt to embed the uploaded school logo
- [x] Whole Class Results print/PDF view uses school name and uploaded logo rather than a SchoolFlow heading
- [x] Student report-card existing school-name/logo header retained; removed SchoolFlow 'SF' placeholder if logo not uploaded
- [x] CSV attendance, monthly attendance, whole-class results and teacher Excel exports carry school name in the data; key filenames use school name
- [x] Existing school logo is sourced from the authenticated dashboard's school branding; no school data modified
- [x] Re-fetched admin JavaScript and verified it passes static syntax check
- [ ] Browser export checks: test all PDFs and printouts with uploaded logo (including cross-origin image loading), and without logo; confirm print, page breaks, CSV and Excel
- [ ] Note CSV/Excel files do not support embedding image logos in the ordinary tabular export; school name is included instead

## Whole Class Results date/subject filtering — 26 October 2026
- [x] Replaced mixed Test / Exam dropdown with date picker and separate Subject dropdown under Whole Class Results
- [x] Subjects load dynamically for chosen school class and exam date; duplicate subject entries for different assessments display the assessment title to distinguish them
- [x] Selected subject filters results without changing saved marks; CSV and Print / Save PDF continue using the filtered table
- [x] Backend schoolflow-admin-modules v17 adds school-admin-authorised class_result_date_subjects and subject-scoped class_result_sheet
- [x] Re-read deployed v17 ACTIVE; admin page scripts pass syntax checks; existing historical results remain present
- [ ] Real signed-in browser test: select 6th A, 24/10/2026, Islamiyat and check 3 marks, CSV and PDF
- [ ] Evaluate a separate All subjects on a date mode for combined assessments from multiple exam titles if requested

## Whole class exam/test result sheet — 26 October 2026
- [x] New Whole Class Results panel in admin Exams & Tests with class and assessment selectors
- [x] Matrix shows each student, roll number, subject marks, total and percentage; explicitly distinguishes absent students and missing results; includes past class students present in that assessment
- [x] School-scoped schoolflow-admin-modules v16 action class_result_sheet; verifies active school/admin, class and assessment ownership, returns current students and historical students linked to marks
- [x] CSV download and print/save-as-PDF from new report view
- [x] Re-fetched active backend and GitHub admin HTML, scripts parse successfully
- [ ] Signed-in browser acceptance: choose class and test, verify subject columns and marks, CSV/print layout, missing/absent display, and school isolation
- [ ] Review very large school pagination: current student list is capped at 1,000 and exam list at 500, with a 20,000 result-row safety limit

## Teacher exam submission confirmation — 26 October 2026
- [x] After successful exam/test submission, clear and hide the student marks grid, reset assessment name and total marks, and show an accessible success pop-up
- [x] If validation or the backend returns an error, show an error pop-up and preserve all previously entered marks for correction/retry
- [x] Keep the existing final confirmation before sending marks, disable submit during save, and retain the inline status message
- [x] Verified attendance.html inline JavaScript parses after the change
- [ ] Test one real teacher submission and a validation failure in an authenticated browser to verify visual pop-up and preserved mark inputs

## Exam marks submission atomicity check — 26 October 2026
- [x] Inspected teacher exam endpoint and confirmed active school, linked teacher membership, active teacher, assigned class and subject checks
- [x] Existing exam marks integrity passed: 4 result rows, zero absent-student marks violations and zero invalid present-student marks
- [x] Fixed two-step exam header/marks saving; created transactional service-role-only RPC schoolflow_submit_exam_results_atomic with school/teacher/subject permissions and complete class marks validation
- [x] Rolled-back tests: 3-student valid submission succeeds, unassigned subject is rejected, incomplete class marks rejected, no test exams persisted
- [x] Deployed schoolflow-teacher-exams v5 using atomic RPC; verified ACTIVE and RPC inaccessible to anon/authenticated while service_role can execute
- [x] Production data unchanged: 4 previously saved exam result rows remain
- [ ] Run actual teacher-signed-in marks submission and admin report-card PDF verification in browser, using a dedicated test assessment
- [ ] Consider permission-change concurrency and explicit audit/history for marks edits before broad school rollout

## Multi-subject / multi-class teacher allocation — 26 October 2026
- [x] Admin teacher subject allocation now displays checkboxes for multiple subjects as well as multiple classes, with selected-item counts
- [x] New schoolflow-admin-modules Edge Function v15 action grant_exam_subjects_bulk validates school administrator and active school using existing outer guards, active teacher, classes owned by school, and subjects in school's catalogue
- [x] Maximum of 200 combinations per request; uses upsert with ignoreDuplicates so prior teacher subject permissions are preserved rather than replaced
- [x] Existing one-subject allocation action retained for backwards compatibility
- [x] Subject creation panel refreshes multi-selection and automatically checks newly created subject
- [x] Confirmed admin HTML JavaScript parses successfully; Edge Function ACTIVE v15 and saved database state remains 9 permission rows, 0 cross-school references
- [ ] Browser end-to-end: select two subjects and two classes, save, reload and check four combinations; repeat save and confirm no duplicates
- [ ] Browser authenticated cross-school tests of new bulk API using separate admin accounts; source validation is not equivalent to a live test

## Teacher passwordless invitation remediation — 26 October 2026
- [x] Replaced schoolflow-create-teacher-login v7 with v8: generates Supabase type=invite one-time action link and emails it via existing Resend configuration, without setting a temporary password
- [x] Teacher creation response no longer contains temporary passwords or secret invitation links; new teacher can set their own password on attendance.html invitation landing
- [x] Existing teacher account is left untouched; profile must be active, teacher email valid, active school, and caller a matching school administrator
- [x] An invitation is not sent until the new teacher's profile is linked and school_members teacher role has been assigned
- [x] If mail request fails, workflow attempts to unwind newly created teacher membership, profile link and invitation account; no existing teacher credentials modified
- [x] Admin button changed to Send secure invite; removed teacher password prompt and display, JS passes static syntax validation
- [x] Supabase v8 ACTIVE and GitHub admin source re-fetched
- [ ] Verify RESEND_API_KEY and SCHOOLFLOW_EMAIL_FROM email deliverability using a dedicated test teacher; secrets were not retrieved or exposed
- [ ] Confirm Supabase Authentication Redirect URLs include https://ijamil19-lang.github.io/school-attendance-app/attendance.html and teacher sets password after clicking invitation
- [ ] Run real authenticated invitation flow and cross-school denial tests using test admins; no actual invitations/emails were sent during remediation

## Teacher login and invitation security check — 26 October 2026
- [x] Inspected deployed schoolflow-create-teacher-login v7, schoolflow-manage-teacher-login v2 and schoolflow-invite-teacher v4: all verify signed-in caller, school-specific administrator role and active school
- [x] Database consistency: 0 teachers missing email, 4 teachers with linked logins, 0 missing teacher memberships, 0 wrong-role teacher logins, 0 teachers at suspended schools
- [ ] **Security improvement before production:** schoolflow-create-teacher-login currently includes a temporary password in plain-text email and in an API response. Replace this with a single-use invitation/password-setting link and no password disclosure
- [ ] Independently verify delivered invitation and reset emails using a dedicated test account; no emails sent or account credentials modified during this check
- [ ] Test cross-school teacher invitation with actual signed-in administrators and ensure 403 for unauthorised requests

## Launch readiness check — 26 October 2026 (latest)
- [x] **Critical fix:** teacher-clock.html previously failed JavaScript parsing because an unescaped apostrophe in a GPS error message terminated its string; fixed in commit 553b301 and re-fetched source validates
- [x] Rechecked admin.html and teacher-clock.html inline scripts: both parse successfully
- [x] Verified current versions of 6 main Supabase Edge Functions are ACTIVE; staff attendance report, teacher-account creation and management, school admin modules, kiosk PIN verification and submission contain active-school checks
- [x] Database integrity audit: 2 schools, 6 students, 4 teachers, 4 exam results, 1 fee record and 1 wage record; 0 cross-school exam results; 0 overpaid fee or wage records; 0 active PIN-guess locks
- [ ] **Blocking launch:** complete real browser sign-in as school administrator, create/edit student and teacher, send teacher login invite and test password reset, using non-production test people
- [ ] **Blocking launch:** verify staff kiosk PIN/photo/GPS sign-in and sign-out on actual phone, including school boundary and denied-location scenarios
- [ ] **Blocking launch:** validate two different authenticated school-admin accounts cannot read, edit or issue private links for each other's records
- [ ] **Blocking launch:** verify production privacy notice, safeguarding and data-retention arrangements for student, teacher, GPS and photo records, along with database backups and restore procedure
- [ ] **Blocking launch:** verify email deliverability, production domain/auth redirect allowlist, and subscription/payment flow if launching paid plans
- [ ] Check mobile responsive profile forms and printing/export of attendance and exam reports
- [ ] Certificates (school leaving, character, teacher experience) discussed as next feature but not built; do not advertise them as available
- [ ] Independently verify GitHub Pages deployment and run real authenticated browser workflows; code parse and simulated SQL tests alone do not prove production readiness

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

## Security audit continuation — round 12 (25 October 2026)
- [x] Verified all four kiosk-sensitive tables have RLS enabled and no anon/authenticated direct grants
- [x] PIN verification now rejects ambiguous PINs matching multiple teachers, instead of choosing the last matching teacher (kiosk verify v8)
- [x] PIN verification checks school credential count before the 100-item lookup; over 100 credentials returns an explicit support error rather than silently ignoring teachers beyond the cap
- [x] Re-fetched deployed kiosk verify v8: duplicate-match guard, credential cap, rate limiting, active-school check, and expired-token cleanup all present
- [x] Existing school has only 3 kiosk credentials, so the cap does not affect current PIN tests
- [ ] Implement a scalable PIN lookup for schools exceeding 100 teachers; current deliberate fail-closed cap is a launch limitation
- [ ] Add teacher PIN uniqueness enforcement or admin warning at PIN assignment; ambiguous shared PINs now safely fail verification
- [ ] Run valid/invalid/duplicate PIN flows with a dedicated test school and test kiosk lockout/recovery

## Security audit continuation — round 13 (25 October 2026)
- [x] Exercised schoolflow_kiosk_pin_attempt database routine in rolled-back transactions: five consecutive failures trigger 15-minute lockout
- [x] Confirmed matching teacher ID is rejected while the school lock is active
- [x] Confirmed expired lock permits correct teacher verification and resets attempt counter to zero
- [x] Rechecked production failed-attempt counter after rollback: zero and no active lock; no real PINs or attendance were changed
- [ ] Verify full Edge Function PIN verification and login UI with test-school credentials
- [ ] Evaluate school-wide lockout denial-of-service tradeoff and recovery path for large schools
- [ ] Test concurrent PIN attempts and real device clock-in/out flows

## Security audit continuation — round 14 (25 October 2026)
- [x] Found a race window: teacher can be deactivated after PIN verification but before kiosk attendance submission
- [x] Deployed schoolflow-teacher-kiosk-submit v3 to recheck active teacher and matching school immediately after verifying the token, before GPS/photo processing
- [x] Re-fetched deployed v3 and verified teacher check exists before photo upload; live stored sessions unchanged (22 stored, none active)
- [ ] **Database defence in depth:** schoolflow_kiosk_record_attendance() still lacks active school and teacher checks inside its atomic transaction; attempted migration was blocked and was NOT applied
- [ ] Test the entire verification-to-submission flow with a test teacher deactivated between steps; confirm 403 and no image or clock event created
- [ ] Consider transactional locking or stronger revocation semantics for concurrent account deactivation and attendance submission

## Security audit continuation — round 15 (25 October 2026)
- [x] Applied database migration kiosk_attendance_revalidate_active_teacher to schoolflow_kiosk_record_attendance
- [x] Atomic kiosk attendance function now rejects suspended schools and inactive teachers after locking the verification-session row and before recording clock events
- [x] Verified function still locks the verification-session record and consumes the token on successful attendance
- [x] Verified anon and authenticated roles have no direct EXECUTE access to privileged attendance-recording function
- [x] Re-ran rolled-back actual SQL call tests: missing and expired token submissions rejected with expected expiry error
- [ ] Test deactivation between valid PIN and sign-in on a dedicated test school (no live accounts altered)
- [ ] Confirm real mobile camera, GPS, photo upload and successful one-time clock event end to end
- [ ] Validate post-change clock-in/out with known test credentials; database and API check presence alone do not establish full end-to-end success

## Security audit continuation — round 16 (25 October 2026)
- [x] Tested real schoolflow_kiosk_record_attendance SQL routine inside a transaction, using a newly inserted temporary session and a currently configured kiosk teacher
- [x] Deactivated-teacher scenario rejected with "Teacher account is inactive"
- [x] Suspended-school scenario rejected with "School access suspended"
- [x] Active teacher and active school with invalid GPS rejected before photo/clock-event creation
- [x] Entire SQL test transaction rolled back; subsequent checks found 0 active kiosk sessions, 3 active kiosk teachers, 0 suspended schools and 0 recent attendance clock events
- [ ] Live end-to-end mobile camera/PIN/location workflow with dedicated test credentials is still needed
- [ ] Recheck two-school API isolation using actual signed-in accounts and malicious cross-school identifiers

## Teacher kiosk PIN simplification (25 October 2026)
- [x] Added school-scoped unique index teacher_kiosk_school_pin_unique on keyed PIN fingerprints (HMAC-SHA256); cleartext PINs are not stored
- [x] schoolflow-teacher-kiosk-admin v7 now generates random zero-padded four-digit PINs, retries database uniqueness conflicts and shows the PIN only on the generation response; manual PIN setting is disabled
- [x] schoolflow-teacher-kiosk-verify v9 accepts generated four-digit PINs by fingerprint and preserves older 6–8 digit PBKDF2 PINs for existing teachers
- [x] Administrator UI now has a Generate / Reset 4-digit PIN button and one-time visible PIN handover; mobile kiosk accepts four-digit PINs and older PINs
- [x] Verified deployed Edge Functions, GitHub pages and database unique index
- [ ] Existing 3 teacher PINs are deliberately left unchanged; each teacher needs PIN generation in the admin panel and private delivery before switching
- [ ] Complete live authenticated test generating one four-digit PIN, checking unique assignment and kiosk entry with dedicated test teacher
- [ ] Consider extra lockout and device/IP rate limits because four-digit PINs are less resistant to guessing than six-digit PINs

## Kiosk attendance integrity and reporting checks (26 October 2026)
- [x] Read-only check of actual teacher clock events: four records, three sign-ins and one sign-out, all for Manha Schools System
- [x] All four attendance events reference existing private Storage photos, correct school/teacher folder paths, GPS accuracy, consent, existing school and existing teacher
- [x] No duplicate same-day sign-ins and no sign-out without a prior same-day sign-in (Pakistan date)
- [x] Report Edge Function queries events scoped to authorised school and signs matching school/teacher photo paths for five minutes
- [x] Fixed kiosk GPS error text hardcoding one school's 150-metre accuracy threshold (GitHub teacher-clock.html)
- [ ] Full live mobile sign-in/out and authorised admin reporting should be tested with a dedicated test teacher; this audit did not create attendance events or perform authenticated browser test
- [ ] Verify GPS-denied and GPS-inaccurate error messages on an actual phone; ensure the administrator configured the right boundary for each school

## Security audit continuation — cross-school permissions (26 October 2026)
- [x] Simulated authenticated Green Valley administrator in rolled-back SQL transaction: zero Manha school members and teacher profiles visible, own school member visible
- [x] Simulated authenticated Manha teacher in rolled-back SQL transaction: zero Green Valley school members and teacher profiles visible, own teacher profile visible
- [x] Inspected privileged Edge Functions: teacher attendance report v4, kiosk admin v7, geofence admin v2, admin modules v13; all check signed-in user and school admin membership, and active school
- [x] Checked live data: 1 generated four-digit PIN fingerprint, zero duplicate generated PIN fingerprints, zero clock events with missing Storage photos, zero active kiosk sessions
- [ ] Perform actual two-school authenticated HTTP/API tests using two dedicated test accounts; database role simulations and static Edge Function review do not establish end-to-end API isolation
- [ ] Verify signed private photo URLs expire on real devices and cannot be created for another school's files
- [ ] Evaluate kiosk short-PIN brute-force tradeoffs (school-wide five-failure lockout), including device/IP rate limits and admin recovery

## Security audit continuation — round 18 (26 October 2026)
- [x] Found PIN rotation gap: old previously verified kiosk session could survive until its 120-second expiration
- [x] Added active database trigger schoolflow_revoke_teacher_sessions_after_pin_change on teacher_kiosk_credentials updating pin_hash; changes atomically revoke the corresponding teacher's issued kiosk sessions
- [x] Revoked anonymous and ordinary authenticated direct execute rights on security-definer trigger function
- [x] Transactional regression test: temporary active kiosk session count went from 1 before PIN rotation to 0 afterward; transaction rolled back with no live credentials or attendance changed
- [x] Verified trigger enabled and no test credential hashes persisted
- [ ] Perform authenticated end-to-end test: verify PIN, reset PIN, submit with the old session and expect rejection
- [ ] Address school-wide five-failure lockout denial-of-service tradeoff for kiosk PIN verification; a malicious caller can temporarily lock every teacher out
- [ ] Validate real cross-school API access using dedicated authenticated school accounts and signed photo URLs

## Security audit continuation — PIN guessing mitigation (26 October 2026)
- [x] Replaced one school-wide five-failure lockout with scoped repeated-PIN guessing limits (5 failures per PIN guess) and an overall school backstop of 60 failures in 15 minutes
- [x] Created teacher_kiosk_pin_guess_limits with RLS enabled, no public grants and school-scoped keyed fingerprints; no plaintext PIN attempts stored
- [x] Deployed schoolflow_kiosk_pin_attempt_v2 as service-role-only RPC and switched schoolflow-teacher-kiosk-verify to v10
- [x] Rolled-back SQL tests: same PIN key locks after five failures, whole school remains open, a different valid teacher key remains allowed, and 60 distinct failures still trigger school backstop
- [x] Verified v10 active and calling new RPC, anon/authenticated cannot execute RPC, service_role can; no persisted test rows, active sessions, or live school lockouts
- [ ] Test real mobile wrong PIN behavior, successful PIN after other failed guesses, and 60-failure abuse response with dedicated accounts; do not perform abuse tests against production school
- [ ] Evaluate device/IP-aware throttling and gateway-level rate limiting; the remaining school-wide 60-failure backstop can still be deliberately triggered
- [ ] Implement routine cleanup of aged PIN-guess rate-limit rows if necessary

## Security audit continuation — PIN lockout recovery and storage upkeep (26 October 2026)
- [x] Transactional PIN limiter regression: five failures for one guess activate its 15-minute lock
- [x] Matching teacher for locked key rejected; after simulated expiry the matching teacher allowed and guess counter reset
- [x] Confirmed protected guess-limit table inaccessible directly to anon/authenticated, and privileged limiter function cannot be executed by these roles
- [x] Deployed schoolflow-teacher-kiosk-verify v11: after successful PIN verification, remove only the school's PIN guess records older than seven days; failed cleanup does not block verification
- [x] Confirmed deployed version active and cleanup code occurs after successful PIN check; no live guess-limit rows or active guess locks at inspection
- [ ] Live device validation of four-digit PIN login after rate-limit v11 update
- [ ] Confirm seven-day cleanup executes with test-school aged guess data; no production test rows were inserted persistently
- [ ] Consider network/IP-based upstream rate limiting and malicious denial-of-service prevention; 60-failure global lock remains reachable

## Security audit continuation — private photo signed links (26 October 2026)
- [x] Verified schoolflow-teacher-photos bucket remains private (8 stored objects); existing object paths all match school/teacher and registered/clock photo naming scheme
- [x] Hardened attendance report v5 to sign only the expected school's teacher clock JPEG file path, not merely a folder prefix
- [x] Hardened kiosk administration v8 and kiosk PIN verification v12 to sign only matching school's teacher registered photos with expected filename and image extension
- [x] Re-fetched three ACTIVE functions; existing saved photo references have zero mismatches under new validators
- [x] Signed URL expiry configured to 120 seconds for registered photos and 300 seconds for attendance photos
- [ ] Actual signed-link expiry and revocation test must be run with an authorised generated test URL; inspecting configured expiry alone is not an end-to-end test
- [ ] Real authenticated test proving wrong-school users cannot obtain signed URLs or read photo objects by API
- [ ] Review exposure of temporary signed photo URLs in logs/browser history and document photo retention/deletion obligations

## Security audit continuation — student finance, exams and storage isolation (26 October 2026)
- [x] Confirmed sf_student_fees, sf_teacher_wages, sf_exams and sf_exam_results have RLS enabled with no direct SELECT grants to anon/authenticated; current rows: 1 fee, 1 wage, 2 exams, 4 results
- [x] Simulated Green Valley authenticated administrator inside read-only rolled-back SQL transaction: 0 Manha students and 0 private teacher photos visible
- [x] Examined storage.objects school-logos INSERT/UPDATE/DELETE policies; folder school ID must satisfy is_school_admin; teacher photo bucket has no direct object SELECT policy for ordinary users
- [x] Checked stored financial/academic foreign-school references: 0 mismatched student-fee, teacher-wage, student-exam-result and class-exam associations
- [x] Reviewed schoolflow-admin-modules v13: validates JWT user, school-specific admin membership, active school and scopes operations to requested school
- [ ] Test finance/exam module Edge API from two real signed-in school accounts; service-role endpoints are not fully proven by simulated SQL or static source audit
- [ ] Test unauthenticated and wrong-school requests to signed teacher-photo endpoints with dedicated test accounts

## Security audit continuation — payment overpayment and school ownership (26 October 2026)
- [x] Identified race condition in admin API: outstanding balance checked before fee/wage insert, which could permit concurrent overpayment without a database check
- [x] Deployed transactional BEFORE INSERT/UPDATE database guards on sf_fee_payments and sf_wage_payments, locking the relevant parent row before validating school ownership, positive amounts and cumulative balance
- [x] Rolled-back fee tests: reject already-paid overpayment, reject cross-school fee, accept valid partial amount, reject second payment exceeding remaining balance
- [x] Rolled-back wage tests: reject cross-school wage, accept valid partial amount, reject second payment exceeding remaining balance
- [x] Confirmed both triggers enabled and unchanged production totals: one fee payment (2,000.00), one wage payment (28,000.00)
- [ ] Perform true concurrent two-connection payment test using dedicated test school and test accounts; sequential transactional tests verify checks but do not prove race behaviour under simultaneous client calls
- [ ] Validate money calculations under payment edits, parent-fee/wage edits and reversal/refund business rules before general launch

## Security audit continuation — round 24: adjustments and exam integrity (26 October 2026)
- [x] Deployed database fee and wage parent safeguards before insert/update: verify referenced student/teacher belongs to the school and ensure adjusted balance is nonnegative and not below payments already recorded
- [x] Rolled-back tests: fee and wage totals cannot be lowered below paid amounts; valid increases allowed; cross-school fee reassignment rejected
- [x] Deployed exam-result guard before insert/update enforcing matching school and class for student and exam
- [x] Deployed exam guard preventing class/school reassignment after results have been recorded and ensuring class belongs to school
- [x] Rolled-back tests: wrong-school exam result rejected, moving recorded exam to another class rejected, benign in-school result update accepted
- [x] Verified four new database triggers enabled; existing records show 0 overpaid fee records, 0 overpaid wage records and 0 exam-result class/school mismatches
- [x] Existing data unchanged: four exam results, one fee payment and one wage payment
- [ ] Verify downstream workflow if a student changes class after results were recorded; direct student class changes may leave historical exam results inconsistent without archive rules
- [ ] Perform real authenticated user/API and concurrent payment tests using dedicated test accounts before launch

## Security audit continuation — round 25: student promotions and historical results (26 October 2026)
- [x] Added student class-transfer database trigger: destination class must belong to same school; prohibit transfer to another school when exam results or fees exist
- [x] Updated exam-result ownership trigger to preserve legitimate updates of existing historical exam results after same-school student promotion, while rejecting new results linked to previous classes and all wrong-school records
- [x] Rolled-back tests: student promoted to another same-school class, existing historical result update accepted, new result from previous class rejected, cross-school transfer rejected, return to original class accepted
- [x] Confirmed existing 4 exam results remain unchanged after tests; no real students were transferred
- [ ] Verify user-facing result-sheet UI displays historical results after promotion; current admin report queries results by selected current class, so historic records may not be shown in that view
- [ ] Consider explicit class-enrolment history and controlled cross-school transfer workflow for future versions, including foreign-key handling for old records
- [ ] Perform authenticated cross-school API tests with dedicated signed-in test users

## Security audit continuation — round 26: historical result reporting (26 October 2026)
- [x] Found report visibility bug: student_result_sheet filtered exams to student's selected/current class, hiding assessments from previous classes after promotion
- [x] Deployed schoolflow-admin-modules v14: student still must belong to requested active school and selected current class, but assessment lookup includes all exam classes within same school
- [x] Rolled-back promotion regression using a student with saved results: old report class filter returned 0; revised school-scoped all-history query returned 1
- [x] Updated admin result-sheet guidance to explicitly include previous classes in historical results
- [x] No actual students moved and no results or marks changed
- [ ] End-to-end authenticated browser check of historical results and generated CSV/PDF after a real promotion, including result metadata and period filters
- [ ] Consider showing the original exam class beside each historical result when the UI is extended

## Dashboard staff attendance summary (26 October 2026)
- [x] Added Staff Attendance Overview to admin dashboard below the student attendance overview
- [x] Daily staff donut chart displays active teachers grouped into On site, Signed out and No sign-in, with counts and percentages
- [x] Teacher-by-teacher dashboard table includes first sign-in, latest sign-out, and status in Pakistan time
- [x] Dashboard date changes and Today button refresh the staff overview; class filtering remains specific to student attendance
- [x] Staff data fetched using existing authenticated, admin-authorised, school-scoped teacher attendance report endpoint; no new public database grants
- [x] Added View full staff attendance button leading to detailed staff attendance section
- [x] Verified GitHub page updates and report endpoint school-scoped authentication; no teacher, student, GPS, or attendance records modified
- [ ] Confirm page loads and date filtering on an actual signed-in administrator browser; test zero-attendance day and staff sign-out refresh

## Required student and teacher profile registration + marital status (26 October 2026)
- [x] Changed student and teacher registration profile sections from optional to required/core details and expanded them by default
- [x] Student required fields in admin form: name, admission number, class, date of birth, admission date, guardian name/relationship/phone, home address
- [x] Teacher required fields in admin form: name, staff ID, phone, address, joining date, employment status, marital status; email and emergency contact remain optional
- [x] Added nullable teacher_private_profiles.marital_status with constrained options Single, Married, Divorced, Widowed, Prefer not to say; existing records unaffected
- [x] Included marital status in teacher edit/view and private-profile upsert, and date validation happens before creating base record
- [x] Corrected editRecord function to async to support loading existing private student profile
- [x] GitHub source verified for required fields, saved field, and early date validation
- [ ] Browser end-to-end: add/edit students and teachers, verify empty mandatory fields block save and marital status persists
- [ ] Future consideration: server-side atomic profile registration so API clients cannot bypass browser-required checks and create partial profiles

## Teacher email required for login links (26 October 2026)
- [x] Teacher email is required on the admin add/edit profile form and validated before the record is saved
- [x] Confirmed admin script parses after the change; teacher PIN-only attendance kiosk remains independent of email
- [ ] Test browser teacher creation with missing/invalid and valid email, and then send teacher invitation
- [ ] Check existing teacher profiles without email and request completion before activating their web login

## Registration form redesign (26 October 2026)
- [x] Redesigned student registration into six labelled cards: student, academic, guardian, consent, additional contacts, and address
- [x] Redesigned teacher registration into three labelled cards: identity/login, employment, and contact/emergency details
- [x] Improved field sizing, responsive 12-column CSS grid, full-width addresses, checkbox consent panels, Save/Clear actions, and visible required-field indicators
- [x] Kept existing form inputs, names, validations, date masks, save flows, and edit-prefill logic
- [x] Fixed teacher edit compatibility with new always-visible cards; verified admin-page JavaScript syntax and required email/marital status fields
- [ ] Perform authenticated browser add/edit form check on desktop and mobile, including editing existing students and teachers and verifying dropdown/date-field behavior

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
