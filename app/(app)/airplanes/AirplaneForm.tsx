"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/components/ConfirmProvider";
import { createAirplane, updateAirplane, deleteAirplane } from "./actions";

const defaultForm = {
  model: "",
  registration: "",
  yearBuilt: "",
  isTwoSeater: false,
  isMotorized: false,
  initialHours: "",
};

type AirplaneFormData = typeof defaultForm;
type AircraftWithId = AirplaneFormData & { id: number };

function AirplaneModal({
  title,
  form,
  setForm,
  onSubmit,
  onClose,
}: {
  title: string;
  form: AirplaneFormData;
  setForm: (fn: (p: AirplaneFormData) => AirplaneFormData) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[560px] rounded-lg border bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold">{title}</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            placeholder="Flugzeugtyp (z. B. ASK 21)"
            value={form.model}
            onChange={(e) => setForm((p) => ({ ...p, model: e.target.value }))}
            className="sm:col-span-2"
          />
          <Input
            placeholder="Kennzeichen (z. B. D-1234)"
            value={form.registration}
            onChange={(e) => setForm((p) => ({ ...p, registration: e.target.value }))}
          />
          <Input
            type="number"
            placeholder="Baujahr"
            value={form.yearBuilt}
            onChange={(e) => setForm((p) => ({ ...p, yearBuilt: e.target.value }))}
          />
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Betriebsstunden (aktuell)
            </label>
            <Input
              type="number"
              step="0.1"
              min="0"
              placeholder="z. B. 1250.5"
              value={form.initialHours}
              onChange={(e) => setForm((p) => ({ ...p, initialHours: e.target.value }))}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Stand vor der ersten Erfassung in diesem System
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-1">
            <div className="flex items-center gap-2">
              <input
                id="isTwoSeater"
                type="checkbox"
                checked={form.isTwoSeater}
                onChange={(e) => setForm((p) => ({ ...p, isTwoSeater: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300"
              />
              <label htmlFor="isTwoSeater" className="text-sm">Doppelsitzer</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="isMotorized"
                type="checkbox"
                checked={form.isMotorized}
                onChange={(e) => setForm((p) => ({ ...p, isMotorized: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300"
              />
              <label htmlFor="isMotorized" className="text-sm">Motorisiert</label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Abbrechen</Button>
          <Button onClick={onSubmit} disabled={!form.model || !form.registration}>
            Speichern
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AirplaneForm() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<AirplaneFormData>(defaultForm);

  async function handleSubmit() {
    await createAirplane(form);
    setOpen(false);
    setForm(defaultForm);
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>New</Button>
      {open && (
        <AirplaneModal
          title="Neues Flugzeug"
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

export function EditAirplaneButton({ aircraft }: { aircraft: AircraftWithId }) {
  const confirm = useConfirm();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<AirplaneFormData>({
    model: aircraft.model,
    registration: aircraft.registration,
    yearBuilt: aircraft.yearBuilt,
    isTwoSeater: aircraft.isTwoSeater,
    isMotorized: aircraft.isMotorized,
    initialHours: aircraft.initialHours,
  });

  async function handleSubmit() {
    await updateAirplane(aircraft.id, form);
    setOpen(false);
  }

  async function handleDelete() {
    const ok = await confirm({
      title: "Flugzeug löschen?",
      message: `${aircraft.registration} (${aircraft.model}) wird dauerhaft entfernt. Alle zugehörigen Flugeinträge bleiben erhalten.`,
      confirmLabel: "Löschen",
      danger: true,
    });
    if (ok) await deleteAirplane(aircraft.id);
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          className="text-red-500 hover:bg-red-50 hover:text-red-600 border-red-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        </Button>
      </div>

      {open && (
        <AirplaneModal
          title="Flugzeug bearbeiten"
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
