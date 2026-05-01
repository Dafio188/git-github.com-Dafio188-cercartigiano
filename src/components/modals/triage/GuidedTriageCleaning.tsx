import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Home, Building2, Calendar, Eraser, Check } from 'lucide-react';
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

export function GuidedTriageCleaning({ onComplete, onBack }: Props) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    type: '',
    frequency: '',
    size: '',
    details: [] as string[]
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => step === 1 ? onBack() : setStep(s => s - 1);

  const finish = () => {
    const title = `Servizio Pulizia: ${data.type} (${data.size})`;
    const description = `Richiesta pulizia ${data.type.toLowerCase()} con frequenza ${data.frequency.toLowerCase()}. 
Dimensione indicativa: ${data.size}.
Dettagli aggiuntivi: ${data.details.join(', ') || 'Nessuno specificato'}.`;
    
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
              <h4 className="text-lg font-black text-[#1D1D1F]">Che tipo di ambiente dobbiamo pulire?</h4>
              <p className="text-xs font-bold text-[#86868B] mt-1">Seleziona la destinazione d'uso</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'Appartamento', icon: Home, label: 'Casa / Apt' },
                { id: 'Ufficio', icon: Building2, label: 'Ufficio' },
                { id: 'Post-Ristrutturazione', icon: Sparkles, label: 'Post Cantiere' },
                { id: 'Vetraggio', icon: Eraser, label: 'Vetrate' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => { setData({...data, type: item.id}); nextStep(); }}
                  className={cn(
                    "flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all",
                    data.type === item.id ? "border-blue-600 bg-blue-50/50" : "border-[#D2D2D7]/30 bg-white hover:border-[#D2D2D7]"
                  )}
                >
                  <item.icon className="w-6 h-6 text-[#1D1D1F]" />
                  <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h4 className="text-lg font-black text-[#1D1D1F]">Con quale frequenza?</h4>
              <p className="text-xs font-bold text-[#86868B] mt-1">Aiuta i Pro a organizzare il calendario</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'Singola volta', label: 'Una Tantum (Fondo)' },
                { id: 'Settimanale', label: 'Ogni Settimana' },
                { id: 'Quindicinale', label: 'Ogni 2 Settimane' },
                { id: 'Mensile', label: 'Una volta al Mese' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => { setData({...data, frequency: item.id}); nextStep(); }}
                  className={cn(
                    "flex items-center justify-between p-5 rounded-2xl border-2 transition-all text-left",
                    data.frequency === item.id ? "border-blue-600 bg-blue-50/50" : "border-[#D2D2D7]/30 bg-white hover:border-[#D2D2D7]"
                  )}
                >
                  <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                  {data.frequency === item.id && <Check className="w-4 h-4 text-blue-600" />}
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
              <h4 className="text-lg font-black text-[#1D1D1F]">Quanto è grande lo spazio?</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: '< 50mq', label: 'Piccolo' },
                { id: '50-100mq', label: 'Medio' },
                { id: '100-150mq', label: 'Grande' },
                { id: '> 150mq', label: 'Extra Large' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => { setData({...data, size: item.id}); nextStep(); }}
                  className={cn(
                    "p-6 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-2",
                    data.size === item.id ? "border-blue-600 bg-blue-50/50" : "border-[#D2D2D7]/30 bg-white hover:border-[#D2D2D7]"
                  )}
                >
                  <span className="text-lg font-black text-[#1D1D1F]">{item.id}</span>
                  <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest">{item.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h4 className="text-lg font-black text-[#1D1D1F]">Servizi Addizionali?</h4>
              <p className="text-xs font-bold text-[#86868B] mt-1">Personalizza la tua richiesta</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                'Stiro',
                'Pulizia Forno',
                'Pulizia Frigo',
                'Lavaggio Tappeti',
                'Smacchiatura Divani',
                'Prodotti Inclusi'
              ].map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleDetail(item)}
                  className={cn(
                    "flex items-center gap-2 p-4 rounded-xl border transition-all text-left",
                    data.details.includes(item) ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20" : "bg-white border-[#D2D2D7]/50 text-[#1D1D1F]"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center",
                    data.details.includes(item) ? "border-white" : "border-[#D2D2D7]"
                  )}>
                    {data.details.includes(item) && <Check className="w-3 h-3" />}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tighter">{item}</span>
                </button>
              ))}
            </div>
            <Button onClick={finish} className="w-full h-14 rounded-2xl bg-[#1D1D1F] hover:bg-black text-white font-black text-lg mt-4">
              Continua
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center pt-4 border-t border-[#D2D2D7]/30">
        <Button variant="ghost" onClick={prevStep} className="text-xs font-bold text-[#86868B]">
          ← Indietro
        </Button>
        <div className="flex gap-1">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={cn("w-8 h-1 rounded-full transition-all", s <= step ? "bg-blue-600" : "bg-[#D2D2D7]/30")} />
          ))}
        </div>
      </div>
    </div>
  );
}
