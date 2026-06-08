import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Categorie Italiane per SEO URL regionali
const categorie = [
  'idraulico',
  'elettricista',
  'imbianchino',
  'fabbro',
  'sarto',
  'elettrodomestici',
  'tecnico-informatico',
  'fotografo',
  'tutoring',
  'assistenza-anziani',
  'giardiniere',
  'pet-sitting',
  'estetica',
  'babysitter',
  'tuttofare',
  'traslochi',
  'lavori-edili',
  'falegname',
  'psicologo',
  'avvocato',
  'architetto',
  'commercialista',
  'meccanico',
  'fisioterapista'
];

// Mappa categorie di fallback per i filtri di ricerca nel sitemap-main
const categoryIds = [
  'cleaning', 'plumbing', 'electrical', 'painter', 'locksmith',
  'tailor', 'appliances', 'it_support', 'photography', 'tutoring',
  'elderly_care', 'gardening', 'pet_sitting', 'beauty', 'babysitting',
  'handyman', 'moving', 'construction', 'carpentry', 'psychology',
  'lawyer', 'architect', 'accountant', 'mechanic', 'physiotherapy'
];

// Esempio di struttura ISTAT (copre tutte le 20 regioni d'Italia con province e comuni chiave)
const dataIstat = {
  "abruzzo": {
    "pescara": ["pescara", "montesilvano", "spoltore"],
    "chieti": ["chieti", "vasto", "lanciano"],
    "la-aquila": ["la-aquila", "avezzano", "sulmona"],
    "teramo": ["teramo", "giulianova"]
  },
  "basilicata": {
    "potenza": ["potenza", "melfi"],
    "matera": ["matera", "pisticci"]
  },
  "calabria": {
    "reggio-calabria": ["reggio-di-calabria", "gioia-tauro", "palmi"],
    "cosenza": ["cosenza", "corigliano-rossano", "rende"],
    "catanzaro": ["catanzaro", "lamezia-terme"]
  },
  "campania": {
    "napoli": ["napoli", "giugliano-in-campania", "torre-del-greco", "pozzuoli", "casoria"],
    "salerno": ["salerno", "cava-de-tirreni", "battipaglia", "nocera-inferiore"],
    "caserta": ["caserta", "aversa", "marcianise"],
    "benevento": ["benevento"],
    "avellino": ["avellino"]
  },
  "emilia-romagna": {
    "bologna": ["bologna", "imola", "casalecchio-di-reno"],
    "modena": ["modena", "carpi", "sassuolo"],
    "parma": ["parma", "fidenza"],
    "reggio-emilia": ["reggio-nell-emilia"],
    "ravenna": ["ravenna", "faenza"],
    "rimini": ["rimini", "riccione"],
    "ferrara": ["ferrara"],
    "piacenza": ["piacenza"]
  },
  "friuli-venezia-giulia": {
    "trieste": ["trieste"],
    "udine": ["udine", "codroipo"],
    "pordenone": ["pordenone"],
    "gorizia": ["gorizia"]
  },
  "lazio": {
    "roma": ["roma", "guidonia-montecelio", "fiumicino", "pomezia", "tivoli", "civitavecchia"],
    "latina": ["latina", "aprilia", "terracina"],
    "viterbo": ["viterbo"],
    "frosinone": ["frosinone", "cassino"],
    "rieti": ["rieti"]
  },
  "liguria": {
    "genova": ["genova", "rapallo", "chiavari"],
    "la-spezia": ["la-spezia", "sarzana"],
    "savona": ["savona"],
    "imperia": ["imperia", "sanremo"]
  },
  "lombardia": {
    "milano": ["milano", "sesto-san-giovanni", "cinisello-balsamo", "legnano", "rho"],
    "brescia": ["brescia", "desenzano-del-garda"],
    "bergamo": ["bergamo", "treviglio"],
    "monza": ["monza", "lissone", "seregno"],
    "varese": ["varese", "busto-arsizio", "gallarate"],
    "como": ["como"]
  },
  "marche": {
    "ancona": ["ancona", "senigallia", "jesi"],
    "pesaro-urbino": ["pesaro", "fano"],
    "macerata": ["macerata"],
    "ascoli-piceno": ["ascoli-piceno", "san-benedetto-del-tronto"]
  },
  "molise": {
    "campobasso": ["campobasso", "termoli"],
    "isernia": ["isernia"]
  },
  "piemonte": {
    "torino": ["torino", "moncalieri", "collegno", "rivoli", "settimo-torinese"],
    "novara": ["novara"],
    "alessandria": ["alessandria"],
    "asti": ["asti"],
    "cuneo": ["cuneo"],
    "biella": ["biella"]
  },
  "puglia": {
    "bari": ["bari", "altamura", "monopoli", "corato", "molfetta", "bitonto"],
    "lecce": ["lecce", "nardo", "galatina", "copertino"],
    "taranto": ["taranto", "martina-franca"],
    "foggia": ["foggia", "cerignola", "manfredonia"],
    "brindisi": ["brindisi"],
    "bt": ["barletta", "andria", "trani"]
  },
  "sardegna": {
    "cagliari": ["cagliari", "quartu-sant-elena"],
    "sassari": ["sassari", "alghero"],
    "nuoro": ["nuoro"],
    "oristano": ["oristano"]
  },
  "sicilia": {
    "palermo": ["palermo", "bagheria", "carini"],
    "catania": ["catania", "acireale", "misterbianco"],
    "messina": ["messina", "barcellona-pozzo-di-gotto"],
    "siracusa": ["siracusa"],
    "ragusa": ["ragusa", "vittoria"],
    "trapani": ["trapani", "marsala"],
    "agrigento": ["agrigento"],
    "caltanissetta": ["caltanissetta"]
  },
  "toscana": {
    "firenze": ["firenze", "scandicci", "sesto-fiorentino", "empoli"],
    "prato": ["prato"],
    "livorno": ["livorno"],
    "arezzo": ["arezzo"],
    "pisa": ["pisa", "cascina"],
    "lucca": ["lucca", "viareggio"]
  },
  "trentino-alto-adige": {
    "trento": ["trento", "rovereto"],
    "bolzano": ["bolzano", "merano"]
  },
  "umbria": {
    "perugia": ["perugia", "foligno", "citta-di-castello"],
    "terni": ["terni", "orvieto"]
  },
  "valle-aosta": {
    "aosta": ["aosta"]
  },
  "veneto": {
    "venezia": ["venezia", "chioggia", "san-dona-di-piave"],
    "verona": ["verona", "villafranca-di-verona"],
    "padova": ["padova", "selvazzano-dentro"],
    "vicenza": ["vicenza", "bassano-del-grappa"],
    "treviso": ["treviso", "conegliano"]
  }
};

const BASE_URL = 'https://cercartigiano.com';
const PUBLIC_DIR = path.join(__dirname, 'public');
const DIST_DIR = path.join(__dirname, 'dist');

function writeToBoth(fileName, content) {
  // Always write to public
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }
  fs.writeFileSync(path.join(PUBLIC_DIR, fileName), content);
  
  // Also write to dist if it exists
  if (fs.existsSync(DIST_DIR)) {
    fs.writeFileSync(path.join(DIST_DIR, fileName), content);
  }
}

function generateSitemapIndex() {
  const regions = Object.keys(dataIstat);
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  
  // Aggiunge la sitemap principale contenente le pagine core e i filtri categoria
  xml += `  <sitemap>\n    <loc>${BASE_URL}/sitemap-main.xml</loc>\n  </sitemap>\n`;
  
  regions.forEach(regione => {
    xml += `  <sitemap>\n    <loc>${BASE_URL}/sitemap-${regione}.xml</loc>\n  </sitemap>\n`;
  });
  
  xml += `</sitemapindex>`;
  
  writeToBoth('sitemap.xml', xml);
  console.log(`Generato sitemap.xml (Index)`);
}

function generateMainSitemap() {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  
  // Pagine statiche istituzionali e core
  const cores = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/come-funziona', priority: '0.8', changefreq: 'weekly' },
    { path: '/lavora-con-noi', priority: '0.8', changefreq: 'weekly' },
    { path: '/privacy', priority: '0.5', changefreq: 'monthly' },
    { path: '/termini', priority: '0.5', changefreq: 'monthly' },
    { path: '/cookies', priority: '0.5', changefreq: 'monthly' },
    { path: '/search', priority: '0.9', changefreq: 'daily' }
  ];

  cores.forEach(c => {
    xml += `  <url>\n    <loc>${BASE_URL}${c.path}</loc>\n    <changefreq>${c.changefreq}</changefreq>\n    <priority>${c.priority}</priority>\n  </url>\n`;
  });

  // Inserimento categorie principali nella sitemap per indicizzazione diretta AEO/GEO e Googlebot
  categoryIds.forEach(catId => {
    xml += `  <url>\n    <loc>${BASE_URL}/search?category=${catId}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  });

  xml += `</urlset>`;
  writeToBoth('sitemap-main.xml', xml);
  console.log('Generatato sitemap-main.xml con successo.');
}

function generateRegionalSitemaps() {
  for (const [regione, province] of Object.entries(dataIstat)) {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    for (const [provincia, comuni] of Object.entries(province)) {
      comuni.forEach(comune => {
        categorie.forEach(categoria => {
          const urlPath = `/servizi/${regione}/${provincia}/${comune}/${categoria}`;
          xml += `  <url>\n    <loc>${BASE_URL}${urlPath}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
        });
      });
    }
    
    xml += `</urlset>`;
    const fileName = `sitemap-${regione}.xml`;
    writeToBoth(fileName, xml);
    console.log(`Generato ${fileName} con successo.`);
  }
}

function main() {
  if (!fs.existsSync(PUBLIC_DIR)){
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  generateMainSitemap();
  generateSitemapIndex();
  generateRegionalSitemaps();
  console.log("Generazione Sitemap Completata.");
}

main();
