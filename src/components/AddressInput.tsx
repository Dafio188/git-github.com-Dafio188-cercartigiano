import React, { useRef, useEffect, useState } from 'react';
import { Input } from './ui/input';
import { MapPin, Sparkles } from 'lucide-react';
import { useGoogleMaps } from '../lib/google-maps';
import { parseAddressWithAI } from '../services/aiService';

interface AddressInputProps {
  value: string;
  onChange: (address: string, lat?: number, lng?: number, details?: any) => void;
  placeholder?: string;
  className?: string;
}

export function AddressInput({ value, onChange, placeholder, className }: AddressInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { isLoaded, google } = useGoogleMaps();
  const [parsing, setParsing] = useState(false);

  useEffect(() => {
    if (!isLoaded || !google || !inputRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      componentRestrictions: { country: 'it' }
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        
        const details: any = {
           streetNumber: '',
           route: '',
           city: '',
           province: '',
           region: '',
           postalCode: ''
        };

        place.address_components?.forEach(comp => {
          const types = comp.types;
          if (types.includes('street_number')) details.streetNumber = comp.long_name;
          if (types.includes('route')) details.route = comp.long_name;
          if (types.includes('locality')) details.city = comp.long_name;
          if (types.includes('administrative_area_level_2')) details.province = comp.short_name;
          if (types.includes('administrative_area_level_1')) details.region = comp.long_name;
          if (types.includes('postal_code')) details.postalCode = comp.long_name;
        });

        onChange(place.formatted_address || '', lat, lng, details);
      }
    });
  }, [isLoaded, google, onChange]);

  const handleAIParsing = async () => {
    if (!value || parsing) return;
    setParsing(true);
    try {
      const details = await parseAddressWithAI(value);
      if (details) {
        onChange(details.route || value, details.lat, details.lng, details);
      }
    } finally {
      setParsing(false);
    }
  };

  return (
    <div className="relative w-full group">
      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86868B] z-10" />
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleAIParsing();
          }
        }}
        className={className}
      />
      {value && value.length > 5 && (
        <button
          onClick={handleAIParsing}
          disabled={parsing}
          className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors z-10 disabled:opacity-50"
          type="button"
        >
          {parsing ? (
            <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Sparkles className="w-3 h-3 text-blue-500" />
          )}
          <span className="hidden sm:inline">AI Auto-Compila</span>
        </button>
      )}
    </div>
  );
}
