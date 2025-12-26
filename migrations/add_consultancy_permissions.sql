-- Migration: Add permissions column to consultancies
alter table public.consultancies add column if not exists permissions jsonb default '{"agents": true, "admissions": true, "ledger": true, "wallet": true}'::jsonb;
