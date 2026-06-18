"use client";

import { useState, type ReactNode } from "react";
import { useConfirm } from "@/components/ConfirmProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createMember, updateMember, deleteMember, resetMemberPassword } from "./actions";

const defaultForm = {
  firstName: "",
  lastName: "",
  email: "",
  birthDate: "",
  hasLicense: false,
  licenseExpiry: "",
  status: "AKTIV" as "AKTIV" | "INAKTIV",
  createdAt: "",
};

type MemberFormData = typeof defaultForm;
type MemberWithId = MemberFormData & { id: number };

function MemberModal({
  title,
  form,
  setForm,
  onSubmit,
  onClose,
  footerExtra,
}: {
  title: string;
  form: MemberFormData;
  setForm: (fn: (p: MemberFormData) => MemberFormData) => void;
  onSubmit: () => void;
  onClose: () => void;
  footerExtra?: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[620px] rounded-lg border bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold">{title}</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input placeholder="Vorname" value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} />
          <Input placeholder="Nachname" value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} />
          <Input type="email" placeholder="E-Mail" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="sm:col-span-2" />
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Geburtsdatum</label>
            <Input type="date" value={form.birthDate} onChange={(e) => setForm((p) => ({ ...p, birthDate: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Mitglied seit</label>
            <Input type="date" value={form.createdAt} onChange={(e) => setForm((p) => ({ ...p, createdAt: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Status</label>
            <select
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as "AKTIV" | "INAKTIV" }))}
            >
              <option value="AKTIV">Aktiv</option>
              <option value="INAKTIV">Inaktiv</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <input
                id="hasLicense"
                type="checkbox"
                checked={form.hasLicense}
                onChange={(e) => setForm((p) => ({ ...p, hasLicense: e.target.checked, licenseExpiry: e.target.checked ? p.licenseExpiry : "" }))}
                className="h-4 w-4 rounded border-slate-300"
              />
              <label htmlFor="hasLicense" className="text-sm">Lizenz vorhanden</label>
            </div>
            {form.hasLicense && (
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Lizenz gültig bis</label>
                <Input
                  type="date"
                  value={form.licenseExpiry}
                  onChange={(e) => setForm((p) => ({ ...p, licenseExpiry: e.target.value }))}
                />
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-2">
          <div>{footerExtra}</div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Abbrechen</Button>
            <Button onClick={onSubmit}>Speichern</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MemberForm() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<MemberFormData>(defaultForm);
  const [createdInfo, setCreatedInfo] = useState<{ name: string; email: string; password: string } | null>(null);

  async function handleSubmit() {
    const result = await createMember(form);
    setOpen(false);
    if (result.tempPassword && form.email) {
      setCreatedInfo({
        name: `${form.firstName} ${form.lastName}`,
        email: form.email,
        password: result.tempPassword,
      });
    }
    setForm(defaultForm);
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>New</Button>

      {open && (
        <MemberModal
          title="Neues Mitglied"
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          onClose={() => setOpen(false)}
        />
      )}

      {/* Temporäres Passwort anzeigen */}
      {createdInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-xl">✅</span>
              <div>
                <h2 className="font-bold text-slate-900">Mitglied erstellt</h2>
                <p className="text-sm text-muted-foreground">Login-Daten bitte notieren!</p>
              </div>
            </div>

            <div className="rounded-xl border bg-slate-50 p-4 font-mono text-sm space-y-2">
              <div><span className="text-muted-foreground">Name:</span> {createdInfo.name}</div>
              <div><span className="text-muted-foreground">E-Mail:</span> {createdInfo.email}</div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Passwort:</span>
                <span className="font-bold text-sky-700 tracking-widest">{createdInfo.password}</span>
              </div>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              ⚠️ Dieses Passwort wird nur einmal angezeigt. Das Mitglied sollte es nach dem ersten Login ändern.
            </p>

            <Button className="mt-4 w-full" onClick={() => setCreatedInfo(null)}>
              Verstanden
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export function EditMemberButton({ member }: { member: MemberWithId }) {
  const confirm = useConfirm();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<MemberFormData>({
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email,
    birthDate: member.birthDate,
    hasLicense: member.hasLicense,
    licenseExpiry: member.licenseExpiry,
    status: member.status,
    createdAt: member.createdAt,
  });
  const [resetInfo, setResetInfo] = useState<{ name: string; email: string; password: string } | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

  async function handleSubmit() {
    await updateMember(member.id, form);
    setOpen(false);
  }

  async function handleDelete() {
    const ok = await confirm({
      title: "Mitglied löschen?",
      message: `${member.firstName} ${member.lastName} wird dauerhaft entfernt. Der zugehörige Login-Account wird ebenfalls gelöscht.`,
      confirmLabel: "Löschen",
      danger: true,
    });
    if (ok) await deleteMember(member.id);
  }

  async function handleResetPassword() {
    const ok = await confirm({
      title: "Passwort zurücksetzen?",
      message: `Das Passwort von ${member.firstName} ${member.lastName} wird durch ein neues temporäres Passwort ersetzt.`,
      confirmLabel: "Zurücksetzen",
    });
    if (!ok) return;
    setResetLoading(true);
    try {
      const { tempPassword } = await resetMemberPassword(member.id);
      setResetInfo({
        name: `${member.firstName} ${member.lastName}`,
        email: member.email,
        password: tempPassword,
      });
      setOpen(false);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Fehler beim Zurücksetzen");
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17L17 7M17 7H7M17 7v10" />
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
        <MemberModal
          title="Mitglied bearbeiten"
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          onClose={() => setOpen(false)}
          footerExtra={
            member.email ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetPassword}
                disabled={resetLoading}
                className="text-amber-700 border-amber-300 hover:bg-amber-50"
              >
                {resetLoading ? "Zurücksetzen…" : "Passwort zurücksetzen"}
              </Button>
            ) : undefined
          }
        />
      )}

      {resetInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-xl">🔑</span>
              <div>
                <h2 className="font-bold text-slate-900">Passwort zurückgesetzt</h2>
                <p className="text-sm text-muted-foreground">Login-Daten bitte notieren!</p>
              </div>
            </div>
            <div className="rounded-xl border bg-slate-50 p-4 font-mono text-sm space-y-2">
              <div><span className="text-muted-foreground">Name:</span> {resetInfo.name}</div>
              <div><span className="text-muted-foreground">E-Mail:</span> {resetInfo.email}</div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Passwort:</span>
                <span className="font-bold text-sky-700 tracking-widest">{resetInfo.password}</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              ⚠️ Dieses Passwort wird nur einmal angezeigt.
            </p>
            <Button className="mt-4 w-full" onClick={() => setResetInfo(null)}>
              Verstanden
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
