import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { collection, query, where, onSnapshot, orderBy, setDoc, doc, serverTimestamp, updateDoc, getDoc, increment, limit, runTransaction } from 'firebase/firestore';
import { Job, User, UserProfile } from '../../types';
import { cn } from '../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { 
  Plus, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  AlertCircle,
  MessageSquare,
  Star,
  Activity,
  Zap,
  TrendingUp,
  Package,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GuidedJobModal } from '../modals/GuidedJobModal';
import { ChatModal } from '../modals/ChatModal';
import { ProposalsModal } from '../modals/ProposalsModal';
import { ReviewModal } from '../modals/ReviewModal';
import { SettingsView } from '../SettingsView';
import { PeerContactInfo } from '../PeerContactInfo';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';

interface ClientDashboardProps {
  user: User;
  activeTab: string;
  initialCategoryId?: string | null;
  onClearPendingCategory?: () => void;
}

export function ClientDashboard({ user, activeTab, initialCategoryId, onClearPendingCategory }: ClientDashboardProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGuidedModalOpen, setIsGuidedModalOpen] = useState(false);
  const [preSelectedCategoryId, setPreSelectedCategoryId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  useEffect(() => {
    if (initialCategoryId) {
      setPreSelectedCategoryId(initialCategoryId);
      setIsGuidedModalOpen(true);
      onClearPendingCategory?.();
    }
  }, [initialCategoryId]);
  const [chatJob, setChatJob] = useState<Job | null>(null);
  const [isProposalsModalOpen, setIsProposalsModalOpen] = useState(false);
  const [clientProfile, setClientProfile] = useState<UserProfile | null>(null);
  const [activeArtisans, setActiveArtisans] = useState<UserProfile[]>([]);
  
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewJob, setReviewJob] = useState<Job | null>(null);

  useEffect(() => {
    // Escuta o perfil do cliente para saber o onboarding
    const profileRef = doc(db, 'users', user.id);
    const unsubProfile = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) {
        setClientProfile(docSnap.data() as UserProfile);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.id}`);
    });

    // Fetch active artisans for the ticker
    const artisansQuery = query(
      collection(db, 'workerProfiles'),
      where('isAvailable', '==', true),
      limit(10)
    );

    const unsubArtisans = onSnapshot(artisansQuery, (snapshot) => {
      const artisansData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any as UserProfile));
      setActiveArtisans(artisansData);
    }, (error) => {
       handleFirestoreError(error, OperationType.LIST, 'workerProfiles');
    });

    const q = query(
      collection(db, 'jobs'),
      where('clientId', '==', user.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jobsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
      // Sort client-side for immediate consistency if necessary, 
      // although the query should ideally handle it (added orderBy to query below)
      jobsData.sort((a, b) => {
        const dateA = a.createdAt?.seconds ? a.createdAt.seconds : 0;
        const dateB = b.createdAt?.seconds ? b.createdAt.seconds : 0;
        return dateB - dateA;
      });
      setJobs(jobsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'jobs');
      setLoading(false);
    });

    return () => {
      unsubProfile();
      unsubArtisans();
      unsubscribe();
    };
  }, [user.id]);

  const stats = [
    { label: 'Richieste Inviate', value: jobs.length, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Lavori Attivi', value: jobs.filter(j => j.status === 'in_progress').length, icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Completati', value: jobs.filter(j => j.status === 'completed').length, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  const handleRenew = async (job: Job) => {
    if ((user.tokens || 0) < 1) {
      alert("Saldo Token insufficiente. Ricarica per prolungare la richiesta.");
      window.dispatchEvent(new CustomEvent('switchTab', { detail: 'credits' }));
      return;
    }

    if (!confirm("Vuoi utilizzare 1 Token per prolungare questa richiesta di altri 30 giorni?")) return;

    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', user.id);
        const jobRef = doc(db, 'jobs', job.id);
        
        const userSnap = await transaction.get(userRef);
        if (!userSnap.exists() || (userSnap.data().tokens || 0) < 1) {
          throw new Error("Saldo insufficiente");
        }

        // new date is either 30 days from now or 30 days from current expiry if it's in the future
        const currentExpiresAt = job.expiresAt?.toDate ? job.expiresAt.toDate() : new Date();
        const baseDate = currentExpiresAt > new Date() ? currentExpiresAt : new Date();
        const newExpiry = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);

        transaction.update(userRef, { tokens: increment(-1) });
        transaction.update(jobRef, { 
          expiresAt: newExpiry,
          updatedAt: serverTimestamp()
        });
      });
      alert("Richiesta prolungata con successo!");
    } catch (error) {
      console.error("Renew Error:", error);
      alert("Errore durante il rinnovo.");
    }
  };

  const handleDeleteJob = async (job: Job) => {
    if (!confirm("Sei sicuro di voler eliminare questa richiesta? Questa azione non può essere annullata.")) return;
    
    try {
      await updateDoc(doc(db, 'jobs', job.id), {
        status: 'cancelled',
        updatedAt: serverTimestamp()
      });
      alert("Richiesta eliminata con successo.");
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Errore durante l'eliminazione.");
    }
  };

  if (loading) return null;

  return (
    <div className="space-y-6 sm:space-y-8 pb-32 px-2 sm:px-0">
       <AnimatePresence mode="wait">
          {activeTab === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 sm:space-y-8"
            >
               {/* Hero Section */}
               <section className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-white border border-[#D2D2D7]/30 shadow-sm">
                  <div className="absolute top-0 right-0 p-4 sm:p-8">
                    <div className="bg-blue-50 px-2 sm:px-3 py-1 rounded-full border border-blue-100 flex items-center gap-1 sm:gap-2">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-blue-700">Centro Clienti</span>
                    </div>
                  </div>

                  <div className="p-6 sm:p-8 lg:p-12">
                    <div className="max-w-2xl">
                      <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black tracking-tight text-[#1D1D1F] mb-3 sm:mb-4">
                        Bentornato
                      </h1>
                      <p className="text-base sm:text-lg lg:text-xl text-[#86868B] font-bold mb-6 sm:mb-8">
                        Ecco cosa sta succedendo ai tuoi interventi.
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button 
                          onClick={() => setIsGuidedModalOpen(true)}
                          className="h-12 sm:h-14 px-8 rounded-xl sm:rounded-2xl bg-[#1D1D1F] hover:bg-black text-white font-bold text-base sm:text-lg shadow-xl shadow-[#1D1D1F]/20 group"
                        >
                          <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                          Nuova Richiesta
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats Grid */}
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
               </section>

               {/* Slogan Card */}
               <div className="p-8 sm:p-12 bg-blue-600 rounded-[2rem] sm:rounded-[2.5rem] text-white flex flex-col md:flex-row items-center gap-6 sm:gap-8 relative overflow-hidden">
                 <div className="relative z-10 space-y-4 text-center md:text-left">
                    <h3 className="text-3xl sm:text-4xl font-black tracking-tighter leading-tight sm:leading-none">Professionalità garantita,<br className="hidden sm:block" />in un solo tocco.</h3>
                    <p className="text-white/70 font-bold max-w-sm text-xs sm:text-sm mx-auto md:mx-0">Ogni professionista è verificato manualmente dal nostro supporto.</p>
                    <Button 
                     variant="outline" 
                     onClick={() => window.dispatchEvent(new CustomEvent('switchTab', { detail: 'search' }))}
                     className="rounded-full bg-white text-[#1D1D1F] hover:bg-gray-100 border-none font-black shadow-lg"
                    >
                      Esplora Artigiani
                    </Button>
                 </div>
                 <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl opacity-50 sm:opacity-100" />
               </div>

               {/* Recenti Preview */}
               <div className="space-y-4 sm:space-y-6">
                 <div className="flex items-center justify-between px-2">
                   <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#1D1D1F]">Attività Recenti</h2>
                   <Button 
                     variant="ghost" 
                     onClick={() => window.dispatchEvent(new CustomEvent('switchTab', { detail: 'jobs' }))}
                     className="text-[10px] font-black uppercase tracking-widest text-blue-600"
                   >
                     Vedi tutte
                   </Button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                   {jobs.slice(0, 2).map((job) => (
                     <Card key={job.id} className="rounded-[1.5rem] sm:rounded-[2rem] border-[#D2D2D7]/30 p-5 sm:p-6 bg-white flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                             <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-blue-600">{job.category}</span>
                             <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-gray-400">{job.createdAt?.seconds ? new Date(job.createdAt.seconds * 1000).toLocaleDateString() : 'Oggi'}</span>
                          </div>
                          <h4 className="font-black text-base sm:text-lg mb-1">{job.title}</h4>
                          <p className="text-[11px] sm:text-xs font-bold text-[#86868B] line-clamp-1">{job.description}</p>
                        </div>
                        <div className="mt-4 sm:mt-6 flex items-center justify-between border-t border-gray-100 pt-3 sm:pt-4">
                           <span className={cn("text-[8px] sm:text-[9px] font-black uppercase px-2 py-0.5 sm:py-1 rounded-md", 
                             job.status === 'open' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                           )}>{job.status === 'open' ? 'Aperto' : job.status}</span>
                           <span className="font-black text-xs sm:text-sm">{job.proposalCount || 0} Proposte</span>
                        </div>
                     </Card>
                   ))}
                   {jobs.length === 0 && (
                      <div className="md:col-span-2 py-8 sm:py-10 bg-gray-50 rounded-[1.5rem] sm:rounded-[2rem] border border-dashed border-gray-200 text-center px-4">
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nessuna attività recente</p>
                      </div>
                   )}
                 </div>
               </div>
            </motion.div>
          ) : (
            <motion.div
              key="jobs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 sm:space-y-8"
            >
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
                 <div>
                   <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1D1D1F]">Le mie Richieste</h2>
                   <p className="text-xs sm:text-sm font-bold text-[#86868B]">Monitora i tuoi lavori e interagisci con gli artigiani.</p>
                 </div>
                 <Button 
                   onClick={() => setIsGuidedModalOpen(true)}
                   className="w-full sm:w-auto h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-black px-8 shadow-lg shadow-blue-600/20"
                 >
                   Nuova Richiesta
                 </Button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                 {jobs.map((job) => (
                   <motion.div
                     key={job.id}
                     layout
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                   >
                     <Card 
                       className="rounded-[1.5rem] sm:rounded-[2rem] bg-white border border-[#D2D2D7]/30 hover:shadow-xl hover:shadow-black/5 transition-all cursor-pointer group overflow-hidden"
                       onClick={async () => {
                         // Reset notification flags
                         if (job.hasNewProposals || (job.unreadMessagesCount?.[user.id] || 0) > 0) {
                           await updateDoc(doc(db, 'jobs', job.id), {
                             hasNewProposals: false,
                             [`unreadMessagesCount.${user.id}`]: 0
                           });
                         }

                         if (job.status === 'completed' && !job.reviewId) {
                           setReviewJob(job);
                           setIsReviewModalOpen(true);
                         } else if (job.status === 'in_progress' && job.assignedWorkerId) {
                           setChatJob(job);
                         } else {
                           setSelectedJob(job);
                           setIsProposalsModalOpen(true);
                         }
                       }}
                     >
                       <CardHeader className="flex-row items-start justify-between space-y-0 pb-2 px-5 sm:px-6">
                         <div className="space-y-1">
                           <span className="text-[9px] font-black uppercase tracking-widest text-[#86868B] bg-[#F5F5F7] px-2 py-0.5 rounded">
                             {job.category}
                           </span>
                           <CardTitle className="text-lg sm:text-xl font-black tracking-tight group-hover:text-blue-600 transition-colors flex items-center justify-between gap-2">
                             {job.title}
                             {job.hasNewProposals && (
                               <span className="flex h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-orange-500 animate-pulse shrink-0 shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                             )}
                           </CardTitle>
                         </div>
                         <div className="flex flex-col items-end gap-1.5 shrink-0">
                           <div className={cn(
                             "text-[8px] sm:text-[10px] font-black uppercase tracking-widest px-2 sm:px-3 py-1 rounded-full",
                             job.status === 'open' ? "bg-green-50 text-green-700" :
                             job.status === 'in_progress' ? "bg-blue-50 text-blue-700" :
                             "bg-[#F5F5F7] text-[#86868B]"
                           )}>
                             {job.status === 'open' ? 'Aperto' :
                              job.status === 'in_progress' ? 'In Corso' : 'Completato'}
                           </div>
                           {(job.unreadMessagesCount?.[user.id] || 0) > 0 && (
                             <div className="bg-blue-600 text-white text-[8px] sm:text-[9px] font-black px-1.5 sm:px-2 py-0.5 rounded-full animate-bounce shadow-lg shadow-blue-500/20">
                               {job.unreadMessagesCount![user.id]} MSG
                             </div>
                           )}
                         </div>
                       </CardHeader>
                       <CardContent className="space-y-4 px-5 sm:px-6 pb-6">
                         <p className="text-xs sm:text-sm text-[#86868B] font-bold line-clamp-2 leading-relaxed">
                           {job.description}
                         </p>
                         
                         <div className="flex items-center gap-3 sm:gap-4 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#86868B]">
                           <div className="flex items-center gap-1 bg-[#F5F5F7] px-2 py-1 rounded-lg">
                             <MapPin className="w-3 h-3" />
                             {job.location?.address?.split(',')[0]}
                           </div>
                           <div className="flex items-center gap-1 bg-[#F5F5F7] px-2 py-1 rounded-lg">
                             <Clock className="w-3 h-3" />
                             {job.createdAt?.seconds ? new Date(job.createdAt.seconds * 1000).toLocaleDateString() : 'Oggi'}
                           </div>
                         </div>

                         <div className="pt-4 border-t border-[#D2D2D7]/30 flex flex-col gap-4">
                           <div className="flex items-center justify-between">
                             <div className="flex -space-x-1.5">
                                {[...Array(Math.min(3, job.proposalCount || 0))].map((_, i) => (
                                  <div key={i} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white bg-[#F5F5F7] flex items-center justify-center text-[9px] sm:text-[10px] font-black text-[#86868B]">
                                    P
                                  </div>
                                ))}
                             </div>
                             <div className="flex items-center gap-2">
                               <span className="text-xs sm:text-sm font-black text-[#1D1D1F]">
                                 {job.proposalCount || 0} Proposte
                               </span>
                               <ChevronRight className="w-4 h-4 text-[#D2D2D7] group-hover:text-blue-600 transition-colors" />
                             </div>
                           </div>

                           {job.status === 'open' && (
                             <div className="flex flex-col gap-2 w-full">
                               <Button 
                                 variant="default"
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleRenew(job);
                                 }}
                                 className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all border-none"
                               >
                                 <Clock className="w-4 h-4 mr-2" />
                                 Prolunga • 1 Token
                               </Button>
                               <Button 
                                 variant="outline"
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleDeleteJob(job);
                                 }}
                                 className="w-full h-10 rounded-xl bg-red-50 text-red-600 border-red-100 font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all"
                               >
                                 Elimina
                               </Button>
                             </div>
                           )}
                           {job.status === 'completed' && !job.reviewId && (
                             <Button 
                               variant="default"
                               onClick={(e) => {
                                 e.stopPropagation();
                                 setReviewJob(job);
                                 setIsReviewModalOpen(true);
                               }}
                               className="w-full h-10 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-orange-500/20 transition-all border-none flex items-center justify-center gap-2"
                             >
                               <Star className="w-4 h-4" /> Lascia Recensione
                             </Button>
                           )}
                         </div>
                       </CardContent>
                     </Card>
                   </motion.div>
                 ))}
               </div>
            </motion.div>
          )}
       </AnimatePresence>
       <GuidedJobModal 
         isOpen={isGuidedModalOpen} 
         onClose={() => {
           setIsGuidedModalOpen(false);
           setPreSelectedCategoryId(null);
         }} 
         categoryId={preSelectedCategoryId}
         userId={user.id}
         onComplete={() => {}} // Logged in
       />
       {selectedJob && (
         <ProposalsModal 
          isOpen={isProposalsModalOpen}
          onClose={() => setIsProposalsModalOpen(false)}
          job={selectedJob}
          user={user}
         />
       )}
       {reviewJob && (
         <ReviewModal
           isOpen={isReviewModalOpen}
           onClose={() => setIsReviewModalOpen(false)}
           job={reviewJob}
           clientId={user.id}
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
