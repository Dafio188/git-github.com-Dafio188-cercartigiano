import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '../ui/dialog';
import { Button } from '../ui/button';
import { 
  Star, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  ArrowRight,
  Shield,
  User as UserIcon,
  DollarSign,
  Package,
  Wrench
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { JobProposal, Job, User } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { BadgeList } from '../shared/BadgeList';
import { ChatModal } from './ChatModal';
import { PublicProfileModal } from './PublicProfileModal';

interface ProposalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
  user: User;
}

export function ProposalsModal({ isOpen, onClose, job, user }: ProposalsModalProps) {
  const [proposals, setProposals] = useState<JobProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [viewProfileId, setViewProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !job?.id) return;

    const q = query(
      collection(db, 'proposals'),
      where('jobId', '==', job.id),
      where('clientId', '==', job.clientId),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobProposal));
      setProposals(data);
      setLoading(false);
    }, (error) => {
      console.error("ProposalsModal onSnapshot error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen, job?.id]);

  const handleAcceptProposal = async (proposal: JobProposal) => {
    if (!confirm("Accettando questa proposta ti impegni formalmente con l'artigiano secondo le condizioni, ma ricordati che e' un contratto privato con lui. Il pagamento NON avviene sulla piattaforma. Vuoi procedere?")) return;
    setActing(proposal.id);
    try {
      const response = await fetch('/api/proposals/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          proposalId: proposal.id,
          jobId: job.id,
          clientId: job.clientId,
          workerId: proposal.workerId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Impossibile accettare la proposta sul server.");
      }

      onClose();
      alert("Proposta accettata! Ora puoi messaggiare in modo esclusivo con l'artigiano.");
    } catch (error: any) {
      console.error("Error accepting proposal:", error);
      alert("Errore durante l'accettazione della proposta: " + error.message);
    } finally {
      setActing(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-[#FBFBFD] border-none rounded-[3rem] p-0 overflow-hidden shadow-2xl">
        <DialogTitle className="sr-only">Preventivi per: {job.title}</DialogTitle>
        <div className="flex flex-col md:flex-row h-[85vh]">
          {/* Left Panel: Job Details & Navigation */}
          <div className="w-full md:w-1/3 bg-[#1D1D1F] text-white p-8 flex flex-col justify-between hidden md:flex shrink-0">
             <div className="space-y-8">
                <div className="space-y-4">
                   <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                     <Shield className="w-6 h-6 text-white" />
                   </div>
                   <div>
                     <h2 className="text-2xl font-black tracking-tight leading-tight">{job.title}</h2>
                     <span className="text-[10px] font-black uppercase tracking-widest text-white/50 bg-white/10 px-2 py-1 rounded-sm mt-2 inline-block">
                       {job.category}
                     </span>
                   </div>
                </div>
                
                <div className="space-y-2">
                   <Button 
                     variant="ghost" 
                     className="w-full justify-start h-12 rounded-xl font-black transition-all bg-white text-[#1D1D1F]"
                   >
                     Preventivi Ricevuti ({proposals.length})
                   </Button>
                   <Button 
                     onClick={() => setIsChatOpen(true)}
                     variant="ghost" 
                     className="w-full justify-start h-12 rounded-xl font-black transition-all text-white/60 hover:text-white hover:bg-white/10"
                   >
                     <MessageSquare className="w-4 h-4 mr-2" />
                     Chat Condivisa
                   </Button>
                </div>
                
                <Button 
                   onClick={onClose}
                   className="w-full h-12 rounded-xl font-black bg-white/10 text-white/50 hover:text-[#1D1D1F] hover:bg-white border border-white/10 hover:border-white transition-all duration-300 uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 group shadow-none hover:shadow-xl"
                >
                   <ArrowRight className="w-4 h-4 rotate-180" /> 
                   <span>Torna Indietro</span>
                </Button>
             </div>
             <div className="text-[10px] text-white/50 font-bold bg-white/5 p-4 rounded-2xl">
               I preventivi sono formulati dagli artigiani. Valuta attentamente. Noi garantiamo chi sono, ma non il loro lavoro.
             </div>
          </div>

          {/* Mobile Header */}
          <div className="md:hidden bg-[#1D1D1F] p-6 text-white">
             <h2 className="text-xl font-black tracking-tight">{job.title}</h2>
             <div className="flex items-center gap-2 mt-4">
                <Button 
                  size="sm"
                  className="rounded-full font-black text-[10px] uppercase bg-white text-[#1D1D1F]"
                >
                  Preventivi ({proposals.length})
                </Button>
                <Button 
                  size="sm"
                  onClick={() => setIsChatOpen(true)}
                  className="rounded-full font-black text-[10px] uppercase bg-white/10 text-white"
                >
                  Chat Condivisa
                </Button>
             </div>
          </div>

          {/* Right Panel: Content */}
          <div className="flex-1 p-6 md:p-10 overflow-y-auto">
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-2 text-[#1D1D1F]">
                  <h3 className="text-2xl font-black tracking-tight">Preventivi Ricevuti</h3>
                  <Button variant="ghost" onClick={onClose} className="md:hidden">Chiudi</Button>
                </div>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                     <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                     <span className="text-xs font-black uppercase tracking-widest text-[#86868B]">Caricamento...</span>
                  </div>
                ) : proposals.length === 0 ? (
                   <div className="py-20 border-2 border-dashed border-[#D2D2D7]/30 rounded-3xl flex flex-col items-center justify-center text-center space-y-4 opacity-50 bg-white">
                      <div className="w-16 h-16 bg-[#F5F5F7] rounded-2xl flex items-center justify-center">
                        <UserIcon className="w-8 h-8 text-[#86868B]" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-black text-[#1D1D1F]">Ancora nessun preventivo</h4>
                        <p className="text-xs font-bold text-[#86868B]">Gli artigiani ti stanno preparando un'offerta.</p>
                      </div>
                   </div>
                ) : (
                  <AnimatePresence>
                    {proposals.map((prop, i) => (
                      <motion.div
                        key={prop.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white rounded-[2rem] border border-[#D2D2D7]/30 hover:shadow-xl transition-all group overflow-hidden"
                      >
                        <div className="p-6 md:p-8 flex items-start justify-between border-b border-[#F5F5F7]">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-[#1D1D1F] rounded-full flex items-center justify-center relative shadow-sm">
                              <span className="text-white font-black text-xl">{prop.workerName?.charAt(0)}</span>
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                 <CheckCircle2 className="w-3 h-3 text-white" />
                              </div>
                            </div>
                            <div>
                               <div className="flex items-center gap-2">
                                 <span className="font-black text-lg text-[#1D1D1F]">{prop.workerName || 'Professionista'}</span>
                                 <div className="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded-full border border-yellow-200">
                                   <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                   <span className="text-[10px] font-black text-yellow-700">{prop.workerRating || 4.9}</span>
                                 </div>
                               </div>
                               <div className="flex items-center mt-1.5">
                                 <BadgeList badges={prop.workerBadges || []} />
                               </div>
                               <button 
                                 onClick={() => setViewProfileId(prop.workerId)}
                                 className="text-[10px] font-black text-blue-600 hover:text-blue-800 transition-colors mt-2 hover:underline uppercase tracking-widest cursor-pointer"
                               >
                                 Guarda il Portfolio →
                               </button>
                            </div>
                          </div>
                          
                          <div className="text-right hidden sm:block">
                             <div className="text-[10px] font-black uppercase tracking-widest text-[#86868B]">Totale Preventivato</div>
                             <div className="text-3xl font-black text-green-600">€{prop.price || (prop.materialsCost + prop.laborCost)}</div>
                          </div>
                        </div>

                        {/* Standardized Quote Details */}
                        <div className="p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#FBFBFD]">
                           {[
                             'cleaning', 
                             'elderly_care', 
                             'pet_sitting', 
                             'babysitting', 
                             'psychology', 
                             'lawyer', 
                             'architect', 
                             'accountant', 
                             'physiotherapy',
                             'wellness',
                             'care',
                             'tutoring',
                             'consulting',
                             'fitness'
                           ].includes(job.category) ? (
                             <>
                               <div className="space-y-1">
                                 <div className="text-[10px] font-black uppercase tracking-widest text-[#86868B] flex items-center gap-1">
                                   <DollarSign className="w-3 h-3" /> Tariffa
                                 </div>
                                 <div className="font-black text-[#1D1D1F]">€{prop.laborCost || 0}</div>
                               </div>
                               <div className="space-y-1">
                                 <div className="text-[10px] font-black uppercase tracking-widest text-[#86868B] flex items-center gap-1">
                                   <Clock className="w-3 h-3" /> Durata / Freq.
                                 </div>
                                 <div className="font-black text-[#1D1D1F]">{prop.estimatedDays} Giorni</div>
                               </div>
                             </>
                           ) : (
                             <>
                               <div className="space-y-1">
                                 <div className="text-[10px] font-black uppercase tracking-widest text-[#86868B] flex items-center gap-1">
                                   <Package className="w-3 h-3" /> Materiali
                                 </div>
                                 <div className="font-black text-[#1D1D1F]">€{prop.materialsCost || 0}</div>
                               </div>
                               <div className="space-y-1">
                                 <div className="text-[10px] font-black uppercase tracking-widest text-[#86868B] flex items-center gap-1">
                                   <Wrench className="w-3 h-3" /> Manodopera
                                 </div>
                                 <div className="font-black text-[#1D1D1F]">€{prop.laborCost || 0}</div>
                               </div>
                               <div className="space-y-1">
                                 <div className="text-[10px] font-black uppercase tracking-widest text-[#86868B] flex items-center gap-1">
                                   <Clock className="w-3 h-3" /> Tempistiche
                                 </div>
                                 <div className="font-black text-[#1D1D1F]">{prop.estimatedDays} Giorni</div>
                               </div>
                             </>
                           )}
                           <div className="space-y-1 col-start-4">
                             <div className="text-[10px] font-black uppercase tracking-widest text-[#86868B] flex items-center gap-1">
                               <Shield className="w-3 h-3" /> Validità
                             </div>
                             <div className="font-black text-[#1D1D1F]">{prop.validityDays} Giorni</div>
                           </div>
                        </div>
                        
                        <div className="p-6 md:p-8 bg-white space-y-6">
                          <div className="p-5 bg-[#F5F5F7] rounded-2xl relative">
                            <span className="absolute -top-3 left-4 bg-white px-2 text-[10px] font-black uppercase tracking-widest text-[#86868B]">Nota dell'Artigiano</span>
                            <p className="text-sm font-bold text-[#1D1D1F] leading-relaxed">"{prop.message}"</p>
                          </div>

                          <div className="flex flex-col sm:flex-row items-center gap-4 justify-between pt-2">
                             <div className="text-2xl font-black text-green-600 sm:hidden">€{prop.price || (prop.materialsCost + prop.laborCost)}</div>
                             <div className="flex items-center gap-3 w-full sm:w-auto">
                               <Button 
                                 onClick={() => handleAcceptProposal(prop)}
                                 disabled={!!acting}
                                 className="flex-1 sm:flex-none h-14 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm group/btn shadow-xl shadow-blue-600/20"
                                >
                                   {acting === prop.id ? 'Accettazione...' : 'Accetta Preventivo'}
                                   <ArrowRight className="ml-2 w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                </Button>
                             </div>
                          </div>
                        </div>

                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
          </div>
        </div>
      </DialogContent>
      {isChatOpen && (
        <ChatModal 
          user={user} 
          job={job} 
          onClose={() => setIsChatOpen(false)} 
        />
      )}
      {viewProfileId && (
        <PublicProfileModal
          workerId={viewProfileId}
          onClose={() => setViewProfileId(null)}
        />
      )}
    </Dialog>
  );
}
