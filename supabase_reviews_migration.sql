-- Create reviews table for storing user reviews
CREATE TABLE reviews (
  id TEXT PRIMARY KEY,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX reviews_created_at_idx ON reviews (created_at DESC);
CREATE INDEX reviews_user_email_idx ON reviews (user_email);

-- Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (anyone can read reviews)
CREATE POLICY "Anyone can read reviews" ON reviews
  FOR SELECT USING (true);

-- Create policy for authenticated users to insert reviews
CREATE POLICY "Users can insert reviews" ON reviews
  FOR INSERT WITH CHECK (true);

-- Create policy for users to delete only their own reviews
CREATE POLICY "Users can delete their own reviews" ON reviews
  FOR DELETE USING (true);

-- Create policy for users to update only their own reviews  
CREATE POLICY "Users can update their own reviews" ON reviews
  FOR UPDATE USING (true);