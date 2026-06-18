"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ICAO_STORAGE_KEY } from "@/lib/constants";

type MetarData = {
  icaoId: string;
  rawOb: string;
  temp: number | null;
  dewp: number | null;
  wdir: number | string | null;
  wspd: number | null;
  wgst: number | null;
  visib: number | string | null;
  altim: number | null;
  obsTime: number | null;
};

type ModelData = {
  temp: number;
  wdir: number;
  wspd: number;
  pressure: number;
  humidity: number;
  weatherCode: number;
  weatherDesc: string;
  time: string;
};

type WeatherResult =
  | { source: "metar"; metar: MetarData; taf: { rawTAF: string } | null }
  | { source: "weather-model"; data: ModelData }
  | null;


export function WeatherWidget() {
  const [icao, setIcao] = useState("");
  const [input, setInput] = useState("");
  const [result, setResult] = useState<WeatherResult>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(ICAO_STORAGE_KEY) ?? "EDER";
    setIcao(saved);
    setInput(saved);
  }, []);

  useEffect(() => {
    if (!icao) return;
    loadWeather(icao);
  }, [icao]);

  async function loadWeather(code: string) {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`/api/weather?icao=${code}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch {
      setError("Wetterdaten konnten nicht geladen werden.");
    }
    setLoading(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = input.trim().toUpperCase();
    if (!/^[A-Z]{4}$/.test(code)) {
      setError("Bitte einen gültigen 4-stelligen ICAO-Code eingeben (z. B. EDER).");
      return;
    }
    localStorage.setItem(ICAO_STORAGE_KEY, code);
    setIcao(code);
  }

  function formatWind(wdir: number | string | null, wspd: number | null, wgst?: number | null) {
    if (wdir === null || wspd === null) return "—";
    const dir = wdir === "VRB" ? "variabel" : `${wdir}°`;
    const gust = wgst ? ` G${wgst}` : "";
    return `${dir} / ${wspd}${gust} kt`;
  }

  function formatQnh(altim: number) {
    return `${Math.round(altim * 33.8639)} hPa`;
  }

  return (
    <div className="rounded-2xl border bg-white shadow-sm p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Wetter</h2>
          {result?.source === "weather-model" && (
            <p className="text-xs text-muted-foreground">Wettermodell · kein METAR verfügbar</p>
          )}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            className="w-24 font-mono text-sm uppercase"
            placeholder="ICAO"
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            maxLength={4}
          />
          <Button type="submit" size="sm" variant="outline">Laden</Button>
        </form>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Lädt…</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {result?.source === "metar" && (
        <MetarDisplay metar={result.metar} taf={result.taf} formatWind={formatWind} formatQnh={formatQnh} />
      )}

      {result?.source === "weather-model" && (
        <ModelDisplay data={result.data} formatWind={formatWind} />
      )}
    </div>
  );
}

function MetarDisplay({
  metar,
  taf,
  formatWind,
  formatQnh,
}: {
  metar: MetarData;
  taf: { rawTAF: string } | null;
  formatWind: (wdir: number | string | null, wspd: number | null, wgst?: number | null) => string;
  formatQnh: (altim: number) => string;
}) {
  const obsDate = metar.obsTime ? new Date(metar.obsTime * 1000) : null;

  return (
    <div className="space-y-4">
      {obsDate && (
        <p className="text-xs text-muted-foreground">
          Stand: {obsDate.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} UTC
        </p>
      )}
      <div className="grid grid-cols-3 gap-2">
        <StatCell label="Wind" value={formatWind(metar.wdir, metar.wspd, metar.wgst)} />
        <StatCell label="Temp / TP" value={metar.temp !== null ? `${metar.temp}° / ${metar.dewp}°` : "—"} />
        <StatCell label="QNH" value={metar.altim ? formatQnh(metar.altim) : "—"} />
      </div>
      <div>
        <p className="mb-1 text-xs font-medium text-muted-foreground">METAR</p>
        <p className="rounded-lg bg-slate-950 px-3 py-2 font-mono text-xs leading-relaxed text-emerald-400">
          {metar.rawOb}
        </p>
      </div>
      {taf?.rawTAF && (
        <div>
          <p className="mb-1 text-xs font-medium text-muted-foreground">TAF</p>
          <p className="rounded-lg bg-slate-950 px-3 py-2 font-mono text-xs leading-relaxed text-sky-300 whitespace-pre-wrap">
            {taf.rawTAF}
          </p>
        </div>
      )}
    </div>
  );
}

function ModelDisplay({
  data,
  formatWind,
}: {
  data: ModelData;
  formatWind: (wdir: number | string | null, wspd: number | null) => string;
}) {
  const time = new Date(data.time + "Z");

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Stand: {time.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} UTC
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatCell label="Wind" value={formatWind(data.wdir, data.wspd)} />
        <StatCell label="Temperatur" value={`${data.temp.toFixed(1)}°C`} />
        <StatCell label="QNH" value={`${data.pressure} hPa`} />
        <StatCell label="Feuchte" value={`${data.humidity}%`} />
      </div>
      <div className="rounded-xl bg-slate-50 px-4 py-3">
        <p className="text-sm font-medium text-slate-700">{data.weatherDesc}</p>
      </div>
    </div>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}
