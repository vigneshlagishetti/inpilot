-- FIX: Clerk IDs are strings (e.g. "user_123"), not UUIDs.
-- Standard auth.uid() throws an error because it tries to cast the ID to a UUID.
-- We must use (auth.jwt() ->> 'sub') to get the ID as text.

-- 1. Reset policies for maintenance_settings
DROP POLICY IF EXISTS "Anyone can view maintenance settings" ON maintenance_settings;
DROP POLICY IF EXISTS "Authenticated users can update maintenance settings" ON maintenance_settings;
DROP POLICY IF EXISTS "Authenticated users can insert maintenance settings" ON maintenance_settings;

-- 2. Create Clerk-compatible policies
CREATE POLICY "Anyone can view maintenance settings" ON maintenance_settings
  FOR SELECT USING (true);

-- Use auth.jwt() ->> 'sub' to check for presence of a user ID (authentication)
-- This works for both Supabase Auth (UUID) and Clerk Auth (String)
CREATE POLICY "Authenticated users can update maintenance settings" ON maintenance_settings
  FOR UPDATE USING (
    (auth.jwt() ->> 'sub') IS NOT NULL
  );

CREATE POLICY "Authenticated users can insert maintenance settings" ON maintenance_settings
  FOR INSERT WITH CHECK (
    (auth.jwt() ->> 'sub') IS NOT NULL
  );

-- 3. Verify updated_by column is TEXT (it should be, but just in case)
ALTER TABLE maintenance_settings 
ALTER COLUMN updated_by TYPE TEXT;
