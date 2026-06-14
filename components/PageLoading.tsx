export default function PageLoading() {
  return (
    <div className="py-6 md:py-8 space-y-6">
      <div className="h-8 w-52 animate-pulse rounded-lg bg-slate-200" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    </div>
  );
}
