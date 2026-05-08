import React from 'react';
import { auth } from '../firebase';
import { cn } from '../lib/utils';
import { 
  Home, 
  Search, 
  Briefcase, 
  MessageSquare, 
  User, 
  Settings, 
  Shield, 
  CreditCard,
  CheckCircle2,
  ChevronRight,
  Zap,
  LogOut,
  Users,
  FileText
} from 'lucide-react';

import { BrandLogo } from './BrandLogo';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: 'client' | 'worker' | 'admin';
  unreadCount?: number;
}

export function Sidebar({ activeTab, setActiveTab, role, unreadCount = 0 }: SidebarProps) {
  const menuItems = [
    { id: 'home', icon: Home, label: 'Inizio', roles: ['client', 'worker', 'admin'] },
    { id: 'search', icon: Search, label: 'Esplora Esperti', roles: ['client'] },
    { id: 'jobs', icon: Briefcase, label: role === 'worker' ? 'Trova Lavori' : (role === 'admin' ? 'Tutti i Lavori' : 'Le mie Richieste'), roles: ['client', 'worker', 'admin'] },
    { id: 'projects', icon: CheckCircle2, label: 'Lavori Attivi', roles: ['worker'] },
    { id: 'profile', icon: User, label: 'Mio Profilo', roles: ['client', 'worker', 'admin'] },
    { id: 'credits', icon: CreditCard, label: 'Ricarica Token', roles: ['client', 'worker'] },
    { id: 'admin', icon: Shield, label: 'Console Amministratore', roles: ['admin'] },
    { id: 'admin_utenti', icon: Users, label: 'CRM Utenti', roles: ['admin'] },
    { id: 'admin_moderazione', icon: Shield, label: 'Moderazione', roles: ['admin'] },
    { id: 'admin_fatturazione', icon: FileText, label: 'Fatturazione', roles: ['admin'] },
    { id: 'admin_economia', icon: CreditCard, label: 'Economia', roles: ['admin'] },
    { id: 'admin_sistema', icon: Settings, label: 'Sistema', roles: ['admin'] },
  ].filter(item => {
    return item.roles.includes(role);
  });

  return (
    <aside className="w-72 h-screen bg-[#F5F5F7] border-r border-[#D2D2D7]/30 flex flex-col p-6 z-50">
      {/* Brand */}
      <div 
        className="flex items-center gap-3 mb-10 px-2 cursor-pointer group"
        onClick={() => setActiveTab('home')}
      >
        <div className="w-10 h-10 bg-white rounded-[10px] shadow-sm flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
          <BrandLogo className="w-8 h-8" />
        </div>
        <div className="flex flex-col">
          <span className="font-black text-sm tracking-tight">CercArtigiano</span>
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">Premium Portal</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all group relative",
              activeTab === item.id 
                ? "bg-white text-[#1D1D1F] shadow-sm ring-1 ring-[#D2D2D7]/20" 
                : "text-[#86868B] hover:text-[#1D1D1F] hover:bg-white/50"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <item.icon className={cn(
                  "w-5 h-5 transition-transform",
                  activeTab === item.id ? "text-blue-600 scale-110" : "group-hover:scale-110"
                )} />
                {unreadCount > 0 && item.id === 'home' && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FF3B30] rounded-full border-2 border-[#F5F5F7] animate-pulse" />
                )}
              </div>
              <span className={cn(
                "text-sm font-bold",
                activeTab === item.id ? "text-[#1D1D1F]" : "text-[#86868B]"
              )}>{item.label}</span>
            </div>
            {unreadCount > 0 && item.id === 'home' && (
              <span className="bg-[#FF3B30] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full ring-2 ring-white">
                {unreadCount}
              </span>
            )}
            {activeTab === item.id && (
              <ChevronRight className="w-4 h-4 text-blue-600/30" />
            )}
          </button>
        ))}
      </nav>

      {/* Footer / User Area */}
      <div className="mt-auto space-y-2 pt-6 border-t border-[#D2D2D7]/30">
        <button
          onClick={() => setActiveTab('settings')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all",
            activeTab === 'settings' ? "bg-white text-[#1D1D1F] shadow-sm" : "text-[#86868B] hover:text-[#1D1D1F] hover:bg-white/30"
          )}
        >
          <Settings className="w-4 h-4 text-[#86868B]" />
          <span className="text-sm font-bold">Impostazioni</span>
        </button>
        
        <button
          onClick={() => {
            auth.signOut();
          }}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-[#FF3B30] hover:bg-red-50 group"
        >
          <LogOut className="w-4 h-4 transition-transform group-hover:scale-110" />
          <span className="text-sm font-black uppercase tracking-widest">Esci</span>
        </button>
      </div>
    </aside>
  );
}
