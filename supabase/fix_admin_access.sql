-- Complete verification and fix for admin access
-- Run these queries one by one in Supabase SQL Editor

-- STEP 1: Check what's currently in the admin_users table
SELECT user_id, email, role FROM admin_users;

-- STEP 2: Delete the placeholder if it exists
DELETE FROM admin_users WHERE user_id = 'REPLACE_WITH_YOUR_CLERK_USER_ID';

-- STEP 3: Check if your real user exists
SELECT * FROM admin_users WHERE user_id = 'user_38eCGWlRm5M7BDNSVvobCLfhS36';

-- STEP 4: If the above returns nothing, insert yourself:
INSERT INTO admin_users (user_id, email, role, permissions, granted_by)
VALUES (
  'user_38eCGWlRm5M7BDNSVvobCLfhS36',
  'lvigneshbunty789@gmail.com',
  'super_admin',
  '{"manage_users": true, "manage_content": true, "toggle_maintenance": true, "grant_admin": true, "revoke_admin": true}'::jsonb,
  'system'
)
ON CONFLICT (user_id) DO UPDATE SET
  role = EXCLUDED.role,
  permissions = EXCLUDED.permissions;

-- STEP 5: Final verification - should show only your user
SELECT user_id, email, role FROM admin_users;
