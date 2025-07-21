
"use client";

import React, { createContext, useState, useEffect, ReactNode, useContext, useRef, useCallback } from 'react';

interface AudioPlayerContextType {
  isPlaying: boolean;
  isLoading: boolean;
  audioSrc: string | null;
  playAudio: (src: string) => void;
  stopAudio: () => void;
}

export const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | undefined>(typeof Audio !== 'undefined' ? new Audio() : undefined);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsLoading(false);
    setAudioSrc(null);
  }, []);

  useEffect(() => {
    const currentAudio = audioRef.current;
    if (!currentAudio) return;

    const onPlaying = () => {
        setIsPlaying(true);
        setIsLoading(false);
    };
    const onPause = () => {
        setIsPlaying(false);
        setIsLoading(false);
    };
    const onEnded = () => {
        setIsPlaying(false);
        setIsLoading(false);
        setAudioSrc(null);
    };
    const onWaiting = () => {
        setIsLoading(true);
    };
    const onCanPlay = () => {
        setIsLoading(false);
    }
    
    currentAudio.addEventListener('playing', onPlaying);
    currentAudio.addEventListener('pause', onPause);
    currentAudio.addEventListener('ended', onEnded);
    currentAudio.addEventListener('waiting', onWaiting);
    currentAudio.addEventListener('canplay', onCanPlay);

    return () => {
      currentAudio.removeEventListener('playing', onPlaying);
      currentAudio.removeEventListener('pause', onPause);
      currentAudio.removeEventListener('ended', onEnded);
      currentAudio.removeEventListener('waiting', onWaiting);
      currentAudio.removeEventListener('canplay', onCanPlay);
      stopAudio();
    };
  }, [stopAudio]);

  const playAudio = (src: string) => {
    const currentAudio = audioRef.current;
    if (currentAudio) {
      stopAudio();
      setAudioSrc(src);
      currentAudio.src = src;
      currentAudio.play().catch(e => {
        console.error("Audio playback failed:", e);
        stopAudio();
      });
    }
  };

  const value = {
    isPlaying,
    isLoading,
    audioSrc,
    playAudio,
    stopAudio,
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
};
