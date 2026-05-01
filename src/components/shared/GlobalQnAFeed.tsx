import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { MessageSquare } from 'lucide-react';
import { JobQuestion } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

export function GlobalQnAFeed() {
  const [questions, setQuestions] = useState<JobQuestion[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'jobQuestions'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobQuestion));
      setQuestions(data);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-white rounded-[2rem] border border-[#D2D2D7]/30 p-6 lg:p-8 shadow-sm">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
          <MessageSquare className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-black text-[#1D1D1F]">Ultime Domande</h3>
          <p className="text-sm font-bold text-[#86868B]">Interazioni recenti tra clienti e artigiani.</p>
        </div>
      </div>

      <div className="space-y-4">
        {questions.length === 0 ? (
          <p className="text-sm font-bold text-[#86868B]">Nessuna interazione recente.</p>
        ) : (
          questions.map(q => (
            <div key={q.id} className="p-4 bg-[#F5F5F7]/50 rounded-2xl border border-[#D2D2D7]/30">
              <div className="flex items-center gap-2 mb-2">
                 <span className="text-[10px] font-black uppercase tracking-widest text-[#86868B]">
                   {q.role === 'client' ? '👤 Cliente' : '🛠️ Artigiano'} {q.userName}
                 </span>
                 <span className="w-1 h-1 rounded-full bg-[#D2D2D7]" />
                 <span className="text-[10px] font-bold text-[#86868B]">
                   {q.createdAt?.seconds ? formatDistanceToNow(new Date(q.createdAt.seconds * 1000), { addSuffix: true, locale: it }) : 'ora'}
                 </span>
              </div>
              <p className="text-sm font-bold text-[#1D1D1F] italic">"{q.text}"</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
