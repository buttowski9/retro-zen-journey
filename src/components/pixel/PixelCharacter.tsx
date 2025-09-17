import { cn } from '@/lib/utils';
import pixelCharacterSprites from '@/assets/pixel-character-sprites.png';
import { useState, useEffect } from 'react';

interface PixelCharacterProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  frame?: number; // Which sprite frame to show (0-7)
}

const PixelCharacter = ({ 
  size = 'md', 
  className,
  frame = 0
}: PixelCharacterProps) => {
  const [currentFrame, setCurrentFrame] = useState(frame);
  
  // Reduced sizes
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16', 
    lg: 'w-20 h-20'
  };

  // Auto-animate through frames if no specific frame is set
  useEffect(() => {
    if (frame === 0) {
      const interval = setInterval(() => {
        setCurrentFrame(prev => (prev + 1) % 8);
      }, 200);
      return () => clearInterval(interval);
    } else {
      setCurrentFrame(frame);
    }
  }, [frame]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div 
        className={cn(
          sizeClasses[size],
          "relative"
        )}
        style={{
          backgroundImage: `url(${pixelCharacterSprites})`,
          backgroundSize: '800% 200%', // 8 columns, 2 rows
          backgroundPosition: `${(currentFrame % 4) * (100/3)}% ${Math.floor(currentFrame / 4) * 100}%`,
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated'
        }}
      />
    </div>
  );
};

export default PixelCharacter;