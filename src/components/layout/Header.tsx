"use client";

import { Leaf, LogOut, Volume2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAudioPlayer } from '@/context/AudioPlayerContext';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

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

  const languages = [
    { value: "en", label: "English" },
    { value: "hi", label: "हिन्दी (Hindi)" },
    { value: "mr", label: "मराठी (Marathi)" },
    { value: "bn", label: "বাংলা (Bengali)" },
    { value: "gu", label: "ગુજરાતી (Gujarati)" },
    { value: "kn", label: "ಕನ್ನಡ (Kannada)" },
    { value: "ml", label: "മലയാളം (Malayalam)" },
    { value: "pa", label: "ਪੰਜਾਬੀ (Punjabi)" },
    { value: "ta", label: "தமிழ் (Tamil)" },
    { value: "te", label: "తెలుగు (Telugu)" },
    { value: "ur", label: "اردو (Urdu)" },
    { value: "es", label: "Español (Spanish)" },
    { value: "fr", label: "Français (French)" },
    { value: "de", label: "Deutsch (German)" },
    { value: "pt", label: "Português (Portuguese)" },
    { value: "ru", label: "Русский (Russian)" },
    { value: "zh-CN", label: "中文 (Chinese)" },
    { value: "ja", label: "日本語 (Japanese)" },
    { value: "ar", label: "العربية (Arabic)" },
  ];

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
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Language" />
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