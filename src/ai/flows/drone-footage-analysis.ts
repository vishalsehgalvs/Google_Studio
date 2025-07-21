'use server';

/**
 * @fileOverview Analyzes drone footage (as an image) to assess crop health.
 *
 * - analyzeDroneFootage - A function that handles the drone footage analysis.
 * - AnalyzeDroneFootageInput - The input type for the analyzeDroneFootage function.
 * - AnalyzeDroneFootageOutput - The return type for the analyzeDroneFootage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeDroneFootageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "An image from drone footage, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeDroneFootageInput = z.infer<typeof AnalyzeDroneFootageInputSchema>;

const AnalyzeDroneFootageOutputSchema = z.object({
  analysis: z.string().describe('A detailed analysis of the crop health based on the drone footage, identifying potential issues like water stress, pest infestation, or nutrient deficiencies.'),
  hotspots: z.array(z.object({
      issue: z.string().describe('The specific issue identified in a hotspot.'),
      recommendation: z.string().describe('A recommended action for the identified issue.'),
  })).describe('A list of specific areas of concern (hotspots) with recommendations.'),
});
export type AnalyzeDroneFootageOutput = z.infer<typeof AnalyzeDroneFootageOutputSchema>;

export async function analyzeDroneFootage(input: AnalyzeDroneFootageInput): Promise<AnalyzeDroneFootageOutput> {
  return analyzeDroneFootageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeDroneFootagePrompt',
  input: {schema: AnalyzeDroneFootageInputSchema},
  output: {schema: AnalyzeDroneFootageOutputSchema},
  prompt: `You are an expert agronomist specializing in precision agriculture and remote sensing.
You have been provided with a drone image of a farmer's field. Your task is to analyze this image to assess crop health.

Based on the image, provide a general analysis and identify specific "hotspots" that require attention.
Look for visual cues suggesting:
- Water stress (e.g., wilting, dry patches)
- Pest infestation (e.g., discoloration, leaf damage patterns)
- Nutrient deficiencies (e.g., yellowing, stunted growth)
- Weed pressure

For each hotspot, describe the issue and provide a clear, actionable recommendation for the farmer.

Image: {{media url=imageDataUri}}
`,
});

const analyzeDroneFootageFlow = ai.defineFlow(
  {
    name: 'analyzeDroneFootageFlow',
    inputSchema: AnalyzeDroneFootageInputSchema,
    outputSchema: AnalyzeDroneFootageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
