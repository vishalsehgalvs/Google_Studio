'use server';
/**
 * @fileOverview Provides climate advisories based on weather data.
 *
 * - getClimateAdvisory - A function that returns farming advice based on the weather.
 * - ClimateAdvisoryInput - The input type for the getClimateAdvisory function.
 * - ClimateAdvisoryOutput - The return type for the getClimateAdvisory function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getWeatherTool } from '../tools/weather';

const ClimateAdvisoryInputSchema = z.object({
  location: z.string().describe('The location for the climate advisory.'),
});
export type ClimateAdvisoryInput = z.infer<typeof ClimateAdvisoryInputSchema>;

const ClimateAdvisoryOutputSchema = z.object({
  advisory: z
    .string()
    .describe('Actionable advice for farmers based on the weather forecast.'),
  weather: z.object({
        temperature: z.number(),
        humidity: z.number(),
        windSpeed: z.number(),
        precipitation: z.string(),
        forecast: z.string(),
    })
});
export type ClimateAdvisoryOutput = z.infer<typeof ClimateAdvisoryOutputSchema>;

export async function getClimateAdvisory(
  input: ClimateAdvisoryInput
): Promise<ClimateAdvisoryOutput> {
  return getClimateAdvisoryFlow(input);
}

const climateAdvisoryPrompt = ai.definePrompt({
  name: 'climateAdvisoryPrompt',
  input: { schema: z.object({ location: z.string() }) },
  output: { schema: ClimateAdvisoryOutputSchema },
  tools: [getWeatherTool],
  prompt: `You are an agricultural expert providing climate advisories.
Use the getWeather tool to get the weather for the user's location.
Then, provide a concise, actionable advisory for a farmer based on that weather forecast.
Focus on protective measures or opportunities.
For example, if there is heavy rain, advise on drainage. If it's very hot, advise on irrigation.
Location: {{{location}}}
`,
});

const getClimateAdvisoryFlow = ai.defineFlow(
  {
    name: 'getClimateAdvisoryFlow',
    inputSchema: ClimateAdvisoryInputSchema,
    outputSchema: ClimateAdvisoryOutputSchema,
  },
  async (input) => {
    const llmResponse = await climateAdvisoryPrompt(input);
    const weatherInfo = llmResponse.toolRequest?.tool?.input;
    const advisory = llmResponse.output?.advisory ?? "No advisory available.";
    
    // We need to call the tool again to get the data to return to the client
    const weather = await getWeatherTool(input);

    return {
        advisory,
        weather,
    };
  }
);
