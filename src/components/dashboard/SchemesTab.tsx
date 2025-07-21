
"use client";

import { useState, useContext } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { governmentSchemes } from "@/lib/data";
import { ExternalLink, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { recommendSchemes, RecommendSchemesOutput } from "@/ai/flows/scheme-recommendation";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "@/context/LanguageContext";

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", 
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", 
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", 
  "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", 
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", 
  "Ladakh", "Lakshadweep", "Puducherry"
];

export default function SchemesTab() {
  const [state, setState] = useState("");
  const [landSize, setLandSize] = useState("");
  const [crops, setCrops] = useState("");
  const [recommendations, setRecommendations] = useState<RecommendSchemesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { languageCode, t } = useTranslation();

  const handleGetRecommendations = async () => {
    if (!state || !landSize || !crops) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: t('schemesTab.error.missingInfo'),
      });
      return;
    }
    setIsLoading(true);
    setRecommendations(null);
    try {
      const result = await recommendSchemes({
        state,
        landSize: parseFloat(landSize),
        crops: crops.split(",").map(c => c.trim()),
        language: languageCode || 'en',
      });
      setRecommendations(result);
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch scheme recommendations.",
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="grid md:grid-cols-2 gap-8 items-start">
      <Card className="shadow-lg border-primary/20">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">{t('schemesTab.recsTitle')}</CardTitle>
          <CardDescription>{t('schemesTab.recsDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="state">{t('schemesTab.state')}</Label>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger id="state" className="w-full">
                <SelectValue placeholder={t('schemesTab.selectState')} />
              </SelectTrigger>
              <SelectContent>
                {indianStates.map((stateName) => (
                  <SelectItem key={stateName} value={stateName}>
                    {stateName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="land-size">{t('schemesTab.landSize')}</Label>
            <Input id="land-size" type="number" placeholder="e.g., 5" value={landSize} onChange={(e) => setLandSize(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="crops">{t('schemesTab.cropsGrown')}</Label>
            <Input id="crops" placeholder="e.g., Cotton, Soybean" value={crops} onChange={(e) => setCrops(e.target.value)} />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleGetRecommendations} disabled={isLoading} className="w-full bg-accent hover:bg-accent/90">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {isLoading ? t('schemesTab.findingSchemes') : t('schemesTab.getRecs')}
          </Button>
        </CardFooter>
      </Card>
      
      <div className="space-y-8">
        {recommendations && (
          <Card className="shadow-lg border-primary/20">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">{t('schemesTab.yourRecsTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              {recommendations.recommendations.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {recommendations.recommendations.map((scheme, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger className="font-bold text-left hover:no-underline">{scheme.title}</AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <div>
                          <p className="font-semibold text-primary">{t('schemesTab.whyRecommended')}</p>
                          <p>{scheme.reason}</p>
                        </div>
                         <div>
                          <p className="font-semibold text-primary">{t('schemesTab.howToApply')}</p>
                          <p>{scheme.applicationGuidance}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4"/>
                  <AlertTitle>{t('schemesTab.noSchemesFound')}</AlertTitle>
                  <AlertDescription>
                    {t('schemesTab.noSchemesDescription')}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="shadow-lg border-primary/20">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">{t('schemesTab.allSchemesTitle')}</CardTitle>
            <CardDescription>{t('schemesTab.allSchemesDescription')}</CardDescription>
          </CardHeader>
          <Accordion type="single" collapsible className="w-full px-6 pb-6">
            {governmentSchemes.map((scheme, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="font-bold text-left hover:no-underline">{scheme.title}</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-4">{scheme.description}</p>
                  <Button asChild variant="link" className="p-0 h-auto text-accent hover:text-accent/80">
                    <a href={scheme.link} target="_blank" rel="noopener noreferrer">
                      {t('schemesTab.learnMore')} <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      </div>

    </div>
  );
}
