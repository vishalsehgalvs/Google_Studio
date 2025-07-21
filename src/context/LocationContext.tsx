
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

// In a real app, use an API like Google Maps Geocoding API.
// This mock now includes more cities relevant to the app.
const mockReverseGeocode = (coords: Coordinates): string => {
    const locations = [
        { name: 'Nagpur', lat: 21.1458, lng: 79.0882 },
        { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
        { name: 'Pune', lat: 18.5204, lng: 73.8567 },
        { name: 'Delhi', lat: 28.7041, lng: 77.1025 },
    ];

    let closestLocation = 'Nagpur'; // Default location
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
    
    // If the closest known location is still too far, we can consider it unknown.
    // A threshold of ~1 degree is roughly 111km.
    if (minDistance > 1) {
        return "Nagpur"; // Fallback to a default if user is not near any known city
    }

    return closestLocation;
}

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [locationName, setLocationName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
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
