-- PostgreSQL / Supabase SQL Script
-- Quick verification script for maintenance mode realtime setup
-- Run this in Supabase SQL Editor to verify everything is configured correctly
-- Note: VS Code SQL linter may show errors - ignore them, this is valid PostgreSQL

-- 1. Check if maintenance_settings table exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'maintenance_settings'
    ) THEN
        RAISE NOTICE 'Table maintenance_settings exists: ✓';
    ELSE
        RAISE NOTICE 'Table maintenance_settings NOT FOUND: ✗';
    END IF;
END $$;

-- 2. Check current maintenance mode status
DO $$
DECLARE
    v_key TEXT;
    v_value BOOLEAN;
    v_updated_by TEXT;
    v_updated_at TIMESTAMPTZ;
BEGIN
    SELECT key, value, updated_by, updated_at 
    INTO v_key, v_value, v_updated_by, v_updated_at
    FROM maintenance_settings 
    WHERE key = 'maintenance_mode';
    
    IF FOUND THEN
        RAISE NOTICE 'Maintenance Mode Status:';
        RAISE NOTICE '  Key: %', v_key;
        RAISE NOTICE '  Enabled: %', v_value;
        RAISE NOTICE '  Updated By: %', v_updated_by;
        RAISE NOTICE '  Updated At: %', v_updated_at;
    ELSE
        RAISE NOTICE 'Maintenance mode setting NOT FOUND: ✗';
    END IF;
END $$;

-- 3. Check if realtime is enabled for the table
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM pg_publication_tables 
    WHERE tablename = 'maintenance_settings' 
    AND pubname = 'supabase_realtime';
    
    IF v_count > 0 THEN
        RAISE NOTICE 'Realtime enabled for maintenance_settings: ✓';
    ELSE
        RAISE NOTICE 'Realtime NOT enabled for maintenance_settings: ✗';
        RAISE NOTICE 'Run: ALTER publication supabase_realtime ADD TABLE maintenance_settings;';
    END IF;
END $$;

-- 4. Check table permissions
DO $$
DECLARE
    perm RECORD;
    v_count INTEGER := 0;
BEGIN
    RAISE NOTICE 'Permissions for maintenance_settings:';
    FOR perm IN 
        SELECT grantee, privilege_type
        FROM information_schema.role_table_grants 
        WHERE table_name = 'maintenance_settings'
        AND grantee IN ('anon', 'authenticated')
        ORDER BY grantee, privilege_type
    LOOP
        RAISE NOTICE '  % - %', perm.grantee, perm.privilege_type;
        v_count := v_count + 1;
    END LOOP;
    
    IF v_count = 0 THEN
        RAISE NOTICE 'No permissions found: ✗';
        RAISE NOTICE 'Run: GRANT SELECT ON maintenance_settings TO anon, authenticated;';
    END IF;
END $$;

-- 5. Check indexes
DO $$
DECLARE
    idx RECORD;
    v_count INTEGER := 0;
BEGIN
    RAISE NOTICE 'Indexes on maintenance_settings:';
    FOR idx IN 
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = 'maintenance_settings'
    LOOP
        RAISE NOTICE '  Index: %', idx.indexname;
        v_count := v_count + 1;
    END LOOP;
    
    IF v_count = 0 THEN
        RAISE NOTICE 'No indexes found';
    END IF;
END $$;

-- 6. Show maintenance mode change log (if logging is enabled)
DO $$
DECLARE
    log_rec RECORD;
    v_count INTEGER := 0;
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'maintenance_mode_logs'
    ) THEN
        RAISE NOTICE 'Maintenance mode logs table exists: ✓';
        RAISE NOTICE 'Recent changes (last 10):';
        FOR log_rec IN 
            SELECT action, old_value, new_value, changed_by, changed_at
            FROM maintenance_mode_logs
            ORDER BY changed_at DESC
            LIMIT 10
        LOOP
            RAISE NOTICE '  % - % → % by % at %', 
                log_rec.action, 
                log_rec.old_value, 
                log_rec.new_value, 
                log_rec.changed_by, 
                log_rec.changed_at;
            v_count := v_count + 1;
        END LOOP;
        
        IF v_count = 0 THEN
            RAISE NOTICE '  No log entries found';
        END IF;
    ELSE
        RAISE NOTICE 'Maintenance mode logs table does not exist (optional)';
    END IF;
END $$;

-- Summary
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✓ Setup Verification Complete';
    RAISE NOTICE 'Check above results for any issues';
END $$;
