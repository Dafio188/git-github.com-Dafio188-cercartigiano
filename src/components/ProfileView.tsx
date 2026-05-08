import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, onSnapshot, updateDoc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { User, UserProfile, UserPrivacySettings } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { SERVICE_CATEGORIES, CATEGORY_SERVICES } from '../constants';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Save, 
  Shield, 
  Briefcase,
  Activity,
  ChevronRight,
  Plus,
  CheckCircle2,
  Zap,
  History,
  TrendingUp,
  Wallet,
  Star
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { AddressInput } from './AddressInput';
import { BadgeList } from './shared/BadgeList';
import { BuyCreditsModal } from './modals/BuyCreditsModal';

interface ProfileViewProps {
  user: User;
}

export function ProfileView({ user }: ProfileViewProps) {
  const [loading, setLoading] = useState(false);
  const [showBuyCredits, setShowBuyCredits] = useState(false);
  const [editUser, setEditUser] = useState<User>({
    ...user,
    nome: user.nome || '',
    email: user.email || '',
    phone: user.phone || '',
    address: user.address || '',
    civico: user.civico || '',
    location: user.location || { lat: 0, lng: 0 },
    cap: user.cap || '',
    citta: user.citta || '',
    provincia: user.provincia || '',
    regione: user.regione || '',
    privacySettings: user.privacySettings || {
      showEmail: false,
      showPhone: false,
      showAddress: false,
      showFullName: true
    }
  });

  const [editProfile, setEditProfile] = useState<UserProfile>(() => {
    return {
      userId: user.id || '',
      id: user.id || '',
      nome: user.nome || '',
      bio: '',
      categories: [],
      hourlyRate: 30,
      radiusKm: 50,
      address: user.address || '',
      civico: user.civico || '',
      location: user.location || { lat: 0, lng: 0 },
      cap: user.cap || '',
      citta: user.citta || '',
      provincia: user.provincia || '',
      regione: user.regione || '',
      isAvailable: true,
      badges: [],
      credits: 10,
      score: 5,
      verifiedFlags: {
        id: false,
        phone: false,
        insurance: false
      },
      privacySettings: {
        showEmail: false,
        showPhone: false,
        showAddress: false,
        showFullName: true
      }
    };
  });

  useEffect(() => {
    if (user.role === 'worker') {
      const profileRef = doc(db, 'workerProfiles', user.id);
      const unsub = onSnapshot(profileRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          setEditProfile({
            ...data,
            badges: data.badges || [],
            credits: data.credits || 0,
            score: data.score || 5,
            privacySettings: {
              showEmail: data.privacySettings?.showEmail ?? false,
              showPhone: data.privacySettings?.showPhone ?? false,
              showAddress: data.privacySettings?.showAddress ?? false,
              showFullName: data.privacySettings?.showFullName ?? false,
            }
          });
          setEditUser(prev => ({
            ...prev,
            cap: data.cap || prev.cap,
            citta: data.citta || prev.citta,
            provincia: data.provincia || prev.provincia,
            regione: data.regione || prev.regione,
            address: data.address || prev.address,
            civico: data.civico || prev.civico
          }));
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, `workerProfiles/${user.id}`);
      });
      return () => unsub();
    }
  }, [user.id, user.role]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { email: _email, ...updateUserData } = editUser;
      await updateDoc(doc(db, 'users', user.id), {
        ...updateUserData
      });

      if (user.role === 'worker') {
        const workerRef = doc(db, 'workerProfiles', user.id);
        const workerData = {
          ...editProfile,
          nome: editUser.nome,
          address: editUser.address,
          civico: editUser.civico,
          cap: editUser.cap,
          citta: editUser.citta,
          provincia: editUser.provincia,
          regione: editUser.regione,
        };
        await setDoc(workerRef, workerData, { merge: true });
      }
      
      alert("Profilo aggiornato con successo!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Errore durante l'aggiornamento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
           <div className="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-black/5 flex items-center justify-center p-1 border border-[#D2D2D7]/30">
              <div className="w-full h-full bg-[#1D1D1F] rounded-2xl flex items-center justify-center text-white relative">
                 <UserIcon className="w-10 h-10" />
                 {user.onboardingComplete && (
                   <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 border-2 border-white shadow-lg">
                      <Shield className="w-4 h-4" />
                   </div>
                 )}
              </div>
           </div>
           <div>
             <h1 className="text-3xl font-black tracking-tight text-[#1D1D1F]">{editUser.nome || 'Il tuo Nome'}</h1>
             <p className="text-[#86868B] font-bold uppercase tracking-widest text-[10px] mt-1">
               {user.role === 'worker' ? 'Professionista Certificato' : 'Cliente CercArtigiano'}
             </p>
             {user.role === 'worker' && (
               <div className="mt-2">
                 <BadgeList badges={editProfile.badges || []} />
               </div>
             )}
           </div>
        </div>
        <Button onClick={handleSave} disabled={loading} className="rounded-full bg-[#1D1D1F] hover:bg-black text-white px-8 h-12 font-bold shadow-xl shadow-[#1D1D1F]/20 flex items-center gap-2 group">
          {loading ? 'Salvataggio...' : <><Save className="w-4 h-4 group-hover:scale-110 transition-transform" />Salva Modifiche</>}
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-[2.5rem] border border-[#D2D2D7]/30 shadow-sm overflow-hidden p-8 lg:p-10">
            <div className="flex items-center gap-3 mb-8">
              <UserIcon className="w-5 h-5 text-[#1D1D1F]" />
              <h2 className="text-xl font-black tracking-tight">Dati Personali</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#86868B]">Nome e Cognome</Label>
                <Input value={editUser.nome} onChange={e => setEditUser({...editUser, nome: e.target.value})} className="h-12 rounded-xl bg-[#F5F5F7] border-none font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#86868B]">Telefono</Label>
                <Input value={editUser.phone} onChange={e => setEditUser({...editUser, phone: e.target.value})} className="h-12 rounded-xl bg-[#F5F5F7] border-none font-bold" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#86868B]">Email (Sola Lettura)</Label>
                <Input value={editUser.email} readOnly className="h-12 rounded-xl bg-[#F5F5F7] border-none font-bold opacity-60 cursor-not-allowed" />
              </div>
              <div className="md:col-span-2 grid grid-cols-1 gap-6 pt-4 border-t border-[#D2D2D7]/30">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-[#1D1D1F]" />
                  <span className="text-xs font-black uppercase tracking-widest text-[#1D1D1F]">Ubicazione</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-9 space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-[#86868B]">Indirizzo</Label>
                    <AddressInput value={editUser.address} className="h-12 rounded-xl bg-[#F5F5F7] border-none font-bold" onChange={(address, lat, lng, details) => {
                      setEditUser({ ...editUser, address, civico: details?.streetNumber || '', cap: details?.postalCode || '', citta: details?.city || '', provincia: details?.province || '', regione: details?.region || '', location: lat ? { lat, lng } : editUser.location });
                    }} />
                  </div>
                  <div className="md:col-span-3 space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-[#86868B]">Civico</Label>
                    <Input value={editUser.civico} onChange={e => setEditUser({...editUser, civico: e.target.value})} className="h-12 rounded-xl bg-[#F5F5F7] border-none font-bold" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {user.role === 'worker' && (
             <section className="bg-white rounded-[2.5rem] border border-[#D2D2D7]/30 shadow-sm overflow-hidden p-8 lg:p-10">
               <div className="flex items-center gap-3 mb-8">
                 <Briefcase className="w-5 h-5 text-[#1D1D1F]" />
                 <h2 className="text-xl font-black tracking-tight">Competenze & Professionalità</h2>
               </div>
               
               <div className="space-y-8">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-[#86868B]">Specializzazioni Selezionate</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 pb-2 custom-scrollbar">
                      {editProfile.categories.map(catId => {
                        const skills = CATEGORY_SERVICES[catId] || [];
                        const catLabel = SERVICE_CATEGORIES.find(c => c.id === catId)?.label || catId;
                        return skills.map(skillLabel => {
                          const skillId = `${catId}_${skillLabel.toLowerCase().replace(/\s+/g, '_')}`;
                          const isSelected = (editProfile as any).skills?.includes(skillId);
                          return (
                            <button key={skillId} type="button" onClick={() => {
                              const current = (editProfile as any).skills || [];
                              setEditProfile({ ...editProfile, skills: isSelected ? current.filter((s: any) => s !== skillId) : [...current, skillId] } as any);
                            }} className={cn("flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left", isSelected ? "bg-blue-50 border-blue-600 text-blue-700 shadow-sm" : "bg-[#F5F5F7] border-transparent text-[#86868B] hover:bg-white hover:border-[#D2D2D7]")}>
                              <div className="flex flex-col">
                                <span className="text-[11px] font-bold leading-tight">{skillLabel}</span>
                                <span className="text-[8px] font-black uppercase tracking-widest text-[#86868B] mt-1">{catLabel}</span>
                              </div>
                              <div className={cn("w-5 h-5 rounded-md flex items-center justify-center transition-all shrink-0", isSelected ? "bg-blue-600 text-white" : "bg-white border border-[#D2D2D7]")}>
                                {isSelected ? <Plus className="w-3 h-3 rotate-45" /> : <Plus className="w-3 h-3" />}
                              </div>
                            </button>
                          );
                        });
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-[#86868B]">Bio Professionale</Label>
                    <textarea rows={4} value={editProfile.bio} onChange={e => setEditProfile({...editProfile, bio: e.target.value})} className="w-full p-4 rounded-xl bg-[#F5F5F7] border-none font-bold text-sm focus:ring-1 focus:ring-blue-500/20" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-[#86868B]">Tariffa Oraria (€)</Label>
                      <Input type="number" value={editProfile.hourlyRate} onChange={e => setEditProfile({...editProfile, hourlyRate: parseInt(e.target.value)})} className="h-12 rounded-xl bg-[#F5F5F7] border-none font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-[#86868B]">Raggio (Km)</Label>
                      <Input type="number" value={editProfile.radiusKm} onChange={e => setEditProfile({...editProfile, radiusKm: parseInt(e.target.value)})} className="h-12 rounded-xl bg-[#F5F5F7] border-none font-bold" />
                    </div>
                  </div>
               </div>
             </section>
          )}
        </div>

        <div className="space-y-8">
           <Card className="rounded-[2rem] bg-[#1D1D1F] text-white border-none shadow-2xl p-8">
              <h3 className="text-xl font-black mb-6">Privacy Dati</h3>
              <div className="space-y-4">
                 {[
                   { key: 'showEmail', label: 'Mostra Email', icon: Mail },
                   { key: 'showPhone', label: 'Mostra Telefono', icon: Phone },
                   { key: 'showAddress', label: 'Mostra Indirizzo', icon: MapPin }
                 ].map((s) => (
                   <div key={s.key} className="flex items-center justify-between p-3 rounded-2xl bg-white/5">
                      <div className="flex items-center gap-3">
                         <s.icon className="w-4 h-4 text-white/50" />
                         <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{s.label}</span>
                      </div>
                      <input type="checkbox" checked={user.role === 'worker' ? !!editProfile.privacySettings?.[s.key as keyof UserPrivacySettings] : !!editUser.privacySettings?.[s.key as keyof UserPrivacySettings]} onChange={(e) => {
                         const val = e.target.checked;
                         const settings = (user.role === 'worker' ? editProfile.privacySettings : editUser.privacySettings) || { showEmail: false, showPhone: false, showAddress: false, showFullName: true };
                         const newSettings = { ...settings, [s.key]: val };
                         if (user.role === 'worker') setEditProfile({ ...editProfile, privacySettings: newSettings } as any);
                         setEditUser({ ...editUser, privacySettings: newSettings });
                      }} className="w-5 h-5 rounded-lg bg-white/10" />
                   </div>
                 ))}
              </div>
           </Card>

           {user.role === 'worker' && (
             <Card className="rounded-[2.5rem] bg-white border border-[#D2D2D7]/30 shadow-sm p-8">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="font-black">Crediti</h3>
                 <Wallet className="text-blue-600" />
               </div>
               <div className="bg-[#F5F5F7] rounded-3xl p-6 mb-6">
                 <span className="text-4xl font-black">{editProfile.credits || 0}</span>
               </div>
               <Button onClick={() => setShowBuyCredits(true)} className="w-full rounded-2xl bg-[#1D1D1F] text-white font-black h-12 uppercase">Ricarica</Button>
             </Card>
           )}
        </div>
      </div>

      {user.role === 'worker' && <BuyCreditsModal isOpen={showBuyCredits} onClose={() => setShowBuyCredits(false)} userId={user.id} currentBalance={editProfile.credits || 0} />}
    </div>
  );
}
