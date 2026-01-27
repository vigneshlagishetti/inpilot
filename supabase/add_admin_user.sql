-- Quick admin user insert
-- Run this if the admin_users table already exists

-- Insert yourself as admin (will skip if you're already an admin)
INSERT INTO admin_users (user_id, email, role, permissions, granted_by)
VALUES (
  'user_38eCGWlRm5M7BDNSVvobCLfhS36',
  'lvigneshbunty789@gmail.com',
  'super_admin',
  '{"manage_users": true, "manage_content": true, "toggle_maintenance": true, "grant_admin": true, "revoke_admin": true}'::jsonb,
  'system'
)
ON CONFLICT (user_id) DO NOTHING;

-- Verify you're now an admin
SELECT * FROM admin_users WHERE user_id = 'user_38eCGWlRm5M7BDNSVvobCLfhS36';
