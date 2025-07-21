"use client";

import { Leaf, LogOut, Volume2, Languages } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAudioPlayer } from '@/context/AudioPlayerContext';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { useUser } from '@/context/UserContext';
import { useContext } from 'react';
import { LanguageContext, languages } from '@/context/LanguageContext';

type HeaderProps = {
  onReadAloud: () => void;
};

export default function Header({ onReadAloud }: HeaderProps) {
  const { isPlaying, stopAudio } = useAudioPlayer();
  const { logout } = useUser();
  const langContext = useContext(LanguageContext);

  const handleReadAloudClick = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      onReadAloud();
    }
  };

  const handleLogout = () => {
    stopAudio();
    logout();
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
          <Select value={langContext?.languageCode} onValueChange={langContext?.setLanguageCode}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4" />
                <SelectValue placeholder="Language" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <ScrollArea className="h-72">
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </ScrollArea>
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
