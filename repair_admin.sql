-- RUN THIS IN YOUR SUPABASE SQL EDITOR TO RESET THE ADMIN USER

-- 1. Delete the existing admin user from the auth system
-- This allows you to re-register them cleanly using the "Fix / Create Admin" button.
DELETE FROM auth.users WHERE email = 'admin@perl.com';

-- 2. Delete the profile if it exists (to prevent foreign key errors during re-creation)
DELETE FROM public.profiles WHERE email = 'admin@perl.com';

