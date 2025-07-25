'use server';
/**
 * @fileOverview Handles continuous follow-up questions from the user.
 *
 * - answerFollowUp - A function that answers follow-up questions in the context of a previous diagnosis.
 * - AnswerFollowUpInput - The input type for the answerFollowUp function.
 * - AnswerFollowUpOutput - The return type for the answerFollowUp function.
 */


// ...existing code...
export type AnswerFollowUpInput = {
  question: string;
  context: string;
  language: string;
};

export type AnswerFollowUpOutput = {
  answer: string;
};

export async function answerFollowUp(input: AnswerFollowUpInput): Promise<AnswerFollowUpOutput> {
  const res = await fetch('/api/continuous-query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to fetch follow-up answer');
  return res.json();
}
