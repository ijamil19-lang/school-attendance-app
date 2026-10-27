# SchoolFlow — release readiness checklist (27 October 2026)

Status: **Pre-launch; not yet cleared for real pupil data or multiple paying schools.**

## Checked on 27 October 2026
- [x] Admin navigation code groups **Settings first** and attendance/exam reports in the **Reports** group.
- [x] Supabase project `school-attendance-saas` is active.
- [x] All 39 tables in the public schema have row-level security enabled (catalogue check). **This alone does not prove tenant isolation.**
- [x] Supabase security and performance advisor checks run.
- [x] Sample privileged functions reviewed: `activate_teacher_login`, `admin_update_teacher_profile`, `claim_teacher_invitation`, `platform_list_payments`, `platform_list_schools`, and `platform_list_subscriptions` have explicit identity/role checks in their bodies. Other flagged functions remain unreviewed.

## Before launch — required
- [ ] Enable **Leaked Password Protection** in Supabase Auth settings. Security Advisor flags it as disabled: https://supabase.com/docs/guides/auth/password-security
- [ ] Review all **15 externally callable SECURITY DEFINER functions** individually. Verify role checks and least-privilege EXECUTE grants; don't revoke necessary application RPCs blindly: https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable
- [ ] Review **28 RLS-enabled tables with no policies**. Many may be deliberately accessed only through guarded RPC functions; verify this and document the rationale rather than adding blanket policies: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy
- [ ] Test two distinct school accounts: admins and teachers must **not** read or update the other school's students, reports, fees, teachers, exam results, or photos.
- [ ] Test teacher-only account can access only assigned classes and subjects; verify expired/suspended school access and kiosk lockout.
- [ ] Test school-admin and platform-owner permissions independently, including cross-school RPC calls.
- [ ] Validate kiosk PIN attempts, GPS checks, device behaviour, and photo-access permissions on real mobile hardware in Pakistan.
- [ ] Test students' attendance, teacher attendance, fees (including sibling discounts), wages, exam entry, whole-class results, certificates and every PDF/CSV export end to end.
- [ ] Check school name and logo appear on every exported report; test missing-logo fallback.
- [ ] Audit student/guardian/teacher personal information: lawful basis/consent, retention policy, restricted storage, backups, restore test, and deletion/export handling.
- [ ] Verify email invites/reset links and WhatsApp guardian notices with test accounts. Do not send real parent messages during test.
- [ ] Review performance advisor's **39 unindexed foreign keys** and add needed indexes after examining production query plans.
- [ ] Run browser/mobile accessibility and navigation checks on the deployed admin page, including Settings and all Reports buttons.
- [ ] Test payment/renewal/trial flows and platform super-admin suspension/reactivation with fictional schools.

## Change management
Make a database backup before any authorization/policy changes. Deploy to a staging environment, run permission regression tests, and only then deploy to production.

This checklist was generated from a read-only audit; it does **not** represent a complete penetration test or sign-off.
