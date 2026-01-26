-- Enable RLS on tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

-- Policies for conversations table
CREATE POLICY "Users can insert their own conversations" 
ON conversations FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own conversations" 
ON conversations FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" 
ON conversations FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" 
ON conversations FOR DELETE 
USING (auth.uid() = user_id);

-- Policies for conversation_messages table
CREATE POLICY "Users can insert messages to their conversations" 
ON conversation_messages FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE id = conversation_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can view messages from their conversations" 
ON conversation_messages FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE id = conversation_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete messages from their conversations" 
ON conversation_messages FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE id = conversation_id AND user_id = auth.uid()
  )
);
