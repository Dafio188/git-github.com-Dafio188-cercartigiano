import React from 'react';
import { Job, User } from '../../types';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle,
} from '../ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Button } from '../ui/button';
import { MapPin, Clock, ArrowRight, ShieldCheck, MessageSquare } from 'lucide-react';
import { JobQnA } from '../shared/JobQnA';

interface JobDetailsSharedModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
  user: User;
  onOpenProposal: () => void;
  onStartChat: (job: Job) => void;
}

export function JobDetailsSharedModal({ isOpen, onClose, job, user, onOpenProposal, onStartChat }: JobDetailsSharedModalProps) {
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
            
            <div className="mt-8 w-full space-y-3">
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

              <Button 
                variant="ghost"
                onClick={onClose}
                className="w-full h-12 rounded-2xl text-[#86868B] font-bold hover:bg-[#F5F5F7] transition-all"
              >
                Chiudi senza modifiche
              </Button>

              <p className="text-[10px] text-center font-bold text-[#86868B] px-4 pt-2 leading-tight">
                 Le chat preliminari sono sorvegliate. Lo scambio di contatti prima dell'accettazione del preventivo comporta la sospensione del profilo.
              </p>
            </div>
          </div>

          {/* Right: Q&A */}
          <div className="w-full md:w-1/2 bg-[#FBFBFD] p-6 md:p-10 border-l border-[#D2D2D7]/30 flex flex-col h-full">
            <div className="mb-4">
              <h3 className="text-2xl font-black text-[#1D1D1F] tracking-tight">Domande Pubbliche</h3>
              <p className="text-xs font-bold text-[#86868B]">Chiedi dettagli generali. Tutti possono leggere queste risposte.</p>
            </div>
            <div className="flex-1 overflow-hidden">
               <JobQnA jobId={job.id} userId={user.id} userName={user.nome} role="worker" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
