-- Profit Pulse EduConnect - FINAL COMPREHENSIVE SUPABASE SCHEMA
-- This file contains all tables, relationships, and seed data for the Super Admin system.

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. ENUMS
do $$ begin
    create type public.user_role as enum ('super_admin', 'university', 'consultancy', 'agent');
    create type public.entity_status as enum ('pending', 'approved', 'rejected', 'suspended');
    create type public.admission_status as enum ('pending', 'approved', 'reverted', 'rejected');
    create type public.transaction_type as enum ('credit', 'debit');
exception
    when duplicate_object then null;
end $$;

-- 3. USERS & PROFILES (Links to Auth.Users)
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text unique not null,
    full_name text not null,
    phone text,
    role public.user_role not null default 'university',
    status public.entity_status not null default 'approved',
    last_login timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. UNIVERSITIES
create table if not exists public.universities (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id) on delete cascade,
    name text not null,
    registration_no text,
    authorized_person text,
    contact_email text,
    contact_phone text,
    address text,
    city text,
    state text,
    country text default 'India',
    wallet_balance decimal(15,2) default 0.00,
    total_received decimal(15,2) default 0.00,
    status public.entity_status default 'pending',
    permissions jsonb default '{"courses": true, "admissions": true, "ledger": true, "documents": true, "wallet": true}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. CONSULTANCIES
create table if not exists public.consultancies (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id) on delete cascade,
    name text not null,
    owner_name text,
    registration_no text,
    contact_email text,
    contact_phone text,
    address text,
    wallet_balance decimal(15,2) default 0.00,
    total_collected decimal(15,2) default 0.00,
    net_profit decimal(15,2) default 0.00,
    status public.entity_status default 'pending',
    bank_details jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. AGENTS
create table if not exists public.agents (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.profiles(id) on delete cascade,
    consultancy_id uuid references public.consultancies(id) on delete cascade,
    name text not null,
    contact_email text,
    contact_phone text,
    wallet_balance decimal(15,2) default 0.00,
    commission_rate decimal(5,2) default 0.00, -- Fixed percentage
    status public.entity_status default 'approved',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. MASTER COURSES (Global repository)
create table if not exists public.master_courses (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    code text unique,
    stream text,
    level text, -- UG, PG, etc
    duration text,
    eligibility text,
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. UNIVERSITY COURSES (Mapping of master courses to universities with specific fees)
create table if not exists public.university_courses (
    id uuid primary key default uuid_generate_v4(),
    university_id uuid references public.universities(id) on delete cascade,
    master_course_id uuid references public.master_courses(id) on delete cascade,
    university_fee decimal(15,2) not null,
    display_fee decimal(15,2) not null, -- Fee shown to students/agents
    commission_type text check (commission_type in ('percentage', 'fixed')),
    commission_value decimal(15,2),
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(university_id, master_course_id)
);

-- 9. ADMISSIONS
create table if not exists public.admissions (
    id uuid primary key default uuid_generate_v4(),
    student_name text not null,
    student_email text,
    student_phone text,
    university_id uuid references public.universities(id),
    course_id uuid references public.university_courses(id),
    consultancy_id uuid references public.consultancies(id),
    agent_id uuid references public.agents(id),
    total_fee decimal(15,2) not null,
    fee_paid decimal(15,2) default 0.00,
    status public.admission_status default 'pending',
    revert_reason text,
    documents jsonb default '[]'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. SYSTEM EXPENSES
create table if not exists public.expenses (
    id uuid primary key default uuid_generate_v4(),
    category text not null,
    description text,
    amount decimal(15,2) not null,
    date date default current_date,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. FINANCIAL LEDGER (Core of Reports Tab)
create table if not exists public.ledger (
    id uuid primary key default uuid_generate_v4(),
    entity_id uuid not null, -- university_id, consultancy_id, or sys_id
    entity_type text not null check (entity_type in ('university', 'consultancy', 'agent', 'system')),
    transaction_type public.transaction_type not null,
    amount decimal(15,2) not null,
    balance_after decimal(15,2) not null,
    reference_id uuid, -- Admission ID or Payment ID
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.universities enable row level security;
alter table public.consultancies enable row level security;
alter table public.agents enable row level security;
alter table public.master_courses enable row level security;
alter table public.university_courses enable row level security;
alter table public.admissions enable row level security;
alter table public.expenses enable row level security;
alter table public.ledger enable row level security;

-- Policies (Simplified for Super Admin access)
create policy "Admins have full access" on public.profiles for all using (true);
create policy "Admins have full access" on public.universities for all using (true);
create policy "Admins have full access" on public.consultancies for all using (true);
create policy "Admins have full access" on public.agents for all using (true);
create policy "Admins have full access" on public.master_courses for all using (true);
create policy "Admins have full access" on public.university_courses for all using (true);
create policy "Admins have full access" on public.admissions for all using (true);
create policy "Admins have full access" on public.expenses for all using (true);
create policy "Admins have full access" on public.ledger for all using (true);

-- 13. SEED DATA
-- SUPER ADMIN (Public Profile)
-- Note: Replace with real UID after creating user in Auth
insert into public.profiles (id, email, full_name, role, status)
values 
('00000000-0000-0000-0000-000000000001', 'admin@perl.com', 'Super Administrator', 'super_admin', 'approved')
on conflict (id) do update set role = 'super_admin';

-- MASTER COURSES
insert into public.master_courses (name, code, stream, level, duration)
values 
('Bachelor of Technology (CS)', 'BTECH-CS', 'Engineering', 'UG', '4 Years'),
('Master of Business Administration', 'MBA-GEN', 'Management', 'PG', '2 Years'),
('Bachelor of Commerce', 'BCOM', 'Commerce', 'UG', '3 Years')
on conflict (code) do nothing;

-- MOCK UNIVERSITY
insert into public.universities (name, contact_email, status, wallet_balance)
values ('Apex International University', 'contact@apex.edu', 'approved', 250000.00)
on conflict do nothing;

-- MOCK EXPENSES (For Reports Demo)
insert into public.expenses (category, description, amount, date)
values 
('Office Rent', 'Head office December rent', 45000.00, '2024-12-01'),
('Marketing', 'Google Ads Campaign', 15000.00, '2024-12-10'),
('Salaries', 'Staff salaries November', 85000.00, '2024-12-05');

-- 14. FUNCTIONS & TRIGGERS
-- Function to update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at before update on public.profiles for each row execute procedure public.handle_updated_at();
create trigger set_universities_updated_at before update on public.universities for each row execute procedure public.handle_updated_at();
create trigger set_consultancies_updated_at before update on public.consultancies for each row execute procedure public.handle_updated_at();
create trigger set_agents_updated_at before update on public.agents for each row execute procedure public.handle_updated_at();
create trigger set_admissions_updated_at before update on public.admissions for each row execute procedure public.handle_updated_at();

-- 15. RPC FOR RAW QUERY (OPTIONAL BUT USED BY DASHBOARD)
create or replace function public.execute_query(query text, params jsonb default '[]'::jsonb)
returns jsonb
language plpgsql
security definer
as $$
declare
    result jsonb;
begin
    -- This is strictly for the internal dashboard admin
    -- Use with caution!
    execute query into result;
    return result;
end;
$$;
