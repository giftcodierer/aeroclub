"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

export async function createMember(form: {
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  hasLicense: boolean;
  status: "AKTIV" | "INAKTIV";
  createdAt: string;
}): Promise<{ tempPassword: string | null }> {
  await requireAdmin();

  let userId: number | null = null;
  let tempPassword: string | null = null;

  // Wenn E-Mail angegeben → automatisch User-Account erstellen
  if (form.email) {
    tempPassword = randomBytes(5).toString("hex"); // z.B. "a3f9c1b2e7"
    const hashed = await bcrypt.hash(tempPassword, 12);
    const user = await prisma.user.create({
      data: {
        email: form.email,
        name: `${form.firstName} ${form.lastName}`,
        password: hashed,
        role: "USER",
      },
    });
    userId = user.id;
  }

  await prisma.member.create({
    data: {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email || null,
      status: form.status,
      birthDate: new Date(form.birthDate),
      hasLicense: form.hasLicense,
      createdAt: form.createdAt ? new Date(form.createdAt) : new Date(),
      userId: userId ?? undefined,
    },
  });

  revalidatePath("/members");
  return { tempPassword };
}

export async function updateMember(
  id: number,
  form: {
    firstName: string;
    lastName: string;
    email: string;
    birthDate: string;
    hasLicense: boolean;
    status: "AKTIV" | "INAKTIV";
    createdAt: string;
  }
) {
  await requireAdmin();
  await prisma.member.update({
    where: { id },
    data: {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email || null,
      status: form.status,
      birthDate: new Date(form.birthDate),
      hasLicense: form.hasLicense,
      createdAt: form.createdAt ? new Date(form.createdAt) : undefined,
    },
  });

  revalidatePath("/members");
}

export async function resetMemberPassword(memberId: number): Promise<{ tempPassword: string }> {
  await requireAdmin();
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: { userId: true },
  });
  if (!member?.userId)
    throw new Error("Dieses Mitglied hat keinen Login-Account.");

  const tempPassword = randomBytes(5).toString("hex");
  const hashed = await bcrypt.hash(tempPassword, 12);
  await prisma.user.update({ where: { id: member.userId }, data: { password: hashed } });
  return { tempPassword };
}

export async function deleteMember(id: number) {
  await requireAdmin();
  const member = await prisma.member.findUnique({ where: { id }, select: { userId: true } });
  await prisma.member.delete({ where: { id } });
  if (member?.userId) {
    await prisma.user.delete({ where: { id: member.userId } });
  }
  revalidatePath("/members");
}
