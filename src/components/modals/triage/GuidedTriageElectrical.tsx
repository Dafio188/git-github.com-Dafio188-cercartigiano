import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Zap, Lightbulb, Power, Home, Settings, AlertTriangle, Play, Pause, XCircle, Clock, Trash2, Smartphone, ShieldCheck } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface TriageResult {
  title: string;
  description: string;
}

interface GuidedTriageElectricalProps {
  onComplete: (result: TriageResult) => void;
  onBack: () => void;
}

type ComponentType = 'quadro' | 'prese' | 'luci' | 'citofono' | 'automazione' | 'altro';

export function GuidedTriageElectrical({ onComplete, onBack }: GuidedTriageElectricalProps) {
  const [step, setStep] = useState(1);
  const [component, setComponent] = useState<ComponentType | null>(null);
  const [symptom, setSymptom] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [urgency, setUrgency] = useState<string>('');

  const handleNext = () => setStep(s => s + 1);

  const getSymptomOptions = (comp: ComponentType | null) => {
    switch(comp) {
      case 'quadro':
        return [
          { id: 'salta_continuo', label: 'Salta continuamente', icon: AlertTriangle },
          { id: 'non_si_riarma', label: 'Non si riarma più', icon: XCircle },
          { id: 'odore_bruciato', label: 'Sento odore di bruciato', icon: AlertTriangle },
          { id: 'rumore_fruscio', label: 'Sento un ronzio/fruscio', icon: Settings },
        ];
      case 'prese':
        return [
          { id: 'non_eroga', label: 'Non alimenta i dispositivi', icon: Power },
          { id: 'scintille', label: 'Fa scintille quando inserisco la spina', icon: Zap },
          { id: 'sciolta', label: 'Sembra sciolta o annerita', icon: Trash2 },
          { id: 'balla', label: 'Si muove nel muro', icon: Settings },
        ];
      case 'luci':
        return [
          { id: 'non_accende', label: 'Non si accende proprio', icon: XCircle },
          { id: 'sfarfalla', label: 'Sfarfalla (flicker)', icon: Zap },
          { id: 'brucia_lampadine', label: 'Brucia spesso le lampadine', icon: AlertTriangle },
          { id: 'interruttore_duro', label: 'Interruttore bloccato o duro', icon: Settings },
        ];
      case 'automazione':
        return [
          { id: 'cancello_bloccato', label: 'Cancello/Serranda bloccata', icon: Settings },
          { id: 'comando_non_va', label: 'Il telecomando non risponde', icon: Smartphone },
          { id: 'rumore_meccanico', label: 'Fa rumore ma non si muove', icon: AlertTriangle },
        ];
      default:
        return [
          { id: 'corto_circuito', label: 'Sospetto corto circuito', icon: Zap },
          { id: 'odore', label: 'Odore di bruciato genericamente', icon: AlertTriangle },
          { id: 'non_funziona', label: 'Malfunzionamento generico', icon: Settings },
        ];
    }
  };

  const renderStep1 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-black text-[#1D1D1F] mb-1">Qual è il problema elettrico?</h3>
        <p className="text-sm font-bold text-[#86868B]">Seleziona l'area interessata</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { id: 'quadro', label: 'Quadro Elettrico/Salvavita', icon: ShieldCheck /* Manual import if needed, using custom */ },
          { id: 'prese', label: 'Prese o Interruttori', icon: Power },
          { id: 'luci', label: 'Illuminazione/Faretti', icon: Lightbulb },
          { id: 'citofono', label: 'Citofono/Videocitofono', icon: Smartphone },
          { id: 'automazione', label: 'Cancelli/Serrande/Tapparelle', icon: Settings },
          { id: 'altro', label: 'Altro/Corto Circuito', icon: Zap },
        ].map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => { setComponent(item.id as ComponentType); handleNext(); }}
            className="flex flex-col items-center justify-center gap-3 p-4 bg-white border border-[#D2D2D7]/50 rounded-2xl hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left"
          >
            <div className="w-10 h-10 bg-[#F5F5F7] rounded-full flex items-center justify-center text-[#1D1D1F]">
              {item.id === 'quadro' ? <Settings className="w-5 h-5" /> : <item.icon className="w-5 h-5" />}
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
          <h3 className="text-xl font-black text-[#1D1D1F] mb-1">Dettagli del malfunzionamento</h3>
          <p className="text-sm font-bold text-[#86868B]">Cosa noti di insolito?</p>
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
        <h3 className="text-xl font-black text-[#1D1D1F] mb-1">Localizzazione</h3>
        <p className="text-sm font-bold text-[#86868B]">Dove occorre intervenire?</p>
      </div>
      <div className="flex flex-col gap-3">
        {[
          { id: 'intero_appartamento', label: 'Intero Appartamento' },
          { id: 'cucina_bagno', label: 'Cucina o Bagno (Zone Umide)' },
          { id: 'esterno', label: 'Esterno / Terrazzo / Giardino' },
          { id: 'locale_tecnico', label: 'Locale Tecnico / Garage' },
          { id: 'singola_stanza', label: 'In una sola stanza' },
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
        <h3 className="text-xl font-black text-[#1D1D1F] mb-1">Gravità della Situazione</h3>
        <p className="text-sm font-bold text-[#86868B]">Seleziona lo stato attuale del sistema</p>
      </div>
      <div className="flex flex-col gap-3">
        {[
          { id: 'sicuro', label: 'Sistema in sicurezza (corrente staccata)', icon: Pause, color: 'text-green-600', bg: 'bg-green-100' },
          { id: 'disagio', label: 'Disagio (manca corrente in alcune zone)', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
          { id: 'pericolo', label: 'Pericolo! Scintille o odore di fumo', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
        ].map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setUrgency(item.label);
              onComplete({
                title: `Intervento Elettrico: ${component === 'quadro' ? 'Quadro/Salvavita' : component} - ${symptom}`,
                description: `**Area:** ${component}\n**Dettaglio:** ${symptom}\n**Zona:** ${location}\n**Livello Rischio:** ${item.label}`
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
