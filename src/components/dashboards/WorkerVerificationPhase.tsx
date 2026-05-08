import React, { useState, useEffect } from 'react';
import { db, storage } from '../../firebase';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { User } from '../../types';
import { Button } from '../ui/button';
import { Shield, Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface WorkerVerificationPhaseProps {
  user: User;
}

export function WorkerVerificationPhase({ user }: WorkerVerificationPhaseProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'pending_upload' | 'submitted' | 'approved' | 'rejected'>('pending_upload');
  const [formData, setFormData] = useState({
    documentType: 'id_card', 
    description: '',
    documentUrl: '',
    file: null as File | null
  });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const docRef = doc(db, 'verifications', user.id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setStatus(snap.data().status || 'submitted');
        } else if (user.status === 'active') { // If somehow not in verifications but active
          setStatus('approved');
        }
      } catch (e) {
        console.error("Status check failed", e);
      }
    };
    checkStatus();
  }, [user.id, user.status]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Il file non deve superare i 5MB.");
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert("Per favore, carica solo immagini (JPG, PNG).");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setFormData({ ...formData, file, documentUrl: previewUrl });
  };

  const handleSubmit = async () => {
    if (!formData.file) {
      alert("Per favore, carica l'immagine di un documento di identità, attestato, o portfolio.");
      return;
    }
    setLoading(true);
    try {
      const storageRef = ref(storage, `verifications/${user.id}/${Date.now()}_${formData.file.name}`);
      const snapshot = await uploadBytes(storageRef, formData.file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      await setDoc(doc(db, 'verifications', user.id), {
        userId: user.id,
        userName: user.nome,
        userEmail: user.email,
        documentType: formData.documentType,
        description: formData.description,
        documentUrl: downloadURL,
        status: 'submitted',
        submittedAt: serverTimestamp(),
      });
      setStatus('submitted');
    } catch (e) {
      console.error(e);
      alert("Errore durante l'invio. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  if (status === 'submitted') {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 max-w-2xl mx-auto px-6">
        <div className="w-20 h-20 bg-orange-100 rounded-[2rem] flex items-center justify-center shadow-inner">
           <Shield className="w-10 h-10 text-orange-600" />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-black text-[#1D1D1F] tracking-tight">In Attesa di Approvazione</h2>
          <p className="text-sm font-bold text-[#86868B] leading-relaxed">
            Abbiamo ricevuto i tuoi documenti correttamente. Il nostro team di amministratori li sta verificando 
            per garantire la massima affidabilità. 
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F5F5F7] rounded-xl text-xs font-bold text-[#86868B]">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Documenti Inviati
          </div>
        </div>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 max-w-2xl mx-auto px-6">
        <div className="w-20 h-20 bg-red-100 rounded-[2rem] flex items-center justify-center shadow-inner">
           <AlertCircle className="w-10 h-10 text-red-600" />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-black text-[#1D1D1F] tracking-tight">Verifica Rifiutata</h2>
          <p className="text-sm font-bold text-[#86868B] leading-relaxed">
            I documenti che hai inviato non sono stati ritenuti validi o sufficienti. Ti preghiamo di riprovare
            assicurandoti che i documenti siano chiari e leggibili.
          </p>
          <Button onClick={() => setStatus('pending_upload')} className="bg-[#1D1D1F] text-white rounded-xl h-12 px-6 hover:bg-black font-black">Carica Nuovi Documenti</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 max-w-2xl mx-auto px-6 pb-32">
       <div className="bg-white rounded-[2.5rem] p-8 lg:p-12 border border-[#D2D2D7]/30 shadow-xl shadow-black/5 space-y-8">
          <div className="space-y-2 text-center">
             <div className="mx-auto w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
               <Shield className="w-8 h-8" />
             </div>
             <h2 className="text-3xl font-black text-[#1D1D1F] tracking-tight">Verifica il tuo Account</h2>
             <p className="text-sm font-bold text-[#86868B] max-w-md mx-auto leading-relaxed">
               Prima di poter ricevere richieste di lavoro su CercArtigiano, il nostro team deve
               verificare la tua identità e le tue competenze.
             </p>
          </div>

          <div className="space-y-6 pt-4 border-t border-[#D2D2D7]/30">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-[#86868B] tracking-widest pl-2">Tipo di Documento</label>
                <select 
                  value={formData.documentType}
                  onChange={e => setFormData({ ...formData, documentType: e.target.value })}
                  className="w-full h-14 bg-[#F5F5F7] border-none rounded-2xl px-5 font-black text-sm focus:ring-2 focus:ring-blue-600/20 outline-none text-[#1D1D1F]"
                >
                   <option value="id_card">Carta d'Identità / Patente o Passaporto</option>
                   <option value="chamber_of_commerce">Visura Camerale</option>
                   <option value="portfolio">Attestato di Qualifica / Certificazione</option>
                </select>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-[#86868B] tracking-widest pl-2">Descrizione / Note (Opzionale)</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Scrivi qui eventuali note aggiuntive per i nostri operatori..."
                  className="w-full p-5 bg-[#F5F5F7] border-none rounded-2xl font-bold text-sm focus:ring-2 focus:ring-blue-600/20 outline-none resize-none min-h-[120px]"
                />
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-[#86868B] tracking-widest pl-2">Carica Immagine *</label>
                <div className="relative border-2 border-dashed border-[#D2D2D7] rounded-[2rem] p-8 flex flex-col items-center justify-center bg-[#F5F5F7]/30 hover:bg-[#F5F5F7] transition-all overflow-hidden duration-300 min-h-[200px]">
                   {formData.documentUrl ? (
                      <div className="space-y-4 w-full flex flex-col items-center">
                         <img src={formData.documentUrl} alt="Preview" className="max-h-48 object-contain rounded-xl shadow-md border border-[#D2D2D7]/30" />
                         <Button variant="outline" size="sm" onClick={() => setFormData({...formData, file: null, documentUrl: ''})} className="rounded-full font-black text-[#1D1D1F] h-10 px-6 hover:bg-white">
                           Cambia Immagine
                         </Button>
                      </div>
                   ) : (
                      <>
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-[#D2D2D7]/50 mb-4">
                          <Upload className="w-5 h-5 text-[#86868B]" />
                        </div>
                        <span className="text-base font-black text-[#1D1D1F]">Clicca per caricare</span>
                        <span className="text-xs font-bold text-[#86868B] mt-2 mb-2 px-6 text-center">Assicurati che il documento sia ben leggibile e interamente all'interno dell'immagine.</span>
                        <span className="text-[10px] font-black tracking-widest uppercase text-[#86868B] bg-[#E8E8ED] px-3 py-1 rounded-full">JPG / PNG (Max 5MB)</span>
                        <input 
                           type="file" 
                           accept="image/*" 
                           onChange={handleFileChange} 
                           className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </>
                   )}
                </div>
             </div>

             <Button 
               onClick={handleSubmit}
               disabled={loading || !formData.file}
               className="w-full h-16 bg-[#1D1D1F] hover:bg-black text-white rounded-[1.25rem] font-black shadow-xl shadow-black/10 transition-all text-lg tracking-tight disabled:bg-[#D2D2D7]"
             >
               {loading ? (
                 <div className="flex items-center gap-3">
                   <Loader2 className="w-6 h-6 animate-spin" />
                   Caricamento...
                 </div>
               ) : 'Invia per Revisione'}
             </Button>

             <div className="flex items-start gap-4 bg-red-50 p-5 rounded-2xl border border-red-100">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                </div>
                <p className="text-[11px] font-bold text-red-900 leading-relaxed uppercase tracking-wider pt-0.5">
                  L'invio di documenti falsi comporterà la sospensione permanente dell'account. 
                  Tutti i dati sono trattati in conformità alla normativa Europea (GDPR).
                </p>
             </div>
          </div>
       </div>
    </div>
  );
}
