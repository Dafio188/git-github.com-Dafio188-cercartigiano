import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Hammer, Box, Layout, Scissors, Wrench, PenTool, CheckCircle2, Clock, AlertCircle, Settings } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface TriageResult {
  title: string;
  description: string;
}

interface GuidedTriageHandymanProps {
  onComplete: (result: TriageResult) => void;
  onBack: () => void;
}

type ComponentType = 'montaggio' | 'riparazione' | 'pittura' | 'infissi' | 'decorazioni' | 'altro';

export function GuidedTriageHandyman({ onComplete, onBack }: GuidedTriageHandymanProps) {
  const [step, setStep] = useState(1);
  const [component, setComponent] = useState<ComponentType | null>(null);
  const [symptom, setSymptom] = useState<string>('');
  const [size, setSize] = useState<string>('');

  const handleNext = () => setStep(s => s + 1);

  const getSymptomOptions = (comp: ComponentType | null) => {
    switch(comp) {
      case 'montaggio':
        return [
          { id: 'ikea', label: 'Mobili a pacco (IKEA/MondoConv)', icon: Box },
          { id: 'armadio', label: 'Armadio grande / Cucina', icon: Layout },
          { id: 'scrivania', label: 'Letto / Scrivania / Piccoli mobili', icon: Hammer },
          { id: 'smontaggio', label: 'Solo smontaggio', icon: Wrench },
        ];
      case 'riparazione':
        return [
          { id: 'muro', label: 'Piccolo buco/crepa nel muro', icon: AlertCircle },
          { id: 'maniglia', label: 'Maniglia / Serratura bloccata', icon: Settings /* Using Generic */ },
          { id: 'tapparelle', label: 'Corda tapparella rotta', icon: Scissors },
          { id: 'perdita_minore', label: 'Sostituzione silicone/guarnizioni', icon: Wrench },
        ];
      case 'infissi':
        return [
          { id: 'registrazione', label: 'Porta/Finestra striscia o non chiude', icon: Wrench },
          { id: 'zanzariera', label: 'Riparazione/Installazione zanzariera', icon: Scissors },
          { id: 'vetro', label: 'Vetro rotto o incrinato', icon: AlertCircle },
        ];
      case 'decorazioni':
        return [
          { id: 'tende', label: 'Montaggio tende / Bastoni', icon: Scissors },
          { id: 'quadri', label: 'Appensione quadri / Mensole / Specchi', icon: Layout },
          { id: 'tv', label: 'Montaggio staffa TV a muro', icon: Settings /* Generic */ },
        ];
      default:
        return [
          { id: 'manutenzione', label: 'Manutenzione generica', icon: Wrench },
          { id: 'altro', label: 'Richiesta personalizzata', icon: PenTool },
        ];
    }
  };

  const renderStep1 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-black text-[#1D1D1F] mb-1">Cosa deve fare il Tuttofare?</h3>
        <p className="text-sm font-bold text-[#86868B]">Scegli la categoria principale</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { id: 'montaggio', label: 'Montaggio Mobili', icon: Box },
          { id: 'riparazione', label: 'Piccole Riparazioni', icon: Wrench },
          { id: 'infissi', label: 'Porte e Finestre', icon: Settings },
          { id: 'decorazioni', label: 'Tende / Quadri / TV', icon: Layout },
          { id: 'pittura', label: 'Ritocchi Pittura', icon: PenTool },
          { id: 'altro', label: 'Altro / Varie', icon: Hammer },
        ].map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => { 
                setComponent(item.id as ComponentType); 
                if (item.id === 'pittura') { setSymptom('Pittura pareti/ritocchi'); handleNext(); handleNext(); }
                else handleNext(); 
            }}
            className="flex flex-col items-center justify-center gap-3 p-4 bg-white border border-[#D2D2D7]/50 rounded-2xl hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left"
          >
            <div className="w-10 h-10 bg-[#F5F5F7] rounded-full flex items-center justify-center text-[#1D1D1F]">
               {item.id === 'infissi' ? <Wrench className="w-5 h-5" /> : item.id === 'decorazioni' ? <Layout className="w-5 h-5" /> : <item.icon className="w-5 h-5" />}
            </div>
            <span className="text-[10px] md:text-xs font-black text-center text-[#1D1D1F] leading-tight">{item.label}</span>
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
          <h3 className="text-xl font-black text-[#1D1D1F] mb-1">Dettagli del lavoro</h3>
          <p className="text-sm font-bold text-[#86868B]">Seleziona l'intervento specifico</p>
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
        <h3 className="text-xl font-black text-[#1D1D1F] mb-1">Entità dell'intervento</h3>
        <p className="text-sm font-bold text-[#86868B]">Quanto tempo ritieni sia necessario?</p>
      </div>
      <div className="flex flex-col gap-3">
        {[
          { id: 'rapido', label: 'Intervento veloce ( < 1 ora)', icon: Clock, color: 'text-green-600', bg: 'bg-green-100' },
          { id: 'mezza_giornata', label: 'Mezza giornata di lavoro', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
          { id: 'intera_giornata', label: 'Giornata intera o più giorni', icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-100' },
        ].map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              onComplete({
                title: `Lavoro Tuttofare: ${symptom}`,
                description: `**Tipo Intervento:** ${component}\n**Dettaglio:** ${symptom}\n**Durata Stimata:** ${item.label}`
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
          {[1, 2, 3].map(i => (
            <div key={i} className={cn("h-1.5 rounded-full transition-all", step === i ? "w-6 bg-blue-600" : "w-1.5 bg-[#D2D2D7]/50")} />
          ))}
        </div>
      </div>
      <AnimatePresence mode="wait">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </AnimatePresence>
    </div>
  );
}
