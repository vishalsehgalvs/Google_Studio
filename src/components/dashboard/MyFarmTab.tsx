"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Map, Pin, Droplet, Sun, Wind } from "lucide-react";

export default function MyFarmTab() {

  return (
    <div className="grid md:grid-cols-3 gap-8 items-start">
      <div className="md:col-span-2">
        <Card className="shadow-lg border-primary/20 h-[500px]">
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2">
              <Map className="text-primary"/> My Field Map
            </CardTitle>
            <CardDescription>
              A visual overview of your fields. (Map integration coming soon!)
            </CardDescription>
          </CardHeader>
          <CardContent className="h-full">
             <div className="w-full h-full bg-muted rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">Map Placeholder</p>
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
                        <p className="text-muted-foreground">Nagpur, Maharashtra</p>
                    </div>
                </div>
                 <div className="flex items-center gap-4">
                    <Droplet className="text-primary" size={24}/>
                    <div>
                        <p className="font-semibold">Avg. Rainfall</p>
                        <p className="text-muted-foreground">1200 mm/year</p>
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
                <Button variant="outline">Request Drone Footage Analysis</Button>
                <Button variant="outline">View Soil Health Card</Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
