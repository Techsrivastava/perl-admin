# Profit Pulse EduConnect - Complete Application Integration Guide

## 1. Supabase Configuration

This application uses Supabase for a robust, scalable Backend-as-a-Service (Auth, Database, Storage).

### **Environment Variables**
Ensure your mobile app has the following Supabase credentials (found in your Supabase Project Settings > API):
- **SUPABASE_URL**: `https://<your-project-id>.supabase.co`
- **SUPABASE_ANON_KEY**: `<your-anon-key>`

---

## 2. Authentication Flow

The app supports multiple roles with a unified login system.

| Role | Description |
| :--- | :--- |
| `student` | End-users browsing courses and applying. |
| `agent` | Intermediate brokers tracking admissions and commissions. |
| `consultancy` | Agency owners managing agents and student pools. |
| `university` | Institution staff managing courses and admissions. |
| `super_admin` | Access to the web-based Admin Panel. |

### **Login Logic**
1.  **User logs in** using `supabase.auth.signInWithPassword(email, password)`.
2.  **Fetch Profile**: After auth, fetch the user's role from the `public.profiles` table.
    ```dart
    final user = supabase.auth.currentUser;
    final response = await supabase.from('profiles').select().eq('id', user.id).single();
    String role = response['role'];
    ```
3.  **Navigate**: Redirect the user to the appropriate screen based on `role`.

---

## 3. Database Schema & API Usage

### **Core Tables & Relationships**

#### **3.1. Users & Profiles**
- **`profiles`**: The central table linking `auth.users` to app logic.
    - Fields: `id` (FK), `email`, `role`, `full_name`, `avatar_url`.

#### **3.2. Institutions**
- **`universities`**: Stores university details.
    - Fields: `id`, `name`, `city`, `logo_url`, `wallet_balance`.
- **`consultancies`**: Partner agencies.
    - Fields: `id`, `name`, `commission_value`, `wallet_balance`.

#### **3.3. Academic Catalogue (Course Mapping)**
The system uses a two-tier course structure:
1.  **`master_courses`**: Global list of degrees (e.g., "B.Tech Computer Science").
    - Fields: `name`, `stream` (Engineering), `level` (UG/PG).
2.  **`university_courses`**: The actual sellable item (Master Course offered by a specific University).
    - **Query for Student App**:
    ```sql
    select 
      uc.id as course_id,
      m.name as course_name, 
      u.name as university_name, 
      uc.display_fee,
      uc.intake_capacity
    from university_courses uc
    join master_courses m on uc.master_course_id = m.id
    join universities u on uc.university_id = u.id
    where uc.is_active = true
    ```

#### **3.4. Admissions & Applications**
- **`admissions`**: Records a student applied to a course.
    - Fields: `student_name`, `university_id`, `course_id`, `total_fee`, `fee_paid`, `status` (pending -> approved).

#### **3.5. Finance (Wallet System)**
- **`ledger`**: The single source of truth for all money movements.
    - Fields: `entity_id` (Agent/University ID), `amount`, `transaction_type` (credit/debit), `reference_id` (Admission ID).
    - **Balance**: Is calculated in real-time or stored in `wallet_balance` via triggers.

---

## 4. Complete Backend SQL Reference

If you need to reset the backend or understand the full structure, here is the complete reference schema currently active in the Super Admin app.

```sql
-- PROFIT PULSE EDUCONNECT - COMPLETE SCHEMA REFERENCE

-- 1. ENUMS (Constants)
create type public.user_role as enum ('super_admin', 'admin_staff', 'university', 'consultancy', 'agent', 'student');
create type public.entity_status as enum ('pending', 'approved', 'rejected', 'suspended', 'active');
create type public.admission_status as enum ('draft', 'pending', 'reviewing', 'approved', 'reverted', 'rejected', 'completed', 'cancelled');
create type public.course_level as enum ('UG', 'PG', 'Diploma', 'Phd', 'Certificate');
create type public.commission_type as enum ('percentage', 'flat', 'oneTime');

-- 2. MAJOR TABLES

-- PROFILES
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text unique not null,
    full_name text not null,
    role public.user_role not null default 'student',
    created_at timestamp with time zone default now()
);

-- UNIVERSITIES
create table if not exists public.universities (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    city text,
    state text,
    ranking int,
    logo_url text,
    wallet_balance decimal(15,2) default 0.00,
    status public.entity_status default 'active'
);

-- MASTER COURSES (Global Catalogue)
create table if not exists public.master_courses (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    code text,
    stream text,
    level public.course_level,
    duration text,
    semesters int,
    is_active boolean default true
);

-- UNIVERSITY COURSES (The Product)
create table if not exists public.university_courses (
    id uuid primary key default uuid_generate_v4(),
    university_id uuid references public.universities(id) on delete cascade,
    master_course_id uuid references public.master_courses(id) on delete cascade,
    
    -- Financials
    university_fee decimal(15,2) not null,
    display_fee decimal(15,2) not null, 
    commission_type public.commission_type default 'percentage',
    commission_value decimal(15,2) default 0,
    
    -- Meta
    intake_capacity int default 0,
    is_active boolean default true,
    
    unique(university_id, master_course_id)
);

-- ADMISSIONS
create table if not exists public.admissions (
    id uuid primary key default uuid_generate_v4(),
    admission_number text unique,
    student_name text not null,
    university_id uuid references public.universities(id),
    course_id uuid references public.university_courses(id),
    total_fee decimal(15,2) not null,
    fee_paid decimal(15,2) default 0.00,
    status public.admission_status default 'pending',
    created_at timestamp with time zone default now()
);

-- FEE SUBMISSIONS (Pending payments)
create table if not exists public.fee_submissions (
    id uuid primary key default uuid_generate_v4(),
    admission_id uuid references public.admissions(id),
    amount_received decimal(15,2) not null,
    transaction_id text,
    status public.entity_status default 'pending',
    created_at timestamp with time zone default now()
);

-- LEDGER (Wallet History)
create table if not exists public.ledger (
    id uuid primary key default uuid_generate_v4(),
    entity_id uuid not null,
    entity_type text not null,
    amount decimal(15,2) not null,
    transaction_type text check (transaction_type in ('credit', 'debit')),
    description text,
    created_at timestamp with time zone default now()
);

-- APP SETTINGS
create table if not exists public.app_settings (
    id text primary key,
    data jsonb not null default '{}'::jsonb
);

-- 3. SECURITY (Row Level Security)
-- Note: Super Admin requires full access.
alter table profiles enable row level security;
create policy "Allow All" on profiles for all using (true);

alter table universities enable row level security;
create policy "Allow All" on universities for all using (true);

alter table admissions enable row level security;
create policy "Allow All" on admissions for all using (true);
-- (Policies applied similarly to all tables)
```

## 5. Mobile App Feature Implementation Guide

### **Feature: University Search**
- **Endpoint**: `supabase.from('universities').select('*').eq('status', 'active')`
- **Search**: Use `.ilike('name', '%query%')`

### **Feature: Apply for Course**
1.  Collect student details.
2.  Insert into `admissions` with status `pending`.
3.  Admin/Agent sees it in their panel and can approve.

### **Feature: Agent Wallet**
- **Display**: Fetch `wallet_balance` from `agents` table.
- **Transactions**: Fetch `ledger` entries where `entity_id` is the Agent's ID.

