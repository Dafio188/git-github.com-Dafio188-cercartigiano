import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, MapPin, Calendar, Check, AlertCircle } from 'lucide-react';
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

export function GuidedTriageWellness({ onComplete, onBack }: Props) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    sessionType: '',
    problemArea: '',
    locationPreference: '',
    additionalInfo: ''
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => step === 1 ? onBack() : setStep(s => s - 1);

  const finish = () => {
    const title = `Fisioterapia: ${data.sessionType} - ${data.problemArea}`;
    const description = `Tipo seduta: ${data.sessionType}. 
Area interessata: ${data.problemArea}.
Preferenza luogo: ${data.locationPreference}.
Dettagli clinici: ${data.additionalInfo || 'Nessuno'}.`;
    
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
              <h4 className="text-lg font-black text-[#1D1D1F]">Destinazione della seduta</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'Studio', icon: Activity, label: 'In Studio' },
                { id: 'Domicilio', icon: MapPin, label: 'A Domicilio' },
                { id: 'Video-Consulto', icon: Calendar, label: 'Consulenza Online' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => { setData({...data, locationPreference: item.id}); nextStep(); }}
                  className={cn(
                    "flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all",
                    data.locationPreference === item.id ? "border-blue-600 bg-blue-50" : "border-[#D2D2D7]/30 bg-white"
                  )}
                >
                  <item.icon className="w-6 h-6 text-[#1D1D1F]" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
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
              <h4 className="text-lg font-black text-[#1D1D1F]">Area o Problema</h4>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {[
                'Post-Operatorio / Riabilitazione',
                'Mal di Schiena / Cervicale',
                'Infortunio Sportivo',
                'Posturale / Correttiva',
                'Altro / Consulenza Preventiva'
              ].map(item => (
                <button
                  key={item}
                  onClick={() => { setData({...data, problemArea: item}); nextStep(); }}
                  className={cn(
                    "w-full p-5 rounded-2xl border-2 transition-all text-left flex items-center justify-between",
                    data.problemArea === item ? "border-blue-600 bg-blue-50" : "border-[#D2D2D7]/30 bg-white"
                  )}
                >
                  <span className="text-xs font-black uppercase tracking-widest">{item}</span>
                  {data.problemArea === item && <Check className="w-4 h-4 text-blue-600" />}
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
            className="space-y-6"
          >
            <div className="text-center">
              <h4 className="text-lg font-black text-[#1D1D1F]">Informazioni Cruciali</h4>
              <p className="text-xs font-bold text-[#86868B]">Hai una diagnosi medica?</p>
            </div>
            
            <textarea 
              placeholder="Descrivi brevemente i sintomi o allega informazioni sulla diagnosi..."
              className="w-full p-6 rounded-3xl bg-white border border-[#D2D2D7]/50 text-sm h-32 resize-none font-bold"
              onChange={(e) => setData({...data, additionalInfo: e.target.value})}
            />

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
               <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
               <p className="text-[10px] font-bold text-amber-800 leading-relaxed uppercase">
                 Nota: Per trattamenti riabilitativi è consigliata la prescrizione del medico curante o dello specialista.
               </p>
            </div>

            <Button onClick={finish} className="w-full h-14 rounded-2xl bg-[#1D1D1F] hover:bg-black text-white font-black text-lg">
              Concludi e Pubblica
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
