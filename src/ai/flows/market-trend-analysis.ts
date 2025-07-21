'use server';

/**
 * @fileOverview Market trend analysis flow.
 *
 * - analyzeMarketTrends - Analyzes market trends to predict future price movements.
 * - MarketTrendAnalysisInput - The input type for the analyzeMarketTrends function.
 * - MarketTrendAnalysisOutput - The return type for the analyzeMarketTrends function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MarketTrendAnalysisInputSchema = z.object({
  marketData: z.string().describe('Market data in JSON format.'),
  location: z.string().describe('The location for which to provide pricing analysis.'),
});

export type MarketTrendAnalysisInput = z.infer<typeof MarketTrendAnalysisInputSchema>;

const MarketTrendAnalysisOutputSchema = z.object({
  trendAnalysis: z.string().describe('Analysis of market trends and predicted price movements.'),
  demandForecast: z.string().describe('A forecast of demand for the upcoming season.'),
  locationBasedPricing: z.string().describe('Pricing insights specific to the provided location.'),
});

export type MarketTrendAnalysisOutput = z.infer<typeof MarketTrendAnalysisOutputSchema>;

export async function analyzeMarketTrends(input: MarketTrendAnalysisInput): Promise<MarketTrendAnalysisOutput> {
  return analyzeMarketTrendsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'marketTrendAnalysisPrompt',
  input: {schema: MarketTrendAnalysisInputSchema},
  output: {schema: MarketTrendAnalysisOutputSchema},
  prompt: `You are an expert market analyst specializing in agricultural market trends.

Analyze the following market data for the location "{{location}}" and provide:
1.  A general price trend analysis.
2.  A demand forecast for the next season.
3.  Specific pricing insights for the given location.
Provide actionable insights for farmers.

Market Data: {{{marketData}}}
`,
});

const analyzeMarketTrendsFlow = ai.defineFlow(
  {
    name: 'analyzeMarketTrendsFlow',
    inputSchema: MarketTrendAnalysisInputSchema,
    outputSchema: MarketTrendAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
