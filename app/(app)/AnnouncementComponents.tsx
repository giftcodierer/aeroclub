"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createAnnouncement, deleteAnnouncement } from "@/app/(app)/actions/announcements";

type Announcement = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
};

export function AnnouncementList({
  announcements,
  isAdmin,
}: {
  announcements: Announcement[];
  isAdmin: boolean;
}) {
  return (
    <div className="rounded-2xl border bg-white shadow-sm p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Ankündigungen</h2>
        {isAdmin && <NewAnnouncementButton />}
      </div>

      {announcements.length === 0 ? (
        <p className="text-sm text-muted-foreground">Keine Ankündigungen vorhanden.</p>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <AnnouncementItem key={a.id} announcement={a} isAdmin={isAdmin} />
          ))}
        </div>
      )}
    </div>
  );
}

function AnnouncementItem({
  announcement,
  isAdmin,
}: {
  announcement: Announcement;
  isAdmin: boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Ankündigung löschen?")) return;
    setLoading(true);
    await deleteAnnouncement(announcement.id);
  }

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">{announcement.title}</p>
          <p className="mt-0.5 text-sm text-slate-600 whitespace-pre-wrap">{announcement.content}</p>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {new Date(announcement.createdAt).toLocaleDateString("de-DE", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        {isAdmin && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={loading}
            className="shrink-0 text-red-500 hover:bg-red-50 hover:text-red-600 border-red-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          </Button>
        )}
      </div>
    </div>
  );
}

function NewAnnouncementButton() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    await createAnnouncement({ title: title.trim(), content: content.trim() });
    setTitle("");
    setContent("");
    setOpen(false);
    setLoading(false);
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        + Neu
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-[460px] rounded-2xl border bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-base font-semibold">Neue Ankündigung</h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Titel</label>
                <Input
                  placeholder="Titel der Ankündigung"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Inhalt</label>
                <textarea
                  className="min-h-[100px] w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Text der Ankündigung…"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Abbrechen
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || !title.trim() || !content.trim()}
              >
                {loading ? "Speichern…" : "Veröffentlichen"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
