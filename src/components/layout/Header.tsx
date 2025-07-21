
"use client";

import { Leaf, LogOut, Volume2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAudioPlayer } from '@/context/AudioPlayerContext';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';

type HeaderProps = {
  onReadAloud: () => void;
};

export default function Header({ onReadAloud }: HeaderProps) {
  const { isPlaying, stopAudio } = useAudioPlayer();
  const router = useRouter();

  const handleReadAloudClick = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      onReadAloud();
    }
  };

  const handleLogout = () => {
    stopAudio();
    router.push('/');
  }

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
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
              <SelectItem value="mr">मराठी (Marathi)</SelectItem>
              <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
              <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
              <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
              <SelectItem value="kn">ಕನ್ನಡ (Kannada)</SelectItem>
            </SelectContent>
          </Select>
          <button onClick={handleReadAloudClick} className="p-2 rounded-full hover:bg-muted" title={isPlaying ? "Stop Reading" : "Read Page Aloud"}>
            <Volume2 className={`text-primary h-6 w-6 ${isPlaying ? 'animate-pulse' : ''}`} />
            <span className="sr-only">{isPlaying ? "Stop Reading" : "Read Page Aloud"}</span>
          </button>
          <Button onClick={handleLogout} variant="ghost" size="icon" title="Logout">
            <LogOut className="text-destructive h-6 w-6"/>
            <span className="sr-only">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
