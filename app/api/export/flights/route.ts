import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fullAuth } from "@/auth";

const PILOT_FUNCTION_LABELS: Record<string, string> = {
  PIC_SOLO: "PIC Alleinflug",
  PIC_WITH_COPILOT: "PIC mit Begleitung",
  DUAL_STUDENT: "Doppelsitzer Schüler",
  DUAL_INSTRUCTOR: "Doppelsitzer Lehrer",
  SOLO_STUDENT: "Alleinflug Schüler",
};

function esc(value: string | null | undefined): string {
  const s = value ?? "";
  return `"${s.replace(/"/g, '""')}"`;
}

function formatDate(d: Date | null): string {
  if (!d) return "";
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatTime(d: Date | null): string {
  if (!d) return "";
  return d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
}

function formatDuration(start: Date | null, end: Date | null): string {
  if (!start || !end) return "";
  const totalMin = Math.round((end.getTime() - start.getTime()) / 60000);
  const h = Math.floor(totalMin / 60).toString().padStart(2, "0");
  const m = (totalMin % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export async function GET() {
  const session = await fullAuth();
  if (!session || session.user?.role !== "ADMIN") {
    return new NextResponse(null, { status: 403 });
  }

  const flights = await prisma.flight.findMany({
    where: { status: "COMPLETED" },
    include: { member: true, aircraft: true, instructor: true },
    orderBy: [{ startTime: "asc" }],
  });

  const BOM = "﻿";
  const HEADER =
    "Datum,Pilot,Pilotenfunktion,Flugzeug,Kennzeichen,Startart,Abflugort,Ankunftsort,Startzeit,Landezeit,Dauer,Lehrer/Schüler,Notizen";

  const rows = flights.map((f) => {
    const pilot = `${f.member.firstName} ${f.member.lastName}`;
    const instructor = f.instructor
      ? `${f.instructor.firstName} ${f.instructor.lastName}`
      : "";

    return [
      formatDate(f.startTime),
      esc(pilot),
      PILOT_FUNCTION_LABELS[f.pilotFunction ?? ""] ?? f.pilotFunction ?? "",
      esc(f.aircraft.model),
      f.aircraft.registration,
      f.launchType ?? "",
      f.departureLocation ?? "",
      f.arrivalLocation ?? "",
      formatTime(f.startTime),
      formatTime(f.endTime),
      formatDuration(f.startTime, f.endTime),
      esc(instructor),
      esc(f.notes),
    ].join(",");
  });

  const csv = BOM + [HEADER, ...rows].join("\r\n");
  const dateStr = new Date().toISOString().split("T")[0];

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="flugbuch-${dateStr}.csv"`,
    },
  });
}
