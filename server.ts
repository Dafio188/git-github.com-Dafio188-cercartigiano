import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import Stripe from 'stripe';
import admin from 'firebase-admin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to get Firebase Admin Firestore instance lazily
let _db: admin.firestore.Firestore | null = null;
function getDb() {
  if (_db) return _db;
  
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (!fs.existsSync(configPath)) {
    console.warn("WARNING: Firebase configuration file missing. Admin features dependent on Firestore will be disabled.");
    return null;
  }

  try {
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    if (!admin.apps.length) {
      admin.initializeApp({
        projectId: firebaseConfig.projectId,
      });
    }
    _db = admin.firestore(firebaseConfig.firestoreDatabaseId);
    return _db;
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
    return null;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Serve static files from public folder
  const publicPath = path.resolve(__dirname, 'public');
  app.use(express.static(publicPath));

  // OpenAPI.it helper for invoicing
  async function sendInvoiceToSdi(billingData: any, session: Stripe.Checkout.Session, tokens: number) {
    const apiKey = process.env.OPENAPI_API_KEY;
    if (!apiKey) {
      console.warn("OpenAPI API Key missing. Skipping SDI submission.");
      return { status: 'draft', sdiId: null, pdfUrl: null, error: 'API Key missing' };
    }

    try {
      // Structure based on standard Italian Electronic Invoice requirement (Simplified for OpenAPI.it)
      const invoicePayload = {
        meta: {
          type: "fattura_elettronica",
          order_id: session.id
        },
        cedente: {
          // This would be CercArtigiano info from process.env or admin config
          ragione_sociale: "CercArtigiano di Davide Fio",
          partita_iva: "12345678901",
          indirizzo: "Via Roma 1, 00100 Roma RM"
        },
        cessionario: {
          ragione_sociale: billingData.ragioneSociale || billingData.codiceFiscale,
          partita_iva: billingData.partitaIva,
          codice_fiscale: billingData.codiceFiscale,
          indirizzo: billingData.address,
          cap: billingData.cap,
          comune: billingData.citta,
          provincia: billingData.provincia,
          codice_sdi: billingData.codiceSdi || "0000000",
          pec: billingData.pec
        },
        righe: [
          {
            descrizione: `Acquisto ${tokens} Token CercArtigiano`,
            quantita: 1,
            prezzo_unitario: (session.amount_total || 0) / 100 / 1.22, // Prezzo scorporato IVA 22%
            aliquota_iva: 22
          }
        ]
      };

      const response = await fetch("https://api.openapi.it/fatturazione/invia", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(invoicePayload)
      });

      if (!response.ok) throw new Error("SDI transmission failed");
      
      const resData = await response.json();
      return { status: 'sent', sdiId: resData.id as string, pdfUrl: resData.pdf_url as string, error: null };
    } catch (error: any) {
      console.error("SDI error:", error);
      return { status: 'error', sdiId: null, pdfUrl: null, error: error.message as string };
    }
  }

  // Stripe Webhook needs raw body
  app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      console.error("Missing Stripe secrets for webhook");
      return res.status(400).send("Webhook configuration error");
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    try {
      event = stripe.webhooks.constructEvent(req.body, sig!, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { userId, tokens } = session.metadata || {};

      if (userId && tokens) {
        try {
          const db = getDb();
          // 1. Update User Tokens
          const userRef = db.collection('users').doc(userId);
          await userRef.update({
            tokens: admin.firestore.FieldValue.increment(Number(tokens)),
            lastPurchaseAt: admin.firestore.FieldValue.serverTimestamp()
          });

          // 2. Fetch User Billing Profile
          const billingSnap = await db.collection('billingProfiles').doc(userId).get();
          const billingData = billingSnap.exists ? billingSnap.data() : null;

          let invoiceStatus = { status: 'draft', sdiId: null as string | null, pdfUrl: null as string | null, error: null as string | null };
          
          if (billingData) {
            // 3. Automate Invoice via OpenAPI
            invoiceStatus = await sendInvoiceToSdi(billingData, session, Number(tokens));
            
            // 4. Save Invoice Record
            const invoiceId = `INV-${Date.now()}`;
            await db.collection('invoices').doc(invoiceId).set({
              userId,
              orderId: session.id,
              amount: (session.amount_total || 0) / 100,
              currency: session.currency || 'eur',
              tokens: Number(tokens),
              status: invoiceStatus.status,
              sdiId: invoiceStatus.sdiId,
              pdfUrl: invoiceStatus.pdfUrl,
              fiscalData: billingData,
              errorLog: invoiceStatus.error,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`Invoice Processed: ${invoiceId} - Status: ${invoiceStatus.status}`);
          }

        } catch (error) {
          console.error("Error processing successful payment:", error);
        }
      }
    }

    res.json({ received: true });
  });

  app.use(express.json());

  // Log endpoint for client errors
  app.post('/api/log', (req, res) => {
    try {
      fs.appendFileSync('client_errors.log', JSON.stringify(req.body) + '\n');
    } catch (e) {
      console.warn("Could not write to client_errors.log");
    }
    console.error('[CLIENT ERROR LOG]', req.body);
    res.send({ok: true});
  });

  // Gemini AI endpoints
  app.post('/api/ai/parse-address', async (req, res) => {
    try {
      const { addressString } = req.body;
      if (!addressString) return res.status(400).json({ error: "Missing address" });
      
      const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "Missing AI Key" });
      
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const prompt = `Analizza questo indirizzo parziale o completo e scomponilo nei suoi componenti. Se mancano delle informazioni (come il CAP o la provincia), deducili in base alla città se possibile in Italia.
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
Se non riesci a dedurre un campo, lascialo vuoto "".`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      res.json(JSON.parse(jsonStr));
    } catch (error: any) {
      console.error("AI Parse Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/ai/evaluate-complexity', async (req, res) => {
    try {
      const { title, description } = req.body;
      const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
      if (!apiKey) return res.json({ cost: 2 });
      
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const prompt = `Valuta la complessità di questo lavoro artigianale per determinare il costo in Token (da 1 a 10) che un professionista deve pagare per inviare un preventivo.
Titolo: ${title}
Descrizione: ${description}

Restituisci SOLO un numero intero tra 1 e 10.`;

      const result = await model.generateContent(prompt);
      const cost = parseInt(result.response.text().trim());
      res.json({ cost: isNaN(cost) ? 2 : Math.min(Math.max(cost, 1), 10) });
    } catch (error) {
      console.warn("AI complexity fallback:", error);
      res.json({ cost: 2 });
    }
  });

  let stripe: Stripe | null = null;
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  app.post("/api/billing/verify-vat", async (req, res) => {
    const { vat } = req.body;
    const apiKey = process.env.OPENAPI_API_KEY;

    if (!apiKey) {
      if (vat && vat.length === 11) {
        return res.json({ success: true, data: { status: 'active', denominazione: 'Demo Company SRL' } });
      }
      return res.status(500).json({ error: "OpenAPI API Key not configured." });
    }

    try {
      // Professional VAT validation via openapi.it
      const response = await fetch(`https://api.openapi.it/it/vat/validate/${vat}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) throw new Error("VAT check failed");

      const data = await response.json();
      res.json({ success: true, data: data.data || data });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API Route for Stripe Checkout
  app.post("/api/create-checkout-session", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured on the server." });
    }

    const { priceId, userId, tokens } = req.body;

    // Mapping based on new product definitions
    const priceMap: Record<string, { amount: number, name: string }> = {
      'price_worker_basic': { amount: 3900, name: 'Pack Crescita (50 Token)' },
      'price_worker_pro': { amount: 9900, name: 'Pack Professionista (150 Token)' },
      'price_worker_expert': { amount: 24900, name: 'Pack Expert (400 Token)' },
      'price_client_premium': { amount: 1500, name: 'Richiesta Premium (1 Token)' },
      'price_client_vip': { amount: 4900, name: 'VIP Pack (5 Token)' }
    };

    const offer = priceMap[priceId] || { amount: 990, name: 'CercArtigiano Credits' };

    const origin = req.headers.origin || 'http://localhost:3000';

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: offer.name,
              },
              unit_amount: offer.amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${origin}/credits?success=true&tokens=${tokens}`,
        cancel_url: `${origin}/credits?canceled=true`,
        metadata: {
          userId,
          tokens,
        },
      });

      res.json({ id: session.id, url: session.url });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn("WARNING: STRIPE_SECRET_KEY is missing. Payment features will be disabled.");
    }
  });
}

startServer();
