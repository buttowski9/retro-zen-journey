import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile, useQuests } from '@/hooks/useSupabaseData';
import { PixelCard, PixelCardContent, PixelCardHeader, PixelCardTitle } from '@/components/ui/pixel-card';
import PixelNavigation from '@/components/pixel/PixelNavigation';
import PixelCharacter from '@/components/pixel/PixelCharacter';
import XPBar from '@/components/pixel/XPBar';
import { CheckCircle, Circle, Flame, Star, Trophy, Calendar } from 'lucide-react';
import pixelSunsetTown from '@/assets/pixel-sunset-town.png';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useUserProfile();
  const { userQuests, loading: questsLoading, completeQuest } = useQuests();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user || profileLoading || questsLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <PixelCharacter size="lg" />
          <p className="text-pixel font-pixel text-primary">LOADING QUESTS...</p>
        </div>
      </main>
    );
  }

  const completedQuests = userQuests.filter(q => q.status === 'completed').length;
  const pendingQuests = userQuests.filter(q => q.status === 'pending');
  const dailyQuests = pendingQuests.filter(q => q.quests?.type === 'daily' || q.quests?.title?.includes('DAILY'));
  const weeklyQuests = pendingQuests.filter(q => q.quests?.type === 'weekly' || q.quests?.title?.includes('WEEKLY'));
  
  const currentXP = profile?.xp_points || 0;
  const level = profile?.level || 1;
  const maxXP = level * 100; // 100 XP per level

  return (
    <main 
      className="min-h-screen bg-background p-4 pb-24 relative"
      style={{
        backgroundImage: `url(${pixelSunsetTown})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated'
      }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-background/85"></div>
      
      <div className="max-w-md mx-auto space-y-6 relative z-10">
        {/* Header with Character */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <PixelCharacter size="md" />
            <div>
              <h1 className="text-pixel-lg font-pixel text-primary">QUEST DASHBOARD</h1>
              <p className="text-pixel-sm text-muted-foreground font-pixel">
                TODAY'S MISSIONS
              </p>
            </div>
          </div>
        </div>

        {/* Player Stats */}
        <PixelCard>
          <PixelCardHeader>
            <PixelCardTitle>PLAYER STATS</PixelCardTitle>
          </PixelCardHeader>
          <PixelCardContent className="space-y-4">
            <XPBar 
              currentXP={currentXP} 
              maxXP={maxXP}
              level={level}
            />
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center space-y-1">
                <Flame className="w-5 h-5 text-pixel-accent mx-auto" />
                <div className="text-pixel-sm font-pixel text-pixel-accent">0</div>
                <div className="text-pixel-sm text-muted-foreground">STREAK</div>
              </div>
              <div className="text-center space-y-1">
                <Star className="w-5 h-5 text-pixel-warning mx-auto" />
                <div className="text-pixel-sm font-pixel text-pixel-warning">{completedQuests}</div>
                <div className="text-pixel-sm text-muted-foreground">COMPLETED</div>
              </div>
              <div className="text-center space-y-1">
                <Trophy className="w-5 h-5 text-primary mx-auto" />
                <div className="text-pixel-sm font-pixel text-primary">{currentXP}</div>
                <div className="text-pixel-sm text-muted-foreground">TOTAL XP</div>
              </div>
            </div>
          </PixelCardContent>
        </PixelCard>

        {/* Daily Quests */}
        <PixelCard>
          <PixelCardHeader>
            <PixelCardTitle className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              DAILY QUESTS
            </PixelCardTitle>
          </PixelCardHeader>
          <PixelCardContent className="space-y-3">
            {dailyQuests.length === 0 ? (
              <div className="text-center p-6">
                <p className="text-pixel-sm text-muted-foreground">
                  No daily quests assigned yet. Visit the onboarding to get started!
                </p>
              </div>
            ) : (
              dailyQuests.map((userQuest) => (
                <div
                  key={userQuest.id}
                  className={`p-3 border-2 transition-all duration-200 ${
                    userQuest.status === 'completed'
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-surface hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        onClick={() => completeQuest(userQuest.quest_id)}
                        disabled={userQuest.status === 'completed'}
                        className="text-primary hover:text-primary-glow transition-colors"
                      >
                        {userQuest.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>
                      
                      <div className="flex-1">
                        <h3 className={`text-pixel-sm font-pixel ${
                          userQuest.status === 'completed' ? 'text-primary' : 'text-foreground'
                        }`}>
                          {userQuest.quests?.title || 'Quest'}
                        </h3>
                        <p className="text-pixel-sm text-muted-foreground">
                          {userQuest.quests?.description || 'Complete this quest'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-pixel-sm font-pixel text-pixel-accent">
                      +{userQuest.quests?.xp_reward || 10} XP
                    </div>
                  </div>
                </div>
              ))
            )}
          </PixelCardContent>
        </PixelCard>

        {/* Weekly Challenges */}
        <PixelCard>
          <PixelCardHeader>
            <PixelCardTitle className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              WEEKLY CHALLENGES
            </PixelCardTitle>
          </PixelCardHeader>
          <PixelCardContent className="space-y-3">
            {weeklyQuests.length === 0 ? (
              <div className="text-center p-6">
                <p className="text-pixel-sm text-muted-foreground">
                  No weekly challenges available yet.
                </p>
              </div>
            ) : (
              weeklyQuests.map((userQuest) => (
                <div
                  key={userQuest.id}
                  className="p-3 border-2 border-pixel-accent bg-pixel-accent/5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="text-pixel-accent">
                        {userQuest.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-pixel-sm font-pixel text-foreground">
                          {userQuest.quests?.title || 'Weekly Quest'}
                        </h3>
                        <p className="text-pixel-sm text-muted-foreground">
                          {userQuest.quests?.description || 'Complete this weekly challenge'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-pixel-sm font-pixel text-pixel-accent">
                      +{userQuest.quests?.xp_reward || 50} XP
                    </div>
                  </div>
                </div>
              ))
            )}
          </PixelCardContent>
        </PixelCard>

        {/* Progress Summary */}
        <PixelCard className="bg-gradient-to-r from-surface to-surface/50">
          <PixelCardContent className="p-4 text-center">
            <div className="space-y-2">
              <p className="text-pixel-sm font-pixel text-foreground">
                TODAY'S PROGRESS
              </p>
              <p className="text-pixel font-pixel text-primary">
                {completedQuests} / {userQuests.length} QUESTS COMPLETE
              </p>
              <div className="w-full h-2 bg-surface border border-primary overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-pixel-primary to-pixel-accent transition-all duration-500"
                  style={{ 
                    width: `${userQuests.length > 0 ? (completedQuests / userQuests.length) * 100 : 0}%` 
                  }}
                />
              </div>
            </div>
          </PixelCardContent>
        </PixelCard>
      </div>
      
      <PixelNavigation />
    </main>
  );
};

export default Dashboard;