-- Create interview_sessions table
CREATE TABLE IF NOT EXISTS interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  audio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create answers table
CREATE TABLE IF NOT EXISTS answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  direct_answer TEXT NOT NULL,
  detailed_explanation TEXT NOT NULL,
  example TEXT,
  brute_force_approach TEXT,
  optimal_approach TEXT,
  time_complexity TEXT,
  space_complexity TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_session_id ON questions(session_id);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);

-- Enable Row Level Security (RLS)
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Interview sessions policies
CREATE POLICY "Users can view their own sessions" ON interview_sessions
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create their own sessions" ON interview_sessions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own sessions" ON interview_sessions
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own sessions" ON interview_sessions
  FOR DELETE USING (auth.uid()::text = user_id);

-- Questions policies
CREATE POLICY "Users can view questions from their sessions" ON questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM interview_sessions
      WHERE interview_sessions.id = questions.session_id
      AND interview_sessions.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can create questions in their sessions" ON questions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM interview_sessions
      WHERE interview_sessions.id = questions.session_id
      AND interview_sessions.user_id = auth.uid()::text
    )
  );

-- Answers policies
CREATE POLICY "Users can view answers to their questions" ON answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM questions
      JOIN interview_sessions ON interview_sessions.id = questions.session_id
      WHERE questions.id = answers.question_id
      AND interview_sessions.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can create answers to their questions" ON answers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM questions
      JOIN interview_sessions ON interview_sessions.id = questions.session_id
      WHERE questions.id = answers.question_id
      AND interview_sessions.user_id = auth.uid()::text
    )
  );
