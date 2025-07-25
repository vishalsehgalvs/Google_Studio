'use server';

/**
 * @fileOverview Analyzes drone footage (as an image) to assess crop health.
 *
 * - analyzeDroneFootage - A function that handles the drone footage analysis.
 * - AnalyzeDroneFootageInput - The input type for the analyzeDroneFootage function.
 * - AnalyzeDroneFootageOutput - The return type for the analyzeDroneFootage function.
 */


// ...existing code...
export type AnalyzeDroneFootageInput = {
  imageDataUri: string;
  language: string;
};

export type AnalyzeDroneFootageOutput = {
  analysis: string;
  hotspots: { issue: string; recommendation: string }[];
};

export async function analyzeDroneFootage(input: AnalyzeDroneFootageInput): Promise<AnalyzeDroneFootageOutput> {
  const res = await fetch('/api/drone-analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to fetch drone analysis');
  return res.json();
}
