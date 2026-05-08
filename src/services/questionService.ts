import { Zap, Home, Clock, AlertTriangle, Hammer, LucideProps, Shield, Smartphone, Droplets, Waves, Thermometer, PenTool, Sparkles, Leaf } from 'lucide-react';

export interface QuestionOption {
  id: string;
  label: string;
  description?: string;
  icon?: React.ComponentType<LucideProps>;
  priceRange?: { min: number; max: number };
  nextStepId?: string; // Support for branching logic
}

export interface CategoryQuestion {
  id: string;
  type: 'choice' | 'text' | 'address' | 'contact';
  question: string;
  title?: string; // Short title for summary
  icon?: React.ComponentType<LucideProps>; // Question level icon
  description?: string;
  tip?: string;
  placeholder?: string;
  options?: QuestionOption[];
  priceRange?: { min: number; max: number };
}

export const CATEGORY_FLOWS: Record<string, CategoryQuestion[]> = {
  electrical: [
    {
      id: 'service_category',
      type: 'choice',
      question: 'Di che tipo di servizio elettrico hai bisogno?',
      description: 'Seleziona la specializzazione principale per ricevere preventivi mirati.',
      title: 'Servizio',
      options: [
        { id: 'renovation', label: 'Rifacimento impianto', icon: Hammer, priceRange: { min: 850, max: 3500 }, nextStepId: 'property_size' },
        { id: 'repair', label: 'Riparazione guasto', icon: AlertTriangle, priceRange: { min: 70, max: 250 }, nextStepId: 'specific_problem' },
        { id: 'certification', label: 'Certificazione Di.Co.', icon: Shield, priceRange: { min: 150, max: 400 }, nextStepId: 'property_size' },
        { id: 'photovoltaic', label: 'Impianto fotovoltaico', icon: Waves, priceRange: { min: 3000, max: 12000 } },
        { id: 'antennas', label: 'Antenne / SAT', icon: Zap, priceRange: { min: 80, max: 400 } },
        { id: 'alarm', label: 'Allarmi / Citofoni', icon: Smartphone, priceRange: { min: 150, max: 1200 } }
      ]
    },
    {
      id: 'property_size',
      type: 'choice',
      title: 'Dimensione',
      question: 'Quanto è grande l\'abitazione?',
      options: [
        { id: 'small', label: 'Meno di 50 mq', icon: Home },
        { id: 'medium', label: '50 - 100 mq', icon: Home },
        { id: 'large', label: 'Oltre 100 mq', icon: Home }
      ]
    },
    {
      id: 'specific_problem',
      type: 'choice',
      title: 'Problema',
      question: 'Quale problema riscontri?',
      options: [
        { id: 'breaker', label: 'Interruttore salta spesso', icon: AlertTriangle },
        { id: 'outlets', label: 'Prese non funzionanti', icon: Zap },
        { id: 'short', label: 'Corto circuito', icon: AlertTriangle },
        { id: 'other', label: 'Altro', icon: PenTool }
      ]
    },
    { id: 'additional_notes', type: 'text', question: 'Descrivi la tua richiesta' },
    { id: 'address', type: 'address', question: 'Dove serve l\'intervento?' },
    { id: 'contact_info', type: 'contact', question: 'Dove vuoi ricevere i preventivi?' }
  ],
  plumbing: [
    {
      id: 'service_type',
      type: 'choice',
      question: 'Di che tipo di intervento idraulico hai bisogno?',
      title: 'Intervento',
      options: [
        { id: 'repair', label: 'Riparazione perdite', icon: AlertTriangle, priceRange: { min: 80, max: 250 }, nextStepId: 'specific_problem' },
        { id: 'installation', label: 'Installazione sanitari', icon: Droplets, priceRange: { min: 150, max: 600 } },
        { id: 'boiler', label: 'Caldaia / Scaldabagno', icon: Thermometer, priceRange: { min: 120, max: 1800 } },
        { id: 'renovation', label: 'Rifacimento bagno', icon: Hammer, priceRange: { min: 3500, max: 8000 }, nextStepId: 'property_size' },
        { id: 'clog', label: 'Disotturazione scarichi', icon: Waves, priceRange: { min: 90, max: 250 } }
      ]
    },
    {
      id: 'specific_problem',
      type: 'choice',
      title: 'Sito Perdita',
      question: 'Dov\'è localizzata la perdita?',
      options: [
        { id: 'faucet', label: 'Rubinetto/Miscelatore', icon: Droplets },
        { id: 'wc', label: 'Scarico WC', icon: Zap },
        { id: 'pipes', label: 'Tubazioni muro', icon: Waves },
        { id: 'other', label: 'Altro', icon: PenTool }
      ]
    },
    { id: 'property_size', type: 'choice', title: 'Dimensione', question: 'Dimensione bagno?', options: [ {id:'sm', label:'Piccolo'}, {id:'lg', label:'Grande'} ] },
    { id: 'additional_notes', type: 'text', question: 'Dettagli intervento' },
    { id: 'address', type: 'address', question: 'Dove serve l\'idraulico?' },
    { id: 'contact_info', type: 'contact', question: 'Dove vuoi ricevere i preventivi?' }
  ],
  construction: [
    {
      id: 'const_type',
      type: 'choice',
      question: 'Che tipo di lavori edili devi fare?',
      title: 'Lavoro',
      options: [
        { id: 'full', label: 'Ristrutturazione Totale', icon: Home, priceRange: { min: 15000, max: 80000 } },
        { id: 'plaster', label: 'Cartongesso / Pittura', icon: PenTool, priceRange: { min: 500, max: 3000 } },
        { id: 'flooring', label: 'Pavimentazione', icon: Hammer, priceRange: { min: 800, max: 5000 } },
        { id: 'masonry', label: 'Opere Murarie', icon: Hammer, priceRange: { min: 400, max: 2500 } }
      ]
    },
    { id: 'additional_notes', type: 'text', question: 'Descrivi il progetto' },
    { id: 'address', type: 'address', question: 'Indirizzo immobile' },
    { id: 'contact_info', type: 'contact', question: 'Dove vuoi ricevere i preventivi?' }
  ],
  cleaning: [
    {
      id: 'clean_type',
      type: 'choice',
      question: 'Tipo di pulizia richiesta?',
      title: 'Tipo',
      options: [
        { id: 'regular', label: 'Ordinaria', icon: Sparkles, priceRange: { min: 40, max: 120 } },
        { id: 'deep', label: 'Profonda', icon: Waves, priceRange: { min: 120, max: 350 } },
        { id: 'post', label: 'Post Ristrutturazione', icon: Hammer, priceRange: { min: 250, max: 800 } }
      ]
    },
    { id: 'address', type: 'address', question: 'Dove pulire?' },
    { id: 'contact_info', type: 'contact', question: 'Dove vuoi ricevere i preventivi?' }
  ],
  gardening: [
    {
      id: 'garden_type',
      type: 'choice',
      question: 'Servizio giardino?',
      title: 'Servizio',
      options: [
        { id: 'maint', label: 'Manutenzione', icon: Leaf, priceRange: { min: 35, max: 150 } },
        { id: 'pot', label: 'Potatura', icon: Hammer, priceRange: { min: 100, max: 800 } },
        { id: 'design', label: 'Progettazione', icon: PenTool, priceRange: { min: 500, max: 5000 } }
      ]
    },
    { id: 'address', type: 'address', question: 'Località giardino' },
    { id: 'contact_info', type: 'contact', question: 'Dove vuoi ricevere i preventivi?' }
  ]
};

export const DEFAULT_FLOW: CategoryQuestion[] = [
  {
    id: 'basic_title',
    type: 'text',
    question: 'Di cosa hai bisogno?',
    description: 'Descrivi brevemente l\'intervento richiesto.'
  },
  {
    id: 'basic_desc',
    type: 'text',
    question: 'Fornisci maggiori dettagli',
    description: 'Aggiungi informazioni su materiali o condizioni particolari.'
  },
  {
    id: 'address',
    type: 'address',
    question: 'Dove serve il lavoro?',
    description: 'Inserisci l\'indirizzo per ricevere preventivi locali.'
  },
  {
    id: 'contact_info',
    type: 'contact',
    question: 'Completa la richiesta',
    description: 'Riceverai i preventivi sulla tua area personale.'
  }
];
