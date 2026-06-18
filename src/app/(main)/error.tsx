"use client";

import { useEffect } from "react";

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-900/50 dark:bg-slate-900">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/40">
          <span className="text-2xl">⚠️</span>
        </div>

        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Something went wrong
        </h2>

        <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>

        {error.digest && (
          <p className="mt-2 text-xs font-mono text-slate-400 dark:text-slate-500">
            Error ID: {error.digest}
          </p>
        )}

        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
