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
  ShieldCheck,
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

export const PROJECT_NAME = "CercArtigiano";
export const PROJECT_DESCRIPTION = "La piattaforma leader per la gestione dei servizi professionali in Italia. Cerca, confronta e affida i tuoi progetti ai migliori artigiani.";
export const FOOTER_SLOGAN = "CERCA | CONFRONTA | AFFIDA | REALIZZA";
export const SECONDARY_SLOGAN = "Tutto nel palmo della Tua mano";

export const TRUST_BADGES: { id: BadgeType; label: string; icon: any; color: string; bg: string; description: string }[] = [
  { id: 'top_pro', label: 'Top Pro', icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-50', description: 'Professionista d\'eccellenza con recensioni eccezionali.' },
  { id: 'verified', label: 'Verificato', icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50', description: 'Identità e documenti verificati dal nostro team.' },
  { id: 'fast_responder', label: 'Rapido', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50', description: 'Risponde solitamente entro un\'ora.' },
  { id: 'insurance_active', label: 'Assicurato', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', description: 'Copertura assicurativa RC professionale attiva.' },
  { id: 'elderly_friendly', label: 'Supporto Senior', icon: HeartHandshake, color: 'text-rose-600', bg: 'bg-rose-50', description: 'Particolarmente sensibile alle esigenze dei clienti senior.' },
];

export const CATEGORY_SERVICES: Record<string, string[]> = {
  cleaning: [
    "Pulizia ordinaria appartamento",
    "Pulizia post-ristrutturazione",
    "Lavaggio vetri e vetrate",
    "Pulizia uffici e negozi",
    "Sanificazione ambienti"
  ],
  plumbing: [
    "Riparazione Perdite",
    "Manutenzione Caldaia",
    "Installazione Sanitari e Rubinetteria",
    "Disotturazione Scarichi",
    "Installazione Climatizzatore"
  ],
  electrical: [
    "Riparazione Guasto / Corto Circuito",
    "Impianto TV / Satellitare",
    "Antifurti e Videocitofonia",
    "Installazione Luci e Prese",
    "Impianto Fotovoltaico",
    "Certificazione Impianto (DiCo)"
  ],
  elderly_care: [
    "Assistenza diurna",
    "Assistenza notturna",
    "Accompagnamento visite mediche",
    "Preparazione pasti e spesa",
    "Igiene personale"
  ],
  gardening: [
    "Taglio erba e manutenzione prato",
    "Potatura alberi e siepi",
    "Progettazione e realizzazione giardini",
    "Installazione impianto irrigazione",
    "Pulizia cortili e rimozione foglie"
  ],
  pet_sitting: [
    "Dog sitting (passeggiate)",
    "Cat sitting a domicilio",
    "Pensione casalinga",
    "Somministrazione farmaci animali",
    "Toelettatura base"
  ],
  babysitting: [
    "Babysitting occasionale",
    "Babysitting fisso (part-time/full-time)",
    "Aiuto compiti",
    "Accompagnamento attività pomeridiane",
    "Babysitting neonati"
  ],
  handyman: [
    "Montaggio mobili (IKEA ecc.)",
    "Appeso quadri, specchi e mensole",
    "Piccole riparazioni idrauliche/elettriche",
    "Sostituzione serrature e maniglie",
    "Riparazione tapparelle e veneziane"
  ],
  moving: [
    "Sgombero cantine e solai",
    "Trasloco completo appartamento",
    "Piccoli trasporti",
    "Smontaggio e rimontaggio mobili",
    "Noleggio furgone con conducente"
  ],
  construction: [
    "Tinteggiatura pareti (Imbianchino)",
    "Lavori in cartongesso",
    "Posa pavimenti e piastrelle",
    "Piccoli lavori di muratura",
    "Isolamento termico / Cappotto",
    "Ristrutturazione bagno"
  ],
  carpentry: [
    "Riparazione mobili in legno",
    "Realizzazione mobili su misura",
    "Posa parquet",
    "Riparazione porte e finestre",
    "Restauro mobili antichi"
  ],
  psychology: [
    "Supporto psicologico individuale",
    "Terapia di coppia",
    "Terapia dell'età evolutiva",
    "Consulenza psicologica online",
    "Gestione dell'ansia e dello stress"
  ],
  lawyer: [
    "Assistenza legale civile",
    "Assistenza legale penale",
    "Diritto di famiglia e divorzi",
    "Consulenza contrattuale",
    "Recupero crediti"
  ],
  architect: [
    "Progettazione interni",
    "Pratiche edilizie (CILA, SCIA, ecc.)",
    "Direzione lavori",
    "Modellazione 3D e rendering",
    "Consulenza d'arredo"
  ],
  accountant: [
    "Dichiarazione dei redditi (730, Unico)",
    "Gestione Partita IVA forfettaria",
    "Contabilità aziendale",
    "Consulenza fiscale e tributaria",
    "Costituzione società e startup"
  ],
  mechanic: [
    "Tagliando auto",
    "Diagnosi elettronica guasti",
    "Sostituzione freni e pastiglie",
    "Riparazione motore",
    "Cambio gomme"
  ],
  physiotherapy: [
    "Fisioterapia riabilitativa post-infortunio",
    "Terapia manuale e massoterapia",
    "Ginnastica posturale",
    "Fisioterapia a domicilio",
    "Riabilitazione neurologica"
  ]
};
