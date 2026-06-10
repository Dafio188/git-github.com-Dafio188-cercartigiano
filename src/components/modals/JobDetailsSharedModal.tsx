import React, { useState, useEffect } from 'react';
import { Job, User } from '../../types';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle,
} from '../ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Button } from '../ui/button';
import { MapPin, Clock, ArrowRight, ShieldCheck, MessageSquare, Star } from 'lucide-react';
import { JobQnA } from '../shared/JobQnA';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { ChatPanel } from '../shared/ChatPanel';
import { cn } from '../../lib/utils';

interface JobDetailsSharedModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
  user: User;
  onOpenProposal: () => void;
  onStartChat: (job: Job) => void;
}

export function JobDetailsSharedModal({ isOpen, onClose, job, user, onOpenProposal, onStartChat }: JobDetailsSharedModalProps) {
  const [proposal, setProposal] = useState<any | null>(null);
  const [loadingProposal, setLoadingProposal] = useState(true);
  const [activeRightTab, setActiveRightTab] = useState<'qna' | 'chat'>('qna');
  const [proposalConversationId, setProposalConversationId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !job?.id || !user?.id || user.role !== 'worker') {
      setLoadingProposal(false);
      return;
    }

    const q = query(
      collection(db, 'proposals'),
      where('jobId', '==', job.id),
      where('workerId', '==', user.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const propDoc = snapshot.docs[0].data();
        setProposal({ id: snapshot.docs[0].id, ...propDoc });
        
        const participants = [job.clientId, user.id].sort();
        setProposalConversationId(`job_${job.id}_${participants.join('_')}`);
      } else {
        setProposal(null);
        setProposalConversationId(null);
      }
      setLoadingProposal(false);
    }, (error) => {
      console.error("Error fetching proposal:", error);
      setLoadingProposal(false);
    });

    return () => unsubscribe();
  }, [isOpen, job?.id, user?.id, user?.role]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-[#FBFBFD] border-none rounded-[3rem] p-0 overflow-hidden shadow-2xl">
        <VisuallyHidden>
          <DialogTitle>Dettagli Lavoro</DialogTitle>
        </VisuallyHidden>
        <div className="flex flex-col md:flex-row h-[85vh]">
          {/* Left: Job Details */}
          <div className="w-full md:w-1/2 p-8 lg:p-10 flex flex-col items-start overflow-y-auto bg-white">
            <div className="space-y-6 w-full">
               <div className="flex items-center gap-3">
                 <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                   <ShieldCheck className="w-6 h-6 text-blue-600" />
                 </div>
                 <div>
                   <h2 className="text-2xl font-black tracking-tight text-[#1D1D1F] leading-tight">{job.title}</h2>
                   <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded inline-block mt-1">
                     {job.category}
                   </span>
                 </div>
               </div>

               <div className="flex items-center gap-4 text-xs font-bold text-[#86868B] pb-6 border-b border-[#F5F5F7]">
                 <div className="flex items-center gap-1">
                   <MapPin className="w-4 h-4" />
                   {job.location?.address}
                 </div>
                 <div className="flex items-center gap-1">
                   <Clock className="w-4 h-4" />
                   Scade {new Date(job.expiresAt?.seconds * 1000 || Date.now()).toLocaleDateString()}
                 </div>
               </div>

               <div>
                 <h4 className="text-xs font-black uppercase tracking-widest text-[#86868B] mb-2">Descrizione Intervento</h4>
                 <p className="text-sm font-bold text-[#1D1D1F] leading-relaxed whitespace-pre-wrap">
                   {job.description}
                 </p>
               </div>

               <div className="bg-[#F5F5F7] p-6 rounded-3xl mt-6 border border-[#D2D2D7]/30">
                 <h4 className="text-xs font-black uppercase tracking-widest text-[#86868B] mb-2">Budget Indicativo Cliente</h4>
                 <div className="text-3xl font-black text-[#1D1D1F]">€{job.budgetMin} - €{job.budgetMax}</div>
               </div>
            </div>
            
            <div className="mt-8 w-full space-y-4">
              {loadingProposal ? (
                <div className="w-full py-4 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                </div>
              ) : proposal ? (
                <div className="bg-[#F5F5F7] p-5 rounded-3xl border border-[#D2D2D7]/30 space-y-3 w-full">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Preventivo Inviato</span>
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                      proposal.status === 'accepted' 
                        ? "bg-green-50 border-green-200 text-green-700" 
                        : "bg-blue-50 border-blue-200 text-blue-700"
                    )}>
                      {proposal.status === 'accepted' ? 'Accettato' : 'In attesa'}
                    </span>
                  </div>
                  <div className="flex justify-between items-end border-t border-gray-200/50 pt-2.5">
                    <div>
                      <div className="text-[9px] font-black uppercase text-[#86868B]">Costo Manodopera</div>
                      <div className="font-bold text-sm text-[#1D1D1F]">€{proposal.laborCost}</div>
                    </div>
                    {proposal.materialsCost > 0 && (
                      <div>
                        <div className="text-[9px] font-black uppercase text-[#86868B]">Materiali</div>
                        <div className="font-bold text-sm text-[#1D1D1F]">€{proposal.materialsCost}</div>
                      </div>
                    )}
                    <div className="text-right">
                      <div className="text-[9px] font-black uppercase text-[#86868B]">Prezzo Totale</div>
                      <div className="font-black text-base text-green-600">€{proposal.price}</div>
                    </div>
                  </div>
                  {proposal.status !== 'accepted' && (
                    <p className="text-[9px] font-bold text-[#86868B] leading-tight pt-1">
                      Il preventivo è vincolante ed è all'esame del cliente. Puoi usare le Domande Pubbliche a destra per eventuali chiarimenti.
                    </p>
                  )}
                </div>
              ) : (
                <Button 
                  onClick={() => {
                    onClose();
                    onOpenProposal();
                  }}
                  className="w-full h-14 rounded-2xl bg-[#1D1D1F] hover:bg-black text-white font-black text-lg shadow-xl shadow-[#1D1D1F]/20 group"
                >
                  Invia Preventivo ({job.tokenCost || 1} Token)
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              )}

              <Button 
                variant="ghost"
                onClick={onClose}
                className="w-full h-12 rounded-2xl text-[#86868B] font-bold hover:bg-[#F5F5F7] transition-all"
              >
                Chiudi dettagli
              </Button>

              <p className="text-[10px] text-center font-bold text-[#86868B] px-4 pt-2 leading-tight">
                 La chat privata sarà sbloccata solo dopo che il cliente avrà accettato il tuo preventivo.
              </p>
            </div>
          </div>

          {/* Right: Q&A / Chat */}
           <div className="w-full md:w-1/2 bg-[#FBFBFD] p-6 md:p-10 border-l border-[#D2D2D7]/30 flex flex-col h-[85vh]">
             {proposal && proposal.status === 'accepted' ? (
               <div className="flex flex-col h-full overflow-hidden">
                 {/* Right Panel Tabs */}
                 <div className="flex items-center gap-3 bg-[#F5F5F7] p-1.5 rounded-2xl mb-6 self-start shrink-0">
                    <Button 
                      size="sm"
                      onClick={() => setActiveRightTab('qna')}
                      className={cn(
                        "rounded-xl font-black text-xs h-9 px-4 shadow-none transition-all",
                        activeRightTab === 'qna' ? "bg-white text-[#1D1D1F]" : "text-[#86868B] hover:text-[#1D1D1F] bg-transparent hover:bg-transparent"
                      )}
                    >
                      Domande Pubbliche
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => setActiveRightTab('chat')}
                      className={cn(
                        "rounded-xl font-black text-xs h-9 px-9 px-4 shadow-none transition-all",
                        activeRightTab === 'chat' ? "bg-white text-[#1D1D1F]" : "text-[#86868B] hover:text-[#1D1D1F] bg-transparent hover:bg-transparent"
                      )}
                    >
                      Chat Privata
                    </Button>
                 </div>
                 
                 <div className="flex-1 overflow-hidden">
                   {activeRightTab === 'qna' ? (
                     <div className="h-full flex flex-col">
                       <div className="mb-4 shrink-0">
                         <h3 className="text-xl font-black text-[#1D1D1F] tracking-tight">Domande Pubbliche</h3>
                         <p className="text-xs font-bold text-[#86868B]">Chiedi dettagli generali. Tutti possono leggere queste risposte.</p>
                       </div>
                       <div className="flex-1 overflow-hidden">
                          <JobQnA jobId={job.id} userId={user.id} userName={user.nome} role="worker" />
                       </div>
                     </div>
                   ) : (
                     <div className="h-full flex flex-col">
                       <div className="mb-4 shrink-0">
                         <h3 className="text-xl font-black text-[#1D1D1F] tracking-tight flex items-center justify-between">
                           Trattativa con Cliente
                           <span className={cn(
                             "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                             proposal.status === 'accepted' ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                           )}>
                             {proposal.status === 'accepted' ? 'Accettato' : 'In attesa'}
                           </span>
                         </h3>
                         <p className="text-xs font-bold text-[#86868B]">Parla direttamente con il cliente per accordarti sul lavoro.</p>
                       </div>
                       {proposalConversationId && (
                         <ChatPanel 
                           user={user} 
                           conversationId={proposalConversationId} 
                           className="flex-1 h-auto"
                         />
                       )}
                     </div>
                   )}
                 </div>
               </div>
             ) : (
               <div className="h-full flex flex-col overflow-hidden">
                 <div className="mb-4 shrink-0">
                   <h3 className="text-2xl font-black text-[#1D1D1F] tracking-tight">Domande Pubbliche</h3>
                   <p className="text-xs font-bold text-[#86868B]">Chiedi dettagli generali. Tutti possono leggere queste risposte.</p>
                 </div>
                 <div className="flex-1 overflow-hidden">
                    <JobQnA jobId={job.id} userId={user.id} userName={user.nome} role="worker" />
                 </div>
               </div>
             )}
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
