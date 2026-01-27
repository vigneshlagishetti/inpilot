-- Add maintenance_settings table for real-time configuration
CREATE TABLE IF NOT EXISTS maintenance_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value BOOLEAN NOT NULL DEFAULT false,
  updated_by TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE maintenance_settings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read maintenance settings (needed for public access)
CREATE POLICY "Anyone can view maintenance settings" ON maintenance_settings
  FOR SELECT USING (true);

-- Only authenticated users can update maintenance settings
-- (Admin check happens in the API layer)
CREATE POLICY "Authenticated users can update maintenance settings" ON maintenance_settings
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Only authenticated users can insert maintenance settings
CREATE POLICY "Authenticated users can insert maintenance settings" ON maintenance_settings
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Insert default maintenance mode setting
INSERT INTO maintenance_settings (key, value, updated_by)
VALUES ('maintenance_mode', false, 'system')
ON CONFLICT (key) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_maintenance_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_maintenance_settings_updated_at_trigger
  BEFORE UPDATE ON maintenance_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_maintenance_settings_updated_at();

-- Grant necessary permissions
GRANT SELECT ON maintenance_settings TO anon;
GRANT SELECT ON maintenance_settings TO authenticated;
GRANT UPDATE, INSERT ON maintenance_settings TO authenticated;

