import { prisma } from "@/lib/prisma";
import MemberForm, { EditMemberButton } from "./MemberForm";
import { fullAuth } from "@/auth";

function StatusBadge({ status }: { status: "AKTIV" | "INAKTIV" | null }) {
  const isActive = status === "AKTIV";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        isActive
          ? "bg-emerald-100 text-emerald-700 ring-emerald-200"
          : "bg-slate-100 text-slate-600 ring-slate-200"
      }`}
    >
      {isActive ? "Aktiv" : "Inaktiv"}
    </span>
  );
}

export default async function MembersPage() {
  const session = await fullAuth();
  const isAdmin = session?.user?.role === "ADMIN";

  const members = await prisma.member.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="py-6 md:py-8">
      <div>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mitglieder</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Übersicht aller Mitglieder.
            </p>
          </div>

          {isAdmin && <MemberForm />}
        </div>

        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse text-left">
              <thead className="bg-slate-50">
                <tr className="text-sm text-slate-600">
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold">E-Mail</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Geburtsdatum</th>
                  <th className="px-5 py-3 font-semibold">Lizenz</th>
                  <th className="px-5 py-3 font-semibold">Mitglied seit</th>
                  <th className="px-5 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr
                    key={m.id}
                    className="border-t text-sm transition-colors hover:bg-slate-50/80"
                  >
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {m.firstName} {m.lastName}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {m.email ?? "—"}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={m.status ?? null} />
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {new Date(m.birthDate).toLocaleDateString("de-DE")}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                          m.hasLicense
                            ? "bg-emerald-100 text-emerald-700 ring-emerald-200"
                            : "bg-slate-100 text-slate-600 ring-slate-200"
                        }`}
                      >
                        {m.hasLicense ? "Lizenz" : "Keine Lizenz"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {new Date(m.createdAt).toLocaleDateString("de-DE")}
                    </td>
                    <td className="px-5 py-4">
                      {isAdmin && (
                        <EditMemberButton
                          member={{
                            id: m.id,
                            firstName: m.firstName,
                            lastName: m.lastName,
                            email: m.email ?? "",
                            birthDate: m.birthDate.toISOString().split("T")[0],
                            hasLicense: m.hasLicense,
                            status: m.status ?? "AKTIV",
                            createdAt: m.createdAt.toISOString().split("T")[0],
                          }}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
