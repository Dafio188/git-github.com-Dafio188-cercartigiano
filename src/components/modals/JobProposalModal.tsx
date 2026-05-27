import React, { useState } from 'react';
import { db } from '../../firebase';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Briefcase,
  ArrowRight,
  Shield,
  Star
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { doc, runTransaction, serverTimestamp, collection, addDoc, increment, getDoc } from 'firebase/firestore';
import { Job } from '../../types';

import { notifyNewProposal } from '../../lib/notifications';
import { validateMessage } from '../../lib/contentFilter';
import { BuyCreditsModal } from './BuyCreditsModal';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';

interface JobProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
  workerId: string;
  workerTokens: number;
}

export function JobProposalModal({ isOpen, onClose, job, workerId, workerTokens: initialTokens }: JobProposalModalProps) {
  const [loading, setLoading] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [workerTokens, setWorkerTokens] = useState(initialTokens);

  React.useEffect(() => {
    if (showBuyModal) return; 
    const syncTokens = async () => {
      const u = await getDoc(doc(db, 'users', workerId));
      if (u.exists()) {
        setWorkerTokens(u.data().tokens || 0);
      }
    };
    syncTokens();
  }, [showBuyModal, workerId]);

  const [formData, setFormData] = useState({
    materialsCost: 0,
    laborCost: 0,
    estimatedDays: 1,
    validityDays: 15,
    message: ''
  });

  const isServiceBased = [
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
  ].includes(job.category);
  const responseCost = job.tokenCost || 1; 
  const hasEnoughTokens = workerTokens >= responseCost;
  const isFull = (job.proposalCount || 0) >= 5;
  const canSubmit = hasEnoughTokens && !isFull;
  const totalPrice = formData.materialsCost + formData.laborCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    if (!formData.message) {
      alert("Inserisci un messaggio per il cliente");
      return;
    }

    const validation = validateMessage(formData.message, false);
    if (!validation.isValid) {
      alert(validation.errorMessage);
      return;
    }

    setLoading(true);
    try {
      if ((job.proposalCount || 0) >= 5) {
        throw new Error("Spiacenti, questo lavoro ha già raggiunto il limite di 5 preventivi.");
      }

      // Use transaction to ensure token deduction and proposal creation are atomic
      try {
        await runTransaction(db, async (transaction) => {
          const userRef = doc(db, 'users', workerId);
          const userDoc = await transaction.get(userRef);
          
          if (!userDoc.exists() || (userDoc.data().tokens || 0) < responseCost) {
            throw new Error("Saldo token insufficiente");
          }

          const jobRef = doc(db, 'jobs', job.id);
          const jobDoc = await transaction.get(jobRef);
          if (!jobDoc.exists()) {
            throw new Error("Lavoro non trovato");
          }

          const workerData = userDoc.data();
          const workerName = workerData.nome || workerData.name || 'Professionista';

          const profileRef = doc(db, 'workerProfiles', workerId);
          let workerRating = 4.9;
          let workerBadges: string[] = [];
          
          try {
            const profileDoc = await transaction.get(profileRef);
            if (profileDoc.exists()) {
              const pData = profileDoc.data();
              workerRating = pData.score || pData.rating || 4.9;
              workerBadges = pData.badges || [];
            }
          } catch (profileError) {
            console.warn("Could not read workerProfile in transaction:", profileError);
          }

          // 1. Deduct tokens
          transaction.update(userRef, {
            tokens: increment(-responseCost)
          });
          transaction.update(profileRef, {
            credits: increment(-responseCost)
          });

          // 2. Create proposal
          const proposalRef = doc(collection(db, 'proposals'));
          transaction.set(proposalRef, {
            jobId: job.id,
            workerId,
            workerName,
            workerRating,
            workerBadges,
            clientId: job.clientId,
            materialsCost: formData.materialsCost,
            laborCost: formData.laborCost,
            price: totalPrice,
            estimatedDays: formData.estimatedDays,
            validityDays: formData.validityDays,
            message: formData.message,
            status: 'pending',
            tokenCostSpent: responseCost,
            refunded: false,
            createdAt: serverTimestamp()
          });

          // 3. Update job proposal count and notify
          transaction.update(jobRef, {
            proposalCount: increment(1),
            hasNewProposals: true
          });

          // Trigger notification (after transaction for better stability, or inside if needed by logic)
          // We do it after generally, but here let's ensure the flag is set.
        });
      } catch (error: any) {
        handleFirestoreError(error, OperationType.WRITE, 'proposals');
        throw error;
      }

      // Notify outside transaction to avoid slowing it down
      try {
        await notifyNewProposal(job.clientId, job.id, job.title);
      } catch (error: any) {
        console.warn("Messa a fuoco notifiche fallita, ma la proposta è stata creata:", error);
      }

      onClose();
      alert("Preventivo standard inviato con successo!");
    } catch (error: any) {
      console.error("Error sending proposal:", error);
      alert(error.message || "Errore durante l'invio della proposta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white border-none rounded-t-[2rem] sm:rounded-[2.5rem] p-0 overflow-y-auto max-h-[95vh] sm:max-h-[90vh] shadow-2xl h-full sm:h-auto bottom-0 sm:bottom-auto translate-y-0 sm:-translate-y-1/2">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="p-6 sm:p-8 lg:p-10 space-y-6 sm:space-y-8 flex-1">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
                  <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div>
                  <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight text-[#1D1D1F] line-clamp-1">Modulo Preventivo</DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm font-bold text-[#86868B] line-clamp-1">Candidati per: {job.title}</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 sm:space-y-6">
              {isFull && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-xs font-black text-red-800 uppercase tracking-widest">Richiesta Satura (5/5)</p>
                    <p className="text-xs font-bold text-red-700">Raggiunto il numero massimo di preventivi consentiti per questa richiesta per proteggere il valore del mercato.</p>
                  </div>
                </div>
              )}

              {!hasEnoughTokens && !isFull && (
                <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex flex-col items-start gap-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 shrink-0" />
                    <div className="space-y-1">
                      <p className="text-xs font-black text-orange-800 uppercase tracking-widest">Saldo Insufficiente</p>
                      <p className="text-xs font-bold text-orange-700">Non hai abbastanza token per rispondere a questa richiesta. Ricarica il tuo saldo per sbloccare l'invio.</p>
                    </div>
                  </div>
                  <Button 
                    type="button"
                    onClick={() => setShowBuyModal(true)}
                    className="w-full h-12 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black"
                  >
                    Ricarica Token Ora
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {!isServiceBased && (
                  <div className="space-y-1 sm:space-y-2">
                    <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#86868B] pl-1">Materiali (€)</Label>
                    <Input 
                      type="number"
                      min="0"
                      value={formData.materialsCost}
                      onChange={e => setFormData({...formData, materialsCost: parseInt(e.target.value) || 0})}
                      className="h-10 sm:h-12 rounded-xl bg-[#F5F5F7] border-none font-black text-base sm:text-lg focus-visible:ring-blue-500/20"
                    />
                  </div>
                )}
                <div className="space-y-1 sm:space-y-2">
                  <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#86868B] pl-1">
                    {isServiceBased ? 'Tariffa (€)' : 'Manodopera (€)'}
                  </Label>
                  <Input 
                    type="number"
                    min="0"
                    value={formData.laborCost}
                    onChange={e => setFormData({...formData, laborCost: parseInt(e.target.value) || 0})}
                    className="h-10 sm:h-12 rounded-xl bg-[#F5F5F7] border-none font-black text-base sm:text-lg focus-visible:ring-blue-500/20"
                  />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#86868B] pl-1">
                    {isServiceBased ? 'Durata (Giorni)' : 'Giorni Previsti'}
                  </Label>
                  <Input 
                    type="number"
                    min="1"
                    value={formData.estimatedDays}
                    onChange={e => setFormData({...formData, estimatedDays: parseInt(e.target.value) || 1})}
                    className="h-10 sm:h-12 rounded-xl bg-[#F5F5F7] border-none font-black text-base sm:text-lg focus-visible:ring-blue-500/20"
                  />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#86868B] pl-1">Validità (Giorni)</Label>
                  <Input 
                    type="number"
                    min="1"
                    value={formData.validityDays}
                    onChange={e => setFormData({...formData, validityDays: parseInt(e.target.value) || 15})}
                    className="h-10 sm:h-12 rounded-xl bg-[#F5F5F7] border-none font-black text-base sm:text-lg focus-visible:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="p-4 bg-[#1D1D1F] text-white rounded-xl sm:rounded-2xl flex items-center justify-between shadow-xl">
                 <span className="font-black text-xs sm:text-base">{isServiceBased ? 'Totale:' : 'Totale Stimato:'}</span>
                 <span className="text-xl sm:text-2xl font-black text-green-400">€{totalPrice}</span>
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#86868B] pl-1">Messaggio al Cliente</Label>
                <textarea 
                  rows={3}
                  placeholder="Descrivi dettagliatamente l'intervento..."
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  className="w-full p-4 rounded-xl sm:rounded-2xl bg-[#F5F5F7] border-none font-bold text-xs sm:text-sm focus:ring-1 focus:ring-blue-500/20 outline-none resize-none"
                />
              </div>

              <div className="text-[9px] sm:text-[10px] text-[#86868B] bg-gray-50 p-3 rounded-xl border border-gray-100 flex gap-2">
                <Shield className="w-6 h-6 sm:w-10 sm:h-10 shrink-0 text-gray-400" />
                <p className="leading-tight">
                  <strong>Disclaimer:</strong> CercArtigiano.it opera esclusivamente come intermediario. Accordi e fatturazioni sono a cura esclusiva tra le parti. Non condividere contatti personali finché il preventivo non è approvato.
                </p>
              </div>

              <div className="p-3 sm:p-4 bg-blue-50 rounded-xl sm:rounded-2xl flex items-center justify-between border border-blue-100">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-blue-600">Costo Invio</div>
                    <div className="text-[10px] sm:text-xs font-black text-[#1D1D1F]">{responseCost} Token</div>
                  </div>
                </div>
                <div className="text-right">
                   <div className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-[#86868B]">Saldo Residuo</div>
                   <div className="text-[10px] sm:text-xs font-black text-[#1D1D1F]">{workerTokens - responseCost < 0 ? 0 : workerTokens - responseCost}</div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 sm:p-8 bg-[#F5F5F7] mt-auto">
            <div className="w-full flex items-center gap-3 sm:gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="flex-1 h-12 sm:h-14 rounded-xl sm:rounded-2xl font-black bg-[#F5F5F7] text-[#86868B] hover:text-[#1D1D1F] hover:bg-white border-none transition-all duration-300 uppercase tracking-widest text-[9px] sm:text-[10px]"
              >
                Annulla
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !canSubmit}
                className="flex-[2] h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-[#1D1D1F] hover:bg-black text-white font-black text-base sm:text-lg shadow-xl shadow-black/10 group"
              >
                {loading ? 'Invio...' : 'Invia'}
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>

      <BuyCreditsModal 
        isOpen={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        userId={workerId}
        currentBalance={workerTokens}
      />
    </Dialog>
  );
}
