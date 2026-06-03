"use client";

import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-6">
      <div className="text-center max-w-3xl px-6">
        <h1 className="text-5xl font-extrabold tracking-tight text-[#0F172A] sm:text-6xl">
          TaskFlow
        </h1>

        <p className="mt-6 text-lg leading-8 text-slate-600 sm:text-xl">
          Manage your tasks, track progress,
          and stay productive with a clean
          dashboard experience.
        </p>

        <button
          onClick={() => router.push("/dashboard")}
          className="mt-8 rounded-xl bg-[#2563EB] px-8 py-4 font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
        >
          Get Started
        </button>
      </div>
    </main>
  );
}
