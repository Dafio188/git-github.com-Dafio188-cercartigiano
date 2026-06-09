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
  ShieldCheck,
  Hammer,
  Filter
} from 'lucide-react';
import { motion } from 'motion/react';
import { SERVICE_CATEGORIES } from '../constants';
import { cn } from '../lib/utils';

export function ProfessionalSearchView({ currentUser }: any) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [professionals, setProfessionals] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

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
    const profName = p.nome || p.displayName || '';
    const matchesSearch = profName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.bio?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <h2 className="text-3xl font-black tracking-tight text-[#1D1D1F]">Trova il professionista perfetto</h2>
        <p className="text-[#86868B] font-medium">Scegli tra i migliori artigiani certificati della tua zona.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86868B]" />
          <Input 
            placeholder="Cerca per nome, specializzazione o parola chiave..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-14 bg-white border-[#D2D2D7]/50 rounded-2xl shadow-sm text-lg focus-visible:ring-primary/20"
          />
        </div>
        <Button variant="outline" className="h-14 px-6 rounded-2xl border-[#D2D2D7]/50 bg-white hover:bg-[#F5F5F7]">
          <Filter className="w-5 h-5 mr-2" />
          Filtri avanzati
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          onClick={() => setSelectedCategory(null)}
          className={cn(
            "rounded-full h-10 whitespace-nowrap px-6 font-bold",
            selectedCategory === null ? "bg-[#1D1D1F] text-white" : "border-[#D2D2D7]/50 text-[#1D1D1F]"
          )}
        >
          Tutti
        </Button>
        {SERVICE_CATEGORIES.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? "default" : "outline"}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              "rounded-full h-10 whitespace-nowrap px-6 font-bold",
              selectedCategory === cat.id ? "bg-[#1D1D1F] text-white" : "border-[#D2D2D7]/50 text-[#1D1D1F]"
            )}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-80 bg-[#F5F5F7] rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredProfessionals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfessionals.map((prof) => (
            <motion.div
              key={prof.uid || prof.id}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="rounded-[2rem] border-none shadow-xl shadow-black/5 overflow-hidden bg-white group cursor-pointer">
                <CardContent className="p-0">
                  <div className="relative h-48 bg-gradient-to-br from-blue-500 to-indigo-600">
                    {prof.photoURL && (
                      <img 
                        src={prof.photoURL} 
                        alt={prof.nome || prof.displayName || 'Professionista'} 
                        className="w-full h-full object-cover mix-blend-overlay opacity-60 group-hover:scale-105 transition-transform duration-500" 
                      />
                    )}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm font-black shadow-sm">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span>{prof.rating || 'New'}</span>
                    </div>
                    {prof.isVerified && (
                      <div className="absolute top-4 left-4 bg-blue-500 text-white p-1.5 rounded-full shadow-lg">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xl font-black text-[#1D1D1F] tracking-tight">{prof.nome || prof.displayName || 'Professionista'}</h4>
                        <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mt-1">
                          {SERVICE_CATEGORIES.find(c => c.id === prof.category)?.label || 'Artigiano'}
                        </p>
                      </div>
                      <div className="p-3 bg-[#F5F5F7] rounded-2xl">
                        <Hammer className="w-5 h-5 text-[#1D1D1F]" />
                      </div>
                    </div>
                    
                    <p className="text-[#86868B] text-sm line-clamp-2 leading-relaxed">
                      {prof.bio || "Nessuna biografia fornita."}
                    </p>

                    <div className="flex items-center gap-2 text-[#86868B] text-sm">
                      <MapPin className="w-4 h-4" />
                      <span className="font-medium">{prof.location?.address || 'Provincia non specificata'}</span>
                    </div>

                    <Button className="w-full h-12 rounded-xl bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#1D1D1F] font-black group-hover:bg-blue-600 group-hover:text-white transition-all">
                      Visualizza Profilo
                      <ChevronRight className="ml-1 w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-[#F5F5F7] rounded-[3rem] border-2 border-dashed border-[#D2D2D7]">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-black/5">
            <Search className="w-10 h-10 text-[#D2D2D7]" />
          </div>
          <h3 className="text-xl font-black text-[#1D1D1F] mb-2">Nessun professionista trovato</h3>
          <p className="text-[#86868B]">Prova a cambiare categoria o termini di ricerca.</p>
        </div>
      )}
    </div>
  );
}
