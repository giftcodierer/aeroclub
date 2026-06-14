"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "aeroclub_icao";

export function SunsetBadge() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const icao = localStorage.getItem(STORAGE_KEY) ?? "EDER";
    fetch(`/api/sunset?icao=${icao}`)
      .then((r) => r.json())
      .then((d) => { if (d.sunset) setTime(d.sunset); })
      .catch(() => {});
  }, []);

  return (
    <div className="rounded-2xl border bg-white shadow-sm px-5 py-4 flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="inline-block h-2 w-2 rounded-full bg-orange-400" />
        <p className="text-xs font-medium text-muted-foreground">Sonnenuntergang</p>
      </div>
      <p className="text-2xl font-bold tracking-tight text-slate-900">
        {time ?? "—"}
      </p>
    </div>
  );
}
