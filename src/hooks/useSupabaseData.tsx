import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

// User profile hook
export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: any) => {
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user?.id);

      if (error) throw error;
      await fetchProfile();
      return { error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { error };
    }
  };

  return { profile, loading, updateProfile, refetch: fetchProfile };
};

// Quests hook
export const useQuests = () => {
  const { user } = useAuth();
  const [quests, setQuests] = useState<any[]>([]);
  const [userQuests, setUserQuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchQuests();
      fetchUserQuests();
    }
  }, [user]);

  const fetchQuests = async () => {
    try {
      const { data, error } = await supabase
        .from('quests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuests(data || []);
    } catch (error) {
      console.error('Error fetching quests:', error);
    }
  };

  const fetchUserQuests = async () => {
    try {
      const { data, error } = await supabase
        .from('user_quests')
        .select('*, quests(*)')
        .eq('user_id', user?.id)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      setUserQuests(data || []);
    } catch (error) {
      console.error('Error fetching user quests:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeQuest = async (questId: string) => {
    try {
      // Mark quest as completed
      const { error: questError } = await supabase
        .from('user_quests')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('user_id', user?.id)
        .eq('quest_id', questId);

      if (questError) throw questError;

      // Get quest details for XP reward
      const { data: quest } = await supabase
        .from('quests')
        .select('xp_reward')
        .eq('id', questId)
        .single();

      if (quest) {
        // Update user XP
        const { data: currentUser } = await supabase
          .from('users')
          .select('xp_points, level')
          .eq('id', user?.id)
          .single();

        if (currentUser) {
          const newXP = currentUser.xp_points + (quest.xp_reward || 10);
          const newLevel = Math.floor(newXP / 100) + 1; // Simple leveling: 100 XP per level

          await supabase
            .from('users')
            .update({ 
              xp_points: newXP,
              level: newLevel
            })
            .eq('id', user?.id);

          toast.success(`Quest Complete! +${quest.xp_reward || 10} XP`);
          
          if (newLevel > currentUser.level) {
            toast.success(`Level Up! You're now level ${newLevel}!`);
          }
        }
      }

      await fetchUserQuests();
    } catch (error) {
      console.error('Error completing quest:', error);
      toast.error('Failed to complete quest');
    }
  };

  const assignQuest = async (questId: string) => {
    try {
      const { error } = await supabase
        .from('user_quests')
        .insert([{
          user_id: user?.id,
          quest_id: questId,
          status: 'pending'
        }]);

      if (error) throw error;
      await fetchUserQuests();
    } catch (error) {
      console.error('Error assigning quest:', error);
    }
  };

  return { 
    quests, 
    userQuests, 
    loading, 
    completeQuest, 
    assignQuest,
    refetch: () => {
      fetchQuests();
      fetchUserQuests();
    }
  };
};

// Chat history hook
export const useChatHistory = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveMessage = async (message: string, response: string) => {
    try {
      const { error } = await supabase
        .from('chat_history')
        .insert([{
          user_id: user?.id,
          message,
          response
        }]);

      if (error) throw error;
      await fetchMessages();
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  return { messages, loading, saveMessage };
};

// User inputs hook for onboarding
export const useUserInputs = () => {
  const { user } = useAuth();

  const saveUserInput = async (question: string, answer: string) => {
    try {
      const { error } = await supabase
        .from('user_inputs')
        .insert([{
          user_id: user?.id,
          question,
          answer
        }]);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error saving user input:', error);
      return { error };
    }
  };

  const getUserInputs = async () => {
    try {
      const { data, error } = await supabase
        .from('user_inputs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching user inputs:', error);
      return { data: null, error };
    }
  };

  return { saveUserInput, getUserInputs };
};