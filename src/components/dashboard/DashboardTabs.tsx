"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DiagnosisTab from "./DiagnosisTab";
import MarketTab from "./MarketTab";
import SchemesTab from "./SchemesTab";
import WeatherTab from "./WeatherTab";
import { Leaf, LineChart, LandPlot, CloudSun } from 'lucide-react';

export default function DashboardTabs() {
  return (
    <Tabs defaultValue="diagnosis" className="w-full">
      <TabsList className="grid w-full grid-cols-4 bg-primary/10 rounded-lg h-12">
        <TabsTrigger value="diagnosis" className="text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg rounded-md text-sm sm:text-base">
          <Leaf className="w-4 h-4 mr-1 sm:mr-2" />
          Diagnosis
        </TabsTrigger>
        <TabsTrigger value="market" className="text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg rounded-md text-sm sm:text-base">
          <LineChart className="w-4 h-4 mr-1 sm:mr-2" />
          Market Info
        </TabsTrigger>
        <TabsTrigger value="schemes" className="text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg rounded-md text-sm sm:text-base">
          <LandPlot className="w-4 h-4 mr-1 sm:mr-2" />
          Govt. Schemes
        </TabsTrigger>
        <TabsTrigger value="weather" className="text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg rounded-md text-sm sm:text-base">
          <CloudSun className="w-4 h-4 mr-1 sm:mr-2" />
          Weather
        </TabsTrigger>
      </TabsList>
      <TabsContent value="diagnosis" className="mt-6">
        <DiagnosisTab />
      </TabsContent>
      <TabsContent value="market" className="mt-6">
        <MarketTab />
      </TabsContent>
      <TabsContent value="schemes" className="mt-6">
        <SchemesTab />
      </TabsContent>
      <TabsContent value="weather" className="mt-6">
        <WeatherTab />
      </TabsContent>
    </Tabs>
  );
}
