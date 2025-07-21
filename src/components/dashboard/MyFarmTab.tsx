
"use client";

import { useState, useContext, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Map, Pin, Sun, TestTube2, ImageUp, Loader2, AlertCircle, Sparkles, X, MapPin, ShoppingCart, Building, Globe, Database, Key } from "lucide-react";
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';
import { analyzeDroneFootage } from '@/ai/flows/drone-footage-analysis';
import { LocationContext } from '@/context/LocationContext';
import { Skeleton } from '../ui/skeleton';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { orderSupplies, OrderSuppliesOutput } from '@/ai/flows/order-supplies';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { useUser } from '@/context/UserContext';
import { saveSoilHealthCard } from '@/lib/db';
import DataHistoryTab from './DataHistoryTab';
import { useTranslation } from '@/context/LanguageContext';

type AnalysisResult = {
  analysis: string;
  hotspots: { issue: string; recommendation: string }[];
};

type SupplierResults = OrderSuppliesOutput['suppliers'];

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

const sampleSoilHealthCard = {
  id: `shc_${Date.now()}`,
  metrics: {
    ph: 6.8,
    organicCarbon: 0.75,
    conductivity: 0.2,
  },
  nutrients: {
    nitrogen: { value: 150, unit: 'kg/ha', status: 'Medium' },
    phosphorus: { value: 25, unit: 'kg/ha', status: 'High' },
    potassium: { value: 120, unit: 'kg/ha', status: 'Low' },
  },
  recommendations: "Increase Potassium application. Consider using Muriate of Potash. Maintain current Nitrogen levels. No additional Phosphorus required this season."
};

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
const isMapsKeyMissing = GOOGLE_MAPS_API_KEY === "" || GOOGLE_MAPS_API_KEY === "YOUR_GOOGLE_MAPS_API_KEY_HERE";

export default function MyFarmTab() {
  const [isSoilCardOpen, setIsSoilCardOpen] = useState(false);
  const [isDroneModalOpen, setIsDroneModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  const [droneImageFile, setDroneImageFile] = useState<File | null>(null);
  const [droneImagePreview, setDroneImagePreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [errorAnalysis, setErrorAnalysis] = useState<string | null>(null);

  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [supplierResults, setSupplierResults] = useState<SupplierResults>([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
  const [orderedProduct, setOrderedProduct] = useState("");

  const locationContext = useContext(LocationContext);
  const { user } = useUser();
  const { languageCode, t } = useTranslation();
  const { toast } = useToast();

  const { isLoaded: isMapLoaded, loadError: mapLoadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    preventGoogleFontsLoading: true,
  });

  const handleOpenSoilCard = () => {
    if (user) {
      saveSoilHealthCard(user.id, {
        ...sampleSoilHealthCard,
        userId: user.id,
        location: locationContext?.locationName || 'Unknown',
        timestamp: new Date().toISOString(),
      });
      toast({ title: "Soil Health Card Viewed", description: "A snapshot has been saved to your history." });
    }
    setIsSoilCardOpen(true);
  };

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
    if (!droneImagePreview || !user) return;
    setIsLoadingAnalysis(true);
    setErrorAnalysis(null);
    setAnalysisResult(null);
    try {
      const result = await analyzeDroneFootage({ 
        imageDataUri: droneImagePreview,
        language: languageCode || 'en',
      });
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
  
  const handleOrderSupplies = async (product: string) => {
    setIsLoadingSuppliers(true);
    setOrderedProduct(product);
    setIsSupplierModalOpen(true);
    setSupplierResults([]);
    try {
        const { suppliers } = await orderSupplies({ product });
        setSupplierResults(suppliers);
    } catch (e) {
        console.error(e);
        toast({
            variant: "destructive",
            title: "Supplier Search Error",
            description: "Could not find suppliers at this time."
        });
        setIsSupplierModalOpen(false);
    } finally {
        setIsLoadingSuppliers(false);
    }
  }

  const resetDroneAnalysis = () => {
    setDroneImageFile(null);
    setDroneImagePreview(null);
    setAnalysisResult(null);
    setErrorAnalysis(null);
    setIsLoadingAnalysis(false);
  };
  
  const renderMap = useCallback(() => {
    if (isMapsKeyMissing) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
          <Key className="h-10 w-10 mb-4 text-destructive"/>
          <p className="font-bold">Google Maps API Key is Missing</p>
          <p className="text-sm">Please add your API key to the <code className="bg-muted px-1 py-0.5 rounded-sm">.env</code> file to enable the map view.</p>
        </div>
      );
    }
    if (mapLoadError) {
      return <div className="flex items-center justify-center h-full text-destructive"><AlertCircle className="mr-2"/>Error loading map. Please check your API key and project settings.</div>;
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
                <Map className="text-primary"/> {t('myFarmTab.mapTitle')}
              </CardTitle>
              <CardDescription>
                {t('myFarmTab.mapDescription')}
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
                  <CardTitle className="font-headline text-xl">{t('myFarmTab.overviewTitle')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                      <Pin className="text-primary" size={24}/>
                      <div>
                          <p className="font-semibold">{t('myFarmTab.location')}</p>
                          {locationContext?.loading ? <Skeleton className="h-4 w-32 mt-1" /> : <p className="text-muted-foreground">{locationContext?.locationName || t('myFarmTab.notAvailable')}</p>}
                          {locationContext?.error && <p className="text-xs text-destructive">{locationContext.error}</p>}
                      </div>
                  </div>
                  <div className="flex items-center gap-4">
                      <Sun className="text-primary" size={24}/>
                      <div>
                          <p className="font-semibold">{t('myFarmTab.soilType')}</p>
                          <p className="text-muted-foreground">{t('myFarmTab.soilTypeExample')}</p>
                      </div>
                  </div>
              </CardContent>
          </Card>
          
          <Card className="shadow-lg border-primary/20">
              <CardHeader>
                  <CardTitle className="font-headline text-xl">{t('myFarmTab.actionsTitle')}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                  <Button variant="outline" onClick={() => setIsDroneModalOpen(true)}>{t('myFarmTab.droneAnalysisBtn')}</Button>
                  <Button variant="outline" onClick={handleOpenSoilCard}>{t('myFarmTab.soilHealthCardBtn')}</Button>
                  <Button variant="outline" onClick={() => setIsHistoryOpen(true)}><Database className="mr-2 h-4 w-4"/> {t('myFarmTab.historyBtn')}</Button>
              </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isSoilCardOpen} onOpenChange={setIsSoilCardOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl flex items-center gap-2"><TestTube2 className="text-primary"/>{t('myFarmTab.soilCard.title')}</DialogTitle>
            <DialogDescription>
              {t('myFarmTab.soilCard.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{t('myFarmTab.soilCard.keyMetrics')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex justify-between"><span>{t('myFarmTab.soilCard.phLevel')}:</span><span className="font-bold">{sampleSoilHealthCard.metrics.ph}</span></li>
                    <li className="flex justify-between"><span>{t('myFarmTab.soilCard.organicCarbon')}:</span><span className="font-bold">{sampleSoilHealthCard.metrics.organicCarbon}%</span></li>
                    <li className="flex justify-between"><span>{t('myFarmTab.soilCard.conductivity')}:</span><span className="font-bold">{sampleSoilHealthCard.metrics.conductivity} dS/m</span></li>
                  </ul>
                </CardContent>
              </Card>
               <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{t('myFarmTab.soilCard.nutrientStatus')}</CardTitle>
                </CardHeader>
                <CardContent>
                   <ul className="space-y-3">
                    <li className="flex justify-between items-center"><span>{t('myFarmTab.soilCard.nitrogen')}:</span><span className="font-bold text-yellow-600">{sampleSoilHealthCard.nutrients.nitrogen.status} ({sampleSoilHealthCard.nutrients.nitrogen.value} kg/ha)</span></li>
                    <li className="flex justify-between items-center"><span>{t('myFarmTab.soilCard.phosphorus')}:</span><span className="font-bold text-green-600">{sampleSoilHealthCard.nutrients.phosphorus.status} ({sampleSoilHealthCard.nutrients.phosphorus.value} kg/ha)</span></li>
                    <li className="flex justify-between items-center"><span>{t('myFarmTab.soilCard.potassium')}:</span><span className="font-bold text-red-600">{sampleSoilHealthCard.nutrients.potassium.status} ({sampleSoilHealthCard.nutrients.potassium.value} kg/ha)</span></li>
                  </ul>
                </CardContent>
              </Card>
          </div>
           <Card className="mt-6">
              <CardHeader className="pb-4">
                  <CardTitle className="text-lg">{t('myFarmTab.soilCard.recommendations')}</CardTitle>
                  <CardDescription>{sampleSoilHealthCard.recommendations}</CardDescription>
              </CardHeader>
            </Card>
            <Card className="mt-6 bg-primary/5">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><ShoppingCart className="text-primary" /> {t('myFarmTab.soilCard.orderSupplies')}</CardTitle>
                    <CardDescription>{t('myFarmTab.soilCard.orderDescription')}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-4">
                    <Button className="flex-1" onClick={() => handleOrderSupplies("Muriate of Potash (fertilizer)")}>{t('myFarmTab.soilCard.orderFertilizers')}</Button>
                    <Button className="flex-1" variant="secondary" onClick={() => handleOrderSupplies("quality seeds")}>{t('myFarmTab.soilCard.orderSeeds')}</Button>
                </CardContent>
            </Card>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDroneModalOpen} onOpenChange={(isOpen) => {
        if(!isOpen) resetDroneAnalysis();
        setIsDroneModalOpen(isOpen);
      }}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl flex items-center gap-2"><Sparkles className="text-primary"/>{t('myFarmTab.droneModal.title')}</DialogTitle>
            <DialogDescription>
              {t('myFarmTab.droneModal.description')}
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
                            <p>{t('myFarmTab.droneModal.uploadPrompt')}</p>
                        </div>
                    )}
                </label>
              </div>
              <Button onClick={handleAnalyzeFootage} disabled={!droneImagePreview || isLoadingAnalysis} className="w-full mt-4 bg-accent hover:bg-accent/90">
                  {isLoadingAnalysis ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                  {isLoadingAnalysis ? t('myFarmTab.droneModal.analyzing') : t('myFarm-tab.droneModal.analyze')}
              </Button>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">{t('myFarmTab.droneModal.resultTitle')}</h3>
              <Card className="h-[340px] overflow-y-auto">
                <CardContent className="p-4">
                  {isLoadingAnalysis && <div className="flex items-center justify-center h-full gap-2"><Loader2 className="h-6 w-6 animate-spin text-primary"/> <p>{t('myFarmTab.droneModal.analyzingField')}</p></div>}
                  {errorAnalysis && <div className="text-destructive flex items-center justify-center h-full gap-2"><AlertCircle className="h-6 w-6"/> <p>{errorAnalysis}</p></div>}
                  {!isLoadingAnalysis && !errorAnalysis && !analysisResult && <div className="text-muted-foreground flex items-center justify-center h-full">{t('myFarmTab.droneModal.uploadToSee')}</div>}
                  {analysisResult && (
                    <div className="space-y-4 animate-in fade-in-50">
                      <div>
                        <h4 className="font-semibold text-primary">{t('myFarmTab.droneModal.overallAssessment')}</h4>
                        <p className="text-sm">{analysisResult.analysis}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-primary">{t('myFarmTab.droneModal.hotspots')}</h4>
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

      <Dialog open={isSupplierModalOpen} onOpenChange={setIsSupplierModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl flex items-center gap-2">
                <ShoppingCart className="text-primary"/> {t('myFarmTab.supplierModal.title')}
            </DialogTitle>
            <DialogDescription>
                {t('myFarmTab.supplierModal.description', { product: orderedProduct })}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {isLoadingSuppliers ? (
                 <div className="flex items-center justify-center h-40 gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary"/>
                    <p>{t('myFarmTab.supplierModal.searching')}</p>
                 </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('myFarmTab.supplierModal.supplier')}</TableHead>
                            <TableHead>{t('myFarmTab.supplierModal.type')}</TableHead>
                            <TableHead>{t('myFarmTab.supplierModal.contact')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {supplierResults.map((supplier, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{supplier.name}</TableCell>
                                <TableCell>
                                    <span className="flex items-center gap-2">
                                        {supplier.type === 'local' ? <Building size={16}/> : <Globe size={16}/>}
                                        {t(`myFarmTab.supplierModal.${supplier.type}`)}
                                    </span>
                                </TableCell>
                                <TableCell>{supplier.contact}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
          </div>
           <DialogFooter>
                <Button variant="secondary" onClick={() => setIsSupplierModalOpen(false)}>{t('myFarmTab.close')}</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
                <DialogTitle className="font-headline text-2xl flex items-center gap-2">
                    <Database className="text-primary"/> {t('myFarmTab.historyModal.title')}
                </DialogTitle>
                <DialogDescription>
                    {user?.id === 'admin@example.com' ? t('myFarmTab.historyModal.adminDescription') : t('myFarmTab.historyModal.userDescription')}
                </DialogDescription>
            </DialogHeader>
            <div className="mt-4 max-h-[60vh] overflow-y-auto">
                <DataHistoryTab />
            </div>
             <DialogFooter>
                <Button variant="secondary" onClick={() => setIsHistoryOpen(false)}>{t('myFarmTab.close')}</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
