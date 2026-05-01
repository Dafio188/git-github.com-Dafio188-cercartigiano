import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HardHat, Ruler, Paintbrush, Hammer, Check, Construction } from 'lucide-react';
import { Button } from '../../ui/button';
import { cn } from '../../../lib/utils';

interface TriageResult {
  title: string;
  description: string;
}

interface Props {
  onComplete: (result: TriageResult) => void;
  onBack: () => void;
}

export function GuidedTriageConstruction({ onComplete, onBack }: Props) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    category: '',
    scope: '',
    permitNeeded: 'unknown',
    details: [] as string[]
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => step === 1 ? onBack() : setStep(s => s - 1);

  const finish = () => {
    const title = `Lavori Edili: ${data.scope} (${data.category})`;
    const description = `Tipo intervento: ${data.category}. 
Ambito: ${data.scope}. 
Permessi (CILA/SCIA): ${data.permitNeeded === 'yes' ? 'Necessari' : data.permitNeeded === 'no' ? 'Non necessari' : 'Da verificare'}.
Dettagli segnalati: ${data.details.join(', ') || 'Nessuno'}.`;
    
    onComplete({ title, description });
  };

  const toggleDetail = (item: string) => {
    setData(prev => ({
      ...prev,
      details: prev.details.includes(item) 
        ? prev.details.filter(i => i !== item)
        : [...prev.details, item]
    }));
  };

  return (
    <div className="space-y-8">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h4 className="text-lg font-black text-[#1D1D1F]">Tipologia d'intervento</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'Muratura', icon: Hammer, label: 'Pareti / Cartongessi' },
                { id: 'Tinteggiatura', icon: Paintbrush, label: 'Pittura' },
                { id: 'Ristrutturazione Totale', icon: Construction, label: 'Chiavi in Mano' },
                { id: 'Pavimentazione', icon: Ruler, label: 'Pavimenti / Riv.' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => { setData({...data, category: item.id}); nextStep(); }}
                  className={cn(
                    "flex flex-col items-center gap-4 p-6 rounded-[2rem] border-2 transition-all",
                    data.category === item.id ? "border-blue-600 bg-blue-50" : "border-[#D2D2D7]/30 bg-white"
                  )}
                >
                  <item.icon className="w-8 h-8 text-[#1D1D1F]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-center">{item.label}</span>
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
              <h4 className="text-lg font-black text-[#1D1D1F]">Specifiche del lavoro</h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                'Demolizione',
                'Isolamento Termico',
                'Insonorizzazione',
                'Controsoffitti',
                'Rimozione Muffa',
                'Rifacimento Bagno'
              ].map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleDetail(item)}
                  className={cn(
                    "p-4 rounded-xl border transition-all text-left flex items-center gap-3",
                    data.details.includes(item) ? "bg-blue-600 text-white border-blue-600" : "bg-white border-[#D2D2D7]/50"
                  )}
                >
                  <div className={cn("w-4 h-4 rounded border flex items-center justify-center shrink-0", data.details.includes(item) ? "border-white" : "border-[#D2D2D7]")}>
                    {data.details.includes(item) && <Check className="w-3 h-3" />}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tighter">{item}</span>
                </button>
              ))}
            </div>
            <Button onClick={finish} className="w-full h-14 rounded-2xl bg-[#1D1D1F] hover:bg-black text-white font-black text-lg">
              Conferma Diagnosi
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
