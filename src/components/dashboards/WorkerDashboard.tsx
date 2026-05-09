import React, { useState, useEffect } from 'react';
import { db, storage } from '../../firebase';
import { collection, query, where, onSnapshot, orderBy, doc, getDoc, updateDoc, setDoc, serverTimestamp, increment, limit, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Job, User, UserProfile } from '../../types';
import { cn } from '../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  Search, 
  MapPin, 
  Clock, 
  Briefcase, 
  CheckCircle2, 
  MessageSquare, 
  TrendingUp, 
  ChevronRight,
  Filter,
  DollarSign,
  Star,
  Activity,
  Zap,
  Target,
  Bell,
  ArrowRight,
  CreditCard,
  Shield,
  Camera,
  Trash2,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { JobProposalModal } from '../modals/JobProposalModal';
import { ChatModal } from '../modals/ChatModal';
import { JobDetailsSharedModal } from '../modals/JobDetailsSharedModal';
import { SERVICE_CATEGORIES } from '../../constants';

import { notifyNewMessage } from '../../lib/notifications';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';

import { WorkerVerificationPhase } from './WorkerVerificationPhase';

interface WorkerDashboardProps {
  user: User;
  activeTab: string;
}

export function WorkerDashboard({ user, activeTab }: WorkerDashboardProps) {
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobForProposal, setJobForProposal] = useState<Job | null>(null);
  const [workerProfile, setWorkerProfile] = useState<UserProfile | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [activeSubTab, setActiveSubTab] = useState(activeTab || 'home');

  useEffect(() => {
    setActiveSubTab(activeTab || 'home');
    
    const profileRef = doc(db, 'workerProfiles', user.id);
    const unsubProfile = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) {
        setWorkerProfile(docSnap.data() as UserProfile);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `workerProfiles/${user.id}`);
    });

    // Available jobs in categories the worker serves
    const qAvailable = query(
      collection(db, 'jobs'),
      where('status', '==', 'open')
    );

    const unsubAvailable = onSnapshot(qAvailable, (snapshot) => {
      let jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
      const now = new Date().getTime();
      jobs = jobs.filter(j => {
        const expiresTime = j.expiresAt instanceof Date ? j.expiresAt.getTime() : (j.expiresAt as any)?.seconds ? (j.expiresAt as any).seconds * 1000 : new Date(j.expiresAt || 0).getTime();
        return expiresTime > now;
      });
      jobs.sort((a, b) => {
        const dateA = a.expiresAt instanceof Date ? a.expiresAt.getTime() : (a.expiresAt as any)?.seconds ? (a.expiresAt as any).seconds * 1000 : new Date(a.expiresAt || 0).getTime();
        const dateB = b.expiresAt instanceof Date ? b.expiresAt.getTime() : (b.expiresAt as any)?.seconds ? (b.expiresAt as any).seconds * 1000 : new Date(b.expiresAt || 0).getTime();
        return dateB - dateA;
      });
      setAvailableJobs(jobs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'jobs');
      setLoading(false);
    });

    // Active jobs where worker is hired
    const qActive = query(
      collection(db, 'jobs'),
      where('assignedWorkerId', '==', user.id),
      where('status', 'in', ['in_progress', 'completed'])
    );

    // Process refunds for lost proposals automatically
    const processRefunds = async () => {
      try {
        const { writeBatch, getDocs } = await import('firebase/firestore');
        const rejectsQuery = query(
          collection(db, 'proposals'),
          where('workerId', '==', user.id),
          where('status', '==', 'rejected')
        );
        const rejectsSnap = await getDocs(rejectsQuery);
        
        let batch = writeBatch(db);
        let count = 0;
        let totalRefund = 0;
        
        for (const docSnap of rejectsSnap.docs) {
          const data = docSnap.data();
          if (data.refunded !== true) {
            batch.update(docSnap.ref, { refunded: true, updatedAt: serverTimestamp() });
            totalRefund += (data.tokenCostSpent || 5);
            count++;
          }
        }
        
        if (count > 0) {
          batch.update(doc(db, 'users', user.id), {
            tokens: increment(totalRefund)
          });
          await batch.commit();
          console.log(`Refunded ${totalRefund} tokens from ${count} lost proposals.`);
        }
      } catch(e) {
        console.error("Error processing refunds:", e);
      }
    };
    processRefunds();

    const unsubActive = onSnapshot(qActive, (snapshot) => {
      const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
      jobs.sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return dateB - dateA;
      });
      setActiveJobs(jobs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'jobs');
    });

    // Conversations listener
    const qConv = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.id),
      orderBy('lastUpdate', 'desc')
    );

    const unsubConv = onSnapshot(qConv, (snapshot) => {
      const convs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setConversations(convs);
    }, (error) => {
      console.warn("Worker conversations listener error:", error);
    });

    return () => {
      unsubProfile();
      unsubAvailable();
      unsubActive();
      unsubConv();
    };
  }, [user.id, activeTab]);

  const filteredJobs = availableJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         job.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || job.category === filterCategory;
    
    // Also filter by worker's categories if profile exists
    const servesCategory = !workerProfile?.categories || 
                           workerProfile.categories.length === 0 || 
                           workerProfile.categories.includes(job.category);

    return matchesSearch && matchesCategory && servesCategory;
  });

  const [chatJob, setChatJob] = useState<Job | null>(null);

  const handleStartChat = async (job: Job) => {
    try {
      // Find or create global job conversation
      const conversationId = job.id;
      
      const convRef = doc(db, 'conversations', conversationId);
      const convSnap = await getDoc(convRef);
      
      if (!convSnap.exists()) {
        await setDoc(convRef, {
          id: conversationId,
          jobId: job.id,
          jobTitle: job.title,
          lastUpdate: serverTimestamp(),
          createdAt: serverTimestamp(),
          isPublicContext: true
        });

        // Notify client that someone is asking for info
        await notifyNewMessage(
          job.clientId,
          user.nome || 'Un artigiano',
          job.id,
          job.title,
          'Ha aperto una chat condivisa per il tuo lavoro.'
        );
      }

      setChatJob(job);
    } catch (error) {
      console.error("Error starting chat:", error);
      alert("Errore nel caricamento della chat.");
    }
  };

  const [uploading, setUploading] = useState(false);

  const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `portfolios/${user.id}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      const profileRef = doc(db, 'workerProfiles', user.id);
      await updateDoc(profileRef, {
        portfolio: arrayUnion(downloadURL),
        updatedAt: serverTimestamp()
      });
      
      alert("Foto aggiunta al portfolio!");
    } catch (error) {
      console.error("Error uploading portfolio photo:", error);
      alert("Errore durante il caricamento.");
    } finally {
      setUploading(false);
    }
  };

  const removePortfolioPhoto = async (url: string) => {
    if (!confirm('Rimuovere questa foto dal portfolio?')) return;
    
    try {
      const profileRef = doc(db, 'workerProfiles', user.id);
      await updateDoc(profileRef, {
        portfolio: arrayRemove(url),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error removing photo:", error);
    }
  };

  const stats = [
    { label: 'Token Disponibili', value: user.tokens || 0, icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Interventi Attivi', value: activeJobs.filter(j => j.status === 'in_progress').length, icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Lavori Completati', value: activeJobs.filter(j => j.status === 'completed').length, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  const totalUnreadMessages = [...availableJobs, ...activeJobs].reduce((acc, job) => {
    return acc + (job.unreadMessagesCount?.[user.id] || 0);
  }, 0);

  const jobsWithMessages = [...availableJobs, ...activeJobs]
    .filter(job => (job.unreadMessagesCount?.[user.id] || 0) > 0)
    .sort((a, b) => {
      const unreadA = a.unreadMessagesCount?.[user.id] || 0;
      const unreadB = b.unreadMessagesCount?.[user.id] || 0;
      return unreadB - unreadA;
    });

  if (loading) return null;

  if (user.status === 'pending') {
    return <WorkerVerificationPhase user={user} />;
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-32 px-2 sm:px-0">
       {/* Hero Section Worker */}
       <section className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-white border border-[#D2D2D7]/30 shadow-sm">
          <div className="absolute top-0 right-0 p-4 sm:p-8">
            <div className="bg-green-50 px-2 sm:px-3 py-1 rounded-full border border-green-100 flex items-center gap-1 sm:gap-2">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-green-700">Comando Professionista</span>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl"
            >
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black tracking-tight text-[#1D1D1F] mb-3 sm:mb-4">
                {activeSubTab === 'home' && 'Area Lavoro'}
                {activeSubTab === 'history' && 'Storico Interventi'}
                {activeSubTab === 'jobs' && 'Trova Lavoro'}
                {activeSubTab === 'projects' && 'Lavori Attivi'}
                {activeSubTab === 'messages' && 'I Tuoi Messaggi'}
                {activeSubTab === 'profile' && 'Il Tuo Portfolio'}
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-[#86868B] font-bold mb-6 sm:mb-8">
                {activeSubTab === 'home' && 'Gestisci le tue proposte e trova nuove opportunità.'}
                {activeSubTab === 'history' && 'Visualizza lo storico dei tuoi interventi completati.'}
                {activeSubTab === 'jobs' && 'Esplora tutte le richieste disponibili sul territorio.'}
                {activeSubTab === 'projects' && 'Gestisci gli ordini in corso e comunica con i clienti.'}
                {activeSubTab === 'messages' && 'Rimani in contatto con i clienti e rispondi alle richieste di informazioni.'}
                {activeSubTab === 'profile' && 'Carica foto dei tuoi lavori passati per ottenere la tua prima valutazione.'}
              </p>
              
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'home', label: 'Dashboard', icon: Target },
                  { id: 'jobs', label: 'Trova Lavoro', icon: Search, badge: availableJobs.reduce((acc, job) => acc + (job.unreadMessagesCount?.[user.id] || 0), 0) },
                  { id: 'projects', label: 'In Corso', icon: CheckCircle2, badge: activeJobs.reduce((acc, job) => acc + (job.unreadMessagesCount?.[user.id] || 0), 0) },
                  { id: 'messages', label: 'Messaggi', icon: MessageSquare, badge: totalUnreadMessages },
                  { id: 'history', label: 'Storico', icon: Briefcase },
                  { id: 'profile', label: 'Portfolio', icon: Briefcase },
                ].map(tab => (
                  <Button
                    key={tab.id}
                    onClick={() => setActiveSubTab(tab.id)}
                    variant={activeSubTab === tab.id ? 'default' : 'ghost'}
                    className={cn(
                      "rounded-full h-9 sm:h-11 px-4 sm:px-6 font-black text-[11px] sm:text-sm relative",
                      activeSubTab === tab.id ? "bg-[#1D1D1F] text-white" : "text-[#86868B] hover:bg-[#F5F5F7]"
                    )}
                  >
                    <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    <span className="hidden xs:inline">{tab.label}</span>
                    <span className="inline xs:hidden">{tab.label.split(' ')[0]}</span>
                    {(tab as any).badge > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] sm:text-[10px] w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border-2 border-white ring-2 ring-red-500/20">
                        {(tab as any).badge}
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 border-t border-[#D2D2D7]/30 divide-y sm:divide-y-0 sm:divide-x divide-[#D2D2D7]/30">
            {stats.map((stat, i) => (
              <div key={i} className="p-4 sm:p-6 flex items-center gap-4 hover:bg-[#F5F5F7]/30 transition-colors">
                <div className={cn("p-2.5 sm:p-3 rounded-xl sm:rounded-2xl", stat.bg)}>
                  <stat.icon className={cn("w-5 h-5 sm:w-6 sm:h-6", stat.color)} />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[#1D1D1F] tracking-tight">{stat.value}</div>
                  <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#86868B]">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Real-time Ticker for Worker */}
          <div className="bg-[#1D1D1F] py-3 overflow-hidden border-t border-white/10">
            <div className="flex animate-infinite-scroll whitespace-nowrap">
              <div className="flex items-center gap-12 px-4 font-black">
                {availableJobs.length > 0 ? (
                  [...availableJobs, ...availableJobs].slice(0, 10).map((job, idx) => (
                    <button 
                      key={`${job.id}-${idx}`} 
                      onClick={() => setSelectedJob(job)}
                      className={cn(
                        "flex items-center gap-4 font-bold text-sm transition-all group shrink-0",
                        job.publicationPlan === 'premium' ? "text-yellow-400" : "text-white hover:text-blue-400"
                      )}
                    >
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full animate-pulse",
                        job.publicationPlan === 'premium' 
                          ? "bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]" 
                          : "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                      )} />
                      <span className="opacity-40 uppercase tracking-tighter text-[10px]">
                        {job.publicationPlan === 'premium' ? 'Richiesta Sponsorizzata' : 'Nuova Richiesta'}
                      </span>
                      {job.title}
                      <span className={cn(
                        "text-xs font-black",
                        job.publicationPlan === 'premium' ? "text-white" : "text-blue-400"
                      )}>€{job.budgetMin}-{job.budgetMax}</span>
                      <span className={cn(
                        "text-[9px] px-2 py-0.5 rounded border capitalize",
                        job.publicationPlan === 'premium' 
                          ? "bg-yellow-400/20 border-yellow-400/30 text-yellow-100" 
                          : "bg-white/5 border-white/10 text-white/50"
                      )}>
                        {SERVICE_CATEGORIES.find(c => c.id === job.category)?.label || job.category}
                      </span>
                    </button>
                  ))
                ) : (
                  [1, 2, 3].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 text-white/30 text-xs font-bold uppercase tracking-widest py-1">
                      Monitoraggio nuove richieste in tempo reale...
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
       </section>

       <AnimatePresence mode="wait">
         {activeSubTab === 'home' && (
           <motion.div
             key="home"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
             className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8"
           >
              {/* Active Work Panel */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                {/* Nuovi Messaggi Alert */}
                {jobsWithMessages.length > 0 && (
                  <div className="bg-blue-600 p-6 rounded-[2rem] sm:rounded-[2.5rem] text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                        <MessageSquare className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <h3 className="text-xl font-black mb-1">Hai {totalUnreadMessages} nuovi messaggi</h3>
                        <p className="text-blue-100/80 font-bold text-sm">I clienti ti hanno risposto. Rispondi subito per non perdere l'opportunità.</p>
                      </div>
                      <div className="flex flex-col gap-2 w-full md:w-auto">
                        {jobsWithMessages.slice(0, 2).map(job => (
                          <Button 
                            key={job.id}
                            onClick={() => handleStartChat(job)}
                            variant="secondary"
                            className="bg-white text-blue-600 hover:bg-white/90 rounded-full h-10 px-6 font-black text-[10px] uppercase tracking-widest"
                          >
                            Chat: {job.title.substring(0, 15)}...
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  </div>
                )}

                {/* Lavoro Occasionale Banner */}
                <div className="bg-[#FBFBFD] border border-blue-200 p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] flex flex-col sm:flex-row gap-5 sm:gap-6 items-start sm:items-center relative overflow-hidden">
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0 relative z-10">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 relative z-10">
                    <h3 className="font-black text-[#1D1D1F] text-lg leading-tight">Prestazioni Occasionali</h3>
                    <p className="text-[11px] sm:text-xs font-bold text-[#86868B] mt-1 leading-relaxed">
                      Sei un privato senza Partita IVA? La legge consente le <strong>prestazioni di lavoro autonomo occasionale</strong> entro il limite di 5.000€ netti annui. 
                      Puoi usare tranquillamente la piattaforma per eseguire piccoli lavoretti. Accordati col cliente sul non superamento di tale soglia o sull'emissione di notula.
                    </p>
                  </div>
                  <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-blue-50 rounded-full blur-2xl" />
                </div>

                <div className="flex items-center justify-between px-2">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#1D1D1F]">Interventi in Corso</h2>
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                    {activeJobs.length} Attivi
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {activeJobs.map(job => (
                    <Card key={job.id} className="rounded-[1.5rem] sm:rounded-3xl hover:shadow-xl transition-shadow border-[#D2D2D7]/30 overflow-hidden group">
                      <CardContent className="p-5 sm:p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                              <CardTitle className="text-base sm:text-lg font-black group-hover:text-blue-600 transition-colors">{job.title}</CardTitle>
                            </div>
                            <p className="text-[11px] sm:text-xs text-[#86868B] font-bold line-clamp-1">{job.description}</p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="default" 
                            className="rounded-full h-8 sm:h-9 px-4 sm:px-5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-[#1D1D1F] hover:bg-black text-white shadow-lg shrink-0"
                          >
                            Dettagli <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-1" />
                          </Button>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pt-4 border-t border-[#D2D2D7]/20">
                          <div className="flex items-center gap-6 w-full sm:w-auto">
                            <div className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleStartChat(job)}>
                              <MessageSquare className="w-4 h-4 text-blue-500" />
                              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Chat Condivisa</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-green-500" />
                              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Pattuito: €{job.assignedPrice || job.budgetMin}</span>
                            </div>
                          </div>
                          <Button 
                            onClick={async (e) => {
                              e.stopPropagation();
                              if(confirm('Sei sicuro di aver terminato il lavoro? Questo notificherà il cliente che potrà lasciarti una recensione.')) {
                                try {
                                  await updateDoc(doc(db, 'jobs', job.id), { status: 'completed', updatedAt: serverTimestamp() });
                                  alert('Job segnato come completato!');
                                } catch (e) {
                                  console.error(e);
                                  alert('Errore.');
                                }
                              }
                            }}
                            className="w-full sm:w-auto h-10 sm:h-11 px-6 rounded-xl bg-green-600 hover:bg-green-700 text-white font-black text-[10px] sm:text-[11px] uppercase tracking-widest ml-auto shadow-lg shadow-green-600/20 border-none transition-all"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Segna Completato
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {activeJobs.length === 0 && (
                    <div className="py-8 sm:py-12 border-2 border-dashed border-[#D2D2D7]/30 rounded-[1.5rem] sm:rounded-3xl flex flex-col items-center justify-center text-center space-y-3 opacity-50">
                      <Activity className="w-8 h-8 text-[#86868B]" />
                      <span className="text-xs sm:text-sm font-bold text-[#86868B]">Ancora nessun intervento confermato.</span>
                    </div>
                  )}
                </div>

                {/* Ingress for Search Tab */}
                <div className="bg-[#1D1D1F] p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] text-white flex flex-col md:flex-row items-center gap-6 sm:gap-8 shadow-2xl relative overflow-hidden group">
                   <div className="flex-1 space-y-3 sm:space-y-4 relative z-10 text-center md:text-left">
                     <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">Trova il tuo prossimo incarico redditizio.</h2>
                     <p className="text-[#86868B] font-bold text-xs sm:text-sm">Usa i filtri avanzati per trovare i lavori più vicini a te e in linea con le tue competenze.</p>
                     <Button 
                        onClick={() => setActiveSubTab('jobs')}
                        className="rounded-full bg-white text-[#1D1D1F] hover:bg-white/90 h-10 sm:h-12 px-6 sm:px-8 font-black flex items-center gap-2 group mx-auto md:mx-0"
                     >
                       Inizia Ricerca <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                     </Button>
                   </div>
                   <div className="w-full md:w-32 lg:w-48 h-32 lg:h-48 bg-white/5 rounded-2xl sm:rounded-3xl border border-white/10 flex items-center justify-center relative z-10 overflow-hidden shrink-0">
                     <Briefcase className="w-12 lg:w-16 h-12 lg:h-16 text-white/20 group-hover:scale-110 transition-transform" />
                   </div>
                   <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />
                </div>
              </div>

              {/* New Opportunities Panel (Quick View) */}
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-lg sm:text-xl font-black tracking-tight text-[#1D1D1F]">Nuove Richieste</h2>
                  <Button variant="ghost" onClick={() => setActiveSubTab('jobs')} className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-blue-600">Altro</Button>
                </div>
                
                <div className="space-y-3 sm:space-y-4">
                  {filteredJobs.slice(0, 5).map(job => (
                    <Card 
                      key={job.id} 
                      className={cn(
                        "rounded-xl sm:rounded-2xl border-[#D2D2D7]/30 hover:shadow-lg transition-all cursor-pointer",
                        job.publicationPlan === 'premium' && "bg-gradient-to-br from-yellow-50 to-white border-yellow-200"
                      )}
                      onClick={() => setSelectedJob(job)}
                    >
                      <CardContent className="p-4 sm:p-5 space-y-2 sm:space-y-3">
                        <div className="flex items-center justify-between">
                           <span className={cn(
                             "text-[8px] sm:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                             job.publicationPlan === 'premium' ? "bg-yellow-200 text-yellow-800" : "bg-[#F5F5F7] text-[#86868B]"
                           )}>
                             {SERVICE_CATEGORIES.find(c => c.id === job.category)?.label || job.category}
                           </span>
                           {job.publicationPlan === 'premium' && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                        </div>
                        <h3 className="font-black text-[#1D1D1F] tracking-tight text-sm sm:text-base leading-snug">{job.title}</h3>
                        <div className="flex items-center justify-between text-[#86868B]">
                          <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold">
                            <MapPin className="w-3 h-3" />
                            {job.location?.address?.split(',')[0]}
                          </div>
                          <div className="text-xs font-black text-[#1D1D1F]">
                            €{job.budgetMin}-{job.budgetMax}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
           </motion.div>
         )}

         {activeSubTab === 'jobs' && (
            <motion.div
              key="jobs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 sm:space-y-8"
            >
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B]" />
                  <Input 
                    placeholder="Cerca lavori..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 rounded-2xl bg-white border-[#D2D2D7]/50 font-bold"
                  />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                   <select 
                     value={filterCategory}
                     onChange={e => setFilterCategory(e.target.value)}
                     className="h-12 rounded-2xl bg-white border border-[#D2D2D7]/50 font-bold px-4 appearance-none outline-none focus:ring-1 focus:ring-blue-500/20 grow"
                   >
                     <option value="all">Tutte le Categorie</option>
                     {SERVICE_CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                   </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredJobs.map(job => (
                    <Card 
                      key={job.id} 
                      className={cn(
                        "rounded-[1.5rem] sm:rounded-[2rem] border-[#D2D2D7]/30 hover:shadow-2xl transition-all cursor-pointer group flex flex-col overflow-hidden",
                        job.publicationPlan === 'premium' ? "bg-gradient-to-br from-yellow-50 to-white ring-1 ring-yellow-400/20" : "bg-white"
                      )}
                      onClick={async () => {
                        // Reset notification flags for the worker
                        if ((job.unreadMessagesCount?.[user.id] || 0) > 0) {
                          await updateDoc(doc(db, 'jobs', job.id), {
                            [`unreadMessagesCount.${user.id}`]: 0
                          });
                        }
                        setSelectedJob(job);
                      }}
                    >
                      <div className="p-5 sm:p-6 flex-1 space-y-4">
                        <div className="flex items-center justify-between gap-2 overflow-hidden">
                           <div className={cn(
                             "px-2 sm:px-3 py-1 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest truncate shrink",
                             job.publicationPlan === 'premium' ? "bg-yellow-200 text-yellow-800" : "bg-[#F5F5F7] text-[#86868B]"
                           )}>
                             {SERVICE_CATEGORIES.find(c => c.id === job.category)?.label}
                           </div>
                           <div className="flex items-center gap-2 shrink-0">
                             {(job.unreadMessagesCount?.[user.id] || 0) > 0 && (
                               <div className="bg-blue-600 text-white text-[8px] sm:text-[9px] font-black px-1.5 sm:px-2 py-0.5 rounded-full animate-bounce">
                                 {job.unreadMessagesCount![user.id]} MSG
                               </div>
                             )}
                             <div className="flex items-center gap-1 text-[8px] sm:text-[10px] font-bold text-[#86868B]">
                               <Clock className="w-3 h-3" />
                               {job.createdAt?.seconds ? new Date(job.createdAt.seconds * 1000).toLocaleDateString() : 'Oggi'}
                             </div>
                           </div>
                        </div>

                      <h3 className="text-base sm:text-xl font-black text-[#1D1D1F] tracking-tight group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">{job.title}</h3>
                      <p className="text-[11px] sm:text-sm text-[#86868B] font-bold line-clamp-3 mb-4">{job.description}</p>

                      <div className="flex items-center gap-3 sm:gap-4 text-[#86868B] text-[10px] sm:text-xs font-bold">
                        <div className="flex items-center gap-1 overflow-hidden">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{job.location?.address?.split(',')[0]}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                           <Target className="w-3.5 h-3.5" />
                           {job.proposalCount || 0} Proposte
                        </div>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6 bg-[#F5F5F7]/50 border-t border-[#D2D2D7]/20 flex items-center justify-between gap-4">
                       <div className="text-base sm:text-lg font-black text-[#1D1D1F] shrink-0">
                         €{job.budgetMin}-{job.budgetMax}
                       </div>
                        <Button size="sm" className="rounded-full bg-blue-600 text-white hover:bg-blue-700 font-black text-[10px] sm:text-[11px] uppercase tracking-widest h-9 sm:h-10 px-6 sm:px-8 group/btn shadow-lg shadow-blue-600/20 transition-all flex-1 sm:flex-none">
                          Dettagli <ArrowRight className="w-3.5 h-3.5 ml-1 md:ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                  </Card>
                ))}
                {filteredJobs.length === 0 && (
                  <div className="col-span-full py-20 text-center opacity-50 bg-gray-50 rounded-[2rem] border border-dashed border-gray-300">
                    <p className="text-xs uppercase tracking-widest font-black">Nessun lavoro trovato</p>
                  </div>
                )}
              </div>
            </motion.div>
         )}

         {activeSubTab === 'messages' && (
            <motion.div
              key="messages"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 sm:space-y-6"
            >
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {conversations.length > 0 ? (
                  conversations.map(conv => {
                    const job = [...availableJobs, ...activeJobs].find(j => j.id === conv.jobId);
                    const unread = job?.unreadMessagesCount?.[user.id] || 0;
                    
                    return (
                      <Card 
                        key={conv.id} 
                        className={cn(
                          "rounded-[1.5rem] sm:rounded-[2rem] border-[#D2D2D7]/30 hover:shadow-xl transition-all cursor-pointer group",
                          unread > 0 ? "bg-blue-50/30 border-blue-200" : "bg-white"
                        )}
                        onClick={() => {
                          if (job) handleStartChat(job);
                          else alert("Dettagli lavoro non trovati.");
                        }}
                      >
                        <CardContent className="p-4 sm:p-6 flex items-center gap-4 sm:gap-6">
                           <div className={cn(
                             "w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0",
                             unread > 0 ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
                           )}>
                             <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <h3 className="font-black text-[#1D1D1F] truncate group-hover:text-blue-600 transition-colors text-sm sm:text-base">
                                  {conv.jobTitle || 'Chat Lavoro'}
                                </h3>
                                <span className="text-[9px] sm:text-[10px] font-bold text-[#86868B] shrink-0">
                                  {conv.lastUpdate?.seconds ? new Date(conv.lastUpdate.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Adesso'}
                                </span>
                              </div>
                              <p className="text-[11px] sm:text-sm font-medium text-[#86868B] line-clamp-1 italic">
                                {conv.lastMessage || 'Inizia la conversazione...'}
                              </p>
                           </div>
                           {unread > 0 && (
                             <div className="bg-blue-600 text-white text-[9px] sm:text-[10px] font-black w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                               {unread}
                             </div>
                           )}
                           <ChevronRight className="w-5 h-5 text-[#D2D2D7] group-hover:text-blue-600 transition-colors shrink-0" />
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 opacity-50 bg-white rounded-[2rem] border border-dashed border-[#D2D2D7]">
                    <MessageSquare className="w-12 h-12 text-[#86868B]" />
                    <div>
                      <h3 className="text-lg font-black text-[#1D1D1F]">Nessun messaggio</h3>
                      <p className="text-sm font-bold text-[#86868B]">Le tue conversazioni con i clienti appariranno qui.</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

         {activeSubTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 sm:space-y-8"
            >
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#1D1D1F]">Storico Interventi</h2>
                <span className="text-[10px] sm:text-sm font-bold text-[#86868B] uppercase tracking-widest">
                  {activeJobs.filter(j => j.status === 'completed').length} Completati
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                 {activeJobs.filter(j => j.status === 'completed').map(job => (
                   <Card key={job.id} className="rounded-[1.5rem] sm:rounded-[2rem] bg-white border border-[#D2D2D7]/30">
                      <CardHeader className="flex-col items-start justify-between space-y-0 pb-2 gap-2">
                        <div className="space-y-1 w-full">
                          <CardTitle className="text-base sm:text-xl font-black">{job.title}</CardTitle>
                          <p className="text-[10px] sm:text-xs font-bold text-[#86868B] flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 shrink-0" /> {job.location?.address}
                          </p>
                        </div>
                        <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest border border-green-200">
                          Completato
                        </span>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between pt-4 border-t border-[#D2D2D7]/20">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-3.5 h-3.5 text-green-500" />
                            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Pattuito: €{job.assignedPrice || job.budgetMin}</span>
                          </div>
                          {job.reviewId && (
                            <div className="flex items-center gap-1 sm:gap-2 text-yellow-600 shrink-0">
                               <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                               <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Recensito</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                   </Card>
                 ))}
                 {activeJobs.filter(j => j.status === 'completed').length === 0 && (
                   <div className="col-span-full py-12 flex flex-col items-center justify-center text-center opacity-50 space-y-2 border-2 border-dashed border-[#D2D2D7]/30 rounded-3xl bg-[#F5F5F7]">
                     <CheckCircle2 className="w-8 h-8 text-[#86868B]" />
                     <p className="text-xs sm:text-sm font-bold text-[#86868B]">Ancora nessun intervento completato.<br/>I tuoi lavori terminati appariranno qui.</p>
                   </div>
                 )}
              </div>
            </motion.div>
          )}
          {activeSubTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8"
            >
              <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-[2rem] sm:rounded-[3rem] border border-[#D2D2D7]/30 shadow-sm">
                 <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                     <Briefcase className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
                   </div>
                   <div>
                     <h3 className="text-xl sm:text-2xl font-black text-[#1D1D1F]">Il Tuo Portfolio</h3>
                     <p className="text-[10px] sm:text-sm font-bold text-[#86868B]">Carica le foto dei tuoi lavori migliori</p>
                   </div>
                 </div>

                 <div className="space-y-6">
                   <div className="p-4 sm:p-6 bg-[#FBFBFD] border border-blue-50 rounded-2xl sm:rounded-3xl">
                      <p className="text-[11px] sm:text-sm font-bold text-[#1D1D1F] leading-relaxed">
                        I professionisti con portfolio completo ricevono il 70% in più di proposte dai clienti. Carica foto di alta qualità del tuo lavoro.
                      </p>
                   </div>

                   <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-[#86868B]">Gallery ({workerProfile?.portfolio?.length || 0} Foto)</label>
                     
                     <div className="grid grid-cols-2 gap-3 sm:gap-4">
                       {workerProfile?.portfolio?.map((url, i) => (
                         <div key={i} className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden group border border-[#D2D2D7]/30 bg-[#F5F5F7]">
                           <img src={url} className="w-full h-full object-cover" alt="Portfolio" />
                           <button 
                             onClick={() => removePortfolioPhoto(url)}
                             className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full text-red-500 shadow-lg sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                           >
                             <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                           </button>
                         </div>
                       ))}
                       
                       <label className="aspect-video rounded-xl sm:rounded-2xl border-2 border-dashed border-[#D2D2D7] hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-1 sm:gap-2 cursor-pointer group p-2 text-center">
                         <input 
                           type="file" 
                           accept="image/*" 
                           className="hidden" 
                           onChange={handlePortfolioUpload}
                           disabled={uploading}
                         />
                         {uploading ? (
                           <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 animate-spin" />
                         ) : (
                           <>
                             <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-[#86868B] group-hover:text-blue-600 transition-colors" />
                             <span className="text-[9px] font-black text-[#86868B] uppercase tracking-widest group-hover:text-blue-600 transition-colors leading-tight">Aggiungi Foto</span>
                           </>
                         )}
                       </label>
                     </div>
                   </div>

                   <Button 
                     className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-[#1D1D1F] hover:bg-black text-white font-black text-base sm:text-lg shadow-xl shadow-black/10"
                     onClick={() => alert("Richiesta inviata! Un operatore verificherà il tuo portfolio entro 24-48 ore.")}
                     disabled={!workerProfile?.portfolio || workerProfile.portfolio.length === 0}
                   >
                      Richiedi Verifica Portfolio
                   </Button>
                 </div>
              </div>

              <div className="bg-[#1D1D1F] text-white p-6 sm:p-8 lg:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-xl">
                 <h3 className="text-xl sm:text-2xl font-black mb-6 flex items-center gap-3">
                   <Star className="text-yellow-400 fill-yellow-400 w-6 h-6" /> 
                   Guida al Successo
                 </h3>
                 <div className="space-y-6">
                   <div className="flex gap-4">
                     <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center shrink-0 font-black text-sm">1</div>
                     <div>
                       <h4 className="font-black text-base sm:text-lg">Carica i tuoi lavori migliori</h4>
                       <p className="text-[11px] sm:text-sm text-white/70 font-bold mt-1">Scegli foto nitide e ben illuminate dei tuoi interventi passati.</p>
                     </div>
                   </div>
                   <div className="flex gap-4">
                     <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center shrink-0 font-black text-sm">2</div>
                     <div>
                       <h4 className="font-black text-base sm:text-lg">Verifica dal Team</h4>
                       <p className="text-[11px] sm:text-sm text-white/70 font-bold mt-1">Il nostro team assegna "Stellette Iniziali" basate sul tuo portfolio.</p>
                     </div>
                   </div>
                   <div className="flex gap-4">
                     <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center shrink-0 font-black text-sm">3</div>
                     <div>
                       <h4 className="font-black text-base sm:text-lg">Fiducia dei Clienti</h4>
                       <p className="text-[11px] sm:text-sm text-white/70 font-bold mt-1">Un profilo certificato attira clienti di alta qualità pronti a pagare il giusto prezzo.</p>
                     </div>
                   </div>
                 </div>
              </div>
            </motion.div>
          )}
       </AnimatePresence>

       {selectedJob && (
         <JobDetailsSharedModal
           isOpen={!!selectedJob}
           onClose={() => setSelectedJob(null)}
           job={selectedJob}
           user={user}
           onOpenProposal={() => setJobForProposal(selectedJob)}
           onStartChat={handleStartChat}
         />
       )}

       {jobForProposal && (
         <JobProposalModal
           isOpen={!!jobForProposal}
           onClose={() => setJobForProposal(null)}
           job={jobForProposal}
           workerId={user.id}
           workerTokens={user.tokens || 0}
         />
       )}

       {chatJob && (
         <ChatModal 
           user={user} 
           job={chatJob} 
           onClose={() => setChatJob(null)} 
         />
       )}
    </div>
  );
}
