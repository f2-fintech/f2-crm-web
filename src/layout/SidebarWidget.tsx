import React from "react";

export default function SidebarWidget() {
  return (
    <div className="mx-auto mb-8 mt-auto w-full px-4 text-center">
      <div className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-white/5 py-4 backdrop-blur-sm transition-all hover:bg-white/10">
        <div className="relative flex h-3 w-3 mb-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
        </div>
        <h3 className="text-xs font-medium text-slate-300">System Status</h3>
        <p className="mt-1 text-[10px] uppercase tracking-wider text-emerald-400 font-semibold">
          All Operational
        </p>
      </div>
      <p className="mt-4 text-[10px] font-medium text-slate-500">F2 CRM v1.0.0</p>
    </div>
  );
}