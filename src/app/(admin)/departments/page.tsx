"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

import DepartmentModal from "@/components/departments/DepartmentModal";
import DeleteDepartmentModal from "@/components/departments/DeleteDepartmentModal";

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Building2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  User,
  Hash,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface IDepartment {
  _id: string;
  departmentCode: string;
  departmentName: string;
  description?: string;
  headOfDepartment?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface IDepartmentResponse {
  success: boolean;
  data: IDepartment[];
  total?: number;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<IDepartment[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [total, setTotal] = useState(0);

  const [openModal, setOpenModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selectedDepartment, setSelectedDepartment] = useState<IDepartment | null>(null);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const { data } = await api.get<IDepartmentResponse>("/departments", {
        params: {
          page,
          limit,
          search,
          isActive: statusFilter,
        },
      });

      const parsed = Array.isArray(data) ? data : data.data || [];
      setDepartments(parsed);
      setTotal(data.total || parsed.length || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [page, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const activeCount = departments.filter((d) => d.isActive).length;
  const inactiveCount = departments.filter((d) => !d.isActive).length;

  const handleCreate = () => {
    setMode("create");
    setSelectedDepartment(null);
    setOpenModal(true);
  };

  const handleEdit = (dept: IDepartment) => {
    setMode("edit");
    setSelectedDepartment(dept);
    setOpenModal(true);
  };

  const handleDelete = (dept: IDepartment) => {
    setSelectedDepartment(dept);
    setOpenDeleteModal(true);
  };

  return (
    <div className="space-y-6 max-w-[1700px] mx-auto min-h-screen">
      {/* Top Header */}
      <div className="bg-white/95 backdrop-blur-md p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-100 flex items-center justify-center shrink-0">
            <Building2 size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Department Management
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-[11px] font-bold">
                Org Structure
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Organize company divisions, assign department heads, and manage functional scopes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={fetchDepartments}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition active:scale-95 disabled:opacity-60 cursor-pointer"
            title="Refresh Departments"
          >
            <RotateCcw size={14} className={loading ? "animate-spin text-blue-600" : "text-slate-500"} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleCreate}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs shadow-indigo-100 transition hover:bg-indigo-700 active:scale-95 cursor-pointer"
          >
            <Plus size={16} />
            <span>Create Department</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4 transition hover:border-blue-200 hover:shadow-sm">
          <div className="p-3.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100/60 shrink-0">
            <Building2 size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Departments
            </span>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5 tracking-tight">
              {total || departments.length}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4 transition hover:border-emerald-200 hover:shadow-sm">
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/60 shrink-0">
            <CheckCircle2 size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Active Divisions
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
              Inactive Divisions
            </span>
            <p className="text-2xl font-extrabold text-rose-600 mt-0.5 tracking-tight">
              {inactiveCount}
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
              placeholder="Search by department name or code..."
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

      {/* Main Departments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-left text-xs text-slate-700 whitespace-nowrap">
            <thead className="bg-[#0b1b36] text-slate-200 text-[11px] font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-4 px-5 text-left">Department Details</th>
                <th className="py-4 px-4 text-left">Department Code</th>
                <th className="py-4 px-4 text-left">Head of Department (HOD)</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-16 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2.5">
                      <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <span className="font-semibold text-slate-600">Loading departments...</span>
                    </div>
                  </td>
                </tr>
              ) : departments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-16 text-center text-slate-400">
                    <div className="max-w-xs mx-auto">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3 text-slate-300 border border-slate-100">
                        <Building2 size={28} />
                      </div>
                      <p className="font-bold text-slate-800 text-sm">
                        No Departments Found
                      </p>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {search || statusFilter
                          ? "No departments match your current filter settings."
                          : "Create your organization's first department."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                departments.map((dept) => {
                  const hodName =
                    typeof dept.headOfDepartment === "object" && dept.headOfDepartment !== null
                      ? `${dept.headOfDepartment.firstName || ""} ${dept.headOfDepartment.lastName || ""}`.trim()
                      : typeof dept.headOfDepartment === "string" && dept.headOfDepartment !== ""
                      ? dept.headOfDepartment
                      : null;

                  return (
                    <tr
                      key={dept._id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Department Name */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            <Building2 size={16} />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm tracking-tight">
                              {dept.departmentName}
                            </h4>
                            {dept.description && (
                              <p className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5" title={dept.description}>
                                {dept.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Department Code */}
                      <td className="py-3.5 px-4 font-mono">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200/80">
                          {dept.departmentCode || "--"}
                        </span>
                      </td>

                      {/* Head of Department */}
                      <td className="py-3.5 px-4">
                        {hodName ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-[10px] font-bold">
                              <User size={12} />
                            </div>
                            <span className="font-semibold text-slate-800 text-xs">
                              {hodName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-300 italic text-xs">Unassigned</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border shadow-2xs ${
                            dept.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              dept.isActive ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                          <span>{dept.isActive ? "Active" : "Inactive"}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEdit(dept)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition shadow-2xs cursor-pointer"
                            title="Edit Department"
                          >
                            <Pencil size={14} />
                          </button>

                          <button
                            onClick={() => handleDelete(dept)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition shadow-2xs cursor-pointer"
                            title="Delete Department"
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
        {!loading && departments.length > 0 && (
          <div className="bg-slate-50/90 p-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 font-medium">
            <p>
              Showing{" "}
              <strong className="text-slate-900 font-bold">
                {departments.length === 0 ? 0 : (page - 1) * limit + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-slate-900 font-bold">
                {Math.min(page * limit, total || departments.length)}
              </strong>{" "}
              of{" "}
              <strong className="text-slate-900 font-bold">
                {total || departments.length}
              </strong>{" "}
              departments
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

      <DepartmentModal
        open={openModal}
        mode={mode}
        department={selectedDepartment}
        onClose={() => setOpenModal(false)}
        onSuccess={fetchDepartments}
      />

      <DeleteDepartmentModal
        open={openDeleteModal}
        department={selectedDepartment}
        onClose={() => setOpenDeleteModal(false)}
        onSuccess={fetchDepartments}
      />
    </div>
  );
}
