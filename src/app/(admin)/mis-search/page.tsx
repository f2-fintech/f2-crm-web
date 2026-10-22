"use client";

import React, { useState, useRef, useEffect } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission } from "@/config/roles";
import {
  ExternalLink,
  RefreshCw,
  AlertCircle,
  ShieldAlert,
  Loader2,
  Lock,
} from "lucide-react";

export default function MisSearchPage() {
  const { user, role, isLoading: isAuthLoading } = useAuth();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isServerLive, setIsServerLive] = useState<boolean | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const misSearchUrl =
    process.env.NEXT_PUBLIC_MIS_SEARCH_URL || "https://mis.f2fintech.in";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      setAuthToken(token);
    }
  }, []);

  const buildIframeSrc = () => {
    const params = new URLSearchParams();
    if (authToken) params.set("token", authToken);
    if (user?.email) params.set("email", user.email);
    if (role) params.set("role", role);
    const query = params.toString();
    return query ? `${misSearchUrl}?${query}` : misSearchUrl;
  };

  const checkServerStatus = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      await fetch(`${misSearchUrl}/api/status`, {
        signal: controller.signal,
        mode: "no-cors",
      });
      clearTimeout(timeoutId);
      setIsServerLive(true);
    } catch {
      setIsServerLive(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading && hasPermission("/mis-search", role)) {
      checkServerStatus();
    }
  }, [isAuthLoading, role]);

  const handleRefresh = () => {
    setIsLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = buildIframeSrc();
    }
    checkServerStatus();
  };

  const handleOpenExternal = () => {
    window.open(buildIframeSrc(), "_blank", "noopener,noreferrer");
  };

  if (isAuthLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-brand-500" />
      </div>
    );
  }

  if (!hasPermission("/mis-search", role)) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-160px)] text-center p-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center text-rose-500 mb-4 shadow-sm">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Access Restricted
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6 leading-relaxed">
          You do not have permission to access the MIS Search Book. Only authorized
          administrators and managers can access this dataset.
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/60 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
          <Lock size={12} />
          <span>Current Role: {role || "Guest"}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] min-h-[650px] pb-4">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <PageBreadcrumb pageTitle="MIS Search Book" />
          <p className="text-xs text-gray-500 dark:text-gray-400 -mt-4">
            Integrated MIS Search Engine, Customer Lookup & Excel Directory
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Server status pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
            {isServerLive === false ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>AWS Server Connecting...</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Live AWS ({misSearchUrl.replace(/^https?:\/\//, "")})</span>
              </>
            )}
          </div>

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            title="Reload MIS Search Frame"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors shadow-sm cursor-pointer"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Open full page in new tab */}
          <button
            onClick={handleOpenExternal}
            title="Open in dedicated window"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-500 transition-colors shadow-sm cursor-pointer"
          >
            <ExternalLink size={13} />
            <span>Full Window</span>
          </button>
        </div>
      </div>

      {/* Main Iframe Container */}
      <div className="relative flex-1 w-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-xs transition-opacity">
            <Loader2 size={32} className="animate-spin text-brand-500 mb-2" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Loading MIS Search Book...
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Connecting to AWS ({misSearchUrl})
            </p>
          </div>
        )}

        {/* Embedded Iframe */}
        <iframe
          ref={iframeRef}
          src={buildIframeSrc()}
          title="MIS Search Book"
          className="w-full h-full flex-1 border-0"
          onLoad={() => {
            setIsLoading(false);
            setIsServerLive(true);
          }}
          onError={() => {
            setIsLoading(false);
            setIsServerLive(false);
          }}
          allow="clipboard-read; clipboard-write; fullscreen"
        />
      </div>
    </div>
  );
}
