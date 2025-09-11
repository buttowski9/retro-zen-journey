import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import pixelCharacterSprites from '@/assets/pixel-character-sprites.png';

interface PixelCharacterProps {
  state?: 'idle' | 'walking' | 'happy' | 'thinking';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  autoAnimate?: boolean;
}

const PixelCharacter = ({ 
  state = 'idle', 
  size = 'md', 
  className,
  autoAnimate = true 
}: PixelCharacterProps) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [animationState, setAnimationState] = useState(state);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16', 
    lg: 'w-24 h-24'
  };

  // Auto-animate between states when autoAnimate is true
  useEffect(() => {
    if (!autoAnimate) return;

    const animationCycle = () => {
      const states: Array<typeof state> = ['idle', 'walking', 'happy', 'idle'];
      const currentIndex = states.indexOf(animationState);
      const nextIndex = (currentIndex + 1) % states.length;
      setAnimationState(states[nextIndex]);
    };

    const interval = setInterval(animationCycle, 3000);
    return () => clearInterval(interval);
  }, [animationState, autoAnimate]);

  // Frame animation for current state
  useEffect(() => {
    const frameCount = animationState === 'walking' ? 4 : 2;
    const frameInterval = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % frameCount);
    }, animationState === 'walking' ? 200 : 800);

    return () => clearInterval(frameInterval);
  }, [animationState]);

  // Calculate sprite position based on state and frame
  const getSpritePosition = () => {
    const frameSize = 32; // Assuming 32x32 pixel sprites
    let row = 0;
    
    switch (animationState) {
      case 'idle':
        row = 0;
        break;
      case 'walking':
        row = 1;
        break;
      case 'happy':
        row = 2;
        break;
      case 'thinking':
        row = 3;
        break;
    }

    const x = currentFrame * frameSize;
    const y = row * frameSize;
    
    return {
      backgroundImage: `url(${pixelCharacterSprites})`,
      backgroundPosition: `-${x}px -${y}px`,
      backgroundSize: '128px 128px', // 4x4 sprite sheet
      imageRendering: 'pixelated' as const,
    };
  };

  return (
    <div className={cn("relative", className)}>
      {/* Character sprite */}
      <div
        className={cn(
          sizeClasses[size],
          "bg-no-repeat transition-all duration-100",
          animationState === 'happy' && "animate-pixel-bounce",
          animationState === 'thinking' && "animate-pulse"
        )}
        style={getSpritePosition()}
      />
      
      {/* State indicator (optional) */}
      <div className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full animate-pulse">
        {animationState === 'happy' && (
          <div className="w-full h-full bg-pixel-accent" />
        )}
        {animationState === 'thinking' && (
          <div className="w-full h-full bg-pixel-warning" />
        )}
        {animationState === 'walking' && (
          <div className="w-full h-full bg-primary" />
        )}
      </div>
    </div>
  );
};

export default PixelCharacter;