import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wrench, Car, Gauge, Check, HelpCircle } from 'lucide-react';
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

export function GuidedTriageMechanic({ onComplete, onBack }: Props) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    problem: '',
    severity: '',
    vehicleType: '',
    details: ''
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => step === 1 ? onBack() : setStep(s => s - 1);

  const finish = () => {
    const title = `Meccanico: ${data.problem} - ${data.vehicleType}`;
    const description = `Veicolo: ${data.vehicleType}. 
Problema rilevato: ${data.problem}. 
Gravità percepita: ${data.severity}.
Note aggiuntive: ${data.details || 'Nessuna'}.`;
    
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
              <h4 className="text-lg font-black text-[#1D1D1F]">Su quale veicolo dobbiamo intervenire?</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'Auto', label: 'Automobile' },
                { id: 'Moto', label: 'Moto / Scooter' },
                { id: 'Furgone', label: 'Mezzo Commerciale' },
                { id: 'Elettrico', label: 'Elettrico / Ibrido' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => { setData({...data, vehicleType: item.id}); nextStep(); }}
                  className={cn(
                    "flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all",
                    data.vehicleType === item.id ? "border-blue-600 bg-blue-50" : "border-[#D2D2D7]/30 bg-white"
                  )}
                >
                  <Car className="w-6 h-6 text-[#1D1D1F]" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
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
            className="space-y-6"
          >
            <div className="text-center">
              <h4 className="text-lg font-black text-[#1D1D1F]">Qual è il problema principale?</h4>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {[
                'Tagliando / Manutenzione Ordinaria',
                'Problema al Motore / Spie accese',
                'Freni / Ammortizzatori / Rumori',
                'Elettrauto / Batteria / Luci',
                'Cambio Gomme / Convergenza'
              ].map(item => (
                <button
                  key={item}
                  onClick={() => { setData({...data, problem: item}); nextStep(); }}
                  className={cn(
                    "w-full p-5 rounded-2xl border-2 transition-all text-left flex items-center justify-between",
                    data.problem === item ? "border-blue-600 bg-blue-50" : "border-[#D2D2D7]/30 bg-white"
                  )}
                >
                  <span className="text-xs font-black uppercase tracking-widest">{item}</span>
                  {data.problem === item && <Check className="w-4 h-4 text-blue-600" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 font-bold"
          >
            <div className="text-center">
              <h4 className="text-lg font-black text-[#1D1D1F]">Ulteriori Dettagli</h4>
            </div>
            <textarea 
              placeholder="es. La macchina emette un fischio in frenata, km percorsi, modello esatto..."
              className="w-full p-6 rounded-3xl bg-white border border-[#D2D2D7]/50 text-sm h-32 resize-none"
              onChange={(e) => setData({...data, details: e.target.value})}
            />
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-4">
              <Wrench className="w-5 h-5 text-blue-600 shrink-0" />
              <p className="text-[10px] font-black text-blue-800 uppercase tracking-tight leading-relaxed">
                Il Pro potrebbe richiedere il libretto di circolazione in chat per ordinare i pezzi di ricambio corretti.
              </p>
            </div>
            <Button onClick={finish} className="w-full h-14 rounded-2xl bg-[#1D1D1F] hover:bg-black text-white font-black text-lg">
              Sottoponi ai Meccanici
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
