
export interface MappingResult {
  categoryId: string;
  subServiceId?: string;
  message?: string;
}

/**
 * Mappatura estesa delle professioni e dei termini di ricerca verso le categorie principali.
 * Include anche il pre-set dell'attività specifica se identificata.
 */
export const KEYWORD_MAPPING: Record<string, MappingResult> = {
  // ELETTREICITÀ (electrical)
  'elettricista': { categoryId: 'electrical' },
  'elettricista pronto intervento': { categoryId: 'electrical', subServiceId: 'repair' },
  'corto circuito': { categoryId: 'electrical', subServiceId: 'repair' },
  'quadro elettrico': { categoryId: 'electrical', subServiceId: 'repair' },
  'salvavita': { categoryId: 'electrical', subServiceId: 'repair' },
  'antennista': { categoryId: 'electrical', subServiceId: 'antennas_sat' },
  'antenna tv': { categoryId: 'electrical', subServiceId: 'antennas_sat' },
  'parabola': { categoryId: 'electrical', subServiceId: 'antennas_sat' },
  'antenna': { categoryId: 'electrical', subServiceId: 'antennas_sat' },
  'allarme': { categoryId: 'electrical', subServiceId: 'intercom_security' },
  'antifurto': { categoryId: 'electrical', subServiceId: 'intercom_security' },
  'citofonista': { categoryId: 'electrical', subServiceId: 'intercom_security' },
  'citofono': { categoryId: 'electrical', subServiceId: 'intercom_security' },
  'videocitofono': { categoryId: 'electrical', subServiceId: 'intercom_security' },
  'telecamere': { categoryId: 'electrical', subServiceId: 'intercom_security' },
  'videosorveglianza': { categoryId: 'electrical', subServiceId: 'intercom_security' },
  'telecamera': { categoryId: 'electrical', subServiceId: 'intercom_security' },
  'cancello elettrico': { categoryId: 'electrical', subServiceId: 'intercom_security' },
  'cancello automatico': { categoryId: 'electrical', subServiceId: 'intercom_security' },
  'fotovoltaico': { categoryId: 'electrical', subServiceId: 'photovoltaic' },
  'pannelli solari': { categoryId: 'electrical', subServiceId: 'photovoltaic' },
  'pannello solare': { categoryId: 'electrical', subServiceId: 'photovoltaic' },
  'condizionatore': { categoryId: 'electrical' },
  'climatizzatore': { categoryId: 'electrical' },
  'presa': { categoryId: 'electrical', subServiceId: 'lighting_outlets' },
  'interruttore': { categoryId: 'electrical', subServiceId: 'lighting_outlets' },
  'punto luce': { categoryId: 'electrical', subServiceId: 'lighting_outlets' },
  'lampadario': { categoryId: 'electrical', subServiceId: 'lighting_outlets' },
  'messa a norma': { categoryId: 'electrical', subServiceId: 'certification' },
  'dico': { categoryId: 'electrical', subServiceId: 'certification' },
  'certificazione elettrica': { categoryId: 'electrical', subServiceId: 'certification' },

  // IDRAULICA (plumbing)
  'idraulico': { categoryId: 'plumbing' },
  'idraulica': { categoryId: 'plumbing' },
  'perdita': { categoryId: 'plumbing', subServiceId: 'leak' },
  'perdite': { categoryId: 'plumbing', subServiceId: 'leak' },
  'tubo rotto': { categoryId: 'plumbing', subServiceId: 'leak' },
  'allagamento': { categoryId: 'plumbing', subServiceId: 'leak' },
  'scarico intasato': { categoryId: 'plumbing', subServiceId: 'clog' },
  'wc intasato': { categoryId: 'plumbing', subServiceId: 'clog' },
  'disotturazione': { categoryId: 'plumbing', subServiceId: 'clog' },
  'autospurgo': { categoryId: 'plumbing', subServiceId: 'clog' },
  'spurgo': { categoryId: 'plumbing', subServiceId: 'clog' },
  'caldaia': { categoryId: 'plumbing', subServiceId: 'boiler' },
  'scaldabagno': { categoryId: 'plumbing', subServiceId: 'boiler' },
  'boiler': { categoryId: 'plumbing', subServiceId: 'boiler' },
  'termosifoni': { categoryId: 'plumbing', subServiceId: 'boiler' },
  'termosifone': { categoryId: 'plumbing', subServiceId: 'boiler' },
  'bagno': { categoryId: 'plumbing', subServiceId: 'bathroom' },
  'rifacimento bagno': { categoryId: 'plumbing', subServiceId: 'bathroom' },
  'rubinetto': { categoryId: 'plumbing' },
  'miscelatore': { categoryId: 'plumbing' },
  'lavandino': { categoryId: 'plumbing' },
  'vater': { categoryId: 'plumbing' },

  // EDILIZIA E TINTEGGIATURA (construction)
  'edilizia': { categoryId: 'construction' },
  'edile': { categoryId: 'construction' },
  'muratore': { categoryId: 'construction' },
  'muratura': { categoryId: 'construction' },
  'imbianchino': { categoryId: 'construction' },
  'pittore': { categoryId: 'construction' },
  'tinteggiatura': { categoryId: 'construction' },
  'tinteggio': { categoryId: 'construction' },
  'verniciatura': { categoryId: 'construction' },
  'pittura': { categoryId: 'construction' },
  'cartongesso': { categoryId: 'construction' },
  'cartongessista': { categoryId: 'construction' },
  'piastrellista': { categoryId: 'construction' },
  'piastrelle': { categoryId: 'construction' },
  'pavimento': { categoryId: 'construction' },
  'pavimenti': { categoryId: 'construction' },
  'parquet': { categoryId: 'construction' },
  'parquettista': { categoryId: 'construction' },
  'ristrutturazione': { categoryId: 'construction' },
  'ristrutturare casa': { categoryId: 'construction' },
  'cappotto termico': { categoryId: 'construction' },
  'isolamento': { categoryId: 'construction' },
  'tetto': { categoryId: 'construction' },
  'rifacimento tetto': { categoryId: 'construction' },
  'intonaco': { categoryId: 'construction' },

  // FALEGNAME (carpentry)
  'falegname': { categoryId: 'carpentry' },
  'falegnameria': { categoryId: 'carpentry' },
  'legno': { categoryId: 'carpentry' },
  'mobili': { categoryId: 'carpentry' },
  'mobile su misura': { categoryId: 'carpentry' },
  'restauro': { categoryId: 'carpentry' },
  'restauratore': { categoryId: 'carpentry' },
  'infissi': { categoryId: 'carpentry' },
  'finestre': { categoryId: 'carpentry' },
  'porte': { categoryId: 'carpentry' },
  'armadio': { categoryId: 'carpentry' },

  // TRASLOCHI (moving)
  'traslochi': { categoryId: 'moving' },
  'trasloco': { categoryId: 'moving' },
  'sgombero': { categoryId: 'moving' },
  'sgomberare soffitta': { categoryId: 'moving' },
  'sgomberare cantina': { categoryId: 'moving' },
  'facchino': { categoryId: 'moving' },
  'facchinaggio': { categoryId: 'moving' },

  // GIARDINAGGIO (gardening)
  'giardiniere': { categoryId: 'gardening' },
  'giardinaggio': { categoryId: 'gardening' },
  'potatura': { categoryId: 'gardening' },
  'potare': { categoryId: 'gardening' },
  'prato': { categoryId: 'gardening' },
  'erba': { categoryId: 'gardening' },
  'taglio prato': { categoryId: 'gardening' },
  'irrigazione': { categoryId: 'gardening' },
  'siepe': { categoryId: 'gardening' },

  // PULIZIE (cleaning)
  'pulizie': { categoryId: 'cleaning' },
  'impresa di pulizie': { categoryId: 'cleaning' },
  'pulizia': { categoryId: 'cleaning' },
  'lavaggio vetri': { categoryId: 'cleaning' },
  'pulizia post cantiere': { categoryId: 'cleaning' },

  // TUTTOFARE (handyman)
  'tuttofare': { categoryId: 'handyman' },
  'montaggio mobili': { categoryId: 'handyman' },
  'montaggio armadio': { categoryId: 'handyman' },
  'appendere quadri': { categoryId: 'handyman' },
  'serrature': { categoryId: 'handyman' },
  'serratura': { categoryId: 'handyman' },
  'cambio serratura': { categoryId: 'handyman' },
  'tapparelle': { categoryId: 'handyman' },
  'tapparella': { categoryId: 'handyman' },
  'avvolgibile': { categoryId: 'handyman' },
  'tende da sole': { categoryId: 'handyman' },
  'zanzariere': { categoryId: 'handyman' },
};

/**
 * Trova la categoria e l'eventuale sottoservizio più adatto in base alla query dell'utente.
 */
export const findCategoryFromQuery = (query: string): MappingResult | null => {
  if (!query) return null;
  const normalizedQuery = query.toLowerCase().trim();
  
  // 1. Controllo corrispondenza esatta
  if (KEYWORD_MAPPING[normalizedQuery]) {
    return KEYWORD_MAPPING[normalizedQuery];
  }
  
  // 2. Controllo se la query contiene una delle keyword (dalla più lunga alla più corta)
  const keywords = Object.keys(KEYWORD_MAPPING).sort((a, b) => b.length - a.length);
  
  for (const keyword of keywords) {
    if (normalizedQuery.includes(keyword)) {
      return KEYWORD_MAPPING[keyword];
    }
  }
  
  // 3. Fallback per plurali/singolari semplici
  if (normalizedQuery.endsWith('i') || normalizedQuery.endsWith('e')) {
     const singular1 = normalizedQuery.slice(0, -1) + 'o';
     if (KEYWORD_MAPPING[singular1]) return KEYWORD_MAPPING[singular1];
     const singular2 = normalizedQuery.slice(0, -1) + 'a';
     if (KEYWORD_MAPPING[singular2]) return KEYWORD_MAPPING[singular2];
  }
  
  return null;
};

