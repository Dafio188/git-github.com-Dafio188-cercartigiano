import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { APIProvider } from '@vis.gl/react-google-maps';

// Access environment variables safely
// @ts-ignore - process might not be defined in some environments but handled by vite define
const GM_KEY = (typeof process !== 'undefined' && process.env?.GOOGLE_MAPS_PLATFORM_KEY) || import.meta.env.VITE_GOOGLE_MAPS_PLATFORM_KEY || '';

function Main() {
  const displayMapsWarning = !GM_KEY;

  return (
    <BrowserRouter>
      {displayMapsWarning && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest py-1 px-4 text-center">
          Configurazione incompleta: Inserisci GOOGLE_MAPS_PLATFORM_KEY nei Secrets per attivare le mappe
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

