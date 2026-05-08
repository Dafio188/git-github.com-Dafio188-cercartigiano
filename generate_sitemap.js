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
const urls = [];
for (const com of comuni) {
  const provinciaUrl = com.provincia.toLowerCase();
  const comuneUrl = com.comune.toLowerCase().replace(/\s+/g, '-');

  for (const cat of categorie) {
    urls.push(`  <url>
    <loc>${baseUrl}/servizi/${provinciaUrl}/${comuneUrl}/${cat}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
  }
}

sitemap += urls.join('\n') + '\n';
sitemap += `</urlset>`;

fs.writeFileSync("dist/sitemap.xml", sitemap);
console.log(`Generata sitemap in dist/sitemap.xml con base = ${baseUrl}/servizi/...`);
