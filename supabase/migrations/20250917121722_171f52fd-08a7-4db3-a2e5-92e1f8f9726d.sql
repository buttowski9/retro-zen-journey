-- Update users table to store onboarding responses
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS stress_level INTEGER;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS lifestyle_habits TEXT[];
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS wellness_goals TEXT[];
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS happy_activities TEXT[];
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS preferred_quest_types TEXT[];
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS daily_availability TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS motivation_style TEXT;

-- Update quests table to support QOD vs small quests
ALTER TABLE public.quests ADD COLUMN IF NOT EXISTS quest_category TEXT DEFAULT 'small';
ALTER TABLE public.quests ADD COLUMN IF NOT EXISTS is_punishment BOOLEAN DEFAULT FALSE;
ALTER TABLE public.quests ADD COLUMN IF NOT EXISTS requires_validation BOOLEAN DEFAULT FALSE;

-- Update user_quests table for better tracking
ALTER TABLE public.user_quests ADD COLUMN IF NOT EXISTS validation_status TEXT DEFAULT 'pending';
ALTER TABLE public.user_quests ADD COLUMN IF NOT EXISTS is_main_qod BOOLEAN DEFAULT FALSE;
ALTER TABLE public.user_quests ADD COLUMN IF NOT EXISTS streak_count INTEGER DEFAULT 0;
ALTER TABLE public.user_quests ADD COLUMN IF NOT EXISTS assigned_date DATE DEFAULT CURRENT_DATE;

-- Create XP tracking table
CREATE TABLE IF NOT EXISTS public.xp_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  quest_id UUID REFERENCES public.quests(id),
  xp_change INTEGER NOT NULL,
  transaction_type TEXT NOT NULL, -- 'earned', 'penalty', 'validation'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for xp_transactions
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for xp_transactions
CREATE POLICY "Users can view own XP transactions" 
ON public.xp_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own XP transactions" 
ON public.xp_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create daily quest assignments table
CREATE TABLE IF NOT EXISTS public.daily_quest_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  assigned_date DATE DEFAULT CURRENT_DATE,
  main_qod UUID REFERENCES public.quests(id),
  small_quests UUID[],
  punishment_quests UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, assigned_date)
);

-- Enable RLS for daily_quest_assignments
ALTER TABLE public.daily_quest_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for daily_quest_assignments
CREATE POLICY "Users can view own quest assignments" 
ON public.daily_quest_assignments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quest assignments" 
ON public.daily_quest_assignments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quest assignments" 
ON public.daily_quest_assignments 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Insert default quests
INSERT INTO public.quests (title, description, xp_reward, type, quest_category, requires_validation) VALUES
-- Main QOD quests
('Practice Mindful Breathing', 'Take 10 deep breaths focusing on the sensation of air entering and leaving your body', 50, 'daily', 'main', true),
('Write in Gratitude Journal', 'Write down 3 things you are grateful for today and why they matter to you', 50, 'daily', 'main', true),
('Take a Nature Walk', 'Spend 15 minutes walking outside, observing your surroundings mindfully', 50, 'daily', 'main', true),
('Practice Self-Compassion', 'Write yourself a kind note as if comforting a good friend', 50, 'daily', 'main', true),
('Digital Detox Hour', 'Spend 1 hour without any screens, engaging in offline activities', 50, 'daily', 'main', true),

-- Small daily quests
('Drink 8 Glasses of Water', 'Stay hydrated throughout the day for better mental clarity', 10, 'daily', 'small', false),
('Take 5 Deep Breaths', 'Pause and take 5 mindful breaths when feeling stressed', 10, 'daily', 'small', false),
('Write One Journal Entry', 'Record your thoughts and feelings for 5 minutes', 15, 'daily', 'small', true),
('20 Minute No-Screen Time', 'Take a break from all digital devices for 20 minutes', 15, 'daily', 'small', false),
('Practice Gentle Stretching', 'Do 10 minutes of gentle stretches to release tension', 10, 'daily', 'small', false),
('Listen to Calming Music', 'Spend 10 minutes listening to music that makes you feel peaceful', 10, 'daily', 'small', false),

-- Punishment quests (small tasks for missed QODs)
('Write 2 Affirmations', 'Write down 2 positive statements about yourself', 5, 'daily', 'punishment', true),
('5-Minute Meditation', 'Sit quietly and focus on your breathing for 5 minutes', 5, 'daily', 'punishment', false),
('Tidy Your Space', 'Spend 10 minutes organizing your immediate surroundings', 5, 'daily', 'punishment', false),
('Text a Friend', 'Send a caring message to someone you care about', 5, 'daily', 'punishment', false)
ON CONFLICT DO NOTHING;

-- Function to assign personalized daily quests
CREATE OR REPLACE FUNCTION public.assign_personalized_daily_quests(user_uuid UUID)
RETURNS void AS $$
DECLARE
  main_quest UUID;
  small_quest_ids UUID[];
  user_goals TEXT[];
  user_stress INTEGER;
BEGIN
  -- Get user preferences
  SELECT wellness_goals, stress_level INTO user_goals, user_stress
  FROM public.users 
  WHERE id = user_uuid;

  -- Select main QOD based on user profile
  SELECT id INTO main_quest
  FROM public.quests 
  WHERE quest_category = 'main' 
  AND type = 'daily'
  ORDER BY RANDOM() 
  LIMIT 1;

  -- Select 3-4 small quests
  SELECT ARRAY(
    SELECT id 
    FROM public.quests 
    WHERE quest_category = 'small' 
    AND type = 'daily'
    ORDER BY RANDOM() 
    LIMIT 4
  ) INTO small_quest_ids;

  -- Insert or update today's quest assignment
  INSERT INTO public.daily_quest_assignments (user_id, assigned_date, main_qod, small_quests)
  VALUES (user_uuid, CURRENT_DATE, main_quest, small_quest_ids)
  ON CONFLICT (user_id, assigned_date) 
  DO UPDATE SET 
    main_qod = EXCLUDED.main_qod,
    small_quests = EXCLUDED.small_quests;

  -- Create user_quests entries
  INSERT INTO public.user_quests (user_id, quest_id, status, is_main_qod, assigned_date)
  VALUES (user_uuid, main_quest, 'pending', true, CURRENT_DATE)
  ON CONFLICT DO NOTHING;

  -- Insert small quests
  INSERT INTO public.user_quests (user_id, quest_id, status, is_main_qod, assigned_date)
  SELECT user_uuid, unnest(small_quest_ids), 'pending', false, CURRENT_DATE
  ON CONFLICT DO NOTHING;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;