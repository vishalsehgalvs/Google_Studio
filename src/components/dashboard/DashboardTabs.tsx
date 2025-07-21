
"use client";

import { useState, useRef, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DiagnosisTab from "./DiagnosisTab";
import MarketTab from "./MarketTab";
import SchemesTab from "./SchemesTab";
import WeatherTab from "./WeatherTab";
import MyFarmTab from "./MyFarmTab";
import { Leaf, LineChart, LandPlot, CloudSun, Tractor } from 'lucide-react';
import Header from "../layout/Header";
import { useAudioPlayer } from "@/context/AudioPlayerContext";
import { useToast } from "@/hooks/use-toast";
import { voiceBasedInformationDelivery } from "@/ai/flows/voice-based-information-delivery";
import { useTranslation } from "@/context/LanguageContext";

export default function DashboardTabs() {
  const [activeTab, setActiveTab] = useState("diagnosis");
  const { playAudio, stopAudio, isLoading: isAudioLoading } = useAudioPlayer();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const contentRefs = {
    diagnosis: useRef<HTMLDivElement>(null),
    market: useRef<HTMLDivElement>(null),
    schemes: useRef<HTMLDivElement>(null),
    weather: useRef<HTMLDivElement>(null),
    myfarm: useRef<HTMLDivElement>(null),
  };

  const getTextToRead = useCallback(() => {
    const activeContent = contentRefs[activeTab as keyof typeof contentRefs].current;
    if (!activeContent) return "";
    
    // A simplified text extraction logic. This could be more sophisticated.
    const titles = Array.from(activeContent.querySelectorAll('h1, h2, h3, h4, p, li, td'));
    return titles.map(el => el.textContent).join('. ').replace(/\s\s+/g, ' ');
  }, [activeTab, contentRefs]);

  const handleReadAloud = useCallback(async () => {
    const text = getTextToRead();
    if (!text) {
      toast({
        variant: "destructive",
        title: "Nothing to read",
        description: "There is no text content to read on this tab.",
      });
      return;
    }

    try {
      const { audioDataUri } = await voiceBasedInformationDelivery({ text });
      playAudio(audioDataUri);
    } catch(e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not generate audio for the page.",
      });
      stopAudio();
    }
  }, [getTextToRead, playAudio, stopAudio, toast]);

  return (
    <>
      <Header onReadAloud={handleReadAloud} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-primary/10 rounded-lg h-12">
            <TabsTrigger value="diagnosis" className="text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg rounded-md text-sm sm:text-base">
              <Leaf className="w-4 h-4 mr-1 sm:mr-2" />
              {t('dashboard.tabs.diagnosis')}
            </TabsTrigger>
            <TabsTrigger value="market" className="text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg rounded-md text-sm sm:text-base">
              <LineChart className="w-4 h-4 mr-1 sm:mr-2" />
              {t('dashboard.tabs.market')}
            </TabsTrigger>
            <TabsTrigger value="schemes" className="text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg rounded-md text-sm sm:text-base">
              <LandPlot className="w-4 h-4 mr-1 sm:mr-2" />
              {t('dashboard.tabs.schemes')}
            </TabsTrigger>
            <TabsTrigger value="weather" className="text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg rounded-md text-sm sm:text-base">
              <CloudSun className="w-4 h-4 mr-1 sm:mr-2" />
              {t('dashboard.tabs.weather')}
            </TabsTrigger>
            <TabsTrigger value="myfarm" className="text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg rounded-md text-sm sm:text-base">
              <Tractor className="w-4 h-4 mr-1 sm:mr-2" />
              {t('dashboard.tabs.myfarm')}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="diagnosis" className="mt-6" ref={contentRefs.diagnosis}>
            <DiagnosisTab />
          </TabsContent>
          <TabsContent value="market" className="mt-6" ref={contentRefs.market}>
            <MarketTab />
          </TabsContent>
          <TabsContent value="schemes" className="mt-6" ref={contentRefs.schemes}>
            <SchemesTab />
          </TabsContent>
          <TabsContent value="weather" className="mt-6" ref={contentRefs.weather}>
            <WeatherTab />
          </TabsContent>
          <TabsContent value="myfarm" className="mt-6" ref={contentRefs.myfarm}>
            <MyFarmTab />
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
