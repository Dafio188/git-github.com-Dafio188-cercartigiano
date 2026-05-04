import React, { useState } from 'react';
import { cn } from '../lib/utils';

interface BrandLogoProps {
  className?: string;
  imgClassName?: string;
}

/**
 * Official Brand Logo component with automatic fallback.
 * Follows Brand Guidelines for CercArtigiano.
 */
export function BrandLogo({ className, imgClassName }: BrandLogoProps) {
  const [hasError, setHasError] = useState(false);

  // Fallback: Professional SVG Hexagon with Tools (Brand style)
  const logoUrl = `/logo.png`;

  if (hasError) {
    return (
      <div 
        className={cn(
          "relative flex items-center justify-center overflow-hidden",
          className
        )}
        title="CercArtigiano"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
          {/* Blue Hexagon (Brand Color) */}
          <path 
            d="M50 5 L89 27.5 L89 72.5 L50 95 L11 72.5 L11 27.5 Z" 
            fill="oklch(0.45 0.18 255)"
          />
          {/* Stylized Tools Icon */}
          <g fill="white" opacity="0.9">
            <rect x="42" y="30" width="16" height="40" rx="2" transform="rotate(-45 50 50)" />
            <circle cx="35" cy="35" r="8" />
            <path d="M60 60 L75 75 L70 80 L55 65 Z" />
          </g>
        </svg>
      </div>
    );
  }

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <img 
        src={logoUrl} 
        alt="CercArtigiano Logo" 
        className={cn("w-full h-full object-contain", imgClassName)}
        onError={() => setHasError(true)}
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
