
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

export default function DataHistoryTab() {
  const { user } = useUser();
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
          <CardTitle>Diagnosis History</CardTitle>
        </CardHeader>
        <CardContent>
          {diagnoses.length === 0 ? (
            <p className="text-muted-foreground">No diagnoses found.</p>
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
                            <p><span className="font-semibold">Remedies:</span> {d.remedies}</p>
                            <p><span className="font-semibold">Confidence:</span> {(d.confidenceScore * 100).toFixed(0)}%</p>
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
          <CardTitle>Soil Health Card History</CardTitle>
        </CardHeader>
        <CardContent>
          {soilHealthCards.length === 0 ? (
            <p className="text-muted-foreground">No soil health cards found.</p>
          ) : (
             <Accordion type="single" collapsible className="w-full">
                {soilHealthCards.map((c) => (
                    <AccordionItem value={c.id} key={c.id}>
                        <AccordionTrigger>
                           <div className="flex justify-between w-full pr-4">
                             <span>Report for {c.location}</span>
                             <span className="text-sm text-muted-foreground">{format(new Date(c.timestamp), 'PPpp')}</span>
                           </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-2">
                             {isAdmin && <p className="text-xs text-muted-foreground">User ID: {c.userId}</p>}
                            <p><span className="font-semibold">Recommendations:</span> {c.recommendations}</p>
                            <p className="font-semibold">Metrics:</p>
                            <ul className="list-disc list-inside text-sm">
                                <li>pH: {c.metrics.ph}</li>
                                <li>Organic Carbon: {c.metrics.organicCarbon}%</li>
                                <li>Conductivity: {c.metrics.conductivity} dS/m</li>
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
