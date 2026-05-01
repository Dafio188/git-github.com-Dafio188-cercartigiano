import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Truck, Box, ArrowUpCircle, MapPin, Check, Info } from 'lucide-react';
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

export function GuidedTriageMoving({ onComplete, onBack }: Props) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    scope: '',
    volume: '',
    floors: { start: 'PT', end: 'PT' },
    hasElevator: { start: false, end: false },
    additionalServices: [] as string[]
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => step === 1 ? onBack() : setStep(s => s - 1);

  const finish = () => {
    const title = `Trasloco: ${data.scope} (${data.volume})`;
    const description = `Ambito: ${data.scope}. 
Volume stimato: ${data.volume}.
Dettagli logistici: Da ${data.floors.start} (Ascensore: ${data.hasElevator.start ? 'Si' : 'No'}) a ${data.floors.end} (Ascensore: ${data.hasElevator.end ? 'Si' : 'No'}).
Servizi extra: ${data.additionalServices.join(', ') || 'Nessuno'}.`;
    
    onComplete({ title, description });
  };

  return (
    <div className="space-y-8">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h4 className="text-lg font-black text-[#1D1D1F]">Cosa dobbiamo traslocare?</h4>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'Intero Appartamento', label: 'Intera Abitazione' },
                { id: 'Solo alcuni Mobili', label: 'Pochi Oggetti Ingombranti' },
                { id: 'Ufficio / Azienda', label: 'Ufficio Professionale' },
                { id: 'Internazionale', label: 'Trasloco fuori Italia' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => { setData({...data, scope: item.id}); nextStep(); }}
                  className={cn(
                    "flex items-center justify-between p-5 rounded-2xl border-2 transition-all",
                    data.scope === item.id ? "border-blue-600 bg-blue-50" : "border-[#D2D2D7]/30 bg-white hover:border-[#D2D2D7]"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <Truck className="w-5 h-5 text-[#1D1D1F]" />
                    <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                  </div>
                  <Check className={cn("w-4 h-4", data.scope === item.id ? "text-blue-600" : "text-transparent")} />
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
              <h4 className="text-lg font-black text-[#1D1D1F]">Volume del trasloco</h4>
              <p className="text-xs font-bold text-[#86868B]">Stima indicativa</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'Monolocale', label: '10-20 mc' },
                { id: 'Bilocale', label: '20-35 mc' },
                { id: 'Trilocale+', label: '35-55 mc' },
                { id: 'Villa/Palazzo', label: '> 55 mc' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => { setData({...data, volume: item.id}); nextStep(); }}
                  className={cn(
                    "p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-2",
                    data.volume === item.id ? "border-blue-600 bg-blue-50" : "border-[#D2D2D7]/30 bg-white"
                  )}
                >
                  <Box className="w-6 h-6 text-[#1D1D1F]" />
                  <span className="text-xs font-black uppercase tracking-widest">{item.id}</span>
                  <span className="text-[10px] font-bold text-[#86868B]">{item.label}</span>
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
            className="space-y-6"
          >
            <div className="text-center">
              <h4 className="text-lg font-black text-[#1D1D1F]">Logistica Piani</h4>
              <p className="text-xs font-bold text-[#86868B]">Cruciale per il preventivo</p>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-[#D2D2D7]/50 flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest">Partenza</span>
                <div className="flex gap-2">
                  <select 
                    value={data.floors.start}
                    onChange={(e) => setData({...data, floors: {...data.floors, start: e.target.value}})}
                    className="bg-[#F5F5F7] border-none rounded-lg text-xs font-bold p-2"
                  >
                    <option value="PT">PT</option>
                    {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}° Piano</option>)}
                  </select>
                  <button
                    type="button"
                    onClick={() => setData({...data, hasElevator: {...data.hasElevator, start: !data.hasElevator.start}})}
                    className={cn(
                      "px-3 py-2 rounded-lg text-[10px] font-black uppercase transition-all",
                      data.hasElevator.start ? "bg-green-600 text-white" : "bg-[#F5F5F7] text-[#86868B]"
                    )}
                  >
                    Ascensore
                  </button>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#D2D2D7]/50 flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest">Arrivo</span>
                <div className="flex gap-2">
                  <select 
                    value={data.floors.end}
                    onChange={(e) => setData({...data, floors: {...data.floors, end: e.target.value}})}
                    className="bg-[#F5F5F7] border-none rounded-lg text-xs font-bold p-2"
                  >
                    <option value="PT">PT</option>
                    {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}° Piano</option>)}
                  </select>
                  <button
                    type="button"
                    onClick={() => setData({...data, hasElevator: {...data.hasElevator, end: !data.hasElevator.end}})}
                    className={cn(
                      "px-3 py-2 rounded-lg text-[10px] font-black uppercase transition-all",
                      data.hasElevator.end ? "bg-green-600 text-white" : "bg-[#F5F5F7] text-[#86868B]"
                    )}
                  >
                    Ascensore
                  </button>
                </div>
              </div>
            </div>

            <Button onClick={finish} className="w-full h-14 rounded-2xl bg-[#1D1D1F] hover:bg-black text-white font-black text-lg">
              Conferma Dettagli Trasloco
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
