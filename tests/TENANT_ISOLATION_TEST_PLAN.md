# SchoolFlow — cross-school access regression tests

**Purpose:** Verify that a school admin/teacher can never access another school's records. Run on staging with fictional pupils only.

## Test accounts
Create School A and School B; one admin and one teacher for each. Give Teacher A one assigned class/subject and leave a second class unassigned. Use distinct fictional students, exam results, fees, wages, attendance records, kiosk sessions and school logos for each school.

## Required test matrix
| Actor | Action | Expected |
|---|---|---|
| Unauthenticated | Read students, fees, results or teacher photo via REST/storage URL | Denied |
| Admin A | Read, insert, update, delete School B students | Denied |
| Admin A | Read School B tuition payments, wages, exam results or reports | Denied |
| Teacher A | Read or edit School B pupil data | Denied |
| Teacher A | Submit marks for an unassigned class/subject in School A | Denied |
| Teacher A | Submit marks for an assigned class/subject in School A | Allowed |
| Admin A | Access School B attendance PDF/photo via direct URL | Denied |
| Admin A | Call RPC with School B ID or teacher ID | Denied |
| Teacher A | Call admin-only teacher activation/update RPC | Denied |
| Admin A | Invoke platform-only subscription/payment/listing RPC | Denied |
| Platform owner | List subscribed schools | Allowed only for real platform owner |
| Suspended/expired School A | Access prohibited operations | Denied per subscription policy |
| Kiosk visitor | Guess PIN / reuse token / access unrelated staff profile | Rate limited / denied |

## Procedure
1. Save a database backup and use a staging project.
2. Authenticate separately as each test account and retain only the issued **test** access token for that account.
3. Exercise each normal UI route and its equivalent REST or RPC request, including deliberate school_id/class_id/teacher_id changes.
4. Record the status, response shape, user role and audit event, **not** real child data or secrets.
5. Re-run the matrix after every RLS, function or storage-policy edit.
6. Sign off only after all unauthorised actions are denied and intended school-local actions work.

## Live audit notes (27 October 2026)
- All 39 public tables report RLS enabled.
- Supabase Security Advisor identifies 28 RLS-enabled tables without direct policies; these may intentionally be guarded through RPCs.
- Security Advisor flags 15 authenticated-callable SECURITY DEFINER functions for individual review.
- Leaked-password protection is reported disabled.
- No cross-school impersonation or live access test has yet been run.
- Read-only live database follow-up queries were blocked by tool safety checks, so no tenant isolation proof is claimed.

**Do not enable broad RLS policies or revoke application RPCs just to clear advisor warnings**; check each call path, guard and legitimate permission first.
