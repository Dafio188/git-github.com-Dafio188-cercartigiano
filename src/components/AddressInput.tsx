import React, { useRef, useEffect } from 'react';
import { Input } from './ui/input';
import { MapPin } from 'lucide-react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { cn } from '../lib/utils';
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
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!placesLib || !inputRef.current) return;

    const options = {
      types: ['geocode', 'establishment'],
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
        onChangeRef.current(place.formatted_address || '', lat, lng, details);
      }
    });

    return () => {
      if (listener) listener.remove();
    };
  }, [placesLib]);

  return (
    <div className="relative w-full group">
      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86868B] z-10" />
      <Input
        ref={inputRef}
        type="text"
        autoComplete="new-password" /* Hack per forzare Chrome a ignorare l'autofill degli indirizzi */
        name="address-search-force-new"
        placeholder={placeholder || "Inserisci indirizzo o scrivi liberamente..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
          }
        }}
        className={cn("pl-12 pr-4", className)}
      />
    </div>
  );
}

