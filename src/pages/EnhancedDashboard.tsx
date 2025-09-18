import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PixelCard } from '@/components/ui/pixel-card';
import { PixelButton } from '@/components/ui/pixel-button';
import PixelCharacter from '@/components/pixel/PixelCharacter';
import PixelNavigation from '@/components/pixel/PixelNavigation';
import XPBar from '@/components/pixel/XPBar';
import { toast } from 'sonner';
import pixelStudyRoom from '@/assets/pixel-study-room.png';

interface Quest {
  id: string;
  title: string;
  description: string;
  xp_reward: number;
  quest_category: string;
  requires_validation: boolean;
  is_punishment: boolean;
}

interface UserQuest {
  id: string;
  quest_id: string;
  status: string;
  is_main_qod: boolean;
  validation_status: string;
  assigned_date: string;
  quests: Quest;
}

interface UserProfile {
  id: string;
  name: string;
  level: number;
  xp_points: number;
  onboarding_completed: boolean;
}

const EnhancedDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [todaysQuests, setTodaysQuests] = useState<UserQuest[]>([]);
  const [mainQOD, setMainQOD] = useState<UserQuest | null>(null);
  const [smallQuests, setSmallQuests] = useState<UserQuest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchUserData();
  }, [user, navigate]);

  const fetchUserData = async () => {
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profileData) {
        toast.error('Profile not found');
        navigate('/auth');
        return;
      }

      if (!profileData.onboarding_completed) {
        navigate('/onboarding');
        return;
      }

      setProfile(profileData);

      // Fetch today's quests
      const today = new Date().toISOString().split('T')[0];
      const { data: questsData, error: questsError } = await supabase
        .from('user_quests')
        .select(`
          *,
          quests (
            id,
            title,
            description,
            xp_reward,
            quest_category,
            requires_validation,
            is_punishment
          )
        `)
        .eq('user_id', user?.id)
        .eq('assigned_date', today);

      if (questsError) throw questsError;

      setTodaysQuests(questsData || []);
      
      // Separate main QOD from small quests
      const mainQuest = questsData?.find(q => q.is_main_qod);
      const smallQuestsData = questsData?.filter(q => !q.is_main_qod);
      
      setMainQOD(mainQuest || null);
      setSmallQuests(smallQuestsData || []);

      // If no quests for today, assign them
      if (!questsData || questsData.length === 0) {
        await assignTodaysQuests();
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const assignTodaysQuests = async () => {
    try {
      const { error } = await supabase
        .rpc('assign_personalized_daily_quests', { 
          user_uuid: user?.id 
        });

      if (error) throw error;
      
      // Refresh data
      await fetchUserData();
    } catch (error) {
      console.error('Error assigning daily quests:', error);
    }
  };

  const completeQuest = async (userQuestId: string, requiresValidation: boolean) => {
    try {
      const newStatus = requiresValidation ? 'pending_validation' : 'completed';
      
      console.log(`Attempting to complete quest ${userQuestId} with status: ${newStatus}`);
      
      const { error } = await supabase
        .from('user_quests')
        .update({ 
          status: newStatus,
          validation_status: requiresValidation ? 'pending' : 'approved',
          completed_at: new Date().toISOString()
        })
        .eq('id', userQuestId)
        .eq('user_id', user?.id); // Add user_id check for security

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      if (requiresValidation) {
        toast.success('Quest submitted for validation! 🎯');
      } else {
        // Add XP immediately for non-validation quests
        const quest = todaysQuests.find(q => q.id === userQuestId);
        if (quest) {
          console.log(`Adding ${quest.quests.xp_reward} XP for quest: ${quest.quests.title}`);
          
          const { error: xpError } = await supabase
            .from('xp_transactions')
            .insert({
              user_id: user?.id,
              quest_id: quest.quest_id,
              xp_change: quest.quests.xp_reward,
              transaction_type: 'quest_completion'
            });

          if (xpError) {
            console.error('XP transaction error:', xpError);
          } else {
            // Update user XP
            const newXP = (profile?.xp_points || 0) + quest.quests.xp_reward;
            const newLevel = Math.floor(newXP / 100) + 1;
            
            const { error: userUpdateError } = await supabase
              .from('users')
              .update({ 
                xp_points: newXP,
                level: newLevel
              })
              .eq('id', user?.id);
            
            if (userUpdateError) {
              console.error('User update error:', userUpdateError);
            } else {
              console.log(`User XP updated: ${newXP}, Level: ${newLevel}`);
              toast.success(`Quest completed! +${quest.quests.xp_reward} XP ✨`);
            }
          }
        }
      }

      // Refresh data
      await fetchUserData();
    } catch (error) {
      console.error('Error completing quest:', error);
      toast.error(`Failed to complete quest: ${error.message}`);
    }
  };

  const calculateMaxXP = (level: number) => {
    return level * 100; // 100 XP per level
  };

  const calculateCurrentLevelXP = (totalXP: number, level: number) => {
    return totalXP - ((level - 1) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PixelCharacter size="lg" />
      </div>
    );
  }

  if (!profile) return null;

  const maxXP = calculateMaxXP(profile.level);
  const currentLevelXP = calculateCurrentLevelXP(profile.xp_points, profile.level);

  return (
    <div 
      className="min-h-screen bg-cover bg-center pb-20"
      style={{ backgroundImage: `url(${pixelStudyRoom})` }}
    >
      <div className="absolute inset-0 bg-black/30" />
      
      <div className="relative z-10 container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <PixelCharacter size="md" />
            <div>
              <h1 className="text-xl font-pixel text-primary">
                Welcome back, {profile.name}! 
              </h1>
              <p className="text-pixel-sm text-muted-foreground">
                Ready for today's adventures?
              </p>
            </div>
          </div>
          
          <PixelButton
            variant="outline"
            size="sm"
            onClick={() => navigate('/profile')}
          >
            Profile
          </PixelButton>
        </div>

        {/* XP Progress */}
        <PixelCard className="p-6">
          <XPBar
            currentXP={currentLevelXP}
            maxXP={maxXP}
            level={profile.level}
          />
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-pixel text-primary">
                {todaysQuests.filter(q => q.status === 'completed').length}
              </div>
              <div className="text-pixel-sm text-muted-foreground">
                Completed Today
              </div>
            </div>
            <div>
              <div className="text-lg font-pixel text-primary">
                {profile.xp_points}
              </div>
              <div className="text-pixel-sm text-muted-foreground">
                Total XP
              </div>
            </div>
            <div>
              <div className="text-lg font-pixel text-primary">
                {profile.level}
              </div>
              <div className="text-pixel-sm text-muted-foreground">
                Level
              </div>
            </div>
          </div>
        </PixelCard>

        {/* Main Quest of the Day */}
        {mainQOD && (
          <PixelCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-primary border-2 border-primary flex items-center justify-center">
                <span className="text-pixel-sm text-surface font-bold">⭐</span>
              </div>
              <h2 className="text-lg font-pixel text-primary">
                Quest of the Day
              </h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-pixel font-bold text-foreground mb-2">
                  {mainQOD.quests.title}
                </h3>
                <p className="text-pixel-sm text-muted-foreground mb-3">
                  {mainQOD.quests.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-pixel-sm font-pixel text-primary">
                    +{mainQOD.quests.xp_reward} XP
                  </span>
                  
                  {mainQOD.status === 'pending' && (
                    <PixelButton
                      size="sm"
                      onClick={() => completeQuest(mainQOD.id, mainQOD.quests.requires_validation)}
                    >
                      Complete Quest
                    </PixelButton>
                  )}
                  
                  {mainQOD.status === 'pending_validation' && (
                    <span className="text-pixel-sm text-yellow-600 font-pixel">
                      Pending Validation ⏳
                    </span>
                  )}
                  
                  {mainQOD.status === 'completed' && (
                    <span className="text-pixel-sm text-green-600 font-pixel">
                      Completed! ✅
                    </span>
                  )}
                </div>
              </div>
            </div>
          </PixelCard>
        )}

        {/* Small Daily Quests */}
        {smallQuests.length > 0 && (
          <PixelCard className="p-6">
            <h2 className="text-lg font-pixel text-primary mb-4">
              Daily Habits
            </h2>
            
            <div className="space-y-3">
              {smallQuests.map((quest) => (
                <div 
                  key={quest.id}
                  className={`p-4 border-2 transition-all ${
                    quest.status === 'completed' 
                      ? 'border-green-500 bg-green-50/50' 
                      : 'border-muted hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-pixel font-bold text-foreground">
                        {quest.quests.title}
                      </h4>
                      <p className="text-pixel-sm text-muted-foreground">
                        {quest.quests.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-pixel-sm font-pixel text-primary">
                        +{quest.quests.xp_reward} XP
                      </span>
                      
                      {quest.status === 'pending' && (
                        <PixelButton
                          size="sm"
                          variant="outline"
                          onClick={() => completeQuest(quest.id, quest.quests.requires_validation)}
                        >
                          ✓
                        </PixelButton>
                      )}
                      
                      {quest.status === 'pending_validation' && (
                        <span className="text-pixel-sm text-yellow-600">⏳</span>
                      )}
                      
                      {quest.status === 'completed' && (
                        <span className="text-pixel-sm text-green-600">✅</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </PixelCard>
        )}

        {/* Motivational Message */}
        <PixelCard className="p-6 text-center">
          <PixelCharacter size="sm" className="mx-auto mb-4" />
          <p className="text-pixel text-muted-foreground">
            "Every small step counts towards your wellness journey! 
            Keep going, you've got this! 💪"
          </p>
        </PixelCard>
      </div>

      <PixelNavigation />
    </div>
  );
};

export default EnhancedDashboard;