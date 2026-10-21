"use client";

import React, { useState, useMemo } from "react";
import {
  FileSpreadsheet,
  ChevronDown,
  Search,
  Check,
  FolderOpen,
  ArrowDownToLine,
  Database,
  FolderTree,
} from "lucide-react";
import { DiscoveredDriveFile } from "@/services/driveAllocationService";

interface FileSelectorDropdownProps {
  files: DiscoveredDriveFile[];
  selectedFile: DiscoveredDriveFile | null;
  onSelectFile: (file: DiscoveredDriveFile) => void;
  onSyncFile: (fileId: string) => Promise<void>;
  syncing: boolean;
}

export default function FileSelectorDropdown({
  files,
  selectedFile,
  onSelectFile,
  onSyncFile,
  syncing,
}: FileSelectorDropdownProps) {
  // Folder selection state
  const [selectedFolder, setSelectedFolder] = useState<string>("ALL");
  const [isFileDropdownOpen, setIsFileDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Extract unique folders from files list
  const uniqueFolders = useMemo(() => {
    const folders = new Set<string>();
    files.forEach((f) => {
      folders.add(f.folderPath || "Root");
    });
    return Array.from(folders).sort();
  }, [files]);

  // Filter files by chosen folder and search query
  const filteredFiles = useMemo(() => {
    return files.filter((f) => {
      const matchFolder =
        selectedFolder === "ALL" || (f.folderPath || "Root") === selectedFolder;
      const matchSearch =
        f.fileName.toLowerCase().includes(search.toLowerCase()) ||
        f.folderPath.toLowerCase().includes(search.toLowerCase());
      return matchFolder && matchSearch;
    });
  }, [files, selectedFolder, search]);

  const handleFolderChange = (folder: string) => {
    setSelectedFolder(folder);
    setSearch("");
    // If the currently selected file is not in this folder, auto-select the first file from the new folder
    if (folder !== "ALL") {
      const firstInFolder = files.find(
        (f) => (f.folderPath || "Root") === folder
      );
      if (firstInFolder) {
        onSelectFile(firstInFolder);
      }
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
            <FolderTree size={16} className="text-blue-600" />
            Step 1: Choose Folder & File
          </label>
          <p className="text-xs text-gray-500 mt-0.5">
            Pehle Drive ka <strong>Folder</strong> chuniye, fir us folder ki <strong>File (Sheet)</strong> select kijiye.
          </p>
        </div>

        {/* Dual Selectors: Folder Dropdown + File Dropdown + Sync Button */}
        <div className="flex flex-wrap items-center gap-3">
          {/* 1. Folder Dropdown */}
          <div className="w-full sm:w-56">
            <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
              📁 1. Kon se Folder se?
            </label>
            <div className="relative">
              <select
                value={selectedFolder}
                onChange={(e) => handleFolderChange(e.target.value)}
                className="w-full appearance-none rounded-xl border border-gray-300 bg-gray-50/80 px-3.5 py-2.5 text-xs font-semibold text-gray-800 shadow-sm transition hover:bg-gray-100 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="ALL">📁 All Folders ({files.length} files)</option>
                {uniqueFolders.map((folder) => {
                  const countInFolder = files.filter(
                    (f) => (f.folderPath || "Root") === folder
                  ).length;
                  return (
                    <option key={folder} value={folder}>
                      📁 {folder} ({countInFolder} file{countInFolder > 1 ? "s" : ""})
                    </option>
                  );
                })}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>

          {/* 2. File Dropdown */}
          <div className="w-full sm:w-64 relative">
            <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
              📄 2. Kon si File se?
            </label>
            <button
              type="button"
              onClick={() => setIsFileDropdownOpen(!isFileDropdownOpen)}
              className="w-full flex items-center justify-between gap-2 rounded-xl border border-gray-300 bg-gray-50/80 px-3.5 py-2.5 text-left text-xs font-semibold text-gray-800 shadow-sm transition hover:bg-gray-100 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <div className="flex items-center gap-2 truncate">
                <FileSpreadsheet size={15} className="text-blue-600 shrink-0" />
                <span className="truncate">
                  {selectedFile ? selectedFile.fileName : "Select a File..."}
                </span>
              </div>
              <ChevronDown
                size={14}
                className={`text-gray-400 shrink-0 transition-transform ${isFileDropdownOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isFileDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsFileDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1.5 z-50 w-full sm:w-80 rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden animate-in fade-in duration-150">
                  <div className="p-2.5 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative">
                      <Search
                        size={13}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        placeholder="Search file name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white pl-8 pr-2.5 py-1 text-xs text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 p-1">
                    {filteredFiles.length === 0 ? (
                      <div className="p-4 text-center text-xs text-gray-400">
                        Is folder me koi file nahi mili
                      </div>
                    ) : (
                      filteredFiles.map((f) => {
                        const isSelected = selectedFile?.fileId === f.fileId;
                        return (
                          <button
                            key={f.fileId}
                            type="button"
                            onClick={() => {
                              onSelectFile(f);
                              setIsFileDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition ${isSelected
                              ? "bg-blue-50 text-blue-900 font-semibold"
                              : "hover:bg-gray-50 text-gray-700"
                              }`}
                          >
                            <div className="flex items-start gap-2 truncate pr-2">
                              <FileSpreadsheet
                                size={14}
                                className={`mt-0.5 shrink-0 ${isSelected ? "text-blue-600" : "text-gray-400"
                                  }`}
                              />
                              <div className="truncate">
                                <div className="font-semibold text-gray-900 truncate">
                                  {f.fileName}
                                </div>
                                <div className="text-[10px] text-gray-400 flex items-center gap-1">
                                  <span>{f.folderPath || "Root"}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                                {f.availableRecords?.toLocaleString("en-IN") || 0} ready
                              </span>
                              {isSelected && (
                                <Check size={14} className="text-blue-600" />
                              )}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 3. Sync Button */}
          {selectedFile && (
            <div className="self-end">
              <button
                onClick={() => onSyncFile(selectedFile.fileId)}
                disabled={syncing}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 active:scale-95 disabled:opacity-50 transition"
                title="Pull latest data from this Google Sheet"
              >
                <ArrowDownToLine
                  size={14}
                  className={syncing ? "animate-bounce" : ""}
                />
                {syncing ? "Syncing..." : "Sync Sheet"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Selected Details Status Bar */}
      {selectedFile && (
        <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-gray-700 font-medium">
              <FolderOpen size={13} className="text-amber-500" />
              Folder:{" "}
              <strong className="text-gray-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {selectedFile.folderPath || "Root"}
              </strong>
            </span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1 text-gray-700 font-medium">
              <Database size={13} className="text-blue-500" />
              File:{" "}
              <strong className="text-gray-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {selectedFile.fileName}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-gray-700 font-semibold">
              Total Ingested: {selectedFile.totalRecords?.toLocaleString("en-IN") || 0}
            </span>
            <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-emerald-700 font-bold border border-emerald-200">
              Ready to Allocate: {selectedFile.availableRecords?.toLocaleString("en-IN") || 0}
            </span>
            <span className="rounded-lg bg-purple-50 px-2.5 py-1 text-purple-700 font-bold border border-purple-200">
              Already Allocated: {selectedFile.allocatedRecords?.toLocaleString("en-IN") || 0}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
