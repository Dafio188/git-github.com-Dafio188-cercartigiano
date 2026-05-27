import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Search, Home as HomeIcon, Smartphone, Hammer, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { SERVICE_CATEGORIES } from '../constants';
import { BrandLogo } from './BrandLogo';
import { cn } from '../lib/utils';

interface CategoriesPageProps {
  onBack: () => void;
  onSelectCategory?: (categoryId: string, initialAnswers?: Record<string, any>, mappedMessage?: string) => void;
}

export function CategoriesPage({ onBack, onSelectCategory }: CategoriesPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'casa' | 'tech' | 'persona'>('all');

  const tabs = [
    { id: 'all', label: 'Tutti', icon: Hammer },
    { id: 'casa', label: 'Casa', icon: HomeIcon },
    { id: 'tech', label: 'Tech', icon: Smartphone },
    { id: 'persona', label: 'Persona', icon: Users },
  ] as const;

  const filteredCategories = SERVICE_CATEGORIES.filter(cat => {
    const matchesSearch = cat.label.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === 'all') return matchesSearch;
    
    if (activeTab === 'casa') {
      return matchesSearch && [
        'plumbing', 'electrical', 'painter', 'locksmith', 'moving', 
        'cleaning', 'gardening', 'carpentry', 'construction', 'handyman', 'architect'
      ].includes(cat.id);
    }
    if (activeTab === 'tech') {
      return matchesSearch && [
        'it_support', 'appliances', 'photography'
      ].includes(cat.id);
    }
    if (activeTab === 'persona') {
      return matchesSearch && [
        'beauty', 'tutoring', 'elderly_care', 'pet_sitting', 'babysitting', 
        'psychology', 'lawyer', 'accountant', 'physiotherapy', 'mechanic', 'tailor'
      ].includes(cat.id);
    }
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] font-sans pb-24">
      {/* Header */}
      <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#D2D2D7]/30 sticky top-0 w-full z-50 flex items-center justify-between px-6 lg:px-12">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 font-bold text-[#86868B] hover:text-[#1D1D1F] transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="hidden sm:inline">Torna Indietro</span>
        </button>
        
        <div className="flex items-center gap-3">
          <BrandLogo className="w-8 h-8" />
          <span className="font-black text-xl tracking-tight">Esplora Categorie</span>
        </div>
        
        <div className="hidden sm:block">
           <Button variant="ghost" className="font-bold text-blue-600">Serve Aiuto?</Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12 space-y-8">
          <div className="space-y-4">
             <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none">
               Cosa ti serve <br /> <span className="text-blue-600 uppercase italic">esattamente?</span>
             </h1>
             <p className="text-lg text-[#86868B] font-medium max-w-2xl">
               Seleziona il servizio e descrivici il tuo progetto. Ti metteremo in contatto con i migliori artigiani della tua zona.
             </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B] w-5 h-5" />
              <Input 
                placeholder="Cerca un servizio (es. Idraulico, PC, Pulizie...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 bg-white border-[#D2D2D7]/50 rounded-2xl shadow-sm focus-visible:ring-blue-600/20 text-lg"
              />
            </div>
            
            <div className="bg-[#F5F5F7] p-1 rounded-2xl flex border border-[#D2D2D7]/30">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2",
                    activeTab === tab.id ? "bg-white shadow-sm text-blue-600" : "text-[#86868B] hover:text-[#1D1D1F]"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCategories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              whileHover={{ y: -5, scale: 1.02 }}
              onClick={() => onSelectCategory?.(cat.id)}
              className="group p-6 bg-white rounded-[2rem] border border-[#D2D2D7]/30 hover:border-blue-600 hover:shadow-2xl hover:shadow-blue-600/5 transition-all cursor-pointer flex flex-col items-center text-center justify-between min-h-[220px]"
            >
              <div className="w-16 h-16 bg-[#F5F5F7] group-hover:bg-blue-600 rounded-[1.5rem] flex items-center justify-center mb-4 transition-all duration-300 group-hover:rotate-6">
                <cat.icon className="w-8 h-8 text-[#1D1D1F] group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#1D1D1F] leading-tight mb-1">{cat.label}</h3>
                <p className="text-[10px] font-bold text-[#86868B] uppercase tracking-[0.2em] mb-4">Verificato</p>
              </div>
              <div className="w-full h-[1px] bg-[#F5F5F7] my-4" />
              <button className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest">
                Seleziona <ArrowRight className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-24 bg-[#F5F5F7] rounded-[3rem] border-2 border-dashed border-[#D2D2D7]">
            <Hammer className="w-16 h-16 text-[#D2D2D7] mx-auto mb-4" />
            <h3 className="text-2xl font-black text-[#1D1D1F]">Nessuna corrispondenza</h3>
            <p className="text-[#86868B]">Prova a cercare un altro servizio o sfoglia le categorie principali.</p>
          </div>
        )}
      </main>
    </div>
  );
}
