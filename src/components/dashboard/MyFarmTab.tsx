"use client";

import { useState, useContext, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Map, Pin, Sun, TestTube2, ImageUp, Loader2, AlertCircle, Sparkles, X, MapPin } from "lucide-react";
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';
import { analyzeDroneFootage } from '@/ai/flows/drone-footage-analysis';
import { LocationContext } from '@/context/LocationContext';
import { Skeleton } from '../ui/skeleton';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

type AnalysisResult = {
  analysis: string;
  hotspots: { issue: string; recommendation: string }[];
};

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.5rem',
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeId: 'satellite',
};

export default function MyFarmTab() {
  const [isSoilCardOpen, setIsSoilCardOpen] = useState(false);
  const [isDroneModalOpen, setIsDroneModalOpen] = useState(false);
  
  const [droneImageFile, setDroneImageFile] = useState<File | null>(null);
  const [droneImagePreview, setDroneImagePreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [errorAnalysis, setErrorAnalysis] = useState<string | null>(null);

  const locationContext = useContext(LocationContext);
  const { toast } = useToast();

  const { isLoaded: isMapLoaded, loadError: mapLoadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setDroneImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setDroneImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setAnalysisResult(null);
      setErrorAnalysis(null);
    }
  };

  const handleAnalyzeFootage = async () => {
    if (!droneImagePreview) return;
    setIsLoadingAnalysis(true);
    setErrorAnalysis(null);
    setAnalysisResult(null);
    try {
      const result = await analyzeDroneFootage({ imageDataUri: droneImagePreview });
      setAnalysisResult(result);
    } catch (e) {
      console.error(e);
      setErrorAnalysis("Failed to analyze the footage. Please try another image or try again later.");
      toast({
        variant: "destructive",
        title: "Analysis Error",
        description: "Could not get analysis from the provided image."
      });
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const resetDroneAnalysis = () => {
    setDroneImageFile(null);
    setDroneImagePreview(null);
    setAnalysisResult(null);
    setErrorAnalysis(null);
    setIsLoadingAnalysis(false);
  };
  
  const renderMap = useCallback(() => {
    if (mapLoadError) {
      return <div className="flex items-center justify-center h-full text-destructive"><AlertCircle className="mr-2"/>Error loading map. Please check the API key.</div>;
    }
    if (!isMapLoaded || locationContext?.loading) {
        return <Skeleton className="w-full h-full" />;
    }
    if (locationContext?.coordinates) {
        return (
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={locationContext.coordinates}
                zoom={15}
                options={mapOptions}
            >
                <Marker position={locationContext.coordinates} />
            </GoogleMap>
        );
    }
    return <div className="flex items-center justify-center h-full text-muted-foreground"><MapPin className="mr-2" />Could not determine location.</div>;
  }, [isMapLoaded, mapLoadError, locationContext]);

  return (
    <>
      <div className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2">
          <Card className="shadow-lg border-primary/20 h-[500px]">
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center gap-2">
                <Map className="text-primary"/> My Field Map
              </CardTitle>
              <CardDescription>
                A satellite overview of your field, centered on your current location.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[calc(100%-110px)]">
              <div className="w-full h-full bg-muted rounded-md flex items-center justify-center overflow-hidden relative">
                  {renderMap()}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="shadow-lg border-primary/20">
              <CardHeader>
                  <CardTitle className="font-headline text-xl">Farm Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                      <Pin className="text-primary" size={24}/>
                      <div>
                          <p className="font-semibold">Location</p>
                          {locationContext?.loading ? <Skeleton className="h-4 w-32 mt-1" /> : <p className="text-muted-foreground">{locationContext?.locationName || 'Not available'}</p>}
                          {locationContext?.error && <p className="text-xs text-destructive">{locationContext.error}</p>}
                      </div>
                  </div>
                  <div className="flex items-center gap-4">
                      <Sun className="text-primary" size={24}/>
                      <div>
                          <p className="font-semibold">Soil Type</p>
                          <p className="text-muted-foreground">Black Cotton Soil</p>
                      </div>
                  </div>
              </CardContent>
          </Card>
          
          <Card className="shadow-lg border-primary/20">
              <CardHeader>
                  <CardTitle className="font-headline text-xl">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                  <Button variant="outline" onClick={() => setIsDroneModalOpen(true)}>Request Drone Footage Analysis</Button>
                  <Button variant="outline" onClick={() => setIsSoilCardOpen(true)}>View Soil Health Card</Button>
              </CardContent>
          </Card>
        </div>
      </div>

      {/* Soil Health Card Dialog */}
      <Dialog open={isSoilCardOpen} onOpenChange={setIsSoilCardOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl flex items-center gap-2"><TestTube2 className="text-primary"/>Soil Health Card</DialogTitle>
            <DialogDescription>
              A summary of your soil's health based on the latest test results.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Key Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex justify-between"><span>pH Level:</span><span className="font-bold">6.8</span></li>
                    <li className="flex justify-between"><span>Organic Carbon:</span><span className="font-bold">0.75%</span></li>
                    <li className="flex justify-between"><span>Electrical Conductivity:</span><span className="font-bold">0.2 dS/m</span></li>
                  </ul>
                </CardContent>
              </Card>
               <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Nutrient Status</CardTitle>
                </CardHeader>
                <CardContent>
                   <ul className="space-y-3">
                    <li className="flex justify-between items-center"><span>Nitrogen (N):</span><span className="font-bold text-yellow-600">Medium (150 kg/ha)</span></li>
                    <li className="flex justify-between items-center"><span>Phosphorus (P):</span><span className="font-bold text-green-600">High (25 kg/ha)</span></li>
                    <li className="flex justify-between items-center"><span>Potassium (K):</span><span className="font-bold text-red-600">Low (120 kg/ha)</span></li>
                  </ul>
                </CardContent>
              </Card>
          </div>
           <Card className="mt-6">
              <CardHeader>
                  <CardTitle className="text-lg">Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                  <p>Increase Potassium application. Consider using Muriate of Potash. Maintain current Nitrogen levels. No additional Phosphorus required this season.</p>
              </CardContent>
            </Card>
        </DialogContent>
      </Dialog>
      
      {/* Drone Footage Analysis Dialog */}
      <Dialog open={isDroneModalOpen} onOpenChange={(isOpen) => {
        if(!isOpen) resetDroneAnalysis();
        setIsDroneModalOpen(isOpen);
      }}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl flex items-center gap-2"><Sparkles className="text-primary"/>Drone Footage Analysis</DialogTitle>
            <DialogDescription>
              Upload a drone image of your field to get an AI-powered health assessment.
            </DialogDescription>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-6 mt-4 items-start">
            <div>
              <div className="relative border-2 border-dashed border-muted-foreground/50 rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors">
                <Input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" id="drone-image-upload" />
                <label htmlFor="drone-image-upload" className="cursor-pointer">
                    {droneImagePreview ? (
                        <div className="relative w-full h-64">
                            <Image src={droneImagePreview} alt="Drone footage preview" fill className="object-contain rounded-md" data-ai-hint="drone farm footage"/>
                            <Button variant="destructive" size="icon" className="absolute top-2 right-2 z-10 h-8 w-8" onClick={(e) => { e.preventDefault(); setDroneImagePreview(null); setDroneImageFile(null); setAnalysisResult(null); }}>
                                <X className="h-4 w-4"/>
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 gap-2 text-muted-foreground">
                            <ImageUp className="h-12 w-12"/>
                            <p>Click or drag & drop to upload</p>
                        </div>
                    )}
                </label>
              </div>
              <Button onClick={handleAnalyzeFootage} disabled={!droneImagePreview || isLoadingAnalysis} className="w-full mt-4 bg-accent hover:bg-accent/90">
                  {isLoadingAnalysis ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                  {isLoadingAnalysis ? 'Analyzing...' : 'Analyze Footage'}
              </Button>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Analysis Result</h3>
              <Card className="h-[340px] overflow-y-auto">
                <CardContent className="p-4">
                  {isLoadingAnalysis && <div className="flex items-center justify-center h-full gap-2"><Loader2 className="h-6 w-6 animate-spin text-primary"/> <p>Analyzing your field...</p></div>}
                  {errorAnalysis && <div className="text-destructive flex items-center justify-center h-full gap-2"><AlertCircle className="h-6 w-6"/> <p>{errorAnalysis}</p></div>}
                  {!isLoadingAnalysis && !errorAnalysis && !analysisResult && <div className="text-muted-foreground flex items-center justify-center h-full">Upload an image to see the analysis.</div>}
                  {analysisResult && (
                    <div className="space-y-4 animate-in fade-in-50">
                      <div>
                        <h4 className="font-semibold text-primary">Overall Assessment</h4>
                        <p className="text-sm">{analysisResult.analysis}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-primary">Identified Hotspots</h4>
                        <div className="space-y-3 mt-2">
                          {analysisResult.hotspots.map((spot, index) => (
                            <div key={index} className="p-3 bg-muted/50 rounded-md border">
                              <p className="font-bold text-sm">{spot.issue}</p>
                              <p className="text-xs text-muted-foreground mt-1">{spot.recommendation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
