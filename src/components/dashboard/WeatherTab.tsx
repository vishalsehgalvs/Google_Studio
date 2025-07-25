
"use client";

import { useState, useEffect, useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "../ui/button";
import { Volume2, AlertCircle, Cloud, Thermometer, Wind, Droplets, Bell, CloudSun } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { getClimateAdvisory } from "@/ai/flows/climate-advisory";
import { LocationContext } from "@/context/LocationContext";

import { useTranslation } from "@/context/LanguageContext";


type WeatherData = {
    temperature: number;
    humidity: number;
    windSpeed: number;
    precipitation: string;
    forecast: string;
};

type AdvisoryResult = {
  advisory: string;
  weather: WeatherData;
};

export default function WeatherTab() {
  const [advisoryResult, setAdvisoryResult] = useState<AdvisoryResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSpokenText, setCurrentSpokenText] = useState("");

  const locationContext = useContext(LocationContext);
  const locationRaw = locationContext?.locationName || "Nagpur";
  const locationKey = locationRaw.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
  const { languageCode, t } = useTranslation();
  // Try both normalized and raw keys for translation, fallback to raw
  let location = t(`marketTab.locations.${locationKey}`);
  if (!location || location === `marketTab.locations.${locationKey}`) {
    // fallback to English locale
    const { t: tEn } = require('@/context/LanguageContext').getTranslation('en');
    location = tEn(`marketTab.locations.${locationKey}`);
    if (!location || location === `marketTab.locations.${locationKey}`) {
      location = locationRaw;
    }
  }

  const { toast } = useToast();

  useEffect(() => {
    async function getAdvisory() {
      if (!location) return;
      setIsLoading(true);
      setError(null);
      try {
        const result = await getClimateAdvisory(location, languageCode || 'en');
        setAdvisoryResult(result);
      } catch (e) {
        console.error(e);
        setError(t('weatherTab.error'));
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch climate advisory.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    getAdvisory();
    // Only re-run when locationContext.locationName or languageCode changes
  }, [toast, locationContext?.locationName, languageCode, t]);
  

  const handleSpeak = async (text: string) => {
    // TODO: Optionally stop any playing audio using browser Audio API if implemented
    // If you implement audio playback, check if the same text is being played and stop it
    if (!text) return;
    setCurrentSpokenText(text);
    try {
      // TODO: Call backend API for voice-based information delivery
      // const { audioDataUri } = await fetch('/api/voice-delivery', { ... })
      // Use browser Audio API to play audioDataUri if needed
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not generate audio.",
      });
      setCurrentSpokenText("");
    }
  };

  const renderSkeleton = () => (
    <div className="space-y-6 pt-4">
      <div className="space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  );

  return (
    <Card className="shadow-lg border-primary/20 max-w-4xl mx-auto">
        <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2"><CloudSun className="text-primary"/>{t('weatherTab.title')}</CardTitle>
        <CardDescription>{t('weatherTab.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-grow space-y-2">
                <Label htmlFor="location-input">{t('weatherTab.yourLocation')}</Label>
                <Input 
                    id="location-input"
                    value={location}
                    readOnly
                    disabled
                    placeholder="e.g., Nagpur"
                />
            </div>
        </div>

        {(isLoading || locationContext?.loading) && renderSkeleton()}

        {error && !isLoading && (
            <div className="text-destructive flex items-center gap-2 pt-4">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
            </div>
        )}

        {!isLoading && !locationContext?.loading && !error && advisoryResult && (
            <div className="space-y-6 pt-4 animate-in fade-in-50">
            <div>
                <Card className="bg-primary/10 border-primary/20">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-primary"><Bell size={20} /> {t('weatherTab.aiAdvisory', { location: location })}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-foreground/90 text-base">{advisoryResult.advisory}</p>
                        <Button onClick={() => handleSpeak(advisoryResult.advisory)} variant="outline" size="sm" className="mt-4 border-accent text-accent hover:bg-accent/10 hover:text-accent">
                             <Volume2 className="mr-2 h-4 w-4" />
                            {t('diagnosisTab.readAloud')}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                <Card className="p-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2"><Thermometer size={16}/> {t('weatherTab.temperature')}</CardTitle>
                    <p className="text-2xl font-bold">{advisoryResult.weather.temperature}°C</p>
                </Card>
                 <Card className="p-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2"><Droplets size={16}/> {t('weatherTab.humidity')}</CardTitle>
                    <p className="text-2xl font-bold">{advisoryResult.weather.humidity}%</p>
                </Card>
                 <Card className="p-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2"><Wind size={16}/> {t('weatherTab.windSpeed')}</CardTitle>
                    <p className="text-2xl font-bold">{advisoryResult.weather.windSpeed} km/h</p>
                </Card>
                 <Card className="p-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2"><Cloud size={16}/> {t('weatherTab.forecast')}</CardTitle>
                    <p className="text-lg font-bold">{advisoryResult.weather.forecast}</p>
                </Card>
            </div>
            </div>
        )}
        </CardContent>
    </Card>
  );
}
