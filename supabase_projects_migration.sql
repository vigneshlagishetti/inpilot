-- Create user_projects table for storing multiple project contexts per user
CREATE TABLE IF NOT EXISTS user_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries by user_id
CREATE INDEX IF NOT EXISTS user_projects_user_id_idx ON user_projects (user_id);

-- Enable Row Level Security
ALTER TABLE user_projects ENABLE ROW LEVEL SECURITY;

-- Create policy to allow full access (Select, Insert, Update, Delete)
-- Since we rely on client-side filtering via Clerk user ID in this architecture
-- We allow permissive access but application logic will filter by user_id
CREATE POLICY "Enable all access for now" ON user_projects
  FOR ALL USING (true)
  WITH CHECK (true);
