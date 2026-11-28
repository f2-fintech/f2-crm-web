"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

import PermissionModal from "@/components/permissions/PermissionModal";
import DeletePermissionModal from "@/components/permissions/DeletePermissionModal";

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  KeyRound,
  Shield,
  Layers,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
} from "lucide-react";

interface IPermission {
  _id: string;
  module: string;
  action: string;
  key: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PermissionResponse {
  success: boolean;
  data: IPermission[];
  total?: number;
}

const moduleBadges: Record<string, { bg: string; text: string; border: string }> = {
  LEADS: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200/80" },
  USERS: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200/80" },
  ROLES: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200/80" },
  PERMISSIONS: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200/80" },
  REPORTS: { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200/80" },
  SETTINGS: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" },
};

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<IPermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [total, setTotal] = useState(0);

  const [openPermissionModal, setOpenPermissionModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selectedPermission, setSelectedPermission] = useState<IPermission | null>(null);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get<PermissionResponse>("/permissions", {
        params: {
          page,
          limit,
          search,
          module: moduleFilter,
          isActive: statusFilter,
        },
      });

      const parsed = Array.isArray(data) ? data : data.data || [];
      setPermissions(parsed);
      setTotal(data.total || parsed.length || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [page, search, moduleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const activeCount = permissions.filter((item) => item.isActive).length;
  const inactiveCount = permissions.filter((item) => !item.isActive).length;

  const availableModules = Array.from(
    new Set(permissions.map((p) => p.module).filter(Boolean))
  ).sort();

  const handleCreate = () => {
    setMode("create");
    setSelectedPermission(null);
    setOpenPermissionModal(true);
  };

  const handleEdit = (permission: IPermission) => {
    setMode("edit");
    setSelectedPermission(permission);
    setOpenPermissionModal(true);
  };

  const handleDelete = (permission: IPermission) => {
    setSelectedPermission(permission);
    setOpenDeleteModal(true);
  };

  const closePermissionModal = () => {
    setOpenPermissionModal(false);
    setSelectedPermission(null);
  };

  const closeDeleteModal = () => {
    setOpenDeleteModal(false);
    setSelectedPermission(null);
  };

  return (
    <div className="space-y-6 max-w-[1700px] mx-auto min-h-screen">
      {/* Top Header */}
      <div className="bg-white/95 backdrop-blur-md p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-100 flex items-center justify-center shrink-0">
            <KeyRound size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                System Permissions
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200/80 text-purple-700 text-[11px] font-bold">
                Access Control Registry
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Configure granular CRUD privileges and operational security gates across modules
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={fetchPermissions}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition active:scale-95 disabled:opacity-60 cursor-pointer"
            title="Refresh Permissions"
          >
            <RotateCcw size={14} className={loading ? "animate-spin text-purple-600" : "text-slate-500"} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleCreate}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs shadow-indigo-100 transition hover:bg-indigo-700 active:scale-95 cursor-pointer"
          >
            <Plus size={16} />
            <span>Create Permission</span>
          </button>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4 transition hover:border-purple-200 hover:shadow-sm">
          <div className="p-3.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100/60 shrink-0">
            <KeyRound size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Permissions
            </span>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5 tracking-tight">
              {total || permissions.length}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4 transition hover:border-emerald-200 hover:shadow-sm">
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/60 shrink-0">
            <CheckCircle2 size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Active Controls
            </span>
            <p className="text-2xl font-extrabold text-emerald-600 mt-0.5 tracking-tight">
              {activeCount}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4 transition hover:border-rose-200 hover:shadow-sm">
          <div className="p-3.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100/60 shrink-0">
            <XCircle size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Disabled Controls
            </span>
            <p className="text-2xl font-extrabold text-rose-600 mt-0.5 tracking-tight">
              {inactiveCount}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4 transition hover:border-indigo-200 hover:shadow-sm">
          <div className="p-3.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100/60 shrink-0">
            <Layers size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Protected Modules
            </span>
            <p className="text-2xl font-extrabold text-indigo-600 mt-0.5 tracking-tight">
              {availableModules.length}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search key, module or action..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9.5 pr-4 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition shadow-2xs"
            />
          </div>

          {/* Module Filter */}
          <div className="sm:w-48">
            <select
              value={moduleFilter}
              onChange={(e) => {
                setModuleFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none transition shadow-2xs cursor-pointer"
            >
              <option value="">All Modules</option>
              {availableModules.map((mod) => (
                <option key={mod} value={mod}>
                  {mod}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown Filter */}
          <div className="sm:w-44">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none transition shadow-2xs cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Clear Filters (if active) */}
        {(search || moduleFilter || statusFilter) && (
          <button
            onClick={() => {
              setSearch("");
              setModuleFilter("");
              setStatusFilter("");
              setPage(1);
            }}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 px-3 py-2 rounded-lg hover:bg-rose-50 transition cursor-pointer self-start sm:self-center"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Main Permissions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-left text-xs text-slate-700 whitespace-nowrap">
            <thead className="bg-[#0b1b36] text-slate-200 text-[11px] font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-4 px-5 text-left">Module</th>
                <th className="py-4 px-4 text-left">Permission Key</th>
                <th className="py-4 px-4 text-left">Action</th>
                <th className="py-4 px-4 text-left">Description</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-16 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2.5">
                      <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <span className="font-semibold text-slate-600">Loading system permissions...</span>
                    </div>
                  </td>
                </tr>
              ) : permissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-16 text-center text-slate-400">
                    <div className="max-w-xs mx-auto">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3 text-slate-300 border border-slate-100">
                        <KeyRound size={28} />
                      </div>
                      <p className="font-bold text-slate-800 text-sm">
                        No Permissions Found
                      </p>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {search || moduleFilter || statusFilter
                          ? "No permissions match your current filters."
                          : "Define your first system permission to enforce RBAC."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                permissions.map((perm) => {
                  const upperMod = (perm.module || "").toUpperCase();
                  const modBadge = moduleBadges[upperMod] || {
                    bg: "bg-slate-50",
                    text: "text-slate-700",
                    border: "border-slate-200",
                  };

                  return (
                    <tr
                      key={perm._id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Module Badge */}
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${modBadge.bg} ${modBadge.text} ${modBadge.border}`}
                        >
                          <Layers size={12} />
                          <span>{perm.module}</span>
                        </span>
                      </td>

                      {/* Permission Key */}
                      <td className="py-3.5 px-4 font-mono">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200">
                          {perm.key}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-700 capitalize">
                          {perm.action}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <p className="text-xs text-slate-500 font-medium truncate" title={perm.description || ""}>
                          {perm.description || <span className="text-slate-300 italic">No description</span>}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border shadow-2xs ${
                            perm.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              perm.isActive ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                          <span>{perm.isActive ? "Active" : "Inactive"}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEdit(perm)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition shadow-2xs cursor-pointer"
                            title="Edit Permission"
                          >
                            <Pencil size={14} />
                          </button>

                          <button
                            onClick={() => handleDelete(perm)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition shadow-2xs cursor-pointer"
                            title="Delete Permission"
                          >
                            <Trash2 size={14} />
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

        {/* Footer with Pagination */}
        {!loading && permissions.length > 0 && (
          <div className="bg-slate-50/90 p-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 font-medium">
            <p>
              Showing{" "}
              <strong className="text-slate-900 font-bold">
                {permissions.length === 0 ? 0 : (page - 1) * limit + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-slate-900 font-bold">
                {Math.min(page * limit, total || permissions.length)}
              </strong>{" "}
              of{" "}
              <strong className="text-slate-900 font-bold">
                {total || permissions.length}
              </strong>{" "}
              permissions
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(1)}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                  title="First Page"
                >
                  <ChevronsLeft size={15} />
                </button>

                <button
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <ChevronLeft size={14} />
                  <span>Prev</span>
                </button>

                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => {
                      if (p === 1 || p === totalPages) return true;
                      if (Math.abs(p - page) <= 1) return true;
                      return false;
                    })
                    .reduce<(number | string)[]>((acc, p, idx, arr) => {
                      if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                        acc.push("...");
                      }
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      typeof item === "string" ? (
                        <span key={`dots-${idx}`} className="px-1 text-slate-400 font-bold">
                          ...
                        </span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => setPage(item as number)}
                          className={`min-w-[30px] h-7 px-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                            item === page
                              ? "bg-indigo-600 text-white shadow-xs shadow-indigo-100"
                              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}
                </div>

                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>

                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(totalPages)}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                  title="Last Page"
                >
                  <ChevronsRight size={15} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Permission Modal */}
      <PermissionModal
        open={openPermissionModal}
        mode={mode}
        permission={selectedPermission}
        onClose={closePermissionModal}
        onSuccess={fetchPermissions}
      />

      {/* Delete Confirmation Modal */}
      <DeletePermissionModal
        open={openDeleteModal}
        permission={selectedPermission}
        onClose={closeDeleteModal}
        onSuccess={fetchPermissions}
      />
    </div>
  );
}
