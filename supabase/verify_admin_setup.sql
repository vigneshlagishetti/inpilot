-- Verify admin user exists and check the setup
-- Run this in Supabase SQL Editor to debug admin access

-- 1. Check if admin_users table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'admin_users'
) as table_exists;

-- 2. Check if your user is in the admin_users table
SELECT * FROM admin_users 
WHERE user_id = 'user_38eCGWlRm5M7BDNSVvobCLfhS36';

-- 3. Check all admin users (to see if any exist)
SELECT user_id, email, role FROM admin_users;

-- 4. If your user is NOT in the table, insert yourself:
-- INSERT INTO admin_users (user_id, email, role, permissions, granted_by)
-- VALUES (
--   'user_38eCGWlRm5M7BDNSVvobCLfhS36',
--   'lvigneshbunty789@gmail.com',
--   'super_admin',
--   '{"manage_users": true, "manage_content": true, "toggle_maintenance": true, "grant_admin": true, "revoke_admin": true}'::jsonb,
--   'system'
-- );
