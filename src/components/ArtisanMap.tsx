import React, { useState, useEffect, useMemo } from 'react';
import { 
  Map, 
  AdvancedMarker, 
  Pin, 
  InfoWindow, 
  useAdvancedMarkerRef 
} from '@vis.gl/react-google-maps';
import { UserProfile } from '../types';
import { Star, Shield, MapPin, Hammer, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

interface ArtisanMapProps {
  professionals: UserProfile[];
  center?: { lat: number; lng: number };
  onSelectArtisan?: (artisan: UserProfile) => void;
}

// Function to add jitter to coordinates for privacy (approx 200-500m)
const jitter = (coord: number) => {
  return coord + (Math.random() - 0.5) * 0.005;
};

export function ArtisanMap({ professionals, center, onSelectArtisan }: ArtisanMapProps) {
  const [selectedArtisan, setSelectedArtisan] = useState<UserProfile | null>(null);
  
  // Memoize jittered positions so they don't jump on every re-render
  const jitteredPros = useMemo(() => {
    return professionals
      .filter(p => p.location?.lat && p.location?.lng)
      .map(p => ({
        ...p,
        jitteredLocation: {
          lat: jitter(p.location!.lat),
          lng: jitter(p.location!.lng)
        }
      }));
  }, [professionals]);

  const defaultCenter = center || { lat: 41.9028, lng: 12.4964 }; // Rome

  return (
    <div className="w-full h-full min-h-[500px] rounded-[2.5rem] overflow-hidden border border-[#D2D2D7]/30 shadow-2xl relative">
      <Map
        defaultCenter={defaultCenter}
        defaultZoom={11}
        mapId="DEMO_MAP_ID"
        className="w-full h-full"
        disableDefaultUI={false}
      >
        {jitteredPros.map((prof) => (
          <ArtisanMarker 
            key={prof.uid || prof.id} 
            prof={prof} 
            isSelected={selectedArtisan?.uid === prof.uid}
            onSelect={() => setSelectedArtisan(prof)}
          />
        ))}

        {selectedArtisan && (
          <InfoWindow
            position={(selectedArtisan as any).jitteredLocation}
            onCloseClick={() => setSelectedArtisan(null)}
            pixelOffset={[0, -10]}
          >
            <div className="p-2 max-w-[240px] font-sans">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0 overflow-hidden">
                  {selectedArtisan.photoURL ? (
                    <img src={selectedArtisan.photoURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Hammer className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#1D1D1F] leading-tight">{selectedArtisan.displayName}</h4>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-[10px] font-bold text-[#86868B]">{selectedArtisan.rating || 'Nuovo'}</span>
                  </div>
                </div>
              </div>
              
              <p className="text-[11px] text-[#86868B] line-clamp-2 mb-3 leading-relaxed">
                {selectedArtisan.bio || "Professionista verficato da CercArtigiano."}
              </p>

              <Button 
                size="sm" 
                className="w-full h-9 rounded-lg bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest"
                onClick={() => onSelectArtisan?.(selectedArtisan)}
              >
                Visualizza Profilo
              </Button>
            </div>
          </InfoWindow>
        )}
      </Map>
    </div>
  );
}

function ArtisanMarker({ prof, isSelected, onSelect }: { prof: any, isSelected: boolean, onSelect: () => void }) {
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <AdvancedMarker
      ref={markerRef}
      position={prof.jitteredLocation}
      onClick={onSelect}
      title={prof.displayName}
    >
      <div className={`p-1 rounded-full transition-all duration-300 ${isSelected ? 'scale-125' : 'scale-100'}`}>
        <div className="relative">
          <Pin 
            background={isSelected ? "#2563eb" : "#1D1D1F"} 
            borderColor="white" 
            glyphColor="white" 
            scale={isSelected ? 1.2 : 1}
          />
          {prof.isVerified && (
            <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-0.5 border border-white">
              <Shield className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </div>
      </div>
    </AdvancedMarker>
  );
}
