'use server';

/**
 * @fileOverview Market trend analysis flow.
 *
 * - analyzeMarketTrends - Analyzes market trends to predict future price movements.
 * - MarketTrendAnalysisInput - The input type for the analyzeMarketTrends function.
 * - MarketTrendAnalysisOutput - The return type for the analyzeMarketTrends function.
 */


// ...existing code...
export type MarketTrendAnalysisInput = {
  marketData: string;
  location: string;
  language: string;
};

export type MarketTrendAnalysisOutput = {
  trendAnalysis: string;
  demandForecast: string;
  locationBasedPricing: string;
};

export async function analyzeMarketTrends(input: MarketTrendAnalysisInput): Promise<MarketTrendAnalysisOutput> {
  const res = await fetch('/api/market-trend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to fetch market trend analysis');
  return res.json();
}
