"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  ExternalLink,
  RotateCw,
  Maximize2,
  Minimize2,
  ShieldCheck,
  Server,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";

export default function LeadScoringPage() {
 const scoringUrl = "15.206.212.47";


  const [isLoading, setIsLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Check health of Python Lead Scoring server
  const checkHealth = async () => {
    try {
      const res = await fetch(`${scoringUrl}/api/health`, {
        method: "GET",
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        setServerOnline(true);
      } else {
        setServerOnline(false);
      }
    } catch {
      setServerOnline(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [scoringUrl]);

  const handleRefresh = () => {
    setIsLoading(true);
    checkHealth();
    if (iframeRef.current) {
      iframeRef.current.src = scoringUrl;
    }
  };

  return (
    <div
      className={`flex flex-col transition-all duration-300 ${isFullScreen
          ? "fixed inset-0 z-50 bg-white p-4"
          : "space-y-4"
        }`}
    >
      {/* Minimal Top Action Bar (Right-aligned) */}
      <div className="flex items-center justify-end pb-1">
        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            title="Reload Scoring App"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 shadow-2xs transition"
          >
            <RotateCw size={13} className={isLoading ? "animate-spin text-indigo-600" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFullScreen(!isFullScreen)}
            title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
            className="p-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 shadow-2xs transition"
          >
            {isFullScreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>

          <a
            href={scoringUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in new window"
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition"
          >
            <ExternalLink size={13} />
            <span className="hidden sm:inline">Open New Tab</span>
          </a>
        </div>
      </div>

      {/* Warning Banner if Server is Offline */}
      {serverOnline === false && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex items-start gap-3 text-rose-800 text-xs">
          <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Python Scoring Server is not running!</span>
            <p className="mt-0.5 text-rose-700">
              Please make sure the background process is started on port 5000:{" "}
              <code className="bg-rose-100 px-1.5 py-0.5 rounded font-mono font-bold text-rose-900">
                python server.py
              </code>{" "}
              in <code className="bg-rose-100 px-1 py-0.5 rounded font-mono">c:\Users\LENOVO\Downloads\f2_lead_scoring\f2_lead_scoring</code>.
            </p>
          </div>
          <button
            onClick={checkHealth}
            className="px-3 py-1 bg-white hover:bg-rose-100 border border-rose-300 text-rose-800 rounded-lg font-bold text-[11px] transition shadow-2xs shrink-0"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Frame Container */}
      <div
        className={`relative w-full rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 shadow-sm ${isFullScreen ? "flex-1 h-full" : "h-[calc(100vh-175px)] min-h-[600px]"
          }`}
      >
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/90 backdrop-blur-xs">
            <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-xs font-bold text-slate-700">
              Loading AI Lead Scoring Dashboard...
            </p>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              Connecting to {scoringUrl}
            </p>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={scoringUrl}
          title="F2 AI Lead Scoring Dashboard"
          className="w-full h-full border-0"
          onLoad={() => setIsLoading(false)}
          allow="clipboard-read; clipboard-write"
        />
      </div>
    </div>
  );
}
