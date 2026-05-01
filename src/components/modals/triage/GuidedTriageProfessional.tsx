import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Brain, Scale, Compass, Calculator, Users, Clock, Video, Home, MessageCircle, AlertCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface TriageResult {
  title: string;
  description: string;
}

interface GuidedTriageProfessionalProps {
  onComplete: (result: TriageResult) => void;
  onBack: () => void;
  category: string;
}

export function GuidedTriageProfessional({ onComplete, onBack, category }: GuidedTriageProfessionalProps) {
  const [step, setStep] = useState(1);
  const [need, setNeed] = useState<string>('');
  const [mode, setMode] = useState<string>('');
  const [urgency, setUrgency] = useState<string>('');

  const handleNext = () => setStep(s => s + 1);

  const getTitle = () => {
    switch(category) {
      case 'psychology': return 'Consulenza Psicologica';
      case 'lawyer': return 'Assistenza Legale';
      case 'architect': return 'Progettazione Architettonica';
      case 'accountant': return 'Consulenza Fiscale';
      default: return 'Consulenza Professionale';
    }
  };

  const getOptions = () => {
    switch(category) {
      case 'psychology':
        return [
          { id: 'ansia', label: 'Ansia e Stress', icon: Brain },
          { id: 'coppia', label: 'Terapia di Coppia', icon: Users },
          { id: 'crescita', label: 'Crescita Personale', icon: Brain },
          { id: 'depressione', label: 'Supporto Depressivo', icon: Brain },
        ];
      case 'lawyer':
        return [
          { id: 'civile', label: 'Diritto Civile / Famiglia', icon: Scale },
          { id: 'lavoro', label: 'Diritto del Lavoro', icon: Scale },
          { id: 'penale', label: 'Diritto Penale', icon: Scale },
          { id: 'societario', label: 'Consulenza Aziendale', icon: Scale },
        ];
      case 'architect':
        return [
          { id: 'ristrutturazione', label: 'Ristrutturazione Casa', icon: Home },
          { id: 'interni', label: 'Interior Design', icon: Compass },
          { id: 'pratiche', label: 'Pratiche Edilizie (SCIA/CILA)', icon: Compass },
          { id: 'giardino', label: 'Landscape / Giardini', icon: Compass },
        ];
      default:
        return [
          { id: 'generica', label: 'Consulenza Generale', icon: MessageCircle },
          { id: 'urgente', label: 'Problematica Urgente', icon: AlertCircle },
        ];
    }
  };

  const renderStep1 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-black text-[#1D1D1F] mb-1">Qual è la tua esigenza?</h3>
        <p className="text-sm font-bold text-[#86868B]">Seleziona l'area di intervento prevalente</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {getOptions().map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => { setNeed(item.label); handleNext(); }}
            className="flex items-center gap-4 p-4 bg-white border border-[#D2D2D7]/50 rounded-2xl hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left"
          >
            <div className="w-10 h-10 bg-[#F5F5F7] rounded-xl flex items-center justify-center text-[#1D1D1F]">
              <item.icon className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm text-[#1D1D1F]">{item.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-black text-[#1D1D1F] mb-1">Preferenza colloquio</h3>
        <p className="text-sm font-bold text-[#86868B]">Come preferisci svolgere le sessioni?</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { id: 'online', label: 'Online (Videochiamata)', icon: Video },
          { id: 'presenza', label: 'In Presenza (Studio)', icon: Home },
          { id: 'indifferente', label: 'Indifferente', icon: Users },
        ].map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => { setMode(item.label); handleNext(); }}
            className="flex flex-col items-center justify-center gap-3 p-6 bg-white border border-[#D2D2D7]/50 rounded-2xl hover:border-blue-500 hover:bg-blue-50/50 transition-all"
          >
            <div className="w-12 h-12 bg-[#F5F5F7] rounded-full flex items-center justify-center text-[#1D1D1F]">
              <item.icon className="w-6 h-6" />
            </div>
            <span className="font-black text-sm text-[#1D1D1F]">{item.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-black text-[#1D1D1F] mb-1">Tempistiche</h3>
        <p className="text-sm font-bold text-[#86868B]">Quando vorresti iniziare?</p>
      </div>
      <div className="flex flex-col gap-3">
        {[
          { id: 'pripmo', label: 'Il prima possibile', icon: Clock, color: 'text-red-600', bg: 'bg-red-50' },
          { id: 'settimana', label: 'Entro questa settimana', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
          { id: 'mese', label: 'Entro un mese', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
          { id: 'informativo', label: 'Solo a scopo informativo', icon: MessageCircle, color: 'text-gray-600', bg: 'bg-gray-50' },
        ].map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              onComplete({
                title: `${getTitle()}: ${need}`,
                description: `**Settore:** ${need}\n**Modalità:** ${mode}\n**Inizio:** ${item.label}`
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
