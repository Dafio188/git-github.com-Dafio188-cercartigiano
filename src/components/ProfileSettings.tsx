import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { 
  ArrowLeft, 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  Loader2, 
  CheckCircle2 
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface ProfileSettingsProps {
  onBack: () => void;
}

export function ProfileSettings({ onBack }: ProfileSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
    indirizzo: '',
    avatarUrl: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser) return;
      setLoading(true);
      try {
        const docRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            nome: data.nome || '',
            cognome: data.cognome || '',
            email: auth.currentUser.email || '',
            telefono: data.telefono || '',
            indirizzo: data.indirizzo || '',
            avatarUrl: auth.currentUser.photoURL || ''
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;

    setSaving(true);
    try {
      const storageRef = ref(storage, `avatars/${auth.currentUser.uid}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      await updateProfile(auth.currentUser, { photoURL: downloadURL });
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        avatarUrl: downloadURL,
        updatedAt: serverTimestamp()
      });
      
      setFormData(prev => ({ ...prev, avatarUrl: downloadURL }));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("Errore durante il caricamento dell'avatar.");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        nome: formData.nome,
        cognome: formData.cognome,
        telefono: formData.telefono,
        indirizzo: formData.indirizzo,
        updatedAt: serverTimestamp()
      });
      
      if (auth.currentUser.displayName !== `${formData.nome} ${formData.cognome}`) {
        await updateProfile(auth.currentUser, {
          displayName: `${formData.nome} ${formData.cognome}`.trim()
        });
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Errore durante il salvataggio dei dati.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm font-bold text-[#86868B] uppercase tracking-widest">Caricamento Profilo...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 sm:space-y-10 pb-32 px-4 sm:px-0">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full bg-white shadow-sm border border-[#D2D2D7]/30 h-10 w-10 shrink-0">
          <ArrowLeft className="w-5 h-5 text-[#1D1D1F]" />
        </Button>
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1D1D1F]">Informazioni Personali</h2>
          <p className="text-xs sm:text-sm text-[#86868B] font-bold">Aggiorna i tuoi dati di contatto e il tuo avatar.</p>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="relative group">
          <div className="w-32 h-32 rounded-[2.5rem] bg-[#F5F5F7] border border-[#D2D2D7]/30 overflow-hidden shadow-lg">
            {formData.avatarUrl ? (
              <img src={formData.avatarUrl} className="w-full h-full object-cover" alt="Avatar" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#86868B]">
                <UserIcon className="w-12 h-12" />
              </div>
            )}
          </div>
          <label className="absolute bottom-1 right-1 w-10 h-10 bg-white rounded-2xl shadow-xl border border-[#D2D2D7]/30 flex items-center justify-center cursor-pointer hover:bg-[#F5F5F7] transition-all transform hover:scale-110 active:scale-95 group">
            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={saving} />
            <Camera className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
          </label>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 bg-white p-6 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[3rem] border border-[#D2D2D7]/30 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2">
            <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#86868B] pl-2">Nome</Label>
            <div className="relative group">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B] group-focus-within:text-primary transition-colors" />
              <Input 
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                className="h-12 sm:h-14 pl-12 rounded-xl sm:rounded-[1.25rem] bg-[#FBFBFD] border-[#F2F2F7] focus:border-primary/30 focus:ring-0 transition-all font-bold text-sm"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#86868B] pl-2">Cognome</Label>
            <div className="relative group">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B] group-focus-within:text-primary transition-colors" />
              <Input 
                value={formData.cognome}
                onChange={(e) => setFormData({...formData, cognome: e.target.value})}
                className="h-12 sm:h-14 pl-12 rounded-xl sm:rounded-[1.25rem] bg-[#FBFBFD] border-[#F2F2F7] focus:border-primary/30 focus:ring-0 transition-all font-bold text-sm"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#86868B] pl-2">Email (Sola Lettura)</Label>
          <div className="relative group opacity-60">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B]" />
            <Input 
              value={formData.email}
              readOnly
              className="h-12 sm:h-14 pl-12 rounded-xl sm:rounded-[1.25rem] bg-[#F5F5F7] border-[#F2F2F7] font-bold cursor-not-allowed text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#86868B] pl-2">Numero di Telefono</Label>
          <div className="relative group">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B] group-focus-within:text-primary transition-colors" />
            <Input 
              value={formData.telefono}
              onChange={(e) => setFormData({...formData, telefono: e.target.value})}
              placeholder="+39 000 0000000"
              className="h-12 sm:h-14 pl-12 rounded-xl sm:rounded-[1.25rem] bg-[#FBFBFD] border-[#F2F2F7] focus:border-primary/30 focus:ring-0 transition-all font-bold text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#86868B] pl-2">Indirizzo di Residenza</Label>
          <div className="relative group">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B] group-focus-within:text-primary transition-colors" />
            <Input 
              value={formData.indirizzo}
              onChange={(e) => setFormData({...formData, indirizzo: e.target.value})}
              placeholder="Via, Civico, Città (Provincia)"
              className="h-12 sm:h-14 pl-12 rounded-xl sm:rounded-[1.25rem] bg-[#FBFBFD] border-[#F2F2F7] focus:border-primary/30 focus:ring-0 transition-all font-bold text-sm"
            />
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={saving}
          className="w-full h-14 sm:h-16 rounded-xl sm:rounded-[1.25rem] bg-[#1D1D1F] hover:bg-black text-white font-black text-base sm:text-lg transition-all shadow-xl shadow-black/10 disabled:bg-[#D2D2D7]"
        >
          {saving ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Salvataggio...
            </div>
          ) : success ? (
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle2 className="w-5 h-5" />
              Profilo Aggiornato
            </div>
          ) : (
            'Salva Modifiche'
          )}
        </Button>
      </form>
    </div>
  );
}
