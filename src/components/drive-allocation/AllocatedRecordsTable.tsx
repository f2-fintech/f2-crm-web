"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Undo2,
  UserCog,
  Phone,
  Building,
  Calendar,
  Briefcase,
  User,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Layers,
  ChevronDown,
  FolderOpen,
  CheckCircle2,
  ListFilter,
} from "lucide-react";
import {
  DriveRecordItem,
  HierarchyResponse,
  DiscoveredDriveFile,
} from "@/services/driveAllocationService";

interface AllocatedRecordsTableProps {
  records: DriveRecordItem[];
  total: number;
  page: number;
  limit: number;
  search: string;
  onSearchChange: (search: string) => void;
  files?: DiscoveredDriveFile[];
  selectedFileFilter?: string;
  onFileFilterChange?: (fileId: string) => void;
  selectedManagerFilter: string;
  onManagerFilterChange: (managerId: string) => void;
  selectedEmployeeFilter: string;
  onEmployeeFilterChange: (employeeId: string) => void;
  onPageChange: (page: number) => void;
  loading: boolean;
  hierarchy: HierarchyResponse | null;
  onReturnRecords: (recordIds: string[]) => void;
  onOpenReassignModal: (recordIds: string[]) => void;
}

export default function AllocatedRecordsTable({
  records,
  total,
  page,
  limit,
  search,
  onSearchChange,
  files = [],
  selectedFileFilter = "",
  onFileFilterChange = () => {},
  selectedManagerFilter,
  onManagerFilterChange,
  selectedEmployeeFilter,
  onEmployeeFilterChange,
  onPageChange,
  loading,
  hierarchy,
  onReturnRecords,
  onOpenReassignModal,
}: AllocatedRecordsTableProps) {
  const [viewMode, setViewMode] = useState<"batch" | "individual">("batch");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedBatchKey, setExpandedBatchKey] = useState<string | null>(null);

  const totalPages = Math.ceil(total / limit) || 1;

  // Group records by File + Employee (File / Batch View)
  const batches = useMemo(() => {
    const map = new Map<
      string,
      {
        key: string;
        sourceFileId: string;
        sourceFileName: string;
        folderPath: string;
        assignedManagerId?: string;
        assignedManagerName: string;
        assignedEmployeeId?: string;
        assignedEmployeeName: string;
        allocatedAt?: string;
        allocationDocIds: Set<string>;
        records: DriveRecordItem[];
      }
    >();

    records.forEach((r) => {
      const key = `${r.sourceFileId}_${r.assignedEmployeeId || "unassigned"}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          sourceFileId: r.sourceFileId,
          sourceFileName: r.sourceFileName,
          folderPath: r.folderPath,
          assignedManagerId: r.assignedManagerId,
          assignedManagerName: r.assignedManagerName || "Manager",
          assignedEmployeeId: r.assignedEmployeeId,
          assignedEmployeeName: r.assignedEmployeeName || "Employee",
          allocatedAt: r.allocatedAt,
          allocationDocIds: new Set<string>(),
          records: [],
        });
      }
      if (r.allocationDocId) {
        map.get(key)!.allocationDocIds.add(r.allocationDocId);
      }
      map.get(key)!.records.push(r);
    });

    return Array.from(map.values());
  }, [records]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(records.map((r) => r._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isAllSelected =
    records.length > 0 && selectedIds.length === records.length;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-5 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gray-50/40">
        <div>
          <div className="flex items-center gap-3">
            <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
              Allocated Data Records
              <span className="rounded-full bg-purple-100 text-purple-800 px-2.5 py-0.5 text-xs font-bold">
                {total.toLocaleString()} leads active
              </span>
            </h4>

            {total > 0 && (
              <button
                onClick={() => {
                  const allDocIds = Array.from(
                    new Set(
                      records
                        .map((r) => r.allocationDocId || r._id)
                        .filter(Boolean)
                    )
                  );
                  if (allDocIds.length > 0) {
                    onReturnRecords(allDocIds);
                  }
                }}
                className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-1.5 text-xs font-bold shadow-sm transition active:scale-95"
                title={`Return all ${total.toLocaleString()} leads back to source file(s) in 1 click`}
              >
                <Undo2 size={13} /> Return All ({total.toLocaleString()} Leads)
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            File-wise batch view me 1-click se pura data return ya reassign kar sakte hain.
          </p>
        </div>

        {/* View Mode Switcher + Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle */}
          <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
            <button
              onClick={() => setViewMode("batch")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === "batch"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Layers size={13} /> File Batch View
            </button>
            <button
              onClick={() => setViewMode("individual")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === "individual"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <ListFilter size={13} /> Row by Row
            </button>
          </div>

          {/* Source File Filter */}
          <select
            value={selectedFileFilter}
            onChange={(e) => onFileFilterChange(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm focus:outline-none"
          >
            <option value="">📁 All Source Files ({files.length})</option>
            {files.map((f) => (
              <option key={f.fileId} value={f.fileId}>
                📄 {f.fileName} ({f.folderPath || "Root"})
              </option>
            ))}
          </select>

          {/* Manager Filter */}
          <select
            value={selectedManagerFilter}
            onChange={(e) => onManagerFilterChange(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm focus:outline-none"
          >
            <option value="">All Managers</option>
            {hierarchy?.managers.map((m) => (
              <option key={m._id} value={m._id}>
                {m.fullName}
              </option>
            ))}
          </select>

          {/* Employee Filter */}
          <select
            value={selectedEmployeeFilter}
            onChange={(e) => onEmployeeFilterChange(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm focus:outline-none"
          >
            <option value="">All Employees</option>
            {hierarchy?.allEmployees.map((e) => (
              <option key={e._id} value={e._id}>
                {e.fullName}
              </option>
            ))}
          </select>

          {/* Search Box */}
          <div className="relative w-full sm:w-48">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white pl-8 pr-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:border-purple-500 focus:outline-none shadow-sm"
            />
          </div>

          {/* Bulk Actions when rows selected */}
          {selectedIds.length > 0 && viewMode === "individual" && (
            <div className="flex items-center gap-2 animate-in fade-in">
              <button
                onClick={() => onReturnRecords(selectedIds)}
                className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-600 transition active:scale-95"
              >
                <Undo2 size={13} /> Return ({selectedIds.length})
              </button>
              <button
                onClick={() => onOpenReassignModal(selectedIds)}
                className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-purple-700 transition active:scale-95"
              >
                <UserCog size={13} /> Reassign ({selectedIds.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. FILE / BATCH SUMMARY VIEW (User Requested)            */}
      {/* ======================================================== */}
      {viewMode === "batch" && (
        <div className="p-5 space-y-4">
          {loading ? (
            <div className="p-12 text-center text-xs text-gray-500">
              <div className="flex items-center justify-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
                Loading allocated file batches...
              </div>
            </div>
          ) : batches.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-400">
              <Layers size={36} className="mx-auto text-gray-300 mb-2" />
              <p className="font-semibold text-gray-700">
                Koi allocated batch nahi mila
              </p>
              <p className="text-gray-400 mt-0.5">
                Available Data Pool se data allocate kijiye, wo yahan file-wise batch me show hoga.
              </p>
            </div>
          ) : (
            batches.map((batch) => {
              const isExpanded = expandedBatchKey === batch.key;
              const batchRecordIds = batch.records.map((r) => r._id);

              return (
                <div
                  key={batch.key}
                  className="rounded-2xl border border-gray-200 bg-white hover:border-purple-200 shadow-sm transition overflow-hidden"
                >
                  {/* Batch Card Header */}
                  <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-50/50 via-white to-blue-50/30">
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-700 shrink-0 border border-purple-200">
                        <FileSpreadsheet size={22} />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-gray-900 text-sm">
                            {batch.sourceFileName}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                            <FolderOpen size={10} className="text-amber-500" />
                            {batch.folderPath || "Root"}
                          </span>
                          <span className="rounded-full bg-purple-600 text-white px-2.5 py-0.5 text-[11px] font-bold">
                            {batch.records.length.toLocaleString()} Leads
                          </span>
                        </div>

                        {/* Assignment Details */}
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-600">
                          <span className="flex items-center gap-1 font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            <Briefcase size={12} className="text-blue-600" />
                            Manager: {batch.assignedManagerName}
                          </span>
                          <span className="flex items-center gap-1 font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                            <User size={12} className="text-purple-600" />
                            Employee: {batch.assignedEmployeeName}
                          </span>
                          {batch.records.find((r) => r.notionPageTitle)?.notionPageTitle && (
                            <span className="flex items-center gap-1 font-semibold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                              📄 {batch.records.find((r) => r.notionPageTitle)?.notionPageTitle}
                            </span>
                          )}
                          {batch.allocatedAt && (
                            <span className="text-[11px] text-gray-400 flex items-center gap-1">
                              <Calendar size={11} />
                              {new Date(batch.allocatedAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Batch 1-Click Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* 1-Click Return All */}
                      <button
                        onClick={() => {
                          const docIds = Array.from(batch.allocationDocIds);
                          const ids = docIds.length > 0 ? docIds : batchRecordIds;
                          onReturnRecords(ids);
                        }}
                        className="flex items-center gap-1.5 rounded-xl bg-amber-50 hover:bg-amber-500 hover:text-white text-amber-800 border border-amber-200 px-3 py-2 text-xs font-bold transition active:scale-95"
                        title={`Return all ${batch.records.length} leads back to ${batch.sourceFileName}`}
                      >
                        <Undo2 size={14} /> Return Batch ({batch.records.length})
                      </button>

                      {/* 1-Click Reassign All */}
                      <button
                        onClick={() => onOpenReassignModal(batchRecordIds)}
                        className="flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-2 text-xs font-bold shadow-sm transition active:scale-95"
                        title={`Reassign all ${batch.records.length} leads to another employee`}
                      >
                        <UserCog size={14} /> Reassign Batch
                      </button>

                      {/* Toggle Expand Details */}
                      <button
                        onClick={() =>
                          setExpandedBatchKey(isExpanded ? null : batch.key)
                        }
                        className="rounded-xl border border-gray-200 bg-white hover:bg-gray-50 px-2.5 py-2 text-gray-600 text-xs font-semibold flex items-center gap-1"
                        title="View individual leads inside this batch"
                      >
                        <ChevronDown
                          size={14}
                          className={`transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                        {isExpanded ? "Hide" : "Inspect"}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Accordion: Inner Leads List */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50/50 p-4">
                      <div className="text-xs font-bold text-gray-600 mb-2 flex items-center justify-between">
                        <span>Leads inside this batch ({batch.records.length})</span>
                      </div>
                      <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
                        {batch.records.slice(0, 100).map((r, i) => (
                          <div
                            key={r._id}
                            className="p-2.5 px-3 flex items-center justify-between text-xs hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className="text-gray-400 font-mono text-[11px] w-5">
                                {i + 1}.
                              </span>
                              <span className="font-semibold text-gray-900">
                                {r.customerName}
                              </span>
                              <span className="text-gray-500 font-mono flex items-center gap-1">
                                <Phone size={11} className="text-gray-400" />
                                {r.phone || "--"}
                              </span>
                              <span className="text-gray-400 text-[11px]">
                                {r.branch || r.state || ""}
                              </span>
                              {r.disposition && (
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    ["Interested", "Login", "Follow up"].includes(r.disposition)
                                      ? "bg-emerald-100 text-emerald-800"
                                      : ["Not interested", "Switch off", "Call cut", "Wrong number"].includes(r.disposition)
                                      ? "bg-rose-100 text-rose-800"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  {r.disposition}
                                </span>
                              )}
                              {r.callingRemark && (
                                <span className="text-[11px] font-medium text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 truncate max-w-xs" title={r.callingRemark}>
                                  Remark: &ldquo;{r.callingRemark}&rdquo;
                                </span>
                              )}
                            </div>
                            <span className="text-emerald-700 font-semibold text-[11px] shrink-0 ml-2">
                              ₹{Number(r.eligibilityAmount || 0).toLocaleString("en-IN")}
                            </span>
                          </div>
                        ))}
                      </div>
                      {batch.records.length > 100 && (
                        <p className="text-[11px] text-gray-400 mt-1.5 text-center">
                          Showing first 100 of {batch.records.length} leads in this preview.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. ROW BY ROW DETAILED TABLE VIEW                        */}
      {/* ======================================================== */}
      {viewMode === "individual" && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50/80 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
              <tr>
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                </th>
                <th className="p-4">Customer</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Source File</th>
                <th className="p-4">Assigned Manager</th>
                <th className="p-4">Assigned Employee</th>
                <th className="p-4">Allocated Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-xs text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
                      Loading allocated data...
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-xs text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <UserCog size={32} className="text-gray-300" />
                      <p className="font-semibold text-gray-600">
                        No allocated records found
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                records.map((r) => {
                  const isChecked = selectedIds.includes(r._id);
                  return (
                    <tr
                      key={r._id}
                      className={`hover:bg-purple-50/40 transition ${
                        isChecked ? "bg-purple-50/60" : ""
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectOne(r._id)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-gray-900">
                          {r.customerName || "Customer"}
                        </div>
                        <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <Building size={11} /> {r.branch || r.state || "--"}
                        </div>
                      </td>
                      <td className="p-4 font-mono text-gray-700">
                        <span className="flex items-center gap-1.5">
                          <Phone size={12} className="text-gray-400" />
                          {r.phone || "--"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div>
                          <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 border border-blue-200 px-2 py-0.5 text-[11px] font-bold text-blue-800">
                            <FileSpreadsheet size={12} className="text-blue-600" />
                            {r.sourceFileName}
                          </span>
                          <span className="text-[10px] text-gray-400 block truncate mt-0.5">
                            📁 {r.folderPath || "Root"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-blue-900 bg-blue-50/80 px-2.5 py-1 rounded-lg border border-blue-100">
                          <Briefcase size={12} className="text-blue-600" />
                          {r.assignedManagerName || "Manager"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 font-bold text-purple-900 bg-purple-50/80 px-2.5 py-1 rounded-lg border border-purple-100">
                          <User size={12} className="text-purple-600" />
                          {r.assignedEmployeeName || "Employee"}
                        </span>
                        {r.notionPageTitle && (
                          <span className="text-[10px] text-indigo-600 block truncate mt-1 font-semibold">
                            📄 {r.notionPageTitle}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-gray-500">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Calendar size={12} className="text-gray-400" />
                          {r.allocatedAt
                            ? new Date(r.allocatedAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : "--"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => onReturnRecords([r._id])}
                            className="rounded-lg bg-amber-50 hover:bg-amber-500 hover:text-white text-amber-700 border border-amber-200 px-2.5 py-1 text-xs font-semibold transition active:scale-95"
                          >
                            Return
                          </button>
                          <button
                            onClick={() => onOpenReassignModal([r._id])}
                            className="rounded-lg bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-700 border border-purple-200 px-2.5 py-1 text-xs font-semibold transition active:scale-95"
                          >
                            Reassign
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      <div className="p-4 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-gray-500 bg-gray-50/30">
        <div>
          Showing{" "}
          <strong className="text-gray-800">
            {records.length > 0 ? (page - 1) * limit + 1 : 0}
          </strong>{" "}
          to{" "}
          <strong className="text-gray-800">
            {Math.min(page * limit, total)}
          </strong>{" "}
          of <strong className="text-gray-800">{total}</strong> allocated records
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || loading}
            className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            <ChevronLeft size={14} /> Previous
          </button>
          <span className="px-2 font-bold text-gray-800">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || loading}
            className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
