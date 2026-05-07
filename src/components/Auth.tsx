import React, { useState } from 'react';
import { auth } from '../firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  LogOut, 
  Mail, 
  Lock, 
  User as UserIcon, 
  ArrowRight, 
  ChevronLeft,
  DoorOpen,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

import { BrandLogo } from './BrandLogo';

type AuthMode = 'login' | 'register' | 'forgot-password';

interface AuthProps {
  isCompletingRequest?: boolean;
}

export function Auth({ isCompletingRequest = false }: AuthProps) {
  const [mode, setMode] = useState<AuthMode>(isCompletingRequest ? 'register' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleGoogleLogin = async () => {
    if (loading) return;
    const provider = new GoogleAuthProvider();
    // Force select account to avoid silent failures in some browsers
    provider.setCustomParameters({ prompt: 'select_account' });
    
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        console.log("Auth cancelled by user/browser.");
        return;
      }
      
      console.error("Auth error:", error);
      
      // Controllo specifico per errori comuni
      if (error.code === 'auth/unauthorized-domain') {
        setError(`Dominio non autorizzato. Vai nella Console Firebase > Authentication > Settings e aggiungi "${window.location.hostname}" ai domini autorizzati.`);
      } else if (error.code === 'auth/network-request-failed') {
        setError("Errore di rete. Verifica la connessione o se i cookie di terze parti sono bloccati (comune negli iframe). Prova ad aprire l'app in una nuova scheda.");
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-api-key') {
        setError("Chiave API o Credenziali non valide. Verifica la configurazione di Firebase e assicurati che l'API Key sia corretta.");
      } else {
        setError(`Errore accesso Google (${error.code}): ` + (error.message || "Riprova tra poco."));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!email || !email.includes('@')) {
        throw { code: 'auth/invalid-email' };
      }
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else if (mode === 'register') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
      } else if (mode === 'forgot-password') {
        await sendPasswordResetEmail(auth, email);
        setEmailSent(true);
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      let message = "Si è verificato un errore.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = "Credenziali non valide. Verifica email e password.";
      }
      if (error.code === 'auth/email-already-in-use') message = "Email già in uso.";
      if (error.code === 'auth/invalid-email') message = "Email non valida.";
      if (error.code === 'auth/weak-password') message = "La password deve avere almeno 6 caratteri.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const user = auth.currentUser;

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end hidden sm:flex">
          <span className="text-xs font-black text-[#1D1D1F]">{user.displayName || 'Utente'}</span>
          <span className="text-[10px] text-[#86868B] font-bold">{user.email}</span>
        </div>
        <div className="relative group">
          <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-[#F5F5F7] flex items-center justify-center">
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt="Avatar" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform cursor-pointer" 
              />
            ) : (
              <UserIcon className="w-5 h-5 text-[#86868B]" />
            )}
          </div>
          <button
            onClick={handleLogout}
            className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md hover:bg-red-50 text-red-500 transition-colors"
          >
            <LogOut className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-5xl bg-white rounded-[2.5rem] lg:rounded-[3.5rem] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.25)] min-h-[650px] lg:h-[750px] border border-[#D2D2D7]/30 flex overflow-hidden">
      
      {/* Universal Back Button - Elegant 'Porta' version */}
      <button 
        onClick={() => window.location.reload()}
        className="absolute top-6 left-6 z-[100] flex items-center justify-center w-12 h-12 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:bg-white hover:scale-110 active:scale-95 transition-all group"
        title="Torna alla Home"
      >
        <DoorOpen className="w-6 h-6 text-[#1D1D1F] transition-colors group-hover:text-blue-600" />
      </button>

      {/* 1. Left Section: Registration (Desktop) */}
      <div className={cn(
        "hidden lg:flex w-1/2 flex-col items-center pt-24 px-12 transition-all duration-700",
        mode === 'login' ? "opacity-0 invisible scale-95" : "opacity-100 visible scale-100"
      )}>
        <div className="w-full max-w-sm space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="p-6 bg-white rounded-[2.5rem] shadow-xl border border-[#D2D2D7]/20 flex-shrink-0 flex items-center justify-center">
              <BrandLogo className="w-24 h-24 lg:w-28 lg:h-28" />
            </div>
            <h3 className="text-3xl font-black text-[#1D1D1F] tracking-tight">
              {isCompletingRequest ? "Completa Richiesta" : "Crea Account"}
            </h3>
            <p className="text-[#86868B] text-sm font-bold mt-2">
              {isCompletingRequest ? "Ultimo step per pubblicare la tua proposta" : "Unisciti alla nostra eccellenza artigiana"}
            </p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-3">
            <div className="relative group">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B] group-focus-within:text-blue-600 transition-colors" />
              <Input 
                placeholder="Nome o Azienda" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="pl-11 h-12 bg-[#F5F5F7] border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-600/10 transition-all"
              />
            </div>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B] group-focus-within:text-blue-600 transition-colors" />
              <Input 
                type="email" 
                placeholder="Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-11 h-12 bg-[#F5F5F7] border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-600/10 transition-all"
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B] group-focus-within:text-blue-600 transition-colors" />
              <Input 
                type={showPassword ? 'text' : 'password'}
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-11 h-12 bg-[#F5F5F7] border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-600/10 transition-all"
              />
            </div>
            
            {error && mode === 'register' && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 text-red-500 p-3 rounded-xl text-xs font-bold flex items-center gap-2 border border-red-100">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}

            <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl bg-[#1D1D1F] text-white font-black hover:bg-black transition-all shadow-xl shadow-black/10 active:scale-95">
              {loading ? "Caricamento..." : "Registrati ora"}
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#D2D2D7]/30" /></div>
              <div className="relative flex justify-center"><span className="bg-white px-4 text-[#86868B] text-[10px] font-black uppercase tracking-widest leading-none">Oppure</span></div>
            </div>

            <Button onClick={handleGoogleLogin} variant="outline" className="w-full h-14 rounded-2xl border-2 border-[#D2D2D7]/50 font-black gap-3 group bg-white hover:bg-[#F5F5F7] transition-all">
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5 group-hover:scale-110 transition-transform" alt="Google" />
              Continua con Google
            </Button>
          </form>
        </div>
      </div>

      {/* 2. Right Section: Login & Forgot Password (Desktop Flip Card) */}
      <div className={cn(
        "hidden lg:flex w-1/2 flex-col items-center pt-24 px-12 transition-all duration-700",
        mode === 'register' ? "opacity-0 invisible scale-95" : "opacity-100 visible scale-100"
      )}>
        <div className="w-full max-sm h-full" style={{ perspective: '2000px' }}>
          <motion.div 
            className="relative w-full h-[600px]"
            animate={{ rotateY: mode === 'forgot-password' ? 180 : 0 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100, damping: 20 }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* FRONT: Login Form */}
            <div 
              className="absolute inset-0 w-full h-full flex flex-col space-y-6"
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            >
              <div className="flex flex-col items-center text-center">
              <div className="p-6 bg-white rounded-[2.5rem] shadow-xl border border-[#D2D2D7]/20 flex items-center justify-center">
                <BrandLogo className="w-24 h-24 lg:w-28 lg:h-28" />
              </div>
                <h3 className="text-3xl font-black text-[#1D1D1F] tracking-tight">Bentornato</h3>
                <p className="text-[#86868B] text-sm font-bold mt-2">Accedi al tuo spazio professionale</p>
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-3">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B]" />
                  <Input 
                    type="email" 
                    placeholder="Email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 bg-[#F5F5F7] border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-600/10 transition-all"
                  />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B]" />
                  <Input 
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 h-12 bg-[#F5F5F7] border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-600/10 transition-all"
                  />
                </div>
                <div className="flex justify-start">
                  <button type="button" onClick={() => setMode('forgot-password')} className="text-xs font-bold text-blue-600 hover:underline underline-offset-4">
                    Password dimenticata?
                  </button>
                </div>

                {error && mode === 'login' && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 text-red-500 p-3 rounded-xl text-xs font-bold border border-red-100">
                    {error}
                  </motion.div>
                )}

                <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl bg-[#1D1D1F] text-white font-black hover:bg-black transition-all active:scale-95">
                  {loading ? "Caricamento..." : "Accedi"}
                </Button>
              </form>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#D2D2D7]/30" /></div>
                <div className="relative flex justify-center"><span className="bg-white px-4 text-[#86868B] text-[10px] font-black uppercase tracking-widest leading-none">Oppure</span></div>
              </div>

              <Button onClick={handleGoogleLogin} variant="outline" className="w-full h-14 rounded-2xl border-2 border-[#D2D2D7]/50 font-black gap-3 group bg-white hover:bg-[#F5F5F7] transition-all">
                <img src="https://www.google.com/favicon.ico" className="w-5 h-5 group-hover:scale-110 transition-transform" alt="Google" />
                Accedi con Google
              </Button>
            </div>

            {/* BACK: Forgot Password Form */}
            <div 
              className="absolute inset-0 w-full h-full flex flex-col items-center space-y-6"
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-8 bg-blue-50 rounded-[2.5rem] mb-6 shadow-sm border border-blue-100/50">
                  <Lock className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-3xl font-black text-[#1D1D1F] tracking-tight">Recupero</h3>
                <p className="text-[#86868B] text-sm font-bold mt-2 max-w-[200px]">Inserisci la tua email per reimpostare la password</p>
              </div>

              {emailSent ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-black text-[#1D1D1F]">Email Inviata!</h4>
                    <p className="text-xs text-[#86868B] font-medium px-4">Controlla la tua casella di posta per procedere.</p>
                  </div>
                  <Button onClick={() => { setMode('login'); setEmailSent(false); }} className="h-12 px-8 rounded-2xl bg-[#1D1D1F] text-white font-black">
                    Torna al Login
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleEmailAuth} className="w-full space-y-4">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B]" />
                    <Input 
                      type="email" 
                      placeholder="Email di registrazione" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-11 h-12 bg-[#F5F5F7] border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-600/10 transition-all"
                    />
                  </div>

                  {error && mode === 'forgot-password' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-xs font-black text-center">
                      {error}
                    </motion.div>
                  )}

                  <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl bg-[#1D1D1F] text-white font-black shadow-xl shadow-black/5">
                    {loading ? "Invio in corso..." : "Invia link di ripristino"}
                  </Button>

                  <button 
                    type="button"
                    onClick={() => setMode('login')}
                    className="flex items-center justify-center gap-2 w-full font-black text-blue-600 hover:scale-105 transition-transform"
                  >
                    <ChevronLeft className="w-4 h-4" /> Torna al login
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* 3. Mobile View Section (Visible only on mobile) */}
      <div className="lg:hidden flex-1 relative flex flex-col items-center justify-center p-8 bg-white overflow-hidden" style={{ perspective: '2000px' }}>
        <motion.div
          className="w-full max-sm relative h-[600px] flex flex-col justify-center"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: mode === 'forgot-password' ? 180 : 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100, damping: 20 }}
        >
          {/* FRONT Faces (Login/Register) */}
          <div 
            className="w-full h-auto"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          >
            <AnimatePresence mode="wait">
              <motion.div 
                key={mode === 'register' ? 'register' : 'login'}
                initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }} 
                className="w-full space-y-8"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-5 bg-white rounded-[2rem] shadow-xl mb-6 border border-[#D2D2D7]/10 overflow-hidden flex items-center justify-center">
                    <BrandLogo className="w-20 h-20" />
                  </div>
                  <h3 className="text-3xl font-black text-[#1D1D1F]">{mode === 'login' ? 'Bentornato' : 'Inizia ora'}</h3>
                  <p className="text-[#86868B] font-bold text-sm">{mode === 'login' ? 'Accedi alle tue lavorazioni' : 'Crea il tuo profilo professionale'}</p>
                </div>

                <form onSubmit={handleEmailAuth} className="space-y-4">
                  {mode === 'register' && (
                    <div className="relative"><UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B]" /><Input placeholder="Nome o Azienda" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="pl-11 h-14 bg-[#F5F5F7] border-transparent rounded-2xl" /></div>
                  )}
                  <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B]" /><Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-11 h-14 bg-[#F5F5F7] border-transparent rounded-2xl" /></div>
                  <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868B]" /><Input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-11 h-14 bg-[#F5F5F7] border-transparent rounded-2xl" /></div>
                  
                  {mode === 'login' && (
                    <div className="flex justify-start px-1">
                      <button type="button" onClick={() => setMode('forgot-password')} className="text-xs font-bold text-blue-600">Password dimenticata?</button>
                    </div>
                  )}

                  {error && <div className="text-red-500 text-xs font-black text-center">{error}</div>}
                  
                  <Button type="submit" disabled={loading} className="w-full h-15 rounded-2xl bg-[#1D1D1F] text-white font-black shadow-lg">
                    {mode === 'login' ? 'Accedi' : 'Registrati ora'}
                  </Button>
                </form>

                {mode === 'login' ? (
                  <div className="space-y-4">
                    <Button onClick={handleGoogleLogin} variant="outline" className="w-full h-15 rounded-2xl border-2 border-[#D2D2D7]/50 font-black gap-3 bg-white">
                      <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                      Accedi con Google
                    </Button>
                    <div className="text-center">
                      <button onClick={() => setMode('register')} className="text-blue-600 text-sm font-black underline decoration-2 underline-offset-4">Nuovo qui? Registrati</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Button onClick={handleGoogleLogin} variant="outline" className="w-full h-15 rounded-2xl border-2 border-[#D2D2D7]/50 font-black gap-3 bg-white">
                      <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                      Registrati con Google
                    </Button>
                    <div className="text-center">
                      <button onClick={() => setMode('login')} className="text-blue-600 text-sm font-black underline decoration-2 underline-offset-4">Hai un account? Accedi</button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* BACK Face (Forgot Password Mobile) */}
          <div 
            className="absolute inset-0 w-full h-full"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="w-full space-y-8 flex flex-col items-center">
              <div className="flex flex-col items-center text-center">
                <div className="p-4 bg-blue-50 rounded-[1.5rem] mb-4">
                  <Lock className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-black text-[#1D1D1F]">Recupero</h3>
                <p className="text-[#86868B] font-bold text-sm">Inserisci l'email per il ripristino</p>
              </div>
              
              {emailSent ? (
                <div className="text-center space-y-6">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                  <p className="text-sm font-bold text-[#1D1D1F]">Controlla la tua email!</p>
                  <Button onClick={() => { setMode('login'); setEmailSent(false); }} className="w-full h-14 bg-[#1D1D1F] text-white font-black rounded-2xl">Torna al Login</Button>
                </div>
              ) : (
                <div className="w-full space-y-4">
                  <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-14 bg-[#F5F5F7] border-transparent rounded-2xl" />
                  <Button onClick={handleEmailAuth} className="w-full h-14 bg-[#1D1D1F] text-white font-black rounded-2xl">Invia link</Button>
                  <button onClick={() => setMode('login')} className="flex items-center justify-center gap-2 w-full font-black text-blue-600 text-sm">
                    <ChevronLeft className="w-4 h-4" /> Torna al login
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* 4. Sliding Door Overlay (Desktop Only) */}
      <motion.div 
        initial={false}
        animate={{ x: mode === 'register' ? '0%' : '-100%' }}
        transition={{ type: "spring", stiffness: 80, damping: 20 }}
        style={{ left: "50%" }}
        className="hidden lg:flex absolute top-0 w-1/2 h-full bg-[#1D1D1F] z-20 flex-col items-center pt-24 px-12 text-center text-white"
      >
        <div className="relative z-10 space-y-10 max-w-sm flex flex-col items-center">
          <div className="flex flex-col items-center gap-6 group cursor-default">
            <div className="p-6 bg-white rounded-[2.5rem] shadow-2xl border border-white/10 flex items-center justify-center">
              <BrandLogo className="w-24 h-24 lg:w-28 lg:h-28" />
            </div>
            <span className="text-2xl font-black tracking-[0.2em] uppercase text-white/90">CERCARTIGIANO</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={mode === 'register' ? 'register' : 'login'} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }} 
              className="space-y-6"
            >
              <h2 className="text-5xl font-black leading-tight tracking-tighter">
                {mode === 'register' 
                  ? (isCompletingRequest ? "Quasi Fatto." : "Torna a Casa.") 
                  : "Entra nel Futuro."}
              </h2>
              <p className="text-white/60 text-lg font-medium leading-relaxed">
                {mode === 'register' 
                  ? (isCompletingRequest 
                      ? "Registrati per ricevere preventivi dai migliori artigiani della tua zona." 
                      : "Accedi al tuo pannello per gestire i tuoi lavori e messaggi.")
                  : "La tua attività merita il miglior palcoscenico digitale. Registrati ora in pochi secondi."}
              </p>
            </motion.div>
          </AnimatePresence>

          <Button 
            onClick={() => {
              if (mode === 'forgot-password') {
                setMode('register');
              } else {
                setMode(mode === 'login' ? 'register' : 'login');
              }
            }}
            className="h-16 px-12 rounded-2xl bg-white text-[#1D1D1F] font-black text-xl hover:bg-blue-50 transition-all shadow-2xl active:scale-95"
          >
            {mode === 'register' ? "Accedi ora" : "Registrati ora"}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>

          <div className="pt-8 border-t border-white/10 opacity-30">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] font-mono">EST. 2026 • PREMIUM APP SERVICE</p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-blue-600/5 to-transparent pointer-events-none" />
      </motion.div>
    </div>
  );
}
