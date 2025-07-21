
"use client";

import { Key } from 'lucide-react';
import Image from 'next/image';
import { useTranslation } from '@/context/LanguageContext';

export default function MockMap() {
  const { t } = useTranslation();
  return (
    <div className="relative w-full h-full bg-gray-300">
      <Image 
        src="https://placehold.co/1000x500.png"
        alt="Satellite view of a farm field"
        layout="fill"
        objectFit="cover"
        className="opacity-70"
        data-ai-hint="satellite farm"
      />
      <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-center text-white p-4">
        <Key className="h-10 w-10 mb-4 text-destructive"/>
        <div className="bg-black/60 p-4 rounded-lg shadow-2xl">
            <h3 className="font-bold text-lg">Google Maps API Key is Missing</h3>
            <p className="text-sm mt-1">Please add your API key to the <code className="bg-gray-700 px-1 py-0.5 rounded-sm text-yellow-300">.env</code> file to enable the map view.</p>
        </div>
      </div>
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
                <div className="absolute top-0 left-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
            </div>
        </div>
    </div>
  );
}
