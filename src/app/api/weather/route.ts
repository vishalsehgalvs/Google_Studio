import {NextRequest, NextResponse} from 'next/server';

// This is a mock weather API. In a real application, you would fetch this from a real weather service.
const mockWeatherData = {
    'Nagpur': {
        temperature: 34,
        humidity: 75,
        windSpeed: 15,
        precipitation: "80%",
        forecast: "Heavy thunderstorms",
    },
    'Mumbai': {
        temperature: 30,
        humidity: 88,
        windSpeed: 25,
        precipitation: "95%",
        forecast: "Continuous heavy rain",
    },
    'Pune': {
        temperature: 28,
        humidity: 82,
        windSpeed: 20,
        precipitation: "70%",
        forecast: "Scattered showers",
    },
    'Delhi': {
        temperature: 38,
        humidity: 60,
        windSpeed: 10,
        precipitation: "20%",
        forecast: "Hot and humid",
    }
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const location = searchParams.get('location');

  if (!location) {
    return NextResponse.json({ error: 'Location parameter is required' }, { status: 400 });
  }

  const weather = (mockWeatherData as any)[location] || {
    temperature: 32,
    humidity: 65,
    windSpeed: 12,
    precipitation: "30%",
    forecast: "Partly cloudy",
    message: `No specific data for ${location}, showing defaults.`
  };

  return NextResponse.json(weather);
}
