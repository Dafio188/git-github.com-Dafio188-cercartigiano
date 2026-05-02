import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Mail, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

interface PrivacyPolicyProps {
  onBack?: () => void;
}

export function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
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
          <img src="/logo-brand.png" alt="Logo" className="w-8 h-8 object-contain" />
          <span className="font-black text-lg tracking-tight">Privacy Policy</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 bg-blue-50 w-fit px-4 py-1.5 rounded-full mb-8 border border-blue-100">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span className="text-[11px] font-black uppercase tracking-widest text-blue-700">Versione Certificata GDPR</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-[#86868B] font-bold mb-12">Ultimo aggiornamento: 26 Aprile 2026</p>

          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-black mb-6">1. Chi siamo</h2>
              <p className="text-[#424245] leading-relaxed text-lg">
                CercArtigiano ("noi", "nostro" o "il Servizio") è impegnato nella protezione della tua privacy. 
                Questa informativa spiega come raccogliamo, utilizziamo e proteggiamo i tuoi dati personali quando utilizzi la nostra piattaforma.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black mb-6">2. Dati che raccogliamo</h2>
              <div className="space-y-6">
                <div className="p-6 bg-white rounded-3xl border border-[#D2D2D7]/30 shadow-sm">
                  <h3 className="font-black mb-2">Dati di profilo</h3>
                  <p className="text-[#86868B]">Nome, cognome, indirizzo email e numero di telefono forniti durante la registrazione.</p>
                </div>
                <div className="p-6 bg-white rounded-3xl border border-[#D2D2D7]/30 shadow-sm">
                  <h3 className="font-black mb-2">Dati professionali</h3>
                  <p className="text-[#86868B]">Per gli artigiani, raccogliamo specializzazioni, foto dei lavori, tariffe e certificazioni.</p>
                </div>
                <div className="p-6 bg-white rounded-3xl border border-[#D2D2D7]/30 shadow-sm">
                  <h3 className="font-black mb-2">Dati di posizione</h3>
                  <p className="text-[#86868B]">Utilizziamo la tua posizione (con il tuo consenso) per mostrare professionisti o lavori vicini a te.</p>
                </div>
                <div className="p-6 bg-white rounded-3xl border border-[#D2D2D7]/30 shadow-sm">
                  <h3 className="font-black mb-2">Dati di pagamento</h3>
                  <p className="text-[#86868B]">Le transazioni per l'acquisto di Token sono gestite tramite provider sicuri (come Stripe); non conserviamo i dati completi della tua carta.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black mb-6">3. Finalità del trattamento</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Mettere in contatto clienti e artigiani.",
                  "Gestire il sistema di Token e le transazioni.",
                  "Inviare notifiche relative ai lavori o ai messaggi.",
                  "Migliorare la qualità del servizio tramite analisi anonime."
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 p-4 bg-[#F5F5F7] rounded-2xl">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                    <span className="font-medium text-[#1D1D1F]">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-blue-600 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl font-black mb-6">4. Diritti dell'utente</h2>
                <p className="text-blue-100 mb-8 leading-relaxed text-lg">
                  In conformità con il GDPR (Regolamento UE 2016/679), hai il diritto di accedere, rettificare o cancellare i tuoi dati, 
                  nonché il diritto alla portabilità dei dati. Puoi esercitare questi diritti contattandoci all'indirizzo dedicato:
                </p>
                <a 
                  href="mailto:privacy@cercartigiano.it" 
                  className="inline-flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-2xl font-black hover:scale-105 transition-transform"
                >
                  <Mail className="w-5 h-5" />
                  privacy@cercartigiano.it
                </a>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            </section>

            <section>
              <h2 className="text-2xl font-black mb-6">5. Sicurezza</h2>
              <p className="text-[#424245] leading-relaxed text-lg">
                Adottiamo misure di sicurezza tecniche e organizzative per proteggere i tuoi dati da accessi non autorizzati o perdite accidentali. 
                I dati sono ospitati su server sicuri all'interno dell'Unione Europea.
              </p>
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
