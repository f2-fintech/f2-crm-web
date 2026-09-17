import React from "react";

export default function SidebarWidget() {
  return (
    <div className="mx-auto mb-8 w-full max-w-60 rounded-xl border border-white/10 bg-white/5 px-4 py-5 text-center">
      <h3 className="mb-1 text-sm font-semibold text-white">Need a hand?</h3>
      <p className="mb-4 text-xs text-slate-400">
        Check the onboarding guide to get set up faster.
      </p>
      <a
        href="#"
        className="flex items-center justify-center rounded-lg bg-indigo-500 p-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
      >
        View Guide
      </a>
    </div>
  );
}