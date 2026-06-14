"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type ConfirmOptions = {
  message: string;
  title?: string;
  confirmLabel?: string;
  danger?: boolean;
};

type ConfirmFn = (options: ConfirmOptions | string) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    options: ConfirmOptions;
    resolve: (v: boolean) => void;
  } | null>(null);

  const confirm = useCallback((options: ConfirmOptions | string): Promise<boolean> => {
    const opts = typeof options === "string" ? { message: options } : options;
    return new Promise((resolve) => setState({ options: opts, resolve }));
  }, []);

  function handle(result: boolean) {
    state?.resolve(result);
    setState(null);
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border bg-white p-6 shadow-2xl">
            {state.options.title && (
              <h2 className="mb-2 text-base font-semibold text-slate-900">
                {state.options.title}
              </h2>
            )}
            <p className="text-sm text-slate-700">{state.options.message}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => handle(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Abbrechen
              </button>
              <button
                onClick={() => handle(true)}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition ${
                  state.options.danger
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-sky-600 hover:bg-sky-700"
                }`}
              >
                {state.options.confirmLabel ?? "Bestätigen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used inside ConfirmProvider");
  return ctx;
}
