"use client";

import { LiveTimer } from "./FlightComponents";

type ActiveFlight = {
  id: number;
  pilotName: string;
  instructorName: string | null;
  aircraftModel: string;
  aircraftRegistration: string;
  startTime: string;
};

export function ActiveFlightsPanel({ flights }: { flights: ActiveFlight[] }) {
  if (flights.length === 0) return null;

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 shadow-sm p-5">
      <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
        <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
        Aktive Flüge
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-xs text-slate-500">
              <th className="pb-2 text-left font-medium">Pilot</th>
              <th className="pb-2 text-left font-medium">Flugzeug</th>
              <th className="pb-2 text-left font-medium">Gestartet</th>
              <th className="pb-2 text-left font-medium">Dauer</th>
            </tr>
          </thead>
          <tbody>
            {flights.map((f) => (
              <tr key={f.id} className="border-t border-emerald-200">
                <td className="py-2.5 pr-6 font-medium text-slate-900">
                  {f.pilotName}
                  {f.instructorName && (
                    <div className="text-xs font-normal text-slate-500">
                      mit {f.instructorName}
                    </div>
                  )}
                </td>
                <td className="py-2.5 pr-6 text-slate-700">
                  {f.aircraftModel}
                  <span className="ml-1.5 font-mono text-xs text-muted-foreground">
                    {f.aircraftRegistration}
                  </span>
                </td>
                <td className="py-2.5 pr-6 text-slate-700">
                  {new Date(f.startTime).toLocaleTimeString("de-DE", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="py-2.5">
                  <LiveTimer startTime={f.startTime} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
