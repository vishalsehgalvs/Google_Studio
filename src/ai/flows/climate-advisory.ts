'use server';
/**
 * @fileOverview Provides climate advisories based on weather data.
 *
 * - getClimateAdvisory - A function that returns farming advice based on the weather.
 * - ClimateAdvisoryInput - The input type for the getClimateAdvisory function.
 * - ClimateAdvisoryOutput - The return type for the getClimateAdvisory function.
 */


// Plain types for input/output
export type ClimateAdvisoryInput = {
  location: string;
  language: string;
};

export type ClimateAdvisoryOutput = {
  advisory: string;
  weather: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    precipitation: string;
    forecast: string;
  };
};

// This function should call your backend API (which proxies to Flask)
// Patched: Use absolute URL for server-side, relative for client-side
export async function getClimateAdvisory(location: string, language: string): Promise<ClimateAdvisoryOutput> {
  // Use absolute URL for server-side, relative for client-side
  const isServer = typeof window === 'undefined';
  let url = '/api/climate-advisory';
  if (isServer) {
    // Use Vercel/production env var or fallback to localhost
    const base = process.env.FLASK_API_URL || process.env.NEXT_PUBLIC_FLASK_API_URL || 'http://localhost:5001';
    url = `${base}/api/climate-advisory`;
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location, language }),
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch climate advisory: ${res.status}`);
  }
  return res.json();
}
