
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

// This is a simplified mock reverse geocoding function.
// In a real-world app, you would use an API like Google Maps Geocoding.
const mockReverseGeocode = (coords: Coordinates): string => {
    const locations = [
        { name: 'Nagpur', lat: 21.1458, lng: 79.0882 },
        { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
        { name: 'Pune', lat: 18.5204, lng: 73.8567 },
        { name: 'Delhi', lat: 28.7041, lng: 77.1025 },
        // Add more locations as needed for better mock coverage
    ];

    let closestLocation: string | null = null;
    let minDistance = Infinity;

    for (const loc of locations) {
        const distance = Math.sqrt(
            Math.pow(coords.lat - loc.lat, 2) + Math.pow(coords.lng - loc.lng, 2)
        );
        if (distance < minDistance) {
            minDistance = distance;
            closestLocation = loc.name;
        }
    }
    
    // A threshold of ~1 degree is roughly 111km. If a known city is within this range, use it.
    if (closestLocation && minDistance < 1) {
        return closestLocation;
    }

    // If no known city is nearby, return the coordinates as a string.
    return `Lat: ${coords.lat.toFixed(4)}, Lng: ${coords.lng.toFixed(4)}`;
}

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [locationName, setLocationName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    setLocationName("Determining location...");

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser. Defaulting to Nagpur.");
      setLocationName("Nagpur");
      setCoordinates({ lat: 21.1458, lng: 79.0882 });
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
        const name = mockReverseGeocode(coords);
        setLocationName(name);
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(`Location access denied. Defaulting to Nagpur. Error: ${err.message}`);
        setLocationName("Nagpur");
        setCoordinates({ lat: 21.1458, lng: 79.0882 });
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
