"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import { THEME_STORAGE_KEY } from "@/constants/theme";

export default function ThemeProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
      enableSystem
      storageKey={THEME_STORAGE_KEY}
    >
      {children}
    </NextThemeProvider>
  );
}
