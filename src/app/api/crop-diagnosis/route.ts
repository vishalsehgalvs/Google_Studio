import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // In production, handle multipart/form-data and upload to Google Cloud Storage
  // For demo, just return a mock diagnosis
  return NextResponse.json({ success: true, diagnosis: 'No disease detected. Crop is healthy.' });
}
