'use server';
/**
 * @fileOverview Converts voice queries in various dialects to text.
 *
 * - voiceQueryToText - A function that converts voice queries to text.
 * - VoiceQueryToTextInput - The input type for the voiceQueryToText function.
 * - VoiceQueryToTextOutput - The return type for the voiceQueryToText function.
 */

// ...existing code...
export type VoiceQueryToTextInput = {
  audioDataUri: string;
};

export type VoiceQueryToTextOutput = {
  text: string;
};

export async function voiceQueryToText(input: VoiceQueryToTextInput): Promise<VoiceQueryToTextOutput> {
  const res = await fetch('/api/voice-query-to-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to fetch voice query to text');
  return res.json();
}
