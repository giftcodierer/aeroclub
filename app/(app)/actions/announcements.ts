"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";

export async function createAnnouncement(data: { title: string; content: string }) {
  await requireAdmin();
  await prisma.announcement.create({ data });
  revalidatePath("/", "layout");
}

export async function deleteAnnouncement(id: number) {
  await requireAdmin();
  await prisma.announcement.delete({ where: { id } });
  revalidatePath("/", "layout");
}
