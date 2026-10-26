"use client";

import React, { useState, useEffect } from "react";
import {
  UserCheck,
  Users,
  Briefcase,
  X,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  FileSpreadsheet,
  FolderPlus,
  Loader2,
} from "lucide-react";
import {
  HierarchyResponse,
  ManagerHierarchy,
  EmployeeInfo,
  EmployeeSheet,
  driveAllocationService,
} from "@/services/driveAllocationService";

interface AllocateModalProps {
  open: boolean;
  onClose: () => void;
  hierarchy: HierarchyResponse | null;
  selectedCount: number;
  fileName: string;
  folderPath?: string;
  filtersSummary?: {
    city?: string;
    state?: string;
    year?: string;
    category?: string;
    minAmount?: number;
    maxAmount?: number;
  };
  onConfirm: (payload: {
    managerId: string;
    employeeId: string;
    remarks?: string;
    targetSheetName?: string;
    targetPageId?: string;
  }) => Promise<void>;
  loading: boolean;
}

export default function AllocateModal({
  open,
  onClose,
  hierarchy,
  selectedCount,
  fileName,
  folderPath,
  filtersSummary,
  onConfirm,
  loading,
}: AllocateModalProps) {
  const [selectedManagerId, setSelectedManagerId] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");

  // Subordinate employees under selected manager
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeInfo[]>([]);

  // Employee's Notion files / sheets
  const [employeeSheets, setEmployeeSheets] = useState<EmployeeSheet[]>([]);
  const [loadingSheets, setLoadingSheets] = useState(false);
  const [sheetMode, setSheetMode] = useState<"new" | "existing">("new");
  const [targetSheetName, setTargetSheetName] = useState("");
  const [selectedPageId, setSelectedPageId] = useState("");

  useEffect(() => {
    if (open) {
      setSelectedManagerId("");
      setSelectedEmployeeId("");
      setRemarks("");
      setError("");
      setFilteredEmployees([]);
      setEmployeeSheets([]);
      setSheetMode("new");
      setSelectedPageId("");
      const today = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
      setTargetSheetName(`${fileName} - ${today}`);
    }
  }, [open, fileName]);

  // When Manager changes, dynamically filter employees reporting to that manager
  const handleManagerChange = (managerId: string) => {
    setSelectedManagerId(managerId);
    setSelectedEmployeeId("");
    setEmployeeSheets([]);
    setSelectedPageId("");
    setError("");

    if (!managerId) {
      setFilteredEmployees([]);
      return;
    }

    const currentMgr = hierarchy?.managers.find((m) => m._id === managerId);
    if (currentMgr && currentMgr.employees && currentMgr.employees.length > 0) {
      setFilteredEmployees(currentMgr.employees);
    } else {
      // If manager has no direct reports in DB, offer all active employees
      setFilteredEmployees(hierarchy?.allEmployees || []);
    }
  };

  // When Employee changes, fetch their Notion sheets/files
  const handleEmployeeChange = async (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setSelectedPageId("");
    setError("");

    if (!employeeId) {
      setEmployeeSheets([]);
      return;
    }

    setLoadingSheets(true);
    try {
      const sheets = await driveAllocationService.getEmployeeSheets(employeeId);
      setEmployeeSheets(sheets);
      if (sheets.length > 0) {
        // Still default to new sheet with current file name, but give option to pick existing
        setSheetMode("new");
      } else {
        setSheetMode("new");
      }
    } catch {
      setEmployeeSheets([]);
    } finally {
      setLoadingSheets(false);
    }
  };

  const handleAllocate = async () => {
    if (!selectedManagerId) {
      setError("Pehle Manager select kijiye!");
      return;
    }
    if (!selectedEmployeeId) {
      setError("Manager ke kis Employee ko dena hai? Employee select kijiye!");
      return;
    }
    if (sheetMode === "new" && !targetSheetName.trim()) {
      setError("Target file / sheet ka naam enter kijiye!");
      return;
    }
    if (sheetMode === "existing" && !selectedPageId) {
      setError("Kripya user ki existing file select kijiye!");
      return;
    }

    setError("");
    await onConfirm({
      managerId: selectedManagerId,
      employeeId: selectedEmployeeId,
      remarks,
      targetSheetName: sheetMode === "new" ? targetSheetName.trim() : undefined,
      targetPageId: sheetMode === "existing" ? selectedPageId : undefined,
    });
  };

  if (!open) return null;

  const currentMgr = hierarchy?.managers.find((m) => m._id === selectedManagerId);
  const currentEmp =
    filteredEmployees.find((e) => e._id === selectedEmployeeId) ||
    hierarchy?.allEmployees.find((e) => e._id === selectedEmployeeId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
              <UserCheck size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Data Allocation (Assign to Team)
              </h3>
              <p className="text-xs text-gray-500">
                Data allocate hone par sidha user ke file/sheet me chala jayega.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Info Banner */}
        <div className="my-4 rounded-2xl bg-blue-50/70 border border-blue-100 p-3.5 text-xs text-blue-900 flex items-start gap-2.5">
          <HelpCircle size={17} className="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <div>
              <span className="font-bold">Allocating {selectedCount} Lead(s)</span> from:
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-blue-950 font-semibold">
              <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[11px] border border-amber-200">
                📁 {folderPath || "Root"}
              </span>
              <span>/</span>
              <span className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded text-[11px] border border-blue-200">
                📄 {fileName}
              </span>
            </div>
            <div className="text-[11px] text-blue-700 mt-1">
              Yeh data select kiye gaye Employee ke Notion Workspace / File me instantly add ho jayega.
            </div>

            {filtersSummary && (filtersSummary.city || filtersSummary.state || filtersSummary.year || filtersSummary.minAmount !== undefined) && (
              <div className="mt-2.5 pt-2 border-t border-blue-200/60">
                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-800 mb-1">
                  🎯 Target Filters Applied (Filtered subset se allocate hoga):
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {filtersSummary.city && (
                    <span className="bg-white/90 text-blue-800 border border-blue-300 rounded px-1.5 py-0.5 text-[10px] font-semibold">
                      City: {filtersSummary.city}
                    </span>
                  )}
                  {filtersSummary.state && (
                    <span className="bg-white/90 text-purple-800 border border-purple-300 rounded px-1.5 py-0.5 text-[10px] font-semibold">
                      State: {filtersSummary.state}
                    </span>
                  )}
                  {filtersSummary.year && (
                    <span className="bg-white/90 text-amber-800 border border-amber-300 rounded px-1.5 py-0.5 text-[10px] font-semibold">
                      Year/Period: {filtersSummary.year}
                    </span>
                  )}
                  {filtersSummary.minAmount !== undefined && (
                    <span className="bg-white/90 text-emerald-800 border border-emerald-300 rounded px-1.5 py-0.5 text-[10px] font-semibold">
                      Min: ₹{filtersSummary.minAmount.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Dropdowns */}
        <div className="space-y-4">
          {/* Step 1: Manager Selection */}
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <Briefcase size={14} className="text-blue-600" />
              1. Kon se Manager ko dena hai? *
            </label>
            <select
              value={selectedManagerId}
              onChange={(e) => handleManagerChange(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">-- Choose Manager --</option>
              {hierarchy?.managers.map((mgr) => (
                <option key={mgr._id} value={mgr._id}>
                  {mgr.fullName} ({mgr.role}) - {mgr.email}
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Employee Selection (Dependent on Manager) */}
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <Users size={14} className="text-indigo-600" />
              2. Manager ke kon se Employee ko dena hai? *
            </label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => handleEmployeeChange(e.target.value)}
              disabled={!selectedManagerId}
              className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:text-gray-400"
            >
              <option value="">
                {!selectedManagerId
                  ? "-- Pehle Manager Select Kijiye --"
                  : filteredEmployees.length === 0
                  ? "-- No direct employees (Showing all) --"
                  : "-- Choose Employee --"}
              </option>
              {filteredEmployees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.fullName} ({emp.role}) - {emp.email}
                </option>
              ))}
            </select>

            {selectedManagerId && filteredEmployees.length === 0 && (
              <p className="mt-1 text-[11px] text-amber-600">
                Is manager ke direct reports nahi mile, aap kisi bhi employee ko allocate kar sakte hain.
              </p>
            )}
          </div>

          {/* Step 3: Target File / Sheet for User */}
          {selectedEmployeeId && (
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                  <FileSpreadsheet size={15} className="text-indigo-600" />
                  3. User Ki File (Target Sheet in Notion) *
                </label>
                {loadingSheets && (
                  <span className="flex items-center gap-1 text-[11px] text-indigo-500">
                    <Loader2 size={12} className="animate-spin" /> Checking user files...
                  </span>
                )}
              </div>

              {employeeSheets.length > 0 && (
                <div className="flex rounded-xl bg-indigo-100/70 p-1 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setSheetMode("new")}
                    className={`flex-1 rounded-lg py-1.5 text-center transition ${
                      sheetMode === "new"
                        ? "bg-white text-indigo-900 shadow-sm font-bold"
                        : "text-indigo-700 hover:text-indigo-900"
                    }`}
                  >
                    + Create New File / Sheet
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSheetMode("existing");
                      if (employeeSheets.length > 0 && !selectedPageId) {
                        setSelectedPageId(employeeSheets[0]._id);
                      }
                    }}
                    className={`flex-1 rounded-lg py-1.5 text-center transition ${
                      sheetMode === "existing"
                        ? "bg-white text-indigo-900 shadow-sm font-bold"
                        : "text-indigo-700 hover:text-indigo-900"
                    }`}
                  >
                    Add to Existing ({employeeSheets.length})
                  </button>
                </div>
              )}

              {sheetMode === "new" ? (
                <div>
                  <input
                    type="text"
                    value={targetSheetName}
                    onChange={(e) => setTargetSheetName(e.target.value)}
                    placeholder="Enter sheet / file name for user"
                    className="w-full rounded-xl border border-indigo-200 bg-white px-3.5 py-2 text-xs font-medium text-gray-800 shadow-sm focus:border-indigo-500 focus:outline-none"
                  />
                  <p className="mt-1 text-[11px] text-indigo-600">
                    📄 Yeh sheet Notion Workspace me <strong>{currentEmp?.fullName}</strong> ke folder me create hogi aur data isme chala jayega.
                  </p>
                </div>
              ) : (
                <div>
                  <select
                    value={selectedPageId}
                    onChange={(e) => setSelectedPageId(e.target.value)}
                    className="w-full rounded-xl border border-indigo-200 bg-white px-3.5 py-2 text-xs font-medium text-gray-800 shadow-sm focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">-- Select Existing Sheet --</option>
                    {employeeSheets.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.title} ({s.rowCount} rows)
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-[11px] text-indigo-600">
                    📥 Yeh {selectedCount} leads user ki selected file me append ho jayenge.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Optional Remarks */}
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 block">
              Remarks / Allocation Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Priority calling, March campaign"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-xs text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Confirmation Preview */}
          {selectedManagerId && selectedEmployeeId && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <div>
                Assigning to: <strong>{currentEmp?.fullName}</strong> (Manager:{" "}
                <strong>{currentMgr?.fullName}</strong>) into file:{" "}
                <strong>
                  {sheetMode === "new"
                    ? targetSheetName
                    : employeeSheets.find((s) => s._id === selectedPageId)?.title || "Selected file"}
                </strong>
                .
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAllocate}
            disabled={loading || !selectedManagerId || !selectedEmployeeId}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 disabled:opacity-50 transition"
          >
            <UserCheck size={16} />
            {loading ? "Allocating Data..." : `Confirm & Allocate (${selectedCount})`}
          </button>
        </div>
      </div>
    </div>
  );
}
