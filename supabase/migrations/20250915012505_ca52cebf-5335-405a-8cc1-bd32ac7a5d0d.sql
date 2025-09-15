-- Create users table for profiles and XP tracking
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  name TEXT,
  email TEXT,
  level INTEGER DEFAULT 1,
  xp_points INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

-- Create quests table
CREATE TABLE public.quests (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  xp_reward INTEGER DEFAULT 10,
  type TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Create user_quests table for quest assignments and completion
CREATE TABLE public.user_quests (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID,
  quest_id UUID,
  status TEXT DEFAULT 'pending',
  completed_at TIMESTAMP
);

-- Create chat_history table for AI conversations
CREATE TABLE public.chat_history (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID,
  message TEXT,
  response TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Create user_inputs table for onboarding responses
CREATE TABLE public.user_inputs (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID,
  question TEXT,
  answer TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_inputs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for quests table (public read access)
CREATE POLICY "Anyone can view quests" ON public.quests
  FOR SELECT USING (true);

-- RLS Policies for user_quests table
CREATE POLICY "Users can view their own quests" ON public.user_quests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own quests" ON public.user_quests
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quests" ON public.user_quests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for chat_history table
CREATE POLICY "Users can view their own chat history" ON public.chat_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat messages" ON public.chat_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_inputs table
CREATE POLICY "Users can view their own inputs" ON public.user_inputs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inputs" ON public.user_inputs
  FOR INSERT WITH CHECK (auth.uid() = user_id);