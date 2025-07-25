import React, { useState, useContext } from 'react';
import { machineryList, Machinery } from '@/lib/machinery';

const MachineryTab: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [requestSent, setRequestSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRent = (id: string) => {
    setLoading(true);
    setError(null);
    fetch('/api/machinery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'rent', id })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSelected(id);
          setRequestSent(true);
        } else {
          setError(data.error || 'Failed to send request');
        }
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false));
  };

  const { t } = require("@/context/LanguageContext").useTranslation();
  const { LocationContext } = require("@/context/LocationContext");
  const locationContext = useContext(LocationContext);
  const location = locationContext && typeof locationContext === 'object' && 'locationName' in locationContext
    ? locationContext.locationName
    : "KR Market, Bengaluru, Karnataka";
  const locationStr = typeof location === 'string' ? location : String(location);
  const locationKey = locationStr.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
  let localizedLocation = t(`marketTab.locations.${locationKey}`);
  if (!localizedLocation || localizedLocation === `marketTab.locations.${locationKey}`) {
    // fallback to English locale
    const { t: tEn } = require('@/context/LanguageContext').getTranslation('en');
    localizedLocation = tEn(`marketTab.locations.${locationKey}`);
    if (!localizedLocation || localizedLocation === `marketTab.locations.${locationKey}`) {
      localizedLocation = location;
    }
  }
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">{t("machineryTab.title")}</h2>
      <div className="mb-2 text-muted-foreground">{localizedLocation}</div>
      {loading && <div className="mb-2 text-blue-600">{t("machineryTab.sendingRequest")}</div>}
      {error && <div className="mb-2 text-red-600">{t("machineryTab.error")}</div>}
      <ul>
        {machineryList.map((machinery) => (
          <li key={machinery.id} className="mb-4 border p-4 rounded">
            <div className="font-semibold">{machinery.name} ({machinery.type})</div>
            <div>{machinery.description}</div>
            <div>{t("machineryTab.rentPrice", { price: machinery.rentPrice })}</div>
            <div>{t(machinery.available ? "machineryTab.statusAvailable" : "machineryTab.statusNotAvailable")}</div>
            <button
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
              disabled={!machinery.available || requestSent || loading}
              onClick={() => handleRent(machinery.id)}
            >
              {requestSent && selected === machinery.id ? t("machineryTab.requestSent") : t("machineryTab.rentNow")}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MachineryTab;
