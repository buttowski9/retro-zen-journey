import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PixelCard } from '@/components/ui/pixel-card';
import PixelCharacter from '@/components/pixel/PixelCharacter';
import PixelNavigation from '@/components/pixel/PixelNavigation';
import XPBar from '@/components/pixel/XPBar';
import { Calendar } from 'lucide-react';
import pixelStarryNight from '@/assets/pixel-starry-night.png';

interface XPTransaction {
  id: string;
  xp_change: number;
  transaction_type: string;
  created_at: string;
  quests?: {
    title: string;
  };
}

interface DailyProgress {
  date: string;
  completed_quests: number;
  total_quests: number;
  xp_earned: number;
}

interface UserProfile {
  id: string;
  name: string;
  level: number;
  xp_points: number;
  created_at: string;
}

const ProgressPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [xpHistory, setXpHistory] = useState<XPTransaction[]>([]);
  const [weeklyProgress, setWeeklyProgress] = useState<DailyProgress[]>([]);
  const [stats, setStats] = useState({
    totalQuests: 0,
    currentStreak: 0,
    bestStreak: 0,
    avgXPPerDay: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchProgressData();
  }, [user, navigate]);

  const fetchProgressData = async () => {
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch XP transaction history
      const { data: xpData, error: xpError } = await supabase
        .from('xp_transactions')
        .select(`
          *,
          quests (title)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (xpError) throw xpError;
      setXpHistory(xpData || []);

      // Fetch weekly progress
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: questData, error: questError } = await supabase
        .from('user_quests')
        .select(`
          assigned_date,
          status,
          quests (xp_reward)
        `)
        .eq('user_id', user?.id)
        .gte('assigned_date', sevenDaysAgo.toISOString().split('T')[0]);

      if (questError) throw questError;

      // Process weekly progress
      const progressMap = new Map<string, DailyProgress>();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        progressMap.set(dateStr, {
          date: dateStr,
          completed_quests: 0,
          total_quests: 0,
          xp_earned: 0
        });
      }

      questData?.forEach((quest) => {
        const dateStr = quest.assigned_date;
        if (progressMap.has(dateStr)) {
          const progress = progressMap.get(dateStr)!;
          progress.total_quests++;
          
          if (quest.status === 'completed') {
            progress.completed_quests++;
            progress.xp_earned += quest.quests?.xp_reward || 0;
          }
        }
      });

      setWeeklyProgress(Array.from(progressMap.values()));

      // Calculate stats
      const totalCompleted = questData?.filter(q => q.status === 'completed').length || 0;
      const avgXP = xpData?.reduce((sum, tx) => sum + (tx.xp_change > 0 ? tx.xp_change : 0), 0) || 0;
      const daysActive = new Set(xpData?.filter(tx => tx.xp_change > 0).map(tx => tx.created_at.split('T')[0])).size;
      
      setStats({
        totalQuests: totalCompleted,
        currentStreak: calculateCurrentStreak(Array.from(progressMap.values())),
        bestStreak: 0, // Would need more complex calculation
        avgXPPerDay: daysActive > 0 ? Math.round(avgXP / daysActive) : 0
      });

    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCurrentStreak = (progress: DailyProgress[]): number => {
    let streak = 0;
    const reversedProgress = [...progress].reverse();
    
    for (const day of reversedProgress) {
      if (day.completed_quests > 0) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  const calculateMaxXP = (level: number) => level * 100;
  const calculateCurrentLevelXP = (totalXP: number, level: number) => totalXP - ((level - 1) * 100);

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
      style={{ backgroundImage: `url(${pixelStarryNight})` }}
    >
      <div className="absolute inset-0 bg-black/40" />
      
      <div className="relative z-10 container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <PixelCharacter size="md" />
          <div>
            <h1 className="text-xl font-pixel text-primary">
              Your Progress
            </h1>
            <p className="text-pixel-sm text-muted-foreground">
              Look how far you've come! 🌟
            </p>
          </div>
        </div>

        {/* Current Level Progress */}
        <PixelCard className="p-6">
          <h2 className="text-lg font-pixel text-primary mb-4">Level Progress</h2>
          <XPBar
            currentXP={currentLevelXP}
            maxXP={maxXP}
            level={profile.level}
          />
          <div className="mt-4 text-center">
            <p className="text-pixel-sm text-muted-foreground">
              Member since {new Date(profile.created_at).toLocaleDateString()}
            </p>
          </div>
        </PixelCard>

        {/* Stats Overview */}
        <PixelCard className="p-6">
          <h2 className="text-lg font-pixel text-primary mb-4">Your Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-pixel text-primary">
                {stats.totalQuests}
              </div>
              <div className="text-pixel-sm text-muted-foreground">
                Quests Done
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-pixel text-primary">
                {stats.currentStreak}
              </div>
              <div className="text-pixel-sm text-muted-foreground">
                Day Streak
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-pixel text-primary">
                {profile.xp_points}
              </div>
              <div className="text-pixel-sm text-muted-foreground">
                Total XP
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-pixel text-primary">
                {stats.avgXPPerDay}
              </div>
              <div className="text-pixel-sm text-muted-foreground">
                Avg XP/Day
              </div>
            </div>
          </div>
        </PixelCard>

        {/* Weekly Progress Chart */}
        <PixelCard className="p-6">
          <h2 className="text-lg font-pixel text-primary mb-4">Past 7 Days</h2>
          <div className="space-y-3">
            {weeklyProgress.map((day, index) => {
              const completionRate = day.total_quests > 0 ? (day.completed_quests / day.total_quests) * 100 : 0;
              
              return (
                <div key={day.date} className="flex items-center gap-4">
                  <div className="w-20 text-pixel-sm text-muted-foreground">
                    {formatDate(day.date)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-pixel-sm text-foreground">
                        {day.completed_quests}/{day.total_quests} quests
                      </span>
                      <span className="text-pixel-sm text-primary">
                        +{day.xp_earned} XP
                      </span>
                    </div>
                    
                    <div className="w-full bg-surface border-2 border-muted h-3">
                      <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </PixelCard>

        {/* Recent XP Transactions */}
        <PixelCard className="p-6">
          <h2 className="text-lg font-pixel text-primary mb-4">Recent Activity</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {xpHistory.length > 0 ? (
              xpHistory.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border border-muted">
                  <div>
                    <div className="text-pixel-sm text-foreground">
                      {transaction.quests?.title || 'XP Transaction'}
                    </div>
                    <div className="text-pixel-xs text-muted-foreground">
                      {new Date(transaction.created_at).toLocaleDateString()} at{' '}
                      {new Date(transaction.created_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                  <div className={`text-pixel-sm font-pixel ${
                    transaction.xp_change > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.xp_change > 0 ? '+' : ''}{transaction.xp_change} XP
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <PixelCharacter size="sm" className="mx-auto mb-4" />
                <p className="text-pixel-sm text-muted-foreground">
                  Complete your first quest to see activity here!
                </p>
              </div>
            )}
          </div>
        </PixelCard>
      </div>

      <PixelNavigation />
    </div>
  );
};

export default ProgressPage;