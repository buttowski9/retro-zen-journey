import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { removeBackground, loadImageFromSrc } from '@/utils/backgroundRemoval';
import pixelCharacterStatic from '@/assets/pixel-character-static.png';

interface PixelCharacterProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  environment?: 'sunset' | 'forest' | 'indoor' | 'default';
}

const PixelCharacter = ({ 
  size = 'md', 
  className,
  environment = 'default'
}: PixelCharacterProps) => {
  const [processedImageSrc, setProcessedImageSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16', 
    lg: 'w-24 h-24'
  };

  // Process image to remove background on component mount
  useEffect(() => {
    const processImage = async () => {
      try {
        setIsProcessing(true);
        setError(null);
        
        // Load the original image
        const img = await loadImageFromSrc(pixelCharacterStatic);
        
        // Remove background
        const processedBlob = await removeBackground(img);
        
        // Create object URL for the processed image
        const processedUrl = URL.createObjectURL(processedBlob);
        setProcessedImageSrc(processedUrl);
      } catch (err) {
        console.error('Failed to process character image:', err);
        setError('Failed to process image');
        // Fallback to original image
        setProcessedImageSrc(pixelCharacterStatic);
      } finally {
        setIsProcessing(false);
      }
    };

    processImage();

    // Cleanup function to revoke object URL
    return () => {
      if (processedImageSrc && processedImageSrc !== pixelCharacterStatic) {
        URL.revokeObjectURL(processedImageSrc);
      }
    };
  }, []);

  // Environment-specific background and effects
  const environmentStyles = {
    sunset: {
      background: 'linear-gradient(135deg, rgba(255, 138, 101, 0.3), rgba(255, 206, 84, 0.2))',
      shadow: '0 8px 32px rgba(255, 138, 101, 0.4)',
      border: '2px solid rgba(255, 206, 84, 0.5)'
    },
    forest: {
      background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.3), rgba(102, 187, 106, 0.2))',
      shadow: '0 8px 32px rgba(46, 125, 50, 0.4)',
      border: '2px solid rgba(102, 187, 106, 0.5)'
    },
    indoor: {
      background: 'linear-gradient(135deg, rgba(63, 81, 181, 0.3), rgba(121, 134, 203, 0.2))',
      shadow: '0 8px 32px rgba(63, 81, 181, 0.4)',
      border: '2px solid rgba(121, 134, 203, 0.5)'
    },
    default: {
      background: 'transparent',
      shadow: 'none',
      border: 'none'
    }
  };

  const currentStyle = environmentStyles[environment];

  return (
    <div className={cn("relative", className)}>
      {/* Environment-specific background glow */}
      <div 
        className="absolute inset-0 rounded-lg blur-sm -z-10"
        style={{
          background: currentStyle.background,
          boxShadow: currentStyle.shadow
        }}
      />
      
      {/* Character container with environment border */}
      <div 
        className="relative p-2 rounded-lg"
        style={{
          border: currentStyle.border,
          background: environment !== 'default' ? 'rgba(255, 255, 255, 0.05)' : 'transparent'
        }}
      >
        {isProcessing ? (
          // Loading placeholder
          <div 
            className={cn(
              sizeClasses[size],
              "bg-surface animate-pulse rounded-lg flex items-center justify-center"
            )}
          >
            <div className="w-3 h-3 bg-primary animate-bounce"></div>
          </div>
        ) : (
          <img 
            src={processedImageSrc || pixelCharacterStatic}
            alt="Pixel Character"
            className={cn(
              sizeClasses[size],
              "object-contain relative z-10",
              environment === 'sunset' && "brightness-110 contrast-105",
              environment === 'forest' && "hue-rotate-15 brightness-95",
              environment === 'indoor' && "brightness-90 contrast-110"
            )}
            style={{
              imageRendering: 'pixelated'
            }}
          />
        )}
      </div>
    </div>
  );
};

export default PixelCharacter;