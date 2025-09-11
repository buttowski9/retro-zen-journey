import { useState } from 'react';
import { PixelCard, PixelCardContent, PixelCardHeader, PixelCardTitle } from '@/components/ui/pixel-card';
import PixelNavigation from '@/components/pixel/PixelNavigation';
import PixelCharacter from '@/components/pixel/PixelCharacter';
import XPBar from '@/components/pixel/XPBar';
import PixelAvatar from '@/components/pixel/PixelAvatar';
import { Trophy, Medal, Star, Calendar, Zap, Heart, Target } from 'lucide-react';
import pixelStarryNight from '@/assets/pixel-starry-night.png';

const Profile = () => {
  const [playerData] = useState({
    username: "PIXEL_WARRIOR",
    level: 3,
    currentXP: 125,
    maxXP: 200,
    totalXP: 525,
    streak: 7,
    joinDate: "2024-01-15",
    achievements: [
      { id: 1, name: "FIRST STEPS", description: "Complete your first quest", icon: "🚶", unlocked: true },
      { id: 2, name: "STREAK MASTER", description: "Maintain a 7-day streak", icon: "🔥", unlocked: true },
      { id: 3, name: "HYDRATION HERO", description: "Drink water 10 days in a row", icon: "💧", unlocked: true },
      { id: 4, name: "MEDITATION MASTER", description: "Meditate for 30 days", icon: "🧘", unlocked: false },
      { id: 5, name: "STEP CHAMPION", description: "Walk 10,000 steps in one day", icon: "👟", unlocked: false },
      { id: 6, name: "WELLNESS WARRIOR", description: "Reach level 5", icon: "⚔️", unlocked: false },
    ],
    stats: {
      questsCompleted: 23,
      streakRecord: 12,
      totalDays: 15,
      averageXPPerDay: 35
    }
  });

  const unlockedAchievements = playerData.achievements.filter(a => a.unlocked);
  const nextLevelXP = playerData.maxXP - playerData.currentXP;
  const progressPercentage = (playerData.currentXP / playerData.maxXP) * 100;

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
        {/* Header with Character */}
        <PixelCard className="p-4 hud-element">
          <div className="flex items-center gap-3">
            <PixelCharacter state="happy" size="md" />
            <div className="flex-1">
              <h1 className="text-pixel-lg font-pixel text-primary">PLAYER PROFILE</h1>
              <p className="text-pixel-sm text-muted-foreground font-pixel">
                YOUR WELLNESS JOURNEY
              </p>
            </div>
            <Trophy className="w-5 h-5 text-pixel-accent" />
          </div>
        </PixelCard>

        {/* Player Info */}
        <PixelCard>
          <PixelCardContent className="p-6 text-center">
            <div className="space-y-4">
              <PixelAvatar size="lg" mood="happy" className="mx-auto" />
              
              <div>
                <h2 className="text-pixel font-pixel text-primary mb-2">
                  {playerData.username}
                </h2>
                <p className="text-pixel-sm text-muted-foreground font-pixel">
                  JOINED {new Date(playerData.joinDate).toLocaleDateString()}
                </p>
              </div>

              <XPBar 
                currentXP={playerData.currentXP}
                maxXP={playerData.maxXP}
                level={playerData.level}
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
                {playerData.stats.questsCompleted}
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
                {playerData.streak}
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
                  {playerData.totalXP.toLocaleString()}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-pixel-secondary" />
                  <span className="text-pixel-sm font-pixel">ACTIVE DAYS</span>
                </div>
                <div className="text-pixel text-pixel-secondary font-pixel">
                  {playerData.stats.totalDays}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pixel-error" />
                  <span className="text-pixel-sm font-pixel">BEST STREAK</span>
                </div>
                <div className="text-pixel text-pixel-error font-pixel">
                  {playerData.stats.streakRecord}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-pixel-accent" />
                  <span className="text-pixel-sm font-pixel">AVG XP/DAY</span>
                </div>
                <div className="text-pixel text-pixel-accent font-pixel">
                  {playerData.stats.averageXPPerDay}
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
              ACHIEVEMENTS ({unlockedAchievements.length}/{playerData.achievements.length})
            </PixelCardTitle>
          </PixelCardHeader>
          <PixelCardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              {playerData.achievements.map((achievement) => (
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
                  <span>LEVEL {playerData.level}</span>
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