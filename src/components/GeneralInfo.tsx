import React from 'react';
import { motion } from 'motion/react';
import { Info, Target, Award, Mail, MapPin, ArrowLeft, Building2, ShieldCheck } from 'lucide-react';
import { Button } from './ui/button';

interface GeneralInfoProps {
  onBack?: () => void;
}

export function GeneralInfo({ onBack }: GeneralInfoProps) {
  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] font-sans pb-20">
      {/* Header */}
      <nav className="h-16 lg:h-20 bg-white/80 backdrop-blur-md border-b border-[#D2D2D7]/30 sticky top-0 w-full z-50 flex items-center px-6 lg:px-12">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mr-4 rounded-full hover:bg-[#F5F5F7] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="font-bold">Indietro</span>
        </Button>
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
          <span className="font-black text-lg tracking-tight">Informazioni Generali</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 bg-blue-50 w-fit px-4 py-1.5 rounded-full mb-8 border border-blue-100">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span className="text-[11px] font-black uppercase tracking-widest text-blue-700">Profilo Aziendale 2026</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Informazioni Generali</h1>
          <p className="text-[#86868B] font-bold mb-12">Ultimo aggiornamento: 26 Aprile 2026</p>

          <div className="space-y-16">
            <section className="bg-white p-10 rounded-[3rem] border border-[#D2D2D7]/30 shadow-sm relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
                  <Target className="w-8 h-8 text-blue-600" />
                  La nostra Missione
                </h2>
                <p className="text-[#424245] leading-relaxed text-xl">
                  CercArtigiano nasce con l'obiettivo di digitalizzare l'eccellenza artigiana italiana. 
                  Vogliamo rendere la ricerca di un professionista affidabile semplice, trasparente e veloce, 
                  tutto dal palmo della tua mano.
                </p>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            </section>

            <section>
              <h2 className="text-3xl font-black mb-10">In cosa crediamo</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#D2D2D7]/30">
                    <ShieldCheck className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-black">Trasparenza</h3>
                  <p className="text-[#86868B] leading-relaxed">
                    Recensioni verificate e profili dettagliati per proteggere utenti e professionisti.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#D2D2D7]/30">
                    <Info className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-black">Innovazione</h3>
                  <p className="text-[#86868B] leading-relaxed">
                    Utilizziamo le ultime tecnologie per garantire un matching perfetto tra domanda e offerta.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#D2D2D7]/30">
                    <Award className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-black">Qualità</h3>
                  <p className="text-[#86868B] leading-relaxed">
                    Valorizziamo il lavoro fatto bene e il rispetto delle tempistiche.
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-[#1D1D1F] p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
               <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div>
                    <h2 className="text-3xl font-black mb-8">Contatti Istituzionali</h2>
                    <p className="text-gray-400 mb-8 text-lg">
                      Per richieste commerciali o partnership, puoi contattarci ai seguenti riferimenti:
                    </p>
                    
                    <div className="space-y-8">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-2">Relazioni Pubbliche & Media</h4>
                        <a href="mailto:info@cercartigiano.it" className="text-xl font-bold hover:text-blue-400 transition-colors">info@cercartigiano.it</a>
                      </div>
                      
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-2">Ufficio Sviluppo Business</h4>
                        <a href="mailto:business@cercartigiano.it" className="text-xl font-bold hover:text-blue-400 transition-colors">business@cercartigiano.it</a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-end">
                    <div className="bg-white/5 p-8 rounded-[2.5rem] backdrop-blur-md border border-white/10">
                      <h3 className="text-2xl font-black mb-4 flex items-center gap-3">
                        <MapPin className="w-6 h-6 text-blue-500" />
                        Dove Siamo
                      </h3>
                      <p className="text-gray-300 leading-relaxed">
                        La nostra sede operativa si trova a Milano, cuore dell'innovazione digitale italiana, 
                        ma il nostro servizio copre l'intero territorio nazionale.
                      </p>
                    </div>
                  </div>
               </div>
               <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            </section>
          </div>
        </motion.div>
      </main>

      <footer className="mt-20 border-t border-[#D2D2D7]/30 pt-10 text-center">
        <p className="text-[10px] text-[#86868B] font-black uppercase tracking-widest">
          © 2026 CercArtigiano. Tutto nel palmo della Tua mano.
        </p>
      </footer>
    </div>
  );
}
