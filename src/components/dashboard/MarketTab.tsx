
"use client";

import { useState, useEffect, useContext } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { marketData } from "@/lib/data";
import { analyzeMarketTrends } from "@/ai/flows/market-trend-analysis";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "../ui/button";
import { Volume2, AlertCircle, LineChart, LocateFixed, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { voiceBasedInformationDelivery } from "@/ai/flows/voice-based-information-delivery";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { LocationContext } from "@/context/LocationContext";
import { useAudioPlayer } from "@/context/AudioPlayerContext";
import { LanguageContext } from "@/context/LanguageContext";

type AnalysisResult = {
  trendAnalysis: string;
  demandForecast: string;
  locationBasedPricing: string;
};

export default function MarketTab() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSpokenText, setCurrentSpokenText] = useState("");
  
  const locationContext = useContext(LocationContext);
  const location = locationContext?.locationName || "Nagpur";
  const setLocation = locationContext?.setLocationName || (() => {});

  const { toast } = useToast();
  const { playAudio, stopAudio, isPlaying, isLoading: isAudioLoading } = useAudioPlayer();
  const langContext = useContext(LanguageContext);


  useEffect(() => {
    async function getAnalysis() {
      if (!location) return;
      setIsLoading(true);
      setError(null);
      try {
        const result = await analyzeMarketTrends({
          marketData: JSON.stringify(marketData),
          location: location,
          language: langContext?.languageCode || 'en',
        });
        setAnalysis(result);
      } catch (e) {
        console.error(e);
        setError("Failed to analyze market trends. Please try again later.");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch market trend analysis.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    getAnalysis();
  }, [toast, location, langContext?.languageCode]);


  const handleSpeak = async (text: string) => {
    if (isPlaying && currentSpokenText === text) {
      stopAudio();
      setCurrentSpokenText("");
      return;
    }
    if (!text) return;
    setCurrentSpokenText(text);
    try {
      const { audioDataUri } = await voiceBasedInformationDelivery({ text });
      playAudio(audioDataUri);
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

  return (
    <div className="grid md:grid-cols-2 gap-8 items-start">
      <Card className="shadow-lg border-primary/20">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Market Prices</CardTitle>
          <CardDescription>Latest crop prices from the market.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold">Crop</TableHead>
                <TableHead className="text-right font-bold">Price (per {marketData[0].unit})</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {marketData.map((item) => (
                <TableRow key={item.crop}>
                  <TableCell className="font-medium">{item.crop}</TableCell>
                  <TableCell className="text-right">₹{item.price.toLocaleString('en-IN')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="space-y-8">
        <Card className="shadow-lg border-primary/20">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Market Trend Analysis</CardTitle>
            <CardDescription>AI-powered insights on price movements.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="location-input">Your Location</Label>
              <Input 
                id="location-input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Nagpur"
                disabled={locationContext?.loading}
              />
            </div>
            {isLoading && (
              <div className="space-y-6 pt-4">
                <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
            )}
            {error && (
              <div className="text-destructive flex items-center gap-2 pt-4">
                  <AlertCircle className="h-5 w-5" />
                  <p>{error}</p>
              </div>
            )}
            {!isLoading && !error && analysis && (
              <div className="space-y-6 pt-4">
                <div>
                  <h3 className="font-bold text-lg text-primary flex items-center gap-2"><TrendingUp size={20} /> Price Trend Analysis</h3>
                  <p className="text-foreground/90 whitespace-pre-wrap mt-1">{analysis.trendAnalysis}</p>
                </div>
                 <div>
                  <h3 className="font-bold text-lg text-primary flex items-center gap-2"><LineChart size={20} /> Demand Forecast</h3>
                  <p className="text-foreground/90 whitespace-pre-wrap mt-1">{analysis.demandForecast}</p>
                </div>
                 <div>
                  <h3 className="font-bold text-lg text-primary flex items-center gap-2"><LocateFixed size={20} /> Location-Based Pricing</h3>
                  <p className="text-foreground/90 whitespace-pre-wrap mt-1">{analysis.locationBasedPricing}</p>
                </div>
                <Button onClick={() => handleSpeak(Object.values(analysis).join('. '))} variant="outline" size="sm" className="border-accent text-accent hover:bg-accent/10 hover:text-accent">
                  <Volume2 className={`mr-2 h-4 w-4 ${isAudioLoading || isPlaying ? "animate-pulse" : ""}`} />
                  {isAudioLoading ? "Loading..." : isPlaying ? "Stop" : "Read Aloud"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
