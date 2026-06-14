"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { changePassword } from "@/app/(app)/actions/account";
import { ICAO_STORAGE_KEY } from "@/lib/constants";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white shadow-sm p-6">
      <h2 className="mb-5 text-lg font-semibold text-slate-900">{title}</h2>
      {children}
    </div>
  );
}

export function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (next !== confirm) {
      setError("Die neuen Passwörter stimmen nicht überein.");
      return;
    }
    if (next.length < 8) {
      setError("Das neue Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }

    setLoading(true);
    try {
      await changePassword(current, next);
      setSuccess(true);
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Section title="Passwort ändern">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Aktuelles Passwort
          </label>
          <Input
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Neues Passwort
          </label>
          <Input
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            autoComplete="new-password"
            required
            minLength={8}
          />
          <p className="mt-1 text-xs text-muted-foreground">Mindestens 8 Zeichen</p>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Neues Passwort bestätigen
          </label>
          <Input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}
        {success && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 font-medium">
            Passwort erfolgreich geändert.
          </p>
        )}

        <Button type="submit" disabled={loading} className="w-fit">
          {loading ? "Speichere…" : "Passwort ändern"}
        </Button>
      </form>
    </Section>
  );
}

export function AirportForm() {
  const [icao, setIcao] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setIcao(localStorage.getItem(ICAO_STORAGE_KEY) ?? "");
  }, []);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const val = icao.trim().toUpperCase();
    if (!/^[A-Z]{4}$/.test(val)) return;
    localStorage.setItem(ICAO_STORAGE_KEY, val);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <Section title="Heimatflugplatz">
      <form onSubmit={handleSave} className="flex flex-col gap-4 max-w-sm">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            ICAO-Code
          </label>
          <Input
            placeholder="z. B. EDER"
            value={icao}
            onChange={(e) => { setIcao(e.target.value.toUpperCase()); setSaved(false); }}
            maxLength={4}
            className="font-mono tracking-widest uppercase"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Wird für Wetteranzeige und Sonnenuntergang verwendet.
          </p>
        </div>

        {saved && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 font-medium">
            Gespeichert.
          </p>
        )}

        <Button type="submit" disabled={!/^[A-Z]{4}$/.test(icao.trim())} className="w-fit">
          Speichern
        </Button>
      </form>
    </Section>
  );
}
