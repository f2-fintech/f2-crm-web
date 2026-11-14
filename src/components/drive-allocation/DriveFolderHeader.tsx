"use client";

import React, { useState } from "react";
import {
  FolderGit2,
  RefreshCw,
  ExternalLink,
  Layers,
  CheckCircle2,
  Users2,
  FileSpreadsheet,
} from "lucide-react";
import { DriveStats } from "@/services/driveAllocationService";

interface DriveFolderHeaderProps {
  stats: DriveStats | null;
  onRefresh: () => Promise<void>;
  folderUrl: string;
}

export default function DriveFolderHeader({
  stats,
  onRefresh,
  folderUrl,
}: DriveFolderHeaderProps) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner Card */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-blue-300 shadow-inner">
              <FolderGit2 size={30} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Drive Live Connected
                </span>
                {/* <span className="text-xs text-blue-200/70">mis_search_automation</span> */}
              </div>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">
                Google Drive Data Allocation Portal
              </h2>
              <div className="mt-1 flex items-center gap-2 text-xs text-blue-200/80">
                <span>Source Drive:</span>
                <a
                  href={folderUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-blue-300 hover:text-white underline underline-offset-2 flex items-center gap-1 max-w-[280px] md:max-w-md truncate"
                >
                  {folderUrl} <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-white/25 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Syncing Drive..." : "Rescan Drive"}
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase tracking-wider">
            <span>Files In Folder</span>
            <FileSpreadsheet size={18} className="text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {stats?.totalFiles ?? "--"}
            </span>
            <span className="text-xs text-gray-400">sheets</span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase tracking-wider">
            <span>Total Ingested Data</span>
            <Layers size={18} className="text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {stats?.totalRecords ? stats.totalRecords.toLocaleString("en-IN") : "--"}
            </span>
            <span className="text-xs text-gray-400">leads</span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold uppercase tracking-wider">
            <span>Available To Allocate</span>
            <CheckCircle2 size={18} className="text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-800">
              {stats?.availableRecords ? stats.availableRecords.toLocaleString("en-IN") : "--"}
            </span>
            <span className="text-xs text-emerald-600 font-medium">ready</span>
          </div>
        </div>

        <div className="rounded-2xl border border-purple-100 bg-purple-50/40 p-4 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-purple-700 text-xs font-semibold uppercase tracking-wider">
            <span>Allocated To Team</span>
            <Users2 size={18} className="text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-800">
              {stats?.allocatedRecords ? stats.allocatedRecords.toLocaleString("en-IN") : "--"}
            </span>
            <span className="text-xs text-purple-600 font-medium">active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
