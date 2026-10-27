# SchoolFlow backup and disaster-recovery runbook

Last verified: 27 October 2026. Project reference: `ufddjrebwqfqaqppdgxj` (EU West). This runbook describes *checks and a procedure*, **not** proof that a restorable backup has been taken.

## Immediate launch blocker — verify backup availability

1. Project owner signs into [Database > Backups](https://supabase.com/dashboard/project/ufddjrebwqfqaqppdgxj/database/backups). Record the most recent backup timestamp, backup type, retained recovery range and the plan actually enabled.
2. The connected administrative tools in this environment do **not** expose backup history. Do not mark backup readiness as passed until a backup is visible and a restore has been tested.
3. Do **not** use the production project's Restore button as a test: restoring production can overwrite newer data and cause downtime.
4. Arrange a test restore into an isolated Supabase project, with appropriate authorisation and budget approval. Do not expose real student/parent/teacher data outside an approved environment.
5. Document recovery-point objective (acceptable data loss), recovery-time objective (acceptable downtime), responsible people, encrypted backup location, retention and test cadence.

## Scope of protection

- Database: school memberships, student/teacher profiles, attendance, fees, payments, payroll, exam headers/marks, family links, permissions, kiosk credentials and audits.
- Supabase Storage **file bytes are not part of ordinary database backups**, even though object metadata is in Postgres. Back up both buckets (`school-logos`, `schoolflow-teacher-photos`) using an approved secure Storage copy/export method. Preserve paths and restrict access to teacher photographs.
- Edge Function source and configuration, environment secrets, Auth redirect settings, GitHub Pages frontend and deployment versions also need independent recovery material. Never commit secrets to GitHub.
- **Do not restore authentication sessions or kiosk tokens as trusted after an incident**; force renewed authentication/re-enrolment as the incident response requires.

## Non-destructive readiness test (performed 2026-10-27)

- Project status: `ACTIVE_HEALTHY`. School status: 2 active schools at time of test.
- Cross-school integrity query across examination marks, fee charges/payments, wages/payments, teacher-class exam assignments, student-family links and student attendance: **zero mismatches in all eight checks**.
- A successful integrity query verifies the current database state; it does not guarantee a backup exists or is restorable.
- Production data and accounts were not modified by this check.

## Data-integrity SQL (read-only; rerun after any isolated restore)

```sql
select
 (select count(*) from public.sf_exam_results r join public.sf_exams e on e.id=r.exam_id join public.students s on s.id=r.student_id where r.school_id<>e.school_id or r.school_id<>s.school_id) as exam_school_mismatches,
 (select count(*) from public.sf_student_fees f join public.students s on s.id=f.student_id where f.school_id<>s.school_id) as fee_student_mismatches,
 (select count(*) from public.sf_fee_payments p join public.sf_student_fees f on f.id=p.fee_id where p.school_id<>f.school_id) as fee_payment_mismatches,
 (select count(*) from public.sf_teacher_wages w join public.teacher_profiles t on t.id=w.teacher_id where w.school_id<>t.school_id) as wage_teacher_mismatches,
 (select count(*) from public.sf_wage_payments p join public.sf_teacher_wages w on w.id=p.wage_id where p.school_id<>w.school_id) as wage_payment_mismatches,
 (select count(*) from public.sf_teacher_exam_classes a join public.teacher_profiles t on t.id=a.teacher_id join public.classes c on c.id=a.class_id where a.school_id<>t.school_id or a.school_id<>c.school_id) as assignment_mismatches,
 (select count(*) from public.sf_family_students fs join public.sf_families f on f.id=fs.family_id join public.students s on s.id=fs.student_id where fs.school_id<>f.school_id or fs.school_id<>s.school_id) as family_mismatches,
 (select count(*) from public.attendance_records a join public.students s on s.id=a.student_id where a.school_id<>s.school_id) as attendance_school_mismatches;
```

## Isolated recovery acceptance test

1. Before restoring, record counts of schools, students, teacher profiles, fee charges/payments, wage charges/payments, attendance records, exam headers and exam marks; record migration and Edge Function versions. Avoid exporting identifying school data into public logs.
2. Restore into a **separate**, approved test project. If a database clone is used, separately restore Storage file bytes and configure Edge Functions, API/Auth settings, external messaging and secrets. **Disable outbound WhatsApp, email and payment integrations in test** to prevent real messages or payments.
3. Run integrity SQL above; require all mismatch counts = 0. Compare counts and representative historical reports against the recorded snapshot, accounting for backup point-in-time.
4. Using dedicated test identities (not real parent or teacher credentials), verify tenant isolation and inactive-school/teacher access denial, attendance view, marks, school logo, kiosk photo and exports.
5. Check backup age, restore duration, document any missing photo objects, then destroy test copies under the approved retention policy.
6. Record pass/fail, date, restore operator, backup timestamp, sample evidence, errors and the next scheduled test.

## Official references

- https://supabase.com/docs/guides/platform/backups
- https://supabase.com/docs/guides/platform/clone-project
- https://supabase.com/docs/guides/storage/management/download-objects

## Status

- [x] Read-only production database integrity audit.
- [x] Written recovery and isolated restore checklist.
- [ ] Confirm latest database backup timestamp and retention in the Supabase dashboard.
- [ ] Confirm secure encrypted backup/export of both Storage buckets.
- [ ] Restore a backup to an isolated environment and complete acceptance checks.
- [ ] Approve RPO/RTO, owner, retention and incident communication plan.
