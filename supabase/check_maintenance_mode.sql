-- Quick check and update for maintenance mode
-- Run this if you just want to verify/update the maintenance mode setting

-- Check current status
SELECT * FROM maintenance_settings WHERE key = 'maintenance_mode';

-- If you want to disable maintenance mode (set to false)
UPDATE maintenance_settings 
SET value = false 
WHERE key = 'maintenance_mode';

-- If you want to enable maintenance mode (set to true)
-- UPDATE maintenance_settings 
-- SET value = true 
-- WHERE key = 'maintenance_mode';

-- Verify the update
SELECT * FROM maintenance_settings WHERE key = 'maintenance_mode';
