-- Migration: Add app_settings table
create table if not exists public.app_settings (
    id text primary key,
    data jsonb not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Seed initial settings
insert into public.app_settings (id, data) values 
('general', '{"app_name": "Perl Admin Portal", "support_email": "support@perl-edu.com", "support_phone": "+91 98877 66554", "company_address": "Sector 62, Noida, UP, India", "gst_rate": "18", "currency": "INR (₹)"}'),
('commission', '{"default_agent_commission": "10", "default_consultancy_share": "20", "system_markup": "5"}')
on conflict (id) do nothing;

create trigger set_app_settings_updated_at before update on public.app_settings for each row execute procedure public.handle_updated_at();

alter table public.app_settings enable row level security;
create policy "Allow All" on public.app_settings for all using (true);
