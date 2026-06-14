"use server";

import { prisma } from "@/lib/prisma";
import { requireDispatcherOrAdmin, requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";

const allowsUnlicensed = (pf: string) => pf === "DUAL_STUDENT" || pf === "SOLO_STUDENT";
const requiresInstructor = (pf: string) => pf === "DUAL_STUDENT" || pf === "DUAL_INSTRUCTOR";

async function checkLicense(pilotFunction: string, memberId: number) {
  if (!allowsUnlicensed(pilotFunction)) {
    const member = await prisma.member.findUnique({ where: { id: memberId } });
    if (!member?.hasLicense)
      throw new Error("Dieser Pilot hat keine gültige Lizenz für diese Pilotenfunktion.");
  }
}

function checkInstructor(pilotFunction: string, instructorId?: number | null) {
  if (requiresInstructor(pilotFunction) && !instructorId)
    throw new Error("Bei einem Doppelsitzerflug muss ein Fluglehrer/Schüler angegeben werden.");
}

// Flug in Warteschlange stellen (QUEUED)
export async function queueFlight(data: {
  memberId: number;
  aircraftId: number;
  launchType: string;
  pilotFunction: string;
  departureLocation: string;
  arrivalLocation?: string;
  instructorId?: number | null;
  notes?: string;
}) {
  const session = await requireDispatcherOrAdmin();
  const userId = parseInt((session.user as { id?: string })?.id ?? "0");
  await checkLicense(data.pilotFunction, data.memberId);
  checkInstructor(data.pilotFunction, data.instructorId);

  await prisma.flight.create({
    data: {
      status: "QUEUED",
      memberId: data.memberId,
      aircraftId: data.aircraftId,
      launchType: data.launchType,
      pilotFunction: data.pilotFunction,
      departureLocation: data.departureLocation || null,
      arrivalLocation: data.arrivalLocation || null,
      instructorId: data.instructorId ?? null,
      notes: data.notes ?? null,
      createdById: userId || null,
    },
  });
  revalidatePath("/", "layout");
}

// Flug starten (QUEUED → ACTIVE)
export async function activateFlight(id: number) {
  await requireDispatcherOrAdmin();
  await prisma.flight.update({
    where: { id },
    data: { status: "ACTIVE", startTime: new Date() },
  });
  revalidatePath("/", "layout");
}

// Start rückgängig machen (ACTIVE → QUEUED)
export async function revertFlight(id: number) {
  await requireDispatcherOrAdmin();
  await prisma.flight.update({
    where: { id },
    data: { status: "QUEUED", startTime: null },
  });
  revalidatePath("/", "layout");
}

// Flug landen (ACTIVE → COMPLETED)
export async function endFlight(id: number) {
  await requireDispatcherOrAdmin();
  await prisma.flight.update({
    where: { id },
    data: { status: "COMPLETED", endTime: new Date() },
  });
  revalidatePath("/", "layout");
}

export async function updateFlight(
  id: number,
  data: {
    memberId: number;
    aircraftId: number;
    launchType: string;
    pilotFunction: string;
    departureLocation: string;
    arrivalLocation?: string;
    instructorId?: number | null;
    notes?: string;
    startTime?: string | null;
    endTime?: string | null;
  },
  isCompleted: boolean,
) {
  if (isCompleted) {
    await requireAdmin();
  } else {
    await requireDispatcherOrAdmin();
  }
  await checkLicense(data.pilotFunction, data.memberId);
  checkInstructor(data.pilotFunction, data.instructorId);

  await prisma.flight.update({
    where: { id },
    data: {
      memberId: data.memberId,
      aircraftId: data.aircraftId,
      launchType: data.launchType,
      pilotFunction: data.pilotFunction,
      departureLocation: data.departureLocation || null,
      arrivalLocation: data.arrivalLocation || null,
      instructorId: data.instructorId ?? null,
      notes: data.notes ?? null,
      startTime: data.startTime ? new Date(data.startTime) : null,
      endTime: data.endTime ? new Date(data.endTime) : null,
    },
  });
  revalidatePath("/", "layout");
}

export async function deleteFlight(id: number) {
  await requireAdmin();
  await prisma.flight.delete({ where: { id } });
  revalidatePath("/", "layout");
}
