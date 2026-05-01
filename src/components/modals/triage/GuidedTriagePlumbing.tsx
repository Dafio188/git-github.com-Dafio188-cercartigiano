import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Droplet, Droplets, ShowerHead, Box, Wrench, AlertTriangle, Play, Pause, Hand, MapPin, XCircle, Clock, Search, Toilet } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface TriagePlumbingResult {
  title: string;
  description: string;
}

interface GuidedTriagePlumbingProps {
  onComplete: (result: TriagePlumbingResult) => void;
  onBack: () => void;
}

type ComponentType = 'rubinetto' | 'scarico' | 'tubatura_visibile' | 'tubatura_muro' | 'caldaia' | 'sanitari' | 'altro';

export function GuidedTriagePlumbing({ onComplete, onBack }: GuidedTriagePlumbingProps) {
  const [step, setStep] = useState(1);
  const [component, setComponent] = useState<ComponentType | null>(null);
  const [symptom, setSymptom] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [urgency, setUrgency] = useState<string>('');

  const handleNext = () => setStep(s => s + 1);

  const getSymptomOptions = (comp: ComponentType | null) => {
    switch(comp) {
      case 'rubinetto':
        return [
          { id: 'gocciola', label: 'Gocciola quando è chiuso', icon: Droplet },
          { id: 'perde_base', label: 'Perde dalla base', icon: Droplets },
          { id: 'pressione_fredda', label: 'Poca pressione acqua', icon: Droplets },
          { id: 'rumore', label: 'Fa rumore', icon: AlertTriangle },
        ];
      case 'scarico':
        return [
          { id: 'lento', label: 'Lento a scaricare', icon: Clock },
          { id: 'bloccato', label: 'Totalmente bloccato', icon: XCircle },
          { id: 'continuo', label: 'Acqua scende di continuo', icon: Droplets },
          { id: 'sul_pavimento', label: 'Perde acqua sul pavimento', icon: AlertTriangle },
        ];
      default:
        return [
          { id: 'perde', label: 'Perde acqua', icon: Droplet },
          { id: 'non_funziona', label: 'Non funziona', icon: XCircle },
          { id: 'rumore', label: 'Fa uno strano rumore', icon: AlertTriangle },
        ];
    }
  };

  const renderStep1 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-black text-[#1D1D1F] mb-1">Qual è il componente guasto?</h3>
        <p className="text-sm font-bold text-[#86868B]">Seleziona l'oggetto che richiede l'intervento</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { id: 'rubinetto', label: 'Rubinetto', icon: Wrench },
          { id: 'scarico', label: 'Scarico WC', icon: XCircle /* Replace with better icon */ },
          { id: 'tubatura_visibile', label: 'Tubatura a vista', icon: Box },
          { id: 'tubatura_muro', label: 'Tubatura nel muro', icon: Droplets },
          { id: 'caldaia', label: 'Scaldabagno / Caldaia', icon: Droplet },
          { id: 'sanitari', label: 'Sanitari / Bidet / Doccia', icon: Droplet },
        ].map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => { setComponent(item.id as ComponentType); handleNext(); }}
            className="flex flex-col items-center justify-center gap-3 p-4 bg-white border border-[#D2D2D7]/50 rounded-2xl hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left"
          >
            <div className="w-10 h-10 bg-[#F5F5F7] rounded-full flex items-center justify-center text-[#1D1D1F]">
              <item.icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-center text-[#1D1D1F]">{item.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );

  const renderStep2 = () => {
    const options = getSymptomOptions(component);
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-black text-[#1D1D1F] mb-1">Cosa succede esattamente?</h3>
          <p className="text-sm font-bold text-[#86868B]">Più sei preciso, migliore sarà il preventivo.</p>
        </div>
        <div className="flex flex-col gap-3">
          {options.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => { setSymptom(item.label); handleNext(); }}
              className="flex items-center gap-4 p-4 bg-white border border-[#D2D2D7]/50 rounded-2xl hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left"
            >
              <div className="w-10 h-10 bg-[#F5F5F7] rounded-full flex items-center justify-center text-[#1D1D1F]">
                <item.icon className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm text-[#1D1D1F]">{item.label}</span>
            </button>
          ))}
        </div>
      </motion.div>
    );
  };

  const renderStep3 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-black text-[#1D1D1F] mb-1">Dove si trova?</h3>
        <p className="text-sm font-bold text-[#86868B]">Indica la stanza e l'accessibilità.</p>
      </div>
      <div className="flex flex-col gap-3">
        {[
          { id: 'bagno_facile', label: 'Bagno - Facilmente accessibile' },
          { id: 'bagno_difficile', label: 'Bagno - Incassato/Difficile' },
          { id: 'cucina_facile', label: 'Cucina - Facilmente accessibile' },
          { id: 'esterno', label: 'All\'esterno' },
          { id: 'altro', label: 'Locale Tecnico / Altro' },
        ].map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => { setLocation(item.label); handleNext(); }}
            className="p-4 bg-white border border-[#D2D2D7]/50 rounded-2xl hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left font-bold text-sm text-[#1D1D1F]"
          >
            {item.label}
          </button>
        ))}
      </div>
    </motion.div>
  );

  const renderStep4 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-black text-[#1D1D1F] mb-1">Livello di Urgenza</h3>
        <p className="text-sm font-bold text-[#86868B]">In questo momento l'acqua è...</p>
      </div>
      <div className="flex flex-col gap-3">
        {[
          { id: 'chiusa', label: 'Chiusa dall\'interruttore generale', icon: Pause, color: 'text-green-600', bg: 'bg-green-100' },
          { id: 'aperta_non_uso', label: 'Aperta, ma non la sto usando', icon: Play, color: 'text-orange-600', bg: 'bg-orange-100' },
          { id: 'emergenza', label: 'Aperta ed esce senza controllo!', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
        ].map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setUrgency(item.label);
              onComplete({
                title: `Problema Idraulico: ${component === 'scarico' ? 'Scarico' : component} - ${symptom}`,
                description: `**Componente:** ${component}\n**Problema:** ${symptom}\n**Posizione:** ${location}\n**Stato Urgenza:** ${item.label}`
              });
            }}
            className="flex items-center gap-4 p-4 bg-white border border-[#D2D2D7]/50 rounded-2xl hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left"
          >
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", item.bg, item.color)}>
              <item.icon className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm text-[#1D1D1F]">{item.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={step === 1 ? onBack : () => setStep(s => s - 1)} className="text-xs font-bold px-4 py-2">
          ← Indietro
        </Button>
        <div className="flex gap-1">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={cn("h-1.5 rounded-full transition-all", step === i ? "w-6 bg-blue-600" : "w-1.5 bg-[#D2D2D7]/50")} />
          ))}
        </div>
      </div>
      <AnimatePresence mode="wait">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </AnimatePresence>
    </div>
  );
}
