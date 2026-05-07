import { GoogleGenerativeAI } from "@google/generative-ai";

// Guard GoogleGenerativeAI initialization for client-side environments without GEMINI_API_KEY
const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || import.meta.env?.VITE_GEMINI_API_KEY || "";
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function parseAddressWithAI(addressString: string) {
  if (!genAI) {
    console.warn("Gemini AI not initialized: Missing API Key");
    return null;
  }
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(`Analizza questo indirizzo parziale o completo e scomponilo nei suoi componenti. Se mancano delle informazioni (come il CAP o la provincia), deducili in base alla città se possibile in Italia.
Indirizzo: "${addressString}"

Restituisci SOLO un JSON valido con questa struttura esatta:
{
  "route": "nome della via/piazza senza civico",
  "streetNumber": "numero civico se presente",
  "city": "città",
  "province": "sigla provincia 2 lettere",
  "region": "regione",
  "postalCode": "CAP 5 cifre",
  "lat": 0,
  "lng": 0
}
Se non riesci a dedurre un campo, lascialo vuoto "".`);

    const text = result.response.text().trim();
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("AI Address Parse Error:", error);
    return null;
  }
}

export async function evaluateJobComplexity(title: string, description: string): Promise<number> {
  if (!genAI) return 2;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(`Valuta la complessità di questo lavoro artigianale per determinare il costo in Token (da 1 a 10) che un professionista deve pagare per inviare un preventivo.
    Titolo: ${title}
    Descrizione: ${description}
    
    Restituisci SOLO un numero intero tra 1 e 10.
    Esempi:
    - Sostituzione lampadina: 1
    - Perfezionamento impianto elettrico casa: 5
    - Ristrutturazione completa bagno: 10`);

    const text = result.response.text().trim();
    const cost = parseInt(text);
    
    return isNaN(cost) ? 2 : Math.min(Math.max(cost, 1), 10);
  } catch (error) {
    console.warn("Using default token cost due to AI service unavailability.");
    return 2; // Default fallback
  }
}

