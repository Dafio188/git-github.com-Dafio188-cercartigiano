import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { UserProfile } from '../types';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { MapPin, Star, ShieldCheck, ChevronRight, Home } from 'lucide-react';
import { motion } from 'motion/react';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export function SeoLandingPage() {
  const { provincia, comune, categoria } = useParams<{ provincia: string, comune: string, categoria: string }>();
  
  const [professionals, setProfessionals] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);

  const formattedCategoria = categoria ? categoria.charAt(0).toUpperCase() + categoria.slice(1).replace(/-/g, ' ') : '';
  const formattedComune = comune ? comune.charAt(0).toUpperCase() + comune.slice(1).replace(/-/g, ' ') : '';
  const formattedProvincia = provincia ? provincia.toUpperCase() : '';

  useEffect(() => {
    // Aggiorna Meta-Data del documento
    document.title = `I Migliori ${formattedCategoria} a ${formattedComune} | CercArtigiano`;
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', `Trova e confronta i migliori ${formattedCategoria} a ${formattedComune} (${formattedProvincia}). Preventivi gratuiti, recensioni verificate e professionisti pronti ad intervenire.`);
  }, [formattedCategoria, formattedComune, formattedProvincia]);

  useEffect(() => {
    const fetchProfessionals = async () => {
      if (!categoria || !comune || !provincia) return;
      
      setLoading(true);
      try {
        // Query per il comune specifico
        const qComune = query(
          collection(db, 'users'), 
          where('role', '==', 'worker'),
          where('category', '==', formattedCategoria),
          where('citta', '==', formattedComune)
        );
        
        let snapshot = await getDocs(qComune);
        
        if (snapshot.empty) {
          // Fallback alla provincia
          setIsFallback(true);
          const qProvincia = query(
            collection(db, 'users'), 
            where('role', '==', 'worker'),
            where('category', '==', formattedCategoria),
            where('provincia', '==', formattedProvincia)
          );
          snapshot = await getDocs(qProvincia);
        } else {
          setIsFallback(false);
        }
        
        const docs = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            uid: doc.id,
            ...data
          } as unknown as UserProfile;
        });
        
        setProfessionals(docs);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'users');
      } finally {
        setLoading(false);
      }
    };

    fetchProfessionals();
  }, [formattedCategoria, formattedComune, formattedProvincia]);

  const skeletonCards = Array(3).fill(0);

  return (
    <div className="min-h-screen bg-[#FBFBFD] pb-24">
      {/* Header Semplice */}
      <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#D2D2D7]/30 sticky top-0 z-50 flex items-center px-6 lg:px-12">
        <Link to="/" className="flex items-center gap-3">
           <img src="/logo.png" alt="CercArtigiano" className="w-10 h-10 object-contain" />
           <span className="text-xl font-black tracking-tight text-[#1D1D1F]">CERCARTIGIANO</span>
        </Link>
      </header>

      <main className="max-w-5xl mx-auto px-6 lg:px-8 pt-12">
        {/* Dynamic SEO H1 */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#1D1D1F] mb-4">
            Trova i migliori {formattedCategoria} a {formattedComune} ({formattedProvincia}) <span className="block text-blue-600 mt-2">Verificati e Recensiti</span>
          </h1>
          
          {isFallback ? (
             <p className="text-lg md:text-xl text-[#86868B] font-medium max-w-3xl">
               Non ci sono ancora artigiani iscritti a {formattedComune}, ecco i migliori della provincia di {formattedProvincia} pronti a intervenire.
             </p>
          ) : (
             <p className="text-lg md:text-xl text-[#86868B] font-medium max-w-3xl">
               Confronta preventivi, leggi le recensioni dei clienti e affida i tuoi lavori ai migliori professionisti di {formattedComune}.
             </p>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {skeletonCards.map((_, i) => (
              <div key={i} className="bg-white rounded-[2rem] h-40 animate-pulse border border-[#D2D2D7]/30" />
            ))}
          </div>
        ) : professionals.length > 0 ? (
          <div className="space-y-4">
            {professionals.map((pro, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                key={pro.uid}
              >
                <Card className="rounded-[2rem] border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white overflow-hidden group cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex gap-6 items-center">
                      <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border-4 border-white shadow-xl relative overflow-hidden">
                        {pro.photoURL ? (
                          <img src={pro.photoURL} alt={pro.displayName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl font-black text-blue-600">{pro.displayName?.charAt(0).toUpperCase() || pro.nome?.charAt(0).toUpperCase() || 'P'}</span>
                        )}
                        {pro.isVerified && (
                          <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 border-2 border-white shadow-lg">
                            <ShieldCheck className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-black text-[#1D1D1F] flex items-center gap-2">
                              {pro.displayName || pro.nome}
                            </h3>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="inline-flex items-center gap-1 text-sm font-bold text-[#86868B] bg-[#F5F5F7] px-3 py-1 rounded-full">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                {pro.rating || 'Nuovo'}
                              </span>
                              <span className="inline-flex items-center gap-1 text-sm font-bold text-[#86868B]">
                                <MapPin className="w-4 h-4" />
                                {pro.citta || formattedComune}
                              </span>
                            </div>
                          </div>
                          <Link to="/" className="hidden sm:flex h-12 w-12 rounded-full bg-[#F5F5F7] group-hover:bg-blue-600 items-center justify-center transition-colors">
                            <ChevronRight className="w-6 h-6 text-[#86868B] group-hover:text-white transition-colors" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            
            <div className="pt-12 text-center">
               <Link to="/">
                 <Button className="h-14 px-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-xl shadow-blue-500/20">
                    Richiedi un Preventivo Gratis
                 </Button>
               </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] p-12 text-center border border-[#D2D2D7]/30 shadow-sm">
             <div className="w-24 h-24 bg-blue-50 text-blue-600 flex items-center justify-center rounded-3xl mx-auto mb-6">
                <MapPin className="w-10 h-10" />
             </div>
             <h3 className="text-2xl font-black text-[#1D1D1F] mb-3">Nessun {formattedCategoria} disponibile qui</h3>
             <p className="text-lg text-[#86868B] font-medium max-w-lg mx-auto mb-8">
               Attualmente non abbiamo {formattedCategoria} registrati nella provincia di {formattedProvincia}.
             </p>
             <Link to="/">
                 <Button className="h-14 px-8 rounded-full bg-[#1D1D1F] hover:bg-black text-white font-black text-lg">
                    Torna alla Home
                 </Button>
               </Link>
          </div>
        )}
      </main>
    </div>
  );
}
