import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { 
  ArrowLeft, 
  Bell, 
  Mail, 
  Smartphone, 
  Info, 
  Loader2, 
  CheckCircle2,
  Lock
} from 'lucide-react';
import { Button } from './ui/button';

interface NotificationSettingsProps {
  onBack: () => void;
}

export function NotificationSettings({ onBack }: NotificationSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState({
    pushJobs: true,
    pushMessages: true,
    pushPromotions: false,
    emailWeekly: true,
    emailInvoices: true,
    emailMarketing: false
  });

  useEffect(() => {
    const fetchSettings = async () => {
      if (!auth.currentUser) return;
      setLoading(true);
      try {
        const docRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.notificationSettings) {
            setSettings({
              ...settings,
              ...data.notificationSettings
            });
          }
        }
      } catch (error) {
        console.error("Error fetching notification settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleToggle = async (key: keyof typeof settings) => {
    if (!auth.currentUser) return;
    
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    setSaving(true);
    
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        notificationSettings: newSettings,
        updatedAt: serverTimestamp()
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      console.error("Error updating settings:", error);
      // Revert on error
      setSettings(settings);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
     return (
       <div className="flex flex-col items-center justify-center p-20 space-y-4">
         <Loader2 className="w-10 h-10 text-primary animate-spin" />
       </div>
     );
  }

  const notificationGroups = [
    {
      title: 'Notifiche Push (Mobile)',
      icon: Smartphone,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      items: [
        { id: 'pushJobs', label: 'Nuovi Lavori', detail: 'Ricevi avvisi per lavori compatibili con te.' },
        { id: 'pushMessages', label: 'Messaggi Chat', detail: 'Notifiche istantanee per nuovi messaggi.' },
        { id: 'pushPromotions', label: 'Offerte & Promozioni', detail: 'Codici sconto e novità sui token.' },
      ]
    },
    {
      title: 'Comunicazioni Email',
      icon: Mail,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      items: [
        { id: 'emailWeekly', label: 'Riepilogo Settimanale', detail: 'Statistiche e opportunità della settimana.' },
        { id: 'emailInvoices', label: 'Fatturazione', detail: 'Ricevute e documenti fiscali.' },
        { id: 'emailMarketing', label: 'Novità CercArtigiano', detail: 'Iscriviti alla nostra newsletter.' },
      ]
    }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-10 pb-32">
      <div className="flex items-center gap-4 px-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full bg-white shadow-sm border border-[#D2D2D7]/30">
          <ArrowLeft className="w-5 h-5 text-[#1D1D1F]" />
        </Button>
        <div>
          <h2 className="text-3xl font-black tracking-tight text-[#1D1D1F]">Notifiche</h2>
          <p className="text-sm text-[#86868B] font-bold">Personalizza come vuoi essere contattato.</p>
        </div>
      </div>

      <div className="space-y-6">
        {notificationGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-4">
             <div className="flex items-center gap-3 px-6">
                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shadow-sm", group.bg, group.color)}>
                  <group.icon className="w-4 h-4" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#86868B]">{group.title}</h3>
             </div>
             
             <div className="bg-white rounded-[2.5rem] border border-[#D2D2D7]/30 shadow-sm overflow-hidden">
                <div className="divide-y divide-[#D2D2D7]/10">
                  {group.items.map((item) => (
                    <div key={item.id} className="p-6 flex items-center justify-between hover:bg-[#F5F5F7]/30 transition-colors">
                      <div className="space-y-1 pr-4">
                        <div className="font-black text-[#1D1D1F]">{item.label}</div>
                        <div className="text-xs font-bold text-[#86868B]">{item.detail}</div>
                      </div>
                      
                      <button
                        onClick={() => handleToggle(item.id as keyof typeof settings)}
                        disabled={saving}
                        className={cn(
                          "w-12 h-6 rounded-full p-1 transition-all duration-300 relative",
                          settings[item.id as keyof typeof settings] ? "bg-green-500" : "bg-[#D2D2D7]"
                        )}
                      >
                        <div className={cn(
                          "w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300",
                          settings[item.id as keyof typeof settings] ? "translate-x-6" : "translate-x-0"
                        )} />
                      </button>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-blue-50 border border-blue-100 rounded-[2.5rem] flex items-start gap-4 mx-2">
         <Info className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
         <div className="space-y-1">
           <h4 className="text-sm font-black text-blue-900 text-left">Nota sulle Notifiche Push</h4>
           <p className="text-xs text-blue-800 font-medium leading-relaxed text-left">
             Per ricevere le notifiche push sul tuo smartphone, assicurati di aver dato il consenso anche nelle impostazioni del tuo browser o dispositivo mobile.
           </p>
         </div>
      </div>
      
      {success && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
           <CheckCircle2 className="w-4 h-4" />
           Impostazioni Salvate
        </div>
      )}
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
