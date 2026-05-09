import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Esempio di Categorie (si possono ampliare o importare)
const categorie = [
  'idraulico',
  'elettricista',
  'fabbro',
  'giardiniere',
  'muratore',
  'termico'
];

// Esempio di struttura ISTAT (da sostituire con importazione reale JSON)
const dataIstat = {
  "puglia": {
    "bari": ["bari", "altamura", "monopoli", "corato"],
    "lecce": ["lecce", "nardo", "galatina"]
  },
  "lombardia": {
    "milano": ["milano", "sesto-san-giovanni", "cinisello-balsamo"]
  }
};

const BASE_URL = 'https://cercartigiano.com';
const BUILD_DIR = path.join(__dirname, 'public');

function generateSitemapIndex() {
  const regions = Object.keys(dataIstat);
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  
  regions.forEach(regione => {
    xml += `  <sitemap>\n    <loc>${BASE_URL}/sitemap-${regione}.xml</loc>\n  </sitemap>\n`;
  });
  
  xml += `</sitemapindex>`;
  
  fs.writeFileSync(path.join(BUILD_DIR, 'sitemap.xml'), xml);
  console.log(`Generato sitemap.xml (Index)`);
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
    fs.writeFileSync(path.join(BUILD_DIR, fileName), xml);
    console.log(`Generato ${fileName} con successo.`);
  }
}

function main() {
  if (!fs.existsSync(BUILD_DIR)){
    fs.mkdirSync(BUILD_DIR, { recursive: true });
  }

  generateSitemapIndex();
  generateRegionalSitemaps();
  console.log("Generazione Sitemap Completata.");
}

main();
