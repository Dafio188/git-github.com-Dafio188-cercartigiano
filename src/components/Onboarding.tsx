import logoUrl from '../assets/logo.png';
import React, { useState } from 'react';
import { updateDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { User, UserProfile } from '../types';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, User as UserIcon, CheckCircle2, ArrowRight } from 'lucide-react';
import { Input } from './ui/input';

interface OnboardingProps {
  user: User;
  onComplete: () => void;
}

export function Onboarding({ user, onComplete }: OnboardingProps) {
  const [role, setRole] = useState<'client' | 'worker' | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Form states for worker/client details
  const [phone, setPhone] = useState('');
  const [citta, setCitta] = useState('');
  const [address, setAddress] = useState('');
  const [cap, setCap] = useState('');
  const [provincia, setProvincia] = useState('');

  // Fiscal states
  const [fiscalType, setFiscalType] = useState<'individual' | 'company' | 'freelancer' | null>(null);
  const [ragioneSociale, setRagioneSociale] = useState('');
  const [partitaIva, setPartitaIva] = useState('');
  const [codiceFiscale, setCodiceFiscale] = useState('');
  const [codiceSdi, setCodiceSdi] = useState('');
  const [pec, setPec] = useState('');
  const [regimeFiscale, setRegimeFiscale] = useState('');
  const [isVatValidating, setIsVatValidating] = useState(false);

  const handleRoleSelect = (selected: 'client' | 'worker') => {
    setRole(selected);
    setStep(2);
  };

  const validateVat = async (vat: string) => {
    if (vat.length < 11) return;
    setIsVatValidating(true);
    try {
      const res = await fetch('/api/billing/verify-vat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vat })
      });
      const data = await res.json();
      if (data.success && data.data?.denominazione) {
        setRagioneSociale(data.data.denominazione);
      }
    } catch (e) {
      console.error("VAT check error", e);
    } finally {
      setIsVatValidating(false);
    }
  };

  const handleSubmit = async () => {
    if (!role || !fiscalType) return;
    setLoading(true);

    try {
      const userRef = doc(db, 'users', user.id);
      
      const updates: any = {
        role: role,
        onboardingComplete: true,
        tokens: role === 'worker' ? 10 : 5,
      };

      if (phone) updates.phone = phone;
      if (citta) updates.citta = citta;
      if (address) updates.address = address;
      if (cap) updates.cap = cap;
      if (provincia) updates.provincia = provincia;

      await updateDoc(userRef, updates);

      // Save Billing Profile
      const billingRef = doc(db, 'billingProfiles', user.id);
      const billingData: any = {
        userId: user.id,
        fiscalType,
        codiceFiscale: codiceFiscale,
        address: address,
        cap: cap,
        citta: citta,
        provincia: provincia,
        updatedAt: new Date().toISOString()
      };
      if (ragioneSociale) billingData.ragioneSociale = ragioneSociale;
      if (partitaIva) billingData.partitaIva = partitaIva;
      if (codiceSdi) billingData.codiceSdi = codiceSdi;
      if (pec) billingData.pec = pec;
      if (regimeFiscale) billingData.regimeFiscale = regimeFiscale;

      await setDoc(billingRef, billingData);

      // If worker, optionally initialize their public profile
      if (role === 'worker') {
        const profileRef = doc(db, 'workerProfiles', user.id);
        const profileData: UserProfile = {
          userId: user.id,
          bio: "Nuovo professionista su CercArtigiano",
          categories: [],
          hourlyRate: 0,
          radiusKm: 20,
          citta: citta || undefined,
          verifiedFlags: {
            id: false,
            phone: false,
            insurance: false
          },
          badges: [],
          score: 5.0,
          credits: 10, // starting credits
          isAvailable: true,
          isOnline: true
        };
        await setDoc(profileRef, profileData);
      }

      onComplete();
    } catch (error) {
      console.error("Error saving onboarding details:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#F5F5F7] z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] lg:rounded-[3.5rem] p-8 lg:p-12 w-full max-w-2xl shadow-xl border border-[#D2D2D7]/30 flex flex-col items-center">
        
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
          <img src={logoUrl} className="w-10 h-10 object-contain" alt="Logo" />
        </div>

        <h2 className="text-3xl font-black text-center text-[#1D1D1F] mb-2 tracking-tight">Benvenuto a Bordo</h2>
        <p className="text-[#86868B] text-center font-medium mb-12">Completa il tuo profilo in due passaggi per iniziare.</p>

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
                  className={`relative p-6 lg:p-8 rounded-[2rem] border-2 text-left transition-all duration-300 flex flex-col items-center text-center
                    ${role === 'client' 
                      ? 'border-blue-600 bg-blue-50/50 shadow-lg shadow-blue-500/10 scale-[1.02]' 
                      : 'border-[#D2D2D7]/30 hover:border-[#D2D2D7] hover:bg-[#F5F5F7]'
                    }`}
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors
                    ${role === 'client' ? 'bg-blue-600 text-white' : 'bg-white text-[#1D1D1F] border border-[#D2D2D7]/30'}
                  `}>
                    <UserIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-[#1D1D1F] mb-2">Sono un Cliente</h3>
                  <p className="text-xs font-bold text-[#86868B] leading-relaxed">
                    Ho bisogno di un professionista per un lavoro.
                  </p>
                  {role === 'client' && (
                    <div className="absolute top-4 right-4 text-blue-600">
                      <CheckCircle2 className="w-6 h-6 fill-blue-100" />
                    </div>
                  )}
                </button>

                {/* Worker Option */}
                <button
                  onClick={() => handleRoleSelect('worker')}
                  className={`relative p-6 lg:p-8 rounded-[2rem] border-2 text-left transition-all duration-300 flex flex-col items-center text-center
                    ${role === 'worker' 
                      ? 'border-blue-600 bg-blue-50/50 shadow-lg shadow-blue-500/10 scale-[1.02]' 
                      : 'border-[#D2D2D7]/30 hover:border-[#D2D2D7] hover:bg-[#F5F5F7]'
                    }`}
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors
                    ${role === 'worker' ? 'bg-blue-600 text-white' : 'bg-white text-[#1D1D1F] border border-[#D2D2D7]/30'}
                  `}>
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-[#1D1D1F] mb-2">Sono un Artigiano</h3>
                  <p className="text-xs font-bold text-[#86868B] leading-relaxed">
                    Voglio proporre i miei servizi ai clienti.
                  </p>
                  {role === 'worker' && (
                    <div className="absolute top-4 right-4 text-blue-600">
                      <CheckCircle2 className="w-6 h-6 fill-blue-100" />
                    </div>
                  )}
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
               className="w-full max-w-sm mx-auto space-y-6"
             >
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-[#1D1D1F] ml-1 mb-1 block uppercase tracking-widest">
                        Telefono
                      </label>
                      <Input 
                        placeholder="333..."
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-[#F5F5F7] border-transparent h-14 rounded-2xl"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-[#1D1D1F] ml-1 mb-1 block uppercase tracking-widest">
                        Città
                      </label>
                      <Input 
                        placeholder="Roma"
                        value={citta}
                        onChange={(e) => setCitta(e.target.value)}
                        className="bg-[#F5F5F7] border-transparent h-14 rounded-2xl"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-[#1D1D1F] ml-1 mb-1 block uppercase tracking-widest">
                      Indirizzo
                    </label>
                    <Input 
                      placeholder="Via..."
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="bg-[#F5F5F7] border-transparent h-14 rounded-2xl"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-[#1D1D1F] ml-1 mb-1 block uppercase tracking-widest">
                        CAP
                      </label>
                      <Input 
                        placeholder="00100"
                        value={cap}
                        onChange={(e) => setCap(e.target.value)}
                        className="bg-[#F5F5F7] border-transparent h-14 rounded-2xl"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-[#1D1D1F] ml-1 mb-1 block uppercase tracking-widest">
                        Provincia
                      </label>
                      <Input 
                        placeholder="RM"
                        maxLength={2}
                        value={provincia}
                        onChange={(e) => setProvincia(e.target.value)}
                        className="bg-[#F5F5F7] border-transparent h-14 rounded-2xl"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(1)}
                    className="flex-1 h-14 rounded-2xl font-black border-[#D2D2D7]"
                  >
                    Indietro
                  </Button>
                  <Button 
                    onClick={() => setStep(3)}
                    disabled={!citta || !address}
                    className="flex-[2] h-14 rounded-2xl bg-[#1D1D1F] text-white font-black group"
                  >
                    Avanti
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
             </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full max-w-sm mx-auto space-y-6"
            >
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-[#1D1D1F] mb-3 block uppercase tracking-widest">
                    Tipologia Fiscale
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'individual', label: 'Privato (C.F.)' },
                      { id: 'freelancer', label: 'Libero Professionista (P.IVA)' },
                      { id: 'company', label: 'Ditta/Società (P.IVA)' }
                    ].map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setFiscalType(type.id as any)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          fiscalType === type.id 
                            ? 'border-blue-600 bg-blue-50/50' 
                            : 'border-[#D2D2D7]/30 hover:border-[#D2D2D7]'
                        }`}
                      >
                        <span className="text-sm font-black text-[#1D1D1F]">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {fiscalType && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div>
                      <Input 
                        placeholder="Codice Fiscale"
                        value={codiceFiscale}
                        onChange={(e) => setCodiceFiscale(e.target.value.toUpperCase())}
                        className="bg-[#F5F5F7] border-transparent h-12 rounded-xl"
                      />
                    </div>
                    
                    {(fiscalType === 'company' || fiscalType === 'freelancer') && (
                      <>
                        <div className="relative">
                          <Input 
                            placeholder="Partita IVA"
                            value={partitaIva}
                            onChange={(e) => {
                              setPartitaIva(e.target.value);
                              if (e.target.value.length === 11) validateVat(e.target.value);
                            }}
                            className="bg-[#F5F5F7] border-transparent h-12 rounded-xl"
                          />
                          {isVatValidating && (
                            <div className="absolute right-3 top-3.5">
                              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            </div>
                          )}
                        </div>
                        <Input 
                          placeholder="Ragione Sociale"
                          value={ragioneSociale}
                          onChange={(e) => setRagioneSociale(e.target.value)}
                          className="bg-[#F5F5F7] border-transparent h-12 rounded-xl"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input 
                            placeholder="Codice SDI"
                            value={codiceSdi}
                            onChange={(e) => setCodiceSdi(e.target.value.toUpperCase())}
                            className="bg-[#F5F5F7] border-transparent h-12 rounded-xl"
                          />
                          <Input 
                            placeholder="PEC"
                            value={pec}
                            onChange={(e) => setPec(e.target.value)}
                            className="bg-[#F5F5F7] border-transparent h-12 rounded-xl"
                          />
                        </div>
                        <select 
                          value={regimeFiscale}
                          onChange={(e) => setRegimeFiscale(e.target.value)}
                          className="w-full bg-[#F5F5F7] border-transparent h-12 rounded-xl px-3 text-sm font-medium"
                        >
                          <option value="">Seleziona Regime Fiscale</option>
                          <option value="RF01">Ordinario</option>
                          <option value="RF19">Forfettario</option>
                          <option value="RF02">Contribuenti minimi</option>
                        </select>
                      </>
                    )}
                    
                    <p className="text-[10px] text-[#86868B] bg-blue-50 p-3 rounded-lg border border-blue-100 italic">
                      L'inosservanza degli obblighi fiscali comporta sanzioni amministrative. Assicurati che i dati siano corretti per la fatturazione elettronica.
                    </p>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(2)}
                    className="flex-1 h-14 rounded-2xl font-black border-[#D2D2D7]"
                  >
                    Indietro
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={loading || !fiscalType || (fiscalType !== 'individual' && !partitaIva)}
                    className="flex-[2] h-14 rounded-2xl bg-[#1D1D1F] text-white font-black group"
                  >
                    {loading ? "Salvataggio..." : "Completa"}
                    {!loading && <CheckCircle2 className="w-5 h-5 ml-2" />}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>


      </div>
    </div>
  );
}
