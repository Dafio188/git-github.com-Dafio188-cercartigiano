import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { UserProfile } from '../types';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { 
  Search, 
  Star, 
  MapPin, 
  ChevronRight, 
  Shield,
  Hammer,
  Filter,
  LayoutGrid,
  Map as MapIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SERVICE_CATEGORIES } from '../constants';
import { cn } from '../lib/utils';
import { ArtisanMap } from './ArtisanMap';

export function ProfessionalSearchView({ currentUser }: any) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [professionals, setProfessionals] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  useEffect(() => {
    const fetchProfessionals = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'users'), 
          where('role', '==', 'worker')
        );
        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            uid: doc.id,
            ...data
          } as unknown as UserProfile;
        });
        setProfessionals(docs);
      } catch (error) {
        console.error("Error fetching professionals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfessionals();
  }, []);

  const filteredProfessionals = professionals.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    
    // Check skills labels for search match
    const skillLabels = (p.skills || []).map(sId => {
      const label = sId.split('_').slice(1).join(' ').replace(/_/g, ' ');
      return label.toLowerCase();
    });

    const matchesSearch = p.displayName?.toLowerCase().includes(searchLower) || 
                         p.bio?.toLowerCase().includes(searchLower) ||
                         skillLabels.some(l => l.includes(searchLower));

    const matchesCategory = !selectedCategory || (p.categories || []).includes(selectedCategory) || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <h2 className="text-3xl font-black tracking-tight text-[#1D1D1F]">Trova il professionista perfetto</h2>
        <p className="text-[#86868B] font-medium leading-relaxed">
          Cerca tra i migliori artigiani d'Italia. Filtra per specializzazione specifica come <strong>fotovoltaico</strong>, <strong>domotica</strong> o <strong>rifacimento bagno</strong>.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86868B]" />
          <Input 
            placeholder="Cerca 'climatizzatori', 'allarme', 'piastrelle'..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-14 bg-white border-[#D2D2D7]/50 rounded-2xl shadow-sm text-lg focus-visible:ring-primary/20"
          />
        </div>
        <div className="flex gap-2">
          <div className="bg-[#F5F5F7] p-1 rounded-2xl flex border border-[#D2D2D7]/30">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-3 rounded-xl transition-all",
                viewMode === 'grid' ? "bg-white shadow-sm text-blue-600" : "text-[#86868B] hover:text-[#1D1D1F]"
              )}
            >
              <LayoutGrid className="w-6 h-6" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={cn(
                "p-3 rounded-xl transition-all",
                viewMode === 'map' ? "bg-white shadow-sm text-blue-600" : "text-[#86868B] hover:text-[#1D1D1F]"
              )}
            >
              <MapIcon className="w-6 h-6" />
            </button>
          </div>
          <Button variant="outline" className="h-14 px-6 rounded-2xl border-[#D2D2D7]/50 bg-white hover:bg-[#F5F5F7]">
            <Filter className="w-5 h-5 mr-2" />
            Filtri
          </Button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          onClick={() => setSelectedCategory(null)}
          className={cn(
            "rounded-full h-10 whitespace-nowrap px-6 font-bold",
            selectedCategory === null ? "bg-blue-600 text-white" : "border-[#D2D2D7]/50 text-[#1D1D1F] hover:bg-[#F5F5F7]"
          )}
        >
          Tutti i settori
        </Button>
        {SERVICE_CATEGORIES.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? "default" : "outline"}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              "rounded-full h-10 whitespace-nowrap px-6 font-bold flex items-center gap-2",
              selectedCategory === cat.id ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "border-[#D2D2D7]/50 text-[#1D1D1F] hover:bg-[#F5F5F7]"
            )}
          >
            <cat.icon className="w-4 h-4" />
            {cat.label}
          </Button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
               viewMode === 'grid' 
                 ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                 : "h-[600px] bg-[#F5F5F7] rounded-[3rem] animate-pulse w-full"
            )}
          >
            {viewMode === 'grid' && [1,2,3].map(i => (
              <div key={i} className="h-80 bg-[#F5F5F7] rounded-3xl animate-pulse" />
            ))}
          </motion.div>
        ) : filteredProfessionals.length > 0 ? (
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProfessionals.map((prof) => (
                  <motion.div
                    key={prof.uid || prof.id}
                    whileHover={{ y: -8 }}
                    className="h-full"
                  >
                    <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-black/[0.03] overflow-hidden bg-white group cursor-pointer h-full flex flex-col">
                      <CardContent className="p-0 flex flex-col h-full">
                        <div className="relative h-56 overflow-hidden">
                          {prof.photoURL ? (
                            <img 
                              src={prof.photoURL} 
                              alt={prof.displayName} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                            />
                          ) : (
                            <div className="w-full h-full bg-[#1D1D1F] flex items-center justify-center">
                               <Hammer className="w-16 h-16 text-white/10" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                          <div className="absolute top-4 right-4 bg-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm font-black shadow-lg">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span>{prof.rating || 'New'}</span>
                          </div>
                          {prof.isVerified && (
                            <div className="absolute top-4 left-4 bg-blue-500 text-white p-2 rounded-full shadow-lg">
                              <Shield className="w-5 h-5" />
                            </div>
                          )}
                           <div className="absolute bottom-4 left-6">
                             <div className="flex flex-wrap gap-1">
                               {(prof.categories || []).map(catId => (
                                 <span key={catId} className="px-3 py-1 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-full text-[9px] font-black uppercase tracking-widest">
                                   {SERVICE_CATEGORIES.find(c => c.id === catId)?.label}
                                 </span>
                               ))}
                             </div>
                           </div>
                        </div>

                        <div className="p-8 flex flex-col flex-1 space-y-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-2xl font-black text-[#1D1D1F] tracking-tight">{prof.displayName || prof.nome || 'Artigiano Professionista'}</h4>
                              <div className="flex items-center gap-2 text-[#86868B] text-sm font-bold mt-1">
                                <MapPin className="w-4 h-4 text-blue-500" />
                                <span>{prof.citta || 'Zona non specificata'}</span>
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-[#86868B] text-sm line-clamp-3 leading-relaxed flex-1">
                            {prof.bio || "Professionista specializzato pronto ad ascoltare le tue esigenze e fornire un preventivo su misura."}
                          </p>

                          {prof.skills && prof.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 py-2">
                               {prof.skills.slice(0, 3).map((skillId, idx) => {
                                 const label = skillId.split('_').slice(1).join(' ').replace(/_/g, ' ');
                                 return (
                                   <span key={idx} className="px-3 py-1.5 bg-[#F5F5F7] text-[#1D1D1F] rounded-xl text-[10px] font-black uppercase tracking-tight">
                                     {label}
                                   </span>
                                 );
                               })}
                               {prof.skills.length > 3 && (
                                 <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black">
                                   +{prof.skills.length - 3}
                                 </span>
                               )}
                            </div>
                          )}
      
                          <div className="pt-4 border-t border-[#F2F2F7] flex items-center justify-between">
                             <div className="flex flex-col">
                               <span className="text-[10px] font-black text-[#86868B] uppercase tracking-widest">Tariffa Media</span>
                               <span className="text-lg font-black text-[#1D1D1F]">€{prof.hourlyRate || 35}<span className="text-sm font-bold text-[#86868B]">/h</span></span>
                             </div>
                             <Button className="h-12 px-6 rounded-2xl bg-[#1D1D1F] hover:bg-black text-white font-black group-hover:bg-blue-600 transition-all shadow-xl shadow-black/5">
                               Contatta
                               <ChevronRight className="ml-1 w-4 h-4" />
                             </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="h-[650px] w-full">
                <ArtisanMap 
                  professionals={filteredProfessionals} 
                  center={currentUser?.location}
                />
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-[#F5F5F7] rounded-[3rem] border-2 border-dashed border-[#D2D2D7]"
          >
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-black/5">
              <Search className="w-10 h-10 text-[#D2D2D7]" />
            </div>
            <h3 className="text-xl font-black text-[#1D1D1F] mb-2">Nessun professionista trovato</h3>
            <p className="text-[#86868B]">Prova a cercare termini più generici o cambia categoria.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
