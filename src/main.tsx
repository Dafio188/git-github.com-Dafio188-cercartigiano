import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { APIProvider } from '@vis.gl/react-google-maps';

// Access environment variables safely
// @ts-ignore - process.env is handled by vite define
const GM_KEY = 
  process.env.GOOGLE_MAPS_PLATFORM_KEY || 
  import.meta.env.VITE_GOOGLE_MAPS_PLATFORM_KEY || 
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 
  '';

function Main() {
  const displayMapsWarning = !GM_KEY;

  return (
    <BrowserRouter>
      {displayMapsWarning && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-white/70 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] py-3 px-6 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          <p className="text-[11px] font-bold text-[#1D1D1F] tracking-tight whitespace-nowrap">
            Configurazione incompleta: Inserisci <code className="bg-black/5 px-1.5 py-0.5 rounded text-blue-600">GOOGLE_MAPS_PLATFORM_KEY</code> nei Secrets per attivare le mappe.
          </p>
        </div>
      )}
      {GM_KEY ? (
        <APIProvider apiKey={GM_KEY} version="weekly">
          <App />
        </APIProvider>
      ) : (
        <App />
      )}
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')!).render(<Main />);

