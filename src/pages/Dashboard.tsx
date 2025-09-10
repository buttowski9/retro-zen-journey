import { useState } from 'react';
import { PixelButton } from '@/components/ui/pixel-button';
import { PixelCard, PixelCardContent, PixelCardHeader, PixelCardTitle } from '@/components/ui/pixel-card';
import PixelNavigation from '@/components/pixel/PixelNavigation';
import XPBar from '@/components/pixel/XPBar';
import { CheckCircle, Circle, Flame, Star, Trophy, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface Quest {
  id: string;
  title: string;
  description: string;
  xp: number;
  completed: boolean;
  type: 'daily' | 'weekly';
}

const Dashboard = () => {
  const [quests, setQuests] = useState<Quest[]>([
    {
      id: '1',
      title: 'MORNING WALK',
      description: 'Take a 15-minute walk outside',
      xp: 10,
      completed: false,
      type: 'daily'
    },
    {
      id: '2', 
      title: 'HYDRATE HERO',
      description: 'Drink 8 glasses of water',
      xp: 10,
      completed: true,
      type: 'daily'
    },
    {
      id: '3',
      title: 'MINDFUL MOMENT',
      description: 'Meditate for 5 minutes',
      xp: 15,
      completed: false,
      type: 'daily'
    },
    {
      id: '4',
      title: 'WEEKLY WARRIOR',
      description: 'Complete 5 daily quests',
      xp: 50,
      completed: false,
      type: 'weekly'
    }
  ]);

  const [playerStats] = useState({
    level: 3,
    currentXP: 125,
    maxXP: 200,
    streak: 7,
    totalXP: 525
  });

  const completedQuests = quests.filter(q => q.completed).length;
  const totalXPToday = quests.filter(q => q.completed && q.type === 'daily').reduce((sum, q) => sum + q.xp, 0);

  const completeQuest = (questId: string) => {
    setQuests(prev => prev.map(quest => {
      if (quest.id === questId && !quest.completed) {
        toast.success(`Quest Complete! +${quest.xp} XP`, {
          duration: 3000,
        });
        return { ...quest, completed: true };
      }
      return quest;
    }));
  };

  return (
    <main className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-pixel-lg font-pixel text-primary">QUEST DASHBOARD</h1>
          <p className="text-pixel-sm text-muted-foreground font-pixel">
            TODAY'S MISSIONS
          </p>
        </div>

        {/* Player Stats */}
        <PixelCard>
          <PixelCardHeader>
            <PixelCardTitle>PLAYER STATS</PixelCardTitle>
          </PixelCardHeader>
          <PixelCardContent className="space-y-4">
            <XPBar 
              currentXP={playerStats.currentXP} 
              maxXP={playerStats.maxXP}
              level={playerStats.level}
            />
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center space-y-1">
                <Flame className="w-5 h-5 text-pixel-accent mx-auto" />
                <div className="text-pixel-sm font-pixel text-pixel-accent">{playerStats.streak}</div>
                <div className="text-pixel-sm text-muted-foreground">STREAK</div>
              </div>
              <div className="text-center space-y-1">
                <Star className="w-5 h-5 text-pixel-warning mx-auto" />
                <div className="text-pixel-sm font-pixel text-pixel-warning">{totalXPToday}</div>
                <div className="text-pixel-sm text-muted-foreground">XP TODAY</div>
              </div>
              <div className="text-center space-y-1">
                <Trophy className="w-5 h-5 text-primary mx-auto" />
                <div className="text-pixel-sm font-pixel text-primary">{playerStats.totalXP}</div>
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
            {quests.filter(q => q.type === 'daily').map((quest) => (
              <div
                key={quest.id}
                className={`p-3 border-2 transition-all duration-200 ${
                  quest.completed
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-surface hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => completeQuest(quest.id)}
                      disabled={quest.completed}
                      className="text-primary hover:text-primary-glow transition-colors"
                    >
                      {quest.completed ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    
                    <div className="flex-1">
                      <h3 className={`text-pixel-sm font-pixel ${
                        quest.completed ? 'text-primary' : 'text-foreground'
                      }`}>
                        {quest.title}
                      </h3>
                      <p className="text-pixel-sm text-muted-foreground">
                        {quest.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-pixel-sm font-pixel text-pixel-accent">
                    +{quest.xp} XP
                  </div>
                </div>
              </div>
            ))}
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
            {quests.filter(q => q.type === 'weekly').map((quest) => (
              <div
                key={quest.id}
                className="p-3 border-2 border-pixel-accent bg-pixel-accent/5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-pixel-accent">
                      {quest.completed ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-pixel-sm font-pixel text-foreground">
                        {quest.title}
                      </h3>
                      <p className="text-pixel-sm text-muted-foreground">
                        {quest.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-pixel-sm font-pixel text-pixel-accent">
                    +{quest.xp} XP
                  </div>
                </div>
              </div>
            ))}
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
                {completedQuests} / {quests.filter(q => q.type === 'daily').length} QUESTS COMPLETE
              </p>
              <div className="w-full h-2 bg-surface border border-primary overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-pixel-primary to-pixel-accent transition-all duration-500"
                  style={{ 
                    width: `${(completedQuests / quests.filter(q => q.type === 'daily').length) * 100}%` 
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