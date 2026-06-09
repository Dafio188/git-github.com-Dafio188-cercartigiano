import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, ArrowRight, ArrowLeft, Check, Upload, Camera, 
  MapPin, Phone, Mail, User, Briefcase, Building2, 
  Star, Shield, Zap, Image as ImageIcon
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { auth, db } from '../../firebase';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { SERVICE_CATEGORIES, CATEGORY_SERVICES } from '../../constants';

interface GuidedWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

type StepType = 
  | 'category' 
  | 'legal_status' 
  | 'identity' 
  | 'location' 
  | 'contact' 
  | 'services' 
  | 'profile_photo' 
  | 'portfolio' 
  | 'bio' 
  | 'auth'
  | 'success';

export function GuidedWorkerModal({ isOpen, onClose, onComplete }: GuidedWorkerModalProps) {
  const [currentStep, setCurrentStep] = useState<StepType>('category');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Form State
  const [formData, setFormData] = useState({
    category: '',
    legalStatus: 'freelance' as 'freelance' | 'company',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    province: '',
    city: '',
    zone: '',
    selectedServices: [] as string[],
    bio: '',
    profilePhoto: null as string | null,
    portfolioPhotos: [] as string[]
  });

  const steps: StepType[] = [
    'category', 'legal_status', 'identity', 'location', 
    'contact', 'services', 'profile_photo', 'portfolio', 'bio', 'auth', 'success'
  ];

  useEffect(() => {
    const totalSteps = steps.length - 1; // Exclude success
    const currentIndex = steps.indexOf(currentStep);
    setProgress((currentIndex / totalSteps) * 100);
  }, [currentStep]);

  const handleNext = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleGoogleAuth = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const [fName, ...lNames] = (user.displayName || '').split(' ');
      setFormData(prev => ({
        ...prev,
        firstName: prev.firstName || fName || '',
        lastName: prev.lastName || lNames.join(' ') || '',
        email: user.email || '',
      }));

      // If we are at auth step, we can try to finalize
      handleFinalize(user.uid);
    } catch (error) {
      console.error("Worker Google Auth Error:", error);
    }
  };

  const handleFinalize = async (uid?: string) => {
    setLoading(true);
    try {
      let finalUid = uid || auth.currentUser?.uid;

      if (!finalUid && formData.email && formData.password) {
        const userCred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        finalUid = userCred.user.uid;
      }

      if (finalUid) {
        await setDoc(doc(db, 'users', finalUid), {
          id: finalUid,
          nome: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          role: 'worker',
          status: 'active',
          isApproved: true,
          tokens: 100, // Welcome tokens for workers
          createdAt: new Date().toISOString(),
          onboardingComplete: true,
          phone: formData.phone,
          citta: formData.city,
          provincia: formData.province,
          category: formData.category,
          workerDetails: {
            legalStatus: formData.legalStatus,
            bio: formData.bio,
            services: formData.selectedServices,
            profilePhoto: formData.profilePhoto,
            portfolio: formData.portfolioPhotos
          }
        }, { merge: true });

        // Crea il record collegato in workerProfiles
        await setDoc(doc(db, 'workerProfiles', finalUid), {
          userId: finalUid,
          nome: `${formData.firstName} ${formData.lastName}`,
          bio: formData.bio,
          categories: [formData.category],
          hourlyRate: 0,
          radiusKm: 20,
          citta: formData.city,
          provincia: formData.province,
          photoURL: formData.profilePhoto || undefined,
          verifiedFlags: {
            id: false,
            phone: false,
            insurance: false
          },
          badges: [],
          score: 5.0,
          credits: 100,
          isAvailable: true,
          isOnline: true,
          portfolioImages: formData.portfolioPhotos
        });

        // Inizializza un record predefinito in billingProfiles per evitare errori futuri in fatturazione
        await setDoc(doc(db, 'billingProfiles', finalUid), {
          userId: finalUid,
          fiscalType: 'individual',
          codiceFiscale: '',
          address: '',
          cap: '',
          citta: formData.city,
          provincia: formData.province,
          updatedAt: new Date().toISOString()
        });

        setCurrentStep('success');
      }
    } catch (error) {
      console.error("Worker Finalization Error:", error);
      alert("Errore durante la registrazione. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  const renderProgress = () => {
    const mainSteps = [
      { id: 'cat', label: 'Servizio', indices: [0, 5] },
      { id: 'info', label: 'Profilo', indices: [1, 2, 3, 4] },
      { id: 'details', label: 'Dettagli', indices: [6, 7, 8] },
      { id: 'auth', label: 'Account', indices: [9] }
    ];

    const currentIdx = steps.indexOf(currentStep);

    return (
      <div className="w-full mb-12">
        <div className="flex items-center justify-between relative mb-2">
          {mainSteps.map((s, i) => {
            const isActive = s.indices.includes(currentIdx) || s.indices.some(idx => idx < currentIdx);
            const isDotActive = s.indices.some(idx => idx <= currentIdx);
            
            return (
              <div key={s.id} className="flex flex-col items-center relative z-10">
                <div className={`w-3 h-3 rounded-full transition-all duration-500 ${
                  isDotActive ? 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]' : 'bg-[#D2D2D7]'
                }`} />
                <span className={`text-[9px] font-black uppercase tracking-tighter mt-2 ${
                  isDotActive ? 'text-blue-600' : 'text-[#86868B]'
                }`}>
                  {s.label}
                </span>
              </div>
            );
          })}
          {/* Connector Line Base */}
          <div className="absolute top-[5px] left-0 right-0 h-[2px] bg-[#F2F2F7] -z-0" />
          {/* Active Line */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="absolute top-[5px] left-0 h-[2px] bg-blue-600 -z-0"
          />
        </div>
      </div>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'category':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black tracking-tight text-[#1D1D1F] mb-2 uppercase">Cosa sai fare meglio?</h2>
              <p className="text-[#86868B] font-bold">Seleziona la tua categoria principale di lavoro.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SERVICE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setFormData({ ...formData, category: cat.id, selectedServices: [] });
                    handleNext();
                  }}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 group ${
                    formData.category === cat.id 
                      ? 'border-blue-600 bg-blue-50 text-blue-600' 
                      : 'border-[#F2F2F7] bg-white hover:border-blue-200'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                    formData.category === cat.id ? 'bg-blue-600 text-white' : 'bg-[#F2F2F7] text-[#1D1D1F]'
                  }`}>
                    <cat.icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-black tracking-tight text-center leading-tight uppercase">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'legal_status':
        return (
          <div className="space-y-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black tracking-tight text-[#1D1D1F] mb-2 uppercase">Struttura Fiscale</h2>
              <p className="text-[#86868B] font-bold">Sei un'azienda o un libero professionista?</p>
            </div>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => setFormData({ ...formData, legalStatus: 'freelance' })}
                className={`flex items-center gap-6 p-8 rounded-3xl border-2 transition-all group ${
                  formData.legalStatus === 'freelance' 
                    ? 'border-blue-600 bg-blue-50' 
                    : 'border-[#F2F2F7] bg-white hover:border-blue-200'
                }`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                  formData.legalStatus === 'freelance' ? 'bg-blue-600 text-white' : 'bg-[#F2F2F7] text-[#86868B]'
                }`}>
                  <User className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h3 className={`text-xl font-black uppercase ${formData.legalStatus === 'freelance' ? 'text-blue-600' : 'text-[#1D1D1F]'}`}>Libero Professionista</h3>
                  <p className="text-sm font-medium text-[#86868B]">Ditta individuale o lavoratore autonomo.</p>
                </div>
                <div className={`ml-auto w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                  formData.legalStatus === 'freelance' ? 'bg-blue-600 border-blue-600 text-white' : 'border-[#D2D2D7]'
                }`}>
                  {formData.legalStatus === 'freelance' && <Check className="w-5 h-5" />}
                </div>
              </button>

              <button
                onClick={() => setFormData({ ...formData, legalStatus: 'company' })}
                className={`flex items-center gap-6 p-8 rounded-3xl border-2 transition-all group ${
                  formData.legalStatus === 'company' 
                    ? 'border-blue-600 bg-blue-50' 
                    : 'border-[#F2F2F7] bg-white hover:border-blue-200'
                }`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                  formData.legalStatus === 'company' ? 'bg-blue-600 text-white' : 'bg-[#F2F2F7] text-[#86868B]'
                }`}>
                  <Building2 className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h3 className={`text-xl font-black uppercase ${formData.legalStatus === 'company' ? 'text-blue-600' : 'text-[#1D1D1F]'}`}>Azienda / Società</h3>
                  <p className="text-sm font-medium text-[#86868B]">Srl, Sas, Snc o altre forme societarie.</p>
                </div>
                <div className={`ml-auto w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                  formData.legalStatus === 'company' ? 'bg-blue-600 border-blue-600 text-white' : 'border-[#D2D2D7]'
                }`}>
                  {formData.legalStatus === 'company' && <Check className="w-5 h-5" />}
                </div>
              </button>
            </div>
            <div className="pt-8">
              <Button onClick={handleNext} className="w-full h-16 rounded-2xl bg-[#1D1D1F] text-white font-black text-lg">CONTINUA</Button>
            </div>
          </div>
        );

      case 'identity':
        return (
          <div className="space-y-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black tracking-tight text-[#1D1D1F] mb-2 uppercase">Come ti chiami?</h2>
              <p className="text-[#86868B] font-bold">Il tuo nome apparirà sul profilo professionale.</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase text-[#86868B] tracking-widest px-1">Nome</label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Inserisci il tuo nome"
                  className="h-16 rounded-2xl bg-[#F5F5F7] border-none text-lg font-bold px-6 focus:ring-2 focus:ring-blue-600/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase text-[#86868B] tracking-widest px-1">Cognome</label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Inserisci il tuo cognome"
                  className="h-16 rounded-2xl bg-[#F5F5F7] border-none text-lg font-bold px-6 focus:ring-2 focus:ring-blue-600/20"
                />
              </div>
              <div className="p-4 bg-green-50 rounded-2xl flex gap-4 border border-green-100">
                <div className="w-10 h-10 rounded-xl bg-green-600 text-white flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-green-800 leading-relaxed">
                  Le iniziali maiuscole conferiscono un aspetto più professionale al tuo profilo.
                </p>
              </div>
            </div>
            <div className="pt-8 flex gap-3">
              <Button variant="outline" onClick={handleBack} className="h-16 rounded-2xl border-2 border-[#F2F2F7] font-black">INDIETRO</Button>
              <Button 
                onClick={handleNext} 
                disabled={!formData.firstName || !formData.lastName}
                className="flex-1 h-16 rounded-2xl bg-blue-600 text-white font-black text-lg"
              >
                CONTINUA
              </Button>
            </div>
          </div>
        );

      case 'location':
        return (
          <div className="space-y-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black tracking-tight text-[#1D1D1F] mb-2 uppercase">In che zona lavori?</h2>
              <p className="text-[#86868B] font-bold">Ti invieremo richieste dal tuo quartiere e aree vicine.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase text-[#86868B] tracking-widest px-1">Provincia</label>
                <Input
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  placeholder="es. Milano"
                  className="h-16 rounded-2xl bg-[#F5F5F7] border-none text-lg font-bold px-6"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase text-[#86868B] tracking-widest px-1">Città o Comune</label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="es. Sesto San Giovanni"
                  className="h-16 rounded-2xl bg-[#F5F5F7] border-none text-lg font-bold px-6"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase text-[#86868B] tracking-widest px-1">Zona specifica (opzionale)</label>
                <Input
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  placeholder="es. Zona Navigli, hovesto..."
                  className="h-16 rounded-2xl bg-[#F5F5F7] border-none text-lg font-bold px-6"
                />
              </div>
            </div>
            <div className="pt-8 flex gap-3">
              <Button variant="outline" onClick={handleBack} className="h-16 rounded-2xl border-2 border-[#F2F2F7] font-black">INDIETRO</Button>
              <Button 
                onClick={handleNext} 
                disabled={!formData.province || !formData.city}
                className="flex-1 h-16 rounded-2xl bg-blue-600 text-white font-black text-lg"
              >
                CONTINUA
              </Button>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black tracking-tight text-[#1D1D1F] mb-2 uppercase">Contatti Diretti</h2>
              <p className="text-[#86868B] font-bold">I nuovi clienti e il team ti contatteranno qui.</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase text-[#86868B] tracking-widest px-1">Numero di Telefono</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-blue-600">+39</span>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="345 678 9012"
                    className="h-16 rounded-2xl bg-[#F5F5F7] border-none text-lg font-bold pl-16 pr-6"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase text-[#86868B] tracking-widest px-1">Email Professionale</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="la-tua@email.it"
                  className="h-16 rounded-2xl bg-[#F5F5F7] border-none text-lg font-bold px-6"
                />
              </div>
            </div>
            <div className="pt-8 flex gap-3">
              <Button variant="outline" onClick={handleBack} className="h-16 rounded-2xl border-2 border-[#F2F2F7] font-black">INDIETRO</Button>
              <Button 
                onClick={handleNext} 
                disabled={!formData.email}
                className="flex-1 h-16 rounded-2xl bg-blue-600 text-white font-black text-lg"
              >
                CONTINUA
              </Button>
            </div>
          </div>
        );

      case 'services':
        const availableServices = CATEGORY_SERVICES[formData.category] || [
          "Manutenzione Generale",
          "Riparazioni Urgenti",
          "Consulenza tecnica",
          "Installazione standard",
          "Pronto Intervento"
        ];
        
        return (
          <div className="space-y-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black tracking-tight text-[#1D1D1F] mb-2 uppercase">Fornisci altri servizi?</h2>
              <p className="text-[#86868B] font-bold">Ti invieremo opportunità di lavoro per questi servizi.</p>
            </div>
            <div className="space-y-3 h-80 overflow-y-auto pr-4 scrollbar-hide">
              {availableServices.map((service, i) => {
                const isSelected = formData.selectedServices.includes(service);
                return (
                  <button
                    key={i}
                    onClick={() => {
                      const newServices = isSelected 
                        ? formData.selectedServices.filter(s => s !== service)
                        : [...formData.selectedServices, service];
                      setFormData({ ...formData, selectedServices: newServices });
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all group ${
                      isSelected 
                        ? 'border-blue-600 bg-blue-50' 
                        : 'border-[#F2F2F7] bg-[#F9F9FB] hover:border-blue-200'
                    }`}
                  >
                    <span className={`font-bold ${isSelected ? 'text-blue-600' : 'text-[#1D1D1F]'}`}>{service}</span>
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-[#D2D2D7]'
                    }`}>
                      {isSelected && <Check className="w-4 h-4" />}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="pt-8 flex gap-3">
              <Button variant="outline" onClick={handleBack} className="h-16 rounded-2xl border-2 border-[#F2F2F7] font-black">INDIETRO</Button>
              <Button 
                onClick={handleNext} 
                className="flex-1 h-16 rounded-2xl bg-blue-600 text-white font-black text-lg"
              >
                CONTINUA
              </Button>
            </div>
          </div>
        );

      case 'profile_photo':
        return (
          <div className="space-y-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black tracking-tight text-[#1D1D1F] mb-2 uppercase">Foto Profilo</h2>
              <p className="text-[#86868B] font-bold">Usa una foto del viso chiara e frontale.</p>
            </div>
            <div className="flex flex-col items-center gap-8">
              <div className="relative group">
                <div className="w-40 h-40 rounded-[2.5rem] bg-[#F5F5F7] border-4 border-white shadow-xl overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform">
                  {formData.profilePhoto ? (
                    <img src={formData.profilePhoto} className="w-full h-full object-cover" alt="Profile" />
                  ) : (
                    <Camera className="w-12 h-12 text-[#D2D2D7]" />
                  )}
                </div>
                <button className="absolute -bottom-2 -right-2 w-12 h-12 bg-blue-600 text-white rounded-2xl shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
                  <Upload className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3 w-full">
                {[1,2,3].map(i => (
                  <div key={i} className="aspect-square rounded-2xl bg-[#F5F5F7] border-2 border-white shadow-sm overflow-hidden blur-[1px]">
                    <img src={`https://i.pravatar.cc/150?u=e${i}`} alt="Example" className="w-full h-full object-cover opacity-60" />
                  </div>
                ))}
              </div>
              <p className="text-xs font-bold text-[#86868B] text-center px-8">
                Un volto sorridente e ben illuminato aumenta le probabilità di essere scelto del 40%.
              </p>
            </div>
            <div className="pt-8 flex gap-3">
              <Button variant="outline" onClick={handleBack} className="h-16 rounded-2xl border-2 border-[#F2F2F7] font-black">INDIETRO</Button>
              <Button onClick={handleNext} className="flex-1 h-16 rounded-2xl bg-blue-600 text-white font-black text-lg">CONTINUA</Button>
            </div>
          </div>
        );

      case 'portfolio':
        return (
          <div className="space-y-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black tracking-tight text-[#1D1D1F] mb-2 uppercase">I tuoi lavori</h2>
              <p className="text-[#86868B] font-bold">Hai foto di alta qualità dei tuoi lavori precedenti?</p>
            </div>
            <div className="space-y-8">
              <div 
                className="border-4 border-dashed border-[#F2F2F7] rounded-[2.5rem] p-12 flex flex-col items-center justify-center gap-4 hover:border-blue-600/30 hover:bg-blue-50/30 transition-all cursor-pointer group"
                onClick={() => {
                  // Simulate photo selection
                  setFormData({ ...formData, portfolioPhotos: [...formData.portfolioPhotos, `https://images.unsplash.com/photo-1558403194-611308249627?auto=format&fit=crop&q=80&w=400&u=${Date.now()}`] });
                }}
              >
                <div className="w-20 h-20 bg-[#F5F5F7] rounded-3xl flex items-center justify-center text-[#86868B] group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Upload className="w-10 h-10" />
                </div>
                <div className="text-center">
                  <h4 className="text-lg font-black text-[#1D1D1F] mb-1">Aggiungi foto</h4>
                  <p className="text-sm font-bold text-[#86868B]">Carica fino a 5 foto. Massimo 16 MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-3">
                {[0,1,2,3,4].map(i => (
                  <div key={i} className="aspect-square rounded-2xl bg-[#F5F5F7] border border-[#F2F2F7] overflow-hidden flex items-center justify-center relative group">
                    {formData.portfolioPhotos[i] ? (
                      <img src={formData.portfolioPhotos[i]} className="w-full h-full object-cover" alt="Portfolio" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-[#D2D2D7]" />
                    )}
                    {formData.portfolioPhotos[i] && (
                        <button 
                          onClick={() => setFormData({ ...formData, portfolioPhotos: formData.portfolioPhotos.filter((_, idx) => idx !== i)})}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-4 bg-orange-50 rounded-2xl flex gap-4 border border-orange-100">
                <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0">
                  <Star className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-orange-800 leading-relaxed">
                  Avere foto di qualità dei lavori precedenti aiuta a creare fiducia immediata nei potenziali clienti.
                </p>
              </div>
            </div>
            <div className="pt-8 flex gap-3">
              <Button variant="outline" onClick={handleBack} className="h-16 rounded-2xl border-2 border-[#F2F2F7] font-black">INDIETRO</Button>
              <Button onClick={handleNext} className="flex-1 h-16 rounded-2xl bg-blue-600 text-white font-black text-lg">CONTINUA</Button>
            </div>
          </div>
        );

      case 'bio':
        return (
          <div className="space-y-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black tracking-tight text-[#1D1D1F] mb-2 uppercase">Presentati</h2>
              <p className="text-[#86868B] font-bold">Cattura l'attenzione: cosa ti differenzia?</p>
            </div>
            <div className="space-y-4">
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Esempio: Esperto artigiano con 15 anni di esperienza in impianti elettrici civili e industriali. Massima precisione, pulizia e collaudo certificato ad ogni lavoro..."
                className="w-full h-48 rounded-3xl bg-[#F5F5F7] border-none p-6 text-lg font-medium focus:ring-2 focus:ring-blue-600/20 resize-none"
              />
              <div className="p-4 bg-blue-50 rounded-2xl flex gap-4">
                <Shield className="w-6 h-6 text-blue-600 shrink-0" />
                <p className="text-xs font-bold text-blue-800 leading-relaxed">
                  Evita linguaggi troppo tecnici se ti rivolgi a privati. Punta sulla tua affidabilità.
                </p>
              </div>
            </div>
            <div className="pt-8 flex gap-3">
              <Button variant="outline" onClick={handleBack} className="h-16 rounded-2xl border-2 border-[#F2F2F7] font-black">INDIETRO</Button>
              <Button 
                onClick={handleNext} 
                disabled={formData.bio.length < 20}
                className="flex-1 h-16 rounded-2xl bg-blue-600 text-white font-black text-lg"
              >
                ULTIMO PASSO
              </Button>
            </div>
          </div>
        );

      case 'auth':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-600/20">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-black tracking-tight text-[#1D1D1F] mb-2 uppercase">Quasi Fatto!</h2>
              <p className="text-[#86868B] font-bold">Crea il tuo account per accedere alla Dashboard Artigiano.</p>
            </div>
            
            <div className="space-y-4">
              <Button 
                onClick={handleGoogleAuth}
                variant="outline" 
                className="w-full h-16 rounded-2xl border-2 border-[#F2F2F7] font-black flex items-center justify-center gap-3 bg-white hover:bg-[#F5F5F7] transition-all"
              >
                <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                Registrati con Google
              </Button>
              
              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-[1px] bg-[#F2F2F7]" />
                <span className="text-[10px] font-black text-[#D2D2D7] uppercase tracking-widest">oppure email</span>
                <div className="flex-1 h-[1px] bg-[#F2F2F7]" />
              </div>

              {!auth.currentUser && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase text-[#86868B] tracking-widest px-1">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="h-14 rounded-2xl bg-[#F5F5F7] border-none font-bold px-6"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase text-[#86868B] tracking-widest px-1">Password</label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Minimo 6 caratteri"
                      className="h-14 rounded-2xl bg-[#F5F5F7] border-none font-bold px-6"
                    />
                  </div>
                </div>
              )}

              <Button 
                onClick={() => handleFinalize()}
                disabled={loading || (!auth.currentUser && (!formData.email || formData.password.length < 6))}
                className="w-full h-16 rounded-2xl bg-blue-600 text-white font-black text-lg shadow-xl shadow-blue-600/20"
              >
                {loading ? "CREAZIONE IN CORSO..." : "CREA ACCOUNT E FINISCI"}
              </Button>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-8 py-10">
            <div className="relative">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-24 h-24 bg-green-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-green-500/30"
              >
                <Check className="w-12 h-12 text-white" />
              </motion.div>
              <div className="absolute top-0 right-0 w-8 h-8 bg-yellow-400 rounded-full blur-xl animate-pulse" />
            </div>
            <div>
              <h2 className="text-4xl font-black tracking-tight text-[#1D1D1F] mb-4 uppercase">Benvenuto Professionista!</h2>
              <p className="text-xl text-[#86868B] font-bold">Il tuo account è stato creato con successo. <br />Puoi iniziare a ricevere richieste!</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "10", desc: "Token Benvenuto" },
                { label: "100%", desc: "Profilo Visibile" },
                { label: "Gratis", desc: "Primi Contatti" }
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white border border-[#F2F2F7] shadow-sm">
                  <div className="text-blue-600 font-black text-xl mb-1 italic">{item.label}</div>
                  <div className="text-[10px] font-black uppercase text-[#86868B] leading-tight">{item.desc}</div>
                </div>
              ))}
            </div>
            <Button 
              onClick={onComplete}
              className="w-full h-16 rounded-2xl bg-[#1D1D1F] hover:bg-black text-white font-black text-lg transition-transform active:scale-95"
            >
              VAI ALLA DASHBOARD <ArrowRight className="ml-2 w-5 h-5 leading-none" />
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-white/40 backdrop-blur-2xl"
          />
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="relative w-full max-w-2xl h-full sm:h-auto sm:max-h-[90vh] bg-white rounded-none sm:rounded-[2.5rem] shadow-[0_32px_128px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col border border-[#F2F2F7]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#F2F2F7]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <Briefcase className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1D1D1F]">Registrazione Professionista</span>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-[#F5F5F7] hover:bg-[#E5E5EA] transition-colors flex items-center justify-center text-[#1D1D1F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 sm:p-12 scrollbar-hide">
              {currentStep !== 'success' && renderProgress()}
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Fixed Footer for Mobile */}
            <div className="sm:hidden p-6 border-t border-[#F2F2F7] bg-white/80 backdrop-blur-md">
              {/* Contextual buttons could go here for sticky feel */}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
