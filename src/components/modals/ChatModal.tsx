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
import { Send, User as UserIcon, X, ChevronLeft, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';
import { notifyNewMessage } from '../../lib/notifications';

interface ChatModalProps {
  user: User;
  conversationId: string;
  onClose: () => void;
}

export function ChatModal({ user, conversationId, onClose }: ChatModalProps) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversation details
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'conversations', conversationId), (docSnap) => {
      if (docSnap.exists()) {
        setConversation({ id: docSnap.id, ...docSnap.data() } as Conversation);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [conversationId]);

  // Load messages
  useEffect(() => {
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      where('participantIds', 'array-contains', user.id)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      let msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DirectMessage));
      msgs.sort((a, b) => {
        const dateA = a.timestamp ? (a.timestamp as any).seconds ? (a.timestamp as any).seconds * 1000 : new Date(a.timestamp as unknown as string).getTime() : 0;
        const dateB = b.timestamp ? (b.timestamp as any).seconds ? (b.timestamp as any).seconds * 1000 : new Date(b.timestamp as unknown as string).getTime() : 0;
        return dateA - dateB;
      });
      if (msgs.length > 200) {
        msgs = msgs.slice(-200);
      }
      setMessages(msgs);
    });

    return () => unsub();
  }, [conversationId, user.id]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !conversation) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
       await addDoc(collection(db, 'messages'), {
        conversationId: conversation.id,
        senderId: user.id,
        participantIds: conversation.participants,
        text: messageText,
        timestamp: serverTimestamp(),
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
          conversation.jobId, 
          conversation.jobTitle || 'Richiesta',
          messageText
        );
      }

    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1D1D1F]/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl flex flex-col h-[80vh] overflow-hidden border border-[#D2D2D7]/30"
      >
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-[#D2D2D7]/30 flex items-center justify-between bg-[#FBFBFD]">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <ChevronLeft className="w-5 h-5 text-[#1D1D1F]" />
            </Button>
            <div className="w-10 h-10 bg-[#1D1D1F] rounded-full flex items-center justify-center text-white shadow-md">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#1D1D1F] leading-tight">
                {loading ? 'Caricamento...' : conversation?.jobTitle || 'Chat di Lavoro'}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-green-500" />
                <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest">
                  Chat Privata e Protetta
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 bg-white">
          {messages.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-center text-[#86868B]">
               <ShieldCheck className="w-12 h-12 mb-4 opacity-20" />
               <p className="text-sm font-bold">Questa chat è privata.<br/>Invia il primo messaggio per accordarti.</p>
             </div>
          ) : (
            messages.map((msg, idx) => {
              const isMine = msg.senderId === user.id;
              const showAvatar = idx === messages.length - 1 || messages[idx + 1].senderId !== msg.senderId;

              return (
                <div key={msg.id} className={cn("flex flex-col", isMine ? "items-end" : "items-start")}>
                  <div className={cn("flex items-end gap-2 max-w-[85%] lg:max-w-[75%]", isMine && "flex-row-reverse")}>
                    {showAvatar ? (
                      <div className="w-6 h-6 rounded-full bg-[#F5F5F7] flex items-center justify-center flex-shrink-0 text-[#86868B] shadow-sm border border-[#D2D2D7]/30 cursor-pointer hover:bg-gray-200">
                        <UserIcon className="w-3 h-3" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 flex-shrink-0" />
                    )}
                    <div className={cn(
                      "px-5 py-3 shadow-sm",
                      isMine 
                        ? "bg-[#1D1D1F] text-white rounded-3xl rounded-br-md" 
                        : "bg-[#F5F5F7] text-[#1D1D1F] rounded-3xl rounded-bl-md border border-[#D2D2D7]/30"
                    )}>
                      <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                  <span className={cn("text-[10px] font-bold text-[#86868B] mt-1 mx-9", isMine ? "text-right" : "text-left")}>
                    {msg.timestamp ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-4 bg-white border-t border-[#D2D2D7]/30">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Scrivi un messaggio..."
              className="flex-1 rounded-2xl h-12 bg-[#F5F5F7] border-transparent focus:bg-white focus:border-[#D2D2D7]/50"
            />
            <Button 
               type="submit" 
               disabled={!newMessage.trim() || !conversation}
               className="w-12 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
            >
              <Send className="w-5 h-5 -ml-1" />
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
