import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { PixelButton } from '@/components/ui/pixel-button';
import { PixelCard } from '@/components/ui/pixel-card';
import PixelCharacter from '@/components/pixel/PixelCharacter';
import { Sparkles, Gamepad2, LogOut } from 'lucide-react';
import pixelForestBg from '@/assets/pixel-forest-bg.png';

const Home = () => {
  const { user, signOut } = useAuth();
  
  if (!user) {
    return (
      <main 
        className="min-h-screen flex items-center justify-center p-4 pb-20 relative overflow-hidden"
        style={{
          backgroundImage: `url(${pixelForestBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated'
        }}
      >
        <div className="absolute inset-0 bg-background/80"></div>
        
        <div className="w-full max-w-md mx-auto space-y-8 relative z-10">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-pixel-xl font-pixel text-primary animate-pulse">
                MINDQUEST
              </h1>
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-pixel-accent animate-pulse" />
                <p className="text-pixel-sm text-muted-foreground font-pixel">
                  LEVEL UP YOUR WELLNESS
                </p>
                <Sparkles className="w-4 h-4 text-pixel-accent animate-pulse" />
              </div>
            </div>
            
            <PixelCard className="p-8 relative overflow-hidden bg-surface/90 backdrop-blur-sm">
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <PixelCharacter size="lg" />
                </div>
                
                <div className="space-y-4">
                  <h2 className="text-pixel font-pixel text-foreground">
                    SIGN IN TO START YOUR
                  </h2>
                  <h2 className="text-pixel font-pixel text-primary">
                    WELLNESS QUEST
                  </h2>
                </div>
              </div>
              
              <div className="absolute inset-0 opacity-10">
                <div 
                  className="w-full h-full"
                  style={{
                    backgroundImage: `
                      radial-gradient(circle at 2px 2px, hsl(var(--pixel-primary)) 1px, transparent 0),
                      radial-gradient(circle at 6px 6px, hsl(var(--pixel-accent)) 1px, transparent 0)
                    `,
                    backgroundSize: '8px 8px'
                  }}
                />
              </div>
            </PixelCard>
          </div>
          
          <div className="space-y-4">
            <Link to="/auth" className="block">
              <PixelButton variant="hero" size="lg" className="w-full">
                <Gamepad2 className="w-4 h-4" />
                START ADVENTURE
              </PixelButton>
            </Link>
          </div>
          
          <PixelCard className="p-4">
            <p className="text-pixel-sm text-muted-foreground font-pixel text-center leading-relaxed">
              CREATE ACCOUNT • COMPLETE DAILY QUESTS • EARN XP • LEVEL UP YOUR WELLNESS
            </p>
          </PixelCard>
        </div>
      </main>
    );
  }

  return (
    <main 
      className="min-h-screen flex items-center justify-center p-4 pb-20 relative overflow-hidden"
      style={{
        backgroundImage: `url(${pixelForestBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated'
      }}
    >
      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-background/80"></div>
      
      <div className="w-full max-w-md mx-auto space-y-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          {/* Header with logout */}
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-pixel-lg font-pixel text-primary">
                WELCOME BACK!
              </h1>
              <p className="text-pixel-sm text-muted-foreground font-pixel">
                Hi, {user.user_metadata?.name || 'Adventurer'} 👋
              </p>
            </div>
            <PixelButton variant="outline" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4" />
            </PixelButton>
          </div>
          
          {/* Main Title */}
          <div className="space-y-2">
            <h1 className="text-pixel-xl font-pixel text-primary animate-pulse">
              MINDQUEST
            </h1>
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-pixel-accent animate-pulse" />
              <p className="text-pixel-sm text-muted-foreground font-pixel">
                LEVEL UP YOUR WELLNESS
              </p>
              <Sparkles className="w-4 h-4 text-pixel-accent animate-pulse" />
            </div>
          </div>
          
          {/* Pixel Art Hero Character */}
          <PixelCard className="p-8 relative overflow-hidden bg-surface/90 backdrop-blur-sm">
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-4 mb-4">
                <PixelCharacter size="lg" />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-pixel font-pixel text-foreground">
                  READY TO START YOUR
                </h2>
                <h2 className="text-pixel font-pixel text-primary">
                  WELLNESS QUEST?
                </h2>
              </div>
            </div>
            
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div 
                className="w-full h-full"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at 2px 2px, hsl(var(--pixel-primary)) 1px, transparent 0),
                    radial-gradient(circle at 6px 6px, hsl(var(--pixel-accent)) 1px, transparent 0)
                  `,
                  backgroundSize: '8px 8px'
                }}
              />
            </div>
          </PixelCard>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-4">
          <Link to="/dashboard" className="block">
            <PixelButton variant="hero" size="lg" className="w-full">
              <Gamepad2 className="w-4 h-4" />
              QUEST DASHBOARD
            </PixelButton>
          </Link>
          
          <div className="grid grid-cols-2 gap-4">
            <Link to="/chat">
              <PixelButton variant="secondary" size="sm" className="w-full">
                COMPANION
              </PixelButton>
            </Link>
            <Link to="/profile">
              <PixelButton variant="secondary" size="sm" className="w-full">
                PROGRESS
              </PixelButton>
            </Link>
          </div>
        </div>
        
        {/* Welcome message */}
        <PixelCard className="p-4">
          <p className="text-pixel-sm text-muted-foreground font-pixel text-center leading-relaxed">
            COMPLETE DAILY QUESTS • EARN XP • LEVEL UP YOUR WELLNESS STATS • 
            CHAT WITH YOUR AI COMPANION
          </p>
        </PixelCard>
      </div>
    </main>
  );
};

export default Home;