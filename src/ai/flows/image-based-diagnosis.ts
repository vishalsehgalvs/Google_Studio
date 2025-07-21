'use server';

/**
 * @fileOverview A plant disease diagnosis AI agent based on image input.
 *
 * - imageBasedDiagnosis - A function that handles the plant diagnosis process from an image.
 * - ImageBasedDiagnosisInput - The input type for the imageBasedDiagnosis function.
 * - ImageBasedDiagnosisOutput - The return type for the imageBasedDiagnosis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImageBasedDiagnosisInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  language: z.string().describe('The language for the response (e.g., "en", "hi", "es").'),
});
export type ImageBasedDiagnosisInput = z.infer<typeof ImageBasedDiagnosisInputSchema>;

const ImageBasedDiagnosisOutputSchema = z.object({
  diagnosis: z.object({
    disease: z.string().describe('The identified disease of the plant.'),
    remedies: z.string().describe('Suggested remedies for the identified disease.'),
    confidenceScore: z.number().min(0).max(1).describe('The confidence score of the diagnosis, between 0 and 1.'),
  }),
});
export type ImageBasedDiagnosisOutput = z.infer<typeof ImageBasedDiagnosisOutputSchema>;

export async function imageBasedDiagnosis(input: ImageBasedDiagnosisInput): Promise<ImageBasedDiagnosisOutput> {
  return imageBasedDiagnosisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'imageBasedDiagnosisPrompt',
  input: {schema: ImageBasedDiagnosisInputSchema},
  output: {schema: ImageBasedDiagnosisOutputSchema},
  prompt: `You are an expert in plant pathology. A farmer has provided an image of a diseased plant.
  Your task is to analyze the image and provide a diagnosis of the disease and suggest remedies.
  You must also provide a confidence score for your diagnosis.
  Generate the response in the following language: {{language}}.

  Image: {{media url=photoDataUri}}
  `,
});

const imageBasedDiagnosisFlow = ai.defineFlow(
  {
    name: 'imageBasedDiagnosisFlow',
    inputSchema: ImageBasedDiagnosisInputSchema,
    outputSchema: ImageBasedDiagnosisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
