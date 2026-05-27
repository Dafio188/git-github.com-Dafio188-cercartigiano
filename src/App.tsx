import React, { useState, useEffect } from 'react'; // Sync for Shared Chat fix, public assets, and deploy fix, github rollback
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, updateDoc, collection, addDoc, serverTimestamp, query, where, setDoc, getDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './lib/firestore-errors';
import { evaluateJobComplexity } from './services/aiService';
import { Auth } from './components/Auth';
import { Sidebar } from './components/Sidebar';
import { ClientDashboard } from './components/dashboards/ClientDashboard';
import { WorkerDashboard } from './components/dashboards/WorkerDashboard';
import { LandingPage } from './components/LandingPage';
import { ProfileView } from './components/ProfileView';
import { SettingsView } from './components/SettingsView';
import { CreditsView } from './components/CreditsView';
import { SubscriptionsView } from './components/SubscriptionsView';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { PrivacyBanner } from './components/PrivacyBanner';
import { GeneralInfo } from './components/GeneralInfo';
import { CareersPage } from './components/CareersPage';
import { CategoriesPage } from './components/CategoriesPage';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';
import { CookiePolicy } from './components/CookiePolicy';
import { NotificationsModal } from './components/modals/NotificationsModal';
import { GuidedJobModal } from './components/modals/GuidedJobModal';
import { GuidedWorkerModal } from './components/modals/GuidedWorkerModal';
import { MobileTabBar } from './components/navigation/MobileTabBar';
import { Onboarding } from './components/Onboarding';
import { User, UserProfile } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Search as SearchIcon,
  Home,
  MessageSquare,
  User as UserIcon,
  Briefcase,
  CheckCircle2
} from 'lucide-react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { ScrollArea } from './components/ui/scroll-area';
import { cn } from './lib/utils';
import { BrandLogo } from './components/BrandLogo';

import { Helmet } from 'react-helmet-async';
import { Routes, Route, useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { SeoLandingPage } from './components/SeoLandingPage';

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "CercArtigiano",
  "url": "https://cercartigiano.com",
  "logo": "https://cercartigiano.com/logo.png",
  "description": "Piattaforma premium per trovare artigiani e professionisti qualificati in tutta Italia.",
  "sameAs": [
    "https://www.facebook.com/cercartigiano",
    "https://www.instagram.com/cercartigiano",
    "https://twitter.com/cercartigiano"
  ]
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Come funziona CercArtigiano?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "CercArtigiano ti permette di scattare una foto o descrivere a voce un guasto per connetterti in pochi secondi con i esperti qualificati della tua zona."
      }
    },
    {
      "@type": "Question",
      "name": "Il servizio di richiesta preventivo è gratuito?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sì, il servizio è completamente gratuito e senza alcun tipo di vincolo per chiunque ricerchi un artigiano qualificato."
      }
    },
    {
      "@type": "Question",
      "name": "Come vengono verificati gli artigiani?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Verifichiamo costantemente la validità delle Partite IVA e la documentazione d'identità dei professionisti iscritti per promuovere una rete d'eccellenza affidabile al 100%."
      }
    },
    {
      "@type": "Question",
      "name": "Quali categorie di servizi sono disponibili?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "La piattaforma ospita oltre 25 categorie di esperti, tra cui idraulici, elettricisti, imbianchini, sarti, tecnici informatici, falegnami e professionisti della cura della persona."
      }
    }
  ]
};

const getJsonLdSchema = (user: any, showCategories: boolean, activeTab: string) => {
  if (!user && !showCategories && activeTab === 'home') {
    return [organizationSchema, faqSchema];
  }
  if (activeTab === 'search' || showCategories) {
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Categorie Artigiani - CercArtigiano",
      "description": "Tutte le categorie di professionisti e artigiani disponibili sula piattaforma.",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Idraulico", "url": "https://cercartigiano.com/search?category=plumbing" },
        { "@type": "ListItem", "position": 2, "name": "Elettricista", "url": "https://cercartigiano.com/search?category=electrical" },
        { "@type": "ListItem", "position": 3, "name": "Tecnico Informatico", "url": "https://cercartigiano.com/search?category=it_support" },
        { "@type": "ListItem", "position": 4, "name": "Imbianchino", "url": "https://cercartigiano.com/search?category=painter" }
      ]
    };
  }
  return organizationSchema;
};

interface AppSeoProps {
  title: string;
  description: string;
  urlPath?: string;
  robots?: 'index, follow' | 'noindex, nofollow';
  schema?: any;
}

export function AppSeo({ title, description, urlPath = '', robots = 'index, follow', schema }: AppSeoProps) {
  const fullUrl = `https://cercartigiano.com${urlPath}`;
  const defaultImage = "https://cercartigiano.com/Foto_homepage.png";
  
  // Clean clean page title for breadcrumb
  const pageTitleClean = title.split('|')[0].trim();

  // Create breadcrumb list
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://cercartigiano.com"
      },
      ...(urlPath && urlPath !== '/' ? [{
        "@type": "ListItem",
        "position": 2,
        "name": pageTitleClean,
        "item": fullUrl
      }] : [])
    ]
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={defaultImage} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={defaultImage} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
      {schema && (
        <script type="application/ld+json">
          {Array.isArray(schema) ? JSON.stringify(schema) : JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [showInfo, setShowInfo] = useState(false);
  const [showCareers, setShowCareers] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showCookies, setShowCookies] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingCategoryId, setPendingCategoryId] = useState<string | null>(null);
  const [pendingJobDraft, setPendingJobDraft] = useState<any | null>(null);
  const [pendingWorkerRegistration, setPendingWorkerRegistration] = useState(false);
  const [showGuidedJobModal, setShowGuidedJobModal] = useState(false);
  const [guidedJobInitialAnswers, setGuidedJobInitialAnswers] = useState<Record<string, any>>({});
  const [guidedJobMappedMessage, setGuidedJobMappedMessage] = useState<string | undefined>();
  const [showGuidedWorkerModal, setShowGuidedWorkerModal] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const savedDraft = sessionStorage.getItem('pending_job_draft');
    if (savedDraft) {
      try {
        setPendingJobDraft(JSON.parse(savedDraft));
        console.log("Recovered job draft from session storage");
      } catch (e) {
        console.error("Failed to parse saved draft", e);
      }
    }
  }, []);

  useEffect(() => {
    const action = searchParams.get('action');
    const category = searchParams.get('category');
    const city = searchParams.get('city');

    if (action === 'new_job' && category) {
      setPendingCategoryId(category);
      setShowGuidedJobModal(true);
      
      if (city) {
        setGuidedJobInitialAnswers(prev => ({
          ...prev, 
          address: city 
        }));
      }
      
      // Clear URL params without reloading the page
      setSearchParams(new URLSearchParams());
    }
  }, [searchParams, setSearchParams]);

  // Handler for mobile navigation in landing page
  const handleLandingTabChange = (tabId: string) => {
    if (tabId === 'explore') {
      setShowCategories(true);
      setShowCareers(false);
      setShowInfo(false);
      setShowPrivacy(false);
      setShowTerms(false);
      setShowCookies(false);
      setShowAuth(false);
    } else if (tabId === 'landing-home') {
      setShowCategories(false);
      setShowCareers(false);
      setShowInfo(false);
      setShowPrivacy(false);
      setShowTerms(false);
      setShowCookies(false);
      setShowAuth(false);
      setActiveTab('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tabId === 'how-it-works') {
      const wasCategories = showCategories;
      setShowCategories(false);
      setShowCareers(false);
      setShowInfo(false);
      setShowPrivacy(false);
      setShowTerms(false);
      setShowCookies(false);
      setShowAuth(false);
      
      // Use a timeout to ensure the LandingPage is rendered before scrolling
      const delay = wasCategories ? 300 : 0;
      setTimeout(() => {
        const element = document.getElementById('how-it-works');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        } else {
          // If for some reason element is not found, scroll to roughly where it should be or top
          window.scrollTo({ top: 1200, behavior: 'smooth' });
        }
      }, delay);
    }
  };

  const handleSelectCategory = (categoryId: string, initialAnswers: Record<string, any> = {}, mappedMessage?: string) => {
    console.log("App handleSelectCategory called with:", categoryId, initialAnswers);
    setPendingCategoryId(categoryId);
    setGuidedJobInitialAnswers(initialAnswers);
    setGuidedJobMappedMessage(mappedMessage);
    setShowGuidedJobModal(true);
    setShowCategories(false);
    if (user && user.role === 'client') {
      setActiveTab('home');
    }
  };

  const handleGuidedJobComplete = (jobData: any) => {
    console.log("App handleGuidedJobComplete called with:", jobData);
    setPendingJobDraft(jobData);
    setPendingWorkerRegistration(false); // Definitely a client
    setShowGuidedJobModal(false);
    
    // Solo se non è loggato mostriamo la schermata auth
    if (!auth.currentUser) {
      setShowAuth(true);
    }
  };

  const handleGuidedWorkerComplete = () => {
    setShowGuidedWorkerModal(false);
    // After guided registration, they are probably already logged in and profile created
    // The modal handles registration logic. 
    // App.tsx auth observer will pick it up.
  };

  useEffect(() => {
    if (user && pendingJobDraft && user.role === 'client') {
      const publishDraft = async () => {
        try {
          const aiTokenCost = await evaluateJobComplexity(pendingJobDraft.title, pendingJobDraft.description);

          const jobsColRef = collection(db, 'jobs');
          const newJobDocRef = doc(jobsColRef);
          const jobId = newJobDocRef.id;
          
          await setDoc(newJobDocRef, {
            ...pendingJobDraft,
            id: jobId,
            clientId: user.id,
            status: 'open',
            tokenCost: aiTokenCost,
            proposalCount: 0,
            publicationPlan: 'free',
            expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          
          // Clear draft and redirect
          setPendingJobDraft(null);
          setActiveTab('jobs'); 
        } catch (error) {
          console.error("Error publishing draft job:", error);
        }
      };
      publishDraft();
    }
  }, [user, pendingJobDraft]);

  useEffect(() => {
    if (!user || !user.id) {
      setUnreadCount(0);
      return;
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', 'in', [user.id, 'all']),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setUnreadCount(snap.size);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'notifications');
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const handleSwitchTab = (e: any) => {
      setActiveTab(e.detail);
    };
    window.addEventListener('switchTab', handleSwitchTab);
    return () => window.removeEventListener('switchTab', handleSwitchTab);
  }, []);

  useEffect(() => {
    let unsubUser: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubUser) {
        unsubUser();
        unsubUser = null;
      }

      if (firebaseUser) {
        // Listen to user document
        const userRef = doc(db, 'users', firebaseUser.uid);
        unsubUser = onSnapshot(userRef, async (docSnap) => {
          const isDefaultAdmin = firebaseUser.email === 'fio.davide@gmail.com' || firebaseUser.email === 'admin@cercartigiano.it';
          if (docSnap.exists()) {
            const data = { ...docSnap.data(), id: docSnap.id } as User;
            if (data.status === 'suspended') {
              setUser(null);
              setShowAuth(false);
              // Sign out if suspended
              auth.signOut();
              alert("Il tuo account è stato sospeso dall'amministratore per violazione delle regole. Contatta l'assistenza.");
              return;
            }
            if (isDefaultAdmin && data.role !== 'admin') {
              try {
                await updateDoc(userRef, { role: 'admin' });
                // Also ensures they're in the admins collection for rules path
                await setDoc(doc(db, 'admins', firebaseUser.uid), { 
                  email: firebaseUser.email,
                  addedAt: serverTimestamp()
                }, { merge: true });
                data.role = 'admin';
              } catch(e) {
                console.error("Failed to update role to admin", e);
              }
            }
            setUser(data);
            setShowAuth(false);
          } else {
            // Handle first-time Google login: Create a profile if it doesn't exist
            const registrationRole = sessionStorage.getItem('registration_role') || (pendingWorkerRegistration ? 'worker' : 'client');
            const newUser: User = {
              id: firebaseUser.uid,
              nome: firebaseUser.displayName || 'Utente',
              email: firebaseUser.email || '',
              role: isDefaultAdmin ? 'admin' : (registrationRole as any),
              status: 'active',
              isApproved: true,
              tokens: 100, // Tokens for testing
              createdAt: new Date().toISOString(),
              onboardingComplete: isDefaultAdmin ? true : false
            };
            
            try {
              await setDoc(userRef, newUser);
              setUser(newUser);
              setShowAuth(false);
            } catch (err) {
              console.error("Error creating profile:", err);
              // Fallback to local state if creation fails initially
              setUser(newUser);
            }
          }
          setLoading(false);
          setAuthReady(true);
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
          setLoading(false);
          setAuthReady(true);
        });
      } else {
        setUser(null);
        setLoading(false);
        setAuthReady(true);
      }
    });

    return () => {
      unsubscribe();
      if (unsubUser) {
        unsubUser();
      }
    };
  }, []);

  if (loading || !authReady) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#F5F5F7]">
        <Helmet><title>Caricamento... | CercArtigiano</title></Helmet>
        <div className="flex flex-col items-center">
          <motion.div
            animate={{ 
              scale: [0.95, 1.03, 0.95],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 2.5,
              ease: "easeInOut"
            }}
            className="w-24 h-24 bg-white rounded-[2rem] shadow-2xl shadow-black/5 flex items-center justify-center border border-white/50 relative overflow-hidden"
          >
            <img 
              src="/logo.png" 
              alt="C" 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  const fallback = document.createElement('div');
                  fallback.className = 'w-full h-full bg-primary flex items-center justify-center text-white text-3xl font-black';
                  fallback.innerText = 'C';
                  parent.appendChild(fallback);
                }
              }}
              className="w-16 h-16 object-contain"
            />
          </motion.div>
          
          <div className="mt-8 flex flex-col items-center gap-1">
            <h1 className="text-base font-black text-[#1D1D1F] uppercase tracking-wider">CercArtigiano</h1>
            <p className="text-[11px] text-[#86868B] font-bold tracking-tight">Tutto nel palmo della Tua mano</p>
            <div className="mt-4 flex gap-1.5 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showInfo) {
    return (
      <>
        <AppSeo 
          title="Come Funziona | CercArtigiano" 
          description="Scopri come funziona CercArtigiano. Scatta una foto al tuo guasto, descrivi il problema in pochi clic e connettiti in totale sicurezza con i migliori professionisti certificati della tua zona." 
          urlPath="/come-funziona"
        />
        <GeneralInfo onBack={() => setShowInfo(false)} />
      </>
    );
  }

  if (showCareers) {
    return (
      <>
        <AppSeo 
          title="Lavora con Noi | CercArtigiano" 
          description="Sei un elettricista, idraulico, falegname o professionista verificato? Entra a far parte della rete d'eccellenza di CercArtigiano e trova nuovi clienti vicino a te." 
          urlPath="/lavora-con-noi"
        />
        <CareersPage onBack={() => setShowCareers(false)} />
      </>
    );
  }

  if (showPrivacy) {
    return (
      <>
        <AppSeo 
          title="Privacy Policy | CercArtigiano" 
          description="Informativa sul trattamento dei dati personali e tutela della privacy su CercArtigiano in piena conformità con il regolamento europeo GDPR." 
          urlPath="/privacy"
        />
        <PrivacyPolicy onBack={() => setShowPrivacy(false)} />
      </>
    );
  }

  if (showTerms) {
    return (
      <>
        <AppSeo 
          title="Termini di Servizio | CercArtigiano" 
          description="Leggi le condizioni d'uso, i termini di servizio e i regolamenti contrattuali della piattaforma CercArtigiano per clienti e professionisti." 
          urlPath="/termini"
        />
        <TermsOfService onBack={() => setShowTerms(false)} />
      </>
    );
  }

  if (showCookies) {
    return (
      <>
        <AppSeo 
          title="Cookie Policy | CercArtigiano" 
          description="Consulta l'informativa sull'uso dei cookie tecnici, analitici e di profilazione all'interno del portale CercArtigiano." 
          urlPath="/cookies"
        />
        <CookiePolicy onBack={() => setShowCookies(false)} />
      </>
    );
  }

  // Not logged in and not in auth view -> Landing Page
  if (!user && !showAuth && !auth.currentUser) {
    const mobileActiveTab = showCategories ? 'explore' : 'landing-home';
    
    return (
      <div className="relative h-full w-full">
        <AppSeo 
          title={showCategories ? "Esplora Categorie | CercArtigiano" : "CercArtigiano - Tutto nel palmo della tua mano"} 
          description={showCategories ? "Sfoglia e trova tutti i tipi di artigiani e professionisti certificati in Italia su CercArtigiano. Risposte immediate alle tue esigenze di casa e ufficio." : "CercArtigiano è la prima piattaforma in Italia per connettersi in pochi clic con idraulici, elettricisti e sarti qualificati. Tutto nel palmo della tua mano."} 
          urlPath={showCategories ? "/search" : "/"}
          schema={getJsonLdSchema(user, showCategories, activeTab)}
        />
        {showCategories ? (
          <div className="w-full bg-white pb-32 lg:pb-0">
            <CategoriesPage 
              onBack={() => setShowCategories(false)} 
              onSelectCategory={handleSelectCategory}
            />
          </div>
        ) : (
          <LandingPage 
            onLogin={() => {
              setPendingWorkerRegistration(false);
              setShowAuth(true);
            }} 
            onRegisterWorker={() => {
              setShowGuidedWorkerModal(true);
            }}
            onSelectCategory={handleSelectCategory}
            onShowInfo={() => {
              setShowInfo(false);
              setShowInfo(true);
            }}
            onShowCareers={() => setShowCareers(true)}
            onShowCategories={() => setShowCategories(true)}
            onShowPrivacy={() => setShowPrivacy(true)}
            onShowTerms={() => setShowTerms(true)}
            onShowCookies={() => setShowCookies(true)}
          />
        )}
        <div className="lg:hidden">
          <MobileTabBar 
            activeTab={mobileActiveTab} 
            onTabChange={handleLandingTabChange}
            user={null}
            onLoginRequest={() => setShowAuth(true)}
          />
        </div>
        
        <GuidedJobModal
          isOpen={showGuidedJobModal}
          onClose={() => {
            setShowGuidedJobModal(false);
            setGuidedJobInitialAnswers({});
            setGuidedJobMappedMessage(undefined);
          }}
          categoryId={pendingCategoryId}
          onComplete={handleGuidedJobComplete}
          initialAnswers={guidedJobInitialAnswers}
          mappedMessage={guidedJobMappedMessage}
        />
        <GuidedWorkerModal
          isOpen={showGuidedWorkerModal}
          onClose={() => setShowGuidedWorkerModal(false)}
          onComplete={handleGuidedWorkerComplete}
        />
        <PrivacyBanner />
      </div>
    );
  }

  // Not logged in but in auth view -> Auth Page
  // Or logged in but waiting for user doc
  if ((!user && showAuth) || (auth.currentUser && !user && loading)) {
    // Se c'è già un utente firebase ma manca il profilo, mostriamo caricamento invece che Auth
    if (auth.currentUser && !user) {
      return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-white gap-4">
          <motion.div 
            animate={{ scale: [1, 1.1, 1], rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-12 h-12 bg-primary rounded-xl shadow-xl shadow-primary/20"
          />
          <p className="text-sm font-bold text-[#86868B] animate-pulse italic">
            {pendingJobDraft ? "Pubblicazione richiesta in corso..." : "Caricamento profilo..."}
          </p>
        </div>
      );
    }

    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#FBFBFD] p-4 overflow-hidden relative">
        <AppSeo 
          title="Accedi o Registrati | CercArtigiano" 
          description="Accedi al tuo account CercArtigiano per gestire le tue richieste di intervento o consultare i messaggi dei professionisti." 
          urlPath="/accedi"
          robots="noindex, nofollow"
        />
        {/* Background blobs for Mac feel */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="z-10 w-full max-w-4xl"
        >
          <Auth isCompletingRequest={!!pendingJobDraft} />
        </motion.div>
      </div>
    );
  }

  const currentUserEmail = user?.email || auth.currentUser?.email;
  const isAdminEmail = currentUserEmail === 'fio.davide@gmail.com' || currentUserEmail === 'admin@cercartigiano.it';
  const userRole = user?.role || (isAdminEmail ? 'admin' : 'client');
  const effectiveRole = isAdminEmail ? 'admin' : userRole;

  let pageTitle = "CercArtigiano";
  let pageDescription = "Trova i migliori artigiani e professionisti della tua zona su CercArtigiano. Servizi verificati per la casa, la persona e la tecnologia.";
  
  if (activeTab === 'home') {
    pageTitle = "Dashboard | CercArtigiano";
    pageDescription = "Accedi alla tua dashboard di CercArtigiano per gestire le tue richieste di lavoro, comunicare con i professionisti e visualizzare i preventivi.";
  } else if (activeTab === 'jobs' || activeTab === 'projects') {
    pageTitle = "I miei Lavori | CercArtigiano";
    pageDescription = "Monitora lo stato dei tuoi progetti, visualizza le proposte ricevute e gestisci gli interventi attivi su CercArtigiano.";
  } else if (activeTab === 'search') {
    pageTitle = "Cerca Professionisti | CercArtigiano";
    pageDescription = "Sfoglia l'elenco completo dei professionisti e artigiani verificati: idraulici, elettricisti, informatici e molti altri servizi.";
  } else if (activeTab.startsWith('admin')) {
    pageTitle = "Amministrazione | CercArtigiano";
    pageDescription = "Pannello amministratore riservato alla gestione di utenti, transazioni, recensioni e moderatore della piattaforma.";
  } else if (activeTab === 'profile') {
    pageTitle = "Il mio Profilo | CercArtigiano";
    pageDescription = "Gestisci i dati personali, visualizza il bilancio crediti, aggiorna le categorie di competenza e carica i tuoi documenti di verifica.";
  } else if (activeTab === 'settings') {
    pageTitle = "Impostazioni | CercArtigiano";
    pageDescription = "Modifica le tue preferenze di notifica, lingua, gestione della privacy e consensi per un'esperienza personalizzata.";
  } else if (activeTab === 'credits' || activeTab === 'subscriptions') {
    pageTitle = "Abbonamenti e Crediti | CercArtigiano";
    pageDescription = "Acquista pacchetti crediti o ricarica token per rispondere alle richieste di lavoro e sbloccare opportunità lavorative nella tua zona.";
  }

  if (user && !user.onboardingComplete && !isAdminEmail) {
    return (
      <>
        <AppSeo 
          title="Completamento Profilo | CercArtigiano" 
          description="Completa la configurazione iniziale del tuo profilo utente o aziendale per iniziare su CercArtigiano." 
          urlPath="/onboarding"
          robots="noindex, nofollow"
        />
        <Onboarding user={user} onComplete={() => setUser({ ...user, onboardingComplete: true })} />
      </>
    );
  }

  const renderDashboard = () => {
    if (activeTab === 'home') {
      if (effectiveRole === 'admin') return (
        <div className="space-y-8">
          <div className="bg-blue-600 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
             <div className="relative z-10">
                <h1 className="text-4xl font-black tracking-tighter mb-2">Buongiorno, Davide</h1>
                <p className="text-blue-100 font-medium max-w-md">Il sistema è stabile. Hai 4 profili artigiano da revisionare e 2 segnalazioni aperte.</p>
                <Button className="mt-8 bg-white text-blue-600 rounded-full font-black px-8" onClick={() => setActiveTab('admin')}>Vai al CRM</Button>
             </div>
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          </div>
          <AdminDashboard user={user!} summaryOnly={true} />
        </div>
      );
      if (effectiveRole === 'worker') return <WorkerDashboard user={user!} activeTab="home" />;
      return <ClientDashboard user={user!} activeTab="home" />;
    }

    if (activeTab === 'admin') {
      return <AdminDashboard user={user!} />;
    }

    if (activeTab === 'admin_utenti') {
      return <AdminDashboard user={user!} initialTab="utenti" />;
    }

    if (activeTab === 'admin_fatturazione') {
      return <AdminDashboard user={user!} initialTab="fatturazione" />;
    }

    if (activeTab === 'admin_economia') {
      return <AdminDashboard user={user!} initialTab="finanza" />;
    }

    if (effectiveRole === 'worker') {
      return <WorkerDashboard user={user!} activeTab={activeTab} />;
    }
    return <ClientDashboard user={user!} activeTab={activeTab} />;
  };

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row bg-background text-foreground overflow-hidden font-sans">
      <AppSeo 
        title={pageTitle}
        description={pageDescription}
        urlPath={`/${activeTab}`}
        robots="noindex, nofollow"
        schema={getJsonLdSchema(user, showCategories, activeTab)}
      />
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          role={effectiveRole as any} 
          unreadCount={unreadCount}
        />
      </div>
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header - Resized for mobile */}
        <header className="h-16 lg:h-16 border-b border-[#D2D2D7]/20 flex items-center justify-between px-2 sm:px-6 lg:px-10 bg-[#F5F5F7]/70 backdrop-blur-xl z-40 sticky top-0">
          <div className="flex items-center gap-2 lg:gap-6 flex-1">
            {/* Show brand on mobile header since sidebar is hidden */}
            <div 
              className="lg:hidden flex items-center gap-2 cursor-pointer group"
              onClick={() => setActiveTab('home')}
            >
              <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center group-active:scale-95 transition-transform">
                <BrandLogo className="w-8 h-8" />
              </div>
              <span className="font-black text-[11px] tracking-tight text-[#1D1D1F] uppercase">
                CercArtigiano
              </span>
            </div>
            <div className="relative flex-1 max-w-xl mx-auto px-1 sm:px-0">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B]" />
              <Input 
                placeholder={window.innerWidth < 768 ? "Cerca..." : "Cerca maestranze, servizi o ispirazione..."}
                onFocus={() => {
                  setActiveTab('search');
                }}
                className="pl-10 h-10 bg-white/50 border border-[#D2D2D7]/40 rounded-2xl focus-visible:ring-2 focus-visible:ring-primary/10 hover:bg-white transition-all text-sm w-full"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 ml-2">
            <Button variant="ghost" size="icon" className="relative hover:bg-white/80 rounded-full hidden sm:flex h-10 w-10 transition-all" onClick={() => setShowNotifications(true)}>
              <Bell className={cn("w-5 h-5", unreadCount > 0 ? "text-blue-600" : "text-[#86868B]")} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#FF3B30] rounded-full border-2 border-[#F5F5F7]" />
              )}
            </Button>
            <div className="w-[1px] h-6 bg-[#D2D2D7]/40 mx-1 hidden sm:block" />
            <Auth />
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto scroll-smooth">
          <div className="p-4 lg:p-8 pb-32 lg:pb-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="max-w-6xl mx-auto"
              >
                {/* Render appropriate dashboard component based on role */}
                {activeTab === 'home' && effectiveRole === 'admin' && (
                  <div key="admin-home-view" className="space-y-8">
                    <div className="bg-blue-600 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                       <div className="relative z-10">
                          <h1 className="text-4xl font-black tracking-tighter mb-2">Buongiorno, Davide</h1>
                          <p className="text-blue-100 font-medium max-w-md">Il sistema è stabile. Hai 4 profili artigiano da revisionare e 2 segnalazioni aperte.</p>
                          <Button className="mt-8 bg-white text-blue-600 rounded-full font-black px-8" onClick={() => setActiveTab('admin_utenti')}>Vai al CRM</Button>
                       </div>
                       <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    </div>
                    <AdminDashboard key="admin-summary" user={user!} summaryOnly={true} />
                  </div>
                )}
                
                {activeTab === 'home' && effectiveRole === 'worker' && <WorkerDashboard key="worker-home" user={user!} activeTab="home" />}
                {activeTab === 'home' && effectiveRole === 'client' && <ClientDashboard key="client-home" user={user!} activeTab="home" />}

                {/* Specific views shared or role-restricted */}
                {activeTab === 'jobs' && (
                  effectiveRole === 'admin' 
                    ? <AdminDashboard key="admin-jobs" user={user!} initialTab="moderazione" />
                    : (effectiveRole === 'worker' 
                        ? <WorkerDashboard key="worker-jobs" user={user!} activeTab="jobs" />
                        : <ClientDashboard key="client-jobs" user={user!} activeTab="jobs" />)
                )}

                {activeTab === 'projects' && effectiveRole === 'worker' && (
                  <WorkerDashboard key="worker-projects" user={user!} activeTab="projects" />
                )}

                {/* Admin specific views */}
                {effectiveRole === 'admin' && (
                  <>
                    {activeTab === 'admin' && <AdminDashboard key="admin-panoramica" user={user!} />}
                    {activeTab === 'admin_utenti' && <AdminDashboard key="admin-utenti" user={user!} initialTab="utenti" />}
                    {activeTab === 'admin_fatturazione' && <AdminDashboard key="admin-fatturazione" user={user!} initialTab="fatturazione" />}
                    {activeTab === 'admin_economia' && <AdminDashboard key="admin-economia" user={user!} initialTab="finanza" />}
                    {activeTab === 'admin_moderazione' && <AdminDashboard key="admin-moderazione" user={user!} initialTab="moderazione" />}
                    {activeTab === 'admin_sistema' && <AdminDashboard key="admin-sistema" user={user!} initialTab="impostazioni" />}
                  </>
                )}

                {/* Common views */}
                {activeTab === 'search' && <CategoriesPage onBack={() => setActiveTab('home')} onSelectCategory={handleSelectCategory} />}
                {activeTab === 'profile' && <ProfileView user={user!} />}
                {activeTab === 'settings' && <SettingsView />}
                {activeTab === 'credits' && <CreditsView user={user!} />}
                {activeTab === 'subscriptions' && <SubscriptionsView user={user!} />}

                {/* Fallback for unknown or unauthorized views */}
                {!['home', 'jobs', 'projects', 'admin', 'admin_utenti', 'admin_fatturazione', 'admin_economia', 'admin_moderazione', 'admin_sistema', 'profile', 'settings', 'credits', 'subscriptions', 'search'].includes(activeTab) && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-[#F5F5F7] rounded-3xl flex items-center justify-center mb-6">
                      <Home className="w-10 h-10 text-[#86868B]" />
                    </div>
                    <h2 className="text-2xl font-black text-[#1D1D1F] mb-2">Vista non trovata</h2>
                    <p className="text-[#86868B] max-w-sm mb-8">La sezione richiesta non è disponibile o è in fase di aggiornamento.</p>
                    <Button onClick={() => setActiveTab('home')} className="rounded-full px-8">Torna alla Home</Button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        
        <PrivacyBanner />

        <NotificationsModal 
          isOpen={showNotifications} 
          onClose={() => setShowNotifications(false)} 
        />

        <GuidedJobModal
          isOpen={showGuidedJobModal}
          onClose={() => {
            setShowGuidedJobModal(false);
            setGuidedJobInitialAnswers({});
            setGuidedJobMappedMessage(undefined);
          }}
          categoryId={pendingCategoryId}
          onComplete={handleGuidedJobComplete}
          initialAnswers={guidedJobInitialAnswers}
          mappedMessage={guidedJobMappedMessage}
        />

        <GuidedWorkerModal
          isOpen={showGuidedWorkerModal}
          onClose={() => setShowGuidedWorkerModal(false)}
          onComplete={handleGuidedWorkerComplete}
        />

        {/* Mobile Bottom Navigation - Using new superstudiata component */}
        <div className="lg:hidden">
          <MobileTabBar 
            activeTab={activeTab}
            onTabChange={setActiveTab}
            user={user}
            onLoginRequest={() => setShowAuth(true)}
            unreadCount={unreadCount}
          />
        </div>
      </main>
    </div>
  );
}

function CheckCircleIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

// Remove local Briefcase to avoid confusion with Lucide
function BriefcaseIcon(props: any) {
  return null;
}

export default function Root() {
  return (
    <Routes>
      <Route path="/servizi/:regione/:provincia/:comune/:categoria" element={<SeoLandingPage />} />
      <Route path="*" element={<App />} />
    </Routes>
  );
}
