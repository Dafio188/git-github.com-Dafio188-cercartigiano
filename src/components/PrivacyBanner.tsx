import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shovel as Shield, X } from 'lucide-react';
import { Button } from './ui/button';

export function PrivacyBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setTimeout(() => setShow(true), 2000);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-[104px] md:bottom-6 right-6 left-6 lg:left-auto md:left-auto md:w-96 bg-white/80 backdrop-blur-2xl border border-[#D2D2D7]/50 rounded-3xl p-6 shadow-2xl z-[110]"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
               <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-black text-[#1D1D1F]">Privacy & Cookie Policy</h4>
                <p className="text-xs text-[#86868B] font-bold leading-relaxed mt-1">
                  Utilizziamo cookie per migliorare la tua esperienza su CercArtigiano. 
                  Accettando acconsenti al nostro utilizzo dei cookie.
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={accept} 
                  className="bg-[#1D1D1F] hover:bg-black text-white text-xs font-black h-10 px-6 rounded-full flex-1"
                >
                  Accetta tutto
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setShow(false)}
                  className="text-xs font-bold h-10 rounded-full"
                >
                  Rifiuta
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
