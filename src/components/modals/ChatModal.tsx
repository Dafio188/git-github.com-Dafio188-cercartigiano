import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  doc, 
  setDoc,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import { User, Job, DirectMessage } from '../../types';
import { Send, User as UserIcon, ShieldCheck, Lock, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';
import { notifyNewMessage } from '../../lib/notifications';

interface ChatModalProps {
  user: User;
  job: Job;
  onClose: () => void;
}

export function ChatModal({ user, job, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversationId = job.id;
  const isClient = user.id === job.clientId;
  const isWinner = job.assignedWorkerId === user.id;
  const isLocked = job.status !== 'open' && !isClient && !isWinner;

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load messages
  useEffect(() => {
    if (isLocked || !user?.id) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      where('participantIds', 'array-contains', user.id)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      let msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DirectMessage));
      msgs.sort((a, b) => {
        // Se a.timestamp è null (messaggio in corso di salvataggio), mettiamo un dateA molto grande così va in fondo
        const dateA = a.timestamp 
          ? ((a.timestamp as any).seconds ? (a.timestamp as any).seconds * 1000 : new Date(a.timestamp as unknown as string).getTime()) 
          : Date.now() + 100000;
        
        const dateB = b.timestamp 
          ? ((b.timestamp as any).seconds ? (b.timestamp as any).seconds * 1000 : new Date(b.timestamp as unknown as string).getTime()) 
          : Date.now() + 100000;
        return dateA - dateB;
      });
      if (msgs.length > 200) {
        msgs = msgs.slice(-200);
      }
      setMessages(msgs);
      setLoading(false);
    }, (error) => {
      console.error("ChatModal messages onSnapshot error full:", error);
      // We don't want to throw to the global boundary necessarily, just log it.
    });

    return () => unsub();
  }, [conversationId, isLocked, user?.id]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || isLocked) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      // Ensure conversation doc exists
      const convRef = doc(db, 'conversations', conversationId);
      const convSnap = await getDoc(convRef);
      if (!convSnap.exists()) {
        await setDoc(convRef, {
          id: conversationId,
          jobId: job.id,
          jobTitle: job.title,
          participants: [job.clientId],
          lastUpdate: serverTimestamp()
        });
      }

      const defaultIds = [job.clientId, user.id];
      if (job.assignedWorkerId) defaultIds.push(job.assignedWorkerId);
      if (!job.assignedWorkerId) defaultIds.push('SHARED'); // 'open' job chat is shared

      const pIds = Array.from(new Set(defaultIds.filter(Boolean) as string[]));

      await addDoc(collection(db, 'messages'), {
        conversationId: conversationId,
        senderId: user.id,
        participantIds: pIds,
        text: messageText,
        timestamp: serverTimestamp(),
      });

      await updateDoc(convRef, {
        lastMessage: messageText,
        lastUpdate: serverTimestamp()
      });

      // Simple notification logic
      // Se scrive un artigiano, notifichiamo il cliente
      if (!isClient) {
        await notifyNewMessage(
          job.clientId, 
          user.nome || 'Un Artigiano', 
          job.id, 
          job.title,
          messageText
        );
      }
      // Se scrive il cliente e c'è un artigiano assegnato, notifichiamo lui
      else if (isClient && job.assignedWorkerId) {
        await notifyNewMessage(
          job.assignedWorkerId, 
          user.nome || 'Il Cliente', 
          job.id, 
          job.title,
          messageText
        );
      }

    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl bg-[#FBFBFD] border-none rounded-[3rem] p-0 overflow-hidden shadow-2xl h-[80vh] flex flex-col items-center">
        <VisuallyHidden>
          <DialogTitle>Chat Condivisa</DialogTitle>
        </VisuallyHidden>
        <div className="w-full h-full flex flex-col overflow-hidden bg-white">
          {/* Header */}
          <div className="p-4 lg:p-6 border-b border-[#D2D2D7]/30 flex items-center justify-between bg-[#FBFBFD]">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                <X className="w-5 h-5 text-[#1D1D1F]" />
              </Button>
              <div className="w-10 h-10 bg-[#1D1D1F] rounded-full flex items-center justify-center text-white shadow-md">
                <UserIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#1D1D1F] leading-tight">
                  {job.title}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {isLocked ? (
                    <>
                      <Lock className="w-3 h-3 text-red-500" />
                      <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
                        Chat Chiusa
                      </span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3 h-3 text-green-500" />
                      <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest">
                        Chat Condivisa e Protetta
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 bg-white">
          {isLocked ? (
             <div className="h-full flex flex-col items-center justify-center text-center text-[#86868B]">
               <Lock className="w-12 h-12 mb-4 opacity-20" />
               <p className="text-sm font-bold text-red-500 max-w-sm">Questa chat è chiusa. Il lavoro è stato assegnato ad un altro professionista.</p>
             </div>
          ) : messages.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-center text-[#86868B]">
               <ShieldCheck className="w-12 h-12 mb-4 opacity-20" />
               <p className="text-sm font-bold">Questa chat è condivisa.<br/>Tutti i partecipanti possono leggere i messaggi fino all'assegnazione del lavoro.</p>
             </div>
          ) : (
            messages.map((msg, idx) => {
              const isMine = msg.senderId === user.id;
              const isClientMsg = msg.senderId === job.clientId;
              const showAvatar = idx === messages.length - 1 || messages[idx + 1].senderId !== msg.senderId;

              return (
                <div key={msg.id} className={cn("flex flex-col", isMine ? "items-end" : "items-start")}>
                  <div className={cn("flex items-end gap-2 max-w-[85%] lg:max-w-[75%]", isMine && "flex-row-reverse")}>
                    {showAvatar ? (
                      <div className="w-6 h-6 rounded-full bg-[#F5F5F7] flex items-center justify-center flex-shrink-0 text-[#86868B] shadow-sm border border-[#D2D2D7]/30">
                        <UserIcon className="w-3 h-3" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 flex-shrink-0" />
                    )}
                    <div className={cn(
                      "px-5 py-3 shadow-sm",
                      isMine 
                        ? "bg-[#1D1D1F] text-white rounded-3xl rounded-br-md" 
                        : isClientMsg
                        ? "bg-blue-50 text-blue-900 rounded-3xl rounded-bl-md border border-blue-100"
                        : "bg-[#F5F5F7] text-[#1D1D1F] rounded-3xl rounded-bl-md border border-[#D2D2D7]/30"
                    )}>
                      {!isMine && (
                        <p className={cn("text-[10px] font-black uppercase mb-1", isClientMsg ? "text-blue-600" : "text-[#86868B]")}>
                          {isClientMsg ? "Cliente" : "Artigiano"}
                        </p>
                      )}
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
              disabled={isLocked}
              className="flex-1 rounded-2xl h-12 bg-[#F5F5F7] border-transparent focus:bg-white focus:border-[#D2D2D7]/50 disabled:opacity-50"
            />
            <Button 
               type="submit" 
               disabled={!newMessage.trim() || isLocked}
               className="w-12 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:bg-[#D2D2D7]"
            >
              <Send className="w-5 h-5 -ml-1" />
            </Button>
          </form>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
