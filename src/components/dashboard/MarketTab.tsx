
"use client";

import { useState, useEffect, useContext, useRef } from "react";
import { useTabActive } from "./useTabActive";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";


import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "../ui/button";
import { Volume2, AlertCircle, LineChart, LocateFixed, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "../ui/input";
import { useLocationSuggestions, MARKET_LOCATIONS } from "./useLocationSuggestions";
import { Label } from "../ui/label";
import { LocationContext } from "@/context/LocationContext";

import { useTranslation } from "@/context/LanguageContext";

type CropAnalysis = {
  crop: string;
  trendAnalysis: string;
  demandForecast: string;
  locationBasedPricing: string;
  price?: string;
};

// Crop list is now fetched dynamically from backend/LLM based on location

// Helper to get backend URL for dev/prod
function getBackendUrl(path: string) {
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    // Development: use Flask backend directly
    return `http://localhost:5001${path}`;
  }
  // Production: use relative path (assume proxy or deployment config)
  return path;
}

// Helper to fetch crops and prices in one call
async function fetchCropsAndPrices(location: string, language: string): Promise<{ crops: string[]; prices: { [crop: string]: string | null } }> {
  const res = await fetch(getBackendUrl("/api/market-prices"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ location, language }),
  });
  const data = await res.json();
  if (data.success && Array.isArray(data.crops) && data.prices) return { crops: data.crops, prices: data.prices };
  return { crops: [], prices: {} };
}

// Helper to fetch market analysis for a crop
async function fetchMarketAnalysis(location: string, crop: string, language: string): Promise<any> {
  const res = await fetch(getBackendUrl("/api/market-analysis"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ location, language, crop }),
  });
  const data = await res.json();
  if (data.success && Array.isArray(data.result)) return data.result[0];
  if (data.result) return data.result;
  return null;
}

export default function MarketTab() {
  const isTabActive = useTabActive("market");
  const [crops, setCrops] = useState<string[]>([]);
  const [prices, setPrices] = useState<{ [crop: string]: string | null }>({});
  const [selectedCrop, setSelectedCrop] = useState<string>("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true); // for crops/prices
  const [analysisLoading, setAnalysisLoading] = useState(false); // for analysis only
  const [error, setError] = useState<string | null>(null);
  const locationContext = useContext(LocationContext);
  const [inputLocation, setInputLocation] = useState<string>("");
  const [committedLocation, setCommittedLocation] = useState<string>(locationContext?.locationName || "KR Market, Bengaluru, Karnataka");
  const location = committedLocation;
  const setLocation = (loc: string) => {
    setInputLocation(loc);
    setCommittedLocation(loc);
    if (locationContext?.setLocationName) locationContext.setLocationName(loc);
  };
  const { suggestions, getSuggestions } = useLocationSuggestions();
  const { toast } = useToast();
  const { languageCode, t } = useTranslation();

  // prevTabActive is declared only once below



  // Fetch crops/prices and clear table/selection when tab is active and location/language changes
  useEffect(() => {
    if (!isTabActive) return;
    let ignore = false;
    const abortController = new AbortController();
    setSelectedCrop("");
    setAnalysis(null);
    setCrops([]);
    setPrices({});
    setIsLoading(true);
    setError(null);
    fetchCropsAndPrices(location, languageCode)
      .then(({ crops: cropsList, prices: pricesObj }) => {
        if (ignore) return;
        // Debug log to verify mapping
        console.log('Crops List:', cropsList);
        console.log('Prices Object:', pricesObj);
        const normalize = (str: string): string => {
          return str.trim().toLowerCase().replace(/[^a-z0-9 ]/gi, '');
        };
        const normalizedPrices: { [key: string]: string | null } = {};
        Object.keys(pricesObj).forEach((key: string) => {
          normalizedPrices[normalize(key)] = pricesObj[key];
        });
        const mappedPrices: { [crop: string]: string | null } = {};
        cropsList.forEach((crop: string) => {
          mappedPrices[crop] = normalizedPrices[normalize(crop)] ?? null;
        });
        setCrops(cropsList);
        setPrices(mappedPrices);
      })
      .catch(() => {
        if (ignore) return;
        setError("Could not fetch crops or prices.");
        setCrops([]);
        setPrices({});
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });
    return () => {
      ignore = true;
      abortController.abort();
    };
  }, [isTabActive, location, languageCode]);

  // Fetch market analysis when crop is selected
  useEffect(() => {
    if (!selectedCrop) {
      setAnalysis(null);
      return;
    }
    setAnalysisLoading(true);
    setError(null);
    fetchMarketAnalysis(location, selectedCrop, languageCode)
      .then((result) => {
        setAnalysis(result);
      })
      .catch(() => {
        setError("Could not fetch market analysis.");
        setAnalysis(null);
      })
      .finally(() => setAnalysisLoading(false));
  }, [selectedCrop, location, languageCode]);

  const handleSpeak = async (text: string) => {
    // TODO: Call backend API for voice-based information delivery
    // const { audioDataUri } = await fetch('/api/voice-delivery', { ... })
    // Use browser Audio API to play audioDataUri if needed
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 items-start">
      <Card className="shadow-lg border-primary/20">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">{t('marketTab.pricesTitle')}</CardTitle>
          <CardDescription>{t('marketTab.pricesDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold">{t('marketTab.crop')}</TableHead>
                <TableHead className="text-right font-bold">{t('marketTab.pricePerUnit', { unit: 'quintal' })}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground">
                    {t('marketTab.loading')}
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-destructive">
                    {error}
                  </TableCell>
                </TableRow>
              ) : crops.length > 0 ? (
                crops.map((crop, idx) => {
                  // Try to use translation key for crop, fallback to English if missing
                  const cropKey = crop.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
          let cropLabel = t(`marketTab.crops.${cropKey}`);
          if (!cropLabel || cropLabel === `marketTab.crops.${cropKey}`) {
            // fallback to English locale
            const { t: tEn } = require('@/context/LanguageContext').getTranslation('en');
            cropLabel = tEn(`marketTab.crops.${cropKey}`);
            if (!cropLabel || cropLabel === `marketTab.crops.${cropKey}`) {
              cropLabel = crop;
            }
                  }
                  return (
                    <TableRow key={idx} className={selectedCrop === crop ? "bg-accent/10" : ""}>
                      <TableCell
                        className={`font-medium cursor-pointer ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
                        onClick={() => {
                          if (!isLoading && selectedCrop !== crop) setSelectedCrop(crop);
                        }}
                      >
                        {cropLabel}
                      </TableCell>
                      <TableCell className="text-right">
                        {prices[crop] ? `₹${prices[crop]}/quintal` : <span className="text-muted-foreground">{t('marketTab.noData')}</span>}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground">
                    {t('marketTab.noData')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="space-y-8">
        <Card className="shadow-lg border-primary/20">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">{t('marketTab.analysisTitle')}</CardTitle>
            <CardDescription>{t('marketTab.analysisDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Label htmlFor="location-input">{t('marketTab.yourLocation')}</Label>
              <Input
                id="location-input"
                value={(() => {
                  if (inputLocation !== "") return inputLocation;
                  const locKey = committedLocation.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
                  let localized = t(`marketTab.locations.${locKey}`);
                  if (!localized || localized === `marketTab.locations.${locKey}`) {
                    // fallback to English locale
                    const { t: tEn } = require('@/context/LanguageContext').getTranslation('en');
                    localized = tEn(`marketTab.locations.${locKey}`);
                    if (!localized || localized === `marketTab.locations.${locKey}`) {
                      localized = committedLocation;
                    }
                  }
                  return localized;
                })()}
                onChange={(e) => {
                  setInputLocation(e.target.value);
                  getSuggestions(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setCommittedLocation(inputLocation);
                    if (locationContext?.setLocationName) locationContext.setLocationName(inputLocation);
                  }
                }}
                placeholder={t('marketTab.locations.Nagpur_Maharashtra') || "e.g., Nagpur"}
                autoComplete="off"
                disabled={locationContext?.loading}
              />
              {suggestions.length > 0 && (
                <div className="absolute z-10 bg-white border rounded shadow w-full mt-1 max-h-48 overflow-auto">
                  {suggestions.map((sugg) => (
                    <div
                      key={sugg}
                      className="px-3 py-2 cursor-pointer hover:bg-accent/20"
                      onClick={() => {
                        setInputLocation(sugg);
                        setCommittedLocation(sugg);
                        if (locationContext?.setLocationName) locationContext.setLocationName(sugg);
                        getSuggestions("");
                      }}
                    >
                  {t(`marketTab.locations.${sugg.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}`) || sugg}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {selectedCrop && analysis && !analysisLoading && !error && (
              <div className="space-y-8 pt-4">
                <div className="border-b pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
                  <h2 className="font-bold text-xl text-primary mb-2">{t(`marketTab.crops.${analysis.crop.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}`) || analysis.crop}</h2>
                  <div>
                    <h3 className="font-bold text-lg text-primary flex items-center gap-2"><TrendingUp size={20} /> {t('marketTab.priceTrend')}</h3>
                    <p className="text-foreground/90 whitespace-pre-wrap mt-1">{analysis.trend}</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-primary flex items-center gap-2"><LineChart size={20} /> {t('marketTab.demandForecast')}</h3>
                    <p className="text-foreground/90 whitespace-pre-wrap mt-1">{analysis.forecast}</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-primary flex items-center gap-2"><LocateFixed size={20} /> {t('marketTab.locationPricing')}</h3>
                    <p className="text-foreground/90 whitespace-pre-wrap mt-1">{analysis.factors}</p>
                  </div>
                  <Button onClick={() => handleSpeak(Object.values(analysis).join('. '))} variant="outline" size="sm" className="border-accent text-accent hover:bg-accent/10 hover:text-accent mt-2">
                    <Volume2 className="mr-2 h-4 w-4" />
                    {t('diagnosisTab.readAloud')}
                  </Button>
                </div>
              </div>
            )}
            {analysisLoading && (
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
