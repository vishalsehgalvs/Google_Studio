"use client";

import React, { createContext, useState, ReactNode, useEffect } from 'react';

interface Language {
    value: string;
    label: string;
}

export const languages: Language[] = [
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
  

interface LanguageContextType {
  languageCode: string;
  setLanguageCode: (code: string) => void;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [languageCode, setLanguageCode] = useState<string>('en');

  useEffect(() => {
    const storedLang = sessionStorage.getItem('languageCode');
    if (storedLang) {
      setLanguageCode(storedLang);
    }
  }, []);

  const handleSetLanguage = (code: string) => {
    setLanguageCode(code);
    sessionStorage.setItem('languageCode', code);
  };

  const value = {
    languageCode,
    setLanguageCode: handleSetLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
