import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { APIProvider } from '@vis.gl/react-google-maps';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';

function Main() {
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBFBFD] p-6 font-sans">
        <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl border border-[#D2D2D7]/30 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <svg className="w-10 h-10 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-[#1D1D1F] mb-4 tracking-tight">Google Maps API Key Richiesta</h2>
          <p className="text-[#86868B] font-medium mb-8 leading-relaxed">
            Per attivare le funzioni di geolocalizzazione, assistente alla registrazione e mappe, è necessaria una chiave API.
          </p>
          
          <div className="text-left space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
              <p className="text-sm text-[#1D1D1F]">Ottieni una chiave su <a href="https://console.cloud.google.com/google/maps-apis/start" target="_blank" rel="noopener" className="text-blue-600 font-bold hover:underline">Google Cloud Console</a></p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
              <p className="text-sm text-[#1D1D1F]">Apri <b>Settings</b> (⚙️ ingranaggio in alto a destra) → <b>Secrets</b></p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
              <p className="text-sm text-[#1D1D1F]">Aggiungi <code>GOOGLE_MAPS_PLATFORM_KEY</code> e incolla la tua chiave.</p>
            </div>
          </div>
          
          <p className="text-[11px] text-[#86868B] font-bold uppercase tracking-widest bg-[#F5F5F7] py-3 rounded-xl">
            L'app si riavvierà automaticamente
          </p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY} version="weekly">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </APIProvider>
  );
}

createRoot(document.getElementById('root')!).render(<Main />);

