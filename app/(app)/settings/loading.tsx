export default function Loading() {
  return (
    <section className="py-6 md:py-8">
      <div className="mb-6 space-y-2">
        <div className="h-9 w-44 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-4 w-64 animate-pulse rounded bg-slate-100" />
      </div>

      <div className="flex flex-col gap-6 max-w-xl">
        {/* Passwort ändern */}
        <div className="rounded-2xl border bg-white shadow-sm p-6">
          <div className="mb-5 h-6 w-40 animate-pulse rounded bg-slate-200" />
          <div className="flex flex-col gap-4 max-w-sm">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-3 w-36 animate-pulse rounded bg-slate-100" />
                <div className="h-10 w-full animate-pulse rounded-md bg-slate-100" />
              </div>
            ))}
            <div className="h-10 w-36 animate-pulse rounded-md bg-slate-200" />
          </div>
        </div>

        {/* Heimatflugplatz */}
        <div className="rounded-2xl border bg-white shadow-sm p-6">
          <div className="mb-5 h-6 w-36 animate-pulse rounded bg-slate-200" />
          <div className="flex flex-col gap-4 max-w-sm">
            <div className="space-y-1.5">
              <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
              <div className="h-10 w-full animate-pulse rounded-md bg-slate-100" />
              <div className="h-3 w-56 animate-pulse rounded bg-slate-100" />
            </div>
            <div className="h-10 w-28 animate-pulse rounded-md bg-slate-200" />
          </div>
        </div>
      </div>
    </section>
  );
}
