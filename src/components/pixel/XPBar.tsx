import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface XPBarProps {
  currentXP: number;
  maxXP: number;
  level: number;
  className?: string;
}

const XPBar = ({ currentXP, maxXP, level, className }: XPBarProps) => {
  const [displayXP, setDisplayXP] = useState(0);
  const percentage = Math.min((currentXP / maxXP) * 100, 100);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayXP(currentXP);
    }, 100);
    return () => clearTimeout(timer);
  }, [currentXP]);

  return (
    <div className={cn("w-full", className)}>
      {/* Level and XP text */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-pixel text-primary font-pixel">
          LEVEL {level}
        </span>
        <span className="text-pixel-sm text-muted-foreground font-pixel">
          {displayXP} / {maxXP} XP
        </span>
      </div>
      
      {/* XP Bar container */}
      <div className="relative h-6 bg-surface border-2 border-primary overflow-hidden">
        {/* Background pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              hsl(var(--pixel-primary)) 2px,
              hsl(var(--pixel-primary)) 4px
            )`
          }}
        />
        
        {/* XP fill */}
        <div
          className="xp-fill h-full transition-all duration-1000 ease-out relative overflow-hidden"
          style={{ width: `${percentage}%` }}
        >
          {/* Animated shine effect */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            style={{
              animation: percentage > 0 ? 'shimmer 2s ease-in-out infinite' : 'none',
            }}
          />
        </div>
        
        {/* Pixel segments overlay */}
        <div 
          className="absolute inset-0 border-r-2 border-primary/30"
          style={{
            backgroundImage: `repeating-linear-gradient(
              90deg,
              transparent,
              transparent calc(100% / 10 - 1px),
              hsl(var(--pixel-border)) calc(100% / 10 - 1px),
              hsl(var(--pixel-border)) calc(100% / 10)
            )`
          }}
        />
      </div>
      
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default XPBar;