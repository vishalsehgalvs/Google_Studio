import { NextResponse } from 'next/server';

// Demo: Dashboard data
export async function GET() {
  return NextResponse.json({ message: 'Dashboard data endpoint' });
}
