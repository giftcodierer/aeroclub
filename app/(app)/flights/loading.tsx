export default function Loading() {
  const cols = [72, 120, 90, 110, 80, 90, 64, 80];

  return (
    <section className="py-6 md:py-8">
      <div className="mb-10 flex justify-center">
        <div className="h-10 w-44 animate-pulse rounded-xl bg-slate-200" />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-4">
          <div className="h-5 w-52 animate-pulse rounded bg-slate-200" />
          <div className="h-8 w-40 animate-pulse rounded-lg bg-slate-200" />
        </div>
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {cols.map((w, i) => (
                    <th key={i} className="px-3 py-2">
                      {w > 0 && <div style={{ width: w }} className="h-3 animate-pulse rounded bg-slate-200" />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-t">
                    {cols.map((w, j) => (
                      <td key={j} className="px-3 py-3">
                        {w > 0 && <div style={{ width: w }} className="h-3 animate-pulse rounded bg-slate-100" />}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 w-8 animate-pulse rounded-lg bg-slate-200" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
