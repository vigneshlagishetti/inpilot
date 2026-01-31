-- ================================================================
-- EMERGENCY MAINTENANCE MODE FIX
-- Run this in Supabase SQL Editor if users still see maintenance page
-- ================================================================

-- Step 1: Check current maintenance mode status
SELECT 
    key, 
    value as maintenance_enabled,
    updated_by,
    updated_at,
    CASE 
        WHEN value = true THEN '🔴 MAINTENANCE ON - Users will see maintenance page'
        WHEN value = false THEN '✅ MAINTENANCE OFF - Site should be accessible'
        ELSE '⚠️  UNKNOWN STATE'
    END as status_description
FROM maintenance_settings 
WHERE key = 'maintenance_mode';

-- Step 2: Force disable maintenance mode (UNCOMMENT to run)
-- UPDATE maintenance_settings 
-- SET 
--     value = false, 
--     updated_by = 'emergency_fix',
--     updated_at = NOW() 
-- WHERE key = 'maintenance_mode';

-- Step 3: If no record exists, create one with maintenance OFF (UNCOMMENT to run)
-- INSERT INTO maintenance_settings (key, value, updated_by, updated_at)
-- VALUES ('maintenance_mode', false, 'emergency_fix', NOW())
-- ON CONFLICT (key) DO UPDATE 
-- SET value = false, updated_by = 'emergency_fix', updated_at = NOW();

-- Step 4: Verify the fix
SELECT 
    key, 
    value as maintenance_enabled,
    updated_by,
    updated_at,
    CASE 
        WHEN value = true THEN '🔴 STILL ON - Need to investigate further'
        WHEN value = false THEN '✅ SUCCESSFULLY DISABLED'
        ELSE '⚠️  UNKNOWN STATE'
    END as status_after_fix
FROM maintenance_settings 
WHERE key = 'maintenance_mode';

-- ================================================================
-- Additional Diagnostics
-- ================================================================

-- Check if realtime is enabled for maintenance_settings table
SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN supabase_realtime.can_insert(schemaname::text, tablename::text) THEN '✅ Realtime Enabled'
        ELSE '⚠️  Realtime Not Enabled'
    END as realtime_status
FROM pg_tables 
WHERE tablename = 'maintenance_settings'
AND schemaname = 'public';

-- Check recent maintenance mode changes (last 24 hours)
SELECT 
    key,
    value,
    updated_by,
    updated_at,
    AGE(NOW(), updated_at) as time_since_update
FROM maintenance_settings 
WHERE key = 'maintenance_mode'
AND updated_at > NOW() - INTERVAL '24 hours'
ORDER BY updated_at DESC;

-- ================================================================
-- Notes:
-- ================================================================
-- After running this script:
-- 1. Clear CDN cache (Vercel/Cloudflare)
-- 2. Ask users to hard refresh their browsers (Ctrl+Shift+R)
-- 3. Test in incognito mode
-- 4. Check: https://your-domain.com/api/maintenance/status
-- 
-- If issue persists, it's likely a CACHING problem, not database.
-- See MAINTENANCE_TROUBLESHOOT.md for cache-clearing instructions.
-- ================================================================
