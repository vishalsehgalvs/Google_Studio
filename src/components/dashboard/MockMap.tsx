
"use client";

import Image from 'next/image';

export default function MockMap() {
  return (
    <div className="relative w-full h-full bg-gray-300">
      <Image 
        src="https://placehold.co/1000x500.png"
        alt="Satellite view of a farm field"
        fill
        className="object-cover"
        data-ai-hint="satellite farm"
      />
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
                <div className="absolute top-0 left-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
            </div>
        </div>
    </div>
  );
}
