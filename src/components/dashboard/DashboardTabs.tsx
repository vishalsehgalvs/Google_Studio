
"use client";

import { useState, useRef, useCallback } from "react";
import { TabsContext } from "./DashboardTabsContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DiagnosisTab from "./DiagnosisTab";
// Removed CropDiagnosisTab and VoiceAssistantTab
import MachineryTab from "./MachineryTab";
import MarketTab from "./MarketTab";
import SchemesTab from "./SchemesTab";
import WeatherTab from "./WeatherTab";
import MyFarmTab from "./MyFarmTab";
import { Leaf, LineChart, LandPlot, CloudSun, Tractor } from 'lucide-react';
import Header from "../layout/Header";

import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/context/LanguageContext";

export default function DashboardTabs() {
  const [activeTab, setActiveTab] = useState("diagnosis");

  const { toast } = useToast();
  const { t } = useTranslation();
  
  const contentRefs = {
    diagnosis: useRef<HTMLDivElement>(null),
    // Removed cropdiagnosis and voiceassistant
    market: useRef<HTMLDivElement>(null),
    schemes: useRef<HTMLDivElement>(null),
    weather: useRef<HTMLDivElement>(null),
    myfarm: useRef<HTMLDivElement>(null),
    machinery: useRef<HTMLDivElement>(null),
  };

  const getTextToRead = useCallback(() => {
  const activeContent = contentRefs[activeTab as keyof typeof contentRefs].current;
  if (!activeContent) return "";
  const titles = Array.from(activeContent.querySelectorAll('h1, h2, h3, h4, p, li, td'));
  return titles.map(el => el.textContent).join('. ').replace(/\s\s+/g, ' ');
}, [activeTab, contentRefs]);

const handleReadAloud = useCallback(async (_event?: any) => {
  const text = getTextToRead();
  if (!text) return;
  toast({ title: t("Read Aloud"), description: text });
}, [getTextToRead, toast, t]);

  return (
    <TabsContext.Provider value={{ activeTab }}>
      <Header onReadAloud={handleReadAloud} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8 bg-primary/10 rounded-lg h-12">
            <TabsTrigger value="diagnosis"><Leaf className="mr-2 h-4 w-4" />{t("dashboard.tabs.diagnosis")}</TabsTrigger>
            <TabsTrigger value="market"><LineChart className="mr-2 h-4 w-4" />{t("dashboard.tabs.market")}</TabsTrigger>
            <TabsTrigger value="schemes"><LandPlot className="mr-2 h-4 w-4" />{t("dashboard.tabs.schemes")}</TabsTrigger>
            <TabsTrigger value="weather"><CloudSun className="mr-2 h-4 w-4" />{t("dashboard.tabs.weather")}</TabsTrigger>
            <TabsTrigger value="machinery"><Tractor className="mr-2 h-4 w-4" />{t("dashboard.tabs.machinery")}</TabsTrigger>
            <TabsTrigger value="myfarm"><LandPlot className="mr-2 h-4 w-4" />{t("dashboard.tabs.myfarm")}</TabsTrigger>
          </TabsList>
          <TabsContent value="diagnosis" ref={contentRefs.diagnosis}><DiagnosisTab /></TabsContent>
          <TabsContent value="market" ref={contentRefs.market}><MarketTab /></TabsContent>
          <TabsContent value="schemes" ref={contentRefs.schemes}><SchemesTab /></TabsContent>
          <TabsContent value="weather" ref={contentRefs.weather}><WeatherTab /></TabsContent>
          <TabsContent value="machinery" ref={contentRefs.machinery}><MachineryTab /></TabsContent>
          <TabsContent value="myfarm" ref={contentRefs.myfarm}><MyFarmTab /></TabsContent>
        </Tabs>
      </main>
    </TabsContext.Provider>
  );
}
