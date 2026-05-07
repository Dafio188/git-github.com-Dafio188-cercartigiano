import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle2, Zap, Shield, Star, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

const PLANS = [
  { 
    id: 'base',
    name: "Base", 
    price: "€0", 
    desc: "Per chi muove i primi passi.", 
    features: ["Profilo Standard", "Ricevi 3 Richieste/mese", "Supporto Community"],
    cta: "Attuale",
    popular: false,
    color: "blue"
  },
  { 
    id: 'pro',
    name: "Pro", 
    price: "€29", 
    desc: "Il preferito dai professionisti.", 
    features: ["Badge Certificato", "Richieste Illimitate", "Priorità nelle ricerche", "Supporto 24/7", "Statistiche Avanzate"],
    cta: "Attiva Ora",
    popular: true,
    color: "orange"
  },
  { 
    id: 'elite',
    name: "Elite", 
    price: "€99", 
    desc: "Per agenzie e multi-servizi.", 
    features: ["Tutto del piano Pro", "Account Multi-utente", "Marketing Dedicato", "Lead Esclusivi", "API Access"],
    cta: "Contattaci",
    popular: false,
    color: "purple"
  }
];

export function SubscriptionsView({ user }: any) {
  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <h2 className="text-4xl font-black tracking-tight text-[#1D1D1F]">Piani e Abbonamenti</h2>
        <p className="text-lg text-[#86868B] font-bold">Investi nella tua crescita professionale su CercArtigiano.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map((plan, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -10 }}
            className={cn(
              "relative p-8 rounded-[3rem] border transition-all flex flex-col h-full",
              plan.popular 
                ? "bg-[#1D1D1F] text-white border-transparent shadow-2xl shadow-blue-500/20 scale-105 z-10" 
                : "bg-white text-[#1D1D1F] border-[#D2D2D7]/30 shadow-xl shadow-black/5"
            )}
          >
            {plan.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">
                Consigliato
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-2xl font-black mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-black tracking-tighter">{plan.price}</span>
                <span className="text-sm font-bold opacity-60">/mese</span>
              </div>
              <p className={cn("text-xs font-bold", plan.popular ? "text-white/60" : "text-[#86868B]")}>
                {plan.desc}
              </p>
            </div>

            <div className="space-y-4 mb-10 flex-1">
              {plan.features.map((feat, j) => (
                <div key={j} className="flex items-center gap-3">
                  <CheckCircle2 className={cn("w-5 h-5", plan.popular ? "text-blue-400" : "text-blue-600")} />
                  <span className="text-sm font-bold">{feat}</span>
                </div>
              ))}
            </div>

            <Button 
              className={cn(
                "w-full h-14 rounded-2xl font-black text-lg transition-all active:scale-95 group",
                plan.popular 
                  ? "bg-white text-[#1D1D1F] hover:bg-[#F5F5F7]" 
                  : "bg-[#1D1D1F] text-white hover:bg-black"
              )}
            >
              {plan.cta}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        ))}
      </div>

      <div className="p-8 lg:p-12 bg-blue-600 rounded-[3rem] text-white overflow-hidden relative group">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
             <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/20">
               <Shield className="w-4 h-4 text-white" />
               <span className="text-[10px] font-black uppercase tracking-widest">Garanzia Business</span>
             </div>
             <h3 className="text-3xl font-black tracking-tight">Hai bisogno di una soluzione personalizzata?</h3>
             <p className="text-white/80 font-bold">Inviaci i dati della tua azienda e ti ricontatteremo con un piano su misura per le tue esigenze di volumi elevati.</p>
          </div>
          <Button className="bg-white text-blue-600 hover:bg-white/90 h-16 px-10 rounded-2xl font-black text-xl shadow-2xl">
            Parla con un esperto
          </Button>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
      </div>
    </div>
  );
}
