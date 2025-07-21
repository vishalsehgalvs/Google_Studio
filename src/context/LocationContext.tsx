
"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface Coordinates {
  lat: number;
  lng: number;
}

interface LocationContextType {
  coordinates: Coordinates | null;
  locationName: string;
  setLocationName: (name: string) => void;
  error: string | null;
  loading: boolean;
}

export const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Mock reverse geocoding. In a real app, use an API like Google Maps Geocoding API.
const mockReverseGeocode = (coords: Coordinates): string => {
    // This is a very simple mock. A real implementation would be more complex.
    // Coordinates for Nagpur: 21.1458, 79.0882
    if (Math.abs(coords.lat - 21.1) < 0.5 && Math.abs(coords.lng - 79.1) < 0.5) {
        return "Nagpur";
    }
    // Coordinates for Mumbai: 19.0760, 72.8777
    if (Math.abs(coords.lat - 19.0) < 0.5 && Math.abs(coords.lng - 72.8) < 0.5) {
        return "Mumbai";
    }
    return "Unknown Location";
}

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [locationName, setLocationName] = useState<string>("Nagpur");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLocationName("Nagpur"); // Default location
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: Coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCoordinates(coords);
        // In a real app, you would use a reverse geocoding API here.
        const name = mockReverseGeocode(coords);
        setLocationName(name);
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(`Location access denied. Showing default data for Nagpur. Error: ${err.message}`);
        setLocationName("Nagpur"); // Default location on error
        setLoading(false);
      }
    );
  }, []);

  const value = {
    coordinates,
    locationName,
    setLocationName,
    error,
    loading,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};
