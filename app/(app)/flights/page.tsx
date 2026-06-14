import { prisma } from "@/lib/prisma";
import { NewFlightButton, LiveTimer, EndFlightButton, StartFlightButton, RevertFlightButton, EditFlightButton, DeleteFlightButton } from "../FlightComponents";
import { fullAuth } from "@/auth";
import Link from "next/link";
import { LAUNCH_ICON, PILOT_FUNCTION_LABEL } from "@/lib/flight-utils";

const PAGE_SIZE = 25;

function duration(start: Date, end: Date) {
  const diff = Math.floor((end.getTime() - start.getTime()) / 1000);
  const h = Math.floor(diff / 3600).toString().padStart(2, "0");
  const m = Math.floor((diff % 3600) / 60).toString().padStart(2, "0");
  const s = (diff % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

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

function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  const btnBase = "inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-medium transition";

  return (
    <div className="mt-4 flex items-center justify-between gap-4">
      <p className="text-xs text-muted-foreground">Seite {page} von {totalPages}</p>
      <div className="flex items-center gap-1">
        {page > 1 ? (
          <Link href={`/flights?page=${page - 1}`} className={`${btnBase} border border-slate-300 bg-white text-slate-700 hover:bg-slate-50`}>
            ←
          </Link>
        ) : (
          <span className={`${btnBase} border border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed`}>←</span>
        )}

        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="px-1 text-slate-400 text-sm">…</span>
          ) : (
            <Link
              key={p}
              href={`/flights?page=${p}`}
              className={`${btnBase} ${p === page ? "bg-sky-600 text-white border border-sky-600" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}
            >
              {p}
            </Link>
          )
        )}

        {page < totalPages ? (
          <Link href={`/flights?page=${page + 1}`} className={`${btnBase} border border-slate-300 bg-white text-slate-700 hover:bg-slate-50`}>
            →
          </Link>
        ) : (
          <span className={`${btnBase} border border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed`}>→</span>
        )}
      </div>
    </div>
  );
}

export default async function FlightsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1") || 1);

  const session = await fullAuth();
  const role = session?.user?.role;
  const canFly = role === "ADMIN" || role === "DISPATCHER";
  const isAdmin = role === "ADMIN";

  const [members, aircrafts, flights, totalCompleted] = await Promise.all([
    prisma.member.findMany({ orderBy: { firstName: "asc" }, select: { id: true, firstName: true, lastName: true, hasLicense: true } }),
    prisma.aircraft.findMany({ orderBy: { model: "asc" } }),
    prisma.flight.findMany({
      where: { status: { in: ["QUEUED", "ACTIVE"] } },
      orderBy: { createdAt: "desc" },
      include: { member: true, aircraft: true, instructor: true },
    }),
    prisma.flight.count({ where: { status: "COMPLETED" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCompleted / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const completedFlights = await prisma.flight.findMany({
    where: { status: "COMPLETED" },
    include: { member: true, aircraft: true, instructor: true },
    orderBy: { startTime: "desc" },
    skip: (safePage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const queuedFlights = flights.filter((f) => f.status === "QUEUED");
  const activeFlights = flights.filter((f) => f.status === "ACTIVE");

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
                      <td className="px-3 py-2 text-slate-700 text-xs">{PILOT_FUNCTION_LABEL[f.pilotFunction ?? ""] ?? "—"}</td>
                      <td className="px-3 py-2 text-slate-700">{f.aircraft.model} <span className="font-mono text-xs text-muted-foreground">{f.aircraft.registration}</span></td>
                      <td className="px-3 py-2 text-slate-700">{LAUNCH_ICON[f.launchType ?? ""] ?? ""} {f.launchType ?? "—"}</td>
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
                      <td className="px-3 py-2 text-slate-700 text-xs">{PILOT_FUNCTION_LABEL[f.pilotFunction ?? ""] ?? "—"}</td>
                      <td className="px-3 py-2 text-slate-700">{f.aircraft.model} <span className="font-mono text-xs text-muted-foreground">{f.aircraft.registration}</span></td>
                      <td className="px-3 py-2 text-slate-700">{LAUNCH_ICON[f.launchType ?? ""] ?? ""} {f.launchType ?? "—"}</td>
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
          <h2 className="text-lg font-semibold">
            Flugbuch
            <span className="ml-2 text-sm font-normal text-muted-foreground">({totalCompleted} Einträge)</span>
          </h2>
          {isAdmin && totalCompleted > 0 && (
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
          <div className="overflow-x-auto">
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
                    <td className="px-3 py-2 text-slate-700 text-xs">{PILOT_FUNCTION_LABEL[f.pilotFunction ?? ""] ?? "—"}</td>
                    <td className="px-3 py-2 text-slate-700">{f.aircraft.model} <span className="font-mono text-xs text-muted-foreground">{f.aircraft.registration}</span></td>
                    <td className="px-3 py-2 text-slate-700">{LAUNCH_ICON[f.launchType ?? ""] ?? ""} {f.launchType ?? "—"}</td>
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
        <Pagination page={safePage} totalPages={totalPages} />
      </div>
    </section>
  );
}
