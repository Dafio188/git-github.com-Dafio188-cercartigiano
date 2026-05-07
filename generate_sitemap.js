import fs from "fs";

// Categorie base
const categorie = [
  "idraulico",
  "elettricista",
  "muratore",
  "imbianchino",
  "fabbro",
  "falegname",
  "giardiniere",
  "spazzacamino",
  "piastrellista",
  "serramentista"
];

// Leggi comuni
const comuniRaw = fs.readFileSync("src/pugliaComuni.json");
const comuni = JSON.parse(comuniRaw);

const baseUrl = "https://cercartigiano.com";

let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Pagine Principali -->
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`;

// Aggiungiamo le rotte dinamiche SEO
for (const com of comuni) {
  const provinciaUrl = com.provincia.toLowerCase();
  // Trasforma "Bari" in "bari", "Trinitapoli" in "trinitapoli", "San Giovanni Rotondo" in "san-giovanni-rotondo"
  const comuneUrl = com.comune.toLowerCase().replace(/\s+/g, '-');

  for (const cat of categorie) {
    sitemap += `  <url>
    <loc>${baseUrl}/servizi/${provinciaUrl}/${comuneUrl}/${cat}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
  }
}

sitemap += `</urlset>`;

fs.writeFileSync("public/sitemap.xml", sitemap);
console.log(`Generata sitemap con base = ${baseUrl}/servizi/...`);
