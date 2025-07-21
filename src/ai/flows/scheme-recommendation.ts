'use server';

/**
 * @fileOverview A scheme recommender for farmers.
 *
 * - recommendSchemes - A function that recommends government schemes.
 * - RecommendSchemesInput - The input type for the recommendSchemes function.
 * - RecommendSchemesOutput - The return type for the recommendSchemes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendSchemesInputSchema = z.object({
  state: z.string().describe('The state the farmer resides in.'),
  landSize: z.number().describe('The size of the land in acres.'),
  crops: z.array(z.string()).describe('A list of crops the farmer grows.'),
  language: z.string().describe('The language for the response (e.g., "en", "hi", "es").'),
  schemes: z.any().describe('The translated list of available government schemes.'),
});
export type RecommendSchemesInput = z.infer<typeof RecommendSchemesInputSchema>;

const RecommendedSchemeSchema = z.object({
  title: z.string().describe('The title of the recommended scheme.'),
  reason: z.string().describe('The reason why this scheme is recommended for the farmer.'),
  applicationGuidance: z.string().describe('Brief guidance on how to apply for the scheme.'),
});

const RecommendSchemesOutputSchema = z.object({
  recommendations: z.array(RecommendedSchemeSchema),
});
export type RecommendSchemesOutput = z.infer<typeof RecommendSchemesOutputSchema>;

export async function recommendSchemes(input: Omit<RecommendSchemesInput, 'schemes'> & { schemes: any }): Promise<RecommendSchemesOutput> {
  return recommendSchemesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendSchemesPrompt',
  input: {
    schema: z.object({
        schemes: z.string(),
        farmerProfile: RecommendSchemesInputSchema,
    }),
  },
  output: {schema: RecommendSchemesOutputSchema},
  prompt: `You are an expert on government agricultural schemes in India. Your task is to act as an intelligent scheme identifier.
Generate the response in the following language: {{farmerProfile.language}}.

Based on the farmer's profile below, please recommend the most relevant government schemes from the provided list.

For each recommendation, you must provide:
1. The title of the scheme.
2. A personalized reason explaining why it's a good fit for this specific farmer.
3. Brief, actionable guidance on the application process.

**Farmer Profile:**
- State: {{{farmerProfile.state}}}
- Land Size: {{{farmerProfile.landSize}}} acres
- Crops: {{#each farmerProfile.crops}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

**Available Government Schemes (JSON format):**
\`\`\`json
{{{schemes}}}
\`\`\`

Return only the recommendations that are highly relevant to the farmer's profile. If no schemes are relevant, return an empty array.
`,
});

const recommendSchemesFlow = ai.defineFlow(
  {
    name: 'recommendSchemesFlow',
    inputSchema: RecommendSchemesInputSchema,
    outputSchema: RecommendSchemesOutputSchema,
  },
  async (input) => {
    const {output} = await prompt({
        farmerProfile: input,
        schemes: JSON.stringify(input.schemes),
    });
    return output!;
  }
);
