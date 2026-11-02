// Local weather for the Home widget (Open-Meteo, no account needed for testing;
// commercial use needs their paid API key, read from OPEN_METEO_API_KEY when set).

const CODES: [number[], string, string][] = [
  [[0], "Clear", "sun"], [[1, 2], "Partly cloudy", "cloud-sun"], [[3], "Overcast", "cloud"], [[45, 48], "Fog", "cloud-fog"],
  [[51, 53, 55, 56, 57], "Drizzle", "cloud-drizzle"], [[61, 63, 65, 66, 67, 80, 81, 82], "Rain", "cloud-rain"],
  [[71, 73, 75, 77, 85, 86], "Snow", "cloud-snow"], [[95, 96, 99], "Thunderstorms", "cloud-lightning"],
];

export function describeCode(code: number) {
  const hit = CODES.find(([codes]) => codes.includes(code));
  return { label: hit?.[1] ?? "Weather", icon: hit?.[2] ?? "cloud" };
}

export interface Forecast {
  place: string;
  now: { tempC: number; label: string; icon: string };
  days: { date: string; maxC: number; minC: number; rainChance: number; label: string; icon: string }[];
}

export async function forecastFor(place: string, f: typeof fetch = fetch, key = process.env.OPEN_METEO_API_KEY): Promise<Forecast | null> {
  const q = place.trim() || "London";
  const host = key ? "https://customer-api.open-meteo.com" : "https://api.open-meteo.com";
  const geoHost = key ? "https://customer-geocoding-api.open-meteo.com" : "https://geocoding-api.open-meteo.com";
  const k = key ? `&apikey=${encodeURIComponent(key)}` : "";
  const geo = await f(`${geoHost}/v1/search?name=${encodeURIComponent(q)}&count=1&countryCode=GB&language=en&format=json${k}`, { next: { revalidate: 86400 } } as RequestInit);
  if (!geo.ok) return null;
  const g = (await geo.json()).results?.[0];
  if (!g) return null;
  const res = await f(
    `${host}/v1/forecast?latitude=${g.latitude}&longitude=${g.longitude}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Europe%2FLondon&forecast_days=4${k}`,
    { next: { revalidate: 1800 } } as RequestInit,
  );
  if (!res.ok) return null;
  const w = await res.json();
  return {
    place: g.name,
    now: { tempC: Math.round(w.current.temperature_2m), ...describeCode(w.current.weather_code) },
    days: (w.daily.time as string[]).map((date, i) => ({
      date,
      maxC: Math.round(w.daily.temperature_2m_max[i]),
      minC: Math.round(w.daily.temperature_2m_min[i]),
      rainChance: w.daily.precipitation_probability_max[i] ?? 0,
      ...describeCode(w.daily.weather_code[i]),
    })),
  };
}
