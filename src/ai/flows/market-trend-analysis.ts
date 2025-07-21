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
});

export type MarketTrendAnalysisInput = z.infer<typeof MarketTrendAnalysisInputSchema>;

const MarketTrendAnalysisOutputSchema = z.object({
  trendAnalysis: z.string().describe('Analysis of market trends and predicted price movements.'),
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

Analyze the following market data and predict future price movements. Provide actionable insights for farmers.

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
