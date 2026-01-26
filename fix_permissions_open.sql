-- ==========================================
-- OPEN ACCESS FIX (For Unblocked Development)
-- Run this in Supabase SQL Editor
-- ==========================================

-- 1. Fix Conversations (Allow all access, client filters by ID)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can insert their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can all conversations" ON conversations;
DROP POLICY IF EXISTS "Users can manage own conversations" ON conversations;

CREATE POLICY "Enable all access conversations" ON conversations
FOR ALL USING (true) WITH CHECK (true);

-- 2. Fix Messages (Allow all access, client filters by ID)
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON conversation_messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON conversation_messages;
DROP POLICY IF EXISTS "Users can update messages in their conversations" ON conversation_messages;
DROP POLICY IF EXISTS "Users can delete messages in their conversations" ON conversation_messages;
DROP POLICY IF EXISTS "Users can all messages" ON conversation_messages;
DROP POLICY IF EXISTS "Users can manage own messages" ON conversation_messages;

CREATE POLICY "Enable all access messages" ON conversation_messages
FOR ALL USING (true) WITH CHECK (true);
