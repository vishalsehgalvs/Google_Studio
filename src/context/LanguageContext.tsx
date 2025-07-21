
"use client";

import React, { createContext, useState, ReactNode, useEffect, useContext } from 'react';
import en from '@/locales/en.json';
import hi from '@/locales/hi.json';
import mr from '@/locales/mr.json';
import ta from '@/locales/ta.json';
import bn from '@/locales/bn.json';
import gu from '@/locales/gu.json';
import kn from '@/locales/kn.json';
import ml from '@/locales/ml.json';
import pa from '@/locales/pa.json';
import te from '@/locales/te.json';
import ur from '@/locales/ur.json';

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
  ];

const translations: Record<string, any> = {
  en,
  hi,
  mr,
  ta,
  bn,
  gu,
  kn,
  ml,
  pa,
  te,
  ur,
};

type TranslateFunction = (key: string, options?: Record<string, string | number>) => string;

interface LanguageContextType {
  languageCode: string;
  setLanguageCode: (code: string) => void;
  t: TranslateFunction;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [languageCode, setLanguageCode] = useState<string>('en');

  useEffect(() => {
    const storedLang = sessionStorage.getItem('languageCode');
    if (storedLang && languages.some(l => l.value === storedLang)) {
      setLanguageCode(storedLang);
    }
  }, []);

  const handleSetLanguage = (code: string) => {
    setLanguageCode(code);
    sessionStorage.setItem('languageCode', code);
  };
  
  const t: TranslateFunction = (key, options) => {
    const langTranslations = translations[languageCode] || translations.en;
    let text = key.split('.').reduce((obj, i) => obj?.[i], langTranslations);
    
    if (typeof text !== 'string') {
        // Fallback to English if translation for the key is not found in the selected language
        const enTranslations = translations.en;
        text = key.split('.').reduce((obj, i) => obj?.[i], enTranslations);
    }

    if (typeof text !== 'string') {
      console.warn(`Translation not found for key: ${key}`);
      return key;
    }

    if (options) {
      Object.keys(options).forEach(k => {
        text = text.replace(new RegExp(`{{${k}}}`, 'g'), String(options[k]));
      });
    }

    return text;
  };

  const value = {
    languageCode,
    setLanguageCode: handleSetLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
      throw new Error('useTranslation must be used within a LanguageProvider');
    }
    return context;
};
