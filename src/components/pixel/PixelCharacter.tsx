import { cn } from '@/lib/utils';
import pixelCharacterStatic from '@/assets/pixel-character-static.png';
import { useState, useEffect } from 'react';
import { removeBackground, loadImage } from '@/utils/backgroundRemoval';

interface PixelCharacterProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const PixelCharacter = ({ 
  size = 'md', 
  className
}: PixelCharacterProps) => {
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16', 
    lg: 'w-24 h-24'
  };

  useEffect(() => {
    const processImage = async () => {
      try {
        setIsProcessing(true);
        
        // Load the original image
        const response = await fetch(pixelCharacterStatic);
        const blob = await response.blob();
        const imageElement = await loadImage(blob);
        
        // Remove background
        const processedBlob = await removeBackground(imageElement);
        const processedUrl = URL.createObjectURL(processedBlob);
        
        setProcessedImageUrl(processedUrl);
      } catch (error) {
        console.error('Failed to process image:', error);
        // Fallback to original image
      } finally {
        setIsProcessing(false);
      }
    };

    processImage();

    // Cleanup
    return () => {
      if (processedImageUrl) {
        URL.revokeObjectURL(processedImageUrl);
      }
    };
  }, []);

  return (
    <div className={cn("relative", className)}>
      {isProcessing && (
        <div className={cn(
          sizeClasses[size],
          "flex items-center justify-center bg-muted rounded animate-pulse"
        )}>
          <div className="text-xs text-muted-foreground">⚡</div>
        </div>
      )}
      <img 
        src={processedImageUrl || pixelCharacterStatic}
        alt="Pixel Character"
        className={cn(
          sizeClasses[size],
          "object-contain transition-opacity duration-300",
          isProcessing && "opacity-0"
        )}
        style={{
          imageRendering: 'pixelated'
        }}
      />
    </div>
  );
};

export default PixelCharacter;