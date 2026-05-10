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
  HeartHandshake,
  Paintbrush,
  Key,
  Scissors,
  Laptop,
  Plug,
  Camera,
  GraduationCap,
  Sparkle
} from 'lucide-react';

import { BadgeType } from './types';

export const SERVICE_CATEGORIES = [
  { id: 'cleaning', label: 'Pulizia Casa', icon: Sparkles },
  { id: 'plumbing', label: 'Idraulico', icon: Droplets },
  { id: 'electrical', label: 'Elettricista', icon: Zap },
  { id: 'painter', label: 'Imbianchino', icon: Paintbrush },
  { id: 'locksmith', label: 'Fabbro / Serramenti', icon: Key },
  { id: 'tailor', label: 'Sarto', icon: Scissors },
  { id: 'appliances', label: 'Elettrodomestici', icon: Plug },
  { id: 'it_support', label: 'Tecnico Informatico', icon: Laptop },
  { id: 'photography', label: 'Fotografo / Video', icon: Camera },
  { id: 'tutoring', label: 'Ripetizioni / Corsi', icon: GraduationCap },
  { id: 'elderly_care', label: 'Assistenza Anziani', icon: Heart },
  { id: 'gardening', label: 'Giardinaggio', icon: Leaf },
  { id: 'pet_sitting', label: 'Pet Sitting', icon: Dog },
  { id: 'beauty', label: 'Estetica / Beauty', icon: Sparkle },
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
    "Condizionatori e Climatizzatori", "Cancello Automatico", "Ventilatore da Soffitto",
    "Installazione Telecamere", "Sostituzione Citofono", "Antennista Elettricista",
    "Pronto Intervento Elettricista", "Dichiarazione di Rispondenza", "Dichiarazione di Conformità",
    "Installazione Lampadari", "Installazione Colonnine Elettriche", "Automazione Industriale",
    "Fotovoltaico", "Manutenzione Elettrica", "Allarme Casa", "Illuminotecnica",
    "Installazione Wallbox", "Riparazioni Domestiche", "Elettrotecnico", "Domotica (Smart Home)"
  ],
  plumbing: [
    "Riparazione Perdite", "Installazione Caldaia", "Rifacimento Bagno",
    "Sostituzione Rubinetteria", "Disotturazione Scarichi", "Installazione Condizionatori",
    "Pronto Intervento Idraulico", "Sostituzione Sanitari", "Impianto Irrigazione",
    "Trattamento Acque/Addolcitori", "Riparazione Autoclave", "Installazione Scaldabagno"
  ],
  cleaning: [
    "Pulizia Ordinaria", "Pulizia Profonda (Post Ristrutturazione)", "Lavaggio Divani e Tappeti",
    "Pulizia Vetrate Professionali", "Stiratura a Domicilio", "Pulizia Uffici e Negozi",
    "Sanificazione e Igienizzazione", "Trattamento Pavimenti (Marmo/Parquet)",
    "Pulizia B&B e Affitti Brevi", "Sgombero e Pulizia Cantine"
  ],
  construction: [
    "Cartongesso e Controsoffitti", "Posa Pavimenti e Rivestimenti", "Muratura e Intonaco",
    "Tinteggiatura e Pittura", "Ristrutturazione Chiavi in Mano", "Isolamento Termico (Cappotto)",
    "Posa Parquet", "Rifacimento Tetto", "Impermeabilizzazione Terrazzi", "Opere in Cemento Armato"
  ],
  gardening: [
    "Taglio Prato e Bordure", "Potatura Alberi e Siepi", "Installazione Impianto Irrigazione",
    "Progettazione e Realizzazione Giardini", "Manutenzione Periodica Prato",
    "Abbattimento Alberi Alto Fusto", "Trattamenti Fitosanitari", "Creazione Aiuole e Camminamenti"
  ],
  handyman: [
    "Montaggio Mobili (IKEA/Mondo Convenienza)", "Appensione Quadri/Specchi/Mensole",
    "Riparazione Tapparelle e Persiane", "Sostituzione Serrature", "Piccole Riparazioni Elettriche/Idrauliche",
    "Sostituzione Corde Tapparelle", "Regolazione Cerniere Porte e Ante", "Siliconatura Vasche/Docce"
  ],
  moving: [
    "Trasloco Casa Completo", "Trasloco Ufficio", "Piccoli Traslochi (Scatole/Singoli Mobili)",
    "Smontaggio e Rimontaggio Mobili", "Imballaggio Professionale", "Noleggio Piattaforma Aerea",
    "Trasporto Oggetti Fragili/Pianoforti", "Sgombero Case e Aziende"
  ],
  mechanic: [
    "Tagliando Completo", "Sostituzione Freni e Pastiglie", "Diagnosi Elettronica",
    "Riparazione Motore e Cambio", "Cambio Gomme e Equilibratura", "Ricarica Aria Condizionata",
    "Riparazione Cristalli", "Elettrauto e Diagnosi"
  ],
  elderly_care: [
    "Compagnia e Veglia", "Aiuto Igiene Personale", "Preparazione e Somministrazione Pasti",
    "Accompagnamento Visite Mediche", "Acquisto Spesa e Commissioni", "Assistenza Notturna",
    "Aiuto nella Deambulazione", "Supporto Gestione Terapie Farmacologiche"
  ],
  babysitting: [
    "Babysitting Occasionale", "Aiuto Compiti", "Accompagnamento Attività Extra",
    "Animazione Feste", "Puericultrice (Neonati)", "Presa a Scuola/Asilo"
  ],
  pet_sitting: [
    "Dog Walking (Passeggiate)", "Pensione per Cani a Domicilio", "Pensione per Gatti",
    "Toelettatura", "Addestramento Base", "Somministrazione Farmaci Animali"
  ],
  beauty: [
    "Taglio e Piega", "Colore e Schiariture", "Manicure e Pedicure (Smalto Semipermanente)",
    "Trattamenti Viso e Corpo", "Trucco Sposa/Eventi", "Massaggi Rilassanti",
    "Epilazione (Cera/Laser)", "Laminazione Ciglia/Sopracciglia"
  ],
  carpentry: [
    "Riparazione Mobili in Legno", "Creazione Arredi su Misura", "Restauro Antichità",
    "Posa Battiscopa e Parquet", "Riparazione Porte e Infissi", "Costruzione Strutture Esterno (Gazebo)"
  ],
  psychology: [
    "Consulenza Individuale", "Terapia di Coppia", "Sostegno Genitoriale",
    "Psicoterapia Infantile", "Gestione Ansia e Stress", "Coaching e Motivazione"
  ],
  lawyer: [
    "Diritto Civile", "Diritto Penale", "Diritto del Lavoro",
    "Pratiche di Divorzio/Famiglia", "Infortunistica Stradale", "Recupero Crediti"
  ],
  architect: [
    "Progettazione Architettonica", "Interior Design", "Pratiche Edilizie (CILA/SCIA)",
    "Direzione Lavori", "Rilievi e Planimetrie", "Consulenza Arredamento"
  ],
  accountant: [
    "Dichiarazione dei Redditi (730/Unico)", "Apertura Partita IVA", "Contabilità Aziendale",
    "Consulenza Fiscale", "Pianificazione Successoria", "Gestione Buste Paga"
  ],
  physiotherapy: [
    "Riabilitazione Motoria", "Massoterapia", "Terapia Posturale",
    "Fisioterapia Sportiva", "Linfodrenaggio", "Osteopatia"
  ],
  painter: [
    "Tinteggiatura Interni", "Tinteggiatura Esterni", "Carta da Parati",
    "Decorazioni (Stucco, Spatolato)", "Trattamenti Antimuffa", "Verniciatura Porte/Finestre"
  ],
  locksmith: [
    "Apertura Porte Bloccate", "Sostituzione Serrature", "Riparazione Tapparelle / Serrande",
    "Installazione Casseforti", "Fabbro Pronto Intervento", "Lavorazione Ferro / Cancelli"
  ],
  tailor: [
    "Riparazioni Sartoriali (Orli, Cerniere)", "Abiti su Misura", "Modifiche Abiti da Cerimonia",
    "Rammendo e Rattoppo", "Confezione Tende"
  ],
  appliances: [
    "Riparazione Lavatrice / Asciugatrice", "Riparazione Frigorifero", "Riparazione Forno / Piano Cottura",
    "Riparazione Lavastoviglie", "Riparazione Piccoli Elettrodomestici", "Installazione Elettrodomestici"
  ],
  it_support: [
    "Riparazione PC / Mac", "Rimozione Virus / Malware", "Configurazione Rete / Wi-Fi",
    "Recupero Dati", "Assistenza Smartphone / Tablet", "Installazione Software / SO"
  ],
  photography: [
    "Servizi Fotografici ed Eventi (Matrimoni)", "Fotografia Prodotti / E-commerce", "Riprese Video e Montaggio",
    "Ritratti e Book Fotografici", "Fotografia Immobiliare", "Riprese con Drone"
  ],
  tutoring: [
    "Ripetizioni Scolastiche (Matematica, Lingue, ecc.)", "Aiuto Compiti", "Corsi di Lingua Straniera",
    "Preparazione Test Universitari", "Informatica di Base"
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
