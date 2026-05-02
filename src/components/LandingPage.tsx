import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  Star, 
  MessageSquare, 
  Briefcase,
  Zap,
  Clock,
  MapPin,
  Hammer
} from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { SERVICE_CATEGORIES } from '../constants';
import { GlobalQnAFeed } from './shared/GlobalQnAFeed';

interface LandingPageProps {
  onLogin: () => void;
  onShowPrivacy?: () => void;
  onShowTerms?: () => void;
  onShowCookies?: () => void;
  onShowInfo?: () => void;
  onShowCareers?: () => void;
  onShowCategories?: () => void;
}

export function LandingPage({ onLogin, onShowPrivacy, onShowTerms, onShowCookies, onShowInfo, onShowCareers, onShowCategories }: LandingPageProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [currentHeadline, setCurrentHeadline] = useState(0);
  const [howItWorksTab, setHowItWorksTab] = useState<'client' | 'worker'>('client');
  
  const headlines = [
    {
      main: "L'artigiano più vicino,",
      sub: "scelto dal nostro algoritmo."
    },
    {
      main: "5 Preventivi reali,",
      sub: "qualità e prezzo garantiti."
    },
    {
      main: "Professionisti verificati,",
      sub: "direttamente dall'amministrazione."
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeadline((prev) => (prev + 1) % headlines.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const tickerItems = [
    "Ricerca nuovi incarichi in tempo reale...",
    "Idraulico disponibile ora a Milano",
    "Nuova richiesta: Ristrutturazione bagno a Roma",
    "Elettricista certificato cercasi a Torino",
    "Oltre 5000 professionisti verificati",
    "Puntualità e qualità garantite"
  ];

  return (
    <div className="min-h-screen bg-white text-[#1D1D1F] overflow-x-hidden font-sans">
      {/* Header / Nav */}
      <nav className="h-16 lg:h-20 bg-white/80 backdrop-blur-md border-b border-[#D2D2D7]/30 fixed top-0 w-full z-50 flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="CercArtigiano Logo" 
              className="w-full h-full object-contain group-hover:scale-110 transition-transform" 
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = "w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs";
                fallback.innerText = "C";
                target.parentElement?.appendChild(fallback);
              }}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-[#1D1D1F] to-[#1D1D1F]/70">
              CercArtigiano
            </span>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-none mt-1">
              Premium Portal
            </span>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-bold opacity-70">
          <a href="#professionals" className="hover:opacity-100 transition-opacity">Professionisti</a>
          <a href="#how-it-works" className="hover:opacity-100 transition-opacity">Come Funziona</a>
          <a href="#faq" className="hover:opacity-100 transition-opacity">Domande Frequenti</a>
        </div>

        <Button 
          onClick={onLogin}
          className="rounded-full bg-[#1D1D1F] hover:bg-black text-white px-6 h-10 font-bold transition-all hover:scale-105 active:scale-95"
        >
          Accedi
        </Button>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* User uploaded realistic background image */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden h-full w-full">
          <div className="absolute inset-0 bg-gradient-to-br from-[#F5F5F7] to-[#D2D2D7]" /> {/* Background fallback color */}
          <img 
            src="/Foto_homepage.png" 
            alt="Artigiano al lavoro" 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-black/10" /> {/* Subtle overlay for better contrast */}
        </div>

        <div className="max-w-[1400px] mx-auto w-full relative z-20 px-6 pt-24 pb-8 h-screen flex flex-col justify-end items-end">
          <div className="flex flex-col items-end justify-end w-full pb-8 lg:pb-12 gap-6 lg:gap-8">
            <div className="text-left w-full lg:w-auto flex justify-start md:justify-end">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="md:bg-white/5 md:backdrop-blur-md p-0 md:p-6 lg:p-8 md:rounded-[2rem] md:border border-white/20 md:shadow-2xl shadow-black/20 w-fit"
              >
                <div className="min-h-[80px] sm:min-h-[130px] lg:min-h-[150px] flex items-center justify-start">
                  <AnimatePresence mode="wait">
                    <motion.h1 
                      key={currentHeadline}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-white leading-[0.95] drop-shadow-2xl"
                    >
                      {headlines[currentHeadline].main} <br className="hidden sm:block" />
                      <span className="text-blue-600 italic drop-shadow-2xl">{headlines[currentHeadline].sub}</span>
                    </motion.h1>
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>

            <div className="w-full lg:w-auto flex justify-start md:justify-end shrink-0">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                className="flex flex-col sm:flex-row items-center sm:items-start gap-4 w-full sm:w-auto justify-start md:justify-end"
              >
                <Button 
                  size="lg" 
                  onClick={onLogin}
                  className="w-full sm:w-auto h-16 px-12 rounded-3xl bg-[#FF7A30] hover:bg-[#FF6A10] text-white text-xl font-bold shadow-2xl shadow-[#FF7A30]/30 transition-all hover:scale-105 active:scale-95 group border-none"
                >
                  Inizia ora
                  <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full sm:w-auto h-16 px-12 rounded-3xl border-2 border-[#1D1D1F] text-[#1D1D1F] text-xl font-bold hover:bg-[#1D1D1F] hover:text-white transition-all shadow-xl bg-white/90 backdrop-blur-md"
                >
                  Scopri di più
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Professionals Exploration Section */}
      <section id="professionals" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[#1D1D1F] mb-6">
                I migliori talenti del territorio <span className="text-blue-600">a tua disposizione.</span>
              </h2>
              <p className="text-lg text-[#86868B] font-medium">
                Scegli tra centinaia di professionisti certificati e verificati dal nostro team. Qualità garantita al 100%.
              </p>
            </div>
            <Button 
              variant="link" 
              className="text-blue-600 font-bold p-0 h-auto text-lg group"
              onClick={onShowCategories}
            >
              Vedi tutte le categorie
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {SERVICE_CATEGORIES.slice(0, 12).map((cat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                onClick={onShowCategories}
                className="group p-6 bg-[#F5F5F7] rounded-[2rem] border border-transparent hover:border-blue-200 transition-all cursor-pointer flex flex-col items-center text-center justify-between h-auto min-h-[220px]"
              >
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-black/5 group-hover:scale-110 transition-transform">
                  <cat.icon className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#1D1D1F] mb-1 leading-tight">{cat.label}</h3>
                  <p className="text-[10px] text-[#86868B] font-bold uppercase tracking-widest mb-4">
                    Esperti Certificati
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-auto">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(j => (
                      <div key={j} className="w-6 h-6 rounded-full border border-white bg-blue-100 flex items-center justify-center overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?u=${cat.id}${j}`} alt="avatar" />
                      </div>
                    ))}
                  </div>
                  <span className="text-[8px] font-black text-[#1D1D1F] uppercase tracking-widest">+50</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-50/40 blur-[100px] -z-10" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Come Funziona</h2>
            <p className="text-xl text-[#86868B] font-medium italic">Semplice, veloce, rivoluzionario.</p>
          </div>

          {/* Toggle Tab - Apple Style */}
          <div className="flex justify-center mb-16">
            <div className="bg-[#F5F5F7] p-1.5 rounded-full flex items-center gap-1">
              <button 
                onClick={() => setHowItWorksTab('client')}
                className={cn(
                  "px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                  howItWorksTab === 'client' ? "bg-white text-[#1D1D1F] shadow-lg" : "text-[#86868B] hover:text-[#1D1D1F]"
                )}
              >
                Per il Cliente
              </button>
              <button 
                onClick={() => setHowItWorksTab('worker')}
                className={cn(
                  "px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                  howItWorksTab === 'worker' ? "bg-white text-[#1D1D1F] shadow-lg" : "text-[#86868B] hover:text-[#1D1D1F]"
                )}
              >
                Per il Professionista
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <AnimatePresence mode="wait">
              {howItWorksTab === 'client' ? (
                <motion.div 
                  key="client-steps"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                  {[
                    { 
                      icon: Zap, 
                      title: "Algoritmo Prossimità", 
                      desc: "Il nostro sistema seleziona prima l'artigiano più vicino e meglio quotato. Se non è disponibile entro 5 ore, espandiamo la ricerca ogni passo per garantirti il meglio a KM 0." 
                    },
                    { 
                      icon: ShieldCheck, 
                      title: "Rating Certificato", 
                      desc: "Nessun profilo improvvisato. Ogni professionista riceve un punteggio iniziale dall'amministrazione dopo rigidi controlli. La reputazione cresce poi con le recensioni reali." 
                    },
                    { 
                      icon: MessageSquare, 
                      title: "La Potenza del 5", 
                      desc: "Ricevi esattamente 5 preventivi di alta qualità. Il numero perfetto per confrontare professionalità e prezzo senza perdite di tempo in centinaia di offerte confuse." 
                    }
                  ].map((step, i) => (
                    <div key={i} className="flex flex-col items-center text-center space-y-6 p-8 rounded-[2.5rem] bg-[#F5F5F7]/50 border border-transparent hover:border-blue-200 transition-all">
                      <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-blue-50 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full" />
                        <step.icon className="w-10 h-10 text-blue-600 relative z-10" />
                      </div>
                      <h3 className="text-xl font-black text-[#1D1D1F]">{step.title}</h3>
                      <p className="text-sm text-[#86868B] font-bold leading-relaxed">{step.desc}</p>
                    </div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  key="worker-steps"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4 }}
                  className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                  {[
                    { icon: Zap, title: "Portafoglio Crediti", desc: "Nessun abbonamento mensile. Carica crediti e spendili solo per sbloccare i lavori che ti interessano davvero." },
                    { icon: ShieldCheck, title: "Contatti Protetti", desc: "Ricevi richieste dettagliate grazie al Triage. Vedi subito la descrizione prima di spendere i tuoi crediti." },
                    { icon: Briefcase, title: "Gestione Premium", desc: "Una dashboard dedicata per gestire appuntamenti, messaggi e pagamenti in un unico posto." }
                  ].map((step, i) => (
                    <div key={i} className="flex flex-col items-center text-center space-y-6 p-8 rounded-[2.5rem] bg-[#F5F5F7]/50 border border-transparent hover:border-orange-200 transition-all">
                      <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center">
                        <step.icon className="w-10 h-10 text-[#FF7A30]" />
                      </div>
                      <h3 className="text-xl font-black text-[#1D1D1F]">{step.title}</h3>
                      <p className="text-sm text-[#86868B] font-bold leading-relaxed">{step.desc}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Value Proposition Section - The "Why Us" */}
      <section className="py-24 bg-[#1D1D1F] text-white overflow-hidden relative">
        <div className="absolute bottom-0 left-0 w-full h-[50%] bg-gradient-to-t from-blue-600/20 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Il Valore Aggiunto di</h2>
            <div className="flex items-center justify-center gap-2">
               <span className="text-4xl md:text-6xl font-black tracking-tighter">Cerc</span>
               <span className="text-4xl md:text-6xl font-black tracking-tighter text-blue-500">Artigiano</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                title: "Algoritmo KM 0", 
                desc: "Privilegiamo l'artigiano sotto casa. Se il migliore è vicino a te, lo avvisiamo immediatamente. La prossimità riduce i costi e i tempi di attesa.",
                highlight: "Ricerca Intelligente"
              },
              { 
                title: "Qualità Verificata", 
                desc: "Check-in amministrativo obbligatorio. Ogni professionista parte con un rating di fiducia garantito dal nostro portale dopo i controlli.",
                highlight: "Fiducia Totale"
              },
              { 
                title: "Top 5 Selection", 
                desc: "Fermiamo il rumore. Ti mandiamo solo i 5 preventivi più competitivi per darti il massimo potere di scelta senza stress.",
                highlight: "Confronto Reale"
              },
              { 
                title: "Triage Assistito", 
                desc: "Descrivi il problema in modo tecnico grazie alla nostra guida AI. L'artigiano saprà già cosa serve prima di venire.",
                highlight: "Efficienza Apple-grade"
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] p-8 hover:bg-white/10 transition-colors group">
                <div className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-4">{feature.highlight}</div>
                <h3 className="text-xl font-black mb-4">{feature.title}</h3>
                <p className="text-sm text-[#86868B] font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Carousel Section */}
      <section className="py-20 bg-white overflow-hidden border-y border-[#D2D2D7]/20">
        <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
          <h2 className="text-3xl font-black tracking-tight text-[#1D1D1F]">Le Eccellenze del Territorio</h2>
          <p className="text-[#86868B] font-bold mt-2">Iscriviti per unirti ai migliori professionisti</p>
        </div>
        
        <div className="relative">
          {/* Fades for smooth entry/exit */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />
          
          <div className="flex animate-infinite-scroll whitespace-nowrap gap-12">
            {[...SERVICE_CATEGORIES, ...SERVICE_CATEGORIES].map((cat, i) => (
              <div 
                key={i} 
                className="flex items-center gap-4 bg-[#F5F5F7] px-8 py-6 rounded-[2rem] border border-[#D2D2D7]/30 hover:shadow-xl hover:shadow-black/5 transition-all group shrink-0"
              >
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <cat.icon className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <div className="text-lg font-black text-[#1D1D1F]">{cat.label}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#86868B]">Service Partner</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Artigiani and Occasional Workers Section */}
      <section className="py-24 bg-blue-600 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-500/50 blur-[100px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full mb-6">
                <Star className="w-4 h-4 text-yellow-300" />
                <span className="text-[11px] font-black uppercase tracking-widest text-white">Opportunità per tutti</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
                Hai esperienza e vuoi fare piccoli lavoretti?
              </h2>
              <p className="text-xl text-blue-100 font-medium mb-8 leading-relaxed">
                CercArtigiano non è solo per grandi imprese. Siamo aperti anche a privati e professionisti per <strong>prestazioni occasionali</strong>. Non richiediamo visura camerale: se hai le competenze e la passione, questa è la piattaforma giusta per trovare rapidamente richieste vicino a te.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Button 
                  size="lg" 
                  onClick={onLogin}
                  className="w-full sm:w-auto h-14 px-8 rounded-3xl bg-white text-blue-600 hover:bg-gray-50 font-bold shadow-xl transition-all"
                >
                  Unisciti come Professionista
                </Button>
              </div>
            </div>
            
            {/* Visual element */}
            <div className="hidden lg:flex w-[400px] h-[400px] bg-white/10 rounded-[3rem] border border-white/20 backdrop-blur-md items-center justify-center relative">
               <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-[3rem]" />
               <div className="grid grid-cols-2 gap-4 p-8 w-full relative z-10">
                  {[
                    { title: "Nessun costo fisso", desc: "Paghi solo i preventivi che invii" },
                    { title: "No P.IVA obbligatoria", desc: "Valido per prestazioni occasionali" },
                    { title: "Visibilità locale", desc: "Richieste nella tua zona" },
                    { title: "Feedback garantiti", desc: "Costruisci la tua reputazione" }
                  ].map((item, i) => (
                    <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col justify-center text-center">
                       <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                       <p className="text-xs text-blue-100 font-medium">{item.desc}</p>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-[#F5F5F7] relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Domande Frequenti</h2>
            <p className="text-xl text-[#86868B] font-medium">Abbiamo risposto ai dubbi più comuni dei nostri utenti.</p>
          </div>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                q: "Cosa sono i Crediti per il professionista?",
                a: "A differenza di altri portali, non abbiamo abbonamenti. Il professionista carica dei crediti e li utilizza solo per sbloccare i dati di contatto di un cliente realmente interessato."
              },
              {
                q: "Cos'è il Triage Intelligente?",
                a: "È il nostro sistema di assistenza alla pubblicazione. Guida il cliente step-by-step per fornire al professionista tutte le informazioni tecniche necessarie, riducendo sopralluoghi inutili."
              },
              {
                q: "Il numero di telefono è sempre visibile?",
                a: "No. Per proteggere la privacy, i contatti sono visibili solo quando il professionista utilizza i suoi crediti per sbloccare la conversazione specifica."
              },
              {
                q: "Posso iscrivermi senza Partita IVA?",
                a: "Sì! Supportiamo anche le prestazioni occasionali. Chiunque abbia competenze certificate può iscriversi e iniziare a lavorare seguendo le normative vigenti."
              },
              {
                q: "Quanto costa pubblicare una richiesta?",
                a: "Per il cliente è sempre gratuito al 100%. Nessuna commissione sul lavoro svolto né costi fissi di iscrizione."
              },
              {
                q: "Come funzionano le recensioni?",
                a: "Sono reali e garantite. Possono essere rilasciate solo dopo che il lavoro è stato ufficialmente assegnato e completato tramite la piattaforma."
              }
            ].map((faq, i) => (
              <div key={i} className="bg-white p-8 rounded-[2rem] border border-[#D2D2D7]/30 shadow-sm hover:shadow-xl transition-all">
                <h3 className="text-lg font-black text-[#1D1D1F] mb-4">{faq.q}</h3>
                <p className="text-sm text-[#86868B] font-bold leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <p className="text-[#86868B] font-bold text-sm">
              Hai altre domande? Consulta la sezione <span className="text-blue-600 cursor-pointer hover:underline" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>Contatti</span> nel footer della pagina.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Quote Section */}
      <section className="py-32 bg-white relative">
        <div className="absolute inset-0 bg-blue-50/10 blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 text-center">
           <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-12">I numeri di CercArtigiano</h2>
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
             {[
               { val: "12k+", label: "Professionisti" },
               { val: "45k+", label: "Lavori Completati" },
               { val: "4.9/5", label: "Media Feedback" },
               { val: "10 min", label: "Risposta Media" }
             ].map((stat, i) => (
               <div key={i} className="space-y-2">
                 <div className="text-4xl md:text-6xl font-black text-blue-600 tracking-tighter">{stat.val}</div>
                 <div className="text-xs font-black uppercase tracking-widest text-[#86868B]">{stat.label}</div>
               </div>
             ))}
           </div>
        </div>
      </section>

      {/* Footer / Ticker */}
      <footer className="bg-[#1D1D1F] py-12 text-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 bg-white px-5 py-2.5 rounded-full group cursor-pointer shadow-xl shadow-black/40 hover:scale-105 transition-all outline outline-1 outline-white/10" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                <img 
                  src="/logo.png" 
                  alt="Logo" 
                  className="w-full h-full object-contain transition-transform" 
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.className = "w-6 h-6 rounded bg-blue-600 flex items-center justify-center font-bold text-white text-[10px]";
                    fallback.innerText = "C";
                    target.parentElement?.appendChild(fallback);
                  }}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter leading-none text-[#1D1D1F]">
                  Cerc<span className="text-blue-600">Artigiano</span>
                </span>
                <span className="text-[7px] font-black uppercase tracking-[0.2em] text-[#86868B] mt-0.5">
                  Tutto nel palmo della Tua mano
                </span>
              </div>
            </div>
            <p className="text-[#86868B] text-sm font-medium leading-relaxed max-w-sm">
              Il punto di incontro definitivo tra qualità professionale e necessità privata. 
              Massima sicurezza, massima efficienza.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:col-span-2">
             <div className="space-y-4">
               <h4 className="text-xs font-black uppercase tracking-widest text-blue-400">Contatti</h4>
               <ul className="space-y-2 text-sm text-[#86868B] font-bold">
                 <li className="text-white">Cercartigiani srl</li>
                 <li className="text-white">Via Bari 1, 70124 Bari</li>
                 <li className="text-white">P.IVA: 12345678954</li>
                 <li className="text-white"><a href="tel:0801236547" className="hover:text-blue-400 transition-colors">Tel: 080 1236547</a></li>
                 <li className="text-white break-all"><a href="mailto:support@cercartigiano.it" className="hover:text-blue-400 transition-colors">support@cercartigiano.it</a></li>
               </ul>
             </div>
             <div className="space-y-4">
               <h4 className="text-xs font-black uppercase tracking-widest text-blue-400">Informazioni Generali</h4>
               <ul className="space-y-2 text-sm text-[#86868B] font-bold">
                 <li><button onClick={onShowInfo} className="hover:text-white cursor-pointer bg-transparent border-none p-0 outline-none transition-colors text-left w-full">Informazioni Generali</button></li>
                 <li><button onClick={onShowCareers} className="hover:text-white cursor-pointer bg-transparent border-none p-0 outline-none transition-colors text-left w-full">Lavora con noi</button></li>
               </ul>
             </div>
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-blue-400">Legale</h4>
                <ul className="space-y-2 text-sm text-[#86868B] font-bold">
                  <li className="opacity-50">Privacy Policy</li>
                  <li className="opacity-50">Termini di Servizio</li>
                  <li className="opacity-50">Cookie Policy</li>
                </ul>
              </div>
          </div>
        </div>

        {/* Real-time Ticker */}
        <div className="border-t border-white/10 pt-12">
          <div className="bg-white/5 py-4 overflow-hidden border-y border-white/10 mb-8">
            <div className="flex animate-infinite-scroll whitespace-nowrap">
              <div className="flex items-center gap-12 px-4">
                {[...tickerItems, ...tickerItems].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 text-white/30 text-[10px] font-black uppercase tracking-[0.2em] py-1">
                    <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="text-center px-6">
            <p className="text-[10px] text-[#86868B] font-black uppercase tracking-widest">
              © 2026 CercArtigiano. Tutto nel palmo della Tua mano.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
