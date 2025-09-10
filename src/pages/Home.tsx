import { Link } from 'react-router-dom';
import { PixelButton } from '@/components/ui/pixel-button';
import { PixelCard } from '@/components/ui/pixel-card';
import { Sparkles, Gamepad2 } from 'lucide-react';
import pixelForestBg from '@/assets/pixel-forest-bg.png';
import pixelCompanion from '@/assets/pixel-companion.png';

const Home = () => {
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
          {/* Main Title */}
          <div className="space-y-2">
            <h1 className="text-pixel-xl font-pixel text-primary animate-pulse">
              PIXELWELL
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
              <div className="w-32 h-32 mx-auto mb-4 relative">
                <img 
                  src={pixelCompanion} 
                  alt="Pixel Companion" 
                  className="w-full h-full object-contain"
                  style={{ imageRendering: 'pixelated' }}
                />
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
              START JOURNEY
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