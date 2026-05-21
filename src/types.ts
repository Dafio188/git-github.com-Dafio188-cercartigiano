export type UserRole = 'client' | 'worker' | 'admin' | 'support';

export type BadgeType = 'top_pro' | 'verified' | 'fast_responder' | 'insurance_active' | 'elderly_friendly';

export interface UserPrivacySettings {
  showEmail: boolean;
  showPhone: boolean;
  showAddress: boolean;
  showFullName: boolean;
}

export interface User {
  id: string;
  role: UserRole;
  nome: string;
  email: string;
  tokens?: number;
  phone?: string;
  address?: string;
  civico?: string;
  location?: {
    lat: number;
    lng: number;
  };
  cap?: string;
  citta?: string;
  provincia?: string;
  regione?: string;
  createdAt: string;
  status: 'active' | 'pending' | 'suspended';
  onboardingComplete: boolean;
  isApproved?: boolean;
  privacySettings?: UserPrivacySettings;
  transactionHistory?: {
    type: 'purchase' | 'spend' | 'refund';
    credits: number;
    amount?: number;
    date: string;
    label: string;
  }[];
}

export interface UserProfile {
  id?: string;
  userId: string;
  bio: string;
  displayName?: string;
  nome?: string;
  photoURL?: string;
  rating?: number;
  reviewCount?: number;
  category?: string;
  isVerified?: boolean;
  uid?: string; // fallback for some components
  categories: string[];
  skills?: string[];
  hourlyRate: number;
  radiusKm: number;
  address?: string;
  civico?: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  cap?: string;
  citta?: string;
  provincia?: string;
  regione?: string;
  verifiedFlags: {
    id: boolean;
    phone: boolean;
    insurance: boolean;
  };
  badges: BadgeType[];
  score: number;
  isAvailable?: boolean;
  isOnline?: boolean;
  termsAcceptedAt?: string;
  credits: number;
  privacySettings?: UserPrivacySettings;
  portfolio?: string[]; // Per artigiani senza storico che vogliono mostrare lavori
}

export interface JobQuestion {
  id: string;
  jobId: string;
  userId: string;
  userName: string;
  role: 'client' | 'worker';
  text: string;
  createdAt: any;
}

export interface Job {
  id: string;
  clientId: string;
  title: string;
  category: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    civico?: string;
  };
  photos: string[];
  budgetMin: number;
  budgetMax: number;
  preferredTimeSlot: string;
  status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'expired';
  isUrgent?: boolean;
  proposalCount?: number;
  hasNewProposals?: boolean;
  unreadMessagesCount?: Record<string, number>; // uid -> count
  tokenCost?: number;
  createdAt: any; // Can be string or Firestore Timestamp
  updatedAt?: any;
  expiresAt: any;
  publicationPlan: 'free' | 'premium';
  scheduledAt?: string;
  isElderlyPriority: boolean;
  assignedWorkerId?: string;
  assignedPrice?: number;
  reviewId?: string;
}

export interface JobReview {
  id: string;
  jobId: string;
  workerId: string;
  clientId: string;
  ratingQuality: number;
  ratingSpeed: number;
  ratingCleanliness: number;
  ratingCourtesy: number;
  averageRating: number;
  comment?: string;
  createdAt: any;
}

export interface JobProposal {
  id: string;
  jobId: string;
  clientId: string;
  workerId: string;
  workerName: string;
  workerRating: number;
  workerBadges?: BadgeType[];
  materialsCost: number; // Costo materiali previsti
  laborCost: number; // Costo manodopera
  estimatedDays: number; // Giorni di lavoro previsti
  validityDays: number; // Validità preventivo in giorni
  price: number; // Totale
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  createdAt: any;
  expiresAt: any;
}

export interface Booking {
  id: string;
  jobId: string;
  workerId: string;
  clientConfirmed: boolean;
  workerConfirmed: boolean;
  paymentId?: string;
  status: 'pending' | 'confirmed' | 'started' | 'completed' | 'disputed';
}

export interface WorkProof {
  id: string;
  bookingId: string;
  photoBefore: string[];
  photoAfter: string[];
  uploadedBy: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  lastMessage?: string;
  lastUpdate: any;
  jobId?: string;
  jobTitle?: string;
  unreadCount?: Record<string, number>; // uid -> count
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  participantIds: string[];
  text: string;
  timestamp: any;
  isRead: boolean;
}

export interface BillingProfile {
  userId: string;
  fiscalType: 'individual' | 'company' | 'freelancer';
  ragioneSociale?: string;
  partitaIva?: string;
  codiceFiscale: string;
  codiceSdi?: string;
  pec?: string;
  address: string;
  cap: string;
  citta: string;
  provincia: string;
  regione: string;
  regimeFiscale?: string;
  updatedAt: any;
}

export interface Invoice {
  id: string;
  userId: string;
  orderId: string;
  amount: number;
  tokens: number;
  status: 'draft' | 'pending_sdi' | 'sent' | 'error' | 'rejected';
  xmlUrl?: string;
  pdfUrl?: string;
  sdiId?: string;
  fiscalData: BillingProfile;
  createdAt: any;
  approvedAt?: any;
  errorLog?: string;
}

export interface AdminBillingConfig {
  companyName: string;
  partitaIva: string;
  codiceFiscale: string;
  address: string;
  cap: string;
  citta: string;
  provincia: string;
  regione: string;
  pec: string;
  codiceSdi: string;
  stripeLinks?: {
    worker_basic?: string;
    worker_pro?: string;
    worker_expert?: string;
    client_premium?: string;
    client_vip?: string;
  };
}
