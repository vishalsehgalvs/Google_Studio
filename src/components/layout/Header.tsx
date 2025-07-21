
"use client";

import { Leaf, Volume2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAudioPlayer } from '@/context/AudioPlayerContext';

type HeaderProps = {
  onReadAloud: () => void;
};

export default function Header({ onReadAloud }: HeaderProps) {
  const { isPlaying, stopAudio } = useAudioPlayer();

  const handleReadAloudClick = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      onReadAloud();
    }
  };

  return (
    <header className="bg-card shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Leaf className="text-primary h-8 w-8" />
          <h1 className="text-3xl font-headline font-bold text-foreground">
            FarmAssist
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Select defaultValue="en">
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="hi">हिन्दी</SelectItem>
              <SelectItem value="mr">मराठी</SelectItem>
            </SelectContent>
          </Select>
          <button onClick={handleReadAloudClick} className="p-2 rounded-full hover:bg-muted" title={isPlaying ? "Stop Reading" : "Read Page Aloud"}>
            <Volume2 className={`text-primary h-6 w-6 ${isPlaying ? 'animate-pulse' : ''}`} />
            <span className="sr-only">{isPlaying ? "Stop Reading" : "Read Page Aloud"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
