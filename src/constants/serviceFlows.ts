export interface ServiceChoice {
  id: string;
  label: string;
  description?: string;
  questions?: any[]; // Qui potremo espandere i flussi specifici
}

export interface CategoryStructure {
  id: string;
  label: string;
  subCategories: Record<string, ServiceChoice>;
}

export const WORK_CATEGORIES: Record<string, CategoryStructure> = {
  electrical: {
    id: 'electrical',
    label: 'Elettricità e Sistemi',
    subCategories: {
      'repair': { id: 'repair', label: 'Riparazione Guasto / Corto Circuito' },
      'antennas_sat': { id: 'antennas_sat', label: 'Impianto TV / Satellitare' },
      'intercom_security': { id: 'intercom_security', label: 'Antifurti e Videocitofonia' },
      'lighting_outlets': { id: 'lighting_outlets', label: 'Installazione Luci e Prese' },
      'photovoltaic': { id: 'photovoltaic', label: 'Impianto Fotovoltaico' },
      'certification': { id: 'certification', label: 'Certificazione Impianto (DiCo)' }
    }
  },
  plumbing: {
    id: 'plumbing',
    label: 'Idraulica e Termica',
    subCategories: {
      'leak': { id: 'leak', label: 'Riparazione Perdite' },
      'boiler': { id: 'boiler', label: 'Caldaia e Riscaldamento' },
      'bathroom': { id: 'bathroom', label: 'Arredo Bagno e Sanitari' },
      'clog': { id: 'clog', label: 'Disotturazione Scarichi' },
      'air_cond': { id: 'air_cond', label: 'Climatizzatori e Condizionamento' }
    }
  },
  construction: {
    id: 'construction',
    label: 'Edilizia e Ripristino',
    subCategories: {
      'painting': { id: 'painting', label: 'Tinteggiatura e Verniciatura (Imbianchino)' },
      'plasterboard': { id: 'plasterboard', label: 'Lavori in Cartongesso' },
      'flooring': { id: 'flooring', label: 'Pavimenti e Rivestimenti' },
      'renovation': { id: 'renovation', label: 'Ristrutturazione Completa' },
      'roof': { id: 'roof', label: 'Rifacimento Tetti e Coperture' },
      'masonry': { id: 'masonry', label: 'Piccoli Lavori Murari' }
    }
  },
  handyman: {
    id: 'handyman',
    label: 'Tuttofare e Assistenza',
    subCategories: {
      'locks': { id: 'locks', label: 'Sostituzione Serrature' },
      'shutters': { id: 'shutters', label: 'Riparazione Tapparelle / Persiane' },
      'assembly': { id: 'assembly', label: 'Montaggio Mobili' },
      'small_repairs': { id: 'small_repairs', label: 'Piccole Riparazioni Domestiche' }
    }
  }
  // Altre categorie come Giardinaggio, Pulizie ecc. seguono la stessa logica
};
