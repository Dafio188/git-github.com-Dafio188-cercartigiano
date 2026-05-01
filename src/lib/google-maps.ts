import { useEffect, useState } from 'react';

let isLoading = false;
let isLoaded = false;
let googleInstance: any = null;

export function useGoogleMaps() {
  const [loaded, setLoaded] = useState(isLoaded);

  useEffect(() => {
    if (isLoaded) {
      setLoaded(true);
      return;
    }

    if (isLoading) return;

    isLoading = true;
    const script = document.createElement('script');
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.warn("Google Maps API Key missing");
      isLoading = false;
      return;
    }

    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = () => {
      isLoaded = true;
      isLoading = false;
      googleInstance = (window as any).google;
      setLoaded(true);
    };
    document.head.appendChild(script);
  }, []);

  return { isLoaded: loaded, google: googleInstance };
}
