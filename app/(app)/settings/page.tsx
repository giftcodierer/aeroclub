import { fullAuth } from "@/auth";
import { redirect } from "next/navigation";
import { PasswordForm, AirportForm } from "./SettingsClient";

export default async function SettingsPage() {
  const session = await fullAuth();
  if (!session) redirect("/login");

  return (
    <section className="py-6 md:py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Einstellungen</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Eingeloggt als <span className="font-medium text-slate-700">{session.user?.email}</span>
        </p>
      </div>

      <div className="flex flex-col gap-6 max-w-xl">
        <PasswordForm />
        <AirportForm />
      </div>
    </section>
  );
}
