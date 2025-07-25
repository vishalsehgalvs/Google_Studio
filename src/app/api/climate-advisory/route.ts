import { NextResponse } from 'next/server';

// Proxy POST requests to Flask backend for climate advisory and weather
export async function POST(req: Request) {
  const body = await req.json();
  // Adjust the backend URL/port as needed
  const flaskUrl = process.env.FLASK_API_URL || 'http://localhost:5001/api/climate-advisory';
  try {
    const flaskRes = await fetch(flaskUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await flaskRes.json();
    return NextResponse.json(data, { status: flaskRes.status });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to connect to backend', details: e?.message || e?.toString() }, { status: 500 });
  }
}
