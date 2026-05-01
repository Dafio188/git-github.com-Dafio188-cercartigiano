import React, { useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { evaluateJobComplexity } from '../../services/aiService';
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
  Briefcase, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  Plus,
  Hammer,
  CheckCircle2
} from 'lucide-react';
import { AddressInput } from '../AddressInput';
import { SERVICE_CATEGORIES } from '../../constants';
import { cn } from '../../lib/utils';
import { GuidedTriagePlumbing } from './triage/GuidedTriagePlumbing';
import { GuidedTriageElectrical } from './triage/GuidedTriageElectrical';
import { GuidedTriageHandyman } from './triage/GuidedTriageHandyman';
import { GuidedTriageProfessional } from './triage/GuidedTriageProfessional';
import { GuidedTriageCleaning } from './triage/GuidedTriageCleaning';
import { GuidedTriageGardening } from './triage/GuidedTriageGardening';
import { GuidedTriageMoving } from './triage/GuidedTriageMoving';
import { GuidedTriageConstruction } from './triage/GuidedTriageConstruction';
import { GuidedTriageCare } from './triage/GuidedTriageCare';
import { GuidedTriageWellness } from './triage/GuidedTriageWellness';
import { GuidedTriageMechanic } from './triage/GuidedTriageMechanic';

interface NewJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export function NewJobModal({ isOpen, onClose, userId }: NewJobModalProps) {
  const [loading, setLoading] = useState(false);
  const [flowStep, setFlowStep] = useState<'category' | 'triage' | 'standard'>('category');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    budgetMin: 50,
    budgetMax: 500,
    address: '',
    civico: '',
    location: { lat: 0, lng: 0 }
  });

  const resetForm = () => {
    setFlowStep('category');
    setFormData({
      title: '',
      description: '',
      category: '',
      budgetMin: 50,
      budgetMax: 500,
      address: '',
      civico: '',
      location: { lat: 0, lng: 0 }
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.category || !formData.address) {
      alert("Compila tutti i campi obbligatori");
      return;
    }

    setLoading(true);
    try {
      // AI evaluates how many tokens this job is worth for workers
      const aiTokenCost = await evaluateJobComplexity(formData.title, formData.description);

      const jobData = {
        ...formData,
        clientId: userId,
        status: 'open',
        proposalCount: 0,
        publicationPlan: 'free',
        tokenCost: aiTokenCost, // Dynamic cost for workers
        expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days lifetime
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'jobs'), jobData);
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error creating job:", error);
      alert("Errore durante la pubblicazione");
    } finally {
      setLoading(false);
    }
  };

  const selectCategory = (categoryId: string) => {
    setFormData({ ...formData, category: categoryId });
    const hasTriage = [
      'plumbing', 
      'electrical', 
      'handyman', 
      'psychology', 
      'lawyer', 
      'architect', 
      'accountant',
      'cleaning',
      'gardening',
      'moving',
      'construction',
      'elderly_care',
      'babysitting',
      'pet_sitting',
      'physiotherapy',
      'mechanic',
      'carpentry'
    ].includes(categoryId);
    if (hasTriage) {
      setFlowStep('triage');
    } else {
      setFlowStep('standard');
    }
  };

  const handleTriageComplete = (result: { title: string; description: string }) => {
    setFormData({
      ...formData,
      title: result.title,
      description: result.description
    });
    setFlowStep('standard');
  };

  const renderCategorySelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-black text-[#1D1D1F] mb-1">Di cosa hai bisogno?</h3>
        <p className="text-sm font-bold text-[#86868B]">Seleziona la categoria dell'intervento</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {SERVICE_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => selectCategory(cat.id)}
            className="flex flex-col items-center justify-center gap-3 p-4 bg-white border border-[#D2D2D7]/50 rounded-2xl hover:border-blue-500 hover:bg-blue-50/50 transition-all focus:outline-none"
          >
            <div className="w-12 h-12 bg-[#F5F5F7] rounded-full flex items-center justify-center text-[#1D1D1F]">
              <cat.icon className="w-6 h-6" />
            </div>
            <span className="text-xs font-black text-[#1D1D1F] text-center">{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStandardDetails = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" type="button" onClick={() => setFlowStep('category')} className="text-xs font-bold px-0 text-blue-600 hover:text-blue-700 hover:bg-transparent">
          ← Cambia categoria
        </Button>
        <span className="text-[10px] font-black uppercase tracking-widest text-[#86868B]">
          {SERVICE_CATEGORIES.find(c => c.id === formData.category)?.label}
        </span>
      </div>

      <div className="space-y-2">
         <Label className="text-[10px] font-black uppercase tracking-widest text-[#86868B]">Cosa devi fare?</Label>
         <Input 
           placeholder="es. Riparazione rubinetto cucina"
           value={formData.title}
           onChange={e => setFormData({...formData, title: e.target.value})}
           className="h-14 rounded-2xl bg-white border-[#D2D2D7]/50 font-bold focus-visible:ring-blue-500/20"
         />
      </div>

      <div className="space-y-2">
         <Label className="text-[10px] font-black uppercase tracking-widest text-[#86868B]">Descrizione Dettagliata</Label>
         <textarea 
           rows={4}
           placeholder="Più dettagli fornisci, migliori saranno i preventivi..."
           value={formData.description}
           onChange={e => setFormData({...formData, description: e.target.value})}
           className="w-full p-4 rounded-2xl bg-white border border-[#D2D2D7]/50 font-bold text-sm focus:ring-1 focus:ring-blue-500/20 outline-none"
         />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="space-y-2">
           <Label className="text-[10px] font-black uppercase tracking-widest text-[#86868B]">Budget Indicativo (€)</Label>
           <div className="flex items-center gap-3">
             <Input 
               type="number" 
               value={formData.budgetMin}
               onChange={e => setFormData({...formData, budgetMin: parseInt(e.target.value)})}
               className="h-14 rounded-2xl bg-white border-[#D2D2D7]/50 font-bold"
             />
             <span className="text-[#86868B]">-</span>
             <Input 
               type="number" 
               value={formData.budgetMax}
               onChange={e => setFormData({...formData, budgetMax: parseInt(e.target.value)})}
               className="h-14 rounded-2xl bg-white border-[#D2D2D7]/50 font-bold"
             />
           </div>
         </div>
      </div>

      <div className="space-y-6 pt-4 border-t border-[#D2D2D7]/30">
         <div className="flex items-center gap-2 mb-2">
           <MapPin className="w-4 h-4 text-[#1D1D1F]" />
           <span className="text-xs font-bold uppercase tracking-widest text-[#1D1D1F]">Località dell'intervento</span>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
           <div className="md:col-span-12 space-y-2">
             <Label className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#86868B]">INDIRIZZO (VIA/PIAZZA/CORSO)</Label>
             <AddressInput 
               value={formData.address}
               placeholder="es. Via Roma"
               className="h-14 pl-12 rounded-2xl bg-white border-[#D2D2D7]/50 font-bold"
               onChange={(address, lat, lng) => {
                 setFormData({
                   ...formData,
                   address,
                   location: lat ? { lat, lng } : formData.location
                 });
               }}
             />
           </div>
         </div>
      </div>

      {/* Info for Clients */}
      <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100 flex items-start gap-4">
         <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
           <Clock className="w-6 h-6 text-blue-600" />
         </div>
         <div className="space-y-1">
           <h4 className="text-sm font-black text-blue-900">Pubblicità Gratuita</h4>
           <p className="text-xs font-bold text-blue-800/70">La tua richiesta rimarrà attiva per 15 giorni. Potrai rinnovarla utilizzando 1 Token per estendere la visibilità di altri 30 giorni per non doverla riscrivere.</p>
         </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-[#FBFBFD] border-none rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
        <form onSubmit={handleSubmit}>
          <div className="p-8 lg:p-12 space-y-8 overflow-y-auto max-h-[85vh]">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-0">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <Plus className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black tracking-tight text-[#1D1D1F]">Pubblica Richiesta</DialogTitle>
                  <DialogDescription className="text-sm font-bold text-[#86868B]">
                    {flowStep === 'category' ? "Seleziona la categoria per iniziare." : "Descrivi l'intervento di cui hai bisogno."}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {flowStep === 'category' && (
              <div className="space-y-6">
                {renderCategorySelection()}
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClose}
                  className="w-full h-12 rounded-2xl font-black bg-[#F5F5F7] text-[#86868B] hover:text-[#1D1D1F] hover:bg-white border-none transition-all duration-300"
                >
                  Indietro / Esci
                </Button>
              </div>
            )}
            {flowStep === 'triage' && (
              <div className="w-full">
                {formData.category === 'plumbing' && (
                  <GuidedTriagePlumbing 
                    onComplete={handleTriageComplete}
                    onBack={() => setFlowStep('category')}
                  />
                )}
                {formData.category === 'electrical' && (
                  <GuidedTriageElectrical 
                    onComplete={handleTriageComplete}
                    onBack={() => setFlowStep('category')}
                  />
                )}
                {formData.category === 'handyman' && (
                  <GuidedTriageHandyman 
                    onComplete={handleTriageComplete}
                    onBack={() => setFlowStep('category')}
                  />
                )}
                {formData.category === 'cleaning' && (
                  <GuidedTriageCleaning 
                    onComplete={handleTriageComplete}
                    onBack={() => setFlowStep('category')}
                  />
                )}
                {formData.category === 'gardening' && (
                  <GuidedTriageGardening 
                    onComplete={handleTriageComplete}
                    onBack={() => setFlowStep('category')}
                  />
                )}
                {formData.category === 'moving' && (
                  <GuidedTriageMoving 
                    onComplete={handleTriageComplete}
                    onBack={() => setFlowStep('category')}
                  />
                )}
                {(formData.category === 'construction' || formData.category === 'carpentry') && (
                  <GuidedTriageConstruction 
                    onComplete={handleTriageComplete}
                    onBack={() => setFlowStep('category')}
                  />
                )}
                {['elderly_care', 'babysitting', 'pet_sitting'].includes(formData.category) && (
                  <GuidedTriageCare 
                    category={formData.category}
                    onComplete={handleTriageComplete}
                    onBack={() => setFlowStep('category')}
                  />
                )}
                {formData.category === 'physiotherapy' && (
                  <GuidedTriageWellness 
                    onComplete={handleTriageComplete}
                    onBack={() => setFlowStep('category')}
                  />
                )}
                {formData.category === 'mechanic' && (
                  <GuidedTriageMechanic 
                    onComplete={handleTriageComplete}
                    onBack={() => setFlowStep('category')}
                  />
                )}
                {['psychology', 'lawyer', 'architect', 'accountant'].includes(formData.category) && (
                  <GuidedTriageProfessional 
                    category={formData.category}
                    onComplete={handleTriageComplete}
                    onBack={() => setFlowStep('category')}
                  />
                )}
              </div>
            )}
            {flowStep === 'standard' && renderStandardDetails()}
            
          </div>

          {flowStep === 'standard' && (
            <DialogFooter className="p-8 bg-[#F5F5F7] gap-3 flex-row sm:justify-between items-center">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                className="h-14 px-6 rounded-2xl font-black bg-[#F5F5F7] text-[#86868B] hover:text-[#1D1D1F] hover:bg-white border-none transition-all duration-300"
              >
                Esci senza Salvare
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-1 h-14 rounded-2xl bg-[#1D1D1F] hover:bg-black text-white font-black text-lg shadow-xl shadow-black/10 group"
              >
                {loading ? 'Pubblicazione...' : 'Pubblica'}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
