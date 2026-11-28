"use client";

import { useEffect, useState, useMemo } from "react";
import api from "@/lib/axios";

import RoleModal from "@/components/roles/RoleModal";
import DeleteRoleModal from "@/components/roles/DeleteRoleModal";

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Shield,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  Layers,
  Lock,
  Unlock,
  Users,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface IRole {
  _id: string;
  name: string;
  displayName: string;
  description?: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface IRoleResponse {
  success: boolean;
  data: IRole[];
  total?: number;
}

const roleGradients: Record<string, { gradient: string; text: string; bg: string; border: string }> = {
  SUPER_ADMIN: {
    gradient: "from-rose-500 to-red-600",
    text: "text-rose-700 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/40",
    border: "border-rose-200/80 dark:border-rose-800/60",
  },
  ADMIN: {
    gradient: "from-purple-500 to-indigo-600",
    text: "text-purple-700 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/40",
    border: "border-purple-200/80 dark:border-purple-800/60",
  },
  MANAGER: {
    gradient: "from-indigo-500 to-blue-600",
    text: "text-indigo-700 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-950/40",
    border: "border-indigo-200/80 dark:border-indigo-800/60",
  },
  TEAM_LEADER: {
    gradient: "from-sky-500 to-cyan-600",
    text: "text-sky-700 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-950/40",
    border: "border-sky-200/80 dark:border-sky-800/60",
  },
  TL: {
    gradient: "from-sky-500 to-cyan-600",
    text: "text-sky-700 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-950/40",
    border: "border-sky-200/80 dark:border-sky-800/60",
  },
  EMPLOYEE: {
    gradient: "from-emerald-500 to-teal-600",
    text: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-200/80 dark:border-emerald-800/60",
  },
};

const getRoleStyling = (roleName: string) => {
  const normalized = (roleName || "").toUpperCase().replace(/\s+/g, "_");
  return (
    roleGradients[normalized] || {
      gradient: "from-slate-600 to-slate-800",
      text: "text-slate-700 dark:text-slate-300",
      bg: "bg-slate-50 dark:bg-slate-800/50",
      border: "border-slate-200 dark:border-slate-700",
    }
  );
};

export default function RolesPage() {
  const [roles, setRoles] = useState<IRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [total, setTotal] = useState(0);

  const [openRoleModal, setOpenRoleModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selectedRole, setSelectedRole] = useState<IRole | null>(null);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const { data } = await api.get<IRoleResponse>("/roles", {
        params: {
          page,
          limit,
          search,
          isActive: statusFilter,
        },
      });

      const parsedRoles = Array.isArray(data) ? data : data.data || [];
      setRoles(parsedRoles);
      setTotal(data.total || parsedRoles.length || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [page, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const activeRoles = roles.filter((r) => r.isActive).length;
  const inactiveRoles = roles.filter((r) => !r.isActive).length;
  const totalPermissionsCount = roles.reduce(
    (sum, role) => sum + (role.permissions?.length || 0),
    0
  );

  const handleCreate = () => {
    setMode("create");
    setSelectedRole(null);
    setOpenRoleModal(true);
  };

  const handleEdit = (role: IRole) => {
    setMode("edit");
    setSelectedRole(role);
    setOpenRoleModal(true);
  };

  const handleDelete = (role: IRole) => {
    setSelectedRole(role);
    setOpenDeleteModal(true);
  };

  const closeRoleModal = () => {
    setOpenRoleModal(false);
    setSelectedRole(null);
  };

  const closeDeleteModal = () => {
    setOpenDeleteModal(false);
    setSelectedRole(null);
  };

  return (
    <div className="space-y-6 max-w-[1700px] mx-auto min-h-screen">
      {/* Top Header */}
      <div className="bg-white/95 backdrop-blur-md p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-100 flex items-center justify-center shrink-0">
            <ShieldCheck size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Role & Access Management
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-[11px] font-bold">
                RBAC Security
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Configure system roles, granular permissions, and operational security boundaries
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={fetchRoles}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition active:scale-95 disabled:opacity-60 cursor-pointer"
            title="Refresh Roles"
          >
            <RotateCcw size={14} className={loading ? "animate-spin text-indigo-600" : "text-slate-500"} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleCreate}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs shadow-indigo-100 transition hover:bg-indigo-700 active:scale-95 cursor-pointer"
          >
            <Plus size={16} />
            <span>Create New Role</span>
          </button>
        </div>
      </div>

      {/* Modern Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4 transition hover:border-indigo-200 hover:shadow-sm">
          <div className="p-3.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100/60 shrink-0">
            <Shield size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Configured Roles
            </span>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5 tracking-tight">
              {total || roles.length}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4 transition hover:border-emerald-200 hover:shadow-sm">
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/60 shrink-0">
            <CheckCircle2 size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Active Roles
            </span>
            <p className="text-2xl font-extrabold text-emerald-600 mt-0.5 tracking-tight">
              {activeRoles}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4 transition hover:border-rose-200 hover:shadow-sm">
          <div className="p-3.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100/60 shrink-0">
            <XCircle size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Inactive Roles
            </span>
            <p className="text-2xl font-extrabold text-rose-600 mt-0.5 tracking-tight">
              {inactiveRoles}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4 transition hover:border-purple-200 hover:shadow-sm">
          <div className="p-3.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100/60 shrink-0">
            <KeyRound size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Assigned Permissions
            </span>
            <p className="text-2xl font-extrabold text-purple-600 mt-0.5 tracking-tight">
              {totalPermissionsCount}
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
              placeholder="Search by role title, system code or description..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9.5 pr-4 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition shadow-2xs"
            />
          </div>

          {/* Status Dropdown Filter */}
          <div className="sm:w-48">
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
        {(search || statusFilter) && (
          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("");
              setPage(1);
            }}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 px-3 py-2 rounded-lg hover:bg-rose-50 transition cursor-pointer self-start sm:self-center"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Main Roles Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-left text-xs text-slate-700 whitespace-nowrap">
            <thead className="bg-[#0b1b36] text-slate-200 text-[11px] font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-4 px-5 text-left">Role Profile</th>
                <th className="py-4 px-4 text-left">System Identifier</th>
                <th className="py-4 px-4 text-left">Description</th>
                <th className="py-4 px-4 text-center">Assigned Permissions</th>
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
                      <span className="font-semibold text-slate-600">Loading security roles...</span>
                    </div>
                  </td>
                </tr>
              ) : roles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-16 text-center text-slate-400">
                    <div className="max-w-xs mx-auto">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3 text-slate-300 border border-slate-100">
                        <Shield size={28} />
                      </div>
                      <p className="font-bold text-slate-800 text-sm">
                        No Roles Found
                      </p>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {search || statusFilter
                          ? "No roles match your current search or status filters."
                          : "Create your first CRM security role to define permissions."}
                      </p>
                      {!search && !statusFilter && (
                        <button
                          onClick={handleCreate}
                          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-700"
                        >
                          <Plus size={14} /> Add Role
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                roles.map((role) => {
                  const style = getRoleStyling(role.name);
                  const isProtected = ["SUPER_ADMIN", "ADMIN"].includes(role.name?.toUpperCase());

                  return (
                    <tr
                      key={role._id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Role Profile with Icon Badge */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl bg-gradient-to-br ${style.gradient} flex items-center justify-center text-white shadow-xs shrink-0 font-bold text-xs`}
                          >
                            <Shield size={16} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900 text-sm tracking-tight truncate">
                                {role.displayName || role.name}
                              </h4>
                              {isProtected && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                  <Lock size={9} /> Core
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium">
                              Created {new Date(role.createdAt || Date.now()).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* System Identifier */}
                      <td className="py-3.5 px-4 font-mono text-xs">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${style.bg} ${style.text} border ${style.border}`}>
                          {role.name}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <p className="text-xs text-slate-500 font-medium truncate" title={role.description || ""}>
                          {role.description || <span className="text-slate-300 italic">No description provided</span>}
                        </p>
                      </td>

                      {/* Permissions Count Pill with Popover Hint */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs">
                          <KeyRound size={11} className="text-indigo-500" />
                          <span>{role.permissions?.length || 0} Permissions</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border shadow-2xs ${
                            role.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              role.isActive ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                          <span>{role.isActive ? "Active" : "Inactive"}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEdit(role)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition shadow-2xs cursor-pointer"
                            title="Edit Role & Permissions"
                          >
                            <Pencil size={14} />
                          </button>

                          <button
                            onClick={() => handleDelete(role)}
                            disabled={isProtected}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition shadow-2xs ${
                              isProtected
                                ? "border-slate-100 text-slate-300 cursor-not-allowed bg-slate-50"
                                : "border-slate-200 bg-white text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 cursor-pointer"
                            }`}
                            title={isProtected ? "System core role cannot be deleted" : "Delete Role"}
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
        {!loading && roles.length > 0 && (
          <div className="bg-slate-50/90 p-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 font-medium">
            <p>
              Showing{" "}
              <strong className="text-slate-900 font-bold">
                {roles.length === 0 ? 0 : (page - 1) * limit + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-slate-900 font-bold">
                {Math.min(page * limit, total || roles.length)}
              </strong>{" "}
              of{" "}
              <strong className="text-slate-900 font-bold">
                {total || roles.length}
              </strong>{" "}
              configured roles
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

      {/* Add / Edit Role Modal */}
      <RoleModal
        open={openRoleModal}
        mode={mode}
        role={selectedRole}
        onClose={closeRoleModal}
        onSuccess={fetchRoles}
      />

      {/* Delete Confirmation Modal */}
      <DeleteRoleModal
        open={openDeleteModal}
        role={selectedRole}
        onClose={closeDeleteModal}
        onSuccess={fetchRoles}
      />
    </div>
  );
}