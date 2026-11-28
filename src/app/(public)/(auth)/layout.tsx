import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import { ThemeProvider } from "@/context/ThemeContext";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative h-screen max-h-screen w-full overflow-hidden bg-gradient-to-br from-[#f1f3fd] via-[#e8ebfb] to-[#f4f0ff] dark:from-[#070b14] dark:via-[#0a0f1d] dark:to-[#080c18] flex items-center justify-center p-3 sm:p-6 lg:p-8 select-none">
      <ThemeProvider>
        {/* ── Soft Ambient Pastel Decorative Curves in Corners (Matching Reference) ── */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-indigo-300/30 blur-3xl dark:bg-indigo-600/10" />
        <div className="pointer-events-none absolute -bottom-28 -right-28 h-96 w-96 rounded-full bg-purple-300/30 blur-3xl dark:bg-purple-600/10" />
        <div className="pointer-events-none absolute top-1/4 -right-16 h-72 w-72 rounded-full bg-violet-200/40 blur-2xl dark:bg-violet-600/10" />

        {/* Outer curved line shapes */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-40 dark:opacity-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M -100 200 C 300 100, 400 600, 800 400 S 1400 800, 1800 600"
            fill="none"
            stroke="rgba(129, 140, 248, 0.25)"
            strokeWidth="60"
          />
          <path
            d="M 200 -100 C 400 300, 200 700, 600 900 S 1200 600, 1600 1000"
            fill="none"
            stroke="rgba(192, 132, 252, 0.2)"
            strokeWidth="45"
          />
        </svg>

        {/* ── Main Centered Interactive Card ── */}
        <div className="relative z-10 w-full flex items-center justify-center">
          {children}
        </div>

        {/* Theme Toggler (Bottom-Right) */}
        <div className="fixed bottom-4 right-4 z-50">
          <ThemeTogglerTwo />
        </div>
      </ThemeProvider>
    </div>
  );
}
