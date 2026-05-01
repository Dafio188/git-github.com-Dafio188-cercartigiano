import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Leaf, Scissors, Trash2, Sprout, Check, Shovel } from 'lucide-react';
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

export function GuidedTriageGardening({ onComplete, onBack }: Props) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    mainService: '',
    gardenSize: '',
    hasWaste: false,
    details: [] as string[]
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => step === 1 ? onBack() : setStep(s => s - 1);

  const finish = () => {
    const title = `Giardinaggio: ${data.mainService} (${data.gardenSize})`;
    const description = `Servizio richiesto: ${data.mainService}. 
Dimensione giardino: ${data.gardenSize}.
Smaltimento rifiuti verdi richiesto: ${data.hasWaste ? 'Sì' : 'No'}.
Altre necessità: ${data.details.join(', ') || 'Nessuna specifica'}.`;
    
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h4 className="text-lg font-black text-[#1D1D1F]">Di cosa ha bisogno il tuo verde?</h4>
              <p className="text-xs font-bold text-[#86868B] mt-1">Seleziona l'intervento principale</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'Sfalcio Prato', icon: Leaf, label: 'Taglio Erba' },
                { id: 'Potatura', icon: Scissors, label: 'Potatura' },
                { id: 'Manutenzione', icon: Sprout, label: 'Regular Care' },
                { id: 'Nuovo Impianto', icon: Shovel, label: 'Progettazione' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => { setData({...data, mainService: item.id}); nextStep(); }}
                  className={cn(
                    "flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all group",
                    data.mainService === item.id ? "border-green-600 bg-green-50/50" : "border-[#D2D2D7]/30 bg-white hover:border-green-200"
                  )}
                >
                  <item.icon className="w-8 h-8 text-[#1D1D1F] transition-transform group-hover:scale-110" />
                  <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h4 className="text-lg font-black text-[#1D1D1F]">Superficie indicativa?</h4>
              <p className="text-xs font-bold text-[#86868B] mt-1">Stima l'area dell'intervento</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: '< 100mq', label: 'Piccolo Giardino / Terrazzo' },
                { id: '100-300mq', label: 'Giardino Privato Medio' },
                { id: '300-1000mq', label: 'Ampia Proprietà' },
                { id: '> 1000mq', label: 'Terreno / Parco Area' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => { setData({...data, gardenSize: item.id}); nextStep(); }}
                  className={cn(
                    "flex items-center justify-between p-5 rounded-2xl border-2 transition-all text-left",
                    data.gardenSize === item.id ? "border-green-600 bg-green-50/50" : "border-[#D2D2D7]/30 bg-white hover:border-green-100"
                  )}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-widest">{item.id}</span>
                    <span className="text-[9px] font-bold text-[#86868B]">{item.label}</span>
                  </div>
                  {data.gardenSize === item.id && <Check className="w-4 h-4 text-green-600" />}
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
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h4 className="text-lg font-black text-[#1D1D1F]">Smaltimento & Extra</h4>
              <p className="text-xs font-bold text-[#86868B] mt-1">Definiamo i dettagli logistici</p>
            </div>
            
            <button
              type="button"
              onClick={() => setData(prev => ({ ...prev, hasWaste: !prev.hasWaste }))}
              className={cn(
                "w-full flex items-center justify-between p-6 rounded-3xl border-2 transition-all text-left",
                data.hasWaste ? "border-orange-600 bg-orange-50/50" : "border-[#D2D2D7]/30 bg-white"
              )}
            >
              <div className="flex items-center gap-4">
                <Trash2 className={cn("w-6 h-6", data.hasWaste ? "text-orange-600" : "text-[#86868B]")} />
                <div>
                  <p className="text-xs font-black uppercase tracking-widest">Smaltimento Rifiuti</p>
                  <p className="text-[10px] font-bold text-[#86868B]">Includi il costo del trasporto in discarica</p>
                </div>
              </div>
              <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                data.hasWaste ? "border-orange-600 bg-orange-600 text-white" : "border-[#D2D2D7]"
              )}>
                {data.hasWaste && <Check className="w-3 h-3" />}
              </div>
            </button>

            <div className="grid grid-cols-2 gap-3">
              {[
                'Irrigazione',
                'Fertilizzazione',
                'Trattamento Antizanzare',
                'Pulizia Vialetti'
              ].map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleDetail(item)}
                  className={cn(
                    "p-4 rounded-xl border text-[10px] font-black uppercase tracking-tighter transition-all text-center",
                    data.details.includes(item) ? "bg-green-600 text-white border-green-600 shadow-md shadow-green-500/20" : "bg-white border-[#D2D2D7]/50"
                  )}
                >
                  {item}
                </button>
              ))}
            </div>

            <Button onClick={finish} className="w-full h-14 rounded-2xl bg-[#1D1D1F] hover:bg-black text-white font-black text-lg mt-4">
              Visualizza Riepilogo
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center pt-4 border-t border-[#D2D2D7]/30">
        <Button variant="ghost" onClick={prevStep} className="text-xs font-bold text-[#86868B]">
          ← Precedente
        </Button>
        <div className="flex gap-1">
          {[1, 2, 3].map(s => (
            <div key={s} className={cn("w-10 h-1 rounded-full transition-all", s <= step ? "bg-green-600" : "bg-[#D2D2D7]/30")} />
          ))}
        </div>
      </div>
    </div>
  );
}
