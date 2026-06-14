import { prisma } from "@/lib/prisma";
import AirplaneForm, { EditAirplaneButton } from "./AirplaneForm";
import { fullAuth } from "@/auth";

function TypeBadge({ isTwoSeater, isMotorized }: { isTwoSeater: boolean; isMotorized: boolean }) {
  const label = isMotorized ? "Motorsegler" : isTwoSeater ? "Doppelsitzer" : "Einsitzer";
  const cls = isMotorized
    ? "bg-amber-100 text-amber-700 ring-amber-200"
    : isTwoSeater
    ? "bg-blue-100 text-blue-700 ring-blue-200"
    : "bg-slate-100 text-slate-600 ring-slate-200";

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${cls}`}>
      {label}
    </span>
  );
}

export default async function AirplanesPage() {
  const session = await fullAuth();
  const isAdmin = session?.user?.role === "ADMIN";

  const aircrafts = await prisma.aircraft.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="py-6 md:py-8">
      <div>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Flugzeuge</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Übersicht aller Flugzeuge.
            </p>
          </div>
          {isAdmin && <AirplaneForm />}
        </div>

        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead className="bg-slate-50">
                <tr className="text-sm text-slate-600">
                  <th className="px-5 py-3 font-semibold">Typ</th>
                  <th className="px-5 py-3 font-semibold">Kennzeichen</th>
                  <th className="px-5 py-3 font-semibold">Baujahr</th>
                  <th className="px-5 py-3 font-semibold">Kategorie</th>
                  <th className="px-5 py-3 font-semibold">Hinzugefügt</th>
                  <th className="px-5 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {aircrafts.map((a) => (
                  <tr key={a.id} className="border-t text-sm transition-colors hover:bg-slate-50/80">
                    <td className="px-5 py-4 font-medium text-slate-900">{a.model}</td>
                    <td className="px-5 py-4 text-slate-700 font-mono">{a.registration}</td>
                    <td className="px-5 py-4 text-slate-700">{a.yearBuilt ?? "—"}</td>
                    <td className="px-5 py-4">
                      <TypeBadge isTwoSeater={a.isTwoSeater} isMotorized={a.isMotorized} />
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {new Date(a.createdAt).toLocaleDateString("de-DE")}
                    </td>
                    <td className="px-5 py-4">
                      {isAdmin && (
                        <EditAirplaneButton
                          aircraft={{
                            id: a.id,
                            model: a.model,
                            registration: a.registration,
                            yearBuilt: a.yearBuilt?.toString() ?? "",
                            isTwoSeater: a.isTwoSeater,
                            isMotorized: a.isMotorized,
                          }}
                        />
                      )}
                    </td>
                  </tr>
                ))}
                {aircrafts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-muted-foreground">
                      Noch keine Flugzeuge vorhanden.
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
