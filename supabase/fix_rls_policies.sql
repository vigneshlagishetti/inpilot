-- Fix infinite recursion in admin_users RLS policies
-- Run this in Supabase SQL Editor

-- Drop the problematic policies
DROP POLICY IF EXISTS "Admins can view all admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can create new admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can update admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can delete other admin users" ON admin_users;

-- Create new policies that don't cause recursion
-- Allow authenticated users to read their own admin record
CREATE POLICY "Users can view their own admin record" ON admin_users
  FOR SELECT USING (auth.uid()::text = user_id);

-- Allow authenticated users to read all admin records
-- (The API layer will handle permission checks)
CREATE POLICY "Authenticated users can view admin users" ON admin_users
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to insert/update/delete
-- (The API layer will handle permission checks)
CREATE POLICY "Authenticated users can manage admin users" ON admin_users
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Verify policies are fixed
SELECT tablename, policyname FROM pg_policies WHERE tablename = 'admin_users';
