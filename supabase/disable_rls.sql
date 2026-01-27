-- SIMPLE FIX: Disable RLS on admin_users table
-- Since the API layer handles all permission checks, we don't need RLS
-- Run this in Supabase SQL Editor

-- Disable RLS completely
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'admin_users';

-- Test query (should return your user now)
SELECT * FROM admin_users WHERE user_id = 'user_38eCGWlRm5M7BDNSVvobCLfhS36';
