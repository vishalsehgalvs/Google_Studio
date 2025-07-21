
"use client";

import { useUser } from "@/context/UserContext";
import {
  getAllDiagnoses,
  getAllSoilHealthCards,
  getDiagnosesForUser,
  getSoilHealthCardsForUser,
  Diagnosis,
  SoilHealthCard,
} from "@/lib/db";
import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Image from "next/image";
import { format } from 'date-fns';
import { useTranslation } from "@/context/LanguageContext";

export default function DataHistoryTab() {
  const { user } = useUser();
  const { t } = useTranslation();
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [soilHealthCards, setSoilHealthCards] = useState<SoilHealthCard[]>([]);

  useEffect(() => {
    if (user) {
      if (user.id === 'admin@example.com') {
        setDiagnoses(getAllDiagnoses());
        setSoilHealthCards(getAllSoilHealthCards());
      } else {
        setDiagnoses(getDiagnosesForUser(user.id));
        setSoilHealthCards(getSoilHealthCardsForUser(user.id));
      }
    }
  }, [user]);

  if (!user) {
    return <div>Please log in to see your history.</div>;
  }
  
  const isAdmin = user.id === 'admin@example.com';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('myFarmTab.dataHistory.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          {diagnoses.length === 0 ? (
            <p className="text-muted-foreground">{t('myFarmTab.dataHistory.noDiagnoses')}</p>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {diagnoses.map((d) => (
                <AccordionItem value={d.id} key={d.id}>
                  <AccordionTrigger>
                    <div className="flex justify-between w-full pr-4">
                       <span>{d.disease}</span>
                       <span className="text-sm text-muted-foreground">{format(new Date(d.timestamp), 'PPpp')}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    {isAdmin && <p className="text-xs text-muted-foreground">User ID: {d.userId}</p>}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="relative h-48 w-full">
                           <Image src={d.imageDataUri} alt={`Diagnosis for ${d.disease}`} layout="fill" className="object-contain rounded-md" />
                        </div>
                        <div className="space-y-2">
                            <p><span className="font-semibold">{t('myFarmTab.dataHistory.remedies')}</span> {d.remedies}</p>
                            <p><span className="font-semibold">{t('myFarmTab.dataHistory.confidence')}</span> {(d.confidenceScore * 100).toFixed(0)}%</p>
                        </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('myFarmTab.dataHistory.soilCardsTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {soilHealthCards.length === 0 ? (
            <p className="text-muted-foreground">{t('myFarmTab.dataHistory.noSoilCards')}</p>
          ) : (
             <Accordion type="single" collapsible className="w-full">
                {soilHealthCards.map((c) => (
                    <AccordionItem value={c.id} key={c.id}>
                        <AccordionTrigger>
                           <div className="flex justify-between w-full pr-4">
                             <span>{t('myFarmTab.dataHistory.reportFor', { location: c.location })}</span>
                             <span className="text-sm text-muted-foreground">{format(new Date(c.timestamp), 'PPpp')}</span>
                           </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-2">
                             {isAdmin && <p className="text-xs text-muted-foreground">User ID: {c.userId}</p>}
                            <p><span className="font-semibold">{t('myFarmTab.dataHistory.recommendations')}</span> {c.recommendations}</p>
                            <p className="font-semibold">{t('myFarmTab.dataHistory.metrics')}</p>
                            <ul className="list-disc list-inside text-sm">
                                <li>{t('myFarmTab.dataHistory.ph')} {c.metrics.ph}</li>
                                <li>{t('myFarmTab.dataHistory.organicCarbon')} {c.metrics.organicCarbon}%</li>
                                <li>{t('myFarmTab.dataHistory.conductivity')} {c.metrics.conductivity} dS/m</li>
                            </ul>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
