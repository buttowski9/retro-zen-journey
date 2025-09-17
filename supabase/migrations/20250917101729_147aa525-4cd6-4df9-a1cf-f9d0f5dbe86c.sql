-- Create function to auto-assign daily quests to new users
CREATE OR REPLACE FUNCTION public.assign_daily_quests_to_user(user_uuid UUID)
RETURNS void AS $$
BEGIN
  -- Insert all daily quests for the user if they don't have them already
  INSERT INTO public.user_quests (user_id, quest_id, status)
  SELECT 
    user_uuid,
    q.id,
    'pending'
  FROM public.quests q
  WHERE q.type = 'daily'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_quests uq 
    WHERE uq.user_id = user_uuid AND uq.quest_id = q.id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;