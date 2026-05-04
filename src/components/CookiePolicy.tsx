import React from 'react';
import { motion } from 'motion/react';
import { Cookie, Info, Settings, MousePointerClick, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

interface CookiePolicyProps {
  onBack?: () => void;
}

export function CookiePolicy({ onBack }: CookiePolicyProps) {
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
          <span className="font-black text-lg tracking-tight">Cookie Policy</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 bg-purple-50 w-fit px-4 py-1.5 rounded-full mb-8 border border-purple-100">
            <Cookie className="w-4 h-4 text-purple-600" />
            <span className="text-[11px] font-black uppercase tracking-widest text-purple-700">Gestione Cookie 2026</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Cookie Policy</h1>
          <p className="text-[#86868B] font-bold mb-12">Ultimo aggiornamento: 26 Aprile 2026</p>

          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-black mb-6">1. Cosa sono i Cookie</h2>
              <p className="text-[#424245] leading-relaxed text-lg">
                I cookie sono piccoli file di testo che i siti visitati dagli utenti inviano ai loro terminali, dove vengono memorizzati 
                per essere ritrasmessi agli stessi siti in occasione di visite successive.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black mb-6">2. Tipologie di Cookie che utilizziamo</h2>
              <div className="grid grid-cols-1 gap-4">
                <div className="p-6 bg-white rounded-3xl border border-[#D2D2D7]/30 shadow-sm flex gap-6 items-start">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
                    <Settings className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-black mb-1">Cookie Tecnici (Necessari)</h3>
                    <p className="text-[#86868B]">Essenziali per il corretto funzionamento della piattaforma, come la gestione dell'autenticazione e del carrello Token.</p>
                  </div>
                </div>

                <div className="p-6 bg-white rounded-3xl border border-[#D2D2D7]/30 shadow-sm flex gap-6 items-start">
                  <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center shrink-0">
                    <Info className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-black mb-1">Cookie Analitici</h3>
                    <p className="text-[#86868B]">Utilizzati per raccogliere informazioni in forma aggregata sul numero degli utenti e su come questi visitano il sito (es. Google Analytics con IP anonimizzato).</p>
                  </div>
                </div>

                <div className="p-6 bg-white rounded-3xl border border-[#D2D2D7]/30 shadow-sm flex gap-6 items-start">
                  <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0">
                    <MousePointerClick className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-black mb-1">Cookie di Funzionalità</h3>
                    <p className="text-[#86868B]">Permettono all'utente la navigazione in funzione di una serie di criteri selezionati (ad esempio, la lingua o la posizione) al fine di migliorare il servizio reso.</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black mb-6">3. Gestione dei Cookie</h2>
              <p className="text-[#424245] leading-relaxed text-lg pb-4">
                Puoi decidere di disabilitare i cookie attraverso le impostazioni del tuo browser.
              </p>
              <div className="p-8 bg-amber-50 rounded-[2.5rem] border border-amber-200">
                <p className="text-amber-900 font-bold leading-relaxed">
                  Attenzione: la disattivazione dei cookie tecnici potrebbe impedire l'utilizzo di alcune funzionalità fondamentali di CercArtigiano.
                </p>
              </div>
            </section>

            <section className="bg-purple-600 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl font-black mb-6">4. Consenso</h2>
                <p className="text-purple-100 mb-8 leading-relaxed text-lg">
                  Navigando sul nostro sito, accetti l'uso dei cookie in conformità con questa policy. 
                  Ti ricordiamo che puoi modificare le tue preferenze in qualsiasi momento attraverso le impostazioni del browser o il pannello di controllo privacy.
                </p>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
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
