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
  type: 'choice' | 'text' | 'address' | 'contact' | 'photo';
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
      id: 'service_type',
      type: 'choice',
      question: 'Di che tipo di servizio elettrico hai bisogno?',
      description: 'Seleziona la specializzazione principale.',
      title: 'Servizio',
      options: [
        { id: 'renovation', label: 'Rifacimento impianto', icon: Hammer, priceRange: { min: 850, max: 3500 }, nextStepId: 'property_type' },
        { id: 'repair', label: 'Riparazione guasto', icon: AlertTriangle, priceRange: { min: 70, max: 250 }, nextStepId: 'specific_problem' },
        { id: 'certification', label: 'Certificazione Di.Co.', icon: Shield, priceRange: { min: 150, max: 400 }, nextStepId: 'property_size' },
        { id: 'photovoltaic', label: 'Impianto fotovoltaico', icon: Waves, priceRange: { min: 3000, max: 12000 }, nextStepId: 'additional_notes' },
        { id: 'antennas', label: 'Antenne / SAT', icon: Zap, priceRange: { min: 80, max: 400 }, nextStepId: 'additional_notes' },
        { id: 'alarm', label: 'Allarmi / Citofoni', icon: Smartphone, priceRange: { min: 150, max: 1200 }, nextStepId: 'additional_notes' }
      ]
    },
    {
      id: 'property_type',
      type: 'choice',
      title: 'Ambito',
      question: 'Dove serve l\'intervento?',
      options: [
        { id: 'apt', label: 'Appartamento', icon: Home },
        { id: 'villa', label: 'Villa / Casa Indipendente', icon: Home },
        { id: 'condo', label: 'Condominio', icon: Home },
        { id: 'shop', label: 'Negozio / Ufficio', icon: PenTool }
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
    { id: 'urgency', type: 'choice', title: 'Urgenza', question: 'Quando vorresti l\'intervento?', options: [ {id:'asap', label:'Il prima possibile'}, {id:'week', label:'Entro la settimana'}, {id:'planned', label:'Pianificato'} ] },
    { id: 'photos', type: 'photo', question: 'Allega foto del problema (opzionale)', description: 'Le foto aiutano l\'artigiano a farti un preventivo più preciso.' },
    { id: 'additional_notes', type: 'text', question: 'Descrivi la tua richiesta e aggiungi altri dettagli' },
    { id: 'address', type: 'address', question: 'Dove serve l\'intervento?' },
    { id: 'contact_info', type: 'contact', question: 'Dove vuoi ricevere i preventivi?' }
  ],
  plumbing: [
    {
      id: 'problem_type',
      type: 'choice',
      question: 'Di che tipo di intervento idraulico hai bisogno?',
      title: 'Intervento',
      options: [
        { id: 'repair', label: 'Riparazione perdite', icon: AlertTriangle, priceRange: { min: 80, max: 250 }, nextStepId: 'leak_site' },
        { id: 'installation', label: 'Installazione sanitari', icon: Droplets, priceRange: { min: 150, max: 600 }, nextStepId: 'additional_notes' },
        { id: 'boiler', label: 'Caldaia / Scaldabagno', icon: Thermometer, priceRange: { min: 120, max: 1800 }, nextStepId: 'additional_notes' },
        { id: 'renovation', label: 'Rifacimento bagno', icon: Hammer, priceRange: { min: 3500, max: 8000 }, nextStepId: 'bathroom_size' },
        { id: 'clog', label: 'Disotturazione scarichi', icon: Waves, priceRange: { min: 90, max: 250 }, nextStepId: 'leak_site' }
      ]
    },
    {
      id: 'leak_site',
      type: 'choice',
      title: 'Locazione',
      question: 'Dov\'è localizzato il problema?',
      options: [
        { id: 'bathroom', label: 'Bagno', icon: Droplets },
        { id: 'kitchen', label: 'Cucina', icon: Droplets },
        { id: 'outside', label: 'Esterno', icon: Leaf },
        { id: 'garage', label: 'Cantina / Box', icon: Home }
      ]
    },
    { id: 'bathroom_size', type: 'choice', title: 'Dimensione', question: 'Dimensione bagno?', options: [ {id:'sm', label:'Piccolo'}, {id:'md', label:'Medio'}, {id:'lg', label:'Grande'} ] },
    { id: 'photos', type: 'photo', question: 'Allega foto del problema (opzionale)', description: 'Le foto aiutano l\'artigiano a farti un preventivo più preciso.' },
    { id: 'additional_notes', type: 'text', question: 'Fornisci dettagli sul problema (Marca caldaia, tipo tubature, ecc.)' },
    { id: 'address', type: 'address', question: 'Indirizzo intervento' },
    { id: 'contact_info', type: 'contact', question: 'Dove vuoi ricevere i preventivi?' }
  ],
  construction: [
    {
      id: 'const_type',
      type: 'choice',
      question: 'Che tipo di lavori edili devi fare?',
      title: 'Lavoro',
      options: [
        { id: 'full', label: 'Ristrutturazione Totale', icon: Home, priceRange: { min: 15000, max: 80000 }, nextStepId: 'property_status' },
        { id: 'plaster', label: 'Cartongesso / Pittura', icon: PenTool, priceRange: { min: 500, max: 3000 }, nextStepId: 'property_size' },
        { id: 'flooring', label: 'Pavimentazione', icon: Hammer, priceRange: { min: 800, max: 5000 }, nextStepId: 'property_size' },
        { id: 'masonry', label: 'Opere Murarie', icon: Hammer, priceRange: { min: 400, max: 2500 } }
      ]
    },
    { id: 'property_status', type: 'choice', title: 'Stato', question: 'Stato attuale dell\'immobile?', options: [ {id:'in_use', label:'In uso'}, {id:'empty', label:'Vuoto'}, {id:'new', label:'In costruzione'} ] },
    { id: 'property_size', type: 'choice', title: 'Metratura', question: 'Qual è la metratura interessata?', options: [ {id:'0_50', label:'0-50 mq'}, {id:'50_100', label:'50-100 mq'}, {id:'100+', label:'Oltre 100 mq'} ] },
    { id: 'materials', type: 'choice', title: 'Materiali', question: 'Chi fornisce i materiali?', options: [ {id:'me', label:'Forniti da me'}, {id:'pro', label:'Forniti dal professionista'}, {id:'both', label:'Da decidere'} ] },
    { id: 'photos', type: 'photo', question: 'Carica foto o planimetrie (opzionale)', description: 'Includendo foto degli spazi o planimetrie riceverai preventivi molto più accurati.' },
    { id: 'additional_notes', type: 'text', question: 'Descrivi il progetto nei dettagli' },
    { id: 'address', type: 'address', question: 'Indirizzo immobile' },
    { id: 'contact_info', type: 'contact', question: 'Prenota sopralluogo' }
  ],
  cleaning: [
    {
       id: 'clean_type',
       type: 'choice',
       question: 'Tipo di pulizia richiesta?',
       title: 'Tipo',
       options: [
         { id: 'regular', label: 'Ordinaria', icon: Sparkles, priceRange: { min: 40, max: 120 }, nextStepId: 'frequency' },
         { id: 'deep', label: 'Profonda (Primavera)', icon: Waves, priceRange: { min: 120, max: 350 }, nextStepId: 'property_size' },
         { id: 'post', label: 'Post Ristrutturazione', icon: Hammer, priceRange: { min: 250, max: 800 }, nextStepId: 'property_size' },
         { id: 'bnb', label: 'B&B / Affitti Brevi', icon: Home, nextStepId: 'frequency' }
       ]
    },
    { id: 'frequency', type: 'choice', title: 'Frequenza', question: 'Ogni quanto serve il servizio?', options: [ {id:'once', label:'Singola volta'}, {id:'weekly', label:'Settimanale'}, {id:'biweekly', label:'Quindicinale'} ] },
    { id: 'property_size', type: 'choice', title: 'Mq', question: 'Grandezza indicativa (mq)?', options: [ {id:'0_50', label:'Fino a 50mq'}, {id:'50_100', label:'50-100mq'}, {id:'100+', label:'Oltre 100mq'} ] },
    { id: 'extra', type: 'choice', title: 'Extra', question: 'Servizi aggiuntivi?', options: [ {id:'iron', label:'Stiratura'}, {id:'windows', label:'Vetri'}, {id:'oven', label:'Forno/Frigo'}, {id:'none', label:'Nessuno'} ] },
    { id: 'address', type: 'address', question: 'Dove pulire?' },
    { id: 'contact_info', type: 'contact', question: 'Completa richiesta' }
  ],
  gardening: [
    {
      id: 'garden_type',
      type: 'choice',
      question: 'Servizio giardino richiesto?',
      title: 'Lavorazione',
      options: [
        { id: 'maint', label: 'Sfalcio / Manutenzione', icon: Leaf, priceRange: { min: 35, max: 150 }, nextStepId: 'garden_size' },
        { id: 'pot', label: 'Potatura', icon: Hammer, priceRange: { min: 100, max: 800 }, nextStepId: 'tree_height' },
        { id: 'design', label: 'Progettazione / Realizzazione', icon: PenTool, priceRange: { min: 500, max: 5000 } }
      ]
    },
    { id: 'garden_size', type: 'choice', title: 'Taglia', question: 'Dimensioni area verde?', options: [ {id:'sm', label:'Piccolo <50mq'}, {id:'md', label:'Medio 50-200mq'}, {id:'lg', label:'Grande >200mq'} ] },
    { id: 'tree_height', type: 'choice', title: 'Altezza', question: 'Altezza approssimativa alberi?', options: [ {id:'low', label:'Meno di 3 metri'}, {id:'high', label:'Oltre 3 metri'} ] },
    { id: 'photos', type: 'photo', question: 'Allega foto dell\'area verde (opzionale)', description: 'Le foto dello stato attuale aiutano a stimare il lavoro necessario.' },
    { id: 'address', type: 'address', question: 'Località intervento' },
    { id: 'contact_info', type: 'contact', question: 'Invia richiesta' }
  ],
  moving: [
    {
      id: 'move_type',
      type: 'choice',
      question: 'Dettagli del trasloco?',
      options: [
        { id: 'home', label: 'Trasloco Abitazione', icon: Home, nextStepId: 'floor_info' },
        { id: 'office', label: 'Trasloco Ufficio', icon: PenTool, nextStepId: 'floor_info' },
        { id: 'small', label: 'Piccoli Traslochi / Singoli pezzi', icon: Smartphone, nextStepId: 'item_count' }
      ]
    },
    { id: 'floor_info', type: 'choice', title: 'Piani', question: 'A che piano si trova?', options: [ {id:'gf', label:'Piano Terra'}, {id:'low', label:'1-2 Piano'}, {id:'high', label:'3 Piano o superiore'} ] },
    { id: 'elevator', type: 'choice', title: 'Ascensore', question: 'C\'è l\'ascensore?', options: [ {id:'yes', label:'Sì'}, {id:'no', label:'No'} ] },
    { id: 'item_count', type: 'choice', title: 'Volume', question: 'Quantità di oggetti?', options: [ {id:'few', label:'Pochi (< 5 mobili)'}, {id:'many', label:'Molti (> 5 mobili)'}, {id:'full', label:'Intero appartamento'} ] },
    { id: 'address_from', type: 'address', question: 'Indirizzo Partenza' },
    { id: 'address_to', type: 'address', question: 'Indirizzo Destinazione' },
    { id: 'contact_info', type: 'contact', question: 'Ricevi preventivi' }
  ],
  moving_logic_shim: [ // Shim to keep indices relative if needed, but not used by UI
    { id: 'address', type: 'address', question: 'Indirizzo Arrivo' }
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
    id: 'photos',
    type: 'photo',
    question: 'Allega foto (opzionale)',
    description: 'Mostra quello di cui hai bisogno con delle immagini.'
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
