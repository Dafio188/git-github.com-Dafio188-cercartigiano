const fs = require('fs');

const constantsContent = fs.readFileSync('src/constants.ts', 'utf-8');

// Extract CATEGORY_SERVICES
const categoryMatch = constantsContent.match(/export const CATEGORY_SERVICES: Record<string, string\[\]> = ([\s\S]*?);\n\n/);
if (!categoryMatch) {
  console.log("Could not find CATEGORY_SERVICES");
  process.exit(1);
}

let categoryServicesStr = categoryMatch[1];
let CATEGORY_SERVICES = eval("(" + categoryServicesStr + ")");

const existingKeys = [
  'electrical', 'plumbing', 'construction', 'cleaning', 'gardening', 'moving', 'moving_logic_shim'
];

let generatedTrees = [];
for (const [key, services] of Object.entries(CATEGORY_SERVICES)) {
  if (!existingKeys.includes(key)) {
    const optionsBlock = services.map((s, idx) => {
      const idStr = "opt_" + idx;
      return `        { id: '${idStr}', label: '${s.replace(/'/g, "\\'")}', icon: Sparkles, nextStepId: 'additional_notes' }`;
    }).join(",\n");

    const tree = `  ${key}: [
    {
      id: 'service_type',
      type: 'choice',
      question: 'Di quale servizio hai bisogno?',
      title: 'Servizio',
      options: [
${optionsBlock}
      ]
    },
    { id: 'photos', type: 'photo', question: 'Allega foto (opzionale)' },
    { id: 'additional_notes', type: 'text', question: 'Dettagli aggiuntivi' },
    { id: 'address', type: 'address', question: 'Dove serve l\\'intervento?' },
    { id: 'contact_info', type: 'contact', question: 'Dove vuoi ricevere i preventivi?' }
  ]`;
    generatedTrees.push(tree);
  }
}

console.log(generatedTrees.join(",\n"));
