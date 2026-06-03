"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { themeOptions } from "@/constants/theme";
import { applyThemePreference } from "@/utils/theme";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));

    return () => cancelAnimationFrame(frame);
  }, []);

  if (!mounted) {
    return (
      <div className="h-10 w-[104px] rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900" />
    );
  }

  return (
    <div className="grid grid-cols-3 rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900">
      {themeOptions.map((option) => {
        const Icon = option.icon;
        const isActive = theme === option.value;

        return (
          <button
            key={option.value}
            type="button"
            aria-label={option.label}
            onClick={() => {
              applyThemePreference(option.value);
              setTheme(option.value);
            }}
            className={`flex size-8 items-center justify-center rounded-lg ${
              isActive
                ? "bg-white text-[#2563EB] shadow-sm dark:bg-slate-800"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            }`}
          >
            <Icon size={16} />
          </button>
        );
      })}
    </div>
  );
}
