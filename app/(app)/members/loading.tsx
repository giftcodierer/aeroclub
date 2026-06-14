export default function Loading() {
  const colWidths = [112, 128, 80, 96, 96, 96, 0];

  return (
    <section className="py-6 md:py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="h-9 w-36 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-4 w-48 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="h-9 w-16 animate-pulse rounded-lg bg-slate-200" />
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse">
            <thead className="bg-slate-50">
              <tr>
                {colWidths.map((w, i) => (
                  <th key={i} className="px-5 py-3 text-left">
                    {w > 0 && <div style={{ width: w }} className="h-3 animate-pulse rounded bg-slate-200" />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 7 }).map((_, i) => (
                <tr key={i} className="border-t">
                  <td className="px-5 py-4">
                    <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-4 w-44 animate-pulse rounded bg-slate-100" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-6 w-14 animate-pulse rounded-full bg-slate-100" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-6 w-24 animate-pulse rounded-full bg-slate-100" />
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
