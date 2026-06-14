export default function Loading() {
  return (
    <section className="py-6 md:py-8 space-y-6">
      <div className="h-9 w-36 animate-pulse rounded-lg bg-slate-200" />

      {/* Stat cards: 2-col mobile, 5-col sm */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-2xl border bg-white shadow-sm px-5 py-4 flex flex-col gap-2">
            <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
            <div className="h-8 w-14 animate-pulse rounded bg-slate-200" />
          </div>
        ))}
      </div>

      {/* Active flights panel */}
      <div className="rounded-2xl border bg-white shadow-sm p-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-slate-300" />
          <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
        </div>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl border bg-slate-50 px-4 py-3">
            <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-20 animate-pulse rounded bg-slate-100 ml-auto" />
          </div>
        ))}
      </div>

      {/* Bottom 2-col: weather + announcements */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr]">
        {/* Weather */}
        <div className="rounded-2xl border bg-white shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-5 w-28 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-16 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border bg-slate-50 p-3 space-y-2">
                <div className="h-3 w-16 animate-pulse rounded bg-slate-200" />
                <div className="h-7 w-12 animate-pulse rounded bg-slate-300" />
                <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
              </div>
            ))}
          </div>
          <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
        </div>

        {/* Announcements */}
        <div className="rounded-2xl border bg-white shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-5 w-36 animate-pulse rounded bg-slate-200" />
            <div className="h-8 w-20 animate-pulse rounded-lg bg-slate-100" />
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-slate-50 p-4 space-y-2">
              <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
              <div className="h-3 w-3/4 animate-pulse rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
