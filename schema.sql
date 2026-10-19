-- SchoolFlow multi-tenant schema (Supabase PostgreSQL). Run in a NEW project.
-- This is an initial secure data model, not a production compliance certification.
create extension if not exists pgcrypto;
create table public.schools (id uuid primary key default gen_random_uuid(), name text not null, timezone text not null default 'Europe/London', created_at timestamptz not null default now());
create table public.school_members (school_id uuid not null references public.schools(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade, role text not null check(role in ('owner','admin','teacher','attendance_staff')), primary key(school_id,user_id));
create table public.classes (id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade, name text not null, unique(school_id,name), unique(id,school_id));
create table public.students (id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade, class_id uuid not null, student_number text not null, display_name text not null, active boolean not null default true, created_at timestamptz not null default now(), unique(school_id,student_number), unique(id,school_id), foreign key(class_id,school_id) references public.classes(id,school_id));
create table public.attendance_days (id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade, class_id uuid not null, attendance_date date not null, state text not null default 'draft' check(state in ('draft','confirmed')), confirmed_by uuid references auth.users(id), confirmed_at timestamptz, unique(school_id,class_id,attendance_date), unique(id,school_id), foreign key(class_id,school_id) references public.classes(id,school_id));
create table public.attendance_records (id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade, day_id uuid not null, student_id uuid not null, status text not null default 'unmarked' check(status in ('unmarked','present','absent','late','left_early')), checkin_at timestamptz, note text, updated_by uuid references auth.users(id), updated_at timestamptz not null default now(), unique(day_id,student_id), foreign key(day_id,school_id) references public.attendance_days(id,school_id), foreign key(student_id,school_id) references public.students(id,school_id));
create table public.attendance_audit (id bigint generated always as identity primary key, school_id uuid not null references public.schools(id) on delete cascade, attendance_record_id uuid not null references public.attendance_records(id), changed_by uuid references auth.users(id), old_status text, new_status text, changed_at timestamptz not null default now());
-- Restrict all tables by default. Do not expose client-side writes until
-- reviewed server-side operations and audited staff authorization are deployed.
alter table public.schools enable row level security;
alter table public.school_members enable row level security;
alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.attendance_days enable row level security;
alter table public.attendance_records enable row level security;
alter table public.attendance_audit enable row level security;
-- SECURITY DEFINER lookup avoids recursive RLS evaluation on school_members.
create or replace function public.is_school_member(target_school uuid)
returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.school_members m where m.school_id=target_school and m.user_id=(select auth.uid()));
$$;
revoke all on function public.is_school_member(uuid) from public;
grant execute on function public.is_school_member(uuid) to authenticated;
create policy schools_read on public.schools for select to authenticated using(public.is_school_member(id));
create policy members_read on public.school_members for select to authenticated using(public.is_school_member(school_id));
create policy classes_read on public.classes for select to authenticated using(public.is_school_member(school_id));
create policy students_read on public.students for select to authenticated using(public.is_school_member(school_id));
create policy days_read on public.attendance_days for select to authenticated using(public.is_school_member(school_id));
create policy records_read on public.attendance_records for select to authenticated using(public.is_school_member(school_id));
create policy audit_read on public.attendance_audit for select to authenticated using(public.is_school_member(school_id));
-- No browser INSERT/UPDATE/DELETE policies: use reviewed server-side RPC/Edge Functions
-- that check teacher class assignment, school membership and role before writes.
-- Production follow-ups: audit triggers, class teacher assignments, time-zone-aware
-- late rules, transactional check-in, rate limits, signed short-lived QR tokens,
-- anti-replay nonce, attendance confirmation, and retention/deletion controls.
