import { fullAuth } from "@/auth";

export async function requireAdmin() {
  const session = await fullAuth();
  if (!session) throw new Error("Nicht eingeloggt.");
  if (session.user?.role !== "ADMIN") throw new Error("Keine Berechtigung. Nur Admins dürfen das.");
}

export async function requireDispatcherOrAdmin() {
  const session = await fullAuth();
  if (!session) throw new Error("Nicht eingeloggt.");
  const role = session.user?.role;
  if (role !== "ADMIN" && role !== "DISPATCHER")
    throw new Error("Keine Berechtigung.");
  return session;
}

export async function requireAuth() {
  const session = await fullAuth();
  if (!session) throw new Error("Nicht eingeloggt.");
  return session;
}
