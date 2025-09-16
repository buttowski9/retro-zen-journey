import { cn } from '@/lib/utils';
import pixelCharacterStatic from '@/assets/pixel-character-static.png';

interface PixelCharacterProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const PixelCharacter = ({ 
  size = 'md', 
  className
}: PixelCharacterProps) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16', 
    lg: 'w-24 h-24'
  };

  return (
    <div className={cn("relative", className)}>
      <img 
        src={pixelCharacterStatic}
        alt="Pixel Character"
        className={cn(
          sizeClasses[size],
          "object-contain"
        )}
        style={{
          imageRendering: 'pixelated'
        }}
      />
    </div>
  );
};

export default PixelCharacter;