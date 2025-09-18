-- Fix user_quests status constraint and improve chat continuity
-- Drop existing constraint if it exists
ALTER TABLE user_quests DROP CONSTRAINT IF EXISTS user_quests_status_check;

-- Add proper status constraint
ALTER TABLE user_quests ADD CONSTRAINT user_quests_status_check 
CHECK (status IN ('pending', 'completed', 'missed', 'in_progress'));

-- Ensure validation_status has proper constraint too
ALTER TABLE user_quests DROP CONSTRAINT IF EXISTS user_quests_validation_status_check;
ALTER TABLE user_quests ADD CONSTRAINT user_quests_validation_status_check 
CHECK (validation_status IN ('pending', 'approved', 'rejected'));

-- Add index for better chat history performance
CREATE INDEX IF NOT EXISTS idx_chat_history_user_created 
ON chat_history(user_id, created_at DESC);

-- Add index for better quest performance  
CREATE INDEX IF NOT EXISTS idx_user_quests_user_status
ON user_quests(user_id, status, assigned_date DESC);