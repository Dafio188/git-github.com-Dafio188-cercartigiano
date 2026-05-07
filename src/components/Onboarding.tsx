import React, { useState } from 'react';
import { updateDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { User, UserProfile } from '../types';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, User as UserIcon, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Input } from './ui/input';
import { AddressInput } from './AddressInput';
import { WorkerOnboardingFlow } from './WorkerOnboardingFlow';

interface OnboardingProps {
  user: User;
  onComplete: () => void;
}

export function Onboarding({ user, onComplete }: OnboardingProps) {
  const [role, setRole] = useState<'client' | 'worker' | null>(user.role as any || null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(user.role ? 2 : 1);
  const [showWorkerFlow, setShowWorkerFlow] = useState(user.role === 'worker');

  // Form states for client details (workers now have their own flow)
  const [phone, setPhone] = useState('');
  const [citta, setCitta] = useState('');
  const [address, setAddress] = useState('');
  const [cap, setCap] = useState('');
  const [provincia, setProvincia] = useState('');
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  const handleRoleSelect = (selected: 'client' | 'worker') => {
    setRole(selected);
    if (selected === 'worker') {
      setShowWorkerFlow(true);
    } else {
      setStep(2);
    }
  };

  const handleClientSubmit = async () => {
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        role: 'client',
        phone,
        address,
        location,
        citta,
        provincia,
        cap,
        status: 'active',
        onboardingComplete: true,
        tokens: 5
      });
      onComplete();
    } catch (error) {
      console.error("Error saving client onboarding:", error);
    } finally {
      setLoading(false);
    }
  };

  if (showWorkerFlow && role === 'worker') {
    return (
      <WorkerOnboardingFlow 
        user={user} 
        onComplete={onComplete} 
        onCancel={() => {
          setShowWorkerFlow(false);
          setRole(null);
          setStep(1);
        }} 
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-[#F5F5F7] z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] lg:rounded-[3.5rem] p-8 lg:p-12 w-full max-w-2xl shadow-xl border border-[#D2D2D7]/30 flex flex-col items-center">
        
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
          <img src="/logo.png" className="w-10 h-10 object-contain" alt="Logo" />
        </div>

        <h2 className="text-3xl font-black text-center text-[#1D1D1F] mb-2 tracking-tight">Benvenuto a Bordo</h2>
        <p className="text-[#86868B] text-center font-medium mb-12">Pochi secondi per configurare il tuo spazio su CercArtigiano.</p>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full flex justify-center"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-lg mx-auto">
                {/* Client Option */}
                <button
                  onClick={() => handleRoleSelect('client')}
                  className={`relative p-8 rounded-[2.5rem] border-2 text-left transition-all duration-300 flex flex-col items-center text-center group
                    ${role === 'client' 
                      ? 'border-blue-600 bg-blue-50/50 shadow-lg shadow-blue-500/10 scale-[1.02]' 
                      : 'border-[#D2D2D7]/30 hover:border-blue-600/30 hover:bg-[#F5F5F7]'
                    }`}
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all shadow-sm
                    ${role === 'client' ? 'bg-blue-600 text-white' : 'bg-white text-[#1D1D1F] border border-[#D2D2D7]/30 group-hover:rotate-6'}
                  `}>
                    <UserIcon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-black text-[#1D1D1F] mb-2 uppercase tracking-tight">Sono un Cliente</h3>
                  <p className="text-xs font-bold text-[#86868B] leading-relaxed px-4">
                    Cerco professionisti e artigiani qualificati per i miei lavori.
                  </p>
                </button>

                {/* Worker Option */}
                <button
                  onClick={() => handleRoleSelect('worker')}
                  className={`relative p-8 rounded-[2.5rem] border-2 text-left transition-all duration-300 flex flex-col items-center text-center group
                    ${role === 'worker' 
                      ? 'border-blue-600 bg-blue-50/50 shadow-lg shadow-blue-500/10 scale-[1.02]' 
                      : 'border-[#D2D2D7]/30 hover:border-blue-600/30 hover:bg-[#F5F5F7]'
                    }`}
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all shadow-sm
                    ${role === 'worker' ? 'bg-blue-600 text-white' : 'bg-white text-[#1D1D1F] border border-[#D2D2D7]/30 group-hover:rotate-6'}
                  `}>
                    <Briefcase className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-black text-[#1D1D1F] mb-2 uppercase tracking-tight">Sono un Artigiano</h3>
                  <p className="text-xs font-bold text-[#86868B] leading-relaxed px-4">
                    Voglio proporre le mie competenze e ricevere richieste ricaricando crediti.
                  </p>
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
             <motion.div
               key="step2"
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: 20 }}
               className="w-full max-w-md mx-auto space-y-8"
             >
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#1D1D1F] uppercase tracking-[0.2em] ml-1">
                      Dove si trova il lavoro?
                    </label>
                    <AddressInput 
                      value={address}
                      onChange={(addr, lat, lng, details) => {
                        setAddress(addr);
                        if (lat && lng) setLocation({ lat, lng });
                        if (details) {
                          setCitta(details.city || '');
                          setCap(details.postalCode || '');
                          setProvincia(details.province || '');
                        }
                      }}
                      className="bg-[#F5F5F7] border-none h-16 rounded-2xl font-medium"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#1D1D1F] uppercase tracking-[0.2em] ml-1">
                      Il tuo numero di telefono
                    </label>
                    <Input 
                      placeholder="Es. 333 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-[#F5F5F7] border-none h-16 rounded-2xl font-medium"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(1)}
                    className="flex-1 h-16 rounded-2xl font-black border-[#D2D2D7] hover:bg-[#F5F5F7]"
                  >
                    Indietro
                  </Button>
                  <Button 
                    onClick={handleClientSubmit}
                    disabled={loading}
                    className="flex-[2] h-16 rounded-2xl bg-blue-600 text-white font-black group shadow-xl shadow-blue-600/10"
                  >
                    {loading ? "CONFIGURAZIONE..." : "INIZIA ORA"}
                    {!loading && <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />}
                  </Button>
                </div>
                <p className="text-[10px] text-center text-[#86868B] font-medium leading-relaxed">
                  Trattiamo i tuoi dati nel rispetto della privacy. Cliccando su "Inizia Ora" accetti i nostri termini di servizio.
                </p>
             </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
