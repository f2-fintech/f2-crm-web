"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

import {
  Plus,
  Search,
  Building2,
  MapPin,
  CheckCircle2,
  XCircle,
  Pencil,
  Trash2,
  RotateCcw,
  Phone,
  Mail,
  User,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import BranchModal from "@/components/branches/BranchModal";
import DeleteBranchModal from "@/components/branches/DeleteBranchModal";

interface Branch {
  _id: string;
  branchCode: string;
  branchName: string;
  city: string;
  state: string;
  address?: string;
  phone?: string;
  email?: string;
  manager?: string;
  isActive: boolean;
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  data: Branch[];
  total?: number;
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [total, setTotal] = useState(0);

  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [openBranchModal, setOpenBranchModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const { data } = await api.get<ApiResponse>("/branches", {
        params: {
          page,
          limit,
          search,
          isActive: statusFilter,
        },
      });

      const branchesList = Array.isArray(data) ? data : data.data || [];
      const totalCount =
        !Array.isArray(data) && data.total !== undefined
          ? data.total
          : branchesList.length;

      setBranches(branchesList);
      setTotal(totalCount);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [page, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const activeBranches = branches.filter((branch) => branch.isActive).length;
  const inactiveBranches = branches.filter((branch) => !branch.isActive).length;
  const citiesCount = new Set(branches.map((branch) => branch.city).filter(Boolean)).size;

  const handleCreate = () => {
    setMode("create");
    setSelectedBranch(null);
    setOpenBranchModal(true);
  };

  const handleEdit = (branch: Branch) => {
    setMode("edit");
    setSelectedBranch(branch);
    setOpenBranchModal(true);
  };

  const handleDelete = (branch: Branch) => {
    setSelectedBranch(branch);
    setOpenDeleteModal(true);
  };

  const closeBranchModal = () => {
    setOpenBranchModal(false);
    setSelectedBranch(null);
  };

  const closeDeleteModal = () => {
    setOpenDeleteModal(false);
    setSelectedBranch(null);
  };

  return (
    <div className="space-y-6 max-w-[1700px] mx-auto min-h-screen">
      {/* Top Header */}
      <div className="bg-white/95 backdrop-blur-md p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-100 flex items-center justify-center shrink-0">
            <Building2 size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Branch Management
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[11px] font-bold">
                Geo Locations
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Manage physical branches, local managers, regional addresses, and operational statuses
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={fetchBranches}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition active:scale-95 disabled:opacity-60 cursor-pointer"
            title="Refresh Branches"
          >
            <RotateCcw size={14} className={loading ? "animate-spin text-emerald-600" : "text-slate-500"} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleCreate}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs shadow-indigo-100 transition hover:bg-indigo-700 active:scale-95 cursor-pointer"
          >
            <Plus size={16} />
            <span>Create Branch</span>
          </button>
        </div>
      </div>

      {/* Metrics Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4 transition hover:border-emerald-200 hover:shadow-sm">
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/60 shrink-0">
            <Building2 size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Branches
            </span>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5 tracking-tight">
              {total || branches.length}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4 transition hover:border-emerald-200 hover:shadow-sm">
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/60 shrink-0">
            <CheckCircle2 size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Active Branches
            </span>
            <p className="text-2xl font-extrabold text-emerald-600 mt-0.5 tracking-tight">
              {activeBranches}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4 transition hover:border-rose-200 hover:shadow-sm">
          <div className="p-3.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100/60 shrink-0">
            <XCircle size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Inactive Branches
            </span>
            <p className="text-2xl font-extrabold text-rose-600 mt-0.5 tracking-tight">
              {inactiveBranches}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4 transition hover:border-blue-200 hover:shadow-sm">
          <div className="p-3.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100/60 shrink-0">
            <MapPin size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Operating Cities
            </span>
            <p className="text-2xl font-extrabold text-blue-600 mt-0.5 tracking-tight">
              {citiesCount}
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
              placeholder="Search by branch name, code, city, or manager..."
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

      {/* Main Branches Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-left text-xs text-slate-700 whitespace-nowrap">
            <thead className="bg-[#0b1b36] text-slate-200 text-[11px] font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-4 px-5 text-left">Branch Name</th>
                <th className="py-4 px-4 text-left">Branch Code</th>
                <th className="py-4 px-4 text-left">City & State</th>
                <th className="py-4 px-4 text-left">Contact Info</th>
                <th className="py-4 px-4 text-left">Branch Manager</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-16 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2.5">
                      <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <span className="font-semibold text-slate-600">Loading company branches...</span>
                    </div>
                  </td>
                </tr>
              ) : branches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-16 text-center text-slate-400">
                    <div className="max-w-xs mx-auto">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3 text-slate-300 border border-slate-100">
                        <Building2 size={28} />
                      </div>
                      <p className="font-bold text-slate-800 text-sm">
                        No Branches Found
                      </p>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {search || statusFilter
                          ? "No branches match your current search query."
                          : "Create your organization's first branch location."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                branches.map((branch) => (
                  <tr
                    key={branch._id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Branch Name & Address */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                          <Building2 size={16} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm tracking-tight">
                            {branch.branchName}
                          </h4>
                          {branch.address && (
                            <p className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5" title={branch.address}>
                              {branch.address}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Branch Code */}
                    <td className="py-3.5 px-4 font-mono">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200/80">
                        {branch.branchCode || "--"}
                      </span>
                    </td>

                    {/* City & State */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                        <MapPin size={13} className="text-rose-500 shrink-0" />
                        <span>
                          {branch.city ? `${branch.city}, ` : ""}
                          <strong className="text-slate-900">{branch.state || "--"}</strong>
                        </span>
                      </div>
                    </td>

                    {/* Contact Info (Phone / Email) */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-0.5 text-xs">
                        {branch.phone && (
                          <div className="flex items-center gap-1.5 text-slate-600 font-mono text-[11px]">
                            <Phone size={11} className="text-slate-400" />
                            <span>{branch.phone}</span>
                          </div>
                        )}
                        {branch.email && (
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                            <Mail size={11} className="text-slate-400" />
                            <span className="truncate max-w-[160px]">{branch.email}</span>
                          </div>
                        )}
                        {!branch.phone && !branch.email && (
                          <span className="text-slate-300 italic text-xs">--</span>
                        )}
                      </div>
                    </td>

                    {/* Branch Manager */}
                    <td className="py-3.5 px-4">
                      {branch.manager ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-[9px] font-bold">
                            <User size={10} />
                          </div>
                          <span className="font-semibold text-slate-800 text-xs">
                            {branch.manager}
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
                          branch.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            branch.isActive ? "bg-emerald-500" : "bg-slate-400"
                          }`}
                        />
                        <span>{branch.isActive ? "Active" : "Inactive"}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEdit(branch)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition shadow-2xs cursor-pointer"
                          title="Edit Branch"
                        >
                          <Pencil size={14} />
                        </button>

                        <button
                          onClick={() => handleDelete(branch)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition shadow-2xs cursor-pointer"
                          title="Delete Branch"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with Pagination */}
        {!loading && branches.length > 0 && (
          <div className="bg-slate-50/90 p-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 font-medium">
            <p>
              Showing{" "}
              <strong className="text-slate-900 font-bold">
                {branches.length === 0 ? 0 : (page - 1) * limit + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-slate-900 font-bold">
                {Math.min(page * limit, total || branches.length)}
              </strong>{" "}
              of{" "}
              <strong className="text-slate-900 font-bold">
                {total || branches.length}
              </strong>{" "}
              branches
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

      {/* Branch Modal */}
      <BranchModal
        open={openBranchModal}
        mode={mode}
        branch={selectedBranch}
        onClose={closeBranchModal}
        onSuccess={fetchBranches}
      />

      {/* Delete Branch */}
      <DeleteBranchModal
        open={openDeleteModal}
        branch={selectedBranch}
        onClose={closeDeleteModal}
        onSuccess={fetchBranches}
      />
    </div>
  );
}
