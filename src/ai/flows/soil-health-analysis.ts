
'use server';

/**
 * @fileOverview Analyzes soil health data to provide recommendations.
 *
 * - analyzeSoilHealth - A function that handles the soil health analysis.
 * - SoilHealthAnalysisInput - The input type for the analyzeSoilHealth function.
 * - SoilHealthAnalysisOutput - The return type for the analyzeSoilHealth function.
 */


// ...existing code...
export type SoilHealthAnalysisInput = {
  metrics: {
    ph: number;
    organicCarbon: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
  language: string;
};

export type SoilHealthAnalysisOutput = {
  analysis: string;
  recommendations: string[];
};

export async function analyzeSoilHealth(input: SoilHealthAnalysisInput): Promise<SoilHealthAnalysisOutput> {
  const res = await fetch('/api/soil-analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to fetch soil health analysis');
  return res.json();
}
