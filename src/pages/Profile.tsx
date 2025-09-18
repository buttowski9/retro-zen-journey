import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile, useQuests } from '@/hooks/useSupabaseData';
import { PixelCard, PixelCardContent, PixelCardHeader, PixelCardTitle } from '@/components/ui/pixel-card';
import PixelNavigation from '@/components/pixel/PixelNavigation';
import PixelCharacter from '@/components/pixel/PixelCharacter';
import XPBar from '@/components/pixel/XPBar';
import PixelAvatar from '@/components/pixel/PixelAvatar';
import { Trophy, Medal, Star, Calendar, Zap, Heart, Target, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import pixelStarryNight from '@/assets/pixel-starry-night.png';

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useUserProfile();
  const { userQuests, loading: questsLoading } = useQuests();

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
          <p className="text-pixel font-pixel text-primary">LOADING PROFILE...</p>
        </div>
      </main>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Calculate real stats from Supabase data
  const level = profile?.level || 1;
  const currentXP = profile?.xp_points || 0;
  const maxXP = level * 100; // 100 XP per level
  
  const completedQuests = userQuests.filter(q => q.status === 'completed').length;
  const todaysQuests = userQuests.filter(q => {
    const today = new Date().toDateString();
    const questDate = new Date(q.assigned_date).toDateString();
    return today === questDate;
  });
  
  // Calculate streak (consecutive days with completed quests)
  const calculateStreak = () => {
    const completedDates = userQuests
      .filter(q => q.status === 'completed' && q.completed_at)
      .map(q => new Date(q.completed_at).toDateString())
      .filter((date, index, arr) => arr.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < completedDates.length; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      
      if (completedDates.includes(checkDate.toDateString())) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const currentStreak = calculateStreak();
  const activeDays = userQuests
    .map(q => new Date(q.assigned_date).toDateString())
    .filter((date, index, arr) => arr.indexOf(date) === index).length;

  const achievements = [
    { 
      id: 1, 
      name: "FIRST STEPS", 
      description: "Complete your first quest", 
      icon: "🚶", 
      unlocked: completedQuests > 0 
    },
    { 
      id: 2, 
      name: "STREAK MASTER", 
      description: "Maintain a 7-day streak", 
      icon: "🔥", 
      unlocked: currentStreak >= 7 
    },
    { 
      id: 3, 
      name: "QUEST CHAMPION", 
      description: "Complete 10 quests", 
      icon: "🏆", 
      unlocked: completedQuests >= 10 
    },
    { 
      id: 4, 
      name: "LEVEL UP", 
      description: "Reach level 3", 
      icon: "⭐", 
      unlocked: level >= 3 
    },
  ];

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const nextLevelXP = maxXP - currentXP;
  const progressPercentage = Math.min((currentXP / maxXP) * 100, 100);
  const avgXPPerDay = activeDays > 0 ? Math.round(currentXP / activeDays) : 0;

  return (
    <main 
      className="min-h-screen bg-background p-4 pb-24 relative"
      style={{
        backgroundImage: `url(${pixelStarryNight})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated'
      }}
    >
      <div className="absolute inset-0 bg-background/85"></div>
      
      <div className="max-w-md mx-auto space-y-6 relative z-10">
        {/* Header with Character and Sign Out */}
        <PixelCard className="p-4 hud-element">
          <div className="flex items-center gap-3">
            <PixelCharacter size="md" />
            <div className="flex-1">
              <h1 className="text-pixel-lg font-pixel text-primary">PLAYER PROFILE</h1>
              <p className="text-pixel-sm text-muted-foreground font-pixel">
                YOUR WELLNESS JOURNEY
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="btn-pixel">
                  <Trophy className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="text-pixel-error cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </PixelCard>

        {/* Player Info */}
        <PixelCard>
          <PixelCardContent className="p-6 text-center">
            <div className="space-y-4">
              <PixelAvatar size="lg" mood="happy" className="mx-auto" />
              
              <div>
              <h2 className="text-pixel font-pixel text-primary mb-2">
                  {profile?.name || user.user_metadata?.name || 'ADVENTURER'}
                </h2>
                <p className="text-pixel-sm text-muted-foreground font-pixel">
                  JOINED {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>

              <XPBar 
                currentXP={currentXP}
                maxXP={maxXP}
                level={level}
              />

              <p className="text-pixel-sm text-muted-foreground font-pixel">
                {nextLevelXP} XP TO NEXT LEVEL
              </p>
            </div>
          </PixelCardContent>
        </PixelCard>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <PixelCard>
            <PixelCardContent className="p-4 text-center">
              <Target className="w-6 h-6 text-pixel-accent mx-auto mb-2" />
              <div className="text-pixel font-pixel text-pixel-accent">
                {completedQuests}
              </div>
              <div className="text-pixel-sm text-muted-foreground">
                QUESTS DONE
              </div>
            </PixelCardContent>
          </PixelCard>

          <PixelCard>
            <PixelCardContent className="p-4 text-center">
              <Zap className="w-6 h-6 text-pixel-warning mx-auto mb-2" />
              <div className="text-pixel font-pixel text-pixel-warning">
                {currentStreak}
              </div>
              <div className="text-pixel-sm text-muted-foreground">
                DAY STREAK
              </div>
            </PixelCardContent>
          </PixelCard>
        </div>

        {/* Detailed Stats */}
        <PixelCard>
          <PixelCardHeader>
            <PixelCardTitle className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              WELLNESS STATS
            </PixelCardTitle>
          </PixelCardHeader>
          <PixelCardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary" />
                  <span className="text-pixel-sm font-pixel">TOTAL XP</span>
                </div>
                <div className="text-pixel text-primary font-pixel">
                  {currentXP}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-pixel-secondary" />
                  <span className="text-pixel-sm font-pixel">ACTIVE DAYS</span>
                </div>
                <div className="text-pixel text-pixel-secondary font-pixel">
                  {activeDays}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pixel-error" />
                  <span className="text-pixel-sm font-pixel">BEST STREAK</span>
                </div>
                <div className="text-pixel text-pixel-error font-pixel">
                  {currentStreak}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-pixel-accent" />
                  <span className="text-pixel-sm font-pixel">AVG XP/DAY</span>
                </div>
                <div className="text-pixel text-pixel-accent font-pixel">
                  {avgXPPerDay}
                </div>
              </div>
            </div>
          </PixelCardContent>
        </PixelCard>

        {/* Achievements */}
        <PixelCard>
          <PixelCardHeader>
            <PixelCardTitle className="flex items-center gap-2">
              <Medal className="w-4 h-4" />
              ACHIEVEMENTS ({unlockedAchievements.length}/{achievements.length})
            </PixelCardTitle>
          </PixelCardHeader>
          <PixelCardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-3 border-2 text-center transition-all ${
                    achievement.unlocked
                      ? 'border-primary bg-primary/10 animate-pulse-glow'
                      : 'border-muted bg-muted/20 opacity-50'
                  }`}
                >
                  <div className="text-2xl mb-1">
                    {achievement.unlocked ? achievement.icon : '🔒'}
                  </div>
                  <div className={`text-pixel-sm font-pixel mb-1 ${
                    achievement.unlocked ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {achievement.name}
                  </div>
                  <div className="text-pixel-sm text-muted-foreground leading-tight">
                    {achievement.description}
                  </div>
                </div>
              ))}
            </div>
          </PixelCardContent>
        </PixelCard>

        {/* Progress Summary */}
        <PixelCard className="bg-gradient-to-r from-surface to-surface/50">
          <PixelCardContent className="p-6 text-center">
            <div className="space-y-3">
              <h3 className="text-pixel font-pixel text-primary">
                WELLNESS JOURNEY PROGRESS
              </h3>
              
              <div className="space-y-2">
                <div className="flex justify-between text-pixel-sm font-pixel">
                  <span>LEVEL {level}</span>
                  <span>{progressPercentage.toFixed(0)}%</span>
                </div>
                
                <div className="w-full h-4 bg-surface border-2 border-primary overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-pixel-primary via-pixel-accent to-pixel-secondary transition-all duration-1000"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              <p className="text-pixel-sm text-muted-foreground font-pixel">
                KEEP GOING! YOU'RE DOING AMAZING! 🎮✨
              </p>
            </div>
          </PixelCardContent>
        </PixelCard>
      </div>
      
      <PixelNavigation />
    </main>
  );
};

export default Profile;