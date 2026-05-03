import logoUrl from '../assets/logo.png';
import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { SERVICE_CATEGORIES } from '../constants';

interface CategoriesPageProps {
  onBack: () => void;
  onSelectCategory?: (categoryId: string) => void;
}

export function CategoriesPage({ onBack, onSelectCategory }: CategoriesPageProps) {
  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] font-sans">
      {/* Header */}
      <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#D2D2D7]/30 sticky top-0 w-full z-50 flex items-center justify-between px-6 lg:px-12">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 font-bold text-[#86868B] hover:text-[#1D1D1F] transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Torna Indietro
        </button>
        
        <div className="flex items-center gap-3">
          <img 
            src={logoUrl} 
            alt="Logo" 
            className="w-8 h-8 object-contain" 
          />
          <span className="font-black text-xl tracking-tight">Esplora Categorie</span>
        </div>
        
        <div className="w-24 md:w-32 lg:w-40" /> {/* Spacer */}
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Tutti i Servizi Professionali</h1>
          <p className="text-xl text-[#86868B] font-medium">Trova il professionista perfetto per ogni tua esigenza, dalla casa al benessere, fino alla consulenza legale.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {SERVICE_CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ y: -5, scale: 1.02 }}
              onClick={() => onSelectCategory?.(cat.id)}
              className="group p-6 bg-white rounded-[2rem] border border-[#D2D2D7]/30 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer flex flex-col items-center text-center justify-between h-full"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 bg-[#F5F5F7] group-hover:bg-blue-50 rounded-2xl flex items-center justify-center mb-4 transition-colors">
                <cat.icon className="w-6 h-6 md:w-8 md:h-8 text-[#1D1D1F] group-hover:text-blue-600 transition-colors" />
              </div>
              <div>
                <h3 className="text-sm md:text-base font-black text-[#1D1D1F] leading-tight mb-1">{cat.label}</h3>
                <p className="text-[10px] md:text-xs font-bold text-[#86868B] uppercase tracking-widest">+50 Esperti</p>
              </div>
              <Button variant="ghost" size="sm" className="mt-4 p-0 h-auto text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                Vedi <ArrowRight className="ml-1 w-3 h-3" />
              </Button>
            </motion.div>
          ))}
        </div>

        <div className="mt-24 p-12 bg-blue-600 rounded-[3rem] text-white text-center">
          <h2 className="text-3xl font-black mb-4">Non trovi quello che cerchi?</h2>
          <p className="text-blue-100 font-medium mb-8 max-w-2xl mx-auto">Il nostro database è in continua espansione. Se hai bisogno di un servizio specifico non ancora elencato, contattaci.</p>
          <Button className="bg-white text-blue-600 hover:bg-white/90 rounded-full font-black px-8 h-12">Contatta Supporto</Button>
        </div>
      </main>

      <footer className="py-12 border-t border-[#D2D2D7]/30 text-center">
        <p className="text-[10px] text-[#86868B] font-black uppercase tracking-widest">
          © 2026 CercArtigiano. Qualità e Professionalità.
        </p>
      </footer>
    </div>
  );
}
