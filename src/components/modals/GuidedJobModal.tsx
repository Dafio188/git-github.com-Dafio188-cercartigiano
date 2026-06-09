import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, ArrowLeft, CheckCircle2, MapPin, Sparkles, Briefcase, Info, Shield, Star, MessageSquare, Zap, Clock, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { AddressInput } from '../AddressInput';
import { SERVICE_CATEGORIES } from '../../constants';
import { CATEGORY_FLOWS, DEFAULT_FLOW, CategoryQuestion } from '../../services/questionService';
import { evaluateJobComplexity } from '../../services/aiService';
import { auth, db, storage } from '../../firebase';
import { collection, addDoc, serverTimestamp, setDoc, doc, getDoc, runTransaction } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { Camera, Image as ImageIcon, Trash2, Loader2, Upload } from 'lucide-react';

interface GuidedJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string | null;
  userId?: string;
  onComplete: (jobData: any) => void;
  initialAnswers?: Record<string, any>;
  mappedMessage?: string;
}

const EMPTY_ANSWERS = {};

export function GuidedJobModal({ 
  isOpen, 
  onClose, 
  categoryId: initialCategoryId, 
  userId, 
  onComplete,
  initialAnswers = EMPTY_ANSWERS,
  mappedMessage
}: GuidedJobModalProps) {
  console.log("GuidedJobModal render - isOpen:", isOpen, "initialCategoryId:", initialCategoryId);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(initialCategoryId);
  const [stepHistory, setStepHistory] = useState<number[]>([0]);
  const currentStepIndex = stepHistory[stepHistory.length - 1] || 0;
  const [answers, setAnswers] = useState<Record<string, any>>(initialAnswers);
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPriceRange, setShowPriceRange] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [success, setSuccess] = useState(false);

  const category = SERVICE_CATEGORIES.find(c => c.id === (selectedCategoryId || initialCategoryId));
  const rawBaseFlow = (selectedCategoryId || initialCategoryId) && CATEGORY_FLOWS[selectedCategoryId || initialCategoryId || ''] 
    ? CATEGORY_FLOWS[selectedCategoryId || initialCategoryId || ''] 
    : DEFAULT_FLOW;
  
  const baseFlow = useMemo(() => {
    let flowWithBudget = [...rawBaseFlow];
    if (!flowWithBudget.find(q => q.id === 'budget_range')) {
      const budgetStep: CategoryQuestion = {
        id: 'budget_range',
        type: 'choice',
        title: 'Range di spesa',
        question: 'Qual è il budget indicativo per questo lavoro?',
        description: 'Questo ci aiuta a calcolare lo sforzo per gli artigiani. Pagaranno in Token solo se accetterai il loro preventivo.',
        options: [
          { id: 'small', label: 'Piccolo (Fino a 150€)' },
          { id: 'medium', label: 'Medio (Da 150€ a 500€)' },
          { id: 'large', label: 'Grande (Da 500€ a 2.000€)' },
          { id: 'pro', label: 'Pro (Oltre 2.000€)' }
        ]
      };
      
      const targetIdx = flowWithBudget.findIndex(q => q.type === 'photo' || q.type === 'address');
      if (targetIdx !== -1) {
        flowWithBudget.splice(targetIdx, 0, budgetStep);
      } else {
        flowWithBudget.push(budgetStep);
      }
    }

    if (!flowWithBudget.find(q => q.id === 'is_urgent')) {
      const urgentStep: CategoryQuestion = {
        id: 'is_urgent',
        type: 'choice',
        title: 'Richiesta Urgente',
        question: 'Hai bisogno di un intervento rapido?',
        description: 'Con 5 Token la tua richiesta otterrà la Priorità MASSIMA. Gli artigiani in zona verranno allertati immediatamente per risponderti entro 60 minuti.',
        options: [
          { id: 'no', label: 'No, ho tempi flessibili (Gratis)' },
          { id: 'yes', label: 'Sì, è un\'URGENZA! (Costo: 5 Token)' }
        ]
      };
      
      const contactIdx = flowWithBudget.findIndex(q => q.type === 'contact');
      if (contactIdx !== -1) {
        flowWithBudget.splice(contactIdx, 0, urgentStep);
      } else {
        flowWithBudget.push(urgentStep);
      }
    }

    return flowWithBudget;
  }, [rawBaseFlow]);

  // Per gli utenti già loggati, rimuoviamo lo step dei contatti per evitare sforzi inutili
  const flow = useMemo(() => {
    return auth.currentUser ? baseFlow.filter(q => q.type !== 'contact') : baseFlow;
  }, [baseFlow, auth.currentUser]);

  const currentQuestion = flow[currentStepIndex];

  // Calculate progress percentage
  const progressPercent = currentQuestion ? Math.round(((currentStepIndex + 1) / flow.length) * 100) : 0;

  // Get current price range or use default
  const activePriceRange = React.useMemo(() => {
    if (!currentQuestion) return { min: 60, max: 500 };
    
    // 1. Check if the current question has a priceRange in the selected option
    const currentAnswerId = answers[currentQuestion.id];
    if (currentQuestion.type === 'choice' && currentAnswerId && currentQuestion.options) {
      const selectedOption = currentQuestion.options.find(o => o.id === currentAnswerId);
      if (selectedOption?.priceRange) return selectedOption.priceRange;
    }

    // 2. Look back at previous answers to find the most "impactful" price range (e.g. service type or property size)
    for (let i = currentStepIndex; i >= 0; i--) {
      const q = flow[i];
      const answerId = answers[q.id];
      if (q.type === 'choice' && answerId && q.options) {
        const opt = q.options.find(o => o.id === answerId);
        if (opt?.priceRange) return opt.priceRange;
      }
      if (q.priceRange) return q.priceRange;
    }

    return { min: 60, max: 500 };
  }, [answers, currentQuestion, currentStepIndex, flow]);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedCategoryId(initialCategoryId);
      
      // Pre-fill user data if already logged in
      const currentUser = auth.currentUser;
      const baseAnswers = { ...initialAnswers };

      if (currentUser) {
        baseAnswers.userName = baseAnswers.userName || currentUser.displayName?.split(' ')[0] || '';
        baseAnswers.userSurname = baseAnswers.userSurname || currentUser.displayName?.split(' ').slice(1).join(' ') || '';
        baseAnswers.userEmail = baseAnswers.userEmail || currentUser.email || '';
      }
      
      setAnswers(baseAnswers);
      
      // Importante: settiamo lo stepHistory DOPO aver ricalcolato il flow (se possibile)
      // Ma qui usiamo il flow corrente. Se initialAnswers ha il primo step, saltiamo.
      const firstQuestionId = (initialCategoryId && CATEGORY_FLOWS[initialCategoryId]) 
        ? CATEGORY_FLOWS[initialCategoryId][0]?.id 
        : DEFAULT_FLOW[0]?.id;
        
      if (firstQuestionId && initialAnswers[firstQuestionId]) {
        setStepHistory([1]);
      } else {
        setStepHistory([0]);
      }
      
      setAddress('');
      setLocation(null);
      setLoading(false);
      setShowSummary(false);
      setSuccess(false);
      // Small delay to show price range after opening
      setTimeout(() => setShowPriceRange(true), 500);
    }
  }, [isOpen, initialCategoryId]); // Only re-run when modal opens or initial category changes

  const handleCategorySelect = (id: string) => {
    console.log("GuidedJobModal selecting category:", id);
    setSelectedCategoryId(id);
    setStepHistory([0]);
    setShowSummary(false);
    setAnswers({}); // Reset answers when category changes
  };

  const handleOptionSelect = (optionId: string) => {
    const currentQuestion = flow[currentStepIndex];
    setAnswers({ ...answers, [currentQuestion.id]: optionId });
    
    // Branching Logic: check if option has a nextStepId
    const selectedOption = currentQuestion.options?.find(o => o.id === optionId);
    
    if (selectedOption?.nextStepId) {
      const nextIndex = flow.findIndex(q => q.id === selectedOption.nextStepId);
      if (nextIndex !== -1) {
        setTimeout(() => setStepHistory([...stepHistory, nextIndex]), 300);
        return;
      }
    }

    if (currentStepIndex < flow.length - 1) {
      setTimeout(() => setStepHistory([...stepHistory, currentStepIndex + 1]), 300);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const storageRef = ref(storage, `job_photos/${auth.currentUser?.uid || 'anonymous'}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      const currentPhotos = answers[currentQuestion.id] || [];
      setAnswers({
        ...answers,
        [currentQuestion.id]: [...currentPhotos, downloadURL]
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Errore durante il caricamento dell'immagine.");
    } finally {
      setLoading(false);
    }
  };

  const removePhoto = (urlToRemove: string) => {
    const currentPhotos = answers[currentQuestion.id] || [];
    setAnswers({
      ...answers,
      [currentQuestion.id]: currentPhotos.filter((url: string) => url !== urlToRemove)
    });
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const userCredential = await signInWithPopup(auth, provider);
      
      // Aggiorna answers con i dati di Google se mancanti
      const [fName, ...lNames] = (userCredential.user.displayName || '').split(' ');
      setAnswers(prev => ({
        ...prev,
        userName: prev.userName || fName || '',
        userSurname: prev.userSurname || lNames.join(' ') || '',
        userEmail: prev.userEmail || userCredential.user.email || '',
      }));

      // Se è un nuovo utente o non ha profilo, crealo come client già completato
      const userRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userRef, {
        id: userCredential.user.uid,
        nome: userCredential.user.displayName || 'Utente',
        email: userCredential.user.email || '',
        role: 'client',
        status: 'active',
        isApproved: true,
        createdAt: new Date().toISOString(),
        tokens: 5,
        onboardingComplete: true,
        address,
        location,
        phone: answers.userPhone || null
      }, { merge: true });

      // Inizializza un record predefinito in billingProfiles per evitare errori futuri in fatturazione
      await setDoc(doc(db, 'billingProfiles', userCredential.user.uid), {
        userId: userCredential.user.uid,
        fiscalType: 'individual',
        codiceFiscale: '',
        address: address || '',
        cap: '',
        citta: '',
        provincia: '',
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // Finalizza immediatamente la richiesta
      setTimeout(() => handleFinish(), 500);

    } catch (error) {
      console.error("Google login error in guided flow:", error);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const activeCategoryId = selectedCategoryId || initialCategoryId;
      const firstAnswer = flow[0].type === 'choice' && flow[0].options 
        ? flow[0].options.find(o => o.id === answers[flow[0].id])?.label 
        : answers[flow[0].id];

      const title = `${category?.label}: ${firstAnswer || 'Nuova Richiesta'}`;

      // Calcola il budget sulla base delle risposte e del flow
      let budgetMin = 60;
      let budgetMax = 500;

      // 1. Controlla prima il budget_range selezionato se presente
      const budgetAnswer = answers['budget_range'];
      if (budgetAnswer) {
        if (budgetAnswer === 'small') {
          budgetMin = 50;
          budgetMax = 150;
        } else if (budgetAnswer === 'medium') {
          budgetMin = 150;
          budgetMax = 500;
        } else if (budgetAnswer === 'large') {
          budgetMin = 500;
          budgetMax = 2000;
        } else if (budgetAnswer === 'pro') {
          budgetMin = 2000;
          budgetMax = 10000;
        }
      } else {
        // 2. Se non c'è budget_range (es. è stato saltato), cerca la risposta di tipo 'choice' che contiene un priceRange
        for (let i = flow.length - 1; i >= 0; i--) {
          const q = flow[i];
          const answerId = answers[q.id];
          if (q.type === 'choice' && answerId && q.options) {
            const opt = q.options.find(o => o.id === answerId);
            if (opt?.priceRange) {
              budgetMin = opt.priceRange.min;
              budgetMax = opt.priceRange.max;
              break;
            }
          }
          if (q.priceRange) {
            budgetMin = q.priceRange.min;
            budgetMax = q.priceRange.max;
            break;
          }
        }
      }

      const visitedSteps = Array.from(new Set(stepHistory)).sort((a, b) => a - b);
      const descriptionParts = visitedSteps.map(stepIndex => {
        const q = flow[stepIndex];
        if (!q) return null;
        const answer = answers[q.id];
        if (q.type === 'choice' && q.options) {
          if (answer === undefined || answer === '') return null;
          const opt = q.options.find(o => o.id === answer);
          return `• ${q.question}: **${opt?.label || answer}**`;
        }
        if (q.type === 'address' || q.type === 'contact') return null;
        return `• ${q.question}: ${answer || 'Non specificato'}`;
      }).filter(Boolean);

      const jobData = JSON.parse(JSON.stringify({
        title,
        description: descriptionParts.join('\n'),
        category: activeCategoryId,
        budgetMin,
        budgetMax,
        location: {
          address,
          ...location
        },
        metadata: {
          ...answers,
          userName: answers.userName || '',
          userSurname: answers.userSurname || '',
          userEmail: answers.userEmail || '',
          userPhone: answers.userPhone || null
        },
        status: 'open',
        createdAt: new Date().toISOString()
      }));

      let currentUserId = userId || auth.currentUser?.uid;

      // Se non è loggato ma ha inserito password, proviamo la registrazione rapida
      if (!currentUserId && answers.userPassword) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, answers.userEmail, answers.userPassword);
          await updateProfile(userCredential.user, { 
            displayName: `${answers.userName} ${answers.userSurname}` 
          });
          
          currentUserId = userCredential.user.uid;
          
          // Crea profilo utente nel DB
          await setDoc(doc(db, 'users', currentUserId), {
            id: currentUserId,
            nome: `${answers.userName} ${answers.userSurname}`,
            email: answers.userEmail,
            role: 'client',
            status: 'active',
            isApproved: true,
            createdAt: new Date().toISOString(),
            tokens: 5,
            onboardingComplete: true,
            address: address || null,
            location: location || null,
            phone: answers.userPhone || null
          });

          // Inizializza un record predefinito in billingProfiles per evitare errori futuri in fatturazione
          await setDoc(doc(db, 'billingProfiles', currentUserId), {
            userId: currentUserId,
            fiscalType: 'individual',
            codiceFiscale: '',
            address: address || '',
            cap: '',
            citta: '',
            provincia: '',
            updatedAt: new Date().toISOString()
          });
        } catch (authError: any) {
          console.error("Auth error during guided flow:", authError);
          // Non blocchiamo l'utente se l'account esiste già, magari lo mandiamo al login
          if (authError.code === 'auth/email-already-in-use') {
            alert("Questa email è già registrata. Per favore accedi o usa un'altra email.");
            setLoading(false);
            return;
          }
        }
      }

      // Se è già loggato, aggiorniamo il suo profilo per marcare onboardingComplete se ha fornito address
      if (currentUserId && (address || answers.userPhone)) {
        try {
          await setDoc(doc(db, 'users', currentUserId), {
            onboardingComplete: true,
            address: address || null,
            location: location || null,
            phone: answers.userPhone || null
          }, { merge: true });
        } catch (e) {
          console.warn("Failed to update user onboarding status:", e);
        }
      }

      if (currentUserId) {
        const budgetAnswer = answers['budget_range'];
        let tierTokenCost = 5;
        if (budgetAnswer === 'medium') tierTokenCost = 8;
        if (budgetAnswer === 'large') tierTokenCost = 15;
        if (budgetAnswer === 'pro') tierTokenCost = 25;

        const isUrgentAnswer = answers['is_urgent'];
        let isUrgent = isUrgentAnswer === 'yes';
        const userDocRef = doc(db, 'users', currentUserId);
        const newJobRef = doc(collection(db, 'jobs'));

        if (isUrgent) {
          const userDoc = await getDoc(userDocRef);
          const userTokens = userDoc.exists() ? (userDoc.data().tokens || 0) : 0;
          if (userTokens < 5) {
            const proceed = window.confirm("Non hai abbastanza Token per la richiesta Urgente (richiede 5 Token). Vuoi inviare la richiesta come Standard (Gratis)?\n\n- Premi OK per inviare gratis\n- Premi Annulla per tornare alla richiesta e poter ricaricare tramite la schermata Crediti");
            if (!proceed) {
              setLoading(false);
              return; // Blocca l'invio
            }
            isUrgent = false; // Invio standard
          }
        }

        const jobPayload = {
          ...jobData,
          id: newJobRef.id,
          clientId: currentUserId,
          tokenCost: tierTokenCost,
          isUrgent: isUrgent,
          proposalCount: 0,
          publicationPlan: 'free',
          expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        if (isUrgent) {
          await runTransaction(db, async (transaction) => {
            const userSnap = await transaction.get(userDocRef);
            if (!userSnap.exists()) throw "User does not exist";
            const currentTokens = userSnap.data().tokens || 0;
            if (currentTokens < 5) {
              throw "Not enough tokens";
            }
            transaction.update(userDocRef, { tokens: currentTokens - 5 });
            transaction.set(newJobRef, jobPayload);
          });
        } else {
          await setDoc(newJobRef, jobPayload);
        }
        
        setSuccess(true);
        setTimeout(() => {
          onClose();
          window.dispatchEvent(new CustomEvent('switchTab', { detail: 'jobs' }));
          sessionStorage.removeItem('pending_job_draft');
        }, 2500);
      } else {
        sessionStorage.setItem('pending_job_draft', JSON.stringify(jobData));
        onComplete(jobData);
      }
    } catch (error) {
      console.error("Error finalizing job:", error);
      alert("Si è verificato un errore durante l'invio della richiesta.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    const nextStepIndex = currentStepIndex + 1;
    const nextQuestion = flow[nextStepIndex];

    // Se il prossimo step è 'contact' o siamo alla fine del flusso diagnostico, mostriamo il riepilogo prima
    if (!showSummary && (nextStepIndex === flow.length || (nextQuestion && nextQuestion.type === 'contact'))) {
      setShowSummary(true);
      return;
    }

    if (currentStepIndex < flow.length - 1) {
      setStepHistory([...stepHistory, currentStepIndex + 1]);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (showSummary) {
      setShowSummary(false);
      return;
    }
    if (stepHistory.length > 1) {
      setStepHistory(stepHistory.slice(0, -1));
    } else if (!initialCategoryId && selectedCategoryId) {
      setSelectedCategoryId(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#000000]/60 backdrop-blur-md"
          />
          
          <motion.div 
            key={selectedCategoryId ? 'flow' : 'selection'}
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 40 }}
            className="relative w-full md:h-[85vh] md:max-h-[800px] max-w-5xl bg-white md:rounded-[3rem] shadow-2xl overflow-hidden h-full flex flex-col md:flex-row"
          >
            {!selectedCategoryId ? (
              <div className="flex-1 p-8 lg:p-12 overflow-y-auto">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black text-[#1D1D1F]">Di cosa hai bisogno?</h3>
                  <button onClick={onClose} className="p-3 hover:bg-[#F5F5F7] rounded-full transition-colors">
                    <X className="w-6 h-6 text-[#86868B]" />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-12">
                  {SERVICE_CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log("GuidedJobModal ICON CLICKED:", cat.id);
                          handleCategorySelect(cat.id);
                        }}
                        className="flex flex-col items-center justify-center gap-4 p-6 bg-[#FBFBFD] border-2 border-[#F2F2F7] rounded-[2rem] hover:border-blue-600 hover:bg-white transition-all group cursor-pointer relative z-20"
                      >
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#1D1D1F] group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                        <cat.icon className="w-8 h-8" />
                      </div>
                      <span className="text-xs font-black text-[#1D1D1F] text-center uppercase tracking-widest leading-tight">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Procedure Sidebar (Desktop) */}
                <div className="hidden md:flex w-72 bg-[#FBFBFD] border-r border-[#F2F2F7] flex-col p-8 space-y-12 shrink-0">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-[#1D1D1F] rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-black/10 border border-white/10 shrink-0">
                        <img src="/logo.png" className="w-8 h-8 invert" alt="C" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                       <h2 className="text-[14px] font-black text-[#1D1D1F] uppercase tracking-tighter leading-none">CercArtigiano</h2>
                       <span className="text-[9px] font-bold text-[#86868B] uppercase tracking-[0.25em] leading-none opacity-50">Smart Request</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {[
                      { label: 'Dettagli', icon: Info },
                      { label: 'Intervento', icon: Zap },
                      { label: 'Urgenza', icon: Clock },
                      { label: 'Posizione', icon: MapPin },
                      { label: 'Contatto', icon: MessageSquare }
                    ].map((s, idx) => {
                      const isCurrent = currentStepIndex >= idx || showSummary;
                      return (
                        <div key={idx} className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${isCurrent ? "bg-white shadow-sm border border-[#D2D2D7]/20" : "opacity-30"}`}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCurrent ? "bg-blue-600 text-white" : "bg-[#F5F5F7] text-[#1D1D1F]"}`}>
                             <s.icon className="w-4 h-4" />
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${isCurrent ? "text-blue-600" : "text-[#1D1D1F]"}`}>{s.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-auto">
                    <div className="p-5 bg-white rounded-2xl border border-[#F2F2F7] shadow-sm">
                       <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-4 h-4 text-green-600" />
                          <span className="text-[10px] font-black text-[#1D1D1F] uppercase tracking-widest">Garanzia Safe</span>
                       </div>
                       <p className="text-[9px] text-[#86868B] font-medium leading-relaxed">
                          Riceverai fino a 5 preventivi gratuiti. La tua privacy è protetta dai nostri protocolli di sicurezza.
                       </p>
                    </div>
                  </div>
                </div>

                {/* Main Content Pane */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="bg-white border-b border-[#F2F2F7] md:border-none z-10 p-6 md:px-12 md:pt-16 md:pb-8 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <button 
                    onClick={handleBack} 
                    className={`p-3 -ml-2 rounded-full hover:bg-[#F5F5F7] transition-all active:scale-95 ${currentStepIndex === 0 && !selectedCategoryId ? 'invisible' : ''}`}
                  >
                    <ArrowLeft className="w-6 h-6 text-[#1D1D1F]" />
                  </button>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-black text-primary uppercase tracking-[0.2em] opacity-80">
                      {showSummary ? 'Revisione' : `${progressPercent}% completato`}
                    </span>
                    <h4 className="text-xl font-black text-[#1D1D1F] uppercase tracking-tight leading-none">
                      {showSummary ? 'Riepilogo Richiesta' : category?.label}
                    </h4>
                  </div>
                </div>
                <button onClick={onClose} className="p-3 -mr-2 rounded-full hover:bg-[#F5F5F7] transition-all active:scale-95">
                  <X className="w-6 h-6 text-[#86868B]" />
                </button>
              </div>

              {/* Progress & Price Bar */}
              {!showSummary && !success && (
                <div className="flex flex-col gap-3">
                  <div className="w-full h-1.5 bg-[#F2F2F7] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-[#86868B] uppercase tracking-widest">Fascia di prezzo:</span>
                      <motion.span 
                        key={`${activePriceRange.min}-${activePriceRange.max}`}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[11px] font-black text-[#1D1D1F] uppercase tracking-widest"
                      >
                        {activePriceRange.min} € - {activePriceRange.max} €
                      </motion.span>
                    </div>
                    {mappedMessage && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full">
                        <Sparkles className="w-2.5 h-2.5 text-blue-600" />
                        <span className="text-[9px] font-black text-blue-700 uppercase tracking-widest">{mappedMessage}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Progress Bar */}
            <div className="px-6 md:hidden">
              <div className="w-full h-1 bg-[#F2F2F7] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 md:px-16 py-16 md:py-24">
              <div className="max-w-xl mx-auto h-full flex flex-col pt-8 md:pt-16">
                <AnimatePresence mode="wait">
                  {success ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="flex flex-col items-center justify-center text-center space-y-10 py-12"
                    >
                      <div className="relative">
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", damping: 12, delay: 0.2 }}
                          className="w-32 h-32 bg-green-500 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-green-500/40 relative z-10"
                        >
                          <CheckCircle2 className="w-16 h-16 text-white" />
                        </motion.div>
                        <motion.div 
                           animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
                           transition={{ repeat: Infinity, duration: 2 }}
                           className="absolute inset-0 bg-green-500 rounded-[2.5rem] blur-2xl"
                        />
                      </div>
                      <div className="space-y-4">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[#1D1D1F]">
                          Richiesta Inviata!
                        </h2>
                        <p className="text-xl text-[#86868B] font-medium max-w-sm mx-auto leading-relaxed">
                          Stiamo notificando i migliori artigiani. Sarai ricontattato a breve.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-[#F5F5F7] rounded-full">
                         <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                         <span className="text-[10px] font-black text-[#86868B] uppercase tracking-widest">Ti portiamo nella tua dashboard...</span>
                      </div>
                    </motion.div>
                  ) : showSummary ? (
                    <motion.div
                      key="summary"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex-1"
                    >
                      <div className="mb-10">
                        <h2 className="text-3xl md:text-4xl font-black text-[#1D1D1F] tracking-tight mb-4 leading-[1.1]">
                          Verifichiamo i dettagli?
                        </h2>
                        <p className="text-lg text-[#86868B] font-medium leading-relaxed">
                          Ecco un riepilogo delle informazioni che hai fornito. Se tutto è corretto, passeremo all'invio.
                        </p>
                      </div>

                      <div className="space-y-3">
                        {flow.filter(q => q.type !== 'contact' && answers[q.id]).map((q, idx) => {
                          const answerId = answers[q.id];
                          const selectedOption = q.options?.find(o => o.id === answerId);
                          const Icon = selectedOption?.icon || q.icon || MessageSquare;
                          
                          return (
                            <motion.div
                              key={q.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="group p-5 bg-[#FBFBFD] border border-[#F2F2F7] rounded-3xl hover:border-primary/30 transition-all flex items-center justify-between"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-[#F2F2F7] text-[#1D1D1F]">
                                  <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="text-[10px] font-black text-[#86868B] uppercase tracking-widest">{q.title || "Domanda"}</p>
                                  <p className="text-sm font-bold text-[#1D1D1F]">{selectedOption?.label || answerId}</p>
                                </div>
                              </div>
                              <button 
                                onClick={() => {
                                  const stepIndex = flow.findIndex(step => step.id === q.id);
                                  if (stepIndex !== -1) {
                                    setStepHistory([...stepHistory, stepIndex]);
                                    setShowSummary(false);
                                  }
                                }}
                                className="px-4 py-2 text-[10px] font-black text-primary uppercase tracking-widest hover:bg-primary/5 rounded-full transition-colors"
                              >
                                Modifica
                              </button>
                            </motion.div>
                          );
                        })}

                        {address && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-5 bg-[#FBFBFD] border border-[#F2F2F7] rounded-3xl flex items-center justify-between"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-[#F2F2F7] text-[#1D1D1F]">
                                <MapPin className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-[#86868B] uppercase tracking-widest">Posizione</p>
                                <p className="text-sm font-bold text-[#1D1D1F] truncate max-w-[200px]">{address}</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => {
                                const stepIndex = flow.findIndex(step => step.type === 'address');
                                if (stepIndex !== -1) {
                                  setStepHistory([...stepHistory, stepIndex]);
                                  setShowSummary(false);
                                }
                              }}
                              className="px-4 py-2 text-[10px] font-black text-primary uppercase tracking-widest hover:bg-primary/5 rounded-full"
                            >
                              Modifica
                            </button>
                          </motion.div>
                        )}
                      </div>

                      <div className="mt-10 p-6 bg-blue-50 rounded-[2rem] border border-blue-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                          <Check className="w-6 h-6 text-blue-600" />
                        </div>
                        <p className="text-sm text-blue-900 font-bold leading-tight">
                          Tutto corretto? Clicca sul tasto sotto per procedere all'ultimo passaggio.
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={currentQuestion.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="flex-1"
                  >
                    <div className="mb-10">
                      <h2 className="text-3xl md:text-4xl font-black text-[#1D1D1F] tracking-tight mb-4 leading-[1.1]">
                        {currentQuestion.question}
                      </h2>
                      {currentQuestion.description && (
                        <p className="text-lg text-[#86868B] font-medium leading-relaxed">
                          {currentQuestion.description}
                        </p>
                      )}
                    </div>

                    <div className="space-y-4">
                      {currentQuestion.type === 'choice' && currentQuestion.options && (
                        <div className="grid grid-cols-1 gap-3">
                          {currentQuestion.options.map((option) => (
                            <motion.button
                              key={option.id}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => handleOptionSelect(option.id)}
                              className={`w-full flex items-center justify-between p-6 rounded-[2rem] border-2 text-left transition-all group ${
                                answers[currentQuestion.id] === option.id 
                                  ? 'border-primary bg-primary/5 shadow-sm' 
                                  : 'border-[#F2F2F7] hover:border-primary/40 bg-[#FBFBFD]'
                              }`}
                            >
                              <div className="flex items-center gap-5">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                                  answers[currentQuestion.id] === option.id 
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                    : 'bg-white text-[#1D1D1F] shadow-sm'
                                }`}>
                                  {option.icon ? <option.icon className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
                                </div>
                                <div>
                                  <p className="text-lg font-black text-[#1D1D1F] leading-tight">{option.label}</p>
                                  {option.description && (
                                    <p className="text-xs text-[#86868B] font-medium mt-1">{option.description}</p>
                                  )}
                                </div>
                              </div>
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                answers[currentQuestion.id] === option.id 
                                  ? 'bg-primary border-primary' 
                                  : 'border-[#D2D2D7]'
                              }`}>
                                {answers[currentQuestion.id] === option.id && <Check className="w-3 h-3 text-white" />}
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      )}

                      {currentQuestion.type === 'text' && (
                        <div className="space-y-6">
                          <textarea
                            autoFocus
                            value={answers[currentQuestion.id] || ''}
                            onChange={(e) => setAnswers({...answers, [currentQuestion.id]: e.target.value})}
                            placeholder={currentQuestion.placeholder || "Descrivi qui i dettagli del lavoro..."}
                            className="w-full min-h-[180px] p-8 rounded-[2.5rem] bg-[#F5F5F7] border-none text-lg font-medium focus:ring-2 focus:ring-blue-600/10 outline-none resize-none shadow-inner leading-relaxed"
                          />
                          {currentQuestion.tip && (
                            <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100 flex gap-4">
                              <Sparkles className="w-6 h-6 text-blue-600 shrink-0" />
                              <p className="text-sm text-blue-900 font-medium leading-relaxed">
                                <strong>Consiglio dell'esperto:</strong> {currentQuestion.tip}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {currentQuestion.type === 'photo' && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {(answers[currentQuestion.id] || []).map((url: string, i: number) => (
                              <div key={i} className="relative aspect-square rounded-[2rem] overflow-hidden group border-2 border-[#F2F2F7] bg-[#FBFBFD]">
                                <img src={url} className="w-full h-full object-cover" alt={`Upload ${i}`} />
                                <button 
                                  onClick={() => removePhoto(url)}
                                  className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-500 shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            <label className="aspect-square rounded-[2rem] border-2 border-dashed border-[#D2D2D7] hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer group">
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={handleFileUpload}
                                disabled={loading}
                              />
                              {loading ? (
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                              ) : (
                                <>
                                  <div className="w-12 h-12 bg-[#F5F5F7] rounded-2xl flex items-center justify-center text-[#1D1D1F] group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                    <Camera className="w-6 h-6" />
                                  </div>
                                  <span className="text-[10px] font-black text-[#86868B] uppercase tracking-widest group-hover:text-primary transition-colors">Aggiungi Foto</span>
                                </>
                              )}
                            </label>
                          </div>
                          
                          <div className="p-6 bg-[#FBFBFD] border border-[#F2F2F7] rounded-[2rem] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <ImageIcon className="w-5 h-5 text-[#86868B]" />
                              <span className="text-sm text-[#86868B] font-medium">
                                {(answers[currentQuestion.id] || []).length} foto caricate
                              </span>
                            </div>
                            <Button 
                              variant="ghost" 
                              onClick={handleNext}
                              className="text-[10px] font-black text-primary uppercase tracking-widest"
                            >
                              Salta passaggio
                            </Button>
                          </div>
                        </div>
                      )}

                      {currentQuestion.type === 'address' && (
                        <div className="space-y-6">
                           <div className="relative group">
                            <AddressInput 
                              value={address}
                              onChange={(addr, lat, lng) => {
                                setAddress(addr);
                                if (lat && lng) setLocation({ lat, lng });
                              }}
                              className="h-20 rounded-[2rem] bg-[#F5F5F7] border-none text-lg font-medium shadow-inner pl-12"
                            />
                           </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="p-6 bg-[#FBFBFD] border border-[#F2F2F7] rounded-3xl flex flex-col items-center text-center">
                                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                                   <MapPin className="w-5 h-5 text-blue-600" />
                                </div>
                                <span className="text-[10px] font-black text-[#1D1D1F] uppercase tracking-widest">Località</span>
                                <p className="text-xs text-[#86868B] font-bold mt-1">Intervento a domicilio</p>
                             </div>
                             <div className="p-6 bg-[#FBFBFD] border border-[#F2F2F7] rounded-3xl flex flex-col items-center text-center">
                                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mb-3">
                                   <Shield className="w-5 h-5 text-green-600" />
                                </div>
                                <span className="text-[10px] font-black text-[#1D1D1F] uppercase tracking-widest">Sicurezza</span>
                                <p className="text-xs text-[#86868B] font-bold mt-1">Sopralluogo Protetto</p>
                             </div>
                          </div>
                        </div>
                      )}

                      {currentQuestion.type === 'contact' && (
                        <div className="space-y-6">
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#1D1D1F] uppercase tracking-widest pl-1">Nome</label>
                                <Input 
                                  placeholder="Es: Mario"
                                  value={answers.userName || ''}
                                  onChange={(e) => setAnswers({...answers, userName: e.target.value})}
                                  className="h-14 rounded-2xl bg-[#F5F5F7] shadow-inner border-none font-medium text-lg"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#1D1D1F] uppercase tracking-widest pl-1">Cognome</label>
                                <Input 
                                  placeholder="Es: Rossi"
                                  value={answers.userSurname || ''}
                                  onChange={(e) => setAnswers({...answers, userSurname: e.target.value})}
                                  className="h-14 rounded-2xl bg-[#F5F5F7] shadow-inner border-none font-medium text-lg"
                                />
                              </div>
                           </div>
                           
                           <div className="p-4 bg-green-50 rounded-2xl flex gap-3 border border-green-100">
                              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                              <p className="text-[11px] text-green-800 font-medium leading-relaxed">
                                Le iniziali del nome e del cognome in maiuscolo conferiscono un aspetto più professionale della richiesta.
                              </p>
                           </div>

                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-[#1D1D1F] uppercase tracking-widest pl-1">Email di Contatto</label>
                              <Input 
                                type="email"
                                placeholder="mario.rossi@esempio.it"
                                value={answers.userEmail || ''}
                                onChange={(e) => setAnswers({...answers, userEmail: e.target.value})}
                                className="h-14 rounded-2xl bg-[#F5F5F7] shadow-inner border-none font-medium text-lg"
                              />
                           </div>

                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-[#1D1D1F] uppercase tracking-widest pl-1">Numero di Telefono</label>
                              <div className="flex gap-2">
                                <div className="w-24 h-14 rounded-2xl bg-[#F5F5F7] flex items-center justify-center gap-2 border-none shadow-inner group">
                                  <img src="https://flagcdn.com/w20/it.png" className="w-5 h-auto rounded-xs" alt="IT" />
                                  <span className="font-bold text-sm">+39</span>
                                </div>
                                <Input 
                                  placeholder="312 345 6789"
                                  value={answers.userPhone || ''}
                                  onChange={(e) => setAnswers({...answers, userPhone: e.target.value})}
                                  className="h-14 flex-1 rounded-2xl bg-[#F5F5F7] shadow-inner border-none font-medium text-lg"
                                />
                              </div>
                           </div>

                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-[#1D1D1F] uppercase tracking-widest pl-1">Password Account</label>
                              <Input 
                                type="password"
                                placeholder="••••••••"
                                value={answers.userPassword || ''}
                                onChange={(e) => setAnswers({...answers, userPassword: e.target.value})}
                                className="h-14 rounded-2xl bg-[#F5F5F7] shadow-inner border-none font-medium text-lg"
                              />
                           </div>

                           <div className="relative py-4 flex items-center gap-4">
                             <div className="flex-1 h-[1px] bg-[#F2F2F7]"></div>
                             <span className="text-[10px] font-black text-[#86868B] uppercase tracking-widest">oppure</span>
                             <div className="flex-1 h-[1px] bg-[#F2F2F7]"></div>
                           </div>

                           <Button 
                             onClick={handleGoogleLogin} 
                             variant="outline" 
                             className="w-full h-14 rounded-2xl border-2 border-[#D2D2D7]/50 font-black gap-3 group bg-white hover:bg-[#F5F5F7] transition-all"
                           >
                             <img src="https://www.google.com/favicon.ico" className="w-5 h-5 group-hover:scale-110 transition-transform" alt="Google" />
                             Registrati con Google
                           </Button>

                           <div className="p-6 bg-primary rounded-[2rem] text-white flex gap-5 shadow-xl shadow-primary/20 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 border border-white/20">
                                 <Star className="w-6 h-6 text-white" />
                              </div>
                              <div className="space-y-1">
                                <h5 className="text-sm font-black uppercase tracking-widest">Accesso Protetto</h5>
                                <p className="text-xs font-medium leading-relaxed text-blue-50">
                                  Creeremo un account sicuro per te dove potrai confrontare i preventivi, chattare con gli artigiani e gestire i tuoi interventi.
                                </p>
                              </div>
                           </div>

                           <p className="text-[10px] text-[#86868B] text-center px-4 leading-relaxed mt-4">
                             Cliccando su <strong>Invia richiesta</strong>, accetti i nostri <a href="#" className="text-primary font-bold underline decoration-2 underline-offset-2">Termini e condizioni</a> e la <a href="#" className="text-primary font-bold underline decoration-2 underline-offset-2">Privacy Policy</a>.
                             <br />Questo sito è protetto da reCAPTCHA.
                           </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

                {/* Footer Actions */}
                {!success && (
                  <div className="mt-12 flex flex-col items-center space-y-6">
                    {activePriceRange && (
                       <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-xl flex items-center justify-between px-6 py-4 bg-primary/5 rounded-2xl border border-primary/10"
                       >
                          <span className="text-[10px] font-black text-primary uppercase tracking-widest">Fascia di prezzo stimata:</span>
                          <span className="text-sm font-black text-primary tracking-tight">€{activePriceRange.min} - €{activePriceRange.max}</span>
                       </motion.div>
                    )}

                    <Button
                      onClick={() => {
                        if (showSummary) {
                          // Se siamo nel riepilogo e non ci sono step contact (user loggato), finish
                          // Altrimenti vai al prossimo step (che sarà contact)
                          if (currentStepIndex < flow.length - 1) {
                            setStepHistory([...stepHistory, currentStepIndex + 1]);
                            setShowSummary(false);
                          } else {
                            handleFinish();
                          }
                        } else {
                          handleNext();
                        }
                      }}
                      disabled={
                        loading ||
                        (!showSummary && (
                          (currentQuestion.type === 'text' && !answers[currentQuestion.id]) ||
                          (currentQuestion.type === 'address' && !address) ||
                          (currentQuestion.type === 'contact' && !auth.currentUser && (!answers.userName || !answers.userEmail || !answers.userPassword || answers.userPassword.length < 6))
                        ))
                      }
                      className="w-full max-w-xl h-16 rounded-2xl bg-[#1D1D1F] hover:bg-black text-white font-black text-lg shadow-xl shadow-black/10 active:scale-95 transition-all flex items-center justify-center gap-3 border-none"
                    >
                      {loading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          {showSummary 
                            ? (currentStepIndex === flow.length - 1 ? 'CONFERMA E INVIA' : 'CONFERMA E PROSEGUI')
                            : (currentStepIndex === flow.length - 1 ? 'INVIA RICHIESTA ORA' : 'CONTINUA')}
                          <ArrowRight className="w-6 h-6" />
                        </>
                      )}
                    </Button>
                    
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  </div>
)}
</AnimatePresence>
);
}
