import { Link } from 'react-router-dom';
import { PixelButton } from '@/components/ui/pixel-button';
import { PixelCard, PixelCardContent, PixelCardHeader, PixelCardTitle } from '@/components/ui/pixel-card';
import PixelCharacter from '@/components/pixel/PixelCharacter';
import { Sparkles, ArrowRight, Heart, Brain, Target } from 'lucide-react';
import pixelSunsetTown from '@/assets/pixel-sunset-town.png';

const GetStarted = () => {
  return (
    <main 
      className="min-h-screen flex items-center justify-center p-4 pb-20 relative overflow-hidden"
      style={{
        backgroundImage: `url(${pixelSunsetTown})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated'
      }}
    >
      {/* Warm overlay for better readability */}
      <div className="absolute inset-0 bg-background/85"></div>
      
      <div className="w-full max-w-md mx-auto space-y-6 relative z-10">
        {/* Welcome Header */}
        <PixelCard className="text-center p-6 hud-element">
          <div className="flex items-center justify-center gap-4 mb-4">
            <PixelCharacter size="lg" />
            <div className="space-y-2">
              <h1 className="text-pixel-lg font-pixel text-primary">
                WELCOME TO
              </h1>
              <h1 className="text-pixel-xl font-pixel text-pixel-accent animate-pulse">
                PIXELWELL
              </h1>
            </div>
          </div>
          
          <p className="text-pixel-sm text-muted-foreground font-pixel leading-relaxed">
            YOUR PERSONAL RPG-STYLE WELLNESS COMPANION
          </p>
        </PixelCard>

        {/* Features Overview */}
        <div className="space-y-4">
          <PixelCard className="p-4">
            <PixelCardHeader>
              <PixelCardTitle className="flex items-center gap-2 text-pixel">
                <Heart className="w-4 h-4 text-pixel-accent" />
                WELLNESS QUESTS
              </PixelCardTitle>
            </PixelCardHeader>
            <PixelCardContent>
              <p className="text-pixel-sm text-muted-foreground">
                Complete daily and weekly challenges to boost your mental and physical health
              </p>
            </PixelCardContent>
          </PixelCard>

          <PixelCard className="p-4">
            <PixelCardHeader>
              <PixelCardTitle className="flex items-center gap-2 text-pixel">
                <Brain className="w-4 h-4 text-pixel-accent" />
                AI COMPANION
              </PixelCardTitle>
            </PixelCardHeader>
            <PixelCardContent>
              <p className="text-pixel-sm text-muted-foreground">
                Chat with your empathetic AI companion for support and guidance
              </p>
            </PixelCardContent>
          </PixelCard>

          <PixelCard className="p-4">
            <PixelCardHeader>
              <PixelCardTitle className="flex items-center gap-2 text-pixel">
                <Target className="w-4 h-4 text-pixel-accent" />
                LEVEL UP SYSTEM
              </PixelCardTitle>
            </PixelCardHeader>
            <PixelCardContent>
              <p className="text-pixel-sm text-muted-foreground">
                Gain XP, unlock achievements, and track your wellness journey
              </p>
            </PixelCardContent>
          </PixelCard>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link to="/mental-state" className="block">
            <PixelButton variant="hero" size="lg" className="w-full">
              <ArrowRight className="w-4 h-4" />
              BEGIN YOUR JOURNEY
            </PixelButton>
          </Link>
          
          <div className="grid grid-cols-2 gap-4">
            <Link to="/dashboard">
              <PixelButton variant="secondary" size="sm" className="w-full">
                DASHBOARD
              </PixelButton>
            </Link>
            <Link to="/chat">
              <PixelButton variant="secondary" size="sm" className="w-full">
                COMPANION
              </PixelButton>
            </Link>
          </div>
        </div>

        {/* Bottom Info */}
        <PixelCard className="p-4 bg-surface/70">
          <div className="flex items-center gap-2 justify-center">
            <Sparkles className="w-3 h-3 text-pixel-accent animate-pulse" />
            <p className="text-pixel-sm text-muted-foreground font-pixel text-center">
              LEVEL UP YOUR WELLNESS • ONE QUEST AT A TIME
            </p>
            <Sparkles className="w-3 h-3 text-pixel-accent animate-pulse" />
          </div>
        </PixelCard>
      </div>
    </main>
  );
};

export default GetStarted;