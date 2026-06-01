import React from 'react';
import { Job, User } from '../../types';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle,
} from '../ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Button } from '../ui/button';
import { MapPin, Clock, ArrowRight, Shield, MessageSquare, Zap } from 'lucide-react';
import { SERVICE_CATEGORIES } from '../../constants';
import { getJobBudgetRange } from '../../lib/utils';

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
      <DialogContent className="max-w-2xl bg-[#FBFBFD] border-none rounded-t-[2.5rem] sm:rounded-[3rem] p-0 overflow-hidden shadow-2xl h-[90vh] sm:h-[85vh] sm:max-h-[720px] bottom-0 sm:bottom-auto translate-y-0 sm:-translate-y-1/2 flex flex-col">
        <VisuallyHidden>
          <DialogTitle>Dettagli Lavoro</DialogTitle>
        </VisuallyHidden>
        <div className="flex flex-col h-full min-h-0">
          {/* Job Details */}
          <div className="flex-1 p-6 sm:p-8 lg:p-10 flex flex-col overflow-y-auto bg-white">
            <div className="space-y-6 w-full pb-6">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
                   <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                 </div>
                 <div>
                   <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#1D1D1F] leading-tight line-clamp-2">{job.title}</h2>
                   <div className="flex gap-2 items-center flex-wrap mt-0.5 sm:mt-1">
                     {job.isUrgent && (
                       <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white bg-red-500 flex items-center gap-1 px-2 py-0.5 rounded shadow-sm shadow-red-500/20">
                         <Zap className="w-3 h-3" />
                         URGENZA MAXI
                       </span>
                     )}
                     <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded inline-block">
                       {SERVICE_CATEGORIES.find(c => c.id === job.category)?.label || job.category}
                     </span>
                   </div>
                 </div>
               </div>

               <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] sm:text-xs font-bold text-[#86868B] pb-4 sm:pb-6 border-b border-[#F5F5F7]">
                 <div className="flex items-center gap-1 shrink-0">
                   <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                   <span className="truncate max-w-[150px] sm:max-w-none">{job.location?.address}</span>
                 </div>
                 <div className="flex items-center gap-1 shrink-0">
                   <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                   Scade {new Date(job.expiresAt?.seconds * 1000 || Date.now()).toLocaleDateString()}
                 </div>
               </div>

               <div>
                 <h4 className="text-[9px] sm:text-xs font-black uppercase tracking-widest text-[#86868B] mb-2">Descrizione Intervento</h4>
                 <p className="text-sm font-bold text-[#1D1D1F] leading-relaxed whitespace-pre-wrap">
                   {job.description}
                 </p>
               </div>

               {job.photos && job.photos.length > 0 && (
                 <div>
                   <h4 className="text-xs font-black uppercase tracking-widest text-[#86868B] mb-2">Foto Allegate ({job.photos.length})</h4>
                   <div className="flex gap-3 overflow-x-auto pb-4 pt-1 snap-x no-scrollbar">
                     {job.photos.map((url, i) => (
                       <div key={i} className="relative aspect-square h-40 shrink-0 rounded-2xl overflow-hidden border border-[#D2D2D7]/30 bg-[#F5F5F7] snap-start">
                         <img 
                           src={url} 
                           alt={`Lavoro ${i + 1}`} 
                           className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-500" 
                           onClick={() => window.open(url, '_blank')}
                         />
                       </div>
                     ))}
                   </div>
                 </div>
               )}

               {(() => {
                 let bMin = job.budgetMin;
                 let bMax = job.budgetMax;
                 if (bMin === undefined || bMin === null || isNaN(Number(bMin)) || Number(bMin) === 0) {
                   const budgetRange = job.metadata?.budget_range;
                   if (budgetRange === 'small') {
                     bMin = 50;
                     bMax = 150;
                   } else if (budgetRange === 'medium') {
                     bMin = 150;
                     bMax = 500;
                   } else if (budgetRange === 'large') {
                     bMin = 500;
                     bMax = 2000;
                   } else if (budgetRange === 'pro') {
                     bMin = 2000;
                     bMax = 10000;
                   } else {
                     if (job.category === 'electrical') {
                       bMin = 80;
                       bMax = 400;
                     } else if (job.category === 'plumbing') {
                       bMin = 150;
                       bMax = 600;
                     } else if (job.category === 'construction') {
                       bMin = 1000;
                       bMax = 5000;
                     } else if (job.category === 'cleaning') {
                       bMin = 50;
                       bMax = 250;
                     } else {
                       bMin = 100;
                       bMax = 800;
                     }
                   }
                 }
                 return (
                   <div className="bg-[#F5F5F7] p-4 sm:p-6 rounded-2xl sm:rounded-3xl mt-4 sm:mt-6 border border-[#D2D2D7]/30">
                     <h4 className="text-[9px] sm:text-xs font-black uppercase tracking-widest text-[#86868B] mb-1 sm:mb-2">Budget Indicativo Cliente</h4>
                     <div className="text-2xl sm:text-3xl font-black text-[#1D1D1F]">€{bMin} - €{bMax}</div>
                   </div>
                 );
               })()}
            </div>
          </div>
            
          <div className="p-6 sm:p-8 bg-white border-t border-[#F5F5F7] shrink-0">
             <div className="w-full space-y-3">
              <Button 
                onClick={() => {
                  onClose();
                  onOpenProposal();
                }}
                className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-[#1D1D1F] hover:bg-black text-white font-black text-base sm:text-lg shadow-xl shadow-[#1D1D1F]/20 group"
              >
                Invia Preventivo ({job.tokenCost || 1} Token)
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button 
                variant="outline"
                onClick={() => {
                   onClose();
                   onStartChat(job);
                }}
                className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl border-2 border-[#1D1D1F] text-[#1D1D1F] font-black group hover:bg-[#1D1D1F] hover:text-white transition-all shadow-lg shadow-black/5"
              >
                <div className="flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 sm:w-5 h-4 sm:h-5" />
                  Chat Condivisa
                </div>
              </Button>

              <Button 
                variant="ghost"
                onClick={onClose}
                className="w-full h-10 sm:h-12 rounded-xl sm:rounded-2xl text-[#86868B] font-bold hover:bg-[#F5F5F7] transition-all text-xs sm:text-sm"
              >
                Chiudi senza modifiche
              </Button>

              <p className="text-[9px] sm:text-[10px] text-center font-bold text-[#86868B] px-2 sm:px-4 pt-2 leading-tight">
                 Le chat preliminari sono condivise con gli altri artigiani interessati. Lo scambio di contatti prima dell'accettazione del preventivo comporta la sospensione del profilo.
              </p>
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
