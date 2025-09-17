import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { PixelButton } from '@/components/ui/pixel-button';
import { PixelCard } from '@/components/ui/pixel-card';
import PixelCharacter from '@/components/pixel/PixelCharacter';
import pixelSunsetTown from '@/assets/pixel-sunset-town.png';

const EnhancedHome = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      // Check if user completed onboarding
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const handleGetStarted = () => {
    navigate('/auth');
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center flex items-center justify-center p-4"
      style={{ backgroundImage: `url(${pixelSunsetTown})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60" />
      
      <div className="relative z-10 text-center max-w-2xl">
        <div className="mb-8 flex justify-center">
          <PixelCharacter size="lg" />
        </div>
        
        <PixelCard className="p-8 bg-surface/95 backdrop-blur-sm">
          <h1 className="text-3xl font-pixel text-primary mb-4">
            Hi there! Ready to Start Your Wellness Journey? 🌟
          </h1>
          
          <p className="text-pixel text-muted-foreground mb-6 leading-relaxed">
            Welcome to your personal mental wellness companion! I'm here to help you build 
            healthy habits through fun daily quests, track your progress, and provide 
            support whenever you need it.
          </p>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-left">
              <div className="w-6 h-6 bg-primary border-2 border-primary flex items-center justify-center">
                <span className="text-pixel-sm text-surface font-bold">✓</span>
              </div>
              <span className="text-pixel-sm text-foreground">
                Personalized daily quests based on your goals
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-left">
              <div className="w-6 h-6 bg-primary border-2 border-primary flex items-center justify-center">
                <span className="text-pixel-sm text-surface font-bold">✓</span>
              </div>
              <span className="text-pixel-sm text-foreground">
                Level up your wellness with XP and achievements
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-left">
              <div className="w-6 h-6 bg-primary border-2 border-primary flex items-center justify-center">
                <span className="text-pixel-sm text-surface font-bold">✓</span>
              </div>
              <span className="text-pixel-sm text-foreground">
                AI companion for support and motivation
              </span>
            </div>
          </div>
          
          <PixelButton 
            size="lg"
            onClick={handleGetStarted}
            className="w-full"
          >
            Get Started!
          </PixelButton>
          
          <p className="text-pixel-sm text-muted-foreground mt-4">
            Your adventure begins with just a few questions about you
          </p>
        </PixelCard>
      </div>
    </div>
  );
};

export default EnhancedHome;