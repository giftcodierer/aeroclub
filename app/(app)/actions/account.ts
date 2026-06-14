"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import bcrypt from "bcryptjs";

export async function changePassword(currentPassword: string, newPassword: string) {
  const session = await requireAuth();
  const email = session.user?.email;
  if (!email) throw new Error("Kein gültiger Benutzer.");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Benutzer nicht gefunden.");

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) throw new Error("Das aktuelle Passwort ist falsch.");

  if (newPassword.length < 8)
    throw new Error("Das neue Passwort muss mindestens 8 Zeichen lang sein.");

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
}
