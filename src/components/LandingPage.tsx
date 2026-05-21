import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  Star, 
  MessageSquare, 
  Briefcase,
  Zap,
  Clock,
  MapPin,
  Hammer,
  Smartphone,
  Bell
} from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { SERVICE_CATEGORIES } from '../constants';

import { BrandLogo } from './BrandLogo';
import { HeroBackground } from './HeroBackground';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

interface LandingPageProps {
  onLogin: () => void;
  onSelectCategory: (id: string, initialAnswers?: Record<string, any>, mappedMessage?: string) => void;
  onShowPrivacy?: () => void;
  onShowTerms?: () => void;
  onShowCookies?: () => void;
  onShowInfo?: () => void;
  onShowCareers?: () => void;
  onShowCategories?: () => void;
  onRegisterWorker?: () => void;
}

export function LandingPage({ onLogin, onSelectCategory, onShowPrivacy, onShowTerms, onShowCookies, onShowInfo, onShowCareers, onShowCategories, onRegisterWorker }: LandingPageProps) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [workerBackgroundIndex, setWorkerBackgroundIndex] = useState(0);
  const [howItWorksTab, setHowItWorksTab] = useState<'client' | 'worker'>('client');
  const [faqTab, setFaqTab] = useState<'client' | 'worker'>('client');
  const [searchQuery, setSearchQuery] = useState('');
  
  const heroSlides = [
    {
      main: "Dimmi di cosa hai bisogno,",
      sub: "l'artigiano perfetto lo troviamo noi.",
      image: "/Foto_homepage.png",
      keyword: "SOLUZIONI"
    },
    {
      main: "Ricevi 5 preventivi gratuiti,",
      sub: "confronta e scegli il migliore.",
      image: "/Foto_homepage2.png",
      keyword: "SCELTA"
    },
    {
      main: "Tutto l'aiuto che cerchi,",
      sub: "nel palmo della tua mano.",
      image: "/worker_bg_1.png",
      keyword: "SEMPLICITÀ"
    }
  ];

  const workerBackgrounds = [
    "/worker_bg_1.png",
    "/worker_bg_2.png",
    "/worker_bg_3.png"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroSlides.length);
    }, 6000); 
    
    const workerTimer = setInterval(() => {
      setWorkerBackgroundIndex((prev) => (prev + 1) % workerBackgrounds.length);
    }, 8000);

    return () => {
      clearInterval(timer);
      clearInterval(workerTimer);
    };
  }, [heroSlides.length, workerBackgrounds.length]);

  const handleStartSearch = async () => {
    console.log("handleStartSearch triggered with query:", searchQuery);
    if (!searchQuery) {
      onSelectCategory('electrical');
      return;
    }
    
    // Mostriamo un feedback visivo se necessario o procediamo direttamente
    try {
      const { analyzeSearchQuery } = await import('../services/geminiRouter');
      const result = await analyzeSearchQuery(searchQuery);
      
      console.log("AI Analysis Result:", result);
      
      // Passiamo i dati estratti dall'AI alla funzione di selezione categoria
      // Includiamo le risposte iniziali pre-compilate dall'AI
      onSelectCategory(result.categoryId, result.initialAnswers, result.mappedMessage);
    } catch (error) {
      console.error("AI Analysis failed, using keyword fallback", error);
      // Fallback a keyword mapping se AI fallisce
      const { findCategoryFromQuery } = await import('../lib/keywordMapping');
      const mappingResult = findCategoryFromQuery(searchQuery);
      if (mappingResult) {
        onSelectCategory(mappingResult.categoryId, { service_category: mappingResult.subServiceId }, `Ottimo! Abbiamo trovato uno specialista in: ${searchQuery}`);
      } else {
        onSelectCategory('electrical');
      }
    }
  };

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
            <BrandLogo className="w-full h-full group-hover:scale-110 transition-transform" />
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
          <a href="#professionals" className="hover:opacity-100 transition-opacity">{t('navbar.professionals')}</a>
          <a href="#how-it-works" className="hover:opacity-100 transition-opacity">{t('navbar.howItWorks')}</a>
          <a href="#faq" className="hover:opacity-100 transition-opacity">{t('navbar.faq')}</a>
        </div>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Button 
            onClick={onLogin}
            className="rounded-full bg-[#1D1D1F] hover:bg-black text-white px-6 h-10 font-bold transition-all hover:scale-105 active:scale-95"
          >
            {t('navbar.login')}
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <HeroBackground 
          currentIndex={currentIndex} 
          assets={heroSlides.map(s => ({ url: s.image, text: s.keyword }))} 
        />

        <div className="max-w-[1400px] mx-auto w-full relative z-20 px-6 pt-24 pb-8 h-screen flex flex-col justify-end items-end">
          <div className="flex flex-col items-end justify-end w-full pb-8 lg:pb-12 gap-6 lg:gap-8">
            <div className="text-left w-full lg:w-auto flex justify-start md:justify-end">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="bg-white/90 backdrop-blur-2xl p-6 sm:p-8 lg:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-white/40 shadow-2xl shadow-black/10 w-fit group"
              >
                <div className="min-h-[100px] sm:min-h-[140px] lg:min-h-[180px] flex items-center justify-start">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                       <div className="w-8 h-[2px] bg-blue-600" />
                       <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">
                         {t('hero.forClient')}
                       </span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter text-[#1D1D1F] leading-[0.9]">
                      {t('hero.title_part1')} <br className="hidden sm:block" />
                      <span className="text-blue-600 block mt-2 uppercase italic">
                        {t('hero.title_part2')}
                      </span>
                    </h1>
                  </div>
                </div>

                {/* Quick Request Box */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="mt-8 bg-black/5 backdrop-blur-2xl rounded-[2rem] p-2 border border-black/10 shadow-xl flex flex-col md:flex-row gap-2 w-full max-w-2xl relative"
                >
                  <div className="flex-1 relative z-30">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600" />
                    <input 
                      type="text"
                      placeholder={t('hero.placeholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                           handleStartSearch();
                        }
                      }}
                      className="w-full h-14 bg-transparent pl-12 pr-4 text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none font-bold"
                    />
                  </div>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleStartSearch();
                    }}
                    className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap z-30 relative"
                  >
                    {t('hero.start')}
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  {/* AI Status Badge */}
                  <div className="absolute -bottom-10 left-0 right-0 flex justify-center md:justify-start">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-[9px] font-black text-blue-800 uppercase tracking-[0.2em]">{t('hero.ai_active')}</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* Elegant Divider / Separation */}
      <div className="h-24 bg-gradient-to-b from-[#1D1D1F] to-[#1D1D1F]" />
      <div className="h-32 bg-white" />

      {/* Mobile Experience Section - "Tutto nel palmo della Tua mano" */}
      <section className="py-24 sm:py-32 bg-[#FBFBFD] relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-50/30 blur-[120px] -z-10" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-8 items-center">
            {/* Left: Artisan Text */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6 sm:space-y-8 order-2 lg:order-1"
            >
              <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-100 shadow-sm">
                 <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">{t('mobile.for_pro')}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-[#1D1D1F] leading-[1.1] sm:leading-[0.9]">
                {t('mobile.title_part1')} <br />
                <span className="text-blue-600 italic">{t('mobile.title_part2')}</span>
              </h2>
              <p className="text-base sm:text-lg text-[#1D1D1F] font-bold leading-relaxed">
                {t('mobile.desc')}
              </p>
              
              <div className="grid grid-cols-1 gap-4 pt-4">
                 {[
                   { icon: Zap, text: t('mobile.feat1') },
                   { icon: MessageSquare, text: t('mobile.feat2') },
                   { icon: Clock, text: t('mobile.feat3') }
                 ].map((item, i) => (
                   <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-[#D2D2D7]/30">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                        <item.icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="font-black text-[#1D1D1F] text-sm uppercase tracking-tight leading-tight">{item.text}</span>
                   </div>
                 ))}
              </div>
            </motion.div>
            
            {/* Center: Phone Mockup */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full flex justify-center order-1 lg:order-2"
            >
              <div className="relative w-full max-w-[280px] sm:max-w-[320px]">
                <div className="relative w-full aspect-[1/2.05] bg-[#000] rounded-[2.5rem] sm:rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] border-[10px] sm:border-[12px] border-[#1D1D1F] overflow-hidden group">
                  {/* Status Bar */}
                  <div className="absolute top-0 left-0 w-full h-6 sm:h-8 flex justify-between items-center px-4 sm:px-8 z-20">
                     <span className="text-[9px] sm:text-[10px] font-bold text-black/80">9:41</span>
                     <div className="flex gap-1 sm:gap-1.5 items-center">
                        <div className="w-3 sm:w-4 h-1.5 sm:h-2 bg-black/20 rounded-sm" />
                        <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full border border-black/20" />
                     </div>
                  </div>

                  {/* Phone Screen Mockup Content */}
                  <div className="absolute inset-0 bg-[#FBFBFD] pt-10 sm:pt-12 p-4 sm:p-6 flex flex-col">
                     <div className="flex items-center justify-between mb-6 sm:mb-8">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <BrandLogo className="w-6 h-6 sm:w-8 sm:h-8" />
                          <span className="text-[10px] sm:text-xs font-black tracking-tight">CercArtigiano</span>
                        </div>
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                        </div>
                     </div>
                     
                     <div className="space-y-3 sm:space-y-4">
                        <div className="p-3 sm:p-4 bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-[#D2D2D7]/20">
                           <div className="flex justify-between items-center mb-2 sm:mb-3">
                              <span className="text-[8px] sm:text-[10px] font-black uppercase text-blue-600 tracking-widest">{t('mobile.mockup_new')}</span>
                              <span className="text-[7px] sm:text-[8px] font-bold text-[#86868B]">{t('mobile.mockup_now')}</span>
                           </div>
                           <h4 className="text-[10px] sm:text-xs font-black text-[#1D1D1F] mb-1">{t('mobile.mockup_repair')}</h4>
                           <p className="text-[8px] sm:text-[10px] text-[#86868B] font-medium">{t('mobile.mockup_loc')}</p>
                           <div className="mt-3 sm:mt-4 flex gap-1.5 sm:gap-2">
                              <div className="h-6 sm:h-8 flex-1 bg-blue-600 rounded-lg sm:rounded-xl" />
                              <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gray-100 rounded-lg sm:rounded-xl" />
                           </div>
                        </div>

                        <div className="p-3 sm:p-4 bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-[#D2D2D7]/20 opacity-60 scale-95 translate-y-2 sm:translate-y-4">
                           <div className="flex justify-between items-center mb-2 sm:mb-3">
                              <span className="text-[8px] sm:text-[10px] font-black uppercase text-green-600 tracking-widest">{t('mobile.mockup_done')}</span>
                           </div>
                           <div className="h-1.5 sm:h-2 w-1/2 bg-gray-100 rounded-full mb-1" />
                           <div className="h-1.5 sm:h-2 w-1/3 bg-gray-100 rounded-full" />
                        </div>
                     </div>

                     <div className="mt-auto flex items-center justify-between bg-white p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shadow-xl border border-[#D2D2D7]/20">
                        {[1,2,3,4].map(i => (
                          <div key={i} className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl ${i === 1 ? 'bg-blue-600' : 'bg-[#F5F5F7]'}`} />
                        ))}
                     </div>
                  </div>
                  {/* Dynamic Island Area */}
                  <div className="absolute top-1.5 sm:top-2 left-1/2 -translate-x-1/2 w-16 sm:w-24 h-4 sm:h-6 bg-[#1D1D1F] rounded-full z-30" />
                  
                  {/* Reflection Glass Effect */}
                  <div className="absolute top-0 left-0 w-full h-[200%] bg-gradient-to-b from-white/20 via-transparent to-transparent -skew-y-[45deg] pointer-events-none transition-transform duration-1000 group-hover:translate-x-full" />
                </div>
                
                {/* Floating Notification */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -right-4 sm:-right-8 top-1/3 bg-white/95 backdrop-blur-xl p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-[#D2D2D7]/30 shadow-2xl z-20 flex gap-3 items-center"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-[#1D1D1F] uppercase tracking-widest leading-none mb-1">{t('mobile.mockup_alert_title')}</div>
                    <div className="text-[10px] font-medium text-[#86868B] leading-none">{t('mobile.mockup_alert_desc')}</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Right: Client Text */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6 sm:space-y-8 order-3 lg:order-3"
            >
              <div className="inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-100 shadow-sm">
                 <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-green-600">{t('mobile.for_client')}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-[#1D1D1F] leading-[1.1] sm:leading-[0.9]">
                {t('mobile.title2_part1')} <br />
                <span className="text-green-600 italic">{t('mobile.title2_part2')}</span>
              </h2>
              <p className="text-base sm:text-lg text-[#1D1D1F] font-bold leading-relaxed">
                {t('mobile.desc2')}
              </p>
              
              <div className="grid grid-cols-1 gap-4 pt-4">
                 {[
                   { icon: Search, text: t('mobile.feat4') },
                   { icon: Bell, text: t('mobile.feat5') },
                   { icon: Shield, text: t('mobile.feat6') }
                 ].map((item, i) => (
                   <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-[#D2D2D7]/30">
                      <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                        <item.icon className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="font-black text-[#1D1D1F] text-sm uppercase tracking-tight leading-tight">{item.text}</span>
                   </div>
                 ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Artigiani and Occasional Workers Section - MOVED HERE */}
      <section className="py-32 relative overflow-hidden group">
        {/* Background Image with Overlay and Rotation */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.img 
              key={workerBackgroundIndex}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              src={workerBackgrounds[workerBackgroundIndex]} 
              alt="Artigiani al lavoro" 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback if user hasn't uploaded custom images yet
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1581578731522-745d05db97c7?auto=format&fit=crop&q=80&w=2000";
              }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-r from-[#1D1D1F]/90 via-[#1D1D1F]/60 to-blue-900/20" />
          <div className="absolute inset-0 bg-black/10" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
            <div className="max-w-2xl text-left">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 bg-blue-600/20 backdrop-blur-md px-4 py-2 rounded-full mb-8 border border-blue-500/30"
              >
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-widest text-blue-400">{t('pro.badge')}</span>
              </motion.div>
              
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-8 leading-[0.9]">
                {t('pro.title_part1')} <br />
                <span className="text-blue-500 italic">{t('pro.title_part2')}</span>
              </h2>
              
              <div className="bg-white/90 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/20 shadow-2xl mb-10 text-[#1D1D1F]">
                <p className="text-lg md:text-xl font-bold mb-6 leading-relaxed">
                  {t('pro.desc_p1')} <strong>{t('pro.desc_p2')}</strong>{t('pro.desc_p3')} <strong className="text-blue-600">{t('pro.desc_p4')}</strong>
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-black text-sm uppercase tracking-widest">{t('pro.bullet1_title')}</h4>
                      <p className="text-sm font-medium text-gray-600">{t('pro.bullet1_desc')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-black text-sm uppercase tracking-widest">{t('pro.bullet2_title')}</h4>
                      <p className="text-sm font-medium text-gray-600">{t('pro.bullet2_desc')}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Button 
                  size="lg" 
                  onClick={onRegisterWorker}
                  className="w-full sm:w-auto h-16 px-10 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-lg shadow-2xl shadow-blue-600/30 transition-all hover:scale-105 active:scale-95 group border-none"
                >
                  {t('pro.cta')}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <div className="flex items-center gap-4">
                   <div className="flex -space-x-3">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-[#1D1D1F] bg-[#F5F5F7] overflow-hidden">
                           <img src={`https://i.pravatar.cc/100?u=prof${i}`} alt="pro" />
                        </div>
                      ))}
                   </div>
                   <div className="text-xs font-bold text-white/60">
                      <span className="text-white block font-black text-sm">12.000+</span>
                      {t('pro.stats')}
                   </div>
                </div>
              </div>
            </div>
            
            {/* Grid of benefits */}
            <div className="w-full lg:w-[450px] grid grid-cols-1 sm:grid-cols-2 gap-4">
               {[
                 { title: t('pro.grid1_title'), desc: t('pro.grid1_desc') },
                 { icon: Shield, title: t('pro.grid2_title'), desc: t('pro.grid2_desc') },
                 { icon: Zap, title: t('pro.grid3_title'), desc: t('pro.grid3_desc') },
                 { icon: Star, title: t('pro.grid4_title'), desc: t('pro.grid4_desc') }
               ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="p-8 rounded-[2.5rem] bg-white/60 backdrop-blur-xl border border-white/20 hover:bg-white transition-all group/card shadow-2xl shadow-black/10"
                  >
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-600/20">
                      {item.icon ? <item.icon className="w-6 h-6 text-white" /> : <Shield className="w-6 h-6 text-white" />}
                    </div>
                    <h4 className="text-[#1D1D1F] font-black text-xl mb-3 group-hover/card:text-blue-600 transition-colors uppercase tracking-tight">{item.title}</h4>
                    <p className="text-sm text-[#1D1D1F] font-bold leading-relaxed">{item.desc}</p>
                  </motion.div>
               ))}
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
                {t('search.title_part1')} <br /> {t('search.title_part2')}
              </h2>
              <p className="text-lg text-[#86868B] font-medium">
                {t('search.desc')}
              </p>
            </div>
            <Button 
              variant="link" 
              className="text-blue-600 font-bold p-0 h-auto text-lg group"
              onClick={onShowCategories}
            >
              {t('search.see_all')}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {SERVICE_CATEGORIES.slice(0, 12).map((cat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                onClick={() => onSelectCategory(cat.id)}
                className="group p-6 bg-[#F5F5F7] rounded-[2rem] border border-transparent hover:border-blue-200 transition-all cursor-pointer flex flex-col items-center text-center justify-between h-auto min-h-[220px]"
              >
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-black/5 group-hover:scale-110 transition-transform">
                  <cat.icon className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#1D1D1F] mb-1 leading-tight">{cat.label}</h3>
                  <p className="text-[10px] text-[#86868B] font-bold uppercase tracking-widest mb-4">
                    {t('search.experts')}
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
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">{t('how.title')}</h2>
            <p className="text-xl text-[#86868B] font-medium italic">{t('how.subtitle')}</p>
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
                {t('how.tab_client')}
              </button>
              <button 
                onClick={() => setHowItWorksTab('worker')}
                className={cn(
                  "px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                  howItWorksTab === 'worker' ? "bg-white text-[#1D1D1F] shadow-lg" : "text-[#86868B] hover:text-[#1D1D1F]"
                )}
              >
                {t('how.tab_pro')}
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
                      title: t('how.c_step1_title'), 
                      desc: t('how.c_step1_desc') 
                    },
                    { 
                      icon: Shield, 
                      title: t('how.c_step2_title'), 
                      desc: t('how.c_step2_desc')
                    },
                    { 
                      icon: MessageSquare, 
                      title: t('how.c_step3_title'), 
                      desc: t('how.c_step3_desc')
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
                    { icon: Zap, title: t('how.p_step1_title'), desc: t('how.p_step1_desc') },
                    { icon: Shield, title: t('how.p_step2_title'), desc: t('how.p_step2_desc') },
                    { icon: Briefcase, title: t('how.p_step3_title'), desc: t('how.p_step3_desc') }
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
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">{t('value.title')}</h2>
            <div className="flex items-center justify-center gap-2">
               <span className="text-4xl md:text-6xl font-black tracking-tighter">Cerc</span>
               <span className="text-4xl md:text-6xl font-black tracking-tighter text-blue-500">Artigiano</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                title: t('value.v1_title'), 
                desc: t('value.v1_desc'),
                highlight: t('value.v1_hi')
              },
              { 
                title: t('value.v2_title'), 
                desc: t('value.v2_desc'),
                highlight: t('value.v2_hi')
              },
              { 
                title: t('value.v3_title'), 
                desc: t('value.v3_desc'),
                highlight: t('value.v3_hi')
              },
              { 
                title: t('value.v4_title'), 
                desc: t('value.v4_desc'),
                highlight: t('value.v4_hi')
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
          <h2 className="text-3xl font-black tracking-tight text-[#1D1D1F]">{t('brands.title')}</h2>
          <p className="text-[#86868B] font-bold mt-2">{t('brands.desc')}</p>
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
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#86868B]">{t('brands.partner')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-[#F5F5F7] relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">{t('faq.title')}</h2>
            <p className="text-xl text-[#86868B] font-medium">{t('faq.subtitle')}</p>
          </div>

          {/* Toggle Tab for FAQ */}
          <div className="flex justify-center mb-16">
            <div className="bg-[#E5E5EA] p-1.5 rounded-full flex items-center gap-1">
              <button 
                onClick={() => setFaqTab('client')}
                className={cn(
                  "px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                  faqTab === 'client' ? "bg-white text-[#1D1D1F] shadow-lg" : "text-[#86868B] hover:text-[#1D1D1F]"
                )}
              >
                {t('faq.tab_client')}
              </button>
              <button 
                onClick={() => setFaqTab('worker')}
                className={cn(
                  "px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                  faqTab === 'worker' ? "bg-white text-[#1D1D1F] shadow-lg" : "text-[#86868B] hover:text-[#1D1D1F]"
                )}
              >
                {t('faq.tab_pro')}
              </button>
            </div>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            <AnimatePresence mode="wait">
              {faqTab === 'client' ? (
                <motion.div
                  key="faq-client"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {[
                    {
                      q: t('faq.c_q1'),
                      a: t('faq.c_a1')
                    },
                    {
                      q: t('faq.c_q2'),
                      a: t('faq.c_a2')
                    },
                    {
                      q: t('faq.c_q3'),
                      a: t('faq.c_a3')
                    },
                    {
                      q: t('faq.c_q4'),
                      a: t('faq.c_a4')
                    }
                  ].map((faq, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2rem] border border-[#D2D2D7]/30 shadow-sm hover:shadow-xl transition-all">
                      <h3 className="text-lg font-black text-[#1D1D1F] mb-4">{faq.q}</h3>
                      <p className="text-sm text-[#1D1D1F] font-bold leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="faq-worker"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {[
                    {
                      q: t('faq.p_q1'),
                      a: t('faq.p_a1')
                    },
                    {
                      q: t('faq.p_q2'),
                      a: t('faq.p_a2')
                    },
                    {
                      q: t('faq.p_q3'),
                      a: t('faq.p_a3')
                    },
                    {
                      q: t('faq.p_q4'),
                      a: t('faq.p_a4')
                    }
                  ].map((faq, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2rem] border border-[#D2D2D7]/30 shadow-sm hover:shadow-xl transition-all">
                      <h3 className="text-lg font-black text-[#1D1D1F] mb-4">{faq.q}</h3>
                      <p className="text-sm text-[#1D1D1F] font-bold leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-12 text-center">
            <p className="text-[#86868B] font-bold text-sm">
              {t('faq.more_q')} <span className="text-blue-600 cursor-pointer hover:underline" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>{t('faq.more_q_link')}</span> {t('faq.more_q_end')}
            </p>
          </div>
        </div>
      </section>

      {/* Featured Quote Section */}
      <section className="py-32 bg-white relative">
        <div className="absolute inset-0 bg-blue-50/10 blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 text-center">
           <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-12">{t('stats.title')}</h2>
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
             {[
               { val: "12k+", label: t('stats.s1') },
               { val: "45k+", label: t('stats.s2') },
               { val: "4.9/5", label: t('stats.s3') },
               { val: "10 min", label: t('stats.s4') }
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
                <BrandLogo className="w-full h-full" />
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
              {t('footer.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:col-span-2">
             <div className="space-y-4">
               <h4 className="text-xs font-black uppercase tracking-widest text-blue-400">{t('footer.contacts')}</h4>
               <ul className="space-y-2 text-sm text-[#86868B] font-bold">
                 <li className="text-white">Cercartigiani srl</li>
                 <li className="text-white">Via Bari 1, 70124 Bari</li>
                 <li className="text-white">P.IVA: 12345678954</li>
                 <li className="text-white"><a href="tel:0801236547" className="hover:text-blue-400 transition-colors">Tel: 080 1236547</a></li>
                 <li className="text-white break-all"><a href="mailto:support@cercartigiano.it" className="hover:text-blue-400 transition-colors">support@cercartigiano.it</a></li>
               </ul>
             </div>
             <div className="space-y-4">
               <h4 className="text-xs font-black uppercase tracking-widest text-blue-400">{t('footer.info')}</h4>
               <ul className="space-y-2 text-sm text-[#86868B] font-bold">
                 <li><button onClick={onShowInfo} className="hover:text-white cursor-pointer bg-transparent border-none p-0 outline-none transition-colors text-left w-full">{t('footer.info')}</button></li>
                 <li><button onClick={onShowCareers} className="hover:text-white cursor-pointer bg-transparent border-none p-0 outline-none transition-colors text-left w-full">{t('footer.work')}</button></li>
               </ul>
             </div>
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-blue-400">{t('footer.legal')}</h4>
                <ul className="space-y-2 text-sm text-[#86868B] font-bold">
                  <li><button onClick={onShowPrivacy} className="hover:text-white cursor-pointer bg-transparent border-none p-0 outline-none transition-colors text-left w-full">Privacy Policy</button></li>
                  <li><button onClick={onShowTerms} className="hover:text-white cursor-pointer bg-transparent border-none p-0 outline-none transition-colors text-left w-full">Termini di Servizio</button></li>
                  <li><button onClick={onShowCookies} className="hover:text-white cursor-pointer bg-transparent border-none p-0 outline-none transition-colors text-left w-full">Cookie Policy</button></li>
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
