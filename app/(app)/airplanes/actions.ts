"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";

export async function createAirplane(form: {
  model: string;
  registration: string;
  yearBuilt: string;
  isTwoSeater: boolean;
  isMotorized: boolean;
}) {
  await requireAdmin();
  await prisma.aircraft.create({
    data: {
      model: form.model,
      registration: form.registration,
      yearBuilt: form.yearBuilt ? parseInt(form.yearBuilt) : null,
      isTwoSeater: form.isTwoSeater,
      isMotorized: form.isMotorized,
    },
  });

  revalidatePath("/airplanes");
}

export async function updateAirplane(
  id: number,
  form: {
    model: string;
    registration: string;
    yearBuilt: string;
    isTwoSeater: boolean;
    isMotorized: boolean;
  }
) {
  await requireAdmin();
  await prisma.aircraft.update({
    where: { id },
    data: {
      model: form.model,
      registration: form.registration,
      yearBuilt: form.yearBuilt ? parseInt(form.yearBuilt) : null,
      isTwoSeater: form.isTwoSeater,
      isMotorized: form.isMotorized,
    },
  });

  revalidatePath("/airplanes");
}

export async function deleteAirplane(id: number) {
  await requireAdmin();
  await prisma.aircraft.delete({ where: { id } });
  revalidatePath("/airplanes");
}
