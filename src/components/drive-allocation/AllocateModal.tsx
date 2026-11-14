"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  UserCheck,
  Users,
  Briefcase,
  X,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Sparkles,
  RefreshCw,
  Table,
  Layers,
  Phone,
  Building,
  CreditCard,
} from "lucide-react";
import {
  HierarchyResponse,
  EmployeeInfo,
  EmployeeSheet,
  driveAllocationService,
  CustomFilterItem,
  DriveRecordItem,
} from "@/services/driveAllocationService";

interface AllocateModalProps {
  open: boolean;
  onClose: () => void;
  hierarchy: HierarchyResponse | null;
  selectedCount: number;
  fileName: string;
  fileId?: string;
  folderPath?: string;
  filtersSummary?: {
    city?: string;
    state?: string;
    year?: string;
    category?: string;
    cibilMin?: number;
    lender?: string;
    customColumn?: string;
    customValue?: string;
    minAmount?: number;
    maxAmount?: number;
    filters?: CustomFilterItem[];
  };
  selectedRecordIds?: string[];
  onConfirm: (payload: {
    managerId: string;
    employeeId: string;
    remarks?: string;
    targetSheetName?: string;
    targetPageId?: string;
    recordIds?: string[];
    count?: number;
  }) => Promise<void>;
  loading: boolean;
}

export default function AllocateModal({
  open,
  onClose,
  hierarchy,
  selectedCount,
  fileName,
  fileId,
  folderPath,
  filtersSummary,
  selectedRecordIds,
  onConfirm,
  loading,
}: AllocateModalProps) {
  const [selectedManagerId, setSelectedManagerId] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");

  // Number of rows to allocate
  const [batchCount, setBatchCount] = useState<number>(
    selectedCount > 0 ? selectedCount : 50
  );

  // Preview state
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewTotalMatching, setPreviewTotalMatching] = useState<number>(0);
  const [previewSelectedCount, setPreviewSelectedCount] = useState<number>(0);
  const [previewStateCounts, setPreviewStateCounts] = useState<Record<string, number>>({});
  const [previewRecords, setPreviewRecords] = useState<DriveRecordItem[]>([]);
  const [previewRecordIds, setPreviewRecordIds] = useState<string[]>([]);

  // Subordinate employees under selected manager
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeInfo[]>([]);

  // Employee's Notion files / sheets
  const [employeeSheets, setEmployeeSheets] = useState<EmployeeSheet[]>([]);
  const [loadingSheets, setLoadingSheets] = useState(false);
  const [sheetMode, setSheetMode] = useState<"new" | "existing">("new");
  const [targetSheetName, setTargetSheetName] = useState("");
  const [selectedPageId, setSelectedPageId] = useState("");

  // Function to load balanced preview from backend
  const loadBalancedPreview = useCallback(
    async (countToPreview: number) => {
      if (!fileId) return;
      setLoadingPreview(true);
      setError("");
      try {
        const res = await driveAllocationService.previewRecords({
          sourceFileId: fileId,
          count: countToPreview,
          city: filtersSummary?.city || undefined,
          state: filtersSummary?.state || undefined,
          year: filtersSummary?.year || undefined,
          category: filtersSummary?.category || undefined,
          cibilMin: filtersSummary?.cibilMin,
          lender: filtersSummary?.lender || undefined,
          customColumn: filtersSummary?.customColumn || undefined,
          customValue: filtersSummary?.customValue || undefined,
          minAmount: filtersSummary?.minAmount,
          maxAmount: filtersSummary?.maxAmount,
          filters: filtersSummary?.filters,
        });

        setPreviewTotalMatching(res.totalMatching);
        setPreviewSelectedCount(res.selectedCount);

        // Sanitize state counts: eliminate numeric pincodes or empty keys
        const rawStateCounts = res.stateCounts || {};
        const cleanedStateCounts: Record<string, number> = {};
        for (const [st, cnt] of Object.entries(rawStateCounts)) {
          const trimmed = st.trim().toUpperCase();
          if (trimmed && !/^\d+$/.test(trimmed) && trimmed !== "N/A" && trimmed !== "NA") {
            cleanedStateCounts[trimmed] = cnt;
          } else if (cnt > 0) {
            cleanedStateCounts["OTHER"] = (cleanedStateCounts["OTHER"] || 0) + cnt;
          }
        }

        setPreviewStateCounts(cleanedStateCounts);
        setPreviewRecords(res.records || []);
        setPreviewRecordIds(res.recordIds || []);
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            "Preview generate karne me error aaya. Kripya punah prayas karein."
        );
      } finally {
        setLoadingPreview(false);
      }
    },
    [fileId, filtersSummary]
  );

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
      const count = selectedCount > 0 ? selectedCount : 50;
      setBatchCount(count);

      const today = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
      setTargetSheetName(`${fileName} - ${today}`);

      // If user selected explicit records with checkboxes, don't auto-fetch random preview
      if (selectedRecordIds && selectedRecordIds.length > 0) {
        setPreviewTotalMatching(selectedRecordIds.length);
        setPreviewSelectedCount(selectedRecordIds.length);
        setPreviewRecordIds(selectedRecordIds);
      } else if (fileId) {
        // Auto-fetch balanced preview
        loadBalancedPreview(count);
      }
    }
  }, [open, fileName, fileId, selectedCount, selectedRecordIds, loadBalancedPreview]);

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
      setSheetMode("new");
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
      recordIds:
        previewRecordIds.length > 0
          ? previewRecordIds
          : selectedRecordIds && selectedRecordIds.length > 0
          ? selectedRecordIds
          : undefined,
      count: batchCount,
    });
  };

  if (!open) return null;

  const currentMgr = hierarchy?.managers.find((m) => m._id === selectedManagerId);
  const currentEmp =
    filteredEmployees.find((e) => e._id === selectedEmployeeId) ||
    hierarchy?.allEmployees.find((e) => e._id === selectedEmployeeId);

  const finalAllocCount =
    previewRecordIds.length > 0
      ? previewRecordIds.length
      : selectedRecordIds && selectedRecordIds.length > 0
      ? selectedRecordIds.length
      : batchCount;

  const stateEntries = Object.entries(previewStateCounts);

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] rounded-3xl border border-slate-200 bg-white shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/25">
              <UserCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Data Allocation
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                  <Sparkles size={11} /> Equal State Mix
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <span>Source:</span>
                <span className="font-semibold text-slate-800">📄 {fileName}</span>
                {folderPath && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500">📁 {folderPath}</span>
                  </>
                )}
                {previewTotalMatching > 0 && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-indigo-600 font-bold">{previewTotalMatching.toLocaleString()} available</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-200/80 hover:text-slate-700 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Active Filters Bar (if any applied) */}
          {filtersSummary && (filtersSummary.state || filtersSummary.city || filtersSummary.year || filtersSummary.minAmount !== undefined) && (
            <div className="rounded-xl bg-indigo-50/60 border border-indigo-100 px-3.5 py-2 text-xs flex flex-wrap items-center gap-2">
              <span className="font-bold text-indigo-900 flex items-center gap-1">
                <Layers size={13} className="text-indigo-600" /> Active Filters:
              </span>
              {filtersSummary.state && (
                <span className="bg-white border border-indigo-200 text-indigo-800 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                  State: {filtersSummary.state}
                </span>
              )}
              {filtersSummary.city && (
                <span className="bg-white border border-blue-200 text-blue-800 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                  City: {filtersSummary.city}
                </span>
              )}
              {filtersSummary.year && (
                <span className="bg-white border border-amber-200 text-amber-800 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                  Year: {filtersSummary.year}
                </span>
              )}
              {filtersSummary.minAmount !== undefined && (
                <span className="bg-white border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                  Min: ₹{filtersSummary.minAmount.toLocaleString("en-IN")}
                </span>
              )}
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-700 flex items-center gap-2.5">
              <AlertCircle size={17} className="text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Team Selection & Quantity (Clean Light SaaS Card) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-bold">1</span>
              Select Manager, Employee & Allocation Volume
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-end">
              {/* Manager Dropdown */}
              <div className="lg:col-span-4">
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Manager <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedManagerId}
                    onChange={(e) => handleManagerChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="">-- Choose Manager --</option>
                    {hierarchy?.managers.map((mgr) => (
                      <option key={mgr._id} value={mgr._id}>
                        {mgr.fullName} ({mgr.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Employee Dropdown */}
              <div className="lg:col-span-4">
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Employee <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => handleEmployeeChange(e.target.value)}
                  disabled={!selectedManagerId}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">
                    {!selectedManagerId
                      ? "-- Pehle Manager Select Kijiye --"
                      : filteredEmployees.length === 0
                      ? "-- Showing all active employees --"
                      : "-- Choose Employee --"}
                  </option>
                  {filteredEmployees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.fullName} ({emp.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* How Many Rows Input & Preview Button */}
              <div className="lg:col-span-4 flex items-end gap-2">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    How many rows
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={batchCount}
                    onChange={(e) => setBatchCount(Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="50"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => loadBalancedPreview(batchCount)}
                  disabled={loadingPreview}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-4 py-2 text-xs font-bold shadow-sm transition active:scale-95 disabled:opacity-50 whitespace-nowrap h-[36px]"
                  title="Randomly picks matching rows with equal state distribution"
                >
                  {loadingPreview ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Sparkles size={14} />
                  )}
                  <span>Preview & Mix</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Rows are picked at random. If fewer rows match, you get all of them. Enter 0 to take every matching row.
            </p>
          </div>

          {/* Section 2: Review and allocate (Cohesive Modern SaaS Card) */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 shadow-xs space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-bold">2</span>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Table size={15} className="text-indigo-600" />
                  Review and allocate
                </h4>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-medium">Matching:</span>
                  <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs">
                    {previewTotalMatching.toLocaleString()}
                  </span>
                  <span className="text-slate-500 font-medium ml-1">Batch:</span>
                  <span className="font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-xs">
                    {previewSelectedCount.toLocaleString()}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => loadBalancedPreview(batchCount)}
                  disabled={loadingPreview}
                  className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold transition ml-2 cursor-pointer"
                >
                  <RefreshCw size={12} className={loadingPreview ? "animate-spin" : ""} />
                  Re-shuffle
                </button>
              </div>
            </div>

            {/* State Breakdown Pills (Clean, Structured, Scrollable Box) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  Equal State Breakdown ({stateEntries.length} {stateEntries.length === 1 ? "State" : "States"}):
                </span>
                <span className="text-[11px] text-slate-500">
                  Evenly distributed across states
                </span>
              </div>

              {stateEntries.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1 p-2 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                  {stateEntries.map(([st, cnt]) => (
                    <span
                      key={st}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-200/90 px-2 py-0.5 text-xs text-slate-700 shadow-2xs hover:border-indigo-300 transition"
                    >
                      <span className="font-bold text-slate-800">{st}</span>
                      <span className="bg-indigo-600 text-white px-1.5 py-0.2 rounded font-extrabold text-[11px]">
                        {cnt}
                      </span>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic p-2 bg-white rounded-xl border border-slate-200">
                  {loadingPreview ? "Balancing state distribution..." : "Click 'Preview & Mix' to see state breakdown."}
                </div>
              )}
            </div>

            {/* Preview Data Table */}
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
              <div className="max-h-60 overflow-y-auto overflow-x-auto text-xs">
                {loadingPreview ? (
                  <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                    <Loader2 size={24} className="animate-spin text-indigo-600" />
                    <span className="font-medium">Picking random rows & calculating state balance...</span>
                  </div>
                ) : previewRecords.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    No records match the current filters or no preview generated yet.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3"># Row</th>
                        <th className="py-2.5 px-3">Phone</th>
                        <th className="py-2.5 px-3">Customer Name</th>
                        <th className="py-2.5 px-3">State</th>
                        <th className="py-2.5 px-3">City / Branch</th>
                        <th className="py-2.5 px-3">Eligibility</th>
                        <th className="py-2.5 px-3">CIBIL</th>
                        <th className="py-2.5 px-3">PAN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {previewRecords.map((r, index) => {
                        const raw = r.rawData || {};
                        const cibil =
                          raw.CIBIL || raw.Cibil || raw.cibil || raw.SCORE || raw.Score || "--";
                        const pan = raw.PAN || raw.Pan || raw.pan || "--";
                        const city = r.branch || raw.City || raw.CITY || raw.District || "--";
                        const st = r.state || raw.State || raw.STATE || "--";

                        return (
                          <tr
                            key={r._id || index}
                            className="hover:bg-slate-50/80 transition text-xs"
                          >
                            <td className="py-2 px-3 text-slate-400 font-mono font-medium">
                              {r.rowIndex || index + 1}
                            </td>
                            <td className="py-2 px-3 font-mono font-bold text-indigo-600">{r.phone || "--"}</td>
                            <td className="py-2 px-3 font-semibold text-slate-900 max-w-[160px] truncate">
                              {r.customerName || raw.Name || raw.NAME || "--"}
                            </td>
                            <td className="py-2 px-3">
                              <span className="bg-purple-50 border border-purple-200 text-purple-700 px-2 py-0.5 rounded-md text-[11px] font-bold">
                                {st}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-slate-600">{city}</td>
                            <td className="py-2 px-3 font-bold text-emerald-700">
                              {r.eligibilityAmount
                                ? `₹${Number(r.eligibilityAmount).toLocaleString("en-IN")}`
                                : raw.Eligibility || raw.ELIGIBILITY || "--"}
                            </td>
                            <td className="py-2 px-3 font-semibold text-slate-600">{cibil}</td>
                            <td className="py-2 px-3 font-mono text-slate-500">{pan}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Target File in Notion & Remarks */}
          {selectedEmployeeId && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-bold">3</span>
                  Target File in Notion (Destination Workspace) *
                </h4>
                {loadingSheets && (
                  <span className="flex items-center gap-1 text-[11px] text-indigo-600">
                    <Loader2 size={12} className="animate-spin" /> Checking user sheets...
                  </span>
                )}
              </div>

              {employeeSheets.length > 0 && (
                <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setSheetMode("new")}
                    className={`flex-1 rounded-lg py-1.5 text-center transition ${
                      sheetMode === "new"
                        ? "bg-white text-indigo-900 shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
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
                        ? "bg-white text-indigo-900 shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Add to Existing Sheet ({employeeSheets.length})
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
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 shadow-xs focus:border-indigo-500 focus:outline-none"
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    📄 Yeh sheet Notion Workspace me <strong>{currentEmp?.fullName}</strong> ke account me banegi aur allocated leads enter honge.
                  </p>
                </div>
              ) : (
                <div>
                  <select
                    value={selectedPageId}
                    onChange={(e) => setSelectedPageId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 shadow-xs focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">-- Select Existing Sheet --</option>
                    {employeeSheets.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.title} ({s.rowCount} rows)
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-[11px] text-slate-500">
                    📥 Yeh {finalAllocCount} leads user ki is selected file me append ho jayenge.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Optional Remarks */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Remarks / Allocation Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Mixed State Calling Batch, March campaign"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-800 shadow-xs focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Allocation Target Confirmation Badge */}
          {selectedManagerId && selectedEmployeeId && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-900 flex items-center gap-2.5">
              <CheckCircle2 size={17} className="text-emerald-600 shrink-0" />
              <div>
                Ready to assign <strong>{finalAllocCount} leads</strong> to:{" "}
                <strong>{currentEmp?.fullName}</strong> (Manager:{" "}
                <strong>{currentMgr?.fullName}</strong>) into Notion sheet:{" "}
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

        {/* Modal Footer */}
        <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            {finalAllocCount > 0 ? (
              <span>
                Total to allocate: <strong className="text-slate-900 font-bold">{finalAllocCount} leads</strong>
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAllocate}
              disabled={loading || !selectedManagerId || !selectedEmployeeId || finalAllocCount === 0}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 transition cursor-pointer"
            >
              <UserCheck size={16} />
              {loading ? "Allocating Data..." : `Confirm & Allocate (${finalAllocCount})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
