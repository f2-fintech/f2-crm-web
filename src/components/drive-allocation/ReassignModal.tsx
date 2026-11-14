"use client";

import React, { useState, useEffect } from "react";
import {
  UserCog,
  Briefcase,
  Users,
  X,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  HierarchyResponse,
  EmployeeInfo,
} from "@/services/driveAllocationService";

interface ReassignModalProps {
  open: boolean;
  onClose: () => void;
  hierarchy: HierarchyResponse | null;
  selectedCount: number;
  onConfirm: (payload: {
    managerId: string;
    employeeId: string;
    remarks?: string;
  }) => Promise<void>;
  loading: boolean;
}

export default function ReassignModal({
  open,
  onClose,
  hierarchy,
  selectedCount,
  onConfirm,
  loading,
}: ReassignModalProps) {
  const [managerId, setManagerId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeInfo[]>([]);

  useEffect(() => {
    if (open) {
      setManagerId("");
      setEmployeeId("");
      setRemarks("");
      setError("");
      setFilteredEmployees([]);
    }
  }, [open]);

  const handleManagerChange = (mId: string) => {
    setManagerId(mId);
    setEmployeeId("");
    setError("");

    if (!mId) {
      setFilteredEmployees([]);
      return;
    }

    const currentMgr = hierarchy?.managers.find((m) => m._id === mId);
    if (currentMgr && currentMgr.employees && currentMgr.employees.length > 0) {
      setFilteredEmployees(currentMgr.employees);
    } else {
      setFilteredEmployees(hierarchy?.allEmployees || []);
    }
  };

  const handleReassign = async () => {
    if (!managerId) {
      setError("Please select the new Manager.");
      return;
    }
    if (!employeeId) {
      setError("Please select the new Employee.");
      return;
    }

    setError("");
    await onConfirm({ managerId, employeeId, remarks });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 border border-purple-100">
              <UserCog size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Reassign Lead Data
              </h3>
              <p className="text-xs text-gray-500">
                Change assigned Manager and Employee for {selectedCount} record(s)
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

        {error && (
          <div className="my-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4 my-4">
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <Briefcase size={14} className="text-blue-600" />
              New Manager *
            </label>
            <select
              value={managerId}
              onChange={(e) => handleManagerChange(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-800 shadow-sm focus:border-purple-500 focus:outline-none"
            >
              <option value="">-- Choose New Manager --</option>
              {hierarchy?.managers.map((mgr) => (
                <option key={mgr._id} value={mgr._id}>
                  {mgr.fullName} ({mgr.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <Users size={14} className="text-purple-600" />
              New Employee *
            </label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              disabled={!managerId}
              className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-800 shadow-sm focus:border-purple-500 focus:outline-none disabled:bg-gray-100"
            >
              <option value="">
                {!managerId
                  ? "-- Pehle Manager Select Kijiye --"
                  : "-- Choose New Employee --"}
              </option>
              {filteredEmployees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.fullName} ({emp.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 block">
              Reason / Reassignment Remarks
            </label>
            <input
              type="text"
              placeholder="e.g. Employee on leave, workload rebalance"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-xs text-gray-800 shadow-sm focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

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
            onClick={handleReassign}
            disabled={loading || !managerId || !employeeId}
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-purple-700 active:scale-95 disabled:opacity-50 transition"
          >
            <CheckCircle2 size={16} />
            {loading ? "Reassigning..." : `Confirm Reassign (${selectedCount})`}
          </button>
        </div>
      </div>
    </div>
  );
}
