
"use client";

import { cn } from "@/lib/utils";
import { Check, type LucideIcon } from "lucide-react";
import { Card } from "../ui/card";

export type FeatureItem = {
    icon: LucideIcon;
    text: string;
};

type FeatureCardProps = {
    title: string;
    description: string;
    color: 'red-flame' | 'royal-blue' | 'emerald-green';
    items: FeatureItem[];
    techStack?: string[];
    dataSources?: string[];
    dataIntegration?: string[];
};

export default function FeatureCard({
    title,
    description,
    color,
    items,
    techStack,
    dataSources,
    dataIntegration,
}: FeatureCardProps) {
    const colorVariants = {
        'red-flame': 'bg-gradient-to-b from-red-400 to-rose-500 border-red-500',
        'royal-blue': 'bg-gradient-to-b from-blue-400 to-indigo-500 border-blue-500',
        'emerald-green': 'bg-gradient-to-b from-green-400 to-emerald-500 border-green-500',
    };

    const itemColorVariants = {
        'red-flame': 'bg-white/20',
        'royal-blue': 'bg-white/20',
        'emerald-green': 'bg-white/20',
    };

    const sectionBoxColorVariants = {
        'red-flame': 'bg-rose-500/50',
        'royal-blue': 'bg-indigo-500/50',
        'emerald-green': 'bg-emerald-500/50',
    };

    const InfoSection = ({ title, points }: { title: string, points?: string[] }) => {
        if (!points || points.length === 0) return null;
        return (
            <div className={`p-4 rounded-lg ${sectionBoxColorVariants[color]}`}>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <ul className="space-y-1.5">
                    {points.map((point, index) => (
                        <li key={index} className="flex items-start gap-2">
                           <span className="text-white/80">•</span>
                           <span>{point}</span>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <Card className={cn(
            "text-white p-6 rounded-2xl shadow-2xl flex flex-col gap-6 transform hover:-translate-y-2 transition-transform duration-300",
            colorVariants[color]
        )}>
            <div className="text-center">
                <h2 className="text-2xl font-bold">{title}</h2>
                <p className="mt-2 text-white/80 text-sm">{description}</p>
            </div>

            <div className="space-y-4">
                <InfoSection title="Technology Stack:" points={techStack} />
                <InfoSection title="Data Sources:" points={dataSources} />
                <InfoSection title="Data Integration:" points={dataIntegration} />
            </div>

            <div className="flex flex-col gap-3">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className={cn("flex items-center gap-3 p-3 rounded-lg", itemColorVariants[color])}
                    >
                        <item.icon className="w-5 h-5 opacity-80" />
                        <span className="font-medium text-sm">{item.text}</span>
                    </div>
                ))}
            </div>
        </Card>
    );
}
