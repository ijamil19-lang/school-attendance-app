# SchoolFlow Attendance Starter

## Included
- `index.html`: responsive, standalone interactive prototype with fictional records; no dependencies.
- `schema.sql`: initial Supabase multi-tenant database and read-only RLS policies.

## Run the demo
Open `index.html` in a browser. Try the Register, Class List, Reports and Tablet Check-in views. Check-in codes DEMO001–DEMO008 are deliberately insecure demo-only values. Data is reset on refresh and never sent to a server.

## Set up database
1. Create a **new** Supabase project (do not use a client's existing database).
2. Open SQL Editor and review `schema.sql` before running.
3. Run SQL. No sample children or school records are created.
4. Implement authenticated server-side writes, school onboarding, staff assignments, audit triggers, and secure rotating check-in credentials before any real-world deployment.

## Important security notes
This is a UI prototype, not a deployable school attendance service. Do not use real children's data or the demo check-in codes. Avoid biometric processing until a jurisdiction-specific DPIA, consent/objection process, alternatives, and safeguards are approved. No face images or templates are collected.
