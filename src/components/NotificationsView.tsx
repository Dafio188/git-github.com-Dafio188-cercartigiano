import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  limit, 
  updateDoc, 
  doc, 
  deleteDoc 
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Check, 
  Trash2, 
  Info, 
  AlertTriangle, 
  Gift, 
  ExternalLink,
  CheckCircle2,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '../lib/utils';
import { Button } from './ui/button';

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'alert' | 'reward' | 'action';
  read: boolean;
  link?: string;
  createdAt: any;
}

export function NotificationsView({ onClose }: { onClose?: () => void }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Direct user notifications
    const q = query(
      collection(db, 'notifications'),
      where('userId', 'in', [auth.currentUser.uid, 'all']),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      setNotifications(data);
      setLoading(false);
    }, (error) => {
      console.error("NotificationsView onSnapshot error:", error);
    });

    return () => unsubscribe();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (e) {
      console.error(e);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    for (const n of unread) {
      await markAsRead(n.id);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'reward': return <Gift className="w-5 h-5 text-orange-500" />;
      case 'action': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#D2D2D7]/30">
      <div className="p-6 border-b border-[#D2D2D7]/30 flex items-center justify-between bg-[#F5F5F7]/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <Bell className="w-5 h-5 text-[#1D1D1F]" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight">Notifiche</h2>
            <p className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">Aggiornamenti in tempo reale</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {notifications.some(n => !n.read) && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-[10px] font-black uppercase text-blue-600 hover:bg-blue-50 rounded-full h-8"
              onClick={markAllAsRead}
            >
              Segna tutto come letto
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 space-y-4">
             <div className="w-16 h-16 bg-[#F5F5F7] rounded-full flex items-center justify-center mx-auto opacity-50">
               <Bell className="w-8 h-8 text-[#86868B]" />
             </div>
             <div>
                <p className="font-black text-[#1D1D1F]">Tutto tranquillo</p>
                <p className="text-xs font-bold text-[#86868B]">Non hai nuove notifiche al momento.</p>
             </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {notifications.map((n) => (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, x: 20 }}
                className={cn(
                  "p-4 rounded-2xl border transition-all relative group",
                  n.read 
                    ? "bg-white border-[#D2D2D7]/20 grayscale-[0.5] opacity-80" 
                    : "bg-blue-50/30 border-blue-100 shadow-sm"
                )}
              >
                {!n.read && (
                  <div className="absolute top-4 right-4 w-2 h-2 bg-blue-600 rounded-full" />
                )}
                
                <div className="flex gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                    n.type === 'alert' ? "bg-red-50" :
                    n.type === 'reward' ? "bg-orange-50" :
                    n.type === 'action' ? "bg-green-50" : "bg-blue-50"
                  )}>
                    {getTypeIcon(n.type)}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-sm text-[#1D1D1F]">{n.title}</h3>
                      <span className="text-[10px] font-bold text-[#86868B]">
                        {n.createdAt?.toDate && formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true, locale: it })}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-[#86868B] leading-relaxed">{n.message}</p>
                    
                    <div className="pt-3 flex items-center gap-2">
                       {n.link && (
                         <Button size="sm" className="h-7 px-3 text-[10px] font-black rounded-full shadow-sm">
                           VEDI DETTAGLI <ExternalLink className="w-2.5 h-2.5 ml-1.5" />
                         </Button>
                       )}
                       {!n.read && (
                         <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 px-3 text-[10px] font-black rounded-full hover:bg-blue-50"
                          onClick={() => markAsRead(n.id)}
                         >
                           SEGNA COME LETTO
                         </Button>
                       )}
                       <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:bg-red-50"
                        onClick={() => deleteNotification(n.id)}
                       >
                         <Trash2 className="w-3.5 h-3.5" />
                       </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
      
      <div className="p-4 bg-[#F5F5F7]/30 border-t border-[#D2D2D7]/30 text-center">
         <p className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest">Le notifiche più vecchie di 30 giorni vengono eliminate</p>
      </div>
    </div>
  );
}
