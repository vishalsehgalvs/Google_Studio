'use server';

/**
 * @fileOverview A scheme recommender for farmers.
 *
 * - recommendSchemes - A function that recommends government schemes.
 * - RecommendSchemesInput - The input type for the recommendSchemes function.
 * - RecommendSchemesOutput - The return type for the recommendSchemes function.
 */


// ...existing code...
export type RecommendSchemesInput = {
  state: string;
  landSize: number;
  crops: string[];
  language: string;
  schemes: any;
};

export type RecommendSchemesOutput = {
  recommendations: { title: string; reason: string; applicationGuidance: string }[];
};

export async function recommendSchemes(input: RecommendSchemesInput): Promise<RecommendSchemesOutput> {
  const res = await fetch('/api/scheme-recommendation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to fetch scheme recommendations');
  return res.json();
}
