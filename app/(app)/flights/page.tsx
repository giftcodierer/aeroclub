import { prisma } from "@/lib/prisma";
import { NewFlightButton, LiveTimer, EndFlightButton, StartFlightButton, RevertFlightButton, EditFlightButton, DeleteFlightButton } from "../FlightComponents";
import { fullAuth } from "@/auth";

function duration(start: Date, end: Date) {
  const diff = Math.floor((end.getTime() - start.getTime()) / 1000);
  const h = Math.floor(diff / 3600).toString().padStart(2, "0");
  const m = Math.floor((diff % 3600) / 60).toString().padStart(2, "0");
  const s = (diff % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

const launchIcon: Record<string, string> = { Winde: "🪁", Schlepper: "🛩️", Eigenstart: "🔋" };
const pilotFunctionLabel: Record<string, string> = {
  PIC_SOLO: "PIC Allein",
  PIC_WITH_COPILOT: "PIC m. Begl.",
  DUAL_STUDENT: "Doppels. Schüler",
  DUAL_INSTRUCTOR: "Doppels. Lehrer",
  SOLO_STUDENT: "Alleinflug Schüler",
};



function TableHeaders({ extra }: { extra?: React.ReactNode }) {
  return (
    <tr className="text-slate-600">
      <th className="px-3 py-2 font-semibold">Datum</th>
      <th className="px-3 py-2 font-semibold">Pilot</th>
      <th className="px-3 py-2 font-semibold">Funktion</th>
      <th className="px-3 py-2 font-semibold">Flugzeug</th>
      <th className="px-3 py-2 font-semibold">Startart</th>
      <th className="px-3 py-2 font-semibold">Abflugort</th>
      {extra}
    </tr>
  );
}

export default async function FlightsPage() {
  const session = await fullAuth();
  const role = session?.user?.role;
  const canFly = role === "ADMIN" || role === "DISPATCHER";
  const isAdmin = role === "ADMIN";

  const [members, aircrafts, flights] = await Promise.all([
    prisma.member.findMany({ orderBy: { firstName: "asc" }, select: { id: true, firstName: true, lastName: true, hasLicense: true } }),
    prisma.aircraft.findMany({ orderBy: { model: "asc" } }),
    prisma.flight.findMany({
      orderBy: { createdAt: "desc" },
      include: { member: true, aircraft: true, instructor: true },
      take: 200,
    }),
  ]);

  const queuedFlights = flights.filter((f) => f.status === "QUEUED");
  const activeFlights = flights.filter((f) => f.status === "ACTIVE");
  const completedFlights = flights.filter((f) => f.status === "COMPLETED").sort((a, b) =>
    (b.startTime?.getTime() ?? 0) - (a.startTime?.getTime() ?? 0)
  );

  const busyMemberIds = new Set([...queuedFlights, ...activeFlights].map((f) => f.memberId));
  const busyAircraftIds = new Set([...queuedFlights, ...activeFlights].map((f) => f.aircraftId));
  const availableMembers = members.filter((m) => !busyMemberIds.has(m.id));
  const availableAircrafts = aircrafts.filter((a) => !busyAircraftIds.has(a.id));

  return (
    <section className="py-6 md:py-8">
      {/* Neuer Flug Button */}
      <div className="mb-10 flex justify-center">
        {canFly && <NewFlightButton members={availableMembers} aircrafts={availableAircrafts} />}
      </div>

      {/* Warteschlange */}
      {queuedFlights.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-semibold flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400"></span>
            Startbereit ({queuedFlights.length})
          </h2>
          <div className="overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/50 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse text-left text-sm">
                <thead className="bg-amber-100/60">
                  <TableHeaders extra={<th className="px-3 py-2 font-semibold"></th>} />
                </thead>
                <tbody>
                  {queuedFlights.map((f) => (
                    <tr key={f.id} className="border-t border-amber-200 transition-colors hover:bg-amber-50">
                      <td className="px-3 py-2 text-slate-700">{f.createdAt.toLocaleDateString("de-DE")}</td>
                      <td className="px-3 py-2 font-medium text-slate-900">
                        {f.member.firstName} {f.member.lastName}
                        {f.instructor && <div className="text-xs text-slate-500 font-normal">Lehrer: {f.instructor.firstName} {f.instructor.lastName}</div>}
                      </td>
                      <td className="px-3 py-2 text-slate-700 text-xs">{pilotFunctionLabel[f.pilotFunction ?? ""] ?? "—"}</td>
                      <td className="px-3 py-2 text-slate-700">{f.aircraft.model} <span className="font-mono text-xs text-muted-foreground">{f.aircraft.registration}</span></td>
                      <td className="px-3 py-2 text-slate-700">{launchIcon[f.launchType ?? ""] ?? ""} {f.launchType ?? "—"}</td>
                      <td className="px-3 py-2 text-slate-700">{f.departureLocation ?? "—"}</td>
                      <td className="px-3 py-2">
                        {canFly && (
                          <div className="flex items-center gap-2">
                            <StartFlightButton id={f.id} />
                            <EditFlightButton
                              flight={{ id: f.id, memberId: f.memberId, aircraftId: f.aircraftId, launchType: f.launchType, pilotFunction: f.pilotFunction, departureLocation: f.departureLocation, arrivalLocation: f.arrivalLocation, instructorId: f.instructorId, notes: f.notes, startTime: null, endTime: null, isCompleted: false }}
                              members={members} aircrafts={aircrafts}
                            />
                            {isAdmin && <DeleteFlightButton id={f.id} />}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Aktive Flüge */}
      {activeFlights.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-semibold flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500"></span>
            Aktive Flüge ({activeFlights.length})
          </h2>
          <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50/50 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse text-left text-sm">
                <thead className="bg-emerald-100/60">
                  <TableHeaders extra={<><th className="px-3 py-2 font-semibold">Startzeit</th><th className="px-3 py-2 font-semibold">Dauer</th><th className="px-3 py-2 font-semibold"></th></>} />
                </thead>
                <tbody>
                  {activeFlights.map((f) => (
                    <tr key={f.id} className="border-t border-emerald-200 transition-colors hover:bg-emerald-50">
                      <td className="px-3 py-2 text-slate-700">{f.startTime?.toLocaleDateString("de-DE") ?? "—"}</td>
                      <td className="px-3 py-2 font-medium text-slate-900">
                        {f.member.firstName} {f.member.lastName}
                        {f.instructor && <div className="text-xs text-slate-500 font-normal">Lehrer: {f.instructor.firstName} {f.instructor.lastName}</div>}
                      </td>
                      <td className="px-3 py-2 text-slate-700 text-xs">{pilotFunctionLabel[f.pilotFunction ?? ""] ?? "—"}</td>
                      <td className="px-3 py-2 text-slate-700">{f.aircraft.model} <span className="font-mono text-xs text-muted-foreground">{f.aircraft.registration}</span></td>
                      <td className="px-3 py-2 text-slate-700">{launchIcon[f.launchType ?? ""] ?? ""} {f.launchType ?? "—"}</td>
                      <td className="px-3 py-2 text-slate-700">{f.departureLocation ?? "—"}</td>
                      <td className="px-3 py-2 text-slate-700">{f.startTime?.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) ?? "—"}</td>
                      <td className="px-3 py-2">{f.startTime && <LiveTimer startTime={f.startTime.toISOString()} />}</td>
                      <td className="px-3 py-2">
                        {canFly && (
                          <div className="flex items-center gap-2">
                            <EndFlightButton id={f.id} />
                            <RevertFlightButton id={f.id} />
                            <EditFlightButton
                              flight={{ id: f.id, memberId: f.memberId, aircraftId: f.aircraftId, launchType: f.launchType, pilotFunction: f.pilotFunction, departureLocation: f.departureLocation, arrivalLocation: f.arrivalLocation, instructorId: f.instructorId, notes: f.notes, startTime: f.startTime?.toISOString() ?? null, endTime: null, isCompleted: false }}
                              members={members} aircrafts={aircrafts}
                            />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Flugbuch */}
      <div>
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Flugbuch</h2>
          {isAdmin && completedFlights.length > 0 && (
            <a
              href="/api/export/flights"
              download
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              CSV exportieren
            </a>
          )}
        </div>
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
            <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr className="text-slate-600">
                  <th className="px-3 py-2 font-semibold">Datum</th>
                  <th className="px-3 py-2 font-semibold">Pilot</th>
                  <th className="px-3 py-2 font-semibold">Funktion</th>
                  <th className="px-3 py-2 font-semibold">Flugzeug</th>
                  <th className="px-3 py-2 font-semibold">Startart</th>
                  <th className="px-3 py-2 font-semibold">Abflug</th>
                  <th className="px-3 py-2 font-semibold">Ankunft</th>
                  <th className="px-3 py-2 font-semibold">Start</th>
                  <th className="px-3 py-2 font-semibold">Landung</th>
                  <th className="px-3 py-2 font-semibold">Dauer</th>
                  <th className="px-3 py-2 font-semibold">Notizen</th>
                  {isAdmin && <th className="px-3 py-2 font-semibold"></th>}
                </tr>
              </thead>
              <tbody>
                {completedFlights.map((f) => (
                  <tr key={f.id} className="border-t text-sm transition-colors hover:bg-slate-50/80">
                    <td className="px-3 py-2 text-slate-700">{f.startTime?.toLocaleDateString("de-DE") ?? "—"}</td>
                    <td className="px-3 py-2 font-medium text-slate-900">
                      {f.member.firstName} {f.member.lastName}
                      {f.instructor && <div className="text-xs text-slate-500 font-normal">Lehrer: {f.instructor.firstName} {f.instructor.lastName}</div>}
                    </td>
                    <td className="px-3 py-2 text-slate-700 text-xs">{pilotFunctionLabel[f.pilotFunction ?? ""] ?? "—"}</td>
                    <td className="px-3 py-2 text-slate-700">{f.aircraft.model} <span className="font-mono text-xs text-muted-foreground">{f.aircraft.registration}</span></td>
                    <td className="px-3 py-2 text-slate-700">{launchIcon[f.launchType ?? ""] ?? ""} {f.launchType ?? "—"}</td>
                    <td className="px-3 py-2 text-slate-700">{f.departureLocation ?? "—"}</td>
                    <td className="px-3 py-2 text-slate-700">{f.arrivalLocation ?? "—"}</td>
                    <td className="px-3 py-2 text-slate-700">{f.startTime?.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) ?? "—"}</td>
                    <td className="px-3 py-2 text-slate-700">{f.endTime?.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) ?? "—"}</td>
                    <td className="px-3 py-2 font-mono text-slate-700">{f.startTime && f.endTime ? duration(f.startTime, f.endTime) : "—"}</td>
                    <td className="px-3 py-2 text-slate-500 italic">{f.notes ?? "—"}</td>
                    {isAdmin && (
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <EditFlightButton
                            flight={{ id: f.id, memberId: f.memberId, aircraftId: f.aircraftId, launchType: f.launchType, pilotFunction: f.pilotFunction, departureLocation: f.departureLocation, arrivalLocation: f.arrivalLocation, instructorId: f.instructorId, notes: f.notes, startTime: f.startTime?.toISOString() ?? null, endTime: f.endTime?.toISOString() ?? null, isCompleted: true }}
                            members={members} aircrafts={aircrafts}
                          />
                          <DeleteFlightButton id={f.id} />
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {completedFlights.length === 0 && (
                  <tr>
                    <td colSpan={isAdmin ? 12 : 11} className="px-3 py-10 text-center text-sm text-muted-foreground">
                      Noch keine abgeschlossenen Flüge.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
