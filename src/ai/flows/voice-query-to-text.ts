'use server';
/**
 * @fileOverview Converts voice queries in various dialects to text.
 *
 * - voiceQueryToText - A function that converts voice queries to text.
 * - VoiceQueryToTextInput - The input type for the voiceQueryToText function.
 * - VoiceQueryToTextOutput - The return type for the voiceQueryToText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VoiceQueryToTextInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "Audio data URI of the voice query.  It must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type VoiceQueryToTextInput = z.infer<typeof VoiceQueryToTextInputSchema>;

const VoiceQueryToTextOutputSchema = z.object({
  text: z.string().describe('The transcribed text from the voice query.'),
});
export type VoiceQueryToTextOutput = z.infer<typeof VoiceQueryToTextOutputSchema>;

export async function voiceQueryToText(input: VoiceQueryToTextInput): Promise<VoiceQueryToTextOutput> {
  return voiceQueryToTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'voiceQueryToTextPrompt',
  input: {schema: VoiceQueryToTextInputSchema},
  output: {schema: VoiceQueryToTextOutputSchema},
  model: 'googleai/gemini-2.0-flash',
  prompt: `Transcribe the following audio into text:

Audio: {{media url=audioDataUri}}`,
});

const voiceQueryToTextFlow = ai.defineFlow(
  {
    name: 'voiceQueryToTextFlow',
    inputSchema: VoiceQueryToTextInputSchema,
    outputSchema: VoiceQueryToTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
