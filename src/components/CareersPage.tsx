import React from 'react';
import { motion } from 'motion/react';
import { Briefcase, Users, Rocket, Mail, ArrowLeft, MapPin, Clock } from 'lucide-react';
import { Button } from './ui/button';

interface CareersPageProps {
  onBack?: () => void;
}

export function CareersPage({ onBack }: CareersPageProps) {
  const positions = [
    {
      title: "Sviluppatore React Senior",
      description: "Aiutaci a costruire un'interfaccia utente ancora più fluida e reattiva.",
      type: "Full-Time",
      location: "Remote Friendly"
    },
    {
      title: "Specialista Successo Clienti",
      description: "Gestisci le relazioni con i nostri artigiani e aiutali a far crescere il loro business.",
      type: "Full-Time",
      location: "Milano"
    },
    {
      title: "Area Manager (Nord/Centro/Sud)",
      description: "Espandi la nostra rete di professionisti sul territorio nazionale.",
      type: "Hybrid",
      location: "Italia"
    }
  ];

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
          <span className="font-black text-lg tracking-tight">Lavora con noi</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 bg-green-50 w-fit px-4 py-1.5 rounded-full mb-8 border border-green-100">
            <Rocket className="w-4 h-4 text-green-600" />
            <span className="text-[11px] font-black uppercase tracking-widest text-green-700">Stiamo Assumendo</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Lavora con noi</h1>
          <p className="text-[#86868B] font-bold mb-12">Ultimo aggiornamento: 26 Aprile 2026</p>

          <section className="mb-20">
            <h2 className="text-3xl font-black mb-8">Entra nel Team di CercArtigiano</h2>
            <div className="bg-white p-10 rounded-[3rem] border border-[#D2D2D7]/30 shadow-sm">
              <p className="text-[#424245] leading-relaxed text-xl mb-0">
                Siamo una startup in continua crescita e siamo sempre alla ricerca di talenti appassionati di tecnologia e artigianato. 
                Se vuoi contribuire a rivoluzionare il mercato del lavoro locale, sei nel posto giusto.
              </p>
            </div>
          </section>

          <section className="mb-20">
            <h2 className="text-3xl font-black mb-10 flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-blue-600" />
              Posizioni Aperte
            </h2>
            <div className="space-y-6">
              {positions.map((pos, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ x: 10 }}
                  className="p-8 bg-white rounded-[2.5rem] border border-[#D2D2D7]/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 group cursor-pointer"
                >
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-[#1D1D1F]">{pos.title}</h3>
                    <p className="text-[#86868B] leading-relaxed">{pos.description}</p>
                    <div className="flex gap-4 pt-2">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-[#424245] bg-[#F5F5F7] px-3 py-1 rounded-full">
                        <Clock className="w-3 h-3" />
                        {pos.type}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        <MapPin className="w-3 h-3" />
                        {pos.location}
                      </span>
                    </div>
                  </div>
                  <Button className="bg-[#1D1D1F] hover:bg-[#1D1D1F]/90 text-white font-black rounded-2xl px-6 h-12 shrink-0">
                    Candidati
                  </Button>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="bg-blue-600 p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10 text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-8 backdrop-blur-md">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-black mb-6">Candidatura Spontanea</h2>
              <p className="text-blue-100 mb-10 text-lg leading-relaxed">
                Non vedi una posizione adatta a te? Non preoccuparti! 
                Inviaci il tuo CV e raccontaci come potresti fare la differenza in CercArtigiano.
              </p>
              <a 
                href="mailto:careers@cercartigiano.it" 
                className="inline-flex items-center gap-3 bg-white text-blue-600 px-10 py-5 rounded-2xl font-black text-lg hover:scale-105 transition-transform"
              >
                <Mail className="w-6 h-6" />
                careers@cercartigiano.it
              </a>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          </section>
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
