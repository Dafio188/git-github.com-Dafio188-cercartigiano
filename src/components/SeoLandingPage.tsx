import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from './ui/button';
import { Shield, Home, CheckCircle2 as CheckCircleIcon } from 'lucide-react';
import { motion } from 'motion/react';

export function SeoLandingPage() {
  const { regione, provincia, comune, categoria } = useParams<{ regione: string, provincia: string, comune: string, categoria: string }>();
  const navigate = useNavigate();
  
  const formattedCategoria = categoria ? categoria.charAt(0).toUpperCase() + categoria.slice(1).replace(/-/g, ' ') : '';
  const formattedComune = comune ? comune.charAt(0).toUpperCase() + comune.slice(1).replace(/-/g, ' ') : '';
  const formattedProvincia = provincia ? provincia.toUpperCase() : '';
  const formattedRegione = regione ? regione.charAt(0).toUpperCase() + regione.slice(1).replace(/-/g, ' ') : '';

  // Body Copy basato sul Template
  const bodyCopy = `Hai bisogno di un intervento rapido a ${formattedComune}? Che si tratti di un'urgenza o di un progetto programmato, CercArtigiano.com ti mette in contatto con i professionisti più qualificati della zona di ${formattedProvincia}.`;
  
  // JSON-LD per LLM Optimization
  useEffect(() => {
    // Rimuovi eventuale script precedente
    const existingScript = document.getElementById('seo-jsonld');
    if (existingScript) {
      existingScript.remove();
    }

    const jsonLdData = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": `I Migliori ${formattedCategoria} a ${formattedComune}`,
      "description": `Trova e confronta i migliori ${formattedCategoria} a ${formattedComune} (${formattedProvincia}). Preventivi gratuiti, recensioni verificate.`,
      "areaServed": {
        "@type": "City",
        "name": formattedComune,
        "containedInPlace": {
           "@type": "AdministrativeArea",
           "name": formattedProvincia
        }
      },
      "provider": {
        "@type": "Organization",
        "name": "CercArtigiano"
      }
    };

    const script = document.createElement('script');
    script.id = 'seo-jsonld';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(jsonLdData);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('seo-jsonld');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [formattedCategoria, formattedComune, formattedProvincia]);

  const seoTitle = `I Migliori ${formattedCategoria} a ${formattedComune} | CercArtigiano`;
  const seoDescription = `Trova e confronta i migliori ${formattedCategoria} a ${formattedComune} (${formattedProvincia}). Preventivi gratuiti, recensioni verificate e professionisti pronti ad intervenire.`;

  // Navigate to home and trigger job creation flow with prefilled data
  const handleRequestQuote = () => {
    // In un'applicazione reale potremmo passare stato tramite il router 
    // per pre-aprire il form con la categoria e città selezionata
    navigate(`/?action=new_job&category=${categoria}&city=${comune}`);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] pb-24">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
      </Helmet>
      {/* Header Semplice */}
      <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#D2D2D7]/30 sticky top-0 z-50 flex items-center px-6 lg:px-12">
        <Link to="/" className="flex items-center gap-3">
           <img src="/logo.png" alt="CercArtigiano" className="w-10 h-10 object-contain" />
           <span className="text-xl font-black tracking-tight text-[#1D1D1F]">CERCARTIGIANO</span>
        </Link>
      </header>

      <main className="max-w-5xl mx-auto px-6 lg:px-8 pt-12 md:pt-20">
        <article className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Dynamic SEO Content */}
          <section className="mb-12 lg:mb-0">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[#1D1D1F] mb-6 leading-tight">
              Trova il miglior {formattedCategoria} a {formattedComune} ({formattedProvincia})
            </h1>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full font-bold text-sm mb-8">
              <Shield className="w-4 h-4" />
              Verificato e Recensito
            </div>
            
            <div className="prose prose-lg text-[#86868B] font-medium max-w-3xl mb-12">
              <p className="text-xl leading-relaxed">
                {bodyCopy}
              </p>
              
              <h2 className="text-2xl font-black text-[#1D1D1F] mt-10 mb-6">Perché scegliere i nostri artigiani:</h2>
              <ul className="space-y-5">
                <li className="flex gap-4 items-start">
                  <CheckCircleIcon className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                  <span><strong className="text-[#1D1D1F] block mb-1">Trasparenza Fiscale</strong> Ricevi fatture elettroniche certificate tramite integrazione OpenAPI/SDI.</span>
                </li>
                <li className="flex gap-4 items-start">
                  <CheckCircleIcon className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                  <span><strong className="text-[#1D1D1F] block mb-1">Recensioni Verificate</strong> Leggi i feedback reali dei tuoi concittadini a {formattedComune}.</span>
                </li>
                <li className="flex gap-4 items-start">
                  <CheckCircleIcon className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                  <span><strong className="text-[#1D1D1F] block mb-1">Prossimità e Rapidità</strong> Supporta l'economia locale scegliendo chi vive e lavora nel tuo territorio per un intervento in tempi record.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Call To Action Box (Lead Generation) */}
          <section>
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5 }}
               className="bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl shadow-blue-900/5 border border-[#D2D2D7]/30 text-center"
            >
              <div className="w-20 h-20 bg-blue-50 text-blue-600 flex items-center justify-center rounded-3xl mx-auto mb-6 transform -rotate-6">
                <img src="/logo.png" alt="Icon" className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-black text-[#1D1D1F] mb-4">Richiedi un Preventivo</h3>
              <p className="text-[#86868B] font-medium mb-8">
                Descrivi il lavoro in pochi passi e ricevi offerte dai migliori {formattedCategoria} di {formattedComune} e provincia.
              </p>

              <Button 
                onClick={handleRequestQuote}
                className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xl shadow-xl shadow-blue-500/20 mb-4 transition-all hover:scale-[1.02]"
              >
                Inizia Ora
              </Button>
              <p className="text-xs text-[#86868B] font-medium">
                Il servizio è gratuito e non vincolante.
              </p>
            </motion.div>

            <div className="mt-8 bg-blue-50/50 rounded-3xl p-6 border border-blue-100">
              <h3 className="text-lg font-black text-[#1D1D1F] mb-2 flex items-center gap-2">
                 <Shield className="w-5 h-5 text-blue-600" />
                 La piattaforma N.1 in {formattedRegione}
              </h3>
              <p className="text-[#86868B] text-sm leading-relaxed">
                CercArtigiano è la piattaforma leader nella connessione tra domanda e offerta di lavoro artigiano. Monitoriamo costantemente la validità delle Partite IVA per garantirti massima affidabilità.
              </p>
            </div>
          </section>
        </article>
      </main>
    </div>
  );
}
