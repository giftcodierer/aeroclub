import { prisma } from "@/lib/prisma";
import { fullAuth } from "@/auth";
import { WeatherWidget } from "./WeatherWidget";
import { AnnouncementList } from "./AnnouncementComponents";
import { SunsetBadge } from "./SunsetBadge";
import { ActiveFlightsPanel } from "./ActiveFlightsPanel";

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

function StatCard({
  label,
  value,
  dot,
}: {
  label: string;
  value: string | number;
  dot?: "amber" | "emerald" | "slate";
}) {
  const dotColor = {
    amber: "bg-amber-400",
    emerald: "bg-emerald-500 animate-pulse",
    slate: "bg-slate-400",
  };

  return (
    <div className="rounded-2xl border bg-white shadow-sm px-5 py-4 flex flex-col gap-1">
      <div className="flex items-center gap-2">
        {dot && <span className={`inline-block h-2 w-2 rounded-full ${dotColor[dot]}`} />}
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
      <p className="text-2xl font-bold tracking-tight text-slate-900">{value}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await fullAuth();
  const isAdmin = session?.user?.role === "ADMIN";

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [statsFlights, activeFlights, announcements] = await Promise.all([
    prisma.flight.findMany({
      where: {
        OR: [
          { status: "QUEUED" },
          { status: "COMPLETED", endTime: { gte: startOfToday } },
        ],
      },
      select: { status: true, startTime: true, endTime: true },
    }),
    prisma.flight.findMany({
      where: { status: "ACTIVE" },
      include: { member: true, aircraft: true, instructor: true },
      orderBy: { startTime: "asc" },
    }),
    prisma.announcement.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const queued = statsFlights.filter((f) => f.status === "QUEUED");
  const completedToday = statsFlights.filter((f) => f.status === "COMPLETED");

  const totalSeconds = completedToday.reduce((sum, f) => {
    if (!f.startTime || !f.endTime) return sum;
    return sum + Math.floor((f.endTime.getTime() - f.startTime.getTime()) / 1000);
  }, 0);

  const serializedActive = activeFlights.map((f) => ({
    id: f.id,
    pilotName: `${f.member.firstName} ${f.member.lastName}`,
    instructorName: f.instructor
      ? `${f.instructor.firstName} ${f.instructor.lastName}`
      : null,
    aircraftModel: f.aircraft.model,
    aircraftRegistration: f.aircraft.registration,
    startTime: f.startTime!.toISOString(),
  }));

  const serializedAnnouncements = announcements.map((a) => ({
    id: a.id,
    title: a.title,
    content: a.content,
    createdAt: a.createdAt.toISOString(),
  }));

  return (
    <section className="py-6 md:py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard label="Abgeschlossen heute" value={completedToday.length} dot="slate" />
        <StatCard label="In der Luft" value={activeFlights.length} dot="emerald" />
        <StatCard label="Startbereit" value={queued.length} dot="amber" />
        <StatCard
          label="Flugzeit heute"
          value={totalSeconds > 0 ? formatDuration(totalSeconds) : "—"}
        />
        <SunsetBadge />
      </div>

      <ActiveFlightsPanel flights={serializedActive} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr]">
        <WeatherWidget />
        <AnnouncementList announcements={serializedAnnouncements} isAdmin={isAdmin} />
      </div>
    </section>
  );
}
