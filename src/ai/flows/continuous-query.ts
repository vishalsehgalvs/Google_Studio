'use server';
/**
 * @fileOverview Handles continuous follow-up questions from the user.
 *
 * - answerFollowUp - A function that answers follow-up questions in the context of a previous diagnosis.
 * - AnswerFollowUpInput - The input type for the answerFollowUp function.
 * - AnswerFollowUpOutput - The return type for the answerFollowUp function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnswerFollowUpInputSchema = z.object({
  question: z.string().describe('The follow-up question from the user.'),
  context: z.string().describe('The context of the previous diagnosis (disease, remedies).'),
  language: z.string().describe('The language for the response (e.g., "en", "hi", "es").'),
});
export type AnswerFollowUpInput = z.infer<typeof AnswerFollowUpInputSchema>;

const AnswerFollowUpOutputSchema = z.object({
  answer: z.string().describe('The answer to the follow-up question.'),
});
export type AnswerFollowUpOutput = z.infer<typeof AnswerFollowUpOutputSchema>;


export async function answerFollowUp(input: AnswerFollowUpInput): Promise<AnswerFollowUpOutput> {
  return answerFollowUpFlow(input);
}


const prompt = ai.definePrompt({
    name: 'answerFollowUpPrompt',
    input: { schema: AnswerFollowUpInputSchema },
    output: { schema: AnswerFollowUpOutputSchema },
    prompt: `You are a helpful agricultural assistant. A farmer has a follow-up question regarding a recent crop diagnosis.
Provide a clear and concise answer to their question based on the provided context.
Generate the response in the following language: {{language}}.

**Context of Diagnosis:**
{{{context}}}

**Farmer's Question:**
"{{{question}}}"

Your answer should be helpful and easy to understand for someone who may not be a technical expert.
`,
});


const answerFollowUpFlow = ai.defineFlow(
    {
        name: 'answerFollowUpFlow',
        inputSchema: AnswerFollowUpInputSchema,
        outputSchema: AnswerFollowUpOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
