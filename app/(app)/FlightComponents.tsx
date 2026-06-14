"use client";

import { useState, useEffect } from "react";
import { useConfirm } from "@/components/ConfirmProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { queueFlight, activateFlight, revertFlight, endFlight, updateFlight, deleteFlight } from "@/app/(app)/actions/flights";

type Member = { id: number; firstName: string; lastName: string; hasLicense: boolean };
type Aircraft = { id: number; model: string; registration: string };

const PILOT_FUNCTIONS = [
  { value: "PIC_SOLO", label: "PIC – Alleinflug" },
  { value: "PIC_WITH_COPILOT", label: "PIC – mit Begleitung" },
  { value: "DUAL_STUDENT", label: "Doppelsitzer – Schüler" },
  { value: "DUAL_INSTRUCTOR", label: "Doppelsitzer – Fluglehrer" },
  { value: "SOLO_STUDENT", label: "Alleinflug – Schüler (Solo)" },
];

const allowsUnlicensed = (pf: string) => pf === "DUAL_STUDENT" || pf === "SOLO_STUDENT";
const requiresInstructor = (pf: string) => pf === "DUAL_STUDENT" || pf === "DUAL_INSTRUCTOR";

// ── Neuer Flug Dialog (→ QUEUED) ───────────────────────────────────────────────

export function NewFlightButton({ members, aircrafts }: { members: Member[]; aircrafts: Aircraft[] }) {
  const [open, setOpen] = useState(false);
  const [memberId, setMemberId] = useState("");
  const [aircraftId, setAircraftId] = useState("");
  const [launchType, setLaunchType] = useState("Winde");
  const [pilotFunction, setPilotFunction] = useState("PIC_SOLO");
  const [departureLocation, setDepartureLocation] = useState("");
  const [arrivalLocation, setArrivalLocation] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const unlicensed = allowsUnlicensed(pilotFunction);
  const availableMembers = unlicensed ? members : members.filter((m) => m.hasLicense);
  const isDual = requiresInstructor(pilotFunction);

  function handlePilotFunctionChange(val: string) {
    setPilotFunction(val);
    if (!allowsUnlicensed(val) && memberId) {
      const pilot = members.find((m) => m.id === parseInt(memberId));
      if (pilot && !pilot.hasLicense) setMemberId("");
    }
  }

  async function handleQueue() {
    if (!memberId || !aircraftId) return;
    setLoading(true);
    setError("");
    try {
      await queueFlight({
        memberId: parseInt(memberId),
        aircraftId: parseInt(aircraftId),
        launchType,
        pilotFunction,
        departureLocation,
        arrivalLocation,
        instructorId: isDual && instructorId ? parseInt(instructorId) : null,
        notes,
      });
      setOpen(false);
      setMemberId(""); setAircraftId(""); setLaunchType("Winde");
      setPilotFunction("PIC_SOLO"); setDepartureLocation(""); setArrivalLocation(""); setInstructorId(""); setNotes("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
    }
    setLoading(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 rounded-2xl bg-sky-600 px-10 py-5 text-xl font-bold text-white shadow-lg transition hover:bg-sky-700 active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Flug vorbereiten
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
          <div className="w-full max-w-[520px] rounded-2xl border bg-white p-6 shadow-2xl my-4">
            <h2 className="mb-5 text-xl font-bold">Flug vorbereiten</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Pilotenfunktion</label>
                <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={pilotFunction} onChange={(e) => handlePilotFunctionChange(e.target.value)}>
                  {PILOT_FUNCTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
                {unlicensed && <p className="mt-1 text-xs text-amber-600">🎓 Schüler – auch Piloten ohne Lizenz wählbar</p>}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Pilot {!unlicensed && <span className="text-slate-400">(nur lizenzierte)</span>}
                </label>
                <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={memberId} onChange={(e) => setMemberId(e.target.value)}>
                  <option value="">Mitglied auswählen…</option>
                  {availableMembers.map((m) => (
                    <option key={m.id} value={m.id}>{m.firstName} {m.lastName}{m.hasLicense ? " ✓" : ""}</option>
                  ))}
                </select>
                {!unlicensed && members.length !== availableMembers.length && (
                  <p className="mt-1 text-xs text-slate-400">{members.length - availableMembers.length} Pilot(en) ohne Lizenz ausgeblendet</p>
                )}
              </div>
              {isDual && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    {pilotFunction === "DUAL_INSTRUCTOR" ? "Schüler" : "Fluglehrer"}
                  </label>
                  <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={instructorId} onChange={(e) => setInstructorId(e.target.value)}>
                    <option value="">{pilotFunction === "DUAL_INSTRUCTOR" ? "Schüler auswählen…" : "Fluglehrer auswählen…"}</option>
                    {(pilotFunction === "DUAL_INSTRUCTOR" ? members : members.filter((m) => m.hasLicense)).map((m) => (
                      <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Flugzeug</label>
                <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={aircraftId} onChange={(e) => setAircraftId(e.target.value)}>
                  <option value="">Flugzeug auswählen…</option>
                  {aircrafts.map((a) => <option key={a.id} value={a.id}>{a.model} – {a.registration}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Startart</label>
                <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={launchType} onChange={(e) => setLaunchType(e.target.value)}>
                  <option value="Winde">🪁 Winde</option>
                  <option value="Schlepper">🛩️ Schlepper</option>
                  <option value="Eigenstart">🔋 Eigenstart</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Abflugort</label>
                  <Input
                    placeholder="z. B. EDKA"
                    value={departureLocation}
                    onChange={(e) => {
                      setDepartureLocation(e.target.value);
                      // Ankunftsort automatisch mitfüllen wenn noch leer oder gleich
                      if (!arrivalLocation || arrivalLocation === departureLocation)
                        setArrivalLocation(e.target.value);
                    }}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Ankunftsort</label>
                  <Input placeholder="z. B. EDKA" value={arrivalLocation} onChange={(e) => setArrivalLocation(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Notizen (optional)</label>
                <Input placeholder="z. B. Übungsflug Thermiksektor" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Abbrechen</Button>
              <Button onClick={handleQueue} disabled={loading || !memberId || !aircraftId || (isDual && !instructorId)} className="bg-sky-600 hover:bg-sky-700 text-white">
                {loading ? "Speichere…" : "📋 Bereit stellen"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Start Button (QUEUED → ACTIVE) ─────────────────────────────────────────────

export function StartFlightButton({ id }: { id: number }) {
  const [loading, setLoading] = useState(false);
  async function handle() {
    setLoading(true);
    await activateFlight(id);
  }
  return (
    <Button size="sm" onClick={handle} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white border-0">
      {loading ? "…" : "✈ Start"}
    </Button>
  );
}

// ── Rückgängig Button (ACTIVE → QUEUED) ───────────────────────────────────────

export function RevertFlightButton({ id }: { id: number }) {
  const confirm = useConfirm();
  const [loading, setLoading] = useState(false);
  async function handle() {
    const ok = await confirm({
      title: "Start rückgängig machen?",
      message: "Der Flug kommt zurück in die Warteschlange.",
      confirmLabel: "Rückgängig",
    });
    if (!ok) return;
    setLoading(true);
    await revertFlight(id);
  }
  return (
    <Button size="sm" variant="outline" onClick={handle} disabled={loading} className="border-amber-300 text-amber-700 hover:bg-amber-50">
      {loading ? "…" : "↩ Rückgängig"}
    </Button>
  );
}

// ── Aktiver Timer ──────────────────────────────────────────────────────────────

export function LiveTimer({ startTime }: { startTime: string }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const start = new Date(startTime).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startTime]);
  const h = Math.floor(elapsed / 3600).toString().padStart(2, "0");
  const m = Math.floor((elapsed % 3600) / 60).toString().padStart(2, "0");
  const s = (elapsed % 60).toString().padStart(2, "0");
  return <span className="font-mono text-sm font-semibold text-sky-600">{h}:{m}:{s}</span>;
}

// ── Landen Button ──────────────────────────────────────────────────────────────

export function EndFlightButton({ id }: { id: number }) {
  const confirm = useConfirm();
  const [loading, setLoading] = useState(false);
  async function handle() {
    const ok = await confirm({
      title: "Flug landen?",
      message: "Der Flug wird jetzt als gelandet markiert. Die aktuelle Uhrzeit wird als Landezeit gespeichert.",
      confirmLabel: "Landen",
    });
    if (!ok) return;
    setLoading(true);
    await endFlight(id);
  }
  return (
    <Button size="sm" onClick={handle} disabled={loading} className="bg-red-500 hover:bg-red-600 text-white border-0">
      {loading ? "…" : "Landen"}
    </Button>
  );
}

// ── Flug bearbeiten Dialog ─────────────────────────────────────────────────────

function toLocalDateTimeString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

type FlightData = {
  id: number;
  memberId: number;
  aircraftId: number;
  launchType: string | null;
  pilotFunction: string | null;
  departureLocation: string | null;
  arrivalLocation: string | null;
  instructorId: number | null;
  notes: string | null;
  startTime: string | null;
  endTime: string | null;
  isCompleted: boolean;
};

export function EditFlightButton({ flight, members, aircrafts }: { flight: FlightData; members: Member[]; aircrafts: Aircraft[] }) {
  const [open, setOpen] = useState(false);
  const [memberId, setMemberId] = useState(String(flight.memberId));
  const [aircraftId, setAircraftId] = useState(String(flight.aircraftId));
  const [launchType, setLaunchType] = useState(flight.launchType ?? "Winde");
  const [pilotFunction, setPilotFunction] = useState(flight.pilotFunction ?? "PIC_SOLO");
  const [departureLocation, setDepartureLocation] = useState(flight.departureLocation ?? "");
  const [arrivalLocation, setArrivalLocation] = useState(flight.arrivalLocation ?? "");
  const [instructorId, setInstructorId] = useState(flight.instructorId ? String(flight.instructorId) : "");
  const [notes, setNotes] = useState(flight.notes ?? "");
  const [startTime, setStartTime] = useState(flight.startTime ? toLocalDateTimeString(new Date(flight.startTime)) : "");
  const [endTime, setEndTime] = useState(flight.endTime ? toLocalDateTimeString(new Date(flight.endTime)) : "");
  const initialStartTime = flight.startTime ? toLocalDateTimeString(new Date(flight.startTime)) : "";
  const initialEndTime = flight.endTime ? toLocalDateTimeString(new Date(flight.endTime)) : "";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const unlicensed = allowsUnlicensed(pilotFunction);
  const availableMembers = unlicensed ? members : members.filter((m) => m.hasLicense);
  const isDual = requiresInstructor(pilotFunction);

  function handlePilotFunctionChange(val: string) {
    setPilotFunction(val);
    if (!allowsUnlicensed(val) && memberId) {
      const pilot = members.find((m) => m.id === parseInt(memberId));
      if (pilot && !pilot.hasLicense) setMemberId("");
    }
  }

  async function handleSave() {
    setLoading(true);
    setError("");
    try {
      await updateFlight(
        flight.id,
        {
          memberId: parseInt(memberId),
          aircraftId: parseInt(aircraftId),
          launchType,
          pilotFunction,
          departureLocation,
          arrivalLocation,
          instructorId: isDual && instructorId ? parseInt(instructorId) : null,
          notes,
          startTime: startTime ? (startTime === initialStartTime && flight.startTime ? flight.startTime : new Date(startTime).toISOString()) : null,
          endTime: endTime ? (endTime === initialEndTime && flight.endTime ? flight.endTime : new Date(endTime).toISOString()) : null,
        },
        flight.isCompleted,
      );
      setOpen(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
    }
    setLoading(false);
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 17L17 7M17 7H7M17 7v10" />
        </svg>
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
          <div className="w-full max-w-[520px] rounded-2xl border bg-white p-6 shadow-2xl my-4">
            <h2 className="mb-5 text-xl font-bold">Flug bearbeiten</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Pilotenfunktion</label>
                <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={pilotFunction} onChange={(e) => handlePilotFunctionChange(e.target.value)}>
                  {PILOT_FUNCTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Pilot {!unlicensed && <span className="text-slate-400">(nur lizenzierte)</span>}
                </label>
                <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={memberId} onChange={(e) => setMemberId(e.target.value)}>
                  <option value="">Mitglied auswählen…</option>
                  {availableMembers.map((m) => (
                    <option key={m.id} value={m.id}>{m.firstName} {m.lastName}{m.hasLicense ? " ✓" : ""}</option>
                  ))}
                </select>
              </div>
              {isDual && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    {pilotFunction === "DUAL_INSTRUCTOR" ? "Schüler" : "Fluglehrer"}
                  </label>
                  <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={instructorId} onChange={(e) => setInstructorId(e.target.value)}>
                    <option value="">{pilotFunction === "DUAL_INSTRUCTOR" ? "Schüler auswählen…" : "Fluglehrer auswählen…"}</option>
                    {(pilotFunction === "DUAL_INSTRUCTOR" ? members : members.filter((m) => m.hasLicense)).map((m) => (
                      <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Flugzeug</label>
                <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={aircraftId} onChange={(e) => setAircraftId(e.target.value)}>
                  {aircrafts.map((a) => <option key={a.id} value={a.id}>{a.model} – {a.registration}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Startart</label>
                <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={launchType} onChange={(e) => setLaunchType(e.target.value)}>
                  <option value="Winde">🪁 Winde</option>
                  <option value="Schlepper">🛩️ Schlepper</option>
                  <option value="Eigenstart">🔋 Eigenstart</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Abflugort</label>
                  <Input placeholder="z. B. EDKA" value={departureLocation} onChange={(e) => setDepartureLocation(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Ankunftsort</label>
                  <Input placeholder="z. B. EDKA" value={arrivalLocation} onChange={(e) => setArrivalLocation(e.target.value)} />
                </div>
              </div>
              {flight.isCompleted && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Startzeit</label>
                    <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Landezeit</label>
                    <Input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                  </div>
                </div>
              )}
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Notizen (optional)</label>
                <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Abbrechen</Button>
              <Button onClick={handleSave} disabled={loading || !memberId || !aircraftId || (isDual && !instructorId)} className="bg-sky-600 hover:bg-sky-700 text-white">
                {loading ? "Speichern…" : "💾 Speichern"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Löschen Button ─────────────────────────────────────────────────────────────

export function DeleteFlightButton({ id }: { id: number }) {
  const confirm = useConfirm();
  const [loading, setLoading] = useState(false);
  async function handle() {
    const ok = await confirm({
      title: "Flug löschen?",
      message: "Dieser Eintrag wird dauerhaft aus dem Flugbuch entfernt.",
      confirmLabel: "Löschen",
      danger: true,
    });
    if (!ok) return;
    setLoading(true);
    await deleteFlight(id);
  }
  return (
    <Button variant="outline" size="sm" onClick={handle} disabled={loading} className="text-red-500 hover:bg-red-50 hover:text-red-600 border-red-200">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4h6v2" />
      </svg>
    </Button>
  );
}
