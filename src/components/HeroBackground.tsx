import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface HeroBackgroundProps {
  className?: string;
}

export function HeroBackground({ className }: HeroBackgroundProps) {
  const [hasError, setHasError] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // We will populate these with the actual image URLs once the user uploads them
  const backgroundAssets = [
    {
      url: "/Foto_homepage.png",
      text: "ARTIGIANO"
    }
  ];

  useEffect(() => {
    if (backgroundAssets.length <= 1 || hasError) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % backgroundAssets.length);
    }, 6000); // 6 seconds per image
    
    return () => clearInterval(interval);
  }, [backgroundAssets.length, hasError]);

  return (
    <div className={cn("absolute inset-0 z-0 select-none pointer-events-none overflow-hidden h-full w-full bg-[#1D1D1F]", className)}>
      {!hasError ? (
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            <img 
              src={backgroundAssets[currentIndex].url} 
              alt="Background" 
              className="w-full h-full object-cover"
              loading={currentIndex === 0 ? "eager" : "lazy"}
              onError={() => setHasError(true)}
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </AnimatePresence>
      ) : (
        // Fallback: Elegant premium Mesh Gradient (Apple style)
        <div className="w-full h-full bg-[#1D1D1F] relative overflow-hidden">
            {/* Ambient Lighting effects */}
            <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[70%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[60%] bg-blue-800/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '12s' }} />
            
            {/* Subtle Texture Grid */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
            
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
               <span className="text-[20vw] font-black text-white/5 tracking-tighter select-none">ARTIGIANO</span>
            </div>
        </div>
      )}
      <div className="absolute inset-0 bg-black/10" /> 
    </div>
  );
}
