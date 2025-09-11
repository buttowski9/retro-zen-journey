import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PixelButton } from '@/components/ui/pixel-button';
import { PixelCard, PixelCardContent, PixelCardHeader, PixelCardTitle } from '@/components/ui/pixel-card';
import PixelCharacter from '@/components/pixel/PixelCharacter';
import { Brain, Heart, Target, CheckCircle, Circle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import pixelStudyRoom from '@/assets/pixel-study-room.png';

interface MoodOption {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
}

interface GoalOption {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
}

const MentalStateInput = () => {
  const navigate = useNavigate();
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<'mood' | 'goals' | 'complete'>('mood');

  const moodOptions: MoodOption[] = [
    { id: 'stress', label: 'STRESSED', description: 'Feeling overwhelmed or pressured', icon: Brain },
    { id: 'anxiety', label: 'ANXIOUS', description: 'Worried or nervous about things', icon: Heart },
    { id: 'motivation', label: 'LOW MOTIVATION', description: 'Lacking energy or drive', icon: Target },
    { id: 'focus', label: 'UNFOCUSED', description: 'Having trouble concentrating', icon: Brain },
    { id: 'lonely', label: 'LONELY', description: 'Feeling isolated or disconnected', icon: Heart },
    { id: 'tired', label: 'EXHAUSTED', description: 'Physically or mentally drained', icon: Target },
  ];

  const goalOptions: GoalOption[] = [
    { id: 'sleep', label: 'BETTER SLEEP', description: 'Improve sleep quality and routine', icon: Target },
    { id: 'exercise', label: 'DAILY EXERCISE', description: 'Build a consistent fitness habit', icon: Heart },
    { id: 'screentime', label: 'LESS SCREEN TIME', description: 'Reduce digital device usage', icon: Brain },
    { id: 'meditation', label: 'MINDFULNESS', description: 'Practice meditation and mindfulness', icon: Brain },
    { id: 'social', label: 'SOCIAL CONNECTION', description: 'Strengthen relationships and connections', icon: Heart },
    { id: 'nutrition', label: 'HEALTHY EATING', description: 'Improve diet and nutrition habits', icon: Target },
  ];

  const toggleMood = (moodId: string) => {
    setSelectedMoods(prev => 
      prev.includes(moodId) 
        ? prev.filter(id => id !== moodId)
        : [...prev, moodId]
    );
  };

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleNext = () => {
    if (currentStep === 'mood' && selectedMoods.length > 0) {
      setCurrentStep('goals');
    } else if (currentStep === 'goals' && selectedGoals.length > 0) {
      setCurrentStep('complete');
      // Here you would normally save to database
      toast.success('Profile saved! Welcome to PixelWell!', { duration: 3000 });
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } else {
      toast.error('Please make at least one selection to continue');
    }
  };

  return (
    <main 
      className="min-h-screen flex items-center justify-center p-4 pb-20 relative overflow-hidden"
      style={{
        backgroundImage: `url(${pixelStudyRoom})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated'
      }}
    >
      <div className="absolute inset-0 bg-background/80"></div>
      
      <div className="w-full max-w-md mx-auto space-y-6 relative z-10">
        {/* Header with Character */}
        <PixelCard className="text-center p-4 hud-element">
          <div className="flex items-center justify-center gap-3 mb-3">
            <PixelCharacter state="thinking" size="md" autoAnimate={false} />
            <div>
              <h1 className="text-pixel-lg font-pixel text-primary">
                TELL ME ABOUT YOURSELF
              </h1>
            </div>
          </div>
          
          <div className="flex justify-center gap-2 mt-4">
            <div className={`w-8 h-2 border ${currentStep === 'mood' ? 'bg-primary' : 'bg-surface'}`} />
            <div className={`w-8 h-2 border ${currentStep === 'goals' ? 'bg-primary' : 'bg-surface'}`} />
            <div className={`w-8 h-2 border ${currentStep === 'complete' ? 'bg-primary' : 'bg-surface'}`} />
          </div>
        </PixelCard>

        {currentStep === 'mood' && (
          <PixelCard className="p-4">
            <PixelCardHeader>
              <PixelCardTitle className="text-pixel">
                HOW ARE YOU FEELING TODAY?
              </PixelCardTitle>
            </PixelCardHeader>
            <PixelCardContent className="space-y-3">
              <p className="text-pixel-sm text-muted-foreground mb-4">
                Select all that apply to help us understand your current state
              </p>
              
              {moodOptions.map((mood) => {
                const Icon = mood.icon;
                const isSelected = selectedMoods.includes(mood.id);
                
                return (
                  <button
                    key={mood.id}
                    onClick={() => toggleMood(mood.id)}
                    className={`w-full p-3 border-2 transition-all duration-200 text-left ${
                      isSelected
                        ? 'border-primary bg-primary/20'
                        : 'border-border bg-surface hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isSelected ? (
                        <CheckCircle className="w-4 h-4 text-primary" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground" />
                      )}
                      <Icon className="w-4 h-4 text-pixel-accent" />
                      <div className="flex-1">
                        <div className="text-pixel-sm font-pixel text-foreground">
                          {mood.label}
                        </div>
                        <div className="text-pixel-sm text-muted-foreground">
                          {mood.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </PixelCardContent>
          </PixelCard>
        )}

        {currentStep === 'goals' && (
          <PixelCard className="p-4">
            <PixelCardHeader>
              <PixelCardTitle className="text-pixel">
                WHAT ARE YOUR WELLNESS GOALS?
              </PixelCardTitle>
            </PixelCardHeader>
            <PixelCardContent className="space-y-3">
              <p className="text-pixel-sm text-muted-foreground mb-4">
                Choose the areas you'd like to focus on improving
              </p>
              
              {goalOptions.map((goal) => {
                const Icon = goal.icon;
                const isSelected = selectedGoals.includes(goal.id);
                
                return (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={`w-full p-3 border-2 transition-all duration-200 text-left ${
                      isSelected
                        ? 'border-primary bg-primary/20'
                        : 'border-border bg-surface hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isSelected ? (
                        <CheckCircle className="w-4 h-4 text-primary" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground" />
                      )}
                      <Icon className="w-4 h-4 text-pixel-accent" />
                      <div className="flex-1">
                        <div className="text-pixel-sm font-pixel text-foreground">
                          {goal.label}
                        </div>
                        <div className="text-pixel-sm text-muted-foreground">
                          {goal.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </PixelCardContent>
          </PixelCard>
        )}

        {currentStep === 'complete' && (
          <PixelCard className="p-6 text-center hud-element">
            <PixelCharacter state="happy" size="lg" autoAnimate={false} />
            <h2 className="text-pixel-lg font-pixel text-primary mt-4 mb-2">
              PROFILE COMPLETE!
            </h2>
            <p className="text-pixel-sm text-muted-foreground">
              Your personalized wellness journey is ready to begin...
            </p>
            <div className="animate-pulse mt-4">
              <div className="w-8 h-1 bg-primary mx-auto"></div>
            </div>
          </PixelCard>
        )}

        {/* Navigation */}
        <div className="flex justify-between gap-4">
          {currentStep !== 'mood' && currentStep !== 'complete' && (
            <PixelButton
              variant="outline"
              onClick={() => setCurrentStep('mood')}
              className="flex-1"
            >
              BACK
            </PixelButton>
          )}
          
          {currentStep !== 'complete' && (
            <PixelButton
              variant="hero"
              onClick={handleNext}
              className="flex-1"
              disabled={
                (currentStep === 'mood' && selectedMoods.length === 0) ||
                (currentStep === 'goals' && selectedGoals.length === 0)
              }
            >
              {currentStep === 'goals' ? 'COMPLETE' : 'NEXT'}
              <ArrowRight className="w-4 h-4" />
            </PixelButton>
          )}
        </div>
      </div>
    </main>
  );
};

export default MentalStateInput;