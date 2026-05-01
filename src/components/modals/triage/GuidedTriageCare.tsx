import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Baby, Dog, Clock, Check, UserPlus } from 'lucide-react';
import { Button } from '../../ui/button';
import { cn } from '../../../lib/utils';

interface TriageResult {
  title: string;
  description: string;
}

interface Props {
  category: string;
  onComplete: (result: TriageResult) => void;
  onBack: () => void;
}

export function GuidedTriageCare({ category, onComplete, onBack }: Props) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    need: '',
    urgency: '',
    duration: '',
    specialNeeds: [] as string[]
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => step === 1 ? onBack() : setStep(s => s - 1);

  const getCategoryLabel = () => {
    switch(category) {
      case 'elderly_care': return 'Assistenza Anziani';
      case 'babysitting': return 'Babysitter';
      case 'pet_sitting': return 'Pet Sitting';
      default: return 'Assistenza';
    }
  };

  const finish = () => {
    const title = `${getCategoryLabel()}: ${data.need}`;
    const description = `Ambito: ${getCategoryLabel()}. 
Necessità principale: ${data.need}.
Disponibilità richiesta: ${data.urgency}.
Durata prevista: ${data.duration}.
Note speciali: ${data.specialNeeds.join(', ') || 'Nessuna specifica'}.`;
    
    onComplete({ title, description });
  };

  return (
    <div className="space-y-8">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <Heart className="w-12 h-12 text-rose-500 mx-auto mb-4" />
              <h4 className="text-lg font-black text-[#1D1D1F]">Di cosa hai bisogno nello specifico?</h4>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {(category === 'elderly_care' ? [
                'Compagnia e Sorveglianza',
                'Igiene Personale e Vestizione',
                'Somministrazione Farmaci',
                'Accompagnamento (Visite/Spesa)'
              ] : category === 'babysitting' ? [
                'Aiuto Compiti',
                'Intrattenimento / Gioco',
                'Accompagnamento Scuola/Sport',
                'Gestione Pappa e Nanna'
              ] : [
                'Passeggiata Giornaliera',
                'Pensione presso Pro',
                'Visita a Domicilio',
                'Somministrazione Cure'
              ]).map(item => (
                <button
                  key={item}
                  onClick={() => { setData({...data, need: item}); nextStep(); }}
                  className={cn(
                    "w-full p-5 rounded-2xl border-2 transition-all text-left flex items-center justify-between",
                    data.need === item ? "border-rose-600 bg-rose-50" : "border-[#D2D2D7]/30 bg-white"
                  )}
                >
                  <span className="text-xs font-black uppercase tracking-widest">{item}</span>
                  {data.need === item && <Check className="w-4 h-4 text-rose-600" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h4 className="text-lg font-black text-[#1D1D1F]">Disponibilità e Urgenza</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'Immediata', label: 'Il prima possibile' },
                { id: 'Programmabile', label: 'Tra qualche giorno' },
                { id: 'Occasionale', label: 'A chiamata' },
                { id: 'Ricorrente', label: 'Fisso settimanale' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => { setData({...data, urgency: item.id}); nextStep(); }}
                  className={cn(
                    "p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 text-center",
                    data.urgency === item.id ? "border-rose-600 bg-rose-50" : "border-[#D2D2D7]/30 bg-white"
                  )}
                >
                  <Clock className="w-5 h-5 text-[#1D1D1F]" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 font-bold"
          >
            <div className="text-center">
              <h4 className="text-lg font-black text-[#1D1D1F]">Informazioni Supplementari</h4>
            </div>
            
            <div className="space-y-4">
              <textarea 
                placeholder="Ci sono allergie, patologie o esigenze particolari da segnalare?"
                className="w-full p-6 rounded-3xl bg-white border border-[#D2D2D7]/50 text-sm h-32 resize-none"
                onChange={(e) => setData({...data, specialNeeds: [e.target.value]})}
              />
            </div>

            <Button onClick={finish} className="w-full h-14 rounded-2xl bg-[#1D1D1F] hover:bg-black text-white font-black text-lg">
              Cerca Assistente
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center pt-4 border-t border-[#D2D2D7]/30">
        <Button variant="ghost" onClick={prevStep} className="text-xs font-bold text-[#86868B]">
          ← Indietro
        </Button>
      </div>
    </div>
  );
}
