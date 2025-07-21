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
  language: z.string().describe('The language for the response (e.g., "en", "hi", "es").'),
});
export type ClimateAdvisoryInput = z.infer<typeof ClimateAdvisoryInputSchema>;

const WeatherDataSchema = z.object({
    temperature: z.number(),
    humidity: z.number(),
    windSpeed: z.number(),
    precipitation: z.string(),
    forecast: z.string(),
});

const ClimateAdvisoryOutputSchema = z.object({
  advisory: z
    .string()
    .describe('Actionable advice for farmers based on the weather forecast.'),
  weather: WeatherDataSchema,
});
export type ClimateAdvisoryOutput = z.infer<typeof ClimateAdvisoryOutputSchema>;

export async function getClimateAdvisory(
  input: ClimateAdvisoryInput
): Promise<ClimateAdvisoryOutput> {
  return getClimateAdvisoryFlow(input);
}

const advisoryGenerationPrompt = ai.definePrompt({
    name: 'advisoryGenerationPrompt',
    input: { schema: z.object({ location: z.string(), weather: WeatherDataSchema, language: z.string() }) },
    output: { schema: z.object({ advisory: z.string() }) },
    prompt: `You are an agricultural expert providing climate advisories.
Generate the response in the following language: {{language}}.

Location: "{{location}}".
Based on the following weather data, provide a concise, actionable advisory for a farmer.
Focus on protective measures or opportunities.
For example, if there is heavy rain, advise on drainage. If it's very hot, advise on irrigation.

Weather Data:
- Temperature: {{{weather.temperature}}}°C
- Humidity: {{{weather.humidity}}}%
- Wind Speed: {{{weather.windSpeed}}} km/h
- Precipitation: {{{weather.precipitation}}}
- Forecast: {{{weather.forecast}}}
`,
});


const getClimateAdvisoryFlow = ai.defineFlow(
  {
    name: 'getClimateAdvisoryFlow',
    inputSchema: ClimateAdvisoryInputSchema,
    outputSchema: ClimateAdvisoryOutputSchema,
  },
  async (input) => {
    // Step 1: Explicitly call the tool to get weather data.
    const weather = await getWeatherTool({ location: input.location });

    // Step 2: Pass the weather data to a separate prompt to generate the advisory.
    const { output } = await advisoryGenerationPrompt({
        location: input.location,
        weather: weather,
        language: input.language,
    });
    
    if (!output) {
      throw new Error("Could not generate climate advisory.");
    }

    return {
        advisory: output.advisory,
        weather,
    };
  }
);
