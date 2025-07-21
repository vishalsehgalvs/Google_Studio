import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { governmentSchemes } from "@/lib/data";
import { ExternalLink } from "lucide-react";
import { Button } from "../ui/button";

export default function SchemesTab() {
  return (
    <Card className="shadow-lg border-primary/20">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Government Schemes</CardTitle>
        <CardDescription>Latest updates on schemes and policies for farmers.</CardDescription>
      </CardHeader>
      <Accordion type="single" collapsible className="w-full px-6 pb-6">
        {governmentSchemes.map((scheme, index) => (
          <AccordionItem value={`item-${index}`} key={index}>
            <AccordionTrigger className="font-bold text-left hover:no-underline">{scheme.title}</AccordionTrigger>
            <AccordionContent>
              <p className="mb-4">{scheme.description}</p>
              <Button asChild variant="link" className="p-0 h-auto text-accent hover:text-accent/80">
                <a href={scheme.link} target="_blank" rel="noopener noreferrer">
                  Learn More <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Card>
  );
}
