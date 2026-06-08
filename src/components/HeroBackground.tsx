import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface BackgroundAsset {
  url: string;
  text: string;
}

interface HeroBackgroundProps {
  className?: string;
  currentIndex: number;
  assets: BackgroundAsset[];
}

export function HeroBackground({ className, currentIndex, assets }: HeroBackgroundProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className={cn("absolute inset-0 z-0 select-none pointer-events-none overflow-hidden h-full w-full bg-[#1D1D1F]", className)}>
      {!hasError && assets.length > 0 ? (
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 1.8, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0 w-full h-full"
          >
            <img 
              src={assets[currentIndex].url} 
              alt="Background" 
              className="w-full h-full object-cover brightness-[0.85] contrast-[1.05]"
              loading="eager"
              onError={() => setHasError(true)}
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </AnimatePresence>
      ) : (
        // Fallback: Elegant premium Mesh Gradient (Apple style)
        <div className="w-full h-full bg-[#1D1D1F] relative overflow-hidden">
            {/* Ambient Lighting effects */}
            <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[70%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[60%] bg-blue-800/10 rounded-full blur-[100px] animate-pulse" />
            
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
               <span className="text-[20vw] font-black text-white/5 tracking-tighter select-none">ARTIGIANO</span>
            </div>
        </div>
      )}
      <div className="absolute inset-0 bg-black/10" /> 
    </div>
  );
}
