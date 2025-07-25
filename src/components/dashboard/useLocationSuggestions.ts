import { useState } from "react";

// Example: could be replaced with a backend API for real suggestions
export const MARKET_LOCATIONS = [
  "KR Market, Bengaluru, Karnataka",
  "Nagpur, Maharashtra",
  "Azadpur Mandi, Delhi",
  "Vashi Market, Navi Mumbai",
  "Chennai Koyambedu Market, Tamil Nadu",
  "Lucknow, Uttar Pradesh",
  "Indore, Madhya Pradesh",
  "Ahmedabad, Gujarat",
  "Jaipur, Rajasthan",
  "Hyderabad, Telangana",
  "Patna, Bihar",
  "Kolkata, West Bengal",
  "Bhopal, Madhya Pradesh",
  "Pune, Maharashtra",
  "Surat, Gujarat",
  "Chandigarh",
  "Coimbatore, Tamil Nadu",
  "Guntur, Andhra Pradesh",
  "Agra, Uttar Pradesh",
  "Varanasi, Uttar Pradesh"
];

export function useLocationSuggestions() {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  function getSuggestions(query: string) {
    if (!query) {
      setSuggestions([]);
      return;
    }
    const lower = query.toLowerCase();
    setSuggestions(
      MARKET_LOCATIONS.filter(loc => loc.toLowerCase().includes(lower)).slice(0, 5)
    );
  }

  return { suggestions, getSuggestions };
}
