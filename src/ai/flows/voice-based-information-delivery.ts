'use server';
/**
 * @fileOverview Converts analyzed data and insights into spoken language, providing farmers with information and advice via voice.
 *
 * - voiceBasedInformationDelivery - A function that handles the text-to-speech conversion process.
 * - VoiceBasedInformationDeliveryInput - The input type for the voiceBasedInformationDelivery function.
 * - VoiceBasedInformationDeliveryOutput - The return type for the voiceBasedInformationDelivery function.
 */

// ...existing code...
export type VoiceBasedInformationDeliveryInput = {
  text: string;
};

export type VoiceBasedInformationDeliveryOutput = {
  audioDataUri: string;
};

export async function voiceBasedInformationDelivery(input: VoiceBasedInformationDeliveryInput): Promise<VoiceBasedInformationDeliveryOutput> {
  const res = await fetch('/api/voice-delivery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to fetch voice-based information delivery');
  return res.json();
}
