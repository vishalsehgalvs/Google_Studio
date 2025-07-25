'use server';

/**
 * @fileOverview A plant disease diagnosis AI agent based on image input.
 *
 * - imageBasedDiagnosis - A function that handles the plant diagnosis process from an image.
 * - ImageBasedDiagnosisInput - The input type for the imageBasedDiagnosis function.
 * - ImageBasedDiagnosisOutput - The return type for the imageBasedDiagnosis function.
 */


// ...existing code...
export type ImageBasedDiagnosisInput = {
  photoDataUri: string;
  language: string;
};

export type ImageBasedDiagnosisOutput = {
  diagnosis: {
    disease: string;
    remedies: string;
    confidenceScore: number;
  };
};

export async function imageBasedDiagnosis(input: ImageBasedDiagnosisInput): Promise<ImageBasedDiagnosisOutput> {
  const res = await fetch('/api/image-diagnosis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to fetch image-based diagnosis');
  return res.json();
}
