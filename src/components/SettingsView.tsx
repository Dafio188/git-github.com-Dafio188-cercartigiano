import React, { useState } from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { 
  User, 
  Bell, 
  Lock, 
  Shield, 
  LogOut, 
  ChevronRight,
  Monitor,
  Smartphone,
  Globe,
  CreditCard
} from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { BillingSettings } from './BillingSettings';

export function SettingsView() {
  const [activeSubView, setActiveSubView] = useState<string | null>(null);

  const handleLogout = () => {
    if (confirm('Sei sicuro di voler uscire?')) {
      signOut(auth);
    }
  };

  const sections = [
    {
      title: 'Account & Profilo',
      items: [
        { id: 'profile', label: 'Informazioni Personali', icon: User, detail: 'Gestisci i tuoi dati' },
        { id: 'billing', label: 'Dati Fiscali & Fatturazione', icon: CreditCard, detail: 'P.IVA, SDI e Fatture' },
        { id: 'security', label: 'Password & Sicurezza', icon: Lock, detail: 'Cambia password' },
      ]
    },
    {
      title: 'Notifiche',
      items: [
        { id: 'push', label: 'Notifiche Push', icon: Smartphone, detail: 'Attivate sul dispositivo' },
        { id: 'email', label: 'Notifiche Email', icon: Bell, detail: 'Riepiloghi settimanali' },
      ]
    },
    {
      title: 'Privacy & Dati',
      items: [
        { id: 'data', label: 'Esporta i tuoi dati', icon: Globe, detail: 'Scarica archivio JSON' },
        { id: 'privacy', label: 'Gestione Consensi', icon: Shield, detail: 'GDPR & Privacy' },
      ]
    }
  ];

  if (activeSubView === 'billing') {
    return <BillingSettings onBack={() => setActiveSubView(null)} />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-10 pb-32">
      <div className="space-y-2 px-2">
        <h2 className="text-4xl font-black tracking-tight text-[#1D1D1F]">Impostazioni</h2>
        <p className="text-lg text-[#86868B] font-bold">Gestisci le tue preferenze e la sicurezza del tuo account.</p>
      </div>

      <div className="space-y-8">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#86868B] px-6">{section.title}</h3>
            <div className="bg-white rounded-[2.5rem] border border-[#D2D2D7]/30 shadow-sm overflow-hidden">
              <div className="divide-y divide-[#D2D2D7]/10">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSubView(item.id)}
                    className="w-full p-6 flex items-center justify-between hover:bg-[#F5F5F7]/30 transition-colors group text-left"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-[#F5F5F7] rounded-2xl flex items-center justify-center text-[#86868B] group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-black text-[#1D1D1F]">{item.label}</div>
                        <div className="text-xs font-bold text-[#86868B]">{item.detail}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#D2D2D7] group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}

        <div className="pt-4 px-2">
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="w-full h-16 rounded-[2rem] border border-red-100 bg-red-50/30 text-[#FF3B30] font-black group hover:bg-red-50 hover:text-[#FF3B30]"
          >
            <LogOut className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" />
            Esci dall'account
          </Button>
          <p className="text-center text-[10px] text-[#86868B] font-bold mt-6 uppercase tracking-widest">
            CercArtigiano Version 2.4.0 • Built with precision
          </p>
        </div>
      </div>
    </div>
  );
}