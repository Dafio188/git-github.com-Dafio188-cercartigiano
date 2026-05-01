import React from 'react';
import { motion } from 'motion/react';
import { ScrollText, Mail, ArrowLeft, Gavel } from 'lucide-react';
import { Button } from './ui/button';

interface TermsOfServiceProps {
  onBack?: () => void;
}

export function TermsOfService({ onBack }: TermsOfServiceProps) {
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
          <span className="font-black text-lg tracking-tight">Termini di Servizio</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 bg-orange-50 w-fit px-4 py-1.5 rounded-full mb-8 border border-orange-100">
            <Gavel className="w-4 h-4 text-orange-600" />
            <span className="text-[11px] font-black uppercase tracking-widest text-orange-700">Contratto di Servizio 2026</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Termini e Condizioni</h1>
          <p className="text-[#86868B] font-bold mb-12">Ultimo aggiornamento: 26 Aprile 2026</p>

          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-black mb-6">1. Accettazione dei Termini</h2>
              <p className="text-[#424245] leading-relaxed text-lg">
                Registrandosi o utilizzando il servizio CercArtigiano, l'utente accetta di essere vincolato dai presenti Termini e Condizioni d'uso. 
                Se non si accettano tali termini, è necessario interrompere immediatamente l'utilizzo del servizio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black mb-6">2. Il Servizio</h2>
              <p className="text-[#424245] leading-relaxed text-lg">
                CercArtigiano è una piattaforma marketplace che facilita l'incontro tra clienti che necessitano di servizi artigianali e professionisti qualificati. 
                CercArtigiano non è parte dei contratti stipulati tra clienti e artigiani e non ne garantisce l'esecuzione.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black mb-6">3. Sistema di Token</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white rounded-3xl border border-[#D2D2D7]/30 shadow-sm">
                  <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-blue-600 font-black">€</div>
                  <h3 className="font-black mb-2">Non rimborsabili</h3>
                  <p className="text-sm text-[#86868B]">I Token acquistati non sono rimborsabili, salvo nei casi espressamente previsti dalla legge.</p>
                </div>
                <div className="p-6 bg-white rounded-3xl border border-[#D2D2D7]/30 shadow-sm">
                  <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-blue-600 font-black">5</div>
                  <h3 className="font-black mb-2">Costo Contatto</h3>
                  <p className="text-sm text-[#86868B]">Contattare un professionista richiede l'utilizzo di 5 Token (salvo promozioni).</p>
                </div>
                <div className="p-6 bg-white rounded-3xl border border-[#D2D2D7]/30 shadow-sm">
                  <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-blue-600 font-black">!</div>
                  <h3 className="font-black mb-2">Valore Interno</h3>
                  <p className="text-sm text-[#86868B]">I Token non hanno valore monetario al di fuori della piattaforma CercArtigiano.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black mb-6">4. Comportamento dell'Utente</h2>
              <ul className="space-y-4">
                {[
                  "Fornire informazioni veritiere e accurate.",
                  "Non caricare contenuti offensivi, illegali o che violino diritti di terzi.",
                  "Non aggirare i sistemi di sicurezza o di pagamento della piattaforma."
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-[#D2D2D7]/30">
                    <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                    <span className="font-bold text-[#1D1D1F]">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black mb-6">5. Limitazione di Responsabilità</h2>
              <div className="p-8 bg-[#F5F5F7] rounded-[2.5rem] border border-[#D2D2D7]/30">
                <p className="text-[#424245] leading-relaxed text-lg italic">
                  "CercArtigiano non è responsabile per la qualità dei lavori eseguiti dagli artigiani o per eventuali danni diretti o indiretti 
                  derivanti dai rapporti instaurati tramite la piattaforma."
                </p>
              </div>
            </section>

            <section className="bg-[#1D1D1F] p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl font-black mb-6">6. Contatti Legali</h2>
                <p className="text-gray-400 mb-8 leading-relaxed text-lg">
                  Per qualsiasi controversia o richiesta di chiarimento, è possibile contattare l'ufficio legale all'indirizzo:
                </p>
                <a 
                  href="mailto:legal@cercartigiano.it" 
                  className="inline-flex items-center gap-3 bg-white text-[#1D1D1F] px-8 py-4 rounded-2xl font-black hover:scale-105 transition-transform"
                >
                  <Mail className="w-5 h-5" />
                  legal@cercartigiano.it
                </a>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
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
