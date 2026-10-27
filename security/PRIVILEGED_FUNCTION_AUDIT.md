# SchoolFlow audit — 15 authenticated-callable SECURITY DEFINER functions
Date: 27 October 2026. Source: current connected Supabase PostgreSQL function definitions, execution grants, and Security Advisor. **Read-only review; not a penetration test.**

## Confirmed
- **15/15** functions grant EXECUTE to the `authenticated` role.
- **0/15** grant EXECUTE to `anon`.
- The listed functions have explicit caller or school membership checks, except **is_school_active**, which deliberately returns a boolean for any supplied school ID to any signed-in caller. This is not by itself a cross-school data leak, but it reveals whether a known school ID is active and deserves a least-privilege review.
- No demonstrated bypass of admin or platform permissions was found in the reviewed source code.
- **Live identity-based invocation tests have not been performed**, so authorization cannot be certified.

## Function-by-function review
| Function | Observed guard | Initial disposition |
|---|---|---|
| activate_teacher_login | Checks is_school_admin(target teacher's school), verified matching email and uniqueness | Guard present; test foreign-school teacher IDs |
| admin_update_teacher_profile | Checks is_school_admin(target teacher's school) | Guard present; test cross-school ID |
| claim_teacher_invitation | Requires authenticated verified email and matching active, unclaimed teacher profile | Guard present; test duplicate and unrequested invitations |
| is_assigned_class | Matches auth.uid, teacher membership, active teacher, class and school | Guard present |
| is_platform_owner | Matches platform_owners.user_id to auth.uid | Guard present |
| is_school_active | Tests arbitrary supplied school UUID for active state; no caller membership predicate | **Review disclosure/necessity** |
| is_school_admin | Checks active school, school_members.user_id = auth.uid and admin role | Guard present |
| is_school_member | Checks active school and school_members.user_id = auth.uid | Guard present |
| platform_list_payments | Requires is_platform_owner | Guard present |
| platform_list_schools | Filters results through is_platform_owner | Guard present |
| platform_list_subscriptions | Requires is_platform_owner | Guard present |
| platform_record_payment | Requires is_platform_owner and validates amounts/method/date/length | Guard present; check null input handling |
| platform_set_school_active | Requires is_platform_owner and school existence | Guard present |
| platform_update_subscription | Requires is_platform_owner; validates plan/status/date/grace | Guard present; check null input handling |
| school_subscription_notice | Requires target-school admin or platform owner | Guard present; verify foreign-school behavior |

## Recommended next steps
1. Use two fictional school tenants, authenticated admin and teacher accounts, and a platform-owner test account to execute positive/negative RPC tests and verify no cross-school side effects.
2. Decide whether `is_school_active` must be directly callable by *every* signed-in user; if not, consider a guarded wrapper and adjust grants only after checking dependencies in RLS policies.
3. Harden null validation for `platform_record_payment` and `platform_update_subscription` as appropriate: SQL `NULL` inputs can pass `IF expression THEN` checks whose expression evaluates to `NULL`. Table constraints may already reject these; verify before changing.
4. Run security advisors again after measured changes and check all function grants plus RLS dependencies.
5. Do not revoke all EXECUTE grants or switch SECURITY DEFINER globally: doing so can break deliberately protected data flows.

**Result:** Warning classification is not proof of vulnerabilities. This review found no obvious direct cross-school bypass among the 15 flagged definitions, but it does **not** clear SchoolFlow for real student data.
