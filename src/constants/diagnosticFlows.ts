export interface DiagnosticOption {
  id: string;
  label: string;
  description?: string;
  nextStepId?: string; // Salto condizionale a un'altra domanda
}

export interface DiagnosticStep {
  id: string;
  title: string;
  question: string;
  type: 'select' | 'multi-select' | 'text' | 'number' | 'image_upload';
  options?: DiagnosticOption[];
  placeholder?: string;
  required?: boolean;
}

export interface CategoryFlow {
  categoryId: string;
  steps: DiagnosticStep[];
}

export const DIAGNOSTIC_FLOWS: Record<string, CategoryFlow> = {
  electrical: {
    categoryId: 'electrical',
    steps: [
      {
        id: 'service_type',
        title: 'Tipo di Intervento',
        question: 'Che tipo di lavoro elettrico devi eseguire?',
        type: 'select',
        options: [
          { id: 'repair', label: 'Riparazione Guasto', nextStepId: 'repair_detail' },
          { id: 'new_install', label: 'Nuova Installazione', nextStepId: 'install_detail' },
          { id: 'certification', label: 'Certificazione / DiCo', nextStepId: 'cert_detail' }
        ]
      },
      {
        id: 'repair_detail',
        title: 'Dettaglio Guasto',
        question: 'Qual è il problema principale?',
        type: 'select',
        options: [
          { id: 'short_circuit', label: 'Scatta il salvavita / Corto circuito' },
          { id: 'no_power', label: 'Manca corrente in alcune stanze' },
          { id: 'socket_smoke', label: 'Presa bruciata / Odore di fumo' },
          { id: 'intercom_fail', label: 'Il citofono non suona/apre' }
        ]
      },
      {
        id: 'install_detail',
        title: 'Nuova Installazione',
        question: 'Cosa desideri installare?',
        type: 'select',
        options: [
          { id: 'lighting', label: 'Punti luce / Lampadari' },
          { id: 'sockets', label: 'Prese / Interruttori aggiuntivi' },
          { id: 'alarm', label: 'Sistema di Allarme' },
          { id: 'wallbox', label: 'Stazione ricarica auto (Wallbox)' }
        ]
      },
      {
        id: 'context',
        title: 'Ambiente',
        question: 'Dove dobbiamo intervenire?',
        type: 'select',
        options: [
          { id: 'apartment', label: 'Appartamento' },
          { id: 'villa', label: 'Villa / Casa Indipendente' },
          { id: 'office', label: 'Ufficio / Negozio' },
          { id: 'condo', label: 'Parti Comuni Condominiali' }
        ]
      },
      {
        id: 'photos',
        title: 'Immagini',
        question: 'Puoi caricare una foto del quadro elettrico o del punto interessato? (Aiuta molto l\'artigiano)',
        type: 'image_upload'
      }
    ]
  },
  plumbing: {
    categoryId: 'plumbing',
    steps: [
      {
        id: 'plumbing_type',
        title: 'Tipo di Servizio',
        question: 'Di cosa hai bisogno nello specifico?',
        type: 'select',
        options: [
          { id: 'leak', label: 'Perdita d\'acqua', nextStepId: 'leak_urgency' },
          { id: 'boiler', label: 'Caldaia / Riscaldamento', nextStepId: 'boiler_detail' },
          { id: 'clog', label: 'Scarico intasato', nextStepId: 'clog_detail' }
        ]
      },
      {
        id: 'leak_urgency',
        title: 'Urgenza Perdita',
        question: 'Quanto è grave la perdita?',
        type: 'select',
        options: [
          { id: 'critical', label: 'Allagamento in corso / Urgente' },
          { id: 'dripping', label: 'Gocciolamento costante' },
          { id: 'seepage', label: 'Macchia di umidità sul muro' }
        ]
      },
      {
        id: 'boiler_detail',
        title: 'Dettaglio Caldaia',
        question: 'Qual è lo stato della caldaia?',
        type: 'select',
        options: [
          { id: 'not_starting', label: 'Non si accende' },
          { id: 'low_pressure', label: 'Pressione bassa / Errore visualizzato' },
          { id: 'maintenance', label: 'Revisione annuale / Bollino blu' },
          { id: 'replacement', label: 'Installazione Nuova Caldaia' }
        ]
      }
    ]
  }
};
