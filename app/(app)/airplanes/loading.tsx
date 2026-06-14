export default function Loading() {
  return (
    <section className="py-6 md:py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="h-9 w-32 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-4 w-44 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="h-9 w-16 animate-pulse rounded-lg bg-slate-200" />
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse">
            <thead className="bg-slate-50">
              <tr>
                {[120, 100, 72, 96, 140, 96, 0].map((w, i) => (
                  <th key={i} className="px-5 py-3 text-left">
                    {w > 0 && <div style={{ width: w }} className="h-3 animate-pulse rounded bg-slate-200" />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t">
                  <td className="px-5 py-4">
                    <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-4 w-20 animate-pulse rounded bg-slate-200 font-mono" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-4 w-12 animate-pulse rounded bg-slate-100" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-6 w-24 animate-pulse rounded-full bg-slate-100" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
                      <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <div className="h-8 w-8 animate-pulse rounded-md bg-slate-100" />
                      <div className="h-8 w-8 animate-pulse rounded-md bg-slate-100" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
