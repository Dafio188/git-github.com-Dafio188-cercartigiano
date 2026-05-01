import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '../ui/dialog';
import { Button } from '../ui/button';
import { Star, CheckCircle2, ShieldCheck, Heart, Sparkles, Send, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { db } from '../../firebase';
import { doc, updateDoc, addDoc, collection, serverTimestamp, increment, getDoc } from 'firebase/firestore';
import { Job } from '../../types';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
  clientId: string;
}

const METRICS = [
  { id: 'quality', label: 'Qualità del Lavoro', icon: Sparkles },
  { id: 'speed', label: 'Velocità / Puntualità', icon: Heart },
  { id: 'cleanliness', label: 'Pulizia e Ordine', icon: CheckCircle2 },
  { id: 'courtesy', label: 'Cortesia e Professionalità', icon: ShieldCheck },
];

export function ReviewModal({ isOpen, onClose, job, clientId }: ReviewModalProps) {
  const [ratings, setRatings] = useState<Record<string, number>>({
    quality: 0,
    speed: 0,
    cleanliness: 0,
    courtesy: 0,
  });
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [workerName, setWorkerName] = useState('...');

  useEffect(() => {
    if (job.assignedWorkerId) {
      getDoc(doc(db, 'users', job.assignedWorkerId)).then(snap => {
        if (snap.exists()) {
          setWorkerName(snap.data().nome);
        }
      });
    }
  }, [job.assignedWorkerId]);

  const averageRating = (Object.values(ratings) as number[]).filter(r => r > 0).reduce((a, b) => a + b, 0) / 4 || 0;

  const handleSubmit = async () => {
    if (Object.values(ratings).some(r => r === 0)) {
      alert("Valuta tutti gli aspetti per completare la recensione.");
      return;
    }

    if (!job.assignedWorkerId) return;

    setLoading(true);
    try {
      const reviewData = {
        jobId: job.id,
        workerId: job.assignedWorkerId,
        clientId,
        ratingQuality: ratings.quality,
        ratingSpeed: ratings.speed,
        ratingCleanliness: ratings.cleanliness,
        ratingCourtesy: ratings.courtesy,
        averageRating,
        comment,
        isVerified: true, // Strategia ProntoPro (Transazione avvenuta in piattaforma)
        createdAt: serverTimestamp()
      };

      const reviewRef = await addDoc(collection(db, 'reviews'), reviewData);
      
      await updateDoc(doc(db, 'jobs', job.id), {
        reviewId: reviewRef.id,
        status: 'completed'
      });

      const workerRef = doc(db, 'workerProfiles', job.assignedWorkerId);
      await updateDoc(workerRef, {
        reviewCount: increment(1),
        score: averageRating
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-[#FBFBFD] border-none rounded-[3rem] shadow-2xl">
        <div className="p-8 lg:p-12">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center text-center space-y-6"
              >
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 shadow-xl shadow-green-500/10 mb-2">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-[#1D1D1F]">Feedback Inviato!</h3>
                  <p className="text-[#86868B] font-bold max-w-sm mx-auto">Grazie per aver contribuito a rendere CercArtigiano una community affidabile.</p>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-8">
                <div className="text-center space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Lavoro Completato</p>
                  <h2 className="text-3xl font-black tracking-tight text-[#1D1D1F]">Come valuti il lavoro di {workerName}?</h2>
                  <p className="text-sm font-bold text-[#86868B]">La tua recensione sarà contrassegnata come "Verificata".</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {METRICS.map((metric) => (
                    <div key={metric.id} className="bg-white p-5 rounded-3xl border border-[#D2D2D7]/30 shadow-sm space-y-3">
                      <div className="flex items-center gap-2">
                        <metric.icon className="w-4 h-4 text-[#1D1D1F]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#1D1D1F]">{metric.label}</span>
                      </div>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRatings({...ratings, [metric.id]: star})}
                            className="p-1 transition-transform active:scale-90"
                          >
                            <Star 
                              className={cn(
                                "w-6 h-6 transition-all",
                                ratings[metric.id] >= star ? "fill-amber-400 text-amber-400 scale-110" : "text-[#D2D2D7] hover:text-amber-200"
                              )}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#86868B]">Commento (Opzionale)</span>
                    <span className="text-[10px] font-bold text-[#86868B]">{comment.length}/500</span>
                  </div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value.slice(0, 500))}
                    placeholder="Racconta la tua esperienza..."
                    className="w-full p-6 rounded-3xl bg-[#F5F5F7] border-none font-bold text-sm focus:ring-2 focus:ring-blue-500/20 min-h-[120px] resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-6">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#1D1D1F]">Recensione Verificata</span>
                        <span className="text-[8px] font-bold text-[#86868B]">Proteggiamo l'integrità del network.</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Button 
                        variant="outline"
                        onClick={onClose}
                        className="h-14 px-6 rounded-2xl font-black bg-[#F5F5F7] text-[#86868B] hover:text-[#1D1D1F] hover:bg-white border-none transition-all duration-300"
                      >
                        Esci / Annulla
                      </Button>
                     <Button 
                       onClick={handleSubmit} 
                       disabled={loading}
                       className="flex-1 h-14 min-w-[160px] rounded-2xl bg-[#1D1D1F] hover:bg-black text-white font-black text-lg transition-all group shadow-xl shadow-black/10"
                     >
                       {loading ? 'Invio...' : (
                         <>
                           Invia <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                         </>
                       )}
                     </Button>
                   </div>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
