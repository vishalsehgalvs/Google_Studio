'use server';
/**
 * @fileOverview Converts analyzed data and insights into spoken language, providing farmers with information and advice via voice.
 *
 * - voiceBasedInformationDelivery - A function that handles the text-to-speech conversion process.
 * - VoiceBasedInformationDeliveryInput - The input type for the voiceBasedInformationDelivery function.
 * - VoiceBasedInformationDeliveryOutput - The return type for the voiceBasedInformationDelivery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const VoiceBasedInformationDeliveryInputSchema = z.object({
  text: z.string().describe('The text to be converted to speech.'),
});
export type VoiceBasedInformationDeliveryInput = z.infer<typeof VoiceBasedInformationDeliveryInputSchema>;

const VoiceBasedInformationDeliveryOutputSchema = z.object({
  audioDataUri: z.string().describe('The audio data URI in WAV format.'),
});
export type VoiceBasedInformationDeliveryOutput = z.infer<typeof VoiceBasedInformationDeliveryOutputSchema>;

export async function voiceBasedInformationDelivery(input: VoiceBasedInformationDeliveryInput): Promise<VoiceBasedInformationDeliveryOutput> {
  return voiceBasedInformationDeliveryFlow(input);
}

const voiceBasedInformationDeliveryFlow = ai.defineFlow(
  {
    name: 'voiceBasedInformationDeliveryFlow',
    inputSchema: VoiceBasedInformationDeliveryInputSchema,
    outputSchema: VoiceBasedInformationDeliveryOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: input.text,
    });
    if (!media) {
      throw new Error('no media returned');
    }
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    return {
      audioDataUri: 'data:audio/wav;base64,' + (await toWav(audioBuffer)),
    };
  }
);

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
