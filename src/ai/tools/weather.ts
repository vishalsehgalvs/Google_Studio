'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const WeatherInputSchema = z.object({
  location: z.string().describe('The city name for which to get the weather forecast.'),
});

// In a real app, this would be an external API call
const weatherData: Record<string, any> = {
  Nagpur: {
    temperature: 34,
    humidity: 75,
    windSpeed: 15,
    precipitation: '80%',
    forecast: 'Heavy thunderstorms',
  },
  Mumbai: {
    temperature: 30,
    humidity: 88,
    windSpeed: 25,
    precipitation: '95%',
    forecast: 'Continuous heavy rain',
  },
  Pune: {
    temperature: 28,
    humidity: 82,
    windSpeed: 20,
    precipitation: '70%',
    forecast: 'Scattered showers',
  },
  Delhi: {
    temperature: 38,
    humidity: 60,
    windSpeed: 10,
    precipitation: '20%',
    forecast: 'Hot and humid',
  },
  Default: {
    temperature: 32,
    humidity: 65,
    windSpeed: 12,
    precipitation: '30%',
    forecast: 'Partly cloudy',
  },
};

export const getWeatherTool = ai.defineTool(
  {
    name: 'getWeather',
    description: 'Get the current weather forecast for a given location.',
    inputSchema: WeatherInputSchema,
    outputSchema: z.any(),
  },
  async (input) => {
    console.log(`Getting weather for ${input.location}`);
    return weatherData[input.location] || weatherData['Default'];
  }
);
