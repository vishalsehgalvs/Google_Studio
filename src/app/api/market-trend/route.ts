import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Adjust the Flask backend URL as needed
    const flaskUrl = 'http://localhost:5001/api/market-trend';
    let flaskRes, data;
    try {
      flaskRes = await fetch(flaskUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      data = await flaskRes.json();
    } catch (flaskErr: any) {
      console.error('[Next.js] Error fetching from Flask:', flaskErr);
      return NextResponse.json({ error: 'fetch failed', details: flaskErr?.message || String(flaskErr) }, { status: 500 });
    }
    if (!flaskRes.ok) {
      console.error('[Next.js] Flask returned error:', data);
    }
    return NextResponse.json(data, { status: flaskRes.status });
  } catch (error: any) {
    console.error('[Next.js] Unhandled error in /api/market-trend:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
