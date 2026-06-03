import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ThemeProvider from "@/components/theme/ThemeProvider";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TaskFlow",
<<<<<<< HEAD
  description: "A Jira-inspired task management application.",
=======
  description: "Minimal task management dashboard for focused teams.",
>>>>>>> 8dfdc84a6a4211af9a4e90fffc39dc288c6587fb
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
<<<<<<< HEAD
      <body className="min-h-full bg-[#F8FAFC] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
=======
      <body className="min-h-full bg-background text-foreground">
>>>>>>> 8dfdc84a6a4211af9a4e90fffc39dc288c6587fb
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
