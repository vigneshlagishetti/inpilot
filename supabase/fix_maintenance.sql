-- Safely setup maintenance_settings table and policies

-- 1. Create table if not exists
CREATE TABLE IF NOT EXISTS maintenance_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value BOOLEAN NOT NULL DEFAULT false,
  updated_by TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE maintenance_settings ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to avoid "already exists" errors
DROP POLICY IF EXISTS "Anyone can view maintenance settings" ON maintenance_settings;
DROP POLICY IF EXISTS "Authenticated users can update maintenance settings" ON maintenance_settings;
DROP POLICY IF EXISTS "Authenticated users can insert maintenance settings" ON maintenance_settings;

-- 4. Re-create policies
CREATE POLICY "Anyone can view maintenance settings" ON maintenance_settings
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can update maintenance settings" ON maintenance_settings
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert maintenance settings" ON maintenance_settings
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 5. Ensure the maintenance_mode row exists
INSERT INTO maintenance_settings (key, value, updated_by)
VALUES ('maintenance_mode', false, 'system')
ON CONFLICT (key) DO NOTHING;

-- 6. Grant permissions
GRANT SELECT ON maintenance_settings TO anon;
GRANT SELECT ON maintenance_settings TO authenticated;
GRANT UPDATE, INSERT ON maintenance_settings TO authenticated;
