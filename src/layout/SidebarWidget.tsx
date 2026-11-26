import React from "react";

export default function SidebarWidget() {
  return (
    <div className="mx-auto mb-5 mt-auto w-full px-1">
      <div className="group relative flex items-center justify-between rounded-xl border border-slate-800/90 bg-slate-900/60 p-2.5 shadow-sm transition-all hover:border-slate-700/80 hover:bg-slate-900/90">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-2.5 w-2.5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11.5px] font-semibold text-slate-300 group-hover:text-white transition-colors leading-tight">
              Enterprise Cloud
            </span>
            <span className="text-[10px] text-emerald-400/90 font-medium">
              Systems Operational
            </span>
          </div>
        </div>
        <span className="rounded bg-slate-800/90 px-1.5 py-0.5 text-[9px] font-mono font-medium text-slate-400 border border-slate-700/60">
          v2.4
        </span>
      </div>
    </div>
  );
}
