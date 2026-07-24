-- Create user_resumes table for storing resume data permanently
CREATE TABLE IF NOT EXISTS user_resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE, -- One resume per user
  resume_content TEXT NOT NULL,
  file_name TEXT NOT NULL,
  job_role TEXT,
  custom_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries by user_id
CREATE INDEX IF NOT EXISTS user_resumes_user_id_idx ON user_resumes (user_id);

-- Enable Row Level Security
ALTER TABLE user_resumes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow full access
CREATE POLICY "Enable all access for user resumes" ON user_resumes
  FOR ALL USING (true)
  WITH CHECK (true);
