import React, { useRef, useEffect, useState } from 'react';
import { Input } from './ui/input';
import { MapPin, Sparkles, Loader2 } from 'lucide-react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { cn } from '../lib/utils';
import { parseAddressWithAI } from '../services/aiService';
import { motion } from 'motion/react';

interface AddressInputProps {
  value: string;
  onChange: (address: string, lat?: number, lng?: number, details?: any) => void;
  placeholder?: string;
  className?: string;
}

export function AddressInput({ value, onChange, placeholder, className }: AddressInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const placesLib = useMapsLibrary('places');
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const handleAiParse = async () => {
    if (!value || value.length < 5) return;
    setIsParsing(true);
    try {
      const result = await parseAddressWithAI(value);
      if (result && result.formattedAddress) {
        // If we have lat/lng from AI, use them, otherwise let parent handle
        onChange(result.formattedAddress, result.lat, result.lng, result);
      }
    } catch (error) {
      console.error("AI Address Parse error:", error);
    } finally {
      setIsParsing(false);
    }
  };

  useEffect(() => {
    if (!placesLib || !inputRef.current) return;

    const options = {
      types: ['address'],
      componentRestrictions: { country: 'it' },
      fields: ['address_components', 'formatted_address', 'geometry']
    };

    autocompleteRef.current = new placesLib.Autocomplete(inputRef.current, options);

    const listener = autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();
      if (place && place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        
        const details: any = {
           streetNumber: '',
           route: '',
           city: '',
           province: '',
           region: '',
           postalCode: '',
           lat,
           lng
        };

        place.address_components?.forEach(comp => {
          const types = comp.types;
          if (types.includes('street_number')) details.streetNumber = comp.long_name;
          if (types.includes('route')) details.route = comp.long_name;
          
          // City extraction with multiple fallbacks
          if (types.includes('locality') || types.includes('postal_town')) {
            details.city = comp.long_name;
          } else if (!details.city && types.includes('sublocality_level_1')) {
            details.city = comp.long_name;
          }

          if (types.includes('administrative_area_level_2')) details.province = comp.short_name;
          if (types.includes('administrative_area_level_1')) details.region = comp.long_name;
          if (types.includes('postal_code')) details.postalCode = comp.long_name;
        });

        // Ensure we pass the precise details back to parent
        onChange(place.formatted_address || '', lat, lng, details);
      }
    });

    return () => {
      if (listener) listener.remove();
    };
  }, [placesLib, onChange]);

  return (
    <div className="relative w-full group">
      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86868B] z-10" />
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder || "Inserisci indirizzo o scrivi liberamente..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleAiParse();
          }
        }}
        className={cn("pl-12 pr-24", className)}
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {value.length > 5 && (
           <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              boxShadow: ["0 0 0px rgba(37, 99, 235, 0)", "0 0 15px rgba(37, 99, 235, 0.4)", "0 0 0px rgba(37, 99, 235, 0)"] 
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 2,
              ease: "easeInOut"
            }}
            onClick={(e) => {
              e.preventDefault();
              handleAiParse();
            }}
            disabled={isParsing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-xl shadow-blue-500/30 active:scale-95 transition-all disabled:opacity-50 border border-blue-400/30"
          >
            {isParsing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span className="text-xs font-black uppercase tracking-tight">Magia AI</span>
          </motion.button>
        )}
      </div>
    </div>
  );
}

