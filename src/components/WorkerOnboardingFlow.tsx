import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  MapPin, 
  Sparkles, 
  Briefcase, 
  Camera, 
  User as UserIcon,
  Building2,
  Check,
  Shield,
  Star
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { AddressInput } from './AddressInput';
import { SERVICE_CATEGORIES, CATEGORY_SERVICES } from '../constants';
import { db } from '../firebase';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { User, UserProfile, BillingProfile } from '../types';
import { cn } from '../lib/utils';

interface WorkerOnboardingFlowProps {
  user: User;
  onComplete: () => void;
  onCancel: () => void;
}

type OnboardingStep = 
  | 'welcome'
  | 'type' 
  | 'personal' 
  | 'categories' 
  | 'skills'
  | 'location' 
  | 'fiscal' 
  | 'photo' 
  | 'summary'
  | 'success';

export function WorkerOnboardingFlow({ user, onComplete, onCancel }: WorkerOnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [fiscalType, setFiscalType] = useState<'individual' | 'company' | 'freelancer' | null>(null);
  const [nome, setNome] = useState(user.nome || '');
  const [cognome, setCognome] = useState('');
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [address, setAddress] = useState(user.address || '');
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(user.location || null);
  const [citta, setCitta] = useState(user.citta || '');
  const [provincia, setProvincia] = useState(user.provincia || '');
  const [cap, setCap] = useState(user.cap || '');
  const [regione, setRegione] = useState('');
  
  const availableSkills = React.useMemo(() => {
    return selectedCategories.flatMap(catId => {
      const services = CATEGORY_SERVICES[catId] || [];
      return services.map((label: string) => ({
        id: `${catId}_${label.toLowerCase().replace(/\s+/g, '_')}`,
        label,
        category: catId
      }));
    });
  }, [selectedCategories]);

  // Fiscal State
  const [partitaIva, setPartitaIva] = useState('');
  const [codiceFiscale, setCodiceFiscale] = useState('');
  const [ragioneSociale, setRagioneSociale] = useState('');
  const [regimeFiscale, setRegimeFiscale] = useState('forfettario');
  
  // Profile State
  const [bio, setBio] = useState('');
  const [photoURL, setPhotoURL] = useState<string | null>(null);

  const steps: OnboardingStep[] = [
    'welcome', 'type', 'personal', 'categories', 'skills', 'location', 'fiscal', 'photo', 'summary', 'success'
  ];
  
  const currentStepIndex = steps.indexOf(currentStep);
  const progressPercent = Math.round(((currentStepIndex + 1) / steps.length) * 100);

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const toggleSkill = (id: string) => {
    setSelectedSkills(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const finishOnboarding = async () => {
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.id);
      
      // Update basic user info
      await updateDoc(userRef, {
        role: 'worker',
        nome,
        email,
        phone,
        address,
        location,
        citta,
        provincia,
        cap,
        status: 'pending',
        onboardingComplete: true,
        tokens: 10, // Starting tokens
      });

      // Create Billing Profile
      const billingRef = doc(db, 'billingProfiles', user.id);
      const billingData: BillingProfile = {
        userId: user.id,
        fiscalType: fiscalType || 'individual',
        codiceFiscale: codiceFiscale || '',
        partitaIva: partitaIva || undefined,
        ragioneSociale: ragioneSociale || undefined,
        regimeFiscale: regimeFiscale || undefined,
        address,
        cap,
        citta,
        provincia,
        regione: regione || '',
        updatedAt: serverTimestamp()
      };
      await setDoc(billingRef, billingData);

      // Create Worker Profile
      const profileRef = doc(db, 'workerProfiles', user.id);
      const profileData: any = {
        userId: user.id,
        bio: bio || `Professionista specializzato in ${selectedCategories.map(id => SERVICE_CATEGORIES.find(c => c.id === id)?.label).join(', ')}`,
        categories: selectedCategories,
        skills: selectedSkills,
        hourlyRate: 35, // Default hourly rate
        radiusKm: 30,
        citta,
        provincia,
        location: location ? { ...location, address } : undefined,
        photoURL: photoURL || undefined,
        verifiedFlags: {
          id: false,
          phone: !!phone,
          insurance: false
        },
        badges: [],
        score: 5.0,
        credits: 10,
        isAvailable: true,
        isOnline: true,
        termsAcceptedAt: new Date().toISOString()
      };
      await setDoc(profileRef, profileData);

      setCurrentStep('success');
    } catch (error) {
      console.error("Error finalizing worker onboarding:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentStep === 'skills' && availableSkills.length === 0) {
      handleNext();
    }
  }, [currentStep, availableSkills]);

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center py-8"
          >
            <div className="w-32 h-32 bg-blue-600 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-blue-600/20 rotate-6 transition-transform">
              <Briefcase className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-4xl font-black text-[#1D1D1F] tracking-tight mb-4">Benvenuto in CercArtigiano!</h2>
            <p className="text-xl text-[#86868B] font-medium max-w-md mx-auto leading-relaxed mb-12">
              Il tuo account professionale sta per essere creato. Bastano pochi minuti per iniziare a ricevere opportunità di lavoro nella tua zona.
            </p>
            <Button 
              onClick={handleNext}
              className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xl shadow-xl shadow-blue-600/20 transition-all active:scale-95"
            >
              INIZIAMO SUBITO
              <ArrowRight className="ml-3 w-6 h-6" />
            </Button>
          </motion.div>
        );

      case 'type':
        return (
          <div className="space-y-8 py-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-[#1D1D1F] tracking-tight">Sei un'azienda o un libero professionista?</h2>
              <p className="text-[#86868B] font-medium mt-2">Scegli la tua tipologia per configurare correttamente la fatturazione.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'freelancer', label: 'Libero Professionista', icon: UserIcon, desc: 'Lavoro autonomo con Partita IVA' },
                { id: 'company', label: 'Azienda / Ditta', icon: Building2, desc: 'Società, Ditta individuale o Cooperativa' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setFiscalType(item.id as any);
                    handleNext();
                  }}
                  className={`flex flex-col p-8 rounded-[2rem] border-2 text-left transition-all group ${
                    fiscalType === item.id 
                      ? 'border-blue-600 bg-blue-50/50 shadow-lg shadow-blue-600/5' 
                      : 'border-[#F2F2F7] hover:border-blue-600/30 bg-[#FBFBFD]'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all ${
                    fiscalType === item.id ? 'bg-blue-600 text-white' : 'bg-white text-[#1D1D1F] shadow-sm'
                  }`}>
                    <item.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-black text-[#1D1D1F] mb-2">{item.label}</h3>
                  <p className="text-sm text-[#86868B] font-medium leading-relaxed">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 'personal':
        return (
          <div className="space-y-8 py-4">
            <div className="text-center">
              <h2 className="text-3xl font-black text-[#1D1D1F] tracking-tight">Come ti chiami?</h2>
              <p className="text-[#86868B] font-medium mt-2">Questi dati appariranno sul tuo profilo professionale.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#1D1D1F] uppercase tracking-widest pl-1">Nome</label>
                <Input 
                  placeholder="Es. Mario"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="h-16 rounded-2xl bg-[#F5F5F7] border-none text-lg font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#1D1D1F] uppercase tracking-widest pl-1">Cognome</label>
                <Input 
                  placeholder="Es. Rossi"
                  value={cognome}
                  onChange={(e) => setCognome(e.target.value)}
                  className="h-16 rounded-2xl bg-[#F5F5F7] border-none text-lg font-medium"
                />
              </div>
            </div>
             <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-sm text-blue-900 font-medium leading-relaxed">
                <strong>Suggerimento:</strong> Un profilo con nome e cognome reali riceve molti più contatti.
              </p>
            </div>
            <Button 
              onClick={handleNext}
              disabled={!nome || !cognome}
              className="w-full h-16 rounded-2xl bg-[#1D1D1F] text-white font-black text-lg active:scale-95 transition-all mt-4"
            >
              PROCEDI ALLA SELEZIONE SETTORE
            </Button>
          </div>
        );

      case 'categories':
        return (
          <div className="space-y-6 py-4">
            <div className="text-center">
              <h2 className="text-3xl font-black text-[#1D1D1F] tracking-tight">Settore Principale</h2>
              <p className="text-[#86868B] font-medium mt-2">Scegli le macro-categorie in cui operi.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SERVICE_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`flex flex-col items-center p-6 rounded-[2rem] border-2 transition-all ${
                    selectedCategories.includes(cat.id)
                      ? 'border-blue-600 bg-blue-50/50 shadow-inner'
                      : 'border-[#F2F2F7] bg-[#FBFBFD] hover:border-blue-600/20'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform ${
                    selectedCategories.includes(cat.id) ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-500/20' : 'bg-white text-[#1D1D1F] shadow-sm'
                  }`}>
                    <cat.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black text-[#1D1D1F] text-center uppercase tracking-widest leading-tight">{cat.label}</span>
                </button>
              ))}
            </div>
            <Button 
              onClick={handleNext}
              disabled={selectedCategories.length === 0}
              className="w-full h-16 rounded-2xl bg-[#1D1D1F] text-white font-black text-lg shadow-xl shadow-black/10 active:scale-95 transition-all mt-4"
            >
              PROCEDI ALLE COMPETENZE SPECIFICHE
            </Button>
          </div>
        );

      case 'skills':
        return (
          <div className="space-y-6 py-4">
            <div className="text-center">
              <h2 className="text-3xl font-black text-[#1D1D1F] tracking-tight">Competenze Granulari</h2>
              <p className="text-[#86868B] font-medium mt-2">Dichiara le tue specializzazioni per ricevere solo richieste compatibili.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto px-2 custom-scrollbar">
              {availableSkills.map(skill => (
                <button
                  key={skill.id}
                  onClick={() => toggleSkill(skill.id)}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
                    selectedSkills.includes(skill.id)
                      ? 'border-blue-600 bg-blue-50/50 shadow-inner'
                      : 'border-[#F2F2F7] bg-[#FBFBFD] hover:border-blue-600/20'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-[14px] font-bold text-[#1D1D1F]">{skill.label}</span>
                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-tighter">
                      {SERVICE_CATEGORIES.find(c => c.id === skill.category)?.label}
                    </span>
                  </div>
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                    selectedSkills.includes(skill.id) ? 'bg-blue-600 text-white' : 'bg-white border-2 border-[#D2D2D7]'
                  }`}>
                    {selectedSkills.includes(skill.id) && <Check className="w-3 h-3" />}
                  </div>
                </button>
              ))}
            </div>
            
            {/* Sezione Certificazioni */}
            <div className="p-5 bg-white rounded-2xl border border-[#F2F2F7] space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-black uppercase tracking-widest text-[#1D1D1F]">Abilitazioni e Certificati</span>
              </div>
              <p className="text-[11px] text-[#86868B] font-medium">Possiedi certificazioni abilitanti per questo settore? (Es: Di.Co., Patentino F-Gas, etc.)</p>
              <div className="flex gap-2">
                 <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-tight">Dichiaro di essere in regola</button>
              </div>
            </div>

            <Button 
              onClick={handleNext}
              className="w-full h-16 rounded-2xl bg-[#1D1D1F] text-white font-black text-lg shadow-xl shadow-black/10 active:scale-95 transition-all mt-4"
            >
              PROSSIMO: LOGISTICA
            </Button>
          </div>
        );

      case 'location':
        return (
          <div className="space-y-8 py-4">
            <div className="text-center">
              <h2 className="text-3xl font-black text-[#1D1D1F] tracking-tight">Raggio di Azione</h2>
              <p className="text-[#86868B] font-medium mt-2">Indica la tua sede operativa principale.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#1D1D1F] uppercase tracking-widest pl-1">Indirizzo Sede (Cerca con Google Maps)</label>
                <AddressInput 
                  value={address}
                  onChange={(addr, lat, lng, details) => {
                    setAddress(addr);
                    if (lat && lng) setLocation({ lat, lng });
                    if (details) {
                      setCitta(details.city || '');
                      setProvincia(details.province || '');
                      setCap(details.postalCode || '');
                      setRegione(details.region || '');
                      // Pre-fill fiscal data if not set
                      if (!ragioneSociale) setRagioneSociale(`${nome} ${cognome}`);
                    }
                  }}
                  className="h-16 rounded-2xl bg-[#F5F5F7] border-none text-lg font-medium shadow-inner"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#1D1D1F] uppercase tracking-widest pl-1">Città</label>
                  <Input 
                    value={citta}
                    onChange={(e) => setCitta(e.target.value)}
                    className="h-14 rounded-2xl bg-[#F5F5F7] border-none font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#1D1D1F] uppercase tracking-widest pl-1">Provincia</label>
                  <Input 
                    value={provincia}
                    maxLength={2}
                    onChange={(e) => setProvincia(e.target.value.toUpperCase())}
                    className="h-14 rounded-2xl bg-[#F5F5F7] border-none font-medium text-center"
                  />
                </div>
              </div>
            </div>
             <div className="p-5 bg-green-50 rounded-[2rem] border border-green-100 flex gap-4">
              <MapPin className="w-8 h-8 text-green-600 shrink-0" />
              <div>
                <p className="text-sm text-green-900 font-black tracking-tight leading-tight mb-1">Geolocalizzazione Smart</p>
                <p className="text-xs text-green-800 font-medium leading-relaxed">
                  Utilizziamo algoritmi avanzati per connetterti solo con clienti nel raggio di 30km dalla tua sede.
                </p>
              </div>
            </div>
            <Button 
              onClick={handleNext}
              disabled={!citta || !provincia}
              className="w-full h-16 rounded-2xl bg-[#1D1D1F] text-white font-black text-lg shadow-xl shadow-black/10 active:scale-95 transition-all"
            >
              PASSA AI DATI FISCALI
            </Button>
          </div>
        );

      case 'fiscal':
        return (
          <div className="space-y-8 py-4">
             <div className="text-center">
              <h2 className="text-3xl font-black text-[#1D1D1F] tracking-tight">Dati di Fatturazione</h2>
              <p className="text-[#86868B] font-medium mt-2">Configura il tuo profilo fiscale per operare a norma di legge.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#1D1D1F] uppercase tracking-widest pl-1">Ragione Sociale / Nome Ditta</label>
                <Input 
                  placeholder="Es. Rossi Impianti Srl"
                  value={ragioneSociale}
                  onChange={(e) => setRagioneSociale(e.target.value)}
                  className="h-14 rounded-2xl bg-[#F5F5F7] border-none font-medium"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#1D1D1F] uppercase tracking-widest pl-1">Partita IVA</label>
                  <Input 
                    placeholder="11 cifre"
                    value={partitaIva}
                    onChange={(e) => setPartitaIva(e.target.value)}
                    className="h-14 rounded-2xl bg-[#F5F5F7] border-none font-medium tracking-widest"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#1D1D1F] uppercase tracking-widest pl-1">Codice Fiscale</label>
                  <Input 
                    placeholder="Es. RSSMRA..."
                    value={codiceFiscale}
                    onChange={(e) => setCodiceFiscale(e.target.value.toUpperCase())}
                    className="h-14 rounded-2xl bg-[#F5F5F7] border-none font-medium tracking-widest"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#1D1D1F] uppercase tracking-widest pl-1">Regime Fiscale</label>
                <select
                  value={regimeFiscale}
                  onChange={(e) => setRegimeFiscale(e.target.value)}
                  className="w-full h-14 rounded-2xl bg-[#F5F5F7] border-none font-medium px-4 text-[#1D1D1F] focus:ring-2 focus:ring-blue-600 outline-none"
                >
                  <option value="forfettario">Regime Forfettario (L. 190/2014)</option>
                  <option value="ordinario">Regime Ordinario</option>
                  <option value="minimi">Regime dei Minimi</option>
                  <option value="privato">Privato (Senza P.IVA - Ritenuta d'acconto / Autofatturazione)</option>
                  <option value="altro">Altro</option>
                </select>
              </div>
            </div>
            <div className="p-5 bg-amber-50 rounded-[2rem] border border-amber-100 flex gap-4">
              <Shield className="w-8 h-8 text-amber-600 shrink-0" />
              <div>
                <p className="text-sm text-amber-900 font-black tracking-tight leading-tight mb-1">Protezione Legale e Privacy</p>
                <p className="text-xs text-amber-800 font-medium leading-relaxed">
                  Quessi dati sono criptati e visibili solo in fase di fatturazione. I clienti vedranno solo il tuo nome professionale fino all'assegnazione.
                </p>
              </div>
            </div>
            <Button 
              onClick={handleNext}
              disabled={!partitaIva || !codiceFiscale}
              className="w-full h-16 rounded-2xl bg-[#1D1D1F] text-white font-black text-lg shadow-xl shadow-black/10 active:scale-95 transition-all"
            >
              VALUTA E PROCEDI
            </Button>
          </div>
        );

      case 'photo':
        return (
          <div className="space-y-8 py-4">
             <div className="text-center">
              <h2 className="text-3xl font-black text-[#1D1D1F] tracking-tight">Cura la tua Immagine</h2>
              <p className="text-[#86868B] font-medium mt-2">I clienti amano sapere chi entrerà in casa loro.</p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="relative group">
                <div className="w-40 h-40 rounded-[2.5rem] bg-[#F5F5F7] border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
                  {photoURL ? (
                    <img src={photoURL} className="w-full h-full object-cover" alt="Profile" />
                  ) : (
                    <div className="flex flex-col items-center">
                      <UserIcon className="w-16 h-16 text-[#D2D2D7]" />
                      <span className="text-[10px] font-black text-[#D2D2D7] uppercase tracking-widest mt-2">Carica Foto</span>
                    </div>
                  )}
                </div>
                <button className="absolute bottom-[-10px] right-[-10px] bg-blue-600 text-white p-4 rounded-2xl shadow-xl hover:bg-blue-500 transition-all active:scale-90 flex items-center justify-center">
                  <Camera className="w-6 h-6" />
                </button>
              </div>
              <div className="mt-10 flex gap-6 overflow-x-auto pb-4 w-full justify-center">
                {[
                  { img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop', label: 'Chiara' },
                  { img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop', label: 'Professionale' },
                  { img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop', label: 'Frontale' }
                ].map((tip, i) => (
                  <div key={i} className="flex flex-col items-center shrink-0">
                    <img src={tip.img} className="w-14 h-14 rounded-2xl border-2 border-white shadow-md mb-2 group-hover:shadow-lg transition-shadow" alt={tip.label} />
                    <span className="text-[8px] font-black uppercase text-[#86868B] tracking-widest">{tip.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-[#1D1D1F] uppercase tracking-widest pl-1">Bio Professionale</label>
                <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">Opzionale</span>
              </div>
              <textarea 
                placeholder="Es: Sono un elettricista esperto con oltre 10 anni di esperienza in impianti domestici. Puntualità e pulizia sono le mie priorità."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full h-32 p-6 rounded-[2rem] bg-[#F5F5F7] border-none font-medium resize-none focus:ring-2 focus:ring-blue-600/20 transition-all leading-relaxed"
              />
            </div>
            <Button 
              onClick={handleNext}
              className="w-full h-16 rounded-2xl bg-[#1D1D1F] text-white font-black text-lg shadow-xl shadow-black/10 active:scale-95 transition-all"
            >
              VAI AL RIEPILOGO FINALE
            </Button>
          </div>
        );

      case 'summary':
        return (
          <div className="space-y-8 py-4">
             <div className="text-center">
              <h2 className="text-3xl font-black text-[#1D1D1F] tracking-tight">Verifica Finale</h2>
              <p className="text-[#86868B] font-medium mt-2">Valida la tua identità professionale prima di iniziare.</p>
            </div>
            <div className="bg-[#FBFBFD] rounded-[2.5rem] border-2 border-blue-600/10 p-8 space-y-8 shadow-sm">
              <div className="flex items-center gap-6 pb-6 border-b border-[#F2F2F7]">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shrink-0 border border-[#F2F2F7] shadow-sm">
                   {photoURL ? <img src={photoURL} className="w-full h-full object-cover rounded-3xl" alt="Profile" /> : <UserIcon className="w-10 h-10 text-[#D2D2D7]" />}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[#1D1D1F] tracking-tight">{nome} {cognome}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <p className="text-sm text-[#86868B] font-bold">{citta} ({provincia})</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <span className="text-[8px] font-black uppercase text-[#86868B] tracking-widest block mb-2">Settori Abilitati</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedCategories.slice(0, 3).map(id => (
                        <span key={id} className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[9px] font-black uppercase tracking-tighter">
                          {SERVICE_CATEGORIES.find(c => c.id === id)?.label}
                        </span>
                      ))}
                      {selectedCategories.length > 3 && (
                        <span className="px-2 py-1 bg-[#F5F5F7] text-[#86868B] rounded-md text-[9px] font-black">+{selectedCategories.length - 3}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-[8px] font-black uppercase text-[#86868B] tracking-widest block mb-1">Stato Fiscale</span>
                    <p className="text-xs font-bold text-[#1D1D1F]">{fiscalType === 'company' ? 'Azienda Registrata' : 'Libero Professionista'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[8px] font-black uppercase text-[#86868B] tracking-widest block mb-1">Documentazione</span>
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs font-bold">Dati Verificati</span>
                    </div>
                  </div>
                   <div className="p-3 bg-white rounded-xl border border-[#F2F2F7]">
                    <span className="text-[8px] font-black uppercase text-blue-600 tracking-widest block mb-1">Bonus Benvenuto</span>
                    <p className="text-xs font-black text-[#1D1D1F]">10 Crediti GRATIS</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-600/5 rounded-2xl flex items-center gap-4 border border-blue-600/10">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <p className="text-[11px] font-medium text-blue-900 leading-tight">
                  Cliccando su "Completa", dichiari che i dati forniti sono corretti e accetti i <strong>Termini di Servizio</strong> di CercArtigiano.
                </p>
              </div>
            </div>
            
            <Button 
              onClick={finishOnboarding}
              disabled={loading}
              className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xl shadow-2xl shadow-blue-600/30 active:scale-95 transition-all mt-4"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>GENERAZIONE PROFILO...</span>
                </div>
              ) : (
                <>
                  COMPLETA PROCEDURA
                  <ArrowRight className="ml-3 w-6 h-6" />
                </>
              )}
            </Button>
          </div>
        );

      case 'success':
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center py-12"
          >
            <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mb-8 relative">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
                className="bg-green-600 p-6 rounded-full text-white"
              >
                <Check className="w-16 h-16 stroke-[4px]" />
              </motion.div>
              <div className="absolute inset-0 border-4 border-green-600 rounded-full animate-ping opacity-20" />
            </div>
            <h2 className="text-4xl font-black text-[#1D1D1F] tracking-tight mb-4">Benvenuto, {nome}!</h2>
            <p className="text-xl text-[#86868B] font-medium max-w-sm mx-auto leading-relaxed mb-8">
              Il tuo account professionale è stato creato con successo. Ora puoi iniziare a esplorare le opportunità di lavoro.
            </p>
            <div className="w-full bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8 flex gap-4 text-left">
              <Star className="w-10 h-10 text-blue-600 shrink-0 fill-blue-600/20" />
              <div>
                <p className="text-sm font-black text-blue-900 leading-tight mb-1">Hai ricevuto 10 Crediti Bonus!</p>
                <p className="text-xs text-blue-800 font-medium">Usali subito per rispondere alla tua prima richiesta di preventivo.</p>
              </div>
            </div>
            <Button 
              onClick={onComplete}
              className="w-full h-16 rounded-2xl bg-[#1D1D1F] text-white font-black text-xl transition-all active:scale-95 shadow-xl shadow-black/10"
            >
              VAI ALLA DASHBOARD
            </Button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#F5F5F7]"
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="relative w-full h-full md:h-[90vh] md:max-h-[900px] md:max-w-5xl md:bg-white md:rounded-[3.5rem] md:shadow-2xl overflow-hidden flex flex-col md:flex-row"
      >
        {/* Sidebar - Procedure Steps (Desktop) */}
        <div className="hidden md:flex w-72 bg-[#FBFBFD] border-r border-[#F2F2F7] flex-col p-8 space-y-8">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                 <img src="/logo.png" className="w-6 h-6 invert brightness-0" alt="C" />
              </div>
              <div className="flex flex-col">
                 <span className="text-xs font-black text-[#1D1D1F] uppercase tracking-tighter">CercArtigiano</span>
                 <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-none">Professional</span>
              </div>
           </div>

           <div className="space-y-1">
              {[
                { id: 'welcome', label: 'Inizio', icon: Star },
                { id: 'type', label: 'Tipologia', icon: Briefcase },
                { id: 'personal', label: 'Anagrafica', icon: UserIcon },
                { id: 'categories', label: 'Specializzazione', icon: Sparkles },
                { id: 'location', label: 'Area Operativa', icon: MapPin },
                { id: 'fiscal', label: 'Fatturazione', icon: Building2 },
                { id: 'photo', label: 'Profilo', icon: Camera },
                { id: 'summary', label: 'Verifica', icon: Shield }
              ].map((s, idx) => {
                const isCurrent = steps.indexOf(currentStep) === idx;
                const isPast = steps.indexOf(currentStep) > idx;
                return (
                  <div key={idx} className={cn("flex items-center gap-3 p-3 rounded-2xl transition-all", isCurrent ? "bg-white shadow-sm border border-[#D2D2D7]/20" : "opacity-40")}>
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", isCurrent ? "bg-blue-600 text-white" : "bg-[#F5F5F7] text-[#1D1D1F]")}>
                       {isPast ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                    </div>
                    <span className={cn("text-[11px] font-black uppercase tracking-widest", isCurrent ? "text-blue-600" : "text-[#1D1D1F]")}>{s.label}</span>
                  </div>
                );
              })}
           </div>

           <div className="mt-auto p-4 bg-blue-50/50 rounded-[2rem] border border-blue-100/50">
              <p className="text-[10px] text-blue-900 leading-tight font-medium">
                <strong>Hai bisogno di aiuto?</strong><br/>Il nostro supporto è a tua disposizione 24/7 per completare l'onboarding.
              </p>
           </div>
        </div>

        {/* Main Content Pane */}
        <div className="flex-1 flex flex-col min-h-0 bg-white">
          {/* Top Navbar (Mobile / Header) */}
          <div className="flex items-center justify-between px-8 py-6 bg-white shrink-0 border-b border-[#F2F2F7] md:border-none">
            <div className="flex items-center gap-3">
               {currentStep !== 'welcome' && currentStep !== 'success' && (
                 <button 
                   onClick={handleBack}
                   className="p-2 -ml-2 rounded-full hover:bg-[#F5F5F7] text-[#1D1D1F] transition-colors"
                 >
                   <ArrowLeft className="w-6 h-6" />
                 </button>
               )}
               <div className="flex flex-col md:hidden">
                 <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Registrazione Artigiano</span>
                 <span className="text-xs font-bold text-[#86868B]">Passaggio {currentStepIndex + 1} di {steps.length}</span>
               </div>
               <div className="hidden md:flex flex-col">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Passaggio {currentStepIndex + 1}</span>
                  <h4 className="text-sm font-black text-[#1D1D1F] uppercase tracking-tight">{currentStep === 'welcome' ? 'Inizio Procedura' : currentStep === 'type' ? 'Definizione Profilo' : 'Configurazione'}</h4>
               </div>
            </div>
            <button 
              onClick={onCancel}
              className="p-3 -mr-3 rounded-full hover:bg-[#F5F5F7] text-[#86868B] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar (Mobile) */}
          <div className="px-8 shrink-0 md:hidden">
            <div className="w-full h-2 bg-[#F2F2F7] rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className="h-full bg-blue-600 rounded-full"
              />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto px-8 md:px-16 py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="h-full flex flex-col justify-center max-w-xl mx-auto"
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
