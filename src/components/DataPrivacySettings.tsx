import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { 
  ArrowLeft, 
  Shield, 
  Download, 
  Trash2, 
  FileText, 
  CheckCircle2, 
  Loader2,
  Lock,
  ExternalLink
} from 'lucide-react';
import { Button } from './ui/button';

interface DataPrivacySettingsProps {
  onBack: () => void;
}

export function DataPrivacySettings({ onBack }: DataPrivacySettingsProps) {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null as string | null);

  const handleExportData = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      const docRef = doc(db, 'users', auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const exportData = {
          profile: data,
          exportDate: new Date().toISOString(),
          userId: auth.currentUser.uid,
          disclaimer: "Dati generati da CercArtigiano conformemente al GDPR."
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cercartigiano_data_${auth.currentUser.uid}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        setSuccessMsg("Il tuo archivio dati è stato scaricato correttamente.");
        setTimeout(() => setSuccessMsg(null), 5000);
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Errore durante l'esportazione dei dati.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestDeletion = () => {
    alert("Per eliminare definitivamente il tuo account e tutti i dati associati, invia un'email a privacy@cercartigiano.it citando il tuo ID utente: " + auth.currentUser?.uid);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10 pb-32">
      <div className="flex items-center gap-4 px-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full bg-white shadow-sm border border-[#D2D2D7]/30">
          <ArrowLeft className="w-5 h-5 text-[#1D1D1F]" />
        </Button>
        <div>
          <h2 className="text-3xl font-black tracking-tight text-[#1D1D1F]">Privacy & Dati</h2>
          <p className="text-sm text-[#86868B] font-bold">Gestisci il tuo diritto all'oblio e la portabilità.</p>
        </div>
      </div>

      {successMsg && (
        <div className="p-6 bg-green-50 border border-green-100 rounded-[2.5rem] flex items-start gap-4 mx-2 animate-in fade-in slide-in-from-top-4 duration-500">
           <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
           <p className="text-sm text-green-800 font-bold">{successMsg}</p>
        </div>
      )}

      <div className="space-y-6">
        <section className="bg-white p-8 rounded-[3rem] border border-[#D2D2D7]/30 shadow-sm space-y-8">
           <div className="flex items-start gap-6">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0 shadow-inner">
                <Download className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-[#1D1D1F]">Portabilità dei Dati</h3>
                <p className="text-sm text-[#86868B] font-medium leading-relaxed">
                  Scarica una copia completa di tutti i dati che abbiamo memorizzato sul tuo profilo in formato JSON leggibile da macchina.
                </p>
                <Button 
                  onClick={handleExportData}
                  disabled={loading}
                  className="mt-4 h-12 px-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  {loading ? 'Preparazione...' : 'Esporta i miei dati'}
                </Button>
              </div>
           </div>

           <div className="pt-8 border-t border-[#F2F2F7] flex items-start gap-6">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 shrink-0 shadow-inner">
                <Trash2 className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-[#1D1D1F]">Eliminazione Account</h3>
                <p className="text-sm text-[#86868B] font-medium leading-relaxed">
                  Puoi richiedere la cancellazione totale del tuo account. Questa azione è irreversibile e comporterà la perdita dei token e dello storico.
                </p>
                <Button 
                  variant="outline"
                  onClick={handleRequestDeletion}
                  className="mt-4 h-12 px-8 rounded-full border-red-100 text-red-600 hover:bg-red-50 font-black text-xs uppercase tracking-widest gap-2"
                >
                  Richiedi Chiusura Account
                </Button>
              </div>
           </div>
        </section>

        <section className="bg-[#1D1D1F] p-10 rounded-[3rem] text-white space-y-6 relative overflow-hidden">
           <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                 <Lock className="w-6 h-6 text-blue-400" />
                 <h3 className="text-2xl font-black">Centro per la Privacy</h3>
              </div>
              <p className="text-gray-400 font-medium leading-relaxed">
                Riconosciamo l'importanza della tua privacy. Leggi i nostri documenti legali per capire come gestiamo i tuoi dati secondo il regolamento europeo GDPR.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                 <button className="flex items-center justify-between p-6 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-colors group text-left">
                    <div className="flex items-center gap-4">
                       <FileText className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                       <span className="font-bold">Informativa Privacy</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-500" />
                 </button>
                 <button className="flex items-center justify-between p-6 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-colors group text-left">
                    <div className="flex items-center gap-4">
                       <Shield className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                       <span className="font-bold">Termini del Servizio</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-500" />
                 </button>
              </div>
           </div>
           
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        </section>
      </div>
    </div>
  );
}
