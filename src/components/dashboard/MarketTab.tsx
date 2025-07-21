"use client";

import { useState, useEffect } from "react";
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
import { Volume2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { voiceBasedInformationDelivery } from "@/ai/flows/voice-based-information-delivery";

export default function MarketTab() {
  const [analysis, setAnalysis] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();
  const audioRef = useState(typeof Audio !== 'undefined' ? new Audio() : undefined)[0];

  useEffect(() => {
    async function getAnalysis() {
      try {
        const result = await analyzeMarketTrends({
          marketData: JSON.stringify(marketData),
        });
        setAnalysis(result.trendAnalysis);
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
  }, [toast]);
  
  useEffect(() => {
    const currentAudio = audioRef;
    const onEnded = () => setIsSpeaking(false);
    currentAudio?.addEventListener('ended', onEnded);
    return () => {
        currentAudio?.removeEventListener('ended', onEnded);
        currentAudio?.pause();
    };
  }, [audioRef]);


  const handleSpeak = async () => {
    if (isSpeaking) {
      audioRef?.pause();
      setIsSpeaking(false);
      return;
    }
    if (!analysis) return;
    setIsSpeaking(true);
    try {
      const { audioDataUri } = await voiceBasedInformationDelivery({ text: analysis });
      if (audioRef) {
          audioRef.src = audioDataUri;
          audioRef.play();
      }
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not generate audio.",
      });
      setIsSpeaking(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
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

      <Card className="shadow-lg border-primary/20">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Market Trend Analysis</CardTitle>
          <CardDescription>AI-powered insights on price movements.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          )}
          {error && (
            <div className="text-destructive flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
            </div>
          )}
          {!isLoading && !error && (
            <div>
              <p className="text-foreground/90 whitespace-pre-wrap">{analysis}</p>
              <Button onClick={handleSpeak} variant="outline" size="sm" className="mt-4 border-accent text-accent hover:bg-accent/10 hover:text-accent">
                <Volume2 className={`mr-2 h-4 w-4 ${isSpeaking ? "animate-pulse" : ""}`} />
                {isSpeaking ? "Stop" : "Read Aloud"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
