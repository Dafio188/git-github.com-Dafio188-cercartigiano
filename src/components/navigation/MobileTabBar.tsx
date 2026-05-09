import React from 'react';
import { motion } from 'motion/react';
import { 
  Home, 
  Search, 
  MessageSquare, 
  User as UserIcon, 
  Zap, 
  Briefcase,
  HelpCircle,
  LogIn,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { User } from '../../types';

interface TabItem {
  id: string;
  icon: any;
  label: string;
}

interface Props {
  activeTab: string;
  onTabChange: (id: string | any) => void;
  user: User | null;
  onLoginRequest: () => void;
  unreadCount?: number;
}

export function MobileTabBar({ activeTab, onTabChange, user, onLoginRequest, unreadCount = 0 }: Props) {
  // Navigation for non-logged users
  const guestTabs: TabItem[] = [
    { id: 'landing-home', icon: Home, label: 'Home' },
    { id: 'explore', icon: Layers, label: 'Servizi' },
    { id: 'how-it-works', icon: Zap, label: 'Vantaggi' },
    { id: 'login', icon: LogIn, label: 'Accedi' },
  ];

  // Navigation for Workers
  const workerTabs: TabItem[] = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'jobs', icon: Briefcase, label: 'Trova' },
    { id: 'projects', icon: CheckCircle2, label: 'Attivi' },
    { id: 'profile', icon: UserIcon, label: 'Mio Profilo' },
    { id: 'credits', icon: Zap, label: 'Piani' },
  ];

  // Navigation for Clients
  const clientTabs: TabItem[] = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Esperti' },
    { id: 'jobs', icon: MessageSquare, label: 'Richieste' },
    { id: 'profile', icon: UserIcon, label: 'Mio Profilo' },
    { id: 'credits', icon: Zap, label: 'Token' },
  ];

  const tabs = !user 
    ? guestTabs 
    : user.role === 'worker' ? workerTabs : clientTabs;

  const handleClick = (id: string) => {
    if (id === 'login') {
      onLoginRequest();
    } else {
      onTabChange(id);
    }
  };

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md h-18 bg-white/70 backdrop-blur-2xl border border-white/40 rounded-[2.5rem] flex items-center justify-around px-4 shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[100] preserve-3d">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id || (tab.id === 'landing-home' && activeTab === 'home');
        const showBadge = unreadCount > 0 && tab.id === 'home';
        
        return (
          <button
            key={tab.id}
            onClick={() => handleClick(tab.id)}
            className="relative flex flex-col items-center justify-center p-2 min-w-[64px] group outline-none"
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-blue-600/5 rounded-2xl -z-10"
                transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
              />
            )}
            
            <motion.div
              animate={isActive ? { scale: 1.2, y: -4 } : { scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors relative",
                isActive ? "text-blue-600" : "text-[#86868B] group-hover:text-[#1D1D1F]"
              )}
            >
              <tab.icon className={cn("w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-[1.8px]")} />
              
              {showBadge && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#FF3B30] rounded-full border-2 border-white animate-pulse" />
              )}
            </motion.div>
            
            <span className={cn(
              "text-[9px] font-black uppercase tracking-tight transition-all duration-300",
              isActive ? "text-blue-600 opacity-100 mt-1" : "text-[#86868B] opacity-70 mt-0"
            )}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
