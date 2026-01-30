-- Enable Realtime for maintenance_settings table
-- This allows instant updates when maintenance mode is toggled

-- Enable realtime replication for maintenance_settings
ALTER publication supabase_realtime ADD TABLE maintenance_settings;

-- Grant necessary permissions for realtime
GRANT SELECT ON maintenance_settings TO anon;
GRANT SELECT ON maintenance_settings TO authenticated;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_maintenance_settings_key ON maintenance_settings(key);

-- Add a trigger to log changes (optional, for debugging)
CREATE TABLE IF NOT EXISTS maintenance_mode_logs (
    id SERIAL PRIMARY KEY,
    action TEXT NOT NULL,
    old_value BOOLEAN,
    new_value BOOLEAN,
    changed_by TEXT,
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to log maintenance mode changes
CREATE OR REPLACE FUNCTION log_maintenance_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.value IS DISTINCT FROM NEW.value THEN
        INSERT INTO maintenance_mode_logs (action, old_value, new_value, changed_by)
        VALUES ('UPDATE', OLD.value, NEW.value, NEW.updated_by);
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO maintenance_mode_logs (action, new_value, changed_by)
        VALUES ('INSERT', NEW.value, NEW.updated_by);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for logging (optional)
DROP TRIGGER IF EXISTS maintenance_change_trigger ON maintenance_settings;
CREATE TRIGGER maintenance_change_trigger
    AFTER INSERT OR UPDATE ON maintenance_settings
    FOR EACH ROW
    WHEN (NEW.key = 'maintenance_mode')
    EXECUTE FUNCTION log_maintenance_change();

-- Verify the setup
SELECT 
    schemaname, 
    tablename, 
    'realtime enabled' as status
FROM pg_publication_tables 
WHERE tablename = 'maintenance_settings';

-- Show current maintenance mode
SELECT * FROM maintenance_settings WHERE key = 'maintenance_mode';
