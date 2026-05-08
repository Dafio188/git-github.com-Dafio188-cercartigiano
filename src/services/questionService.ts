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
      question: 'Di che tipo di servizio elettrico hai bisogno?',
      description: 'Seleziona la specializzazione principale per ricevere preventivi mirati.',
      title: 'Servizio',
      options: [
        { id: 'renovation', label: 'Rifacimento impianto elettrico', description: 'Installazione completa o messa a norma.', icon: Hammer, priceRange: { min: 850, max: 3500 }, nextStepId: 'property_size' },
        { id: 'install_partial', label: 'Installazione impianto elettrico', description: 'Nuova installazione parziale.', icon: Zap, priceRange: { min: 500, max: 2000 }, nextStepId: 'property_size' },
        { id: 'repair', label: 'Riparazione impianto elettrico', description: 'Ricerca guasto o riparazione rapida.', icon: AlertTriangle, priceRange: { min: 70, max: 250 }, nextStepId: 'specific_problem' },
        { id: 'certification', label: 'Certificazione impianto elettrico', description: 'Rilascio Di.Co. o verifica tecnica.', icon: Shield, priceRange: { min: 150, max: 400 }, nextStepId: 'property_size' },
        { id: 'photovoltaic', label: 'Impianto fotovoltaico', description: 'Energia solare e pannelli.', icon: Waves, priceRange: { min: 3000, max: 12000 }, nextStepId: 'property_size' },
        { id: 'antennas', label: 'Antenne', description: 'Antenna TV o Satellitare.', icon: Zap, priceRange: { min: 80, max: 400 }, nextStepId: 'involved_equipment' },
        { id: 'intercom_alarm', label: 'Citofono e/o impianto d\'allarme', description: 'Sicurezza e comunicazione.', icon: Smartphone, priceRange: { min: 150, max: 1200 }, nextStepId: 'involved_equipment' },
        { id: 'ac_ventilation', label: 'Condizionatore e/o ventilatore', description: 'Climatizzazione.', icon: Thermometer, priceRange: { min: 250, max: 900 }, nextStepId: 'involved_equipment' },
        { id: 'other', label: 'Altro', description: 'Interventi non elencati.', icon: PenTool }
      ]
    },
    {
      id: 'property_size',
      type: 'choice',
      title: 'Dimensione',
      question: 'Quanto è grande l\'abitazione (metri quadri)?',
      description: 'I metri quadri aiutano a stimare la quantità di materiali necessari.',
      options: [
        { id: 'small', label: 'Meno di 50 mq', icon: Home, priceRange: { min: 850, max: 1800 } },
        { id: 'medium', label: '50 - 100 mq', icon: Home, priceRange: { min: 1800, max: 3500 } },
        { id: 'large', label: '100 - 200 mq', icon: Home, priceRange: { min: 3500, max: 6500 } },
        { id: 'extra', label: 'Oltre 200 mq', icon: Home, priceRange: { min: 6500, max: 12000 } }
      ]
    },
    {
      id: 'specific_problem',
      type: 'choice',
      title: 'Problema',
      question: 'Quale problema presenta l\'impianto elettrico?',
      options: [
        { id: 'old', label: 'L\'impianto elettrico è vecchio', icon: Shield },
        { id: 'power_loss', label: 'L\'impianto elettrico perde potenza', icon: Zap },
        { id: 'not_working', label: 'L\'impianto elettrico non funziona', icon: AlertTriangle },
        { id: 'noisy', label: 'L\'impianto elettrico è rumoroso', icon: Waves },
        { id: 'overheating', label: 'Surriscaldamento impianto', icon: Thermometer },
        { id: 'breaker', label: 'Interruttore generale salta', icon: AlertTriangle },
        { id: 'other', label: 'Altro', icon: PenTool }
      ]
    },
    {
      id: 'involved_equipment',
      type: 'choice',
      title: 'Componenti',
      question: 'Quali apparecchiature sono coinvolte?',
      options: [
        { id: 'full', label: 'Tutto l\'impianto elettrico generale', icon: Zap, priceRange: { min: 850, max: 4200 } },
        { id: 'outlets', label: 'Prese e interruttori', icon: Power, priceRange: { min: 50, max: 400 } },
        { id: 'antenna', label: 'Antenna televisiva e/o satellitare', icon: Zap, priceRange: { min: 80, max: 350 } },
        { id: 'alarm', label: 'Citofono e/o impianto d\'allarme', icon: Smartphone, priceRange: { min: 200, max: 1500 } },
        { id: 'ac', label: 'Condizionatore e/o ventilatore', icon: Thermometer, priceRange: { min: 200, max: 800 } },
        { id: 'thermostat', label: 'Termostato', icon: Thermometer, priceRange: { min: 60, max: 200 } },
        { id: 'other', label: 'Altro', icon: PenTool }
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
