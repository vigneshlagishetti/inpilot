-- Clean up placeholder admin user
-- Run this in Supabase SQL Editor

-- Delete the placeholder row
DELETE FROM admin_users 
WHERE user_id = 'user_38eCGWlRm5M7BDNSVvobCLfhS36';

-- Verify only your real user remains
SELECT user_id, email, role FROM admin_users;
