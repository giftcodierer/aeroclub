"use client";

export default function PageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 py-12">
      <div className="rounded-2xl border border-red-200 bg-red-50 px-8 py-6 text-center max-w-md">
        <p className="mb-1 text-base font-semibold text-red-700">Etwas ist schiefgelaufen</p>
        <p className="mb-4 text-sm text-red-600">{error.message}</p>
        <button
          onClick={reset}
          className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
        >
          Erneut versuchen
        </button>
      </div>
    </div>
  );
}
