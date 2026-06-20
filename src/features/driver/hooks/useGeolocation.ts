import { useState, useEffect } from 'react';

interface LocationData {
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
  error: string | null;
}

export const useGeolocation = (enabled: boolean = false, intervalMs: number = 5000) => {
  const [location, setLocation] = useState<LocationData>({
    latitude: 0,
    longitude: 0,
    speed: null,
    heading: null,
    error: null,
  });

  useEffect(() => {
    if (!enabled) return;

    if (!navigator.geolocation) {
      setLocation(prev => ({ ...prev, error: 'Geolocation is not supported by your browser' }));
      return;
    }

    let watchId: number;

    const startTracking = () => {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            speed: position.coords.speed, // in meters per second, need to convert to km/h later
            heading: position.coords.heading,
            error: null,
          });
        },
        (error) => {
          setLocation(prev => ({ ...prev, error: error.message }));
        },
        {
          enableHighAccuracy: true,
          timeout: intervalMs,
          maximumAge: 0,
        }
      );
    };

    startTracking();

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [enabled, intervalMs]);

  return location;
};
