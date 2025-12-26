-- Profit Pulse EduConnect - FINAL COMPLETE PRODUCTION SCHEMA (v6)
-- ARCHITECT REVIEW: FIXED Foreign Key Constraints for Seed Data.
-- UPDATE: Explicitly seeding 'auth.users' to allow 'profiles' creation.

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto"; -- Required for password hashing in seed data

-- ==========================================
-- 1. ENUMERATED TYPES
-- ==========================================
do $$ begin
    create type public.user_role as enum ('super_admin', 'admin_staff', 'university', 'consultancy', 'agent', 'student');
    create type public.entity_status as enum ('pending', 'approved', 'rejected', 'suspended', 'active');
    create type public.admission_status as enum ('draft', 'pending', 'reviewing', 'approved', 'reverted', 'rejected', 'completed', 'cancelled');
    create type public.transaction_type as enum ('credit', 'debit');
    create type public.commission_type as enum ('percentage', 'flat', 'oneTime');
    create type public.support_ticket_status as enum ('open', 'in_progress', 'resolved', 'closed');
    create type public.notification_type as enum ('info', 'warning', 'success', 'error', 'action_required', 'marketing');
    create type public.course_level as enum ('UG', 'PG', 'Diploma', 'Phd', 'Certificate');
    create type public.study_mode as enum ('regular', 'distance', 'online', 'part-time');
exception
    when duplicate_object then null;
end $$;

-- ==========================================
-- 2. CORE PROFILES
-- ==========================================
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text unique not null,
    full_name text not null,
    phone text,
    role public.user_role not null default 'university',
    status public.entity_status not null default 'pending',
    avatar_url text,
    fcm_token text, 
    last_login timestamp with time zone,
    staff_permissions jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 3. ENTITIES
-- ==========================================

create table if not exists public.universities (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id) on delete cascade,
    name text not null,
    abbreviation text,
    established_year int,
    type text,
    registration_no text,
    accreditation text,
    ranking int,
    authorized_person text,
    contact_email text,
    contact_phone text,
    website text,
    address text,
    city text,
    state text,
    country text default 'India',
    description text,
    facilities text[], 
    documents text[],
    logo_url text,
    banner_url text,
    wallet_balance decimal(15,2) default 0.00,
    total_received decimal(15,2) default 0.00,
    status public.entity_status default 'pending',
    permissions jsonb default '{"courses": true, "admissions": true, "ledger": true, "documents": true, "wallet": true}'::jsonb,
    bank_details jsonb default '{}'::jsonb, 
    infrastructure_rating decimal(3,1), 
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.consultancies (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id) on delete cascade,
    name text not null,
    owner_name text,
    registration_no text,
    contact_email text,
    contact_phone text,
    address text,
    website text,
    logo_url text,
    commission_type public.commission_type default 'percentage',
    commission_value decimal(15,2) default 0.00,
    wallet_balance decimal(15,2) default 0.00,
    total_collected decimal(15,2) default 0.00,
    net_profit decimal(15,2) default 0.00,
    status public.entity_status default 'pending',
    bank_details jsonb default '{}'::jsonb,
    students_count int default 0,
    verification_documents jsonb default '[]'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.agents (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id) on delete cascade,
    consultancy_id uuid references public.consultancies(id) on delete cascade,
    name text not null,
    contact_email text,
    contact_phone text,
    wallet_balance decimal(15,2) default 0.00,
    commission_rate decimal(5,2) default 0.00,
    status public.entity_status default 'pending',
    verification_documents jsonb default '[]'::jsonb,
    total_earnings decimal(15,2) default 0.00,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 4. MARKETING & CREATIVES
-- ==========================================
create table if not exists public.creatives (
    id uuid primary key default uuid_generate_v4(),
    consultancy_id uuid references public.consultancies(id) on delete cascade,
    title text not null,
    description text,
    image_url text not null,
    tags text[],
    is_active boolean default true,
    views int default 0,
    shares int default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 5. COURSES
-- ==========================================
create table if not exists public.master_courses (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    code text unique,
    stream text,
    level public.course_level,
    duration text,
    eligibility text,
    description text,
    semesters int,
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.university_courses (
    id uuid primary key default uuid_generate_v4(),
    university_id uuid references public.universities(id) on delete cascade,
    master_course_id uuid references public.master_courses(id) on delete cascade,
    university_fee decimal(15,2) not null,
    display_fee decimal(15,2) not null,
    fee_structure jsonb,
    commission_type public.commission_type default 'percentage',
    commission_value decimal(15,2),
    intake_capacity int,
    seats_filled int default 0,
    is_active boolean default true,
    specialization text,
    mode_of_study public.study_mode default 'regular',
    medium_of_instruction text default 'English',
    entrance_exam text,
    placement_stats jsonb default '{}'::jsonb,
    hostel_available boolean default false,
    scholarship_available boolean default false,
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(university_id, master_course_id)
);

-- ==========================================
-- 6. ADMISSIONS
-- ==========================================
create table if not exists public.admissions (
    id uuid primary key default uuid_generate_v4(),
    admission_number text unique,
    student_name text not null,
    student_email text,
    student_phone text,
    dob date,
    gender text,
    address text,
    university_id uuid references public.universities(id),
    course_id uuid references public.university_courses(id),
    consultancy_id uuid references public.consultancies(id),
    agent_id uuid references public.agents(id),
    total_fee decimal(15,2) not null,
    fee_paid decimal(15,2) default 0.00,
    payment_mode text,
    status public.admission_status default 'pending',
    current_stage text,
    revert_reason text,
    documents jsonb default '[]'::jsonb,
    application_date date default current_date,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 6.5 FEE SUBMISSIONS (Pending Approval)
-- ==========================================
create table if not exists public.fee_submissions (
    id uuid primary key default uuid_generate_v4(),
    admission_id uuid references public.admissions(id) on delete cascade,
    submitted_by_id uuid references public.profiles(id),
    amount_received decimal(15,2) not null,
    payment_mode text,
    payment_date date,
    transaction_id text,
    proof_urls jsonb default '[]'::jsonb,
    status public.entity_status default 'pending',
    reviewed_by_id uuid references public.profiles(id),
    rejection_reason text,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create trigger set_fee_submissions_updated_at before update on public.fee_submissions for each row execute procedure public.handle_updated_at();

-- ==========================================
-- 7. LEDGER
-- ==========================================
create table if not exists public.ledger (
    id uuid primary key default uuid_generate_v4(),
    entity_id uuid not null,
    entity_type text not null check (entity_type in ('university', 'consultancy', 'agent', 'system', 'student')),
    transaction_type public.transaction_type not null,
    amount decimal(15,2) not null,
    balance_before decimal(15,2) default 0.00,
    balance_after decimal(15,2) default 0.00,
    reference_id uuid,
    reference_type text,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 8. SYSTEM
-- ==========================================
create table if not exists public.notifications (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id) on delete cascade,
    title text not null,
    body text not null,
    type public.notification_type default 'info',
    is_read boolean default false,
    payload jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.support_tickets (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id),
    subject text not null,
    message text not null,
    priority text default 'medium',
    status public.support_ticket_status default 'open',
    response text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.audit_logs (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id),
    action text not null,
    details jsonb,
    ip_address text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.app_banners (
    id uuid primary key default uuid_generate_v4(),
    image_url text not null,
    target_screen text,
    priority int default 0,
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.app_versions (
    id uuid primary key default uuid_generate_v4(),
    platform text not null,
    version text not null,
    is_mandatory boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 9. TRIGGERS
-- ==========================================
create or replace function public.handle_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;

create trigger set_profiles_updated_at before update on public.profiles for each row execute procedure public.handle_updated_at();
create trigger set_universities_updated_at before update on public.universities for each row execute procedure public.handle_updated_at();
create trigger set_consultancies_updated_at before update on public.consultancies for each row execute procedure public.handle_updated_at();
create trigger set_university_courses_updated_at before update on public.university_courses for each row execute procedure public.handle_updated_at();
create trigger set_admissions_updated_at before update on public.admissions for each row execute procedure public.handle_updated_at();

create or replace function public.update_wallet_from_ledger() returns trigger as $$
begin
    if new.transaction_type = 'credit' then
        if new.entity_type = 'university' then update public.universities set wallet_balance = wallet_balance + new.amount where id = new.entity_id; end if;
        if new.entity_type = 'consultancy' then update public.consultancies set wallet_balance = wallet_balance + new.amount where id = new.entity_id; end if;
        if new.entity_type = 'agent' then update public.agents set wallet_balance = wallet_balance + new.amount where id = new.entity_id; end if;
    elsif new.transaction_type = 'debit' then
        if new.entity_type = 'university' then update public.universities set wallet_balance = wallet_balance - new.amount where id = new.entity_id; end if;
        if new.entity_type = 'consultancy' then update public.consultancies set wallet_balance = wallet_balance - new.amount where id = new.entity_id; end if;
        if new.entity_type = 'agent' then update public.agents set wallet_balance = wallet_balance - new.amount where id = new.entity_id; end if;
    end if;
    return new;
end;
$$ language plpgsql;

create trigger tr_update_wallet after insert on public.ledger for each row execute procedure public.update_wallet_from_ledger();

create or replace function public.notify_agents_new_creative() returns trigger as $$
declare
    agent_rec record;
begin
    for agent_rec in select user_id from public.agents where consultancy_id = new.consultancy_id loop
        if agent_rec.user_id is not null then
            insert into public.notifications (user_id, title, body, type, payload)
            values (agent_rec.user_id, 'New Marketing Material', 'New creative available: ' || new.title, 'marketing', jsonb_build_object('creative_id', new.id));
        end if;
    end loop;
    return new;
end;
$$ language plpgsql;

create trigger tr_notify_creative after insert on public.creatives for each row execute procedure public.notify_agents_new_creative();

create sequence if not exists admission_seq start 1001;

-- ==========================================
-- 10. POLICIES & STORAGE
-- ==========================================
alter table public.profiles enable row level security;
create policy "Allow All" on public.profiles for all using (true);
alter table public.universities enable row level security;
create policy "Allow All" on public.universities for all using (true);
alter table public.consultancies enable row level security;
create policy "Allow All" on public.consultancies for all using (true);
alter table public.agents enable row level security;
create policy "Allow All" on public.agents for all using (true);
alter table public.creatives enable row level security;
create policy "Allow All" on public.creatives for all using (true);
alter table public.ledger enable row level security;
create policy "Allow All" on public.ledger for all using (true);
alter table public.notifications enable row level security;
create policy "Allow All" on public.notifications for all using (true);

insert into storage.buckets (id, name, public) 
values ('Media', 'Media', true), ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "Public Read Media" on storage.objects for select using ( bucket_id = 'Media' );
create policy "Auth Upload Media" on storage.objects for insert with check ( bucket_id = 'Media' and auth.role() = 'authenticated' );
create policy "Auth Access Documents" on storage.objects for all using ( bucket_id = 'documents' and auth.role() = 'authenticated' );

-- ==========================================
-- 11. SEED DATA (Fixed Auth Dependency)
-- ==========================================

-- 1. Create User in auth.users (Needed for Foreign Key)
insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
values (
  '00000000-0000-0000-0000-000000000001',
  'authenticated',
  'authenticated',
  'admin@perl.com',
  crypt('password123', gen_salt('bf')),
  current_timestamp,
  current_timestamp,
  current_timestamp,
  '{"provider":"email","providers":["email"]}',
  '{}',
  current_timestamp,
  current_timestamp,
  '',
  '',
  '',
  ''
) on conflict (id) do nothing;

-- 2. Create Profile
insert into public.profiles (id, email, full_name, role, status)
values ('00000000-0000-0000-0000-000000000001', 'admin@perl.com', 'Super Administrator', 'super_admin', 'approved')
on conflict (id) do nothing;

-- 3. Universities (No user_id dependency kept for simplicity, or add if needed)
insert into public.universities (id, name, city, state, type, ranking, accreditation, logo_url, wallet_balance, status) values 
('11111111-1111-1111-1111-111111111111', 'Delhi Technical University', 'New Delhi', 'Delhi', 'Government', 8, 'A++', 'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Delhi_Technological_University_Logo.svg/1200px-Delhi_Technological_University_Logo.svg.png', 500000, 'approved'),
('22222222-2222-2222-2222-222222222222', 'Amity University', 'Noida', 'Uttar Pradesh', 'Private', 25, 'A+', 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Amity_University_logo.png/220px-Amity_University_logo.png', 1000000, 'approved')
on conflict (id) do nothing;

insert into public.master_courses (id, name, code, stream, level, duration) values
('33333333-3333-3333-3333-333333333331', 'B.Tech Computer Science', 'BTECH-CS', 'Engineering', 'UG', '4 Years'),
('33333333-3333-3333-3333-333333333332', 'MBA Finance', 'MBA-FIN', 'Management', 'PG', '2 Years')
on conflict (id) do nothing;

insert into public.university_courses (university_id, master_course_id, university_fee, display_fee, commission_value, specialization) values
('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333331', 150000, 160000, 10000, 'AI & ML'),
('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333332', 300000, 320000, 20000, 'International Finance')
on conflict do nothing;

insert into public.consultancies (id, name, owner_name, contact_email, status, students_count) values
('44444444-4444-4444-4444-444444444444', 'Career path Consultants', 'Rajesh Kumar', 'rajesh@careerpath.com', 'approved', 0)
on conflict (id) do nothing;

insert into public.agents (id, consultancy_id, name, contact_email, status, wallet_balance) values
('55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', 'Amit Sharma', 'amit.agent@gmail.com', 'approved', 0)
on conflict (id) do nothing;

insert into public.ledger (entity_id, entity_type, transaction_type, amount, description) values
('55555555-5555-5555-5555-555555555555', 'agent', 'credit', 15250.00, 'Opening Bonus'),
('44444444-4444-4444-4444-444444444444', 'consultancy', 'credit', 50000.00, 'Opening Bonus');

insert into public.creatives (consultancy_id, title, description, image_url, tags) values
('44444444-4444-4444-4444-444444444444', 'Summer Admission Open 2025', 'Grab seats in top colleges now!', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_u2yIG_j9Lbf_vTzYdGjC8c_c_C_c_c_c_c&s', ARRAY['Admissions', 'Engineering']);
