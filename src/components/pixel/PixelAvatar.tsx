import { useState } from 'react';
import { cn } from '@/lib/utils';

interface PixelAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  mood?: 'happy' | 'sad' | 'thinking' | 'excited' | 'neutral';
  className?: string;
}

const PixelAvatar = ({ size = 'md', mood = 'neutral', className }: PixelAvatarProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const handleClick = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <div
      className={cn(
        "relative border-2 border-primary bg-surface cursor-pointer select-none",
        sizeClasses[size],
        isAnimating && "animate-pixel-bounce",
        className
      )}
      onClick={handleClick}
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Pixel avatar face */}
      <div className="absolute inset-1 flex items-center justify-center">
        <svg
          viewBox="0 0 16 16"
          className="w-full h-full"
          style={{ imageRendering: 'pixelated' }}
        >
          {/* Face base */}
          <rect x="2" y="2" width="12" height="12" fill="hsl(var(--pixel-accent))" />
          <rect x="3" y="3" width="10" height="10" fill="hsl(var(--pixel-secondary))" />
          
          {/* Eyes based on mood */}
          {mood === 'happy' && (
            <>
              <rect x="5" y="6" width="2" height="1" fill="hsl(var(--pixel-bg))" />
              <rect x="9" y="6" width="2" height="1" fill="hsl(var(--pixel-bg))" />
            </>
          )}
          {mood === 'sad' && (
            <>
              <rect x="5" y="7" width="2" height="1" fill="hsl(var(--pixel-bg))" />
              <rect x="9" y="7" width="2" height="1" fill="hsl(var(--pixel-bg))" />
            </>
          )}
          {mood === 'thinking' && (
            <>
              <rect x="5" y="6" width="1" height="2" fill="hsl(var(--pixel-bg))" />
              <rect x="10" y="6" width="1" height="2" fill="hsl(var(--pixel-bg))" />
            </>
          )}
          {mood === 'excited' && (
            <>
              <rect x="5" y="5" width="2" height="2" fill="hsl(var(--pixel-bg))" />
              <rect x="9" y="5" width="2" height="2" fill="hsl(var(--pixel-bg))" />
            </>
          )}
          {mood === 'neutral' && (
            <>
              <rect x="5" y="6" width="1" height="1" fill="hsl(var(--pixel-bg))" />
              <rect x="10" y="6" width="1" height="1" fill="hsl(var(--pixel-bg))" />
            </>
          )}
          
          {/* Mouth based on mood */}
          {mood === 'happy' && (
            <>
              <rect x="6" y="10" width="1" height="1" fill="hsl(var(--pixel-bg))" />
              <rect x="7" y="11" width="2" height="1" fill="hsl(var(--pixel-bg))" />
              <rect x="9" y="10" width="1" height="1" fill="hsl(var(--pixel-bg))" />
            </>
          )}
          {mood === 'sad' && (
            <>
              <rect x="6" y="11" width="1" height="1" fill="hsl(var(--pixel-bg))" />
              <rect x="7" y="10" width="2" height="1" fill="hsl(var(--pixel-bg))" />
              <rect x="9" y="11" width="1" height="1" fill="hsl(var(--pixel-bg))" />
            </>
          )}
          {mood === 'thinking' && (
            <rect x="7" y="10" width="2" height="1" fill="hsl(var(--pixel-bg))" />
          )}
          {mood === 'excited' && (
            <>
              <rect x="6" y="9" width="4" height="1" fill="hsl(var(--pixel-bg))" />
              <rect x="6" y="10" width="1" height="2" fill="hsl(var(--pixel-bg))" />
              <rect x="9" y="10" width="1" height="2" fill="hsl(var(--pixel-bg))" />
            </>
          )}
          {mood === 'neutral' && (
            <rect x="7" y="10" width="2" height="1" fill="hsl(var(--pixel-bg))" />
          )}
        </svg>
      </div>
      
      {/* Glow effect for excited mood */}
      {mood === 'excited' && (
        <div className="absolute -inset-1 border border-primary opacity-50 animate-pulse"></div>
      )}
    </div>
  );
};

export default PixelAvatar;