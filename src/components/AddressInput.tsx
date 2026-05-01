import React, { useRef, useEffect } from 'react';
import { Input } from './ui/input';
import { MapPin } from 'lucide-react';
import { useGoogleMaps } from '../lib/google-maps';

interface AddressInputProps {
  value: string;
  onChange: (address: string, lat?: number, lng?: number, details?: any) => void;
  placeholder?: string;
  className?: string;
}

export function AddressInput({ value, onChange, placeholder, className }: AddressInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { isLoaded, google } = useGoogleMaps();

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

  return (
    <div className="relative w-full">
      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#86868B] z-10" />
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={className}
      />
    </div>
  );
}
