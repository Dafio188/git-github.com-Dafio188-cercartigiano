import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { useSearchParams } from 'react-router-dom';
import { 
  Zap, 
  Star, 
  ArrowRight, 
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { loadStripe } from '@stripe/stripe-js';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const WORKER_PACKS = [
  {
    id: 'worker_basic',
    name: 'Pack Crescita',
    tokens: 50,
    price: 39.00,
    desc: 'Perfetto per chi vuole iniziare a ricevere regolarmente richieste qualificate.',
    popular: false,
  },
  {
    id: 'worker_pro',
    name: 'Pack Professionista',
    tokens: 150,
    price: 99.00,
    desc: 'La scelta migliore per gli artigiani che vogliono dominare il mercato locale.',
    popular: true,
  },
  {
    id: 'worker_expert',
    name: 'Pack Expert',
    tokens: 400,
    price: 249.00,
    desc: 'Massima potenza. Crediti illimitati per non perdere nessuna opportunità.',
    popular: false,
  }
];

const CLIENT_PACKS = [
  {
    id: 'client_premium',
    name: 'Richiesta Premium',
    tokens: 1,
    price: 15.00,
    desc: 'Dai visibilità prioritaria al tuo annuncio e ricevi i migliori preventivi subito.',
  },
  {
    id: 'client_vip',
    name: 'VIP Pack (5 Richieste)',
    tokens: 5,
    price: 49.00,
    desc: 'Gestisci più lavori o ristrutturazioni complesse con assistenza prioritaria.',
  }
];

export function CreditsView({ user }: { user: any }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [stripeLinks, setStripeLinks] = useState<any>(null);
  const isWorker = user?.role === 'worker';

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const snap = await getDoc(doc(db, 'adminSettings', 'config'));
        if (snap.exists()) {
          setStripeLinks(snap.data().stripeLinks);
        }
      } catch (e) {
        console.error("Error fetching stripe links config", e);
      }
    };
    fetchConfig();
  }, []);

  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');
  const tokensBought = searchParams.get('tokens');

  const handlePurchase = async (packId: string, tokens: number) => {
    setLoading(packId);
    
    // Check if we have a direct Stripe link for this pack
    const directLink = stripeLinks?.[packId];
    if (directLink) {
      // Append some query params to the direct link if possible, 
      // but Stripe payment links don't usually support dynamic metadata via URL easily 
      // unless you use client_reference_id.
      // We will open the link. Stripe will handle the payment.
      // WE NEED TO TELL THE USER THEY MUST ATTACH USERID TO THE LINK IN STRIPE or use a Webhook.
      window.open(directLink, '_blank');
      setLoading(null);
      return;
    }

    // Fallback to server-side dynamic session
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          priceId: `price_${packId}`, // Match server mapping
          userId: user.id || user.uid,
          tokens 
        }),
      });

      const { id, url } = await response.json();
      
      if (url) {
        window.location.assign(url);
      } else {
        const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');
        if (stripe && id) {
          (stripe as any).redirectToCheckout({ sessionId: id });
        }
      }
    } catch (error) {
      console.error("Stripe Error:", error);
      alert("Errore durante il collegamento a Stripe");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-16 animate-in fade-in duration-700">
      
      {success && (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-green-50 border border-green-200 p-8 rounded-[2rem] text-center space-y-4 shadow-lg shadow-green-500/10"
        >
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto text-white">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-green-900">Pagamento Completato!</h2>
          <p className="text-green-800/70 font-bold">
            Abbiamo accreditato i Token sul tuo account. 
            Riceverai la fattura pro-forma tra pochi istanti via email.
          </p>
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-8"
            onClick={() => setSearchParams({})}
          >
            Continua
          </Button>
        </motion.div>
      )}

      {canceled && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 border border-red-200 p-6 rounded-[2rem] text-center"
        >
          <p className="text-red-800 font-bold">Pagamento annullato. Nessun addebito è stato effettuato.</p>
          <Button variant="link" onClick={() => setSearchParams({})} className="text-red-900 font-black">Riprova</Button>
        </motion.div>
      )}

      {/* Header Section */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 bg-[#E8F1FF] text-[#0066FF] px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-wider">
          <Zap className="w-3 h-3 fill-current" />
          Cercartigiano Store
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-[#1D1D1F]">
          {isWorker ? (
            <>Il Tuo <span className="italic text-[#0066FF]">Successo</span> Professionale</>
          ) : (
            <>Potenzia il Tuo <span className="italic text-[#0066FF]">Annuncio</span></>
          )}
        </h1>
        
        <p className="max-w-2xl mx-auto text-lg md:text-xl font-bold text-[#86868B] leading-relaxed">
          {isWorker 
            ? "Scegli il pacchetto di Token più adatto alle tue esigenze per inviare preventivi di qualità e scalare la classifica degli esperti."
            : "Scegli un piano Premium per far risaltare la tua richiesta, ottenere visibilità prioritaria e ricevere i migliori preventivi in tempo record."
          }
        </p>
      </div>

      {isWorker ? (
        /* WORKER VIEW */
        <div className="space-y-12">
          {/* Banner Info */}
          <div className="bg-white rounded-[2.5rem] border border-[#D2D2D7]/30 p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm">
             <div className="w-16 h-16 md:w-20 md:h-20 bg-[#FFF5E8] rounded-2xl flex items-center justify-center shrink-0">
               <Zap className="w-8 h-8 text-[#FF9500] fill-[#FF9500]" />
             </div>
             <div className="space-y-2 text-center md:text-left">
                <h3 className="text-2xl font-black text-[#1D1D1F]">Area Professionisti</h3>
                <p className="text-sm font-bold text-[#86868B] leading-relaxed">
                  I Token sono la moneta di scambio per la tua crescita. Ogni invio di preventivo costa <span className="text-[#1D1D1F]">1 Token</span>. Questo garantisce serietà e valore alla tua offerta, proteggendoti dalla concorrenza di massa.
                </p>
             </div>
          </div>

          {/* Pricing Grid Workers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {WORKER_PACKS.map((pack) => (
              <motion.div
                key={pack.id}
                whileHover={{ y: -8 }}
                className={cn(
                  "relative p-10 rounded-[3rem] border transition-all flex flex-col h-full",
                  pack.popular 
                    ? "bg-[#1D1D1F] border-transparent text-white shadow-3xl shadow-black/20 scale-105 z-10" 
                    : "bg-white border-[#D2D2D7]/30 text-[#1D1D1F]"
                )}
              >
                {pack.popular && (
                  <div className="absolute top-8 right-8 bg-[#0066FF] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                    Top Value
                  </div>
                )}
                
                <div className="space-y-1 mt-4">
                  <h4 className="text-2xl font-black">{pack.name}</h4>
                  <div className={cn("text-[10px] font-black uppercase tracking-widest", pack.popular ? "text-[#0066FF]" : "text-[#86868B]")}>
                    {pack.tokens} Token
                  </div>
                </div>

                <div className="my-10 space-y-1">
                  <div className="text-5xl font-black tracking-tighter">
                    <span className="text-2xl align-top mr-1">€</span>
                    {pack.price.toFixed(2).split('.')[0]}
                    <span className="text-2xl">.{pack.price.toFixed(2).split('.')[1]}</span>
                  </div>
                </div>

                <p className={cn("text-xs font-bold leading-relaxed mb-10 h-10", pack.popular ? "text-white/60" : "text-[#86868B]")}>
                  {pack.desc}
                </p>

                <Button 
                  onClick={() => handlePurchase(pack.id, pack.tokens)}
                  disabled={!!loading}
                  className={cn(
                    "w-full h-14 rounded-2xl font-black text-sm mt-auto shadow-lg transition-transform active:scale-95",
                    pack.popular 
                      ? "bg-[#0066FF] hover:bg-[#0055DD] text-white" 
                      : "bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#1D1D1F] shadow-none"
                  )}
                >
                  {loading === pack.id ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Scegli Pack"
                  )}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        /* CLIENT VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: Why Premium */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 text-[#1D1D1F]">
              <TrendingUp className="w-6 h-6 text-[#0066FF]" />
              <h3 className="text-3xl font-black tracking-tight uppercase tracking-widest">Area Clienti</h3>
            </div>
            
            <Card className="rounded-[2.5rem] border-[#D2D2D7]/30 bg-white p-10 space-y-10 shadow-lg relative overflow-hidden group">
               <div className="flex items-center gap-3 relative z-10 transition-transform group-hover:translate-x-2">
                 <ShieldCheck className="w-6 h-6 text-[#0066FF]" />
                 <h4 className="text-xl font-black text-[#1D1D1F]">Perché scegliere Premium?</h4>
               </div>
               
               <ul className="space-y-8 relative z-10">
                 {[
                   { t: 'Visibilità Prolungata', d: 'La tua richiesta resta attiva per 30 giorni (doppio del piano base).' },
                   { t: 'Posizionamento Top', d: 'Sarai sempre tra i primi risultati visti dagli artigiani.' },
                   { t: 'Stile Distintivo', d: 'Badge Premium per attirare i professionisti più esperti.' },
                   { t: 'Notifiche Prioritarie', d: 'Avvisiamo subito i migliori pro della tua zona.' },
                 ].map((item, i) => (
                   <li key={i} className="flex gap-4">
                     <div className="w-2 h-2 rounded-full bg-[#0066FF] mt-2 shrink-0" />
                     <div className="space-y-1">
                        <div className="font-black text-[#1D1D1F] leading-none">{item.t}</div>
                        <div className="text-sm font-bold text-[#86868B] leading-relaxed">{item.d}</div>
                     </div>
                   </li>
                 ))}
               </ul>
               <div className="absolute top-0 right-0 w-64 h-64 bg-[#0066FF]/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
            </Card>
          </div>

          {/* Right: Premium Packs */}
          <div className="space-y-8">
            {CLIENT_PACKS.map((pack) => (
              <motion.div
                key={pack.id}
                whileHover={{ x: 10 }}
                className="bg-white rounded-[2.5rem] border border-[#D2D2D7]/30 p-10 flex flex-col gap-8 shadow-lg hover:shadow-2xl transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h4 className="text-2xl font-black text-[#1D1D1F] tracking-tight">{pack.name}</h4>
                    <div className="inline-block bg-[#E8F1FF] text-[#0066FF] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                       {pack.tokens} Credito Premium
                    </div>
                  </div>
                  <div className="text-2xl font-black text-[#1D1D1F]">€ {pack.price.toFixed(2)}</div>
                </div>

                <p className="text-sm font-bold text-[#86868B] leading-relaxed">
                  {pack.desc}
                </p>

                <Button 
                  onClick={() => handlePurchase(pack.id, pack.tokens)}
                  disabled={!!loading}
                  className="w-full h-16 rounded-2xl bg-[#1D1D1F] hover:bg-black text-white font-black text-base shadow-xl active:scale-95 transition-all"
                >
                   {loading === pack.id ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Attiva Ora"
                  )}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Section */}
      <div className="pt-16 border-t border-[#D2D2D7]/30 flex flex-col md:flex-row items-center justify-between gap-8 opacity-60">
        <div className="flex items-center gap-4">
          <CreditCard className="w-10 h-10 text-[#86868B]" />
          <div>
            <h5 className="font-black text-[#1D1D1F] text-lg uppercase tracking-tight">Stripe Security</h5>
          </div>
        </div>
        
        <div className="text-center md:text-right">
           <div className="text-[10px] font-black uppercase tracking-widest text-[#1D1D1F]">Safe Payment Gateway</div>
           <div className="text-xs font-bold text-[#86868B]">Transazioni crittografate end-to-end</div>
        </div>
      </div>
    </div>
  );
}
