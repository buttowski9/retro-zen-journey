-- Fix user_quests status constraint to include pending_validation
ALTER TABLE user_quests DROP CONSTRAINT IF EXISTS user_quests_status_check;

-- Add proper status constraint that includes all needed statuses
ALTER TABLE user_quests ADD CONSTRAINT user_quests_status_check 
CHECK (status IN ('pending', 'completed', 'missed', 'in_progress', 'pending_validation'));

-- Also ensure the correct transaction types are allowed
ALTER TABLE xp_transactions DROP CONSTRAINT IF EXISTS xp_transactions_transaction_type_check;
ALTER TABLE xp_transactions ADD CONSTRAINT xp_transactions_transaction_type_check
CHECK (transaction_type IN ('quest_completion', 'earned', 'level_bonus', 'penalty'));