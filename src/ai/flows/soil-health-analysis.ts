
'use server';

/**
 * @fileOverview Analyzes soil health data to provide recommendations.
 *
 * - analyzeSoilHealth - A function that handles the soil health analysis.
 * - SoilHealthAnalysisInput - The input type for the analyzeSoilHealth function.
 * - SoilHealthAnalysisOutput - The return type for the analyzeSoilHealth function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SoilHealthAnalysisInputSchema = z.object({
  metrics: z.object({
    ph: z.number().describe('The pH level of the soil.'),
    organicCarbon: z.number().describe('The percentage of organic carbon in the soil.'),
    nitrogen: z.number().describe('The amount of Nitrogen (N) in kg/ha.'),
    phosphorus: z.number().describe('The amount of Phosphorus (P) in kg/ha.'),
    potassium: z.number().describe('The amount of Potassium (K) in kg/ha.'),
  }),
  language: z.string().describe('The language for the response (e.g., "en", "hi", "es").'),
});
export type SoilHealthAnalysisInput = z.infer<typeof SoilHealthAnalysisInputSchema>;

const SoilHealthAnalysisOutputSchema = z.object({
  analysis: z.string().describe('A detailed analysis of the soil health based on the provided metrics.'),
  recommendations: z.array(z.string()).describe('A list of actionable recommendations for improving soil health and crop yield.'),
});
export type SoilHealthAnalysisOutput = z.infer<typeof SoilHealthAnalysisOutputSchema>;


export async function analyzeSoilHealth(input: SoilHealthAnalysisInput): Promise<SoilHealthAnalysisOutput> {
  return analyzeSoilHealthFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeSoilHealthPrompt',
  input: {schema: SoilHealthAnalysisInputSchema},
  output: {schema: SoilHealthAnalysisOutputSchema},
  model: 'googleai/gemini-2.0-flash',
  prompt: `You are an expert soil scientist and agronomist.
You have been provided with soil health metrics. Your task is to analyze this data and provide a detailed analysis and actionable recommendations for a farmer.
Generate the response in the following language: {{language}}.

**Soil Metrics:**
- pH Level: {{{metrics.ph}}}
- Organic Carbon: {{{metrics.organicCarbon}}}%
- Nitrogen (N): {{{metrics.nitrogen}}} kg/ha
- Phosphorus (P): {{{metrics.phosphorus}}} kg/ha
- Potassium (K): {{{metrics.potassium}}} kg/ha

**Analysis:**
Provide a detailed interpretation of these metrics. Explain what each value means for the soil's health and potential crop growth.

**Recommendations:**
Provide a list of clear, actionable recommendations. These should include advice on fertilizers, organic matter, and any other soil management practices.
`,
});

const analyzeSoilHealthFlow = ai.defineFlow(
  {
    name: 'analyzeSoilHealthFlow',
    inputSchema: SoilHealthAnalysisInputSchema,
    outputSchema: SoilHealthAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
