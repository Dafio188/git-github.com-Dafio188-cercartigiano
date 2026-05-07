import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { X, Star, CheckCircle2, User as UserIcon, Shield, MapPin } from 'lucide-react';
import { UserProfile } from '../../types';
import { BadgeList } from '../shared/BadgeList';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';

interface PublicProfileModalProps {
  workerId: string;
  onClose: () => void;
}

export function PublicProfileModal({ workerId, onClose }: PublicProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'workerProfiles', workerId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setProfile(snap.data() as UserProfile);
        }
      } catch (error) {
         handleFirestoreError(error, OperationType.GET, `workerProfiles/${workerId}`);
      } finally {
        setLoading(false);
      }
    };
    if (workerId) fetchProfile();
  }, [workerId]);

  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md bg-[#FBFBFD] border-none rounded-[3rem] p-0 overflow-hidden shadow-2xl">
        <VisuallyHidden>
          <DialogTitle>Profilo Pubblico</DialogTitle>
        </VisuallyHidden>
        
        <div className="p-4 flex justify-end absolute top-0 right-0 z-10">
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full bg-black/5 hover:bg-black/10">
            <X className="w-5 h-5 text-[#1D1D1F]" />
          </Button>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : profile ? (
          <div className="p-8 pb-10 flex flex-col items-center text-center mt-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-50 rounded-[2rem] flex items-center justify-center shadow-inner mb-6 relative">
              <UserIcon className="w-10 h-10 text-blue-600" />
              {profile.isVerified && (
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-sm">
                  <Shield className="w-5 h-5 text-green-500 fill-green-100" />
                </div>
              )}
            </div>

            <h2 className="text-2xl font-black text-[#1D1D1F] tracking-tight">{profile.nome || 'Professionista'}</h2>
            
            {(profile.citta || profile.regione) && (
              <div className="flex items-center gap-1 text-[#86868B] mt-2 text-sm font-medium">
                <MapPin className="w-4 h-4" />
                {profile.citta}{profile.citta && profile.regione ? ', ' : ''}{profile.regione}
              </div>
            )}

            <div className="flex items-center gap-4 mt-6">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 text-lg font-black text-[#1D1D1F]">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  {(profile.rating || 5).toFixed(1)}
                </div>
                <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">Valutazione</span>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 text-lg font-black text-[#1D1D1F]">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  {profile.reviewCount || 0}
                </div>
                <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider">Lavori Fatti</span>
              </div>
            </div>

            {profile.bio && (
              <div className="mt-8 bg-white p-6 rounded-3xl border border-[#D2D2D7]/30 shadow-sm w-full text-left">
                <h3 className="text-xs font-black text-[#86868B] uppercase tracking-wider mb-2">Su di me</h3>
                <p className="text-sm text-[#1D1D1F]/80 leading-relaxed font-medium">
                  {profile.bio}
                </p>
              </div>
            )}

            {profile.badges && profile.badges.length > 0 && (
              <div className="mt-6 w-full flex flex-col items-center">
                <h3 className="text-xs font-black text-[#86868B] uppercase tracking-wider mb-3">Distintivi</h3>
                <BadgeList badges={profile.badges} />
              </div>
            )}
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center flex-col text-[#86868B]">
            <UserIcon className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-medium">Profilo non trovato</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
