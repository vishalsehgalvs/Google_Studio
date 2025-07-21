
"use client";

import FeatureCard, { FeatureItem } from '@/components/features/FeatureCard';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { BarChart, Bot, Calendar, Cpu, Filter, Fingerprint, FolderSearch, Gem, Glasses, Microscope, Palette, ScanText, Scale, Sparkles, Target } from 'lucide-react';
import Link from 'next/link';

const cropAnalyzerItems: FeatureItem[] = [
    { icon: ScanText, text: 'Image capture & preprocessing' },
    { icon: Cpu, text: 'AI model inference on Vertex AI' },
    { icon: Palette, text: 'Disease pattern recognition' },
    { icon: Microscope, text: 'Treatment recommendation engine' },
    { icon: Sparkles, text: 'Confidence scoring & validation' },
];

const marketAnalysisItems: FeatureItem[] = [
    { icon: FolderSearch, text: 'Real-time data fetching' },
    { icon: BarChart, text: 'Price trend analysis' },
    { icon: Target, text: 'Demand forecasting' },
    { icon: Gem, text: 'Location-based pricing' },
    { icon: Sparkles, text: 'Actionable insights generation' },
];

const schemeIdentifierItems: FeatureItem[] = [
    { icon: Fingerprint, text: 'Farmer profile analysis' },
    { icon: Filter, text: 'Eligibility criteria matching' },
    { icon: Bot, text: 'Scheme recommendation' },
    { icon: Glasses, text: 'Application process guidance' },
    { icon: Calendar, text: 'Deadline tracking & alerts' },
];


export default function FeaturesPage() {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900">
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center">
                    <div className="mr-4 flex items-center">
                        <Scale className="h-6 w-6 mr-2" />
                        <span className="font-bold">FarmAssist</span>
                    </div>
                    <div className="flex flex-1 items-center justify-end space-x-2">
                         <Link href="/dashboard">
                            <Button>Go to App</Button>
                        </Link>
                    </div>
                </div>
            </header>
            <main className="flex-1 container mx-auto py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">AI-Powered Farming Solutions</h1>
                    <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                        Leveraging advanced AI to bring real-time insights for crop health, market analysis, and government schemes right to your fingertips.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <FeatureCard
                        title="Crop Analyzer Function"
                        description="Advanced AI-powered crop health assessment using computer vision and machine learning."
                        color="red-flame"
                        items={cropAnalyzerItems}
                        techStack={['Google Vertex AI Vision API', 'Multimodal Gemini Model', 'TensorFlow Image Processing']}
                    />
                    <FeatureCard
                        title="Market Analysis Function"
                        description="Real-time market data analysis with predictive pricing and demand forecasting."
                        color="royal-blue"
                        items={marketAnalysisItems}
                        dataSources={['Public Mandi APIs', 'Government Price Databases', 'Weather & Seasonal Data']}
                    />
                    <FeatureCard
                        title="Scheme Identifier Function"
                        description="Intelligent matching of farmers with relevant government schemes and subsidies."
                        color="emerald-green"
                        items={schemeIdentifierItems}
                        dataIntegration={['Central Government Portals', 'State Agricultural Departments', 'District Collector Offices']}

                    />
                </div>
            </main>
             <footer className="py-6 md:px-8 md:py-0">
                <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
                <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
                    Built with Next.js, Genkit, and ShadCN.
                </p>
                </div>
            </footer>
        </div>
    );
}
