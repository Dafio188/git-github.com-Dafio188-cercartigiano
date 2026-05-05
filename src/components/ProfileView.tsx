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
import { SERVICE_CATEGORIES } from '../constants';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Save, 
  ShieldCheck, 
  Briefcase,
  PenTool,
  Activity,
  ChevronRight,
  Plus,
  CheckCircle2,
  Zap,
  CreditCard,
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
      // 1. Update basic user data
      const isClientComplete = editUser.nome && editUser.phone && editUser.address;
      const isWorkerComplete = editProfile.bio && editProfile.categories?.length > 0 && editUser.address;
      
      const onboardingComplete = user.onboardingComplete || (user.role === 'worker' ? !!isWorkerComplete : !!isClientComplete);

      const { email: _email, ...updateUserData } = editUser;
      
      const userPath = `users/${user.id}`;
      try {
        await updateDoc(doc(db, 'users', user.id), {
          ...updateUserData,
          onboardingComplete
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, userPath);
      }

      // 2. Update worker profile if applicable
      if (user.role === 'worker') {
        const workerRef = doc(db, 'workerProfiles', user.id);
        const workerPath = `workerProfiles/${user.id}`;
        
        let exists = false;
        try {
          const snap = await getDoc(workerRef);
          exists = snap.exists();
        } catch (e) {
          handleFirestoreError(e, OperationType.GET, workerPath);
        }
        
        const workerData = {
          ...editProfile,
          nome: editUser.nome,
          address: editUser.address,
          civico: editUser.civico,
          cap: editUser.cap,
          citta: editUser.citta,
          provincia: editUser.provincia,
          regione: editUser.regione,
          onboardingComplete
        };

        if (exists) {
          try {
            await updateDoc(workerRef, workerData);
          } catch (e) {
            handleFirestoreError(e, OperationType.UPDATE, workerPath);
          }
        } else {
          try {
            await setDoc(workerRef, {
              ...workerData,
              rating: 5.0,
              reviewCount: 0,
              tokenBalance: user.tokens || 10
            });
          } catch (e) {
            handleFirestoreError(e, OperationType.CREATE, workerPath);
          }
        }
      }
      
      alert("Profilo aggiornato con successo!");
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error instanceof Error && error.message.includes('{')) {
        // This is our custom JSON error
        alert("Errore di permessi durante l'aggiornamento. Riprova o contatta il supporto.");
      } else {
        alert("Errore durante l'aggiornamento.");
      }
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
                      <ShieldCheck className="w-4 h-4" />
                   </div>
                 )}
              </div>
           </div>
           <div>
             <h1 className="text-3xl font-black tracking-tight text-[#1D1D1F]">{editUser.nome || 'Il tuo Nome'}</h1>
             <div className="flex items-center gap-3 mt-1">
               <p className="text-[#86868B] font-bold uppercase tracking-widest text-[10px]">
                 {user.role === 'worker' ? 'Professionista Certificato' : 'Cliente CercArtigiano'}
               </p>
             </div>
             {user.role === 'worker' && (
               <div className="mt-2">
                 <BadgeList badges={editProfile.badges || []} />
               </div>
             )}
             {!user.onboardingComplete && (
               <span className="inline-block mt-2 px-3 py-0.5 bg-orange-100 text-orange-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                 Profilo Incompleto
               </span>
             )}
           </div>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={loading}
          className="rounded-full bg-[#1D1D1F] hover:bg-black text-white px-8 h-12 font-bold shadow-xl shadow-[#1D1D1F]/20 flex items-center gap-2 group"
        >
          {loading ? 'Salvataggio...' : (
            <>
              <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Salva Modifiche
            </>
          )}
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-[2.5rem] border border-[#D2D2D7]/30 shadow-sm overflow-hidden">
            <div className="p-8 lg:p-10">
              <div className="flex items-center gap-3 mb-8">
                <UserIcon className="w-5 h-5 text-[#1D1D1F]" />
                <h2 className="text-xl font-black tracking-tight">Dati Personali</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-[#86868B]">Nome e Cognome</Label>
                  <Input 
                    placeholder="es. Davide Fiore"
                    value={editUser.nome}
                    onChange={e => setEditUser({...editUser, nome: e.target.value})}
                    className="h-12 rounded-xl bg-[#F5F5F7] border-none font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-[#86868B]">Telefono Cellulare</Label>
                  <Input 
                    placeholder="es. +39 333 1234567"
                    value={editUser.phone}
                    onChange={e => setEditUser({...editUser, phone: e.target.value})}
                    className="h-12 rounded-xl bg-[#F5F5F7] border-none font-bold"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-[#86868B]">Email (Sola Lettura)</Label>
                  <Input 
                    value={editUser.email}
                    readOnly
                    className="h-12 rounded-xl bg-[#F5F5F7] border-none font-bold opacity-60 cursor-not-allowed"
                  />
                </div>
                <div className="md:col-span-2 grid grid-cols-1 gap-6 pt-4 border-t border-[#D2D2D7]/30">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-[#1D1D1F]" />
                    <span className="text-xs font-black uppercase tracking-widest text-[#1D1D1F]">Indirizzo di Residenza / Sede</span>
                  </div>
                  
                  {/* Riga 1: Indirizzo e Civico */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-9 space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-[#86868B]">Indirizzo (Via/Piazza/Corso)</Label>
                      <AddressInput 
                        value={editUser.address}
                        placeholder="es. Via Roma"
                        className="h-12 pl-12 rounded-xl bg-[#F5F5F7] border-none font-bold"
                        onChange={(address, lat, lng, details) => {
                          const streetOnly = details?.route || address?.split(',')[0];
                          
                          const updatedUser = {
                            ...editUser, 
                            address: streetOnly,
                            civico: details?.streetNumber || editUser.civico,
                            location: lat ? { lat, lng } : editUser.location,
                            cap: details?.postalCode || editUser.cap,
                            citta: details?.city || editUser.citta,
                            provincia: details?.province || editUser.provincia,
                            regione: details?.region || editUser.regione
                          };
                          setEditUser(updatedUser);
                          if (user.role === 'worker') {
                            setEditProfile(prev => ({
                              ...prev,
                              cap: details?.postalCode || prev.cap,
                              citta: details?.city || prev.citta,
                              provincia: details?.province || prev.provincia,
                              regione: details?.region || prev.regione
                            }));
                          }
                        }}
                      />
                    </div>
                    <div className="md:col-span-3 space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-[#86868B]">Civico</Label>
                      <Input 
                        placeholder="es. 21"
                        value={editUser.civico}
                        onChange={e => setEditUser({...editUser, civico: e.target.value})}
                        className="h-12 rounded-xl bg-[#F5F5F7] border-none font-bold"
                      />
                    </div>
                  </div>

                  {/* Riga 2: CAP, Città, Provincia */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-3 space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-[#86868B]">CAP</Label>
                      <Input 
                        placeholder="20121"
                        maxLength={5}
                        value={editUser.cap}
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 5);
                          setEditUser({...editUser, cap: val});
                          if (user.role === 'worker') setEditProfile({...editProfile, cap: val});
                        }}
                        className="h-12 rounded-xl bg-[#F5F5F7] border-none font-bold text-center"
                      />
                    </div>
                    <div className="md:col-span-7 space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-[#86868B]">Città</Label>
                      <Input 
                        placeholder="es. Milano"
                        value={editUser.citta}
                        onChange={e => {
                          const val = e.target.value;
                          setEditUser({...editUser, citta: val});
                          if (user.role === 'worker') setEditProfile({...editProfile, citta: val});
                        }}
                        className="h-12 rounded-xl bg-[#F5F5F7] border-none font-bold"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-[#86868B]">Prov.</Label>
                      <Input 
                        placeholder="MI"
                        maxLength={2}
                        value={editUser.provincia}
                        onChange={e => {
                          const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
                          setEditUser({...editUser, provincia: val});
                          if (user.role === 'worker') setEditProfile({...editProfile, provincia: val});
                        }}
                        className="h-12 rounded-xl bg-[#F5F5F7] border-none font-bold text-center"
                      />
                    </div>
                  </div>

                  {/* Riga 3: Regione */}
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-[#86868B]">Regione</Label>
                    <Input 
                      placeholder="es. Lombardia"
                      value={editUser.regione}
                      onChange={e => {
                        const val = e.target.value;
                        setEditUser({...editUser, regione: val});
                        if (user.role === 'worker') setEditProfile({...editProfile, regione: val});
                      }}
                      className="h-12 rounded-xl bg-[#F5F5F7] border-none font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {user.role === 'worker' && (
             <section className="bg-white rounded-[2.5rem] border border-[#D2D2D7]/30 shadow-sm overflow-hidden">
               <div className="p-8 lg:p-10">
                 <div className="flex items-center gap-3 mb-8">
                   <Briefcase className="w-5 h-5 text-[#1D1D1F]" />
                   <h2 className="text-xl font-black tracking-tight">Competenze & Bio</h2>
                 </div>
                 
                 <div className="space-y-6">
                    <div className="space-y-4">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-[#86868B]">Le Tue Categorie di Intervento</Label>
                       <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                         {SERVICE_CATEGORIES.map((cat) => {
                           const isSelected = editProfile.categories.includes(cat.id);
                           const Icon = cat.icon;
                           return (
                             <button
                               key={cat.id}
                               type="button"
                               onClick={() => {
                                 if (isSelected) {
                                   setEditProfile({
                                     ...editProfile,
                                     categories: editProfile.categories.filter(c => c !== cat.id)
                                   });
                                 } else {
                                   setEditProfile({
                                     ...editProfile,
                                     categories: [...editProfile.categories, cat.id]
                                   });
                                 }
                               }}
                               className={cn(
                                 "flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all gap-2",
                                 isSelected 
                                   ? "bg-blue-50 border-blue-600 text-blue-700 shadow-lg shadow-blue-500/10" 
                                   : "bg-[#F5F5F7] border-transparent text-[#86868B] hover:bg-white hover:border-[#D2D2D7]"
                               )}
                             >
                               <Icon className={cn("w-5 h-5", isSelected ? "text-blue-600" : "text-[#86868B]")} />
                               <span className="text-[10px] font-black uppercase tracking-tight">{cat.label}</span>
                             </button>
                           );
                         })}
                       </div>
                    </div>

                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-[#86868B]">Descrizione Professionale (Bio)</Label>
                       <textarea 
                         rows={4}
                         placeholder="Racconta la tua esperienza e cosa sai fare..."
                         value={editProfile.bio}
                         onChange={e => setEditProfile({...editProfile, bio: e.target.value})}
                         className="w-full p-4 rounded-xl bg-[#F5F5F7] border-none font-bold text-sm focus:ring-1 focus:ring-blue-500/20"
                       />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-[#86868B]">Tariffa Oraria (Euro)</Label>
                        <Input 
                          type="number"
                          value={editProfile.hourlyRate}
                          onChange={e => setEditProfile({...editProfile, hourlyRate: parseInt(e.target.value)})}
                          className="h-12 rounded-xl bg-[#F5F5F7] border-none font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-[#86868B]">Raggio Intervento (Km)</Label>
                        <Input 
                          type="number"
                          value={editProfile.radiusKm}
                          onChange={e => setEditProfile({...editProfile, radiusKm: parseInt(e.target.value)})}
                          className="h-12 rounded-xl bg-[#F5F5F7] border-none font-bold"
                        />
                      </div>
                    </div>
                 </div>
               </div>
             </section>
          )}
        </div>

        <div className="space-y-8">
           <Card className="rounded-[2rem] bg-[#1D1D1F] text-white border-none shadow-2xl shadow-blue-900/20 overflow-hidden relative group">
              <CardContent className="p-8 z-10 relative">
                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                    <ShieldCheck className="w-6 h-6 text-blue-400" />
                 </div>
                 <h3 className="text-xl font-black tracking-tight mb-2">Visibilità Dati</h3>
                 <p className="text-xs text-[#86868B] font-bold leading-relaxed mb-8">
                   Scegli quali dati rendere visibili agli altri utenti quando interagisci per una richiesta o un preventivo.
                 </p>
                 
                 <div className="space-y-4">
                    {[
                      { key: 'showEmail', label: 'Mostra Email', icon: Mail },
                      { key: 'showPhone', label: 'Mostra Telefono', icon: Phone },
                      { key: 'showAddress', label: 'Mostra Indirizzo', icon: MapPin }
                    ].map((setting) => (
                      <div key={setting.key} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                           <setting.icon className="w-4 h-4 text-white/50" />
                           <span className="text-[10px] font-black uppercase tracking-widest">{setting.label}</span>
                        </div>
                        <input 
                           type="checkbox"
                           checked={user.role === 'worker' ? !!editProfile.privacySettings?.[setting.key as keyof UserPrivacySettings] : !!editUser.privacySettings?.[setting.key as keyof UserPrivacySettings]}
                           onChange={(e) => {
                             if (user.role === 'worker') {
                               setEditProfile({
                                 ...editProfile,
                                 privacySettings: {
                                   ...(editProfile.privacySettings || { showEmail: false, showPhone: false, showAddress: false, showFullName: false }),
                                   [setting.key]: e.target.checked
                                 } as UserPrivacySettings
                               });
                             }
                             setEditUser({
                               ...editUser,
                               privacySettings: {
                                 ...(editUser.privacySettings || { showEmail: false, showPhone: false, showAddress: false, showFullName: false }),
                                 [setting.key]: e.target.checked
                               } as UserPrivacySettings
                             });
                           }}
                           className="w-5 h-5 rounded-lg bg-white/10 border-none text-blue-500 focus:ring-0"
                        />
                      </div>
                    ))}
                 </div>
              </CardContent>
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[60px]" />
           </Card>

           {user.role === 'worker' && (
             <Card className="rounded-[2.5rem] bg-white border border-[#D2D2D7]/30 shadow-sm overflow-hidden border-t-4 border-t-blue-500">
               <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                 <div>
                   <CardTitle className="text-lg font-black tracking-tight">Portafoglio Crediti</CardTitle>
                   <CardDescription className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest mt-1">Stato Account</CardDescription>
                 </div>
                 <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                   <Wallet className="w-5 h-5" />
                 </div>
               </CardHeader>
               <CardContent className="p-8">
                 <div className="bg-[#F5F5F7] rounded-3xl p-6 mb-6">
                   <div className="flex justify-between items-start mb-4">
                     <span className="text-[10px] font-black uppercase tracking-widest text-[#86868B]">Saldo Attuale</span>
                     <Zap className="w-4 h-4 text-orange-500" />
                   </div>
                   <div className="flex items-baseline gap-2">
                     <span className="text-4xl font-black text-[#1D1D1F]">{editProfile.credits || 0}</span>
                     <span className="text-xs font-bold text-[#86868B]">Crediti</span>
                   </div>
                   <p className="text-[10px] font-bold text-blue-600 mt-2">Circa {Math.floor((editProfile.credits || 0) / 3)} risposte rimanenti</p>
                 </div>

                 <Button 
                   onClick={() => setShowBuyCredits(true)}
                   className="w-full rounded-2xl bg-[#1D1D1F] hover:bg-black text-white font-black text-xs uppercase tracking-widest h-12 shadow-xl shadow-black/10 group"
                 >
                   Ricarica Crediti
                   <Plus className="w-4 h-4 ml-2 group-hover:rotate-90 transition-transform" />
                 </Button>

                 <div className="mt-8 space-y-1">
                   <div className="flex items-center justify-between px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#86868B] mb-2 border-b border-[#D2D2D7]/30">
                     <span>Movimenti Portafoglio</span>
                     <History className="w-3 h-3" />
                   </div>
                   <div className="max-h-[200px] overflow-y-auto pr-2 space-y-1">
                     {user.transactionHistory && user.transactionHistory.length > 0 ? (
                       [...user.transactionHistory].reverse().map((tx, i) => (
                         <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F5F5F7] transition-colors group">
                           <div className="flex items-center gap-3">
                             <div className={cn(
                               "w-6 h-6 rounded-lg flex items-center justify-center",
                               tx.type === 'purchase' ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
                             )}>
                               {tx.type === 'purchase' ? <Plus className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                             </div>
                             <div className="flex flex-col">
                               <span className="text-[10px] font-black text-[#1D1D1F] uppercase tracking-tighter truncate max-w-[100px]">{tx.label}</span>
                               <span className="text-[8px] font-bold text-[#86868B]">{new Date(tx.date).toLocaleDateString()}</span>
                             </div>
                           </div>
                           <span className={cn(
                             "text-xs font-black",
                             tx.type === 'purchase' ? "text-green-600" : "text-[#1D1D1F]"
                           )}>
                             {tx.type === 'purchase' ? '+' : '-'}{tx.credits}
                           </span>
                         </div>
                       ))
                     ) : (
                       <div className="p-8 text-center opacity-30">
                         <History className="w-6 h-6 mx-auto mb-2" />
                         <p className="text-[10px] font-black uppercase tracking-widest">Nessun movimento</p>
                       </div>
                     )}
                   </div>
                 </div>

                 <div className="mt-8 space-y-1">
                   <div className="flex items-center justify-between px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#86868B] mb-2 border-b border-[#D2D2D7]/30">
                     <span>Statistiche Professionali</span>
                     <TrendingUp className="w-3 h-3" />
                   </div>
                   {[
                     { label: 'Proposte Inviate', value: '12', icon: Activity, color: 'text-blue-500' },
                     { label: 'Lavori Completati', value: editProfile.reviewCount || '0', icon: CheckCircle2, color: 'text-green-500' },
                     { label: 'Punteggio Qualità', value: `${(editProfile.rating || 5).toFixed(1)}/5`, icon: Star, color: 'text-amber-500' }
                   ].map((stat, i) => (
                     <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F5F5F7] transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <stat.icon className={cn("w-4 h-4 opacity-50", stat.color)} />
                          <span className="text-xs font-bold text-[#86868B] group-hover:text-[#1D1D1F]">{stat.label}</span>
                        </div>
                        <span className="text-xs font-black text-[#1D1D1F]">{stat.value}</span>
                     </div>
                   ))}
                 </div>
               </CardContent>
             </Card>
           )}

           {user.role === 'client' && (
             <Card className="rounded-[2.5rem] bg-white border border-[#D2D2D7]/30 shadow-sm overflow-hidden">
               <CardHeader className="p-8 pb-4">
                 <CardTitle className="text-lg font-black tracking-tight">Il Tuo Stato</CardTitle>
               </CardHeader>
               <CardContent className="p-8 px-0">
                 <div className="space-y-1">
                   {[
                     { label: 'Richieste Aperte', value: '3', icon: Activity, color: 'text-blue-500' },
                     { label: 'Lavori Completati', value: '18', icon: CheckCircle2, color: 'text-green-500' }
                   ].map((stat, i) => (
                     <div key={i} className="flex items-center justify-between px-8 py-3 hover:bg-[#F5F5F7] transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <stat.icon className={cn("w-4 h-4 opacity-50", stat.color)} />
                          <span className="text-xs font-bold text-[#86868B] group-hover:text-[#1D1D1F]">{stat.label}</span>
                        </div>
                        <span className="text-sm font-black text-[#1D1D1F]">{stat.value}</span>
                     </div>
                   ))}
                 </div>
               </CardContent>
             </Card>
           )}
        </div>
      </div>

      {user.role === 'worker' && (
        <BuyCreditsModal 
          isOpen={showBuyCredits}
          onClose={() => setShowBuyCredits(false)}
          userId={user.id}
          currentBalance={editProfile.credits || 0}
        />
      )}
    </div>
  );
}
