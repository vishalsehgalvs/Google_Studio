
"use client";

import { GoogleMap, useJsApiLoader, LoadScriptProps } from '@react-google-maps/api';
import { AlertCircle, Loader2 } from 'lucide-react';
import { memo } from 'react';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.5rem',
};

const libraries: LoadScriptProps['libraries'] = ['places'];

interface MapComponentProps {
    coordinates: { lat: number, lng: number };
    apiKey: string;
}

function MapComponent({ coordinates, apiKey }: MapComponentProps) {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: apiKey,
        libraries,
    });

    if (loadError) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-4 bg-muted h-full rounded-md">
                <AlertCircle className="w-12 h-12 text-destructive mb-4" />
                <h3 className="font-bold text-lg text-destructive">Map Loading Error</h3>
                <p className="text-muted-foreground text-sm mt-2">Could not load the map. This might be due to a network issue or an invalid API key configuration.</p>
                <p className="text-muted-foreground text-xs mt-1">{loadError.message}</p>
            </div>
        );
    }
    
    if (!isLoaded) {
      return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-primary"/>
            <p className="ml-2">Loading Map Data...</p>
        </div>
      );
    }
    
    return (
        <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={coordinates}
            zoom={15}
            mapTypeId="satellite"
            options={{
                zoomControl: false,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
            }}
        />
    );
};

export default memo(MapComponent);
