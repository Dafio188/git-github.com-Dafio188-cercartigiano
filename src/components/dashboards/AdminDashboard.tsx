import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { 
  collection, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  updateDoc, 
  increment, 
  serverTimestamp,
  getDoc,
  addDoc,
  setDoc,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { Job } from '../../types';
import { Button } from '../ui/button';
import { auth } from '../../firebase';

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
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
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
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

import { 
  Users, 
  Briefcase, 
  Zap, 
  Shield, 
  Search,
  DollarSign,
  Activity,
  Plus,
  ShieldAlert,
  ChevronRight,
  Lock,
  Trash2,
  Ban,
  Bell,
  Filter,
  RefreshCw,
  Mail,
  UserX,
  ShieldOff,
  Clock,
  Key,
  FileText,
  Settings as SettingsIcon,
  CheckCircle,
  AlertTriangle,
  Download,
  Database,
  Upload,
  MapPin,
  MessageSquare
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
} from '../ui/dialog';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { Input } from '../ui/input';
import { Invoice, AdminBillingConfig } from '../../types';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Legend 
} from 'recharts';

interface AdminDashboardProps {
  user: any;
  summaryOnly?: boolean;
  initialTab?: 'panoramica' | 'utenti' | 'finanza' | 'moderazione' | 'impostazioni' | 'notifiche' | 'fatturazione';
}

export function AdminDashboard({ user, summaryOnly = false, initialTab }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'panoramica' | 'utenti' | 'finanza' | 'moderazione' | 'impostazioni' | 'notifiche' | 'fatturazione'>(initialTab || 'panoramica');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWorkers: 0,
    totalClients: 0,
    totalJobs: 0,
    activeJobs: 0,
    totalTokensSold: 0,
    estimatedRevenue: 0,
    aiCosts: 0,
    serverLatency: 42,
    newUsers24h: 0,
    newUsers7d: 0,
    googleUsers: 0,
    emailUsers: 0,
    activeSessions: 0
  });

  const [usersList, setUsersList] = useState<any[]>([]);
  const [selectedVerification, setSelectedVerification] = useState<any | null>(null);
  const [verificationsList, setVerificationsList] = useState<any[]>([]);
  const [jobsList, setJobsList] = useState<Job[]>([]);
  const [invoicesList, setInvoicesList] = useState<Invoice[]>([]);
  const [adminConfig, setAdminConfig] = useState<AdminBillingConfig | null>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [notifForm, setNotifForm] = useState({
    userId: 'all',
    title: '',
    message: '',
    type: 'info' as 'info' | 'alert' | 'reward' | 'action',
    link: ''
  });

  const [billingConfigForm, setBillingConfigForm] = useState<AdminBillingConfig>({
    companyName: '',
    partitaIva: '',
    codiceFiscale: '',
    address: '',
    cap: '',
    citta: '',
    provincia: '',
    regione: '',
    pec: '',
    codiceSdi: ''
  });

  const saveAdminSettings = async () => {
    setProcessing('saving_settings');
    try {
      // Salviamo in entrambi i posti per compatibilità e permessi
      await setDoc(doc(db, 'adminSettings', 'config'), { ...billingConfigForm });
      // Salviamo solo i link stripe in config/billing che è leggibile da tutti
      await setDoc(doc(db, 'config', 'billing'), { stripeLinks: billingConfigForm.stripeLinks }, { merge: true });
      alert('Impostazioni fiscali e link Stripe salvati con successo.');
    } catch (e) {
      console.error(e);
      alert('Errore nel salvataggio. Verifica i permessi.');
    } finally {
      setProcessing(null);
    }
  };

  const approveInvoice = async (invoiceId: string) => {
    setProcessing(`approving_${invoiceId}`);
    try {
      // In Scenario B, approval triggers the actual SDI process.
      await updateDoc(doc(db, 'invoices', invoiceId), { 
        status: 'pending_sdi', 
        approvedAt: serverTimestamp() 
      });
      alert('Fattura approvata e messa in coda per il sistema SDI.');
    } catch (e) {
      console.error(e);
      alert('Errore nell\'approvazione.');
    } finally {
      setProcessing(null);
    }
  };

  const [backupLoading, setBackupLoading] = useState(false);

  
  const handleApproveVerification = async (userId: string, isApproved: boolean) => {
    setProcessing('approving_' + userId);
    try {
      if (isApproved) {
        await updateDoc(doc(db, 'users', userId), { status: 'active' });
        await updateDoc(doc(db, 'verifications', userId), { status: 'approved' });
        alert('Artigiano approvato con successo!');
      } else {
        await updateDoc(doc(db, 'verifications', userId), { status: 'rejected' });
        alert("Documenti rifiutati. L'utente dovrà ricaricarli.");
      }
      setSelectedVerification(null);
    } catch (e) {
      console.error(e);
      alert("Errore durante l'operazione");
    } finally {
      setProcessing(null);
    }
  };


  const exportDatabase = async () => {
    setBackupLoading(true);
    try {
      const collectionsToExport = ['users', 'workerProfiles', 'jobs', 'invoices', 'billingProfiles'];
      const backupData: any = {};

      for (const colName of collectionsToExport) {
        const snap = await getDocs(collection(db, colName));
        backupData[colName] = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cercartigiano_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Backup failed", e);
      alert("Errore durante il backup.");
    } finally {
      setBackupLoading(false);
    }
  };

  const importDatabase = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!confirm("ATTENZIONE: Stai per importare dei dati che potrebbero sovrascrivere quelli attuali. Procedere?")) {
      event.target.value = '';
      return;
    }

    setBackupLoading(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      for (const [colName, docs] of Object.entries(data)) {
        if (!Array.isArray(docs)) continue;

        // Process in chunks of 500 (Firestore Batch limit)
        const chunks = [];
        for (let i = 0; i < docs.length; i += 500) {
          chunks.push(docs.slice(i, i + 500));
        }

        for (const chunk of chunks) {
          const batch = writeBatch(db);
          chunk.forEach((docData: any) => {
            const { id, ...cleanData } = docData;
            // Clean internal firestore types if necessary (simplified)
            const ref = doc(db, colName, id);
            batch.set(ref, cleanData, { merge: true });
          });
          await batch.commit();
        }
      }

      alert("Database importato con successo!");
    } catch (e) {
      console.error("Import failed", e);
      alert("Errore durante l'importazione. Verifica il formato del file.");
    } finally {
      setBackupLoading(false);
      event.target.value = '';
    }
  };

  const sendNotification = async () => {
    if (!notifForm.title || !notifForm.message) return;
    setProcessing('sending_notif');
    try {
      const batch = writeBatch(db);
      // For each user in usersList, create a notification
      usersList.forEach(u => {
        const notifRef = doc(collection(db, 'notifications'));
        batch.set(notifRef, {
          userId: u.id,
          title: notifForm.title,
          message: notifForm.message,
          type: notifForm.type || 'info',
          isRead: false,
          createdAt: serverTimestamp()
        });
      });
      await batch.commit();

      alert('Notifica broadcast inviata con successo');
      setNotifForm({
        userId: 'all',
        title: '',
        message: '',
        type: 'info',
        link: ''
      });
    } catch (e) {
      console.error(e);
      alert('Errore nell\'invio della notifica');
    } finally {
      setProcessing(null);
    }
  };

  useEffect(() => {
    const unsubInvoices = onSnapshot(collection(db, 'invoices'), (snap) => {
      setInvoicesList(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Invoice[]);
    }, (error) => {
      console.error("AdminDashboard invoices onSnapshot error:", error);
    });

    const unsubAdminConfig = onSnapshot(doc(db, 'adminSettings', 'config'), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as AdminBillingConfig;
        setAdminConfig(data);
        setBillingConfigForm(prev => ({
          ...prev,
          ...data,
          stripeLinks: data.stripeLinks || prev.stripeLinks
        }));
      }
    }, (error) => {
      console.warn("AdminDashboard adminSettings onSnapshot warn (retrying with config/billing?):", error);
      // Try fallback to config/billing if restricted
      getDoc(doc(db, 'config', 'billing')).then(snap => {
        if (snap.exists() && snap.data().stripeLinks) {
          setBillingConfigForm(prev => ({
            ...prev,
            stripeLinks: snap.data().stripeLinks
          }));
        }
      }).catch(e => console.error("AdminDashboard billing config fallback failed:", e));
    });

    const unsubVerifications = onSnapshot(collection(db, 'verifications'), (snap) => {
      setVerificationsList(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }); 

    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      const allUsers = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const fiveMinsAgo = new Date(now.getTime() - 5 * 60 * 1000);

      const workers = allUsers.filter((u: any) => u.role === 'worker');
      const clients = allUsers.filter((u: any) => u.role === 'client');
      const tokensSold = allUsers.reduce((acc, u: any) => acc + (u.tokensPurchased || 0), 0);
      
      const new24h = allUsers.filter((u: any) => u.createdAt?.toDate && u.createdAt.toDate() > oneDayAgo).length;
      const new7d = allUsers.filter((u: any) => u.createdAt?.toDate && u.createdAt.toDate() > oneWeekAgo).length;
      const google = allUsers.filter((u: any) => u.provider === 'google.com').length;
      const email = allUsers.filter((u: any) => u.provider === 'password').length;
      const active = allUsers.filter((u: any) => u.lastActiveAt?.toDate && u.lastActiveAt.toDate() > fiveMinsAgo).length;

      setUsersList(allUsers);
      setStats(prev => ({ 
        ...prev, 
        totalUsers: snap.size,
        totalWorkers: workers.length,
        totalClients: clients.length,
        totalTokensSold: tokensSold,
        estimatedRevenue: tokensSold * 0.90,
        newUsers24h: new24h,
        newUsers7d: new7d,
        googleUsers: google,
        emailUsers: email,
        activeSessions: active
      }));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });
    
    const unsubJobs = onSnapshot(collection(db, 'jobs'), (snap) => {
      const allJobs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Job[];
      const active = allJobs.filter((j: Job) => j.status === 'open');
      setJobsList(allJobs);
      setStats(prev => ({ 
        ...prev, 
        totalJobs: snap.size,
        activeJobs: active.length,
        aiCosts: snap.size * 0.02
      }));

      setRecentLogs(allJobs.slice(0, 15).map(j => ({
         id: j.id,
         type: j.status === 'open' ? 'job' : 'system',
         title: j.title,
         detail: j.status === 'open' ? `Pubblicato in ${j.location?.address}` : `Aggiornato a ${j.status}`,
         time: j.createdAt?.toDate ? j.createdAt.toDate().toLocaleTimeString() : 'Poco fa'
      })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'jobs');
    });

    return () => {
      unsubInvoices();
      unsubAdminConfig();
      unsubVerifications();
      unsubUsers();
      unsubJobs();
    };
  }, []);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleDeleteJob = async (id: string) => {
    if (!window.confirm('Eliminare definitivamente questo lavoro?')) return;
    setProcessing(id);
    try {
      await deleteDoc(doc(db, 'jobs', id));
    } catch (e) { console.error(e); } finally { setProcessing(null); }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    setProcessing(userId);
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      alert(`Ruolo utente aggiornato a: ${newRole}`);
    } catch (e) { 
      console.error(e); 
      alert("Errore nell'aggiornamento ruolo. Verifica i permessi.");
    } finally { setProcessing(null); }
  };

  const handleAddTokens = async (userId: string) => {
    const amount = window.prompt('Quanti token vuoi accreditare?', '10');
    if (amount === null) return;
    const numAmount = Number(amount);
    if (isNaN(numAmount)) {
      alert("Inserisci un numero valido.");
      return;
    }
    setProcessing(userId);
    try {
      await updateDoc(doc(db, 'users', userId), { 
        tokens: increment(numAmount),
        lastGiftAt: serverTimestamp()
      });
      alert(`Accreditati ${numAmount} token con successo.`);
    } catch (e) { 
      console.error(e); 
      alert("Errore nell'accredito token.");
    } finally { setProcessing(null); }
  };

  const filteredUsers = usersList.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (summaryOnly) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Utenti Totali', val: stats.totalUsers, icon: Users, color: 'blue', detail: `${stats.newUsers24h} nuovi (24h)` },
            { label: 'Nuovi Iscritti', val: stats.newUsers7d, icon: Plus, color: 'orange', detail: 'Ultimi 7 giorni' },
            { label: 'Sessioni Attive', val: stats.activeSessions, icon: Activity, color: 'green', detail: 'Utenti online ora' },
            { label: 'Token Burn', val: stats.totalTokensSold, icon: Zap, color: 'purple', detail: `Est. €${stats.estimatedRevenue.toFixed(0)}` },
          ].map((kpi, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-[#D2D2D7]/30 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", 
                  kpi.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                  kpi.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                  kpi.color === 'orange' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'
                )}>
                  <kpi.icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black text-green-600 uppercase">Realtime</span>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase text-[#86868B] tracking-widest">{kpi.label}</div>
                <div className="text-4xl font-black text-[#1D1D1F] tracking-tighter">{kpi.val}</div>
                <div className="text-[10px] font-bold text-[#86868B]">{kpi.detail}</div>
              </div>
            </div>
          ))}
      </div>
    );
  }

  const handleBannUser = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    if (!window.confirm(`Vuoi ${newStatus === 'suspended' ? 'sospendere' : 'riattivare'} questo utente?`)) return;
    setProcessing(userId);
    try {
      await updateDoc(doc(db, 'users', userId), { status: newStatus });
      alert(`Utente ${newStatus === 'suspended' ? 'sospeso' : 'riattivato'} con successo.`);
    } catch (e) { 
      console.error(e); 
      alert("Errore durante l'operazione di ban/sblocco.");
    } finally { setProcessing(null); }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('ATTENZIONE: Questa azione rimuoverà i dati dell\'utente dal database. Procedere?')) return;
    setProcessing(userId);
    try {
      await deleteDoc(doc(db, 'users', userId));
      alert("Utente eliminato definitivamente.");
    } catch (e) { 
      console.error(e); 
      alert("Errore durante l'eliminazione dell'utente.");
    } finally { setProcessing(null); }
  };

  const handleMaintenanceToggle = async () => {
    const maintenanceRef = doc(db, 'config', 'system');
    setProcessing('maintenance');
    try {
      const snap = await getDoc(maintenanceRef);
      const isMaintenance = snap.exists() ? (snap.data()?.maintenanceMode || false) : false;
      await setDoc(maintenanceRef, { maintenanceMode: !isMaintenance }, { merge: true });
      alert(`Manutenzione ${!isMaintenance ? 'ATTIVATA' : 'DISATTIVATA'}`);
    } catch (e) { 
      console.error(e); 
      alert('Errore nel cambio modalità. Assicurati che la collezione "config" esista.');
    } finally {
      setProcessing(null);
    }
  };

  const handleViewJobDetails = (job: Job) => {
    setSelectedJob(job);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-32 max-w-[1600px] mx-auto">
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] border border-[#D2D2D7]/30 shadow-sm relative overflow-hidden group">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <h2 className="text-5xl font-black tracking-tighter text-[#1D1D1F]">Control Center <span className="text-blue-600 italic">OS</span></h2>
            <p className="text-sm font-bold text-[#86868B]">Monitoraggio granulare e strumenti CRM attivi.</p>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="outline" className="rounded-full h-12 px-6 border-[#D2D2D7] font-black text-xs uppercase tracking-widest hover:bg-[#F5F5F7]" onClick={() => window.location.reload()}>Refresh</Button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      </div>

      <div className="flex items-center gap-1.5 bg-[#F5F5F7] p-1.5 rounded-2xl border border-[#D2D2D7]/30 w-fit">
        {[
          { id: 'panoramica', label: 'Monitor', icon: Activity },
          { id: 'utenti', label: 'CRM Utenti', icon: Users },
          { id: 'finanza', label: 'Economia', icon: DollarSign },
          { id: 'moderazione', label: 'Moderazione', icon: Shield },
          { id: 'notifiche', label: 'Broadcast', icon: Bell },
          { id: 'fatturazione', label: 'Fatturazione', icon: FileText },
          { id: 'impostazioni', label: 'Sistema', icon: Lock },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all",
              activeTab === tab.id ? "bg-white text-[#1D1D1F] shadow-sm ring-1 ring-[#D2D2D7]/20" : "text-[#86868B]"
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'notifiche' && (
          <motion.div key="notifiche" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto">
             <div className="bg-white p-10 rounded-[3rem] border border-[#D2D2D7]/30 shadow-sm space-y-8">
                <div className="space-y-2">
                   <h3 className="text-3xl font-black tracking-tight text-[#1D1D1F]">Invia Notifica <span className="text-blue-600">OS</span></h3>
                   <p className="text-sm font-bold text-[#86868B]">Invia messaggi in tempo reale ad utenti specifici o a tutta la piattaforma.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-[#86868B] ml-4">Destinatario</label>
                      <select 
                        value={notifForm.userId}
                        onChange={(e) => setNotifForm({...notifForm, userId: e.target.value})}
                        className="w-full h-12 bg-[#F5F5F7] border border-[#D2D2D7]/30 rounded-2xl px-4 text-sm font-bold focus:ring-2 ring-blue-600/20 transition-all outline-none"
                      >
                         <option value="all">Tutti gli utenti (Broadcast)</option>
                         {usersList.slice(0, 50).map(u => (
                           <option key={u.id} value={u.id}>{u.nome} ({u.email})</option>
                         ))}
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-[#86868B] ml-4">Tipo Notifica</label>
                      <select 
                        value={notifForm.type}
                        onChange={(e) => setNotifForm({...notifForm, type: e.target.value as any})}
                        className="w-full h-12 bg-[#F5F5F7] border border-[#D2D2D7]/30 rounded-2xl px-4 text-sm font-bold focus:ring-2 ring-blue-600/20 transition-all outline-none"
                      >
                         <option value="info">Informazione (Blu)</option>
                         <option value="alert">Allerta / Warning (Rosso)</option>
                         <option value="reward">Premio / Token (Arancio)</option>
                         <option value="action">Azione Richiesta (Verde)</option>
                      </select>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-[#86868B] ml-4">Titolo Breve</label>
                   <Input 
                     placeholder="Es: Aggiornamento Termini e Condizioni" 
                     value={notifForm.title}
                     onChange={(e) => setNotifForm({...notifForm, title: e.target.value})}
                     className="h-14 bg-[#F5F5F7] border-[#D2D2D7]/30 rounded-2xl px-6 text-base font-bold"
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-[#86868B] ml-4">Messaggio</label>
                   <textarea 
                     placeholder="Descrivi i dettagli della notifica..." 
                     value={notifForm.message}
                     onChange={(e) => setNotifForm({...notifForm, message: e.target.value})}
                     className="w-full h-32 bg-[#F5F5F7] border border-[#D2D2D7]/30 rounded-2xl p-6 text-base font-medium resize-none focus:ring-2 ring-blue-600/20 transition-all outline-none"
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-[#86868B] ml-4">Link Azione (Opzionale)</label>
                   <Input 
                     placeholder="Es: /profile o https://..." 
                     value={notifForm.link}
                     onChange={(e) => setNotifForm({...notifForm, link: e.target.value})}
                     className="h-14 bg-[#F5F5F7] border-[#D2D2D7]/30 rounded-2xl px-6 text-base font-bold"
                   />
                </div>

                <Button 
                  className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-lg font-black tracking-tight shadow-xl shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50"
                  onClick={sendNotification}
                  disabled={!!processing}
                >
                  {processing === 'sending_notif' ? 'INVIO IN CORSO...' : 'INVIA NOTIFICA ORA'}
                </Button>
             </div>
          </motion.div>
        )}

        {activeTab === 'finanza' && (
          <motion.div key="finanza" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="bg-white p-10 rounded-[3rem] border border-[#D2D2D7]/30 shadow-sm relative overflow-hidden">
                  <div className="text-[10px] font-black uppercase text-green-600 mb-2 tracking-widest">Revenue Netta Est.</div>
                  <div className="text-6xl font-black text-[#1D1D1F] tracking-tighter">€{stats.estimatedRevenue.toFixed(2)}</div>
                  <p className="mt-4 text-xs font-bold text-[#86868B]">Margine calcolato post-fee (10%).</p>
               </div>
               <div className="bg-white p-10 rounded-[3rem] border border-[#D2D2D7]/30 shadow-sm relative overflow-hidden">
                  <div className="text-[10px] font-black uppercase text-red-600 mb-2 tracking-widest">Burn Rate AI</div>
                  <div className="text-6xl font-black text-[#1D1D1F] tracking-tighter">€{stats.aiCosts.toFixed(2)}</div>
                  <p className="mt-4 text-xs font-bold text-[#86868B]">Costo stimato Gemini per listing analizzati.</p>
               </div>
               <div className="bg-[#1D1D1F] p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                  <div className="text-[10px] font-black uppercase text-blue-400 mb-2 tracking-widest">Profitto Operativo</div>
                  <div className="text-6xl font-black tracking-tighter">€{(stats.estimatedRevenue - stats.aiCosts).toFixed(2)}</div>
                  <p className="mt-4 text-xs font-bold text-white/40">Fatturato in real-time.</p>
               </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'fatturazione' && (
          <motion.div key="fatturazione" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Invoice List (Scenario B Manager) */}
              <div className="xl:col-span-2 space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-[#D2D2D7]/30 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-xl font-black text-[#1D1D1F]">Gestione Fatture (SDI)</h3>
                      <p className="text-xs font-bold text-[#86868B]">Approva le bozze per l'invio ufficiale.</p>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                         Scenario B Attivo
                       </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {invoicesList.length === 0 ? (
                      <div className="py-12 text-center">
                        <FileText className="w-12 h-12 text-[#D2D2D7] mx-auto mb-4" />
                        <p className="text-sm font-bold text-[#86868B]">Nessuna fattura trovata nel sistema.</p>
                      </div>
                    ) : (
                      invoicesList.map((invoice) => (
                        <div key={invoice.id} className="p-5 border border-[#D2D2D7]/30 rounded-2xl flex items-center justify-between hover:bg-[#F5F5F7]/30 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center",
                              invoice.status === 'draft' ? "bg-orange-50 text-orange-600" :
                              invoice.status === 'sent' ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
                            )}>
                              {invoice.status === 'draft' ? <Clock className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
                            </div>
                            <div>
                              <div className="font-black text-sm text-[#1D1D1F]">€{invoice.amount.toFixed(2)} - {invoice.tokens} Token</div>
                              <div className="text-[10px] font-bold text-[#86868B] uppercase tracking-tighter">
                                {invoice.fiscalData.ragioneSociale || invoice.fiscalData.codiceFiscale} • {new Date(invoice.createdAt?.toDate ? invoice.createdAt.toDate() : invoice.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "text-[10px] font-black uppercase px-2 py-1 rounded-md",
                              invoice.status === 'draft' ? "bg-orange-100 text-orange-700" :
                              invoice.status === 'sent' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                            )}>
                              {invoice.status}
                            </div>
                            {invoice.status === 'draft' && (
                              <Button 
                                size="sm" 
                                className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px]"
                                onClick={() => approveInvoice(invoice.id)}
                                disabled={!!processing}
                              >
                                APPROVA & INVIA
                              </Button>
                            )}
                            {(invoice.pdfUrl || invoice.xmlUrl) && (
                              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl" onClick={() => window.open(invoice.pdfUrl || invoice.xmlUrl)}>
                                <FileText className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Fiscal Config side panel */}
              <div className="space-y-6">
                <div className="bg-[#1D1D1F] p-8 rounded-[2.5rem] text-white shadow-2xl space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <SettingsIcon className="w-5 h-5 text-blue-400" />
                    <h3 className="text-xl font-black tracking-tight">Dati Societari</h3>
                  </div>
                  <p className="text-xs font-medium text-white/50 leading-relaxed">
                    Configura i dati fiscali della tua azienda che compariranno come mittente nelle fatture.
                  </p>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-white/40 ml-2">Ragione Sociale</label>
                      <Input 
                        value={billingConfigForm.companyName}
                        onChange={(e) => setBillingConfigForm({...billingConfigForm, companyName: e.target.value})}
                        className="bg-white/10 border-transparent text-white rounded-xl focus:ring-blue-500/50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-white/40 ml-2">P. IVA</label>
                        <Input 
                          value={billingConfigForm.partitaIva}
                          onChange={(e) => setBillingConfigForm({...billingConfigForm, partitaIva: e.target.value})}
                          className="bg-white/10 border-transparent text-white rounded-xl focus:ring-blue-500/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-white/40 ml-2">PEC / SDI</label>
                        <Input 
                          value={billingConfigForm.codiceSdi}
                          onChange={(e) => setBillingConfigForm({...billingConfigForm, codiceSdi: e.target.value.toUpperCase()})}
                          className="bg-white/10 border-transparent text-white rounded-xl focus:ring-blue-500/50"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-white/40 ml-2">Indirizzo Sede</label>
                      <Input 
                        value={billingConfigForm.address}
                        onChange={(e) => setBillingConfigForm({...billingConfigForm, address: e.target.value})}
                        className="bg-white/10 border-transparent text-white rounded-xl focus:ring-blue-500/50"
                      />
                    </div>
                  </div>

                  <Button 
                    className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black tracking-tight"
                    onClick={saveAdminSettings}
                    disabled={!!processing}
                  >
                    {processing === 'saving_settings' ? 'SALVATAGGIO...' : 'SALVA CONFIGURAZIONE'}
                  </Button>
                </div>

                <div className="bg-orange-50 border border-orange-100 p-6 rounded-[2rem] space-y-3">
                  <div className="flex items-center gap-2 text-orange-700">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-widest">Integrazione SDI</span>
                  </div>
                  <p className="text-[11px] font-bold text-orange-800/70 leading-relaxed">
                    Assicurati che la chiave API di OpenAPI.it sia configurata nel file .env per l'invio reale.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'impostazioni' && (
          <motion.div key="impostazioni" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-white p-8 rounded-[2.5rem] border border-[#D2D2D7]/30 shadow-sm space-y-8">
                <h3 className="text-2xl font-black tracking-tight">Parametri di Sistema</h3>
                
                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                      <div>
                         <div className="font-black text-sm">Modalità Manutenzione</div>
                         <div className="text-xs font-bold text-[#86868B]">Blocca l'accesso a tutti gli utenti non-admin.</div>
                      </div>
                      <Button 
                        variant="outline" 
                        className="rounded-full font-black text-[10px] w-32 h-10 border-blue-200 text-blue-600 hover:bg-blue-50" 
                        onClick={handleMaintenanceToggle}
                        disabled={processing === 'maintenance'}
                      >
                        {processing === 'maintenance' ? <RefreshCw className="w-3 h-3 animate-spin" /> : "TOGGLE STATUS"}
                      </Button>
                   </div>
                   
                   <div className="space-y-4 pt-4 border-t border-[#D2D2D7]/20">
                      <div className="font-black text-sm mb-4">Link Checkout Stripe Direct</div>
                      <div className="grid grid-cols-1 gap-4">
                         {[
                           { key: 'worker_basic', label: 'Pack Crescita (Worker)' },
                           { key: 'worker_pro', label: 'Pack Professionista (Worker)' },
                           { key: 'worker_expert', label: 'Pack Expert (Worker)' },
                           { key: 'client_premium', label: 'Premium (Client)' },
                           { key: 'client_vip', label: 'VIP (Client)' },
                         ].map((link) => (
                           <div key={link.key} className="space-y-1">
                             <label className="text-[9px] font-black uppercase text-[#86868B] ml-2">{link.label}</label>
                             <div className="flex gap-2">
                               <Input 
                                 placeholder="https://buy.stripe.com/..."
                                 value={billingConfigForm.stripeLinks?.[link.key as keyof typeof billingConfigForm.stripeLinks] || ''}
                                 onChange={(e) => setBillingConfigForm({
                                   ...billingConfigForm,
                                   stripeLinks: {
                                     ...billingConfigForm.stripeLinks,
                                     [link.key]: e.target.value
                                   }
                                 })}
                                 className="h-10 bg-[#F5F5F7] border-transparent rounded-xl text-xs"
                               />
                             </div>
                           </div>
                         ))}
                         <Button 
                           onClick={saveAdminSettings}
                           disabled={!!processing}
                           className="w-full mt-4 bg-blue-600 text-white rounded-xl font-black text-xs h-12"
                         >
                           {processing === 'saving_settings' ? 'SALVATAGGIO...' : 'AGGIORNA LINK STRIPE'}
                         </Button>
                      </div>
                   </div>
                </div>
             </div>

             <div className="bg-[#F5F5F7] p-8 rounded-[2.5rem] border border-[#D2D2D7]/30 space-y-8">
                <h3 className="text-2xl font-black tracking-tight">Sicurezza & Backup</h3>
                <div className="space-y-6">
                   <div className="p-6 bg-white rounded-2xl border border-[#D2D2D7]/20 space-y-4">
                      <div className="flex items-center gap-4">
                        <Database className="w-5 h-5 text-blue-600" />
                        <div className="font-black text-sm">Esportazione Dati</div>
                      </div>
                      <p className="text-[10px] font-bold text-[#86868B] leading-tight">
                        Scarica un backup integrale in formato JSON di tutte le tabelle critiche (Utenti, Lavori, Fatture).
                      </p>
                      <Button 
                        onClick={exportDatabase}
                        disabled={backupLoading}
                        className="w-full h-12 bg-[#1D1D1F] text-white rounded-xl font-black text-xs hover:bg-[#1D1D1F]/90"
                      >
                        {backupLoading ? "ESPORTAZIONE..." : "ESPORTA DATABASE (JSON)"}
                        <Download className="w-4 h-4 ml-2" />
                      </Button>
                   </div>

                   <div className="p-6 bg-white rounded-2xl border border-[#D2D2D7]/20 space-y-4">
                      <div className="flex items-center gap-4">
                        <Shield className="w-5 h-5 text-green-600" />
                        <div className="font-black text-sm">Ripristino Dati</div>
                      </div>
                      <p className="text-[10px] font-bold text-[#86868B] leading-tight">
                        Carica un file JSON di backup precedente per ripristinare il database. I dati esistenti verranno uniti o sovrascritti.
                      </p>
                      <div className="relative">
                        <input
                          type="file"
                          accept=".json"
                          onChange={importDatabase}
                          disabled={backupLoading}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          id="import-backup-admin"
                        />
                        <Button 
                          asChild
                          disabled={backupLoading}
                          className="w-full h-12 bg-white border border-[#D2D2D7]/30 text-[#1D1D1F] rounded-xl font-black text-xs hover:bg-[#F5F5F7]"
                        >
                          <label htmlFor="import-backup-admin" className="cursor-pointer flex items-center justify-center">
                            {backupLoading ? "IMPORTAZIONE..." : "IMPORTA DATABASE (JSON)"}
                            <Upload className="w-4 h-4 ml-2" />
                          </label>
                        </Button>
                      </div>
                   </div>

                   <div className="p-4 bg-white rounded-2xl border border-[#D2D2D7]/20 flex items-center gap-4">
                      <ShieldAlert className="w-5 h-5 text-orange-500" />
                      <div>
                         <div className="font-black text-xs">Password Policy: Strong</div>
                         <div className="text-[10px] font-bold text-[#86868B]">Richiesta complessità elevata attiva.</div>
                      </div>
                   </div>
                </div>
             </div>
          </motion.div>
        )}
        {activeTab === 'panoramica' && (
          <motion.div key="panoramica" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Google Auth', val: stats.googleUsers, icon: Mail, color: 'blue' },
                { label: 'Email/Pass', val: stats.emailUsers, icon: Key, color: 'orange' },
                { label: 'Lavori Attivi', val: stats.activeJobs, icon: Briefcase, color: 'purple' },
                { label: 'Revenue Totale', val: `€${stats.estimatedRevenue.toFixed(0)}`, icon: DollarSign, color: 'green' },
              ].map((kpi, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-[#D2D2D7]/30 shadow-sm">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", 
                    kpi.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                    kpi.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                    kpi.color === 'orange' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'
                  )}>
                    <kpi.icon className="w-6 h-6" />
                  </div>
                  <div className="text-[10px] font-black uppercase text-[#86868B] mb-1">{kpi.label}</div>
                  <div className="text-4xl font-black text-[#1D1D1F]">{kpi.val}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-[#D2D2D7]/30 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-black tracking-tight">Metodi di Accesso</h3>
                  <span className="text-[10px] font-black uppercase text-[#86868B]">Analisi Provider</span>
                </div>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Google', value: stats.googleUsers },
                          { name: 'Email/Password', value: stats.emailUsers }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#0071e3" />
                        <Cell fill="#f56300" />
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-[#D2D2D7]/30 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-black tracking-tight">Attività Temporale</h3>
                  <span className="text-[10px] font-black uppercase text-[#86868B]">Crescita Utenti</span>
                </div>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { day: 'Lun', val: 12 },
                      { day: 'Mar', val: 19 },
                      { day: 'Mer', val: 15 },
                      { day: 'Gio', val: 22 },
                      { day: 'Ven', val: 30 },
                      { day: 'Sab', val: 25 },
                      { day: 'Dom', val: stats.newUsers24h }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F7" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="val" stroke="#0071e3" strokeWidth={4} dot={{ r: 6, fill: '#0071e3', strokeWidth: 0 }} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-[2.5rem] border border-[#D2D2D7]/30 overflow-hidden shadow-sm">
               <div className="p-6 border-b border-[#D2D2D7]/30 font-black text-xs uppercase text-[#86868B] flex items-center justify-between">
                 <span>System Intelligence Feed</span>
                 <RefreshCw className="w-4 h-4 animate-spin-slow" />
               </div>
               <div className="divide-y divide-[#D2D2D7]/10">
                  {recentLogs.map((log, i) => (
                    <div key={i} className="p-6 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", log.type === 'job' ? 'bg-blue-50' : 'bg-green-50')}>
                             {log.type === 'job' ? <Plus className="w-5 h-5 text-blue-600" /> : <Shield className="w-5 h-5 text-green-600" />}
                          </div>
                          <div>
                             <div className="font-black text-sm text-[#1D1D1F]">{log.title}</div>
                             <div className="text-[10px] font-bold text-[#86868B]">{log.detail}</div>
                          </div>
                       </div>
                       <span className="text-[10px] font-black text-[#D2D2D7]">{log.time}</span>
                    </div>
                  ))}
               </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'utenti' && (
          <motion.div key="utenti" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-[#D2D2D7]/30 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead className="bg-[#F5F5F7] text-[10px] font-black uppercase text-[#86868B]">
                   <tr>
                     <th className="px-8 py-5">Utente</th>
                     <th className="px-8 py-5">Ruolo</th>
                     <th className="px-8 py-5">Tokens</th>
                     <th className="px-8 py-5 text-right w-full min-w-[max-content]">Azioni CRM</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-[#D2D2D7]/10">
                   {filteredUsers.map(u => (
                     <tr key={u.id} className="hover:bg-[#F5F5F7]/30">
                       <td className="px-8 py-6">
                          <div className="font-black text-[#1D1D1F] text-sm">{u.nome || u.displayName || 'Anonimo'}</div>
                          <div className="text-xs font-bold text-[#86868B]">{u.email}</div>
                       </td>
                       <td className="px-8 py-6">
                          <span className={cn(
                            "text-[10px] font-black uppercase px-2 py-1 rounded inline-block",
                            u.role === 'admin' ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"
                          )}>
                            {u.role}
                          </span>
                          {u.status === 'pending' && (
                             <span className="ml-2 text-[10px] bg-orange-50 text-orange-600 font-black uppercase px-2 py-1 rounded inline-block">
                               IN ATTESA
                             </span>
                          )}
                       </td>
                       <td className="px-8 py-6 font-black text-sm">{u.tokens || 0}</td>
                       <td className="px-8 py-6 text-right space-x-2 whitespace-nowrap">
                          {u.status === 'pending' && (
                             <>
                               {verificationsList.find(v => v.userId === u.id) ? (
                                 <Button 
                                   variant="default" 
                                   size="sm" 
                                   className="rounded-full h-8 px-4 text-[10px] font-black bg-orange-500 hover:bg-orange-600 text-white"
                                   onClick={() => setSelectedVerification(verificationsList.find(v => v.userId === u.id))}
                                 >
                                   VEDI DOCS
                                 </Button>
                               ) : (
                                 <span className="text-[10px] text-orange-500 font-bold px-2">No Docs Uploaded</span>
                               )}
                               <Button 
                                 variant="default" 
                                 size="sm" 
                                 className="rounded-full h-8 px-4 text-[10px] font-black bg-green-600 hover:bg-green-700 text-white ml-2"
                                 onClick={async () => {
                                   if(confirm('Vuoi approvare manualmente questo utente?')) {
                                      setProcessing('approving_' + u.id);
                                      try {
                                        await updateDoc(doc(db, 'users', u.id), { status: 'active' });
                                        if (verificationsList.find(v => v.userId === u.id)) {
                                          await updateDoc(doc(db, 'verifications', u.id), { status: 'approved' });
                                        }
                                        alert('Approvato.');
                                      } catch (e) {
                                        console.error(e);
                                      } finally {
                                        setProcessing(null);
                                      }
                                   }
                                 }}
                                 disabled={!!processing}
                               >
                                 APPROVA
                               </Button>
                             </>
                          )}
                          <Button variant="outline" size="sm" className="rounded-full h-8 px-4 text-[10px] font-black" onClick={() => handleAddTokens(u.id)} disabled={!!processing}>+ TOKEN</Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className={cn("rounded-full h-8 px-4 text-[10px] font-black", u.status === 'suspended' ? 'bg-red-50 text-red-600 border-red-200' : '')} 
                            onClick={() => handleBannUser(u.id, u.status)} 
                            disabled={!!processing}
                          >
                            {u.status === 'suspended' ? 'SBLOCCA' : 'BAN / SOSPENDI'}
                          </Button>
                          <Button variant="outline" size="sm" className="rounded-full h-8 px-4 text-[10px] font-black" onClick={() => handleUpdateUserRole(u.id, u.role === 'worker' ? 'client' : 'worker')} disabled={!!processing}>RUOLO</Button>
                          <Button variant="ghost" size="sm" className="rounded-full h-8 px-2 text-red-600 hover:bg-red-50" onClick={() => handleDeleteUser(u.id)} disabled={!!processing}><Trash2 className="w-4 h-4" /></Button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'moderazione' && (
          <motion.div key="moderazione" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {jobsList.filter(j => j.status === 'open').map(job => (
               <div key={job.id} className="bg-white p-6 rounded-[2rem] border border-[#D2D2D7]/30 flex flex-col justify-between">
                  <div>
                    <h4 className="font-black text-lg mb-1 uppercase tracking-tight">{job.title}</h4>
                    <p className="text-xs font-bold text-[#86868B] line-clamp-2">{job.description}</p>
                  </div>
                  <div className="mt-6 flex gap-2">
                     <Button variant="outline" size="sm" className="rounded-full flex-1 border-red-100 text-red-600 font-black text-[10px]" onClick={() => handleDeleteJob(job.id)} disabled={processing === job.id}>
                        <Trash2 className="w-3 h-3 mr-2" /> CANCELLA
                     </Button>
                     <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-full flex-1 font-black text-[10px]"
                        onClick={() => handleViewJobDetails(job)}
                      >
                        <Filter className="w-3 h-3 mr-2" /> DETTAGLI
                     </Button>
                  </div>
               </div>
             ))}
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={!!selectedVerification} onOpenChange={() => setSelectedVerification(null)}>
        <DialogContent className="max-w-2xl bg-[#FBFBFD] border-none rounded-[3rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-[#1D1D1F]">Verifica Artigiano</DialogTitle>
          </DialogHeader>
          {selectedVerification && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[#86868B] font-bold block text-xs">Nome Utente</span>
                  <span className="font-black text-[#1D1D1F]">{selectedVerification.userName}</span>
                </div>
                <div>
                  <span className="text-[#86868B] font-bold block text-xs">Email</span>
                  <span className="font-black text-[#1D1D1F]">{selectedVerification.userEmail}</span>
                </div>
                <div>
                  <span className="text-[#86868B] font-bold block text-xs">Tipo Documento</span>
                  <span className="font-black text-[#1D1D1F] uppercase">{selectedVerification.documentType}</span>
                </div>
                <div>
                  <span className="text-[#86868B] font-bold block text-xs">Data Inviato</span>
                  <span className="font-black text-[#1D1D1F]">{selectedVerification.submittedAt?.toDate().toLocaleString()}</span>
                </div>
              </div>
              <div>
                 <span className="text-[#86868B] font-bold block text-xs mb-1">Note/Descrizione</span>
                 <p className="text-sm font-bold bg-[#F5F5F7] p-4 rounded-xl">{selectedVerification.description || 'Nessuna nota fornita.'}</p>
              </div>
              <div>
                 <span className="text-[#86868B] font-bold block text-xs mb-2">Documento Allegato</span>
                 <img src={selectedVerification.documentBase64} alt="Documento" className="w-full max-h-[400px] object-contain bg-[#F5F5F7] rounded-2xl border border-[#D2D2D7]/30" />
              </div>
              <div className="flex gap-4 pt-4 border-t border-[#D2D2D7]/30">
                 <Button 
                   variant="outline" 
                   className="flex-1 h-14 rounded-2xl border-red-200 text-red-600 hover:bg-red-50 font-black text-lg"
                   onClick={() => handleApproveVerification(selectedVerification.userId, false)}
                   disabled={!!processing}
                 >
                   RIFIUTA
                 </Button>
                 <Button 
                   className="flex-1 h-14 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black text-lg shadow-xl shadow-green-500/20"
                   onClick={() => handleApproveVerification(selectedVerification.userId, true)}
                   disabled={!!processing}
                 >
                   APPROVA
                 </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>


      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-2xl bg-white rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          {selectedJob && (
            <div className="flex flex-col">
              <div className="p-8 border-b border-[#D2D2D7]/30 bg-[#F5F5F7]/30">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight text-[#1D1D1F]">{selectedJob.title}</h3>
                    <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest">{selectedJob.category || 'Servizio Generale'}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-xs font-bold text-[#86868B]">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {selectedJob.location?.address || 'N/D'}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    Pubblicato: {selectedJob.createdAt?.toDate ? selectedJob.createdAt.toDate().toLocaleString() : 'N/D'}
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
                <section className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-[#86868B] tracking-widest px-1">Descrizione Analitica</h4>
                  <div className="bg-[#F5F5F7] p-6 rounded-3xl text-sm font-medium text-[#1D1D1F] leading-relaxed whitespace-pre-wrap">
                    {selectedJob.description}
                  </div>
                </section>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-[#D2D2D7]/30 p-6 rounded-3xl">
                    <h4 className="text-[10px] font-black uppercase text-[#86868B] tracking-widest mb-2">Budget Stime</h4>
                    <div className="text-2xl font-black text-[#1D1D1F]">€{selectedJob.budgetMin} - €{selectedJob.budgetMax}</div>
                  </div>
                  <div className="bg-white border border-[#D2D2D7]/30 p-6 rounded-3xl">
                    <h4 className="text-[10px] font-black uppercase text-[#86868B] tracking-widest mb-2">Costo Proposta</h4>
                    <div className="text-2xl font-black text-[#1D1D1F]">{selectedJob.tokenCost || 1} Token</div>
                  </div>
                </div>

                <section className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-[#86868B] tracking-widest px-1">Metadati Tecnici</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] font-bold text-[#86868B]">
                    <div className="flex justify-between p-3 bg-white border border-[#D2D2D7]/10 rounded-xl">
                      <span>JOB ID:</span>
                      <code className="text-blue-600 uppercase">{selectedJob.id}</code>
                    </div>
                    <div className="flex justify-between p-3 bg-white border border-[#D2D2D7]/10 rounded-xl">
                      <span>STATUS:</span>
                      <code className="text-green-600 uppercase font-black">{selectedJob.status}</code>
                    </div>
                  </div>
                </section>
              </div>

              <div className="p-6 bg-[#F5F5F7]/50 border-t border-[#D2D2D7]/30 flex justify-end gap-3">
                <Button variant="outline" className="rounded-full px-6 font-black text-xs h-12" onClick={() => setIsDetailsModalOpen(false)}>CHIUDI</Button>
                <Button className="rounded-full px-6 bg-red-600 hover:bg-red-700 text-white font-black text-xs h-12" onClick={() => {
                  handleDeleteJob(selectedJob.id);
                  setIsDetailsModalOpen(false);
                }}>
                  <Trash2 className="w-4 h-4 mr-2" /> ELIMINA LAVORO
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Target(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
