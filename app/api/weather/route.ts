import { NextRequest, NextResponse } from "next/server";
import { AIRPORT_COORDS } from "@/lib/airports";

const WMO: Record<number, string> = {
  0: "Klarer Himmel", 1: "Überwiegend klar", 2: "Teilweise bewölkt", 3: "Bedeckt",
  45: "Nebel", 48: "Gefrierender Nebel",
  51: "Leichter Nieselregen", 53: "Nieselregen", 55: "Starker Nieselregen",
  61: "Leichter Regen", 63: "Regen", 65: "Starker Regen",
  71: "Leichter Schnee", 73: "Schnee", 75: "Starker Schnee", 77: "Schneegriesel",
  80: "Leichte Schauer", 81: "Schauer", 82: "Starke Schauer",
  85: "Leichte Schneeschauer", 86: "Starke Schneeschauer",
  95: "Gewitter", 96: "Gewitter mit Hagel", 99: "Schweres Gewitter",
};

async function tryNoaaMetar(icao: string) {
  const [metarRes, tafRes] = await Promise.all([
    fetch(`https://aviationweather.gov/api/data/metar?ids=${icao}&format=json&hours=2`, {
      headers: { "User-Agent": "AeroClub/1.0" },
      next: { revalidate: 300 },
    }),
    fetch(`https://aviationweather.gov/api/data/taf?ids=${icao}&format=json`, {
      headers: { "User-Agent": "AeroClub/1.0" },
      next: { revalidate: 300 },
    }),
  ]);

  if (metarRes.status === 204) return null;

  const [metarData, tafData] = await Promise.all([metarRes.json(), tafRes.json()]);
  const metar = Array.isArray(metarData) && metarData.length > 0 ? metarData[0] : null;
  if (!metar) return null;

  const taf = Array.isArray(tafData) && tafData.length > 0 ? tafData[0] : null;
  return {
    source: "metar" as const,
    metar: {
      icaoId: metar.icaoId,
      rawOb: metar.rawOb,
      temp: metar.temp ?? null,
      dewp: metar.dewp ?? null,
      wdir: metar.wdir ?? null,
      wspd: metar.wspd ?? null,
      wgst: metar.wgst ?? null,
      visib: metar.visib ?? null,
      altim: metar.altim ?? null,
      obsTime: metar.obsTime ?? null,
    },
    taf: taf ? { rawTAF: taf.rawTAF } : null,
  };
}

async function fetchOpenMeteo(lat: number, lon: number) {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,wind_speed_10m,wind_direction_10m,surface_pressure,weather_code,relative_humidity_2m` +
    `&wind_speed_unit=kn`,
    { next: { revalidate: 300 } }
  );
  if (!res.ok) throw new Error("Open-Meteo nicht erreichbar");
  const data = await res.json();
  const c = data.current;
  return {
    source: "weather-model" as const,
    data: {
      temp: c.temperature_2m,
      wdir: c.wind_direction_10m,
      wspd: Math.round(c.wind_speed_10m),
      pressure: Math.round(c.surface_pressure),
      humidity: c.relative_humidity_2m,
      weatherCode: c.weather_code,
      weatherDesc: WMO[c.weather_code as number] ?? "Unbekannt",
      time: c.time,
    },
  };
}

export async function GET(req: NextRequest) {
  const icao = req.nextUrl.searchParams.get("icao")?.toUpperCase();
  if (!icao || !/^[A-Z]{4}$/.test(icao)) {
    return NextResponse.json({ error: "Ungültiger ICAO-Code" }, { status: 400 });
  }

  try {
    const noaa = await tryNoaaMetar(icao);
    if (noaa) return NextResponse.json(noaa);

    const coords = AIRPORT_COORDS[icao];
    if (!coords) {
      return NextResponse.json(
        { error: `Kein METAR und keine Koordinaten für ${icao} hinterlegt. Bitte wende dich an den Administrator.` },
        { status: 404 }
      );
    }

    const modelData = await fetchOpenMeteo(coords.lat, coords.lon);
    return NextResponse.json(modelData);
  } catch (e) {
    console.error("Weather error:", e);
    return NextResponse.json({ error: "Wetterdaten konnten nicht geladen werden." }, { status: 502 });
  }
}
