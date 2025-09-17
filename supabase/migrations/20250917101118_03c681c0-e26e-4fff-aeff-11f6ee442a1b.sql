-- Enable RLS on all tables and create security policies

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Enable RLS on quests table
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view quests (they're global)
CREATE POLICY "Authenticated users can view quests" ON public.quests
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Enable RLS on user_quests table
ALTER TABLE public.user_quests ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own quest assignments
CREATE POLICY "Users can view own quests" ON public.user_quests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quests" ON public.user_quests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quests" ON public.user_quests
  FOR UPDATE USING (auth.uid() = user_id);

-- Enable RLS on chat_history table
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

-- Users can only see and create their own chat history
CREATE POLICY "Users can view own chat history" ON public.chat_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat history" ON public.chat_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable RLS on user_inputs table
ALTER TABLE public.user_inputs ENABLE ROW LEVEL SECURITY;

-- Users can only see and create their own inputs
CREATE POLICY "Users can view own inputs" ON public.user_inputs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inputs" ON public.user_inputs
  FOR INSERT WITH CHECK (auth.uid() = user_id);