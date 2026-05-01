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
  ShieldCheck,
  Star
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { doc, runTransaction, serverTimestamp, collection, addDoc, increment } from 'firebase/firestore';
import { Job } from '../../types';

import { notifyNewProposal } from '../../lib/notifications';

interface JobProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
  workerId: string;
  workerTokens: number;
}

export function JobProposalModal({ isOpen, onClose, job, workerId, workerTokens }: JobProposalModalProps) {
  const [loading, setLoading] = useState(false);
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

    setLoading(true);
    try {
      // Use transaction to ensure token deduction and proposal creation are atomic
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', workerId);
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists() || (userDoc.data().tokens || 0) < responseCost) {
          throw new Error("Saldo token insufficiente");
        }

        // 1. Deduct tokens
        transaction.update(userRef, {
          tokens: increment(-responseCost)
        });

        // 2. Create proposal
        const proposalRef = doc(collection(db, 'proposals'));
        transaction.set(proposalRef, {
          jobId: job.id,
          workerId,
          clientId: job.clientId,
          materialsCost: formData.materialsCost,
          laborCost: formData.laborCost,
          price: totalPrice,
          estimatedDays: formData.estimatedDays,
          validityDays: formData.validityDays,
          message: formData.message,
          status: 'pending',
          createdAt: serverTimestamp()
        });

        // 3. Update job proposal count and notify
        const jobRef = doc(db, 'jobs', job.id);
        transaction.update(jobRef, {
          proposalCount: increment(1),
          hasNewProposals: true
        });

        // 4. Create a conversation for the proposal
        const participants = [job.clientId, workerId].sort();
        const convId = `job_${job.id}_${participants.join('_')}`;
        const convRef = doc(db, 'conversations', convId);
        
        transaction.set(convRef, {
          id: convId,
          participants,
          jobId: job.id,
          jobTitle: job.title,
          lastUpdate: serverTimestamp(),
          lastMessage: formData.message,
          isPublicContext: true,
          updatedAt: serverTimestamp()
        }, { merge: true });

        // Trigger notification (after transaction for better stability, or inside if needed by logic)
        // We do it after generally, but here let's ensure the flag is set.
      });

      // Notify outside transaction to avoid slowing it down
      await notifyNewProposal(job.clientId, job.id, job.title);

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
      <DialogContent className="max-w-2xl bg-white border-none rounded-[2.5rem] p-0 overflow-y-auto max-h-[90vh] shadow-2xl">
        <form onSubmit={handleSubmit}>
          <div className="p-8 lg:p-10 space-y-8">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black tracking-tight text-[#1D1D1F]">Modulo Preventivo Standard</DialogTitle>
                  <DialogDescription className="text-sm font-bold text-[#86868B]">Candidati per: {job.title}</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6">
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
                <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-xs font-black text-orange-800 uppercase tracking-widest">Saldo Insufficiente</p>
                    <p className="text-xs font-bold text-orange-700">Non hai abbastanza token per rispondere a questa richiesta. Ricarica il tuo saldo.</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {!isServiceBased && (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-[#86868B]">Costo Materiali Stimato (€)</Label>
                    <Input 
                      type="number"
                      min="0"
                      value={formData.materialsCost}
                      onChange={e => setFormData({...formData, materialsCost: parseInt(e.target.value) || 0})}
                      className="h-12 rounded-xl bg-[#F5F5F7] border-none font-black text-lg focus-visible:ring-blue-500/20"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-[#86868B]">
                    {isServiceBased ? 'Tariffa Richiesta (€)' : 'Costo Manodopera (€)'}
                  </Label>
                  <Input 
                    type="number"
                    min="0"
                    value={formData.laborCost}
                    onChange={e => setFormData({...formData, laborCost: parseInt(e.target.value) || 0})}
                    className="h-12 rounded-xl bg-[#F5F5F7] border-none font-black text-lg focus-visible:ring-blue-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-[#86868B]">
                    {isServiceBased ? 'Durata / Frequenza (Giorni)' : 'Giorni Lavorativi Previsti'}
                  </Label>
                  <Input 
                    type="number"
                    min="1"
                    value={formData.estimatedDays}
                    onChange={e => setFormData({...formData, estimatedDays: parseInt(e.target.value) || 1})}
                    className="h-12 rounded-xl bg-[#F5F5F7] border-none font-black text-lg focus-visible:ring-blue-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-[#86868B]">Validità Offerta (Giorni)</Label>
                  <Input 
                    type="number"
                    min="1"
                    value={formData.validityDays}
                    onChange={e => setFormData({...formData, validityDays: parseInt(e.target.value) || 15})}
                    className="h-12 rounded-xl bg-[#F5F5F7] border-none font-black text-lg focus-visible:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="p-4 bg-[#1D1D1F] text-white rounded-2xl flex items-center justify-between shadow-xl">
                 <span className="font-black">{isServiceBased ? 'Totale Prestazione:' : 'Totale Preventivo Stimato:'}</span>
                 <span className="text-2xl font-black text-green-400">€{totalPrice}</span>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#86868B]">Messaggio al Cliente / Dettagli</Label>
                <textarea 
                  rows={4}
                  placeholder="Descrivi dettagliatamente l'intervento, specifica se serve P.IVA..."
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  className="w-full p-4 rounded-2xl bg-[#F5F5F7] border-none font-bold text-sm focus:ring-1 focus:ring-blue-500/20 outline-none"
                />
              </div>

              <div className="text-[10px] text-[#86868B] bg-gray-50 p-3 rounded-xl border border-gray-100 flex gap-2">
                <ShieldCheck className="w-10 h-10 shrink-0 text-gray-400" />
                <p>
                  <strong>Disclaimer:</strong> CercArtigiano.it opera esclusivamente come intermediario per mettere in contatto domanda e offerta. La piattaforma non è in alcun modo responsabile o garante dell'esecuzione dei lavori, della qualità degli stessi o delle transazioni economiche tra le parti. Accordi, fatturazioni (o quietanze per prestazioni occasionali) sono a cura esclusiva tra cliente e professionista. Non condividere contatti personali (telefono/email) finché il preventivo non è approvato.
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-2xl flex items-center justify-between border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <Zap className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-blue-600">Costo Invio</div>
                    <div className="text-xs font-black text-[#1D1D1F]">{responseCost} Token</div>
                  </div>
                </div>
                <div className="text-right">
                   <div className="text-[10px] font-black uppercase tracking-widest text-[#86868B]">Saldo Residuo</div>
                   <div className="text-xs font-black text-[#1D1D1F]">{workerTokens - responseCost < 0 ? 0 : workerTokens - responseCost}</div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-8 bg-[#F5F5F7]">
            <div className="w-full flex items-center gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="flex-1 h-14 rounded-2xl font-black bg-[#F5F5F7] text-[#86868B] hover:text-[#1D1D1F] hover:bg-white border-none transition-all duration-300 uppercase tracking-widest text-[10px]"
              >
                Esci / Annulla
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !canSubmit}
                className="flex-[2] h-14 rounded-2xl bg-[#1D1D1F] hover:bg-black text-white font-black text-lg shadow-xl shadow-black/10 group"
              >
                {loading ? 'Invio...' : 'Invia Preventivo Vincolante'}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
