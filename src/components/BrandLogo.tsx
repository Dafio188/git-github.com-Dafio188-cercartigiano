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
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="oklch(0.55 0.22 255)" />
              <stop offset="100%" stopColor="oklch(0.40 0.18 255)" />
            </linearGradient>
          </defs>
          {/* Blue Hexagon (Brand Color) with Apple-like gradient */}
          <path 
            d="M50 5 L89 27.5 L89 72.5 L50 95 L11 72.5 L11 27.5 Z" 
            fill="url(#logoGradient)"
          />
          {/* Stylized Tools Icon */}
          <g fill="white" opacity="0.95">
             <path d="M42 35 L58 35 L58 65 L42 65 Z" transform="rotate(-45 50 50)" />
             <circle cx="35" cy="35" r="7" />
             <path d="M55 55 L75 75" stroke="white" strokeWidth="6" strokeLinecap="round" />
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
