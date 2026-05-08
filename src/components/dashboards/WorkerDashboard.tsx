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

    return () => {
      unsubProfile();
      unsubAvailable();
      unsubActive();
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

  if (loading) return null;

  if (user.status === 'pending') {
    return <WorkerVerificationPhase user={user} />;
  }

  return (
    <div className="space-y-8 pb-32">
       {/* Hero Section Worker */}
       <section className="relative overflow-hidden rounded-[2.5rem] bg-white border border-[#D2D2D7]/30 shadow-sm">
          <div className="absolute top-0 right-0 p-8">
            <div className="bg-green-50 px-3 py-1 rounded-full border border-green-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-green-700">Comando Professionista</span>
            </div>
          </div>

          <div className="p-8 lg:p-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl"
            >
              <h1 className="text-4xl lg:text-6xl font-black tracking-tight text-[#1D1D1F] mb-4">
                {activeSubTab === 'home' && 'Area Lavoro'}
                {activeSubTab === 'history' && 'Storico Interventi'}
                {activeSubTab === 'jobs' && 'Trova Lavoro'}
                {activeSubTab === 'projects' && 'Lavori Attivi'}
                {activeSubTab === 'profile' && 'Il Tuo Portfolio'}
              </h1>
              <p className="text-lg lg:text-xl text-[#86868B] font-bold mb-8">
                {activeSubTab === 'home' && 'Gestisci le tue proposte e trova nuove opportunità.'}
                {activeSubTab === 'history' && 'Visualizza lo storico dei tuoi interventi completati.'}
                {activeSubTab === 'jobs' && 'Esplora tutte le richieste disponibili sul territorio.'}
                {activeSubTab === 'projects' && 'Gestisci gli ordini in corso e comunica con i clienti.'}
                {activeSubTab === 'profile' && 'Carica foto dei tuoi lavori passati per ottenere la tua prima valutazione.'}
              </p>
              
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'home', label: 'Dashboard', icon: Target },
                  { id: 'jobs', label: 'Trova Lavoro', icon: Search },
                  { id: 'projects', label: 'In Corso', icon: CheckCircle2 },
                  { id: 'history', label: 'Storico', icon: Briefcase },
                  { id: 'profile', label: 'Portfolio', icon: Briefcase },
                ].map(tab => (
                  <Button
                    key={tab.id}
                    onClick={() => setActiveSubTab(tab.id)}
                    variant={activeSubTab === tab.id ? 'default' : 'ghost'}
                    className={cn(
                      "rounded-full h-11 px-6 font-black text-sm",
                      activeSubTab === tab.id ? "bg-[#1D1D1F] text-white" : "text-[#86868B] hover:bg-[#F5F5F7]"
                    )}
                  >
                    <tab.icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </Button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 border-t border-[#D2D2D7]/30 divide-y md:divide-y-0 md:divide-x divide-[#D2D2D7]/30">
            {stats.map((stat, i) => (
              <div key={i} className="p-6 flex items-center gap-4 hover:bg-[#F5F5F7]/30 transition-colors">
                <div className={cn("p-3 rounded-2xl", stat.bg)}>
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
                <div>
                  <div className="text-2xl font-black text-[#1D1D1F] tracking-tight">{stat.value}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#86868B]">{stat.label}</div>
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
             className="grid grid-cols-1 lg:grid-cols-3 gap-8"
           >
              {/* Active Work Panel */}
              <div className="lg:col-span-2 space-y-6">
                {/* Lavoro Occasionale Banner */}
                <div className="bg-[#FBFBFD] border border-blue-200 p-6 rounded-[2rem] flex flex-col sm:flex-row gap-6 items-start sm:items-center relative overflow-hidden">
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0 relative z-10">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 relative z-10">
                    <h3 className="font-black text-[#1D1D1F] text-lg leading-tight">Prestazioni Occasionali</h3>
                    <p className="text-sm font-bold text-[#86868B] mt-1 leading-relaxed">
                      Sei un privato senza Partita IVA? La legge consente le <strong>prestazioni di lavoro autonomo occasionale</strong> entro il limite di 5.000€ netti annui. 
                      Puoi usare tranquillamente la piattaforma per eseguire piccoli lavoretti. Accordati col cliente sul non superamento di tale soglia o sull'emissione di notula.
                    </p>
                  </div>
                  <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-blue-50 rounded-full blur-2xl" />
                </div>

                <div className="flex items-center justify-between px-2">
                  <h2 className="text-2xl font-black tracking-tight text-[#1D1D1F]">Interventi in Corso</h2>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                    {activeJobs.length} Attivi
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {activeJobs.map(job => (
                    <Card key={job.id} className="rounded-3xl hover:shadow-xl transition-shadow border-[#D2D2D7]/30 overflow-hidden group">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                              <CardTitle className="text-lg font-black group-hover:text-blue-600 transition-colors">{job.title}</CardTitle>
                            </div>
                            <p className="text-xs text-[#86868B] font-bold line-clamp-1">{job.description}</p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="default" 
                            className="rounded-full h-9 px-5 text-[10px] font-black uppercase tracking-widest bg-[#1D1D1F] hover:bg-black text-white shadow-lg"
                          >
                            Dettagli <ChevronRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pt-4 border-t border-[#D2D2D7]/20">
                          <div className="flex items-center gap-6 w-full sm:w-auto">
                            <div className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleStartChat(job)}>
                              <MessageSquare className="w-4 h-4 text-blue-500" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Chat Condivisa</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-green-500" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Pattuito: €{job.assignedPrice || job.budgetMin}</span>
                            </div>
                          </div>
                          <Button 
                            onClick={async () => {
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
                            className="w-full sm:w-auto h-11 px-6 rounded-xl bg-green-600 hover:bg-green-700 text-white font-black text-[11px] uppercase tracking-widest ml-auto shadow-lg shadow-green-600/20 border-none transition-all"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Segna Completato
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {activeJobs.length === 0 && (
                    <div className="py-12 border-2 border-dashed border-[#D2D2D7]/30 rounded-3xl flex flex-col items-center justify-center text-center space-y-3 opacity-50">
                      <Activity className="w-8 h-8 text-[#86868B]" />
                      <span className="text-sm font-bold text-[#86868B]">Ancora nessun intervento confermato.</span>
                    </div>
                  )}
                </div>

                {/* Ingress for Search Tab */}
                <div className="bg-[#1D1D1F] p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden group">
                   <div className="flex-1 space-y-4 relative z-10">
                     <h2 className="text-3xl font-black tracking-tight leading-tight">Trova il tuo prossimo incarico redditizio.</h2>
                     <p className="text-[#86868B] font-bold">Usa i filtri avanzati per trovare i lavori più vicini a te e in linea con le tue competenze.</p>
                     <Button 
                        onClick={() => setActiveSubTab('jobs')}
                        className="rounded-full bg-white text-[#1D1D1F] hover:bg-white/90 h-12 px-8 font-black flex items-center gap-2 group"
                     >
                       Inizia Ricerca <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                     </Button>
                   </div>
                   <div className="w-full md:w-48 h-48 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center relative z-10">
                     <Briefcase className="w-16 h-16 text-white/20 group-hover:scale-110 transition-transform" />
                   </div>
                   <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />
                </div>
              </div>

              {/* New Opportunities Panel (Quick View) */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-xl font-black tracking-tight text-[#1D1D1F]">Nuove Richieste</h2>
                  <Button variant="ghost" onClick={() => setActiveSubTab('jobs')} className="text-[10px] font-black uppercase tracking-widest text-blue-600">Altro</Button>
                </div>
                
                <div className="space-y-4">
                  {filteredJobs.slice(0, 5).map(job => (
                    <Card 
                      key={job.id} 
                      className={cn(
                        "rounded-2xl border-[#D2D2D7]/30 hover:shadow-lg transition-all cursor-pointer",
                        job.publicationPlan === 'premium' && "bg-gradient-to-br from-yellow-50 to-white border-yellow-200"
                      )}
                      onClick={() => setSelectedJob(job)}
                    >
                      <CardContent className="p-5 space-y-3">
                        <div className="flex items-center justify-between">
                           <span className={cn(
                             "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                             job.publicationPlan === 'premium' ? "bg-yellow-200 text-yellow-800" : "bg-[#F5F5F7] text-[#86868B]"
                           )}>
                             {SERVICE_CATEGORIES.find(c => c.id === job.category)?.label || job.category}
                           </span>
                           {job.publicationPlan === 'premium' && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                        </div>
                        <h3 className="font-black text-[#1D1D1F] tracking-tight">{job.title}</h3>
                        <div className="flex items-center justify-between text-[#86868B]">
                          <div className="flex items-center gap-1 text-[10px] font-bold">
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
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B]" />
                  <Input 
                    placeholder="Cerca lavori..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 rounded-2xl bg-white border-[#D2D2D7]/50 font-bold"
                  />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                   <select 
                     value={filterCategory}
                     onChange={e => setFilterCategory(e.target.value)}
                     className="h-12 rounded-2xl bg-white border border-[#D2D2D7]/50 font-bold px-4 appearance-none outline-none focus:ring-1 focus:ring-blue-500/20"
                   >
                     <option value="all">Tutte le Categorie</option>
                     {SERVICE_CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                   </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map(job => (
                    <Card 
                      key={job.id} 
                      className={cn(
                        "rounded-[2rem] border-[#D2D2D7]/30 hover:shadow-2xl transition-all cursor-pointer group flex flex-col overflow-hidden",
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
                      <div className="p-6 flex-1 space-y-4">
                        <div className="flex items-center justify-between">
                           <div className={cn(
                             "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                             job.publicationPlan === 'premium' ? "bg-yellow-200 text-yellow-800" : "bg-[#F5F5F7] text-[#86868B]"
                           )}>
                             {SERVICE_CATEGORIES.find(c => c.id === job.category)?.label}
                           </div>
                           {(job.unreadMessagesCount?.[user.id] || 0) > 0 && (
                             <div className="bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-bounce shadow-lg shadow-blue-500/20">
                               {job.unreadMessagesCount![user.id]} MESSAGGI
                             </div>
                           )}
                           <div className="flex items-center gap-1 text-[10px] font-bold text-[#86868B]">
                             <Clock className="w-3 h-3" />
                             {job.createdAt?.seconds ? new Date(job.createdAt.seconds * 1000).toLocaleDateString() : 'Oggi'}
                           </div>
                        </div>

                      <h3 className="text-xl font-black text-[#1D1D1F] tracking-tight group-hover:text-blue-600 transition-colors">{job.title}</h3>
                      <p className="text-sm text-[#86868B] font-bold line-clamp-3 mb-4">{job.description}</p>

                      <div className="flex items-center gap-4 text-[#86868B] text-xs font-bold">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location?.address?.split(',')[0]}
                        </div>
                        <div className="flex items-center gap-1">
                           <Target className="w-3.5 h-3.5" />
                           {job.proposalCount || 0} Proposte
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-[#F5F5F7]/50 border-t border-[#D2D2D7]/20 flex items-center justify-between">
                       <div className="text-lg font-black text-[#1D1D1F]">
                         €{job.budgetMin}-{job.budgetMax}
                       </div>
                        <Button size="sm" className="rounded-full bg-blue-600 text-white hover:bg-blue-700 font-black text-[11px] uppercase tracking-widest h-10 px-8 group/btn shadow-lg shadow-blue-600/20 transition-all">
                          Dettagli <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
         )}

         {activeSubTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between px-2">
                <h2 className="text-2xl font-black tracking-tight text-[#1D1D1F]">Storico Interventi</h2>
                <span className="text-sm font-bold text-[#86868B]">
                  {activeJobs.filter(j => j.status === 'completed').length} Completati
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {activeJobs.filter(j => j.status === 'completed').map(job => (
                   <Card key={job.id} className="rounded-[2rem] bg-white border border-[#D2D2D7]/30">
                      <CardHeader className="flex-row items-start justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                          <CardTitle className="text-xl font-black">{job.title}</CardTitle>
                          <p className="text-xs font-bold text-[#86868B] flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {job.location?.address}
                          </p>
                        </div>
                        <span className="bg-green-50 text-green-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-200">
                          Completato
                        </span>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-6 pt-4 border-t border-[#D2D2D7]/20">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Pattuito: €{job.assignedPrice || job.budgetMin}</span>
                          </div>
                          {job.reviewId && (
                            <div className="flex items-center gap-2 text-yellow-600">
                               <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                               <span className="text-[10px] font-black uppercase tracking-widest">Recensito</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                   </Card>
                 ))}
                 {activeJobs.filter(j => j.status === 'completed').length === 0 && (
                   <div className="col-span-1 md:col-span-2 py-12 flex flex-col items-center justify-center text-center opacity-50 space-y-2 border-2 border-dashed border-[#D2D2D7]/30 rounded-3xl bg-[#F5F5F7]">
                     <CheckCircle2 className="w-8 h-8 text-[#86868B]" />
                     <p className="text-sm font-bold text-[#86868B]">Ancora nessun intervento completato.<br/>I tuoi lavori terminati appariranno qui.</p>
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
             className="grid grid-cols-1 md:grid-cols-2 gap-8"
           >
             <div className="bg-white p-8 lg:p-10 rounded-[3rem] border border-[#D2D2D7]/30">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                    <Briefcase className="w-7 h-7 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-[#1D1D1F]">Il Tuo Portfolio</h3>
                    <p className="text-sm font-bold text-[#86868B]">Mostra i tuoi lavori per ottenere la prima valutazione</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-[#FBFBFD] border border-blue-100 rounded-3xl">
                     <p className="text-sm font-bold text-[#1D1D1F] leading-relaxed">
                       Per gli artigiani che non vogliono partire da 0 recensioni, è possibile caricare prove documentali (foto, attestati) dei lavori passati. Il nostro team assegnerà delle "Stellette di garanzia" iniziali.
                     </p>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest text-[#86868B]">Il Tuo Portfolio ({workerProfile?.portfolio?.length || 0} Foto)</label>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {workerProfile?.portfolio?.map((url, i) => (
                        <div key={i} className="relative aspect-video rounded-2xl overflow-hidden group border border-[#D2D2D7]/30 bg-[#F5F5F7]">
                          <img src={url} className="w-full h-full object-cover" alt="Portfolio" />
                          <button 
                            onClick={() => removePortfolioPhoto(url)}
                            className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full text-red-500 shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      
                      <label className="aspect-video rounded-2xl border-2 border-dashed border-[#D2D2D7] hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group">
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handlePortfolioUpload}
                          disabled={uploading}
                        />
                        {uploading ? (
                          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                        ) : (
                          <>
                            <Camera className="w-5 h-5 text-[#86868B] group-hover:text-blue-600 transition-colors" />
                            <span className="text-[10px] font-black text-[#86868B] uppercase tracking-widest group-hover:text-blue-600 transition-colors">Aggiungi Foto</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  <Button 
                    className="w-full h-14 rounded-2xl bg-[#1D1D1F] hover:bg-black text-white font-black text-lg shadow-xl shadow-black/10"
                    onClick={() => alert("Richiesta inviata! Un operatore verificherà il tuo portfolio entro 24-48 ore.")}
                    disabled={!workerProfile?.portfolio || workerProfile.portfolio.length === 0}
                  >
                     Richiedi Valutazione Iniziale
                  </Button>
                </div>
             </div>

             <div className="bg-[#1D1D1F] text-white p-8 lg:p-10 rounded-[3rem]">
                <h3 className="text-2xl font-black mb-6">Come funziona</h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center shrink-0 font-black">1</div>
                    <div>
                      <h4 className="font-black text-lg">Carica i tuoi lavori migliori</h4>
                      <p className="text-sm text-white/70 font-bold mt-1">Carica foto del "prima" e "dopo" dei tuoi interventi, accompagnate da una breve descrizione.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center shrink-0 font-black">2</div>
                    <div>
                      <h4 className="font-black text-lg">Verifica da parte del Team</h4>
                      <p className="text-sm text-white/70 font-bold mt-1">Il team di CercArtigiano.it valuterà la qualità dei lavori per attestare la tua esperienza.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center shrink-0 font-black">3</div>
                    <div>
                      <h4 className="font-black text-lg">Ottieni il Badge</h4>
                      <p className="text-sm text-white/70 font-bold mt-1">Riceverai delle "Stellette Iniziali" che aumenteranno la fiducia dei clienti fin dalla tua prima proposta sulla piattaforma.</p>
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
