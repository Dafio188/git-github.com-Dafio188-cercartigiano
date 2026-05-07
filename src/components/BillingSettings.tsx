import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { BillingProfile } from '../types';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import { Shield, Building2, User, Landmark, Save, ArrowLeft } from 'lucide-react';

interface BillingSettingsProps {
  onBack: () => void;
}

export function BillingSettings({ onBack }: BillingSettingsProps) {
  const [profile, setProfile] = useState<Partial<BillingProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser) return;
      try {
        const docRef = doc(db, 'billingProfiles', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as BillingProfile);
        }
      } catch (err) {
        console.error("Error fetching billing profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setSaving(true);
    setError(null);
    try {
      const docRef = doc(db, 'billingProfiles', auth.currentUser.uid);
      await setDoc(docRef, {
        ...profile,
        userId: auth.currentUser.uid,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      alert("Dati fiscali aggiornati con successo.");
    } catch (err) {
      setError("Impossibile salvare i dati fiscali.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center p-20">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="p-3 bg-white rounded-2xl border border-[#D2D2D7]/30 hover:bg-[#F5F5F7] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#1D1D1F]" />
        </button>
        <div>
          <h2 className="text-2xl font-black text-[#1D1D1F]">Dati Fiscali</h2>
          <p className="text-sm font-bold text-[#86868B]">Configura i dati per la fatturazione elettronica.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-[#D2D2D7]/30 p-8 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[
            { id: 'individual', label: 'Privato', icon: User },
            { id: 'freelancer', label: 'Professionista', icon: Landmark },
            { id: 'company', label: 'Ditta/Società', icon: Building2 }
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setProfile({ ...profile, fiscalType: type.id as any })}
              className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                profile.fiscalType === type.id 
                  ? 'border-blue-600 bg-blue-50/50 text-blue-600' 
                  : 'border-[#D2D2D7]/30 text-[#86868B] hover:border-[#D2D2D7]'
              }`}
            >
              <type.icon className="w-6 h-6" />
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">{type.label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-[#86868B] ml-1 mb-2 block">Codice Fiscale</label>
              <Input 
                value={profile.codiceFiscale || ''}
                onChange={(e) => setProfile({ ...profile, codiceFiscale: e.target.value.toUpperCase() })}
                placeholder="BRNMTT..."
                className="bg-[#F5F5F7] border-transparent h-14 rounded-2xl font-bold"
              />
            </div>
            {(profile.fiscalType === 'company' || profile.fiscalType === 'freelancer') && (
              <>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#86868B] ml-1 mb-2 block">Partita IVA</label>
                  <Input 
                    value={profile.partitaIva || ''}
                    onChange={(e) => setProfile({ ...profile, partitaIva: e.target.value })}
                    placeholder="01234567890"
                    className="bg-[#F5F5F7] border-transparent h-14 rounded-2xl font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#86868B] ml-1 mb-2 block">Ragione Sociale</label>
                  <Input 
                    value={profile.ragioneSociale || ''}
                    onChange={(e) => setProfile({ ...profile, ragioneSociale: e.target.value })}
                    placeholder="Nome ditta o società"
                    className="bg-[#F5F5F7] border-transparent h-14 rounded-2xl font-bold"
                  />
                </div>
              </>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-[#86868B] ml-1 mb-2 block">Codice SDI (7 caratteri)</label>
              <Input 
                value={profile.codiceSdi || ''}
                onChange={(e) => setProfile({ ...profile, codiceSdi: e.target.value.toUpperCase() })}
                placeholder="SUBM70N"
                maxLength={7}
                className="bg-[#F5F5F7] border-transparent h-14 rounded-2xl font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-[#86868B] ml-1 mb-2 block">Indirizzo PEC</label>
              <Input 
                value={profile.pec || ''}
                onChange={(e) => setProfile({ ...profile, pec: e.target.value })}
                placeholder="nome@legalmail.it"
                className="bg-[#F5F5F7] border-transparent h-14 rounded-2xl font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-[#86868B] ml-1 mb-2 block">Sede Legale</label>
              <Input 
                value={profile.address || ''}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                placeholder="Via..."
                className="bg-[#F5F5F7] border-transparent h-14 rounded-2xl font-bold"
              />
            </div>
          </div>
        </div>

        <div className="flex bg-blue-50/50 p-6 rounded-3xl border border-blue-100 gap-4">
          <Shield className="w-6 h-6 text-blue-600 shrink-0" />
          <p className="text-xs font-bold text-blue-900 leading-relaxed">
            I dati inseriti sono necessari per l'emissione delle fatture pro-forma e l'invio telematico allo SDI. Assicurati di aver inserito correttamente Partita IVA e Codice Destinatario.
          </p>
        </div>

        <Button 
          onClick={handleSave}
          disabled={saving}
          className="w-full h-16 rounded-[2rem] bg-[#1D1D1F] text-white font-black group transition-all active:scale-[0.98]"
        >
          {saving ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5 mr-3" />
              Salva Configurazione Fiscale
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
