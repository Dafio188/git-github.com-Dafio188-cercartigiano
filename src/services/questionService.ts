import { Zap, Home, Clock, AlertTriangle, Hammer, LucideProps, Shield, Power, Lightbulb, Smartphone, Droplets, Waves, Thermometer, PenTool } from 'lucide-react';

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
      question: 'Di quale tipo di servizio elettrico hai bisogno?',
      description: 'Seleziona la specializzazione principale per ricevere preventivi mirati.',
      options: [
        { id: 'renovation', label: 'Rifacimento Impianto Elettrico', description: 'Sostituzione completa o messa a norma.', icon: Hammer, priceRange: { min: 1500, max: 6000 }, nextStepId: 'property_size' },
        { id: 'repair', label: 'Riparazione Guasto / Corto Circuito', description: 'Ricerca e risoluzione malfunzionamenti.', icon: AlertTriangle, priceRange: { min: 80, max: 250 }, nextStepId: 'specific_problem' },
        { id: 'lighting_outlets', label: 'Punti Luce, Prese e Interruttori', description: 'Installazione, sostituzione o spostamento.', icon: Lightbulb, priceRange: { min: 50, max: 400 }, nextStepId: 'involved_equipment' },
        { id: 'intercom_security', label: 'Citofono, Videocitofono e Allarme', description: 'Installazione o riparazione sistemi.', icon: Smartphone, priceRange: { min: 150, max: 1200 }, nextStepId: 'involved_equipment' },
        { id: 'antennas_sat', label: 'Antenne e Impianti Satellitari', description: 'Installazione o puntamento antenna/parabola.', icon: Zap, priceRange: { min: 90, max: 350 }, nextStepId: 'involved_equipment' },
        { id: 'photovoltaic', label: 'Impianti Fotovoltaici', description: 'Pannelli solari e risparmio energetico.', icon: Waves, priceRange: { min: 3000, max: 15000 }, nextStepId: 'property_size' },
        { id: 'certification', label: 'Certificazione Conformità (Di.Co.)', description: 'Controllo e rilascio documenti legali.', icon: Shield, priceRange: { min: 150, max: 450 }, nextStepId: 'property_size' }
      ]
    },
    {
      id: 'property_size',
      type: 'choice',
      question: 'Quanto è grande l\'abitazione?',
      description: 'I metri quadri aiutano a stimare la quantità di materiali necessari.',
      options: [
        { id: 'small', label: 'Meno di 50 mq', icon: Home, priceRange: { min: 1500, max: 2500 } },
        { id: 'medium', label: '50 - 100 mq', icon: Home, priceRange: { min: 2500, max: 4500 } },
        { id: 'large', label: '100 - 200 mq', icon: Home, priceRange: { min: 4500, max: 8000 } },
        { id: 'extra', label: 'Oltre 200 mq', icon: Home, priceRange: { min: 8000, max: 15000 } }
      ]
    },
    {
      id: 'rooms_count',
      type: 'choice',
      question: 'In quante stanze bisogna intervenire?',
      options: [
        { id: '1-2', label: '1 - 2 stanze', icon: Home },
        { id: '2-4', label: '2 - 4 stanze', icon: Home },
        { id: '5-7', label: '5 - 7 stanze', icon: Home },
        { id: '7+', label: 'Oltre 7 stanze', icon: Home }
      ]
    },
    {
      id: 'involved_equipment',
      type: 'choice',
      question: 'Quali apparecchiature sono coinvolte?',
      options: [
        { id: 'full', label: 'Tutto l\'impianto generale', icon: Zap },
        { id: 'outlets', label: 'Prese e interruttori', icon: Power },
        { id: 'lighting', label: 'Punti luce e lampadari', icon: Lightbulb },
        { id: 'intercom', label: 'Citofono o Impianto d\'allarme', icon: Shield },
        { id: 'antennas', label: 'Antenna TV o Satellitare', icon: Zap },
        { id: 'ac', label: 'Condizionatore o Ventilatore', icon: Thermometer },
        { id: 'other', label: 'Altro', icon: PenTool }
      ]
    },
    {
      id: 'specific_problem',
      type: 'choice',
      question: 'Che tipo di problema riscontri?',
      options: [
        { id: 'old', label: 'L\'impianto è vecchio / non a norma', icon: Shield },
        { id: 'power_loss', label: 'L\'impianto perde potenza', icon: Zap },
        { id: 'not_working', label: 'L\'impianto non funziona', icon: AlertTriangle },
        { id: 'noisy', label: 'L\'impianto è rumoroso', icon: Waves },
        { id: 'overheating', label: 'Surriscaldamento impianto', icon: Thermometer },
        { id: 'breaker', label: 'Interruttore generale salta spesso', icon: AlertTriangle }
      ]
    },
    {
      id: 'property_type',
      type: 'choice',
      question: 'In che tipo di immobile servirà l\'intervento?',
      options: [
        { id: 'apartment', label: 'Appartamento', icon: Home },
        { id: 'villa', label: 'Villa o Casa Indipendente', icon: Home },
        { id: 'office', label: 'Ufficio o Negozio', icon: Shield },
        { id: 'condo', label: 'Area Condominiale', icon: Home }
      ]
    },
    {
      id: 'additional_notes',
      type: 'text',
      question: 'Descrivi in dettaglio di cosa hai bisogno',
      description: 'Più dettagli fornisci, più precisi saranno i preventivi degli artigiani.',
      tip: 'Esempi: Rifacimento 80mq con 20 punti luce; Installazione 5 nuovi lampadari; Messa a norma del quadro generale.',
      placeholder: 'Esempio: preventivo a scalare per le diverse aree dell\'appartamento, prezzo per presa e ripristino...'
    },
    {
      id: 'urgency',
      type: 'choice',
      question: 'Quando vorresti organizzare il sopralluogo?',
      options: [
        { id: 'urgent', label: 'Il prima possibile', icon: Clock },
        { id: 'scheduled', label: 'In una data precisa (entro 3 settimane)', icon: Clock },
        { id: 'flexible', label: 'Entro due mesi / sei mesi', icon: Clock },
        { id: 'price_only', label: 'Sto solo cercando il prezzo', icon: Clock }
      ]
    },
    {
      id: 'address',
      type: 'address',
      question: 'Indica dove hai bisogno del servizio',
      description: 'Provincia, Comune o Frazione e Zona specifica.'
    },
    {
      id: 'contact_info',
      type: 'contact',
      question: 'Dove vuoi ricevere i preventivi?',
      description: 'Crea la tua richiesta e ricevi risposte dai migliori artigiani del territorio.',
      tip: 'Le iniziali del nome e cognome in maiuscolo conferiscono un aspetto più professionale.'
    }
  ],
  plumbing: [
    {
      id: 'plumbing_type',
      type: 'choice',
      question: 'Qual è il problema idraulico?',
      options: [
        { id: 'leak', label: 'Perdita d\'acqua', icon: Droplets },
        { id: 'clog', label: 'Scarico ostruito', icon: Waves },
        { id: 'boiler', label: 'Caldaia o Scaldabagno', icon: Thermometer },
        { id: 'bathroom', label: 'Rifacimento Bagno', icon: PenTool }
      ]
    },
    {
      id: 'additional_notes',
      type: 'text',
      question: 'Dettagli tecnici e note',
      description: 'Descrivi la situazione attuale. Specificare se sono presenti perdite attive.',
      placeholder: 'Esempio: Lo scarico della doccia è lento da giorni nonostante l\'uso di prodotti...'
    },
    {
        id: 'urgency',
        type: 'choice',
        question: 'Urgenza dell\'intervento?',
        options: [
          { id: 'now', label: 'Emergenza (Massima Urgenza)', icon: AlertTriangle },
          { id: 'days', label: 'Entro pochi giorni', icon: Clock },
          { id: 'flexible', label: 'Non urgente', icon: Clock }
        ]
    },
    {
      id: 'address',
      type: 'address',
      question: 'Località del servizio',
      description: 'Indica l\'indirizzo per trovare l\'idraulico più vicino.'
    },
    {
      id: 'contact_info',
      type: 'contact',
      question: 'Completa la richiesta',
      description: 'Riceverai i preventivi sulla tua area personale.'
    }
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
