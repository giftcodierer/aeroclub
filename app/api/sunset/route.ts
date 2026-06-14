import { NextRequest, NextResponse } from "next/server";
import { AIRPORT_COORDS } from "@/lib/airports";

export async function GET(req: NextRequest) {
  const icao = req.nextUrl.searchParams.get("icao")?.toUpperCase();
  if (!icao || !/^[A-Z]{4}$/.test(icao)) {
    return NextResponse.json({ error: "Ungültiger ICAO-Code" }, { status: 400 });
  }

  const coords = AIRPORT_COORDS[icao];
  if (!coords) {
    return NextResponse.json({ error: "Unbekannter Flugplatz" }, { status: 404 });
  }

  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=sunset&timezone=auto`,
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();
    const sunsetIso: string | undefined = data.daily?.sunset?.[0];
    if (!sunsetIso) return NextResponse.json({ error: "Keine Daten" }, { status: 404 });

    // Open-Meteo gibt Lokalzeit zurück z.B. "2026-06-14T21:20" — nur HH:MM nehmen
    const time = sunsetIso.split("T")[1];
    return NextResponse.json({ sunset: time });
  } catch (e) {
    console.error("Sunset error:", e);
    return NextResponse.json({ error: "Fehler beim Laden" }, { status: 502 });
  }
}
