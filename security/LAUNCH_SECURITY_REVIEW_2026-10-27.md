# SchoolFlow production security review — 27 October 2026

**Launch verdict: NOT CLEARED for real children’s data.** Read-only technical inspection completed; no live records or policies changed.

## Verified from connected Supabase
- Privileged RPC grants: `schoolflow_submit_exam_results_atomic`, `schoolflow_kiosk_pin_attempt`, `schoolflow_kiosk_pin_attempt_v2`, `schoolflow_kiosk_record_attendance` — **anonymous=false, authenticated=false, service_role=true**.
- Security Advisor: 28 RLS tables with no direct policies (previous catalog review: RLS enabled, default deny); 15 authenticated-callable SECURITY DEFINER functions (previous SQL review found identity/role checks on most; school activity helper reveals active status); **leaked-password protection disabled**.
- Storage buckets: `schoolflow-teacher-photos` PRIVATE; `school-logos` PUBLIC (2MB limit). Three logo INSERT/UPDATE/DELETE RLS policies require `is_school_admin` for the school ID extracted from the folder path.
- 18 deployed Edge Functions source-reviewed for basic guard signatures. 15 have explicit `auth.getUser()` and `school_members` references (authorization logic requires runtime tests); 3 public functions are `schoolflow-teacher-kiosk-verify`, `schoolflow-teacher-kiosk-submit`, `schoolflow-kiosk-branding`.
- Kiosk verify source: PBKDF2/hashed PIN, guess attempts, short-lived session; submit source: validates session, school/teacher active, geofence, camera JPEG and invokes trusted RPC.
- Performance Advisor: 39 unindexed foreign keys, 1 unused index, 1 duplicate index.

## Required before real data
1. Enable leaked-password protection under Supabase Authentication settings: https://supabase.com/docs/guides/auth/password-security
2. Run real authenticated negative/positive tests in staging with two distinct fictional schools, two admins, teachers and platform owner. Test forged school/teacher/class IDs in REST, RPC and Edge Functions.
3. Test all 18 Edge Functions' negative permission paths, including service-role operations and untrusted input; ensure deliberately public branding returns no private school information.
4. Test teacher photo storage inaccessible through direct and guessed URLs without a valid signed URL; confirm link expiry.
5. Review the public kiosk PIN verification implementation with adversarial rate-limit and replay tests; verify no unauthorised user can mint or reuse a session.
6. Verify independent backup/restore to staging, disaster recovery, password reset, suspension and subscription expiry, privacy notice and retention schedule, appropriate handling of children’s data under local law.
7. Test fee, attendance, teacher/parent notifications, wages, exam and PDF workflows end-to-end on real devices using fictional records.

## Restrictions
This review cannot prove the absence of vulnerabilities or certify legal compliance. No external pen-test, independent restore, production impersonation or storage signed-URL tests performed. No permissions changed to silence advisors; those changes need backup, staging and regression tests.
