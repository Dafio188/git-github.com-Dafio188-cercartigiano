import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { JobQuestion } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { MessageSquare, Send } from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

interface JobQnAProps {
  jobId: string;
  userId: string;
  userName: string;
  role: 'client' | 'worker';
}

export function JobQnA({ jobId, userId, userName, role }: JobQnAProps) {
  const [questions, setQuestions] = useState<JobQuestion[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId) return;

    const q = query(
      collection(db, 'jobQuestions'),
      where('jobId', '==', jobId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobQuestion));
      setQuestions(data);
      setLoading(false);
    }, (error) => {
      console.error("JobQnA onSnapshot error:", error);
    });

    return () => unsubscribe();
  }, [jobId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    try {
      await addDoc(collection(db, 'jobQuestions'), {
        jobId,
        userId,
        userName,
        role,
        text: newQuestion.trim(),
        createdAt: serverTimestamp()
      });
      setNewQuestion('');
    } catch (error) {
      console.error("Error adding question:", error);
      alert("Errore nell'invio del messaggio. Assicurati che non contenga dati personali.");
    }
  };

  return (
    <div className="bg-white rounded-[2rem] border border-[#D2D2D7]/30 overflow-hidden flex flex-col max-h-[600px] shadow-sm">
      <div className="p-6 bg-[#F5F5F7]/50 border-b border-[#D2D2D7]/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-black text-[#1D1D1F] tracking-tight">Domande Pubbliche</h3>
            <p className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest">
              Visibili a tutti - Niente contatti privati
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-sm font-bold text-[#86868B]">Caricamento...</span>
          </div>
        ) : questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-50">
            <MessageSquare className="w-8 h-8 text-[#86868B]" />
            <p className="text-sm font-bold text-[#86868B]">Nessuna domanda ancora.<br/>Chiedi chiarimenti sul lavoro.</p>
          </div>
        ) : (
          questions.map((q) => {
            const isMe = q.userId === userId;
            const isClient = q.role === 'client';
            
            return (
              <div 
                key={q.id} 
                className={cn(
                  "flex flex-col max-w-[85%]",
                  isMe ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <span className="text-[10px] font-black uppercase tracking-widest text-[#86868B] mb-1 px-1 flex items-center gap-1">
                  {isClient ? '👤 Cliente' : '🛠️ Artigiano'} {isMe ? '(Tu)' : q.userName}
                </span>
                <div 
                  className={cn(
                    "px-4 py-3 rounded-2xl text-sm font-bold shadow-sm",
                    isMe 
                      ? "bg-blue-600 text-white rounded-tr-sm" 
                      : isClient 
                        ? "bg-[#1D1D1F] text-white rounded-tl-sm"
                        : "bg-[#F5F5F7] text-[#1D1D1F] border border-[#D2D2D7]/30 rounded-tl-sm"
                  )}
                >
                  {q.text}
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-[#F5F5F7] border-t border-[#D2D2D7]/30 flex gap-2">
        <Input 
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Scrivi una domanda o risposta..."
          className="h-12 rounded-xl bg-white border-none font-bold shadow-sm flex-1"
        />
        <Button 
          type="submit" 
          disabled={!newQuestion.trim()}
          className="h-12 w-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white p-0 shadow-sm"
        >
          <Send className="w-5 h-5" />
        </Button>
      </form>
    </div>
  );
}
