-- ==========================================
-- FIX PERMISSIONS SCRIPT
-- Run this in Supabase SQL Editor to resolve access errors
-- ==========================================

-- 1. Fix User Projects (Drop existing to avoid "already exists" error)
DROP POLICY IF EXISTS "Enable all access for now" ON user_projects;
CREATE POLICY "Enable all access for now" ON user_projects FOR ALL USING (true) WITH CHECK (true);

-- 2. Fix Conversations Permissions
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Clean up any old/conflicting policies
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can insert their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can all conversations" ON conversations;

-- Create ONE unified policy for all actions (Simpler & Safer)
CREATE POLICY "Users can manage own conversations" ON conversations
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. Fix Messages Permissions
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

-- Clean up any old/conflicting policies
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON conversation_messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON conversation_messages;
DROP POLICY IF EXISTS "Users can update messages in their conversations" ON conversation_messages;
DROP POLICY IF EXISTS "Users can delete messages in their conversations" ON conversation_messages;
DROP POLICY IF EXISTS "Users can all messages" ON conversation_messages;

-- Create ONE unified policy for all actions
CREATE POLICY "Users can manage own messages" ON conversation_messages
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE id = conversation_id AND user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE id = conversation_id AND user_id = auth.uid()
  )
);
