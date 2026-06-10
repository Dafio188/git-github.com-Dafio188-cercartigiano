import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  doc, 
  limit,
  updateDoc
} from 'firebase/firestore';
import { User, Conversation, DirectMessage } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User as UserIcon, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';
import { notifyNewMessage } from '../../lib/notifications';
import { validateMessage } from '../../lib/contentFilter';

interface ChatPanelProps {
  user: User;
  conversationId: string;
  className?: string;
}

export function ChatPanel({ user, conversationId, className }: ChatPanelProps) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversation details
  useEffect(() => {
    setLoading(true);
    const unsub = onSnapshot(doc(db, 'conversations', conversationId), (docSnap) => {
      if (docSnap.exists()) {
        setConversation({ id: docSnap.id, ...docSnap.data() } as Conversation);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error loading conversation:", error);
      setLoading(false);
    });
    return () => unsub();
  }, [conversationId]);

  // Load messages
  useEffect(() => {
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      where('participantIds', 'array-contains', user.id),
      orderBy('timestamp', 'asc'),
      limit(100)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DirectMessage)));
    }, (error) => {
      console.error("Error loading messages:", error);
    });

    return () => unsub();
  }, [conversationId, user.id]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !conversation) return;

    const messageText = newMessage.trim();
    
    // Content Filter check
    const validation = validateMessage(messageText, !conversation.isPublicContext);
    if (!validation.isValid) {
      setValidationError(validation.errorMessage || "Messaggio non valido.");
      setTimeout(() => setValidationError(null), 6000);
      return;
    }

    setNewMessage('');
    setValidationError(null);

    try {
      await addDoc(collection(db, 'messages'), {
        conversationId: conversation.id,
        senderId: user.id,
        participantIds: conversation.participants,
        text: messageText,
        timestamp: serverTimestamp(),
        isRead: false
      });

      await updateDoc(doc(db, 'conversations', conversation.id), {
        lastMessage: messageText,
        lastUpdate: serverTimestamp()
      });

      // Send notification to the peer
      const peerId = conversation.participants.find(id => id !== user.id);
      if (peerId) {
        await notifyNewMessage(
          peerId, 
          user.nome || 'L\'utente', 
          conversation.jobId || '', 
          conversation.jobTitle || 'Richiesta',
          messageText
        );
      }

    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const isPublic = conversation?.isPublicContext ?? true;

  return (
    <div className={cn("flex flex-col h-[500px] bg-white rounded-3xl border border-[#D2D2D7]/30 overflow-hidden shadow-inner", className)}>
      {/* Context Alert Banner */}
      <div className={cn(
        "p-3.5 px-6 flex items-start gap-2.5 text-xs font-bold leading-relaxed border-b",
        isPublic 
          ? "bg-amber-50 text-amber-800 border-amber-100" 
          : "bg-green-50 text-green-800 border-green-100"
      )}>
        {isPublic ? (
          <>
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong>Chat di Trattativa:</strong> Non è consentito scambiare indirizzi email, siti o numeri di telefono prima che il preventivo sia accettato. I messaggi sono verificati per la sicurezza.
            </p>
          </>
        ) : (
          <>
            <ShieldCheck className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <p>
              <strong>Contatto Attivo:</strong> Il preventivo è stato accettato! Ora potete scambiarvi i recapiti personali per definire i dettagli dell'intervento.
            </p>
          </>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white/50">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-[#86868B] p-4">
            <ShieldCheck className="w-10 h-10 mb-3 opacity-20 text-[#1D1D1F]" />
            <p className="text-xs font-bold leading-normal">
              Questa è una chat dedicata.<br />Invia un messaggio per iniziare la discussione.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMine = msg.senderId === user.id;
            const showAvatar = idx === messages.length - 1 || messages[idx + 1].senderId !== msg.senderId;

            return (
              <div key={msg.id} className={cn("flex flex-col", isMine ? "items-end" : "items-start")}>
                <div className={cn("flex items-end gap-2 max-w-[85%]", isMine && "flex-row-reverse")}>
                  {showAvatar ? (
                    <div className="w-6 h-6 rounded-full bg-[#F5F5F7] flex items-center justify-center flex-shrink-0 text-[#86868B] shadow-sm border border-[#D2D2D7]/30">
                      <UserIcon className="w-3 h-3" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 flex-shrink-0" />
                  )}
                  <div className={cn(
                    "px-4 py-2.5 shadow-sm text-sm leading-relaxed",
                    isMine 
                      ? "bg-[#1D1D1F] text-white rounded-[1.25rem] rounded-br-sm font-semibold" 
                      : "bg-[#F5F5F7] text-[#1D1D1F] rounded-[1.25rem] rounded-bl-sm border border-[#D2D2D7]/30 font-medium"
                  )}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
                <span className={cn("text-[9px] font-bold text-[#86868B] mt-1 mx-8", isMine ? "text-right" : "text-left")}>
                  {msg.timestamp ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-[#D2D2D7]/30 space-y-2">
        <AnimatePresence>
          {validationError && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-800 text-xs font-bold leading-normal flex items-start gap-2"
            >
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input 
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder="Scrivi un messaggio per accordarti..."
            className="flex-1 rounded-2xl h-11 bg-[#F5F5F7] border-transparent focus:bg-white focus:border-[#D2D2D7]/50 font-medium text-sm"
          />
          <Button 
             type="submit" 
             disabled={!newMessage.trim() || !conversation}
             className="w-11 h-11 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 p-0 flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
