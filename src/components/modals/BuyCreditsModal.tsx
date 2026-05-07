import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Zap, Shield, Check, Star, TrendingUp, ArrowRight, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { db } from '../../firebase';
import { doc, updateDoc, increment, arrayUnion } from 'firebase/firestore';

interface BuyCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentBalance: number;
}

const CREDIT_PACKAGES = [
  {
    id: 'starter',
    credits: 20,
    price: 49.99,
    label: 'Pacchetto Starter',
    description: 'Ideale per chi sta iniziando.',
    popular: false,
    color: 'blue'
  },
  {
    id: 'pro',
    credits: 50,
    price: 99.99,
    label: 'Pacchetto Pro',
    description: 'Il più scelto dai professionisti.',
    popular: true,
    color: 'orange'
  },
  {
    id: 'business',
    credits: 120,
    price: 199.99,
    label: 'Pacchetto Business',
    description: 'Per chi vuole scalare l\'attività.',
    popular: false,
    color: 'emerald'
  }
];

export function BuyCreditsModal({ isOpen, onClose, userId, currentBalance }: BuyCreditsModalProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePurchase = async (pkg: typeof CREDIT_PACKAGES[0]) => {
    setLoading(pkg.id);
    try {
      const userRef = doc(db, 'users', userId);
      const workerRef = doc(db, 'workerProfiles', userId);

      await updateDoc(userRef, { 
        tokens: increment(pkg.credits),
        transactionHistory: arrayUnion({
          type: 'purchase',
          credits: pkg.credits,
          amount: pkg.price,
          date: new Date().toISOString(),
          label: pkg.label
        })
      });

      await updateDoc(workerRef, { 
        credits: increment(pkg.credits) 
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error purchasing credits:", error);
      alert("Errore durante l'acquisto. Riprova.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-[#FBFBFD] border-none rounded-[3rem] shadow-2xl">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Sidebar / Info */}
          <div className="lg:w-1/3 bg-[#1D1D1F] p-8 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="z-10 items-center justify-center space-y-12">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-black tracking-tight leading-tight">Potenzia il Tuo Business</h2>
                <p className="text-sm text-[#86868B] font-medium leading-relaxed">
                  I crediti ti permettono di rispondere alle richieste dei clienti e sbloccare i loro contatti diretti.
                </p>
              </div>

              <div className="space-y-6">
                 {[
                   { icon: Check, label: 'Zero Commissioni sul lavoro', desc: 'Tieni il 100% di quello che guadagni.' },
                   { icon: TrendingUp, label: 'Più visibilità', desc: 'I crediti acquistati migliorano il tuo ranking.' },
                   { icon: Shield, label: 'Pagamenti Sicuri', desc: 'Tutte le transazioni sono protette.' }
                 ].map((item, i) => (
                   <div key={i} className="flex gap-4">
                     <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                       <item.icon className="w-3.5 h-3.5 text-blue-400" />
                     </div>
                     <div>
                       <p className="text-xs font-black uppercase tracking-widest leading-none mb-1">{item.label}</p>
                       <p className="text-[10px] text-[#86868B] font-bold">{item.desc}</p>
                     </div>
                   </div>
                 ))}
              </div>
            </div>
            
            <div className="mt-12 p-6 bg-white/5 rounded-3xl border border-white/5 z-10">
               <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">Saldo Attuale</p>
               <div className="flex items-center gap-2">
                 <Zap className="w-5 h-5 text-blue-400" />
                 <span className="text-3xl font-black">{currentBalance} <span className="text-sm text-[#86868B]">Crediti</span></span>
               </div>
            </div>

            {/* Background pattern */}
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px]" />
          </div>

          {/* Main Content / Packages */}
          <div className="flex-1 p-8 lg:p-12">
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center space-y-4"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                    <Check className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-[#1D1D1F]">Ricarica Completata!</h3>
                  <p className="text-[#86868B] font-bold">I tuoi crediti sono stati aggiunti al portafoglio.</p>
                </motion.div>
              ) : (
                <div className="space-y-8">
                  <div className="flex justify-between items-end">
                    <div>
                      <DialogTitle className="text-2xl font-black tracking-tight text-[#1D1D1F]">Scegli un Pacchetto</DialogTitle>
                      <DialogDescription className="text-xs font-bold text-[#86868B] mt-1">Nessun costo fisso, paghi solo quello che usi.</DialogDescription>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {CREDIT_PACKAGES.map((pkg) => (
                      <motion.div
                        key={pkg.id}
                        whileHover={{ y: -5 }}
                        className={cn(
                          "relative p-6 rounded-[2rem] border-2 transition-all cursor-pointer flex flex-col justify-between h-full",
                          pkg.popular ? "border-blue-500 bg-white ring-4 ring-blue-500/5 shadow-2xl shadow-blue-500/10" : "border-[#D2D2D7]/30 bg-white/50 hover:bg-white"
                        )}
                        onClick={() => handlePurchase(pkg)}
                      >
                        {pkg.popular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[9px] font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-lg">
                            Popolare
                          </div>
                        )}

                        <div className="space-y-4">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center",
                            pkg.color === 'blue' ? "bg-blue-50 text-blue-600" : 
                            pkg.color === 'orange' ? "bg-orange-50 text-orange-600" : "bg-emerald-50 text-emerald-600"
                          )}>
                            <Zap className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#86868B] mb-1">{pkg.label}</p>
                            <h4 className="text-2xl font-black text-[#1D1D1F]">{pkg.credits} Crediti</h4>
                          </div>
                        </div>

                        <div className="mt-8 space-y-4">
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-[#1D1D1F]">€{pkg.price}</span>
                            <span className="text-xs font-bold text-[#86868B] lowercase">/iva incl.</span>
                          </div>
                          <p className="text-[10px] text-[#86868B] font-medium leading-tight">€{(pkg.price / pkg.credits).toFixed(2)} per risposta</p>
                          <Button 
                            className={cn(
                              "w-full rounded-xl h-11 font-black text-xs uppercase tracking-widest transition-all",
                              pkg.popular ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-[#1D1D1F] hover:bg-black text-white"
                            )}
                            disabled={!!loading}
                          >
                            {loading === pkg.id ? 'Attendi...' : 'Seleziona'}
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="p-6 bg-white rounded-3xl border border-[#D2D2D7]/30 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#F5F5F7] rounded-xl flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-[#1D1D1F]" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-[#1D1D1F] leading-tight">Pagamento Istruito</p>
                        <p className="text-[10px] font-bold text-[#86868B]">Fino a 256-bit di crittografia SSL.</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <div className="w-8 h-5 bg-[#F5F5F7] rounded flex items-center justify-center text-[6px] font-bold text-[#86868B]">VISA</div>
                       <div className="w-8 h-5 bg-[#F5F5F7] rounded flex items-center justify-center text-[6px] font-bold text-[#86868B]">APPLE</div>
                    </div>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
