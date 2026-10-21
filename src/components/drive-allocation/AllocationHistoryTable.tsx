"use client";

import React, { useState } from "react";
import {
  Search,
  UserCheck,
  Undo2,
  ArrowRightLeft,
  Calendar,
  User,
  Building,
  FileSpreadsheet,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Phone,
  Layers,
  Filter,
} from "lucide-react";
import {
  AllocationHistoryItem,
  HierarchyResponse,
  DiscoveredDriveFile,
} from "@/services/driveAllocationService";

interface AllocationHistoryTableProps {
  logs: AllocationHistoryItem[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  search: string;
  onSearchChange: (search: string) => void;
  selectedAction: string;
  onActionChange: (action: string) => void;
  selectedFileFilter: string;
  onFileFilterChange: (fileId: string) => void;
  selectedEmployeeFilter: string;
  onEmployeeFilterChange: (employeeId: string) => void;
  onPageChange: (page: number) => void;
  stats?: Record<string, { count: number; leads: number }>;
  files?: DiscoveredDriveFile[];
  hierarchy?: HierarchyResponse | null;
}

export default function AllocationHistoryTable({
  logs,
  total,
  page,
  limit,
  loading,
  search,
  onSearchChange,
  selectedAction,
  onActionChange,
  selectedFileFilter,
  onFileFilterChange,
  selectedEmployeeFilter,
  onEmployeeFilterChange,
  onPageChange,
  stats,
  files = [],
  hierarchy,
}: AllocationHistoryTableProps) {
  const [selectedLogForDetails, setSelectedLogForDetails] =
    useState<AllocationHistoryItem | null>(null);

  const totalPages = Math.ceil(total / limit) || 1;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "ALLOCATED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <UserCheck size={13} />
            Allocated
          </span>
        );
      case "RETURNED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <Undo2 size={13} />
            Returned
          </span>
        );
      case "REASSIGNED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <ArrowRightLeft size={13} />
            Reassigned
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
            {action}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Top Summary Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
              Total Allocations
            </p>
            <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-200 mt-1">
              {(stats?.ALLOCATED?.leads || 0).toLocaleString()}{" "}
              <span className="text-xs font-normal text-emerald-600">
                leads ({stats?.ALLOCATED?.count || 0} batches)
              </span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
            <UserCheck size={20} />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-rose-700 dark:text-rose-400">
              Total Returned to Files
            </p>
            <p className="text-2xl font-bold text-rose-900 dark:text-rose-200 mt-1">
              {(stats?.RETURNED?.leads || 0).toLocaleString()}{" "}
              <span className="text-xs font-normal text-rose-600">
                leads ({stats?.RETURNED?.count || 0} returns)
              </span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center text-rose-700 dark:text-rose-300">
            <Undo2 size={20} />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
              Total Reassigned
            </p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-200 mt-1">
              {(stats?.REASSIGNED?.leads || 0).toLocaleString()}{" "}
              <span className="text-xs font-normal text-blue-600">
                leads ({stats?.REASSIGNED?.count || 0} times)
              </span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center text-blue-700 dark:text-blue-300">
            <ArrowRightLeft size={20} />
          </div>
        </div>
      </div>

      {/* ── Filters Bar ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Action Tabs / Pill Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-700/60 rounded-lg text-xs font-medium w-full md:w-auto">
            <button
              onClick={() => onActionChange("ALL")}
              className={`px-3 py-1.5 rounded-md transition ${
                selectedAction === "ALL"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm font-semibold"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
              }`}
            >
              All Actions
            </button>
            <button
              onClick={() => onActionChange("ALLOCATED")}
              className={`px-3 py-1.5 rounded-md transition ${
                selectedAction === "ALLOCATED"
                  ? "bg-emerald-600 text-white shadow-sm font-semibold"
                  : "text-gray-600 dark:text-gray-400 hover:text-emerald-600"
              }`}
            >
              Allocated
            </button>
            <button
              onClick={() => onActionChange("RETURNED")}
              className={`px-3 py-1.5 rounded-md transition ${
                selectedAction === "RETURNED"
                  ? "bg-rose-600 text-white shadow-sm font-semibold"
                  : "text-gray-600 dark:text-gray-400 hover:text-rose-600"
              }`}
            >
              Returned
            </button>
            <button
              onClick={() => onActionChange("REASSIGNED")}
              className={`px-3 py-1.5 rounded-md transition ${
                selectedAction === "REASSIGNED"
                  ? "bg-blue-600 text-white shadow-sm font-semibold"
                  : "text-gray-600 dark:text-gray-400 hover:text-blue-600"
              }`}
            >
              Reassigned
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search user, file, remark, lead..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Dropdown Filters: File & Employee */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-700/50 text-xs">
          <span className="text-gray-500 flex items-center gap-1 font-medium">
            <Filter size={13} /> Filter By:
          </span>

          {/* File Filter */}
          <select
            value={selectedFileFilter}
            onChange={(e) => onFileFilterChange(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="">All Source Files</option>
            {files.map((f) => (
              <option key={f.fileId} value={f.fileId}>
                {f.fileName}
              </option>
            ))}
          </select>

          {/* Employee Filter */}
          {hierarchy && (
            <select
              value={selectedEmployeeFilter}
              onChange={(e) => onEmployeeFilterChange(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="">All Users / Employees</option>
              {hierarchy.allEmployees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.fullName} ({emp.role})
                </option>
              ))}
            </select>
          )}

          {(selectedFileFilter || selectedEmployeeFilter || search || selectedAction !== "ALL") && (
            <button
              onClick={() => {
                onFileFilterChange("");
                onEmployeeFilterChange("");
                onSearchChange("");
                onActionChange("ALL");
              }}
              className="text-xs text-purple-600 hover:text-purple-700 font-semibold underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-750 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Source File</th>
                <th className="py-3 px-4">User / Allocation Details</th>
                <th className="py-3 px-4 text-center">Leads Count</th>
                <th className="py-3 px-4">Performed By</th>
                <th className="py-3 px-4">Remarks / Reason</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                      Loading permanent audit history...
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-12 text-center text-gray-400 dark:text-gray-500"
                  >
                    <ShieldCheck size={36} className="mx-auto mb-2 text-gray-300" />
                    No allocation history records found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log._id}
                    className="hover:bg-gray-50/60 dark:hover:bg-gray-700/30 transition"
                  >
                    {/* Timestamp */}
                    <td className="py-3 px-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-gray-400" />
                        <span>{formatDate(log.createdAt)}</span>
                      </div>
                    </td>

                    {/* Action Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>

                    {/* Source File */}
                    <td className="py-3 px-4 text-gray-800 dark:text-gray-200 font-medium">
                      <div className="flex items-center gap-1.5">
                        <FileSpreadsheet
                          size={14}
                          className="text-emerald-600 flex-shrink-0"
                        />
                        <span className="truncate max-w-[180px]" title={log.sourceFileName}>
                          {log.sourceFileName}
                        </span>
                      </div>
                    </td>

                    {/* User / Allocation Details */}
                    <td className="py-3 px-4">
                      {log.action === "ALLOCATED" && (
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">
                            {log.toEmployeeName || "Unknown Employee"}
                          </div>
                          {log.toManagerName && (
                            <div className="text-[11px] text-gray-500">
                              Manager: {log.toManagerName}
                            </div>
                          )}
                          {log.targetSheetTitle && (
                            <div className="text-[10px] text-purple-600 dark:text-purple-400 mt-0.5">
                              Sheet: {log.targetSheetTitle}
                            </div>
                          )}
                        </div>
                      )}

                      {log.action === "RETURNED" && (
                        <div>
                          <div className="font-semibold text-rose-700 dark:text-rose-400">
                            Returned from: {log.fromEmployeeName || "Employee"}
                          </div>
                          {log.fromManagerName && (
                            <div className="text-[11px] text-gray-500">
                              Manager: {log.fromManagerName}
                            </div>
                          )}
                        </div>
                      )}

                      {log.action === "REASSIGNED" && (
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1">
                            <span>{log.fromEmployeeName || "Prev"}</span>
                            <ArrowRightLeft size={11} className="text-blue-500" />
                            <span className="text-blue-700 dark:text-blue-400">
                              {log.toEmployeeName}
                            </span>
                          </div>
                          {log.toManagerName && (
                            <div className="text-[11px] text-gray-500">
                              New Manager: {log.toManagerName}
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Count */}
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600">
                        {log.count.toLocaleString()}
                      </span>
                    </td>

                    {/* Performed By */}
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <User size={12} className="text-gray-400" />
                        <span>{log.performedBy || "Admin"}</span>
                      </div>
                    </td>

                    {/* Remarks / Reason & Dispositions Breakdown */}
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400 max-w-[220px]">
                      {log.remarks && (
                        <div className="font-medium text-gray-800 dark:text-gray-200 truncate" title={log.remarks}>
                          {log.remarks}
                        </div>
                      )}
                      {log.dispositionSummary && Object.keys(log.dispositionSummary).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(log.dispositionSummary).map(([disp, count]) => {
                            if (!disp || (disp === "Pending" && count === 0)) return null;
                            const isPos = ["Interested", "Login", "Follow up"].includes(disp);
                            const isNeg = ["Not interested", "Switch off", "Call cut", "Wrong number"].includes(disp);
                            return (
                              <span
                                key={disp}
                                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                  isPos
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : isNeg
                                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {disp}: {count}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </td>

                    {/* View Leads Details Button */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => setSelectedLogForDetails(log)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:text-purple-300 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800 transition"
                      >
                        <Eye size={12} />
                        View Leads & Remarks
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 text-xs text-gray-500 gap-2">
          <span>
            Showing{" "}
            <strong>
              {total === 0 ? 0 : (page - 1) * limit + 1} -{" "}
              {Math.min(page * limit, total)}
            </strong>{" "}
            of <strong>{total}</strong> history records
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page <= 1 || loading}
              className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="px-2 font-medium text-gray-700 dark:text-gray-300">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages || loading}
              className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Leads Details Modal ── */}
      {selectedLogForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-purple-50/50 to-indigo-50/50 dark:from-gray-800 dark:to-gray-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">
                    Allocation Leads & Remarks Snapshot
                  </h3>
                  {getActionBadge(selectedLogForDetails.action)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  File: <strong>{selectedLogForDetails.sourceFileName}</strong> | Total:{" "}
                  <strong>{selectedLogForDetails.count} leads</strong> | Date:{" "}
                  {formatDate(selectedLogForDetails.createdAt)}
                </p>
                {selectedLogForDetails.remarks && (
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-0.5">
                    Batch Note: &ldquo;{selectedLogForDetails.remarks}&rdquo;
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedLogForDetails(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body / Table */}
            <div className="p-4 overflow-y-auto flex-1">
              {(!selectedLogForDetails.recordsSummary ||
                selectedLogForDetails.recordsSummary.length === 0) ? (
                <p className="text-center py-8 text-xs text-gray-500">
                  Detailed individual records snapshot was not stored for this entry.
                </p>
              ) : (
                <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-750 text-gray-600 dark:text-gray-300 font-semibold border-b border-gray-200 dark:border-gray-700">
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Customer Name</th>
                        <th className="py-2.5 px-3">Phone</th>
                        <th className="py-2.5 px-3">Branch & State</th>
                        <th className="py-2.5 px-3 text-right">Eligibility</th>
                        <th className="py-2.5 px-3">Calling Disposition</th>
                        <th className="py-2.5 px-3">User Calling Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {selectedLogForDetails.recordsSummary.map((r, i) => (
                        <tr
                          key={i}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
                        >
                          <td className="py-2 px-3 text-gray-400">{i + 1}</td>
                          <td className="py-2 px-3 font-medium text-gray-900 dark:text-gray-100">
                            {r.customerName || "Lead"}
                          </td>
                          <td className="py-2 px-3 text-gray-600 dark:text-gray-300">
                            <span className="font-mono">{r.phone || "-"}</span>
                          </td>
                          <td className="py-2 px-3 text-gray-600 dark:text-gray-400">
                            {[r.branch, r.state].filter(Boolean).join(", ") || "-"}
                          </td>
                          <td className="py-2 px-3 text-right font-medium text-emerald-600 dark:text-emerald-400">
                            {r.eligibilityAmount
                              ? `₹${r.eligibilityAmount.toLocaleString()}`
                              : "-"}
                          </td>
                          <td className="py-2 px-3">
                            {r.disposition ? (
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  ["Interested", "Login", "Follow up"].includes(r.disposition)
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                    : ["Not interested", "Switch off", "Call cut", "Wrong number"].includes(r.disposition)
                                    ? "bg-rose-100 text-rose-800 border border-rose-200"
                                    : "bg-amber-100 text-amber-800 border border-amber-200"
                                }`}
                              >
                                {r.disposition}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-[11px]">Pending</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-gray-700 dark:text-gray-300 max-w-[260px]">
                            {r.remarks ? (
                              <span className="font-medium text-purple-900 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-2 py-1 rounded border border-purple-100 dark:border-purple-800 text-[11px] block whitespace-pre-wrap">
                                {r.remarks}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-[11px]">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-gray-100 dark:border-gray-700 flex justify-end bg-gray-50 dark:bg-gray-750">
              <button
                onClick={() => setSelectedLogForDetails(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
