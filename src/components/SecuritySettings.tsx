import React, { useState } from 'react';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { 
  ArrowLeft, 
  Lock, 
  Mail, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  KeyRound
} from 'lucide-react';
import { Button } from './ui/button';

interface SecuritySettingsProps {
  onBack: () => void;
}

export function SecuritySettings({ onBack }: SecuritySettingsProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null as string | null);

  const handleResetPassword = async () => {
    if (!auth.currentUser?.email) return;
    
    setLoading(true);
    setSuccess(false);
    setError(null);
    
    try {
      await sendPasswordResetEmail(auth, auth.currentUser.email);
      setSuccess(true);
    } catch (err: any) {
      console.error("Error sending reset email:", err);
      setError("Si è verificato un errore durante l'invio dell'email di reset. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10 pb-32">
      <div className="flex items-center gap-4 px-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full bg-white shadow-sm border border-[#D2D2D7]/30">
          <ArrowLeft className="w-5 h-5 text-[#1D1D1F]" />
        </Button>
        <div>
          <h2 className="text-3xl font-black tracking-tight text-[#1D1D1F]">Sicurezza</h2>
          <p className="text-sm text-[#86868B] font-bold">Gestisci la protezione del tuo account.</p>
        </div>
      </div>

      <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-[#D2D2D7]/30 shadow-sm space-y-10">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center text-blue-600 shadow-inner">
            <Lock className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-[#1D1D1F]">Modifica Password</h3>
            <p className="text-[#86868B] font-medium max-w-sm mx-auto mt-2">
              Per la tua sicurezza, invieremo un link di reset al tuo indirizzo email registrato:
              <span className="block mt-1 font-bold text-[#1D1D1F]">{auth.currentUser?.email}</span>
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {success ? (
            <div className="p-6 bg-green-50 border border-green-100 rounded-3xl flex items-start gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-black text-green-900">Email Inviata correttamente</h4>
                <p className="text-sm text-green-700 font-medium">Controlla la tua posta in arrivo (e lo spam) per completare il reset della password.</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50 border border-red-100 rounded-3xl flex items-start gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-black text-red-900">Errore</h4>
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            </div>
          ) : null}

          <Button 
            onClick={handleResetPassword}
            disabled={loading}
            className="w-full h-16 rounded-[1.25rem] bg-[#1D1D1F] hover:bg-black text-white font-black text-lg transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3"
          >
            {loading ? (
               <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
               <KeyRound className="w-6 h-6" />
            )}
            {loading ? 'Invio in corso...' : 'Invia Link di Reset'}
          </Button>
        </div>

        <div className="pt-6 border-t border-dashed border-[#D2D2D7]/50">
          <div className="flex items-start gap-4 p-5 bg-[#FBFBFD] rounded-3xl border border-[#F2F2F7]">
            <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-black text-[#1D1D1F]">Autenticazione Sicura</h4>
              <p className="text-xs text-[#86868B] font-bold leading-relaxed">
                Utilizziamo i protocolli di sicurezza standard di settore per proteggere i tuoi dati sensibili. Non condividere mai la tua password con nessuno.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
