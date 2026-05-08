import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface AnalysisResult {
  categoryId: string;
  subServiceId?: string;
  summary: string;
  mappedMessage: string;
  initialAnswers: Record<string, any>;
}

export const analyzeSearchQuery = async (query: string): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analizza questa richiesta di un cliente per un lavoro artigianale: "${query}".
      Determina la categoria principale e l'attività specifica (sottoservizio).
      
      Categorie disponibili:
      - electrical (elettricista, antennista, allarmi, condizionatori)
      - plumbing (idraulico, caldaie, scarichi, bagno)
      - construction (edile, imbianchino, cartongesso, pavimenti, tetti)
      - carpentry (falegname, mobili, infissi)
      - gardening (giardiniere, potatura, irrigazione)
      - cleaning (pulizie casa, uffici, post-cantiere)
      - handyman (tuttofare, montaggio mobili, serrature, tapparelle)
      - moving (traslochi, sgomberi)
      
      Restituisci un JSON con questa struttura:
      {
        "categoryId": "string (una delle sopra)",
        "subServiceId": "string (identificatore tecnico breve del sottoservizio)",
        "summary": "Breve riassunto del problema capito",
        "mappedMessage": "Un messaggio di conferma rassicurante (es: 'Ottimo, procediamo con la guida per la tinteggiatura')",
        "initialAnswers": { "field_id": "value" } (es: { "construction_type": "painting" })
      }`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            categoryId: { type: Type.STRING },
            subServiceId: { type: Type.STRING },
            summary: { type: Type.STRING },
            mappedMessage: { type: Type.STRING },
            initialAnswers: { type: Type.OBJECT }
          },
          required: ["categoryId", "summary", "mappedMessage"]
        }
      }
    });

    return JSON.parse(response.text.trim()) as AnalysisResult;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    // Fallback basico in caso di errore API
    return {
      categoryId: "electrical",
      summary: "Richiesta generica",
      mappedMessage: "Iniziamo la configurazione della tua richiesta.",
      initialAnswers: {}
    };
  }
};
