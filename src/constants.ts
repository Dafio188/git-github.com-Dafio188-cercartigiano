import { 
  Sparkles, 
  Droplets, 
  Zap, 
  Heart, 
  Leaf, 
  Dog, 
  Baby, 
  Hammer, 
  Truck,
  HardHat,
  PencilRuler,
  Brain,
  Scale,
  Compass,
  Calculator,
  Wrench,
  Activity,
  Trophy,
  Shield,
  Clock,
  HeartHandshake
} from 'lucide-react';

import { BadgeType } from './types';

export const SERVICE_CATEGORIES = [
  { id: 'cleaning', label: 'Pulizia Casa', icon: Sparkles },
  { id: 'plumbing', label: 'Idraulico', icon: Droplets },
  { id: 'electrical', label: 'Elettricista', icon: Zap },
  { id: 'elderly_care', label: 'Assistenza Anziani', icon: Heart },
  { id: 'gardening', label: 'Giardinaggio', icon: Leaf },
  { id: 'pet_sitting', label: 'Pet Sitting', icon: Dog },
  { id: 'beauty', label: 'Estetica/Beauty', icon: Sparkles },
  { id: 'babysitting', label: 'Babysitter', icon: Baby },
  { id: 'handyman', label: 'Tuttofare', icon: Hammer },
  { id: 'moving', label: 'Traslochi', icon: Truck },
  { id: 'construction', label: 'Lavori Edili', icon: HardHat },
  { id: 'carpentry', label: 'Falegname', icon: PencilRuler },
  { id: 'psychology', label: 'Psicologo', icon: Brain },
  { id: 'lawyer', label: 'Avvocato', icon: Scale },
  { id: 'architect', label: 'Architetto', icon: Compass },
  { id: 'accountant', label: 'Commercialista', icon: Calculator },
  { id: 'mechanic', label: 'Meccanico', icon: Wrench },
  { id: 'physiotherapy', label: 'Fisioterapista', icon: Activity },
];

export type ServiceCategory = typeof SERVICE_CATEGORIES[number];

export const CATEGORY_SERVICES: Record<string, string[]> = {
  electrical: [
    "Condizionatori e Climatizzatori",
    "Cancello Automatico",
    "Ventilatore da Soffitto",
    "Installazione Telecamere",
    "Sostituzione Citofono",
    "Antennista Elettricista",
    "Pronto Intervento Elettricista",
    "Dichiarazione di Rispondenza",
    "Dichiarazione di Conformità",
    "Installazione Lampadari",
    "Installazione Colonnine Elettriche",
    "Automazione Industriale",
    "Fotovoltaico",
    "Manutenzione Elettrica",
    "Allarme Casa",
    "Illuminotecnica",
    "Installazione Wallbox",
    "Riparazioni Domestiche",
    "Elettrotecnico"
  ],
  plumbing: [
    "Riparazione Perdite",
    "Installazione Caldaia",
    "Rifacimento Bagno",
    "Sostituzione Rubinetteria",
    "Disotturazione Scarichi",
    "Installazione Condizionatori",
    "Pronto Intervento Idraulico"
  ],
  cleaning: [
    "Pulizia Ordinaria",
    "Pulizia Profonda (Post Ristrutturazione)",
    "Lavaggio Divani e Tappeti",
    "Pulizia Vetrate",
    "Stiratura",
    "Pulizia Uffici"
  ],
  construction: [
    "Cartongesso",
    "Posa Pavimenti",
    "Muratura",
    "Tinteggiatura",
    "Ristrutturazione Completa",
    "Isolamento Termico"
  ],
  painting: [
    "Pittura Interni",
    "Pittura Esterni",
    "Trattamento Antimuffa",
    "Rimozione Carta da Parati",
    "Verniciatura Infissi"
  ],
  gardening: [
    "Taglio Prato",
    "Potatura Alberi",
    "Installazione Irrigazione",
    "Progettazione Giardini",
    "Pulizia Foglie"
  ],
  handyman: [
    "Montaggio Mobili",
    "Appensione Quadri/Mensole",
    "Piccole Riparazioni",
    "Sostituzione Serrature",
    "Riparazione Tapparelle"
  ],
  moving: [
    "Trasloco Abitazione",
    "Trasloco Ufficio",
    "Piccoli Traslochi",
    "Smontaggio e Rimontaggio Mobili",
    "Imballaggio"
  ],
  mechanic: [
    "Tagliando Auto",
    "Sostituzione Freni",
    "Diagnosi Computerizzata",
    "Riparazione Motore",
    "Cambio Gomme"
  ],
  beauty: [
    "Taglio e Piega",
    "Colore Capelli",
    "Manicure e Pedicure",
    "Trattamenti Viso",
    "Trucco Professionale"
  ],
  pet_sitting: [
    "Dog Walking",
    "Pensione Cani",
    "Pensione Gatti",
    "Toelettatura",
    "Addestramento"
  ]
};

export const PROJECT_NAME = "CercArtigiano";
export const PROJECT_DESCRIPTION = "La piattaforma leader per la gestione dei servizi professionali in Italia. Cerca, confronta e affida i tuoi progetti ai migliori artigiani.";
export const FOOTER_SLOGAN = "CERCA | CONFRONTA | AFFIDA | REALIZZA";
export const SECONDARY_SLOGAN = "Tutto nel palmo della Tua mano";

export const TRUST_BADGES: { id: BadgeType; label: string; icon: any; color: string; bg: string; description: string }[] = [
  { id: 'top_pro', label: 'Top Pro', icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-50', description: 'Professionista d\'eccellenza con recensioni eccezionali.' },
  { id: 'verified', label: 'Verificato', icon: Shield, color: 'text-blue-600', bg: 'bg-blue-50', description: 'Identità e documenti verificati dal nostro team.' },
  { id: 'fast_responder', label: 'Rapido', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50', description: 'Risponde solitamente entro un\'ora.' },
  { id: 'insurance_active', label: 'Assicurato', icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50', description: 'Copertura assicurativa RC professionale attiva.' },
  { id: 'elderly_friendly', label: 'Supporto Senior', icon: HeartHandshake, color: 'text-rose-600', bg: 'bg-rose-50', description: 'Particolarmente sensibile alle esigenze dei clienti senior.' },
];
