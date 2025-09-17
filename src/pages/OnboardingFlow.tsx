import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PixelCard } from '@/components/ui/pixel-card';
import { PixelButton } from '@/components/ui/pixel-button';
import PixelCharacter from '@/components/pixel/PixelCharacter';
import { toast } from 'sonner';
import pixelForestBg from '@/assets/pixel-forest-bg.png';

interface OnboardingData {
  stressLevel: number;
  lifestyleHabits: string[];
  wellnessGoals: string[];
  happyActivities: string[];
  preferredQuestTypes: string[];
  dailyAvailability: string;
  motivationStyle: string;
}

const OnboardingFlow = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    stressLevel: 5,
    lifestyleHabits: [],
    wellnessGoals: [],
    happyActivities: [],
    preferredQuestTypes: [],
    dailyAvailability: '',
    motivationStyle: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const questions = [
    {
      id: 1,
      title: "How's your stress level lately? 🌟",
      subtitle: "On a scale of 1-10, how stressed have you been feeling?",
      type: 'slider',
      key: 'stressLevel' as keyof OnboardingData,
      options: { min: 1, max: 10 } as { min: number; max: number }
    },
    {
      id: 2,
      title: "What's your current lifestyle like? 🏃‍♀️",
      subtitle: "Select all that apply to you right now:",
      type: 'multiSelect',
      key: 'lifestyleHabits' as keyof OnboardingData,
      options: [
        "I'm pretty active", "I sit a lot for work/school", "I get enough sleep", 
        "I struggle with sleep", "I eat pretty well", "I skip meals often",
        "I spend lots of time on screens", "I go outside regularly"
      ]
    },
    {
      id: 3,
      title: "What do you want to work on? 🎯",
      subtitle: "Choose your main wellness goals:",
      type: 'multiSelect',
      key: 'wellnessGoals' as keyof OnboardingData,
      options: [
        "Managing stress & anxiety", "Better sleep habits", "More physical activity",
        "Healthier eating", "Building confidence", "Improving focus",
        "Better relationships", "Mindfulness & presence"
      ]
    },
    {
      id: 4,
      title: "What makes you genuinely happy? 😊",
      subtitle: "Select activities that bring you joy:",
      type: 'multiSelect',
      key: 'happyActivities' as keyof OnboardingData,
      options: [
        "Listening to music", "Being in nature", "Spending time with friends",
        "Creative activities", "Reading", "Playing games", "Cooking/baking",
        "Watching movies/shows", "Learning new things", "Helping others"
      ]
    },
    {
      id: 5,
      title: "What kind of activities appeal to you? 🎮",
      subtitle: "Choose your preferred quest types:",
      type: 'multiSelect',
      key: 'preferredQuestTypes' as keyof OnboardingData,
      options: [
        "Quick 5-minute tasks", "Outdoor activities", "Creative challenges",
        "Social connections", "Mindfulness practices", "Physical movement",
        "Learning & growth", "Helping others"
      ]
    },
    {
      id: 6,
      title: "When do you have time for wellness? ⏰",
      subtitle: "What's your daily schedule like?",
      type: 'singleSelect',
      key: 'dailyAvailability' as keyof OnboardingData,
      options: [
        "Mornings work best", "I prefer afternoons", "Evenings are my thing",
        "I can squeeze in time throughout the day", "Weekends mainly"
      ]
    },
    {
      id: 7,
      title: "What motivates you most? 💪",
      subtitle: "How do you like to stay motivated?",
      type: 'singleSelect',
      key: 'motivationStyle' as keyof OnboardingData,
      options: [
        "Gentle encouragement", "Friendly challenges", "Progress tracking",
        "Community support", "Personal rewards"
      ]
    }
  ];

  const currentQuestion = questions.find(q => q.id === currentStep);

  const handleSliderChange = (value: number) => {
    setOnboardingData(prev => ({
      ...prev,
      [currentQuestion!.key]: value
    }));
  };

  const handleMultiSelect = (option: string) => {
    setOnboardingData(prev => {
      const currentArray = prev[currentQuestion!.key] as string[];
      const isSelected = currentArray.includes(option);
      
      return {
        ...prev,
        [currentQuestion!.key]: isSelected 
          ? currentArray.filter(item => item !== option)
          : [...currentArray, option]
      };
    });
  };

  const handleSingleSelect = (option: string) => {
    setOnboardingData(prev => ({
      ...prev,
      [currentQuestion!.key]: option
    }));
  };

  const handleNext = async () => {
    if (currentStep < questions.length) {
      setCurrentStep(prev => prev + 1);
    } else {
      await completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const completeOnboarding = async () => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          onboarding_completed: true,
          stress_level: onboardingData.stressLevel,
          lifestyle_habits: onboardingData.lifestyleHabits,
          wellness_goals: onboardingData.wellnessGoals,
          happy_activities: onboardingData.happyActivities,
          preferred_quest_types: onboardingData.preferredQuestTypes,
          daily_availability: onboardingData.dailyAvailability,
          motivation_style: onboardingData.motivationStyle
        })
        .eq('id', user?.id);

      if (error) throw error;

      // Assign personalized daily quests
      const { error: questError } = await supabase
        .rpc('assign_personalized_daily_quests', { 
          user_uuid: user?.id 
        });

      if (questError) {
        console.error('Error assigning personalized quests:', questError);
      }

      toast.success('Welcome to your wellness journey! 🌟');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to complete onboarding');
    }
  };

  const isNextDisabled = () => {
    if (!currentQuestion) return true;
    
    const currentValue = onboardingData[currentQuestion.key];
    
    if (currentQuestion.type === 'multiSelect') {
      return (currentValue as string[]).length === 0;
    }
    
    if (currentQuestion.type === 'singleSelect') {
      return !currentValue;
    }
    
    return false;
  };

  if (!user) return null;

  return (
    <div 
      className="min-h-screen bg-cover bg-center flex items-center justify-center p-4"
      style={{ backgroundImage: `url(${pixelForestBg})` }}
    >
      <div className="absolute inset-0 bg-black/40" />
      
      <div className="relative z-10 w-full max-w-2xl">
        <PixelCard className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <PixelCharacter size="md" />
            <div>
              <h1 className="text-xl font-pixel text-primary mb-2">
                Let's get to know you! 
              </h1>
              <p className="text-pixel-sm text-muted-foreground">
                Step {currentStep} of {questions.length}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-surface border-2 border-primary h-4 mb-8">
            <div 
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${(currentStep / questions.length) * 100}%` }}
            />
          </div>

          {currentQuestion && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-pixel text-foreground mb-2">
                  {currentQuestion.title}
                </h2>
                <p className="text-pixel-sm text-muted-foreground">
                  {currentQuestion.subtitle}
                </p>
              </div>

              {/* Slider Input */}
              {currentQuestion.type === 'slider' && (
                <div className="space-y-4">
                  <div className="flex justify-between text-pixel-sm text-muted-foreground">
                    <span>Not stressed</span>
                    <span>Very stressed</span>
                  </div>
                  <input
                    type="range"
                  min={(currentQuestion.options as { min: number; max: number }).min}
                  max={(currentQuestion.options as { min: number; max: number }).max}
                    value={onboardingData[currentQuestion.key] as number}
                    onChange={(e) => handleSliderChange(Number(e.target.value))}
                    className="w-full h-3 bg-surface border-2 border-primary appearance-none slider"
                  />
                  <div className="text-center">
                    <span className="text-lg font-pixel text-primary">
                      {onboardingData[currentQuestion.key] as number}
                    </span>
                  </div>
                </div>
              )}

              {/* Multi Select */}
              {currentQuestion.type === 'multiSelect' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(currentQuestion.options as string[]).map((option) => {
                    const isSelected = (onboardingData[currentQuestion.key] as string[]).includes(option);
                    
                    return (
                      <button
                        key={option}
                        onClick={() => handleMultiSelect(option)}
                        className={`p-3 border-2 text-left transition-all btn-pixel ${
                          isSelected 
                            ? 'border-primary bg-primary/10 text-primary' 
                            : 'border-muted hover:border-primary/50'
                        }`}
                      >
                        <span className="text-pixel-sm">{option}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Single Select */}
              {currentQuestion.type === 'singleSelect' && (
                <div className="space-y-3">
                  {(currentQuestion.options as string[]).map((option) => {
                    const isSelected = onboardingData[currentQuestion.key] === option;
                    
                    return (
                      <button
                        key={option}
                        onClick={() => handleSingleSelect(option)}
                        className={`w-full p-3 border-2 text-left transition-all btn-pixel ${
                          isSelected 
                            ? 'border-primary bg-primary/10 text-primary' 
                            : 'border-muted hover:border-primary/50'
                        }`}
                      >
                        <span className="text-pixel-sm">{option}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <PixelButton
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              Back
            </PixelButton>
            
            <PixelButton
              onClick={handleNext}
              disabled={isNextDisabled()}
            >
              {currentStep === questions.length ? 'Start Journey!' : 'Next'}
            </PixelButton>
          </div>
        </PixelCard>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          background: hsl(var(--primary));
          border: 2px solid hsl(var(--primary));
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          background: hsl(var(--primary));
          border: 2px solid hsl(var(--primary));
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default OnboardingFlow;