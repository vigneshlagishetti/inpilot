-- Complete fix: Clean up and insert admin user properly
-- Run these queries ONE BY ONE in Supabase SQL Editor

-- STEP 1: See what's in the table
SELECT * FROM admin_users;

-- STEP 2: Delete ALL rows (clean slate)
DELETE FROM admin_users;

-- STEP 3: Insert ONLY your user
INSERT INTO admin_users (user_id, email, role, permissions, granted_by)
VALUES (
  'user_38eCGWlRm5M7BDNSVvobCLfhS36',
  'lvigneshbunty789@gmail.com',
  'super_admin',
  '{"manage_users": true, "manage_content": true, "toggle_maintenance": true, "grant_admin": true, "revoke_admin": true}'::jsonb,
  'system'
);

-- STEP 4: Verify - should show ONLY your user
SELECT user_id, email, role FROM admin_users;
