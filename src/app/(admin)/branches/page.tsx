"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

import {
  Plus,
  Search,
  Building2,
  MapPin,
  CheckCircle,
  XCircle,
  Pencil,
  Trash2,
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

  const [mode, setMode] =
    useState<"create" | "edit">("create");

  const [selectedBranch, setSelectedBranch] =
    useState<Branch | null>(null);

  const [openBranchModal, setOpenBranchModal] =
    useState(false);

  const [openDeleteModal, setOpenDeleteModal] =
    useState(false);

  const fetchBranches = async () => {
    try {
      setLoading(true);

      const { data } =
        await api.get<ApiResponse>("/branches", {
          params: {
            page,
            limit,
            search,
            isActive: statusFilter,
          },
        });

      setBranches(Array.isArray(data) ? data : data.data || []);

      setTotal(
        data.total ||
          data.data.length ||
          0
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [page, search, statusFilter]);

  const totalPages = Math.ceil(total / limit);

  const activeBranches =
    branches.filter(
      (branch) => branch.isActive
    ).length;

  const inactiveBranches =
    branches.filter(
      (branch) => !branch.isActive
    ).length;

  const cities = new Set(
    branches.map((branch) => branch.city)
  ).size;

  const handleCreate = () => {
    setMode("create");
    setSelectedBranch(null);
    setOpenBranchModal(true);
  };

  const handleEdit = (
    branch: Branch
  ) => {
    setMode("edit");
    setSelectedBranch(branch);
    setOpenBranchModal(true);
  };

  const handleDelete = (
    branch: Branch
  ) => {
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
    <div className="space-y-6">

          {/* Header */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>

          <h1 className="text-2xl font-bold text-gray-900">
            Branch Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage company branches across different locations.
          </p>

        </div>

        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Branch
        </button>

      </div>

      {/* Stats */}

      <div className="grid gap-5 md:grid-cols-4">

        <div className="rounded-xl border bg-white p-5 shadow-sm">

          <Building2
            size={28}
            className="mb-3 text-blue-600"
          />

          <h4 className="text-sm text-gray-500">
            Total Branches
          </h4>

          <h2 className="mt-2 text-3xl font-bold">
            {branches.length}
          </h2>

        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">

          <CheckCircle
            size={28}
            className="mb-3 text-green-600"
          />

          <h4 className="text-sm text-gray-500">
            Active
          </h4>

          <h2 className="mt-2 text-3xl font-bold">
            {activeBranches}
          </h2>

        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">

          <XCircle
            size={28}
            className="mb-3 text-red-600"
          />

          <h4 className="text-sm text-gray-500">
            Inactive
          </h4>

          <h2 className="mt-2 text-3xl font-bold">
            {inactiveBranches}
          </h2>

        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">

          <MapPin
            size={28}
            className="mb-3 text-indigo-600"
          />

          <h4 className="text-sm text-gray-500">
            Cities
          </h4>

          <h2 className="mt-2 text-3xl font-bold">
            {cities}
          </h2>

        </div>

      </div>

      {/* Filters */}

      <div className="rounded-xl border bg-white p-5 shadow-sm">

        <div className="grid gap-4 md:grid-cols-2">

          <div className="relative">

            <Search
              size={18}
              className="absolute left-3 top-3.5 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search Branch..."
              className="w-full rounded-lg border py-3 pl-10 pr-4"
            />

          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="rounded-lg border px-4"
          >
            <option value="">
              All Status
            </option>

            <option value="true">
              Active
            </option>

            <option value="false">
              Inactive
            </option>

          </select>

        </div>

      </div>

      {/* Table */}

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead className="bg-gray-50">

              <tr>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-600">
                  Branch
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-600">
                  Location
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-600">
                  Manager
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-600">
                  Contact
                </th>

                <th className="px-6 py-4 text-center text-xs font-semibold uppercase text-gray-600">
                  Status
                </th>

                <th className="px-6 py-4 text-center text-xs font-semibold uppercase text-gray-600">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody className="divide-y bg-white">

              {branches.map((branch) => (

                <tr
                  key={branch._id}
                  className="hover:bg-gray-50"
                >

                  <td className="px-6 py-5">

                    <h4 className="font-semibold">
                      {branch.branchName}
                    </h4>

                    <p className="text-sm text-gray-500">
                      {branch.branchCode}
                    </p>

                  </td>

                  <td className="px-6 py-5">

                    <p>{branch.city}</p>

                    <p className="text-sm text-gray-500">
                      {branch.state}
                    </p>

                  </td>

                  <td className="px-6 py-5">
                    {branch.manager || "-"}
                  </td>

                  <td className="px-6 py-5">

                    <p>{branch.phone || "-"}</p>

                    <p className="text-sm text-gray-500">
                      {branch.email || "-"}
                    </p>

                  </td>

                  <td className="px-6 py-5 text-center">

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        branch.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {branch.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>

                  </td>

                  <td className="px-6 py-5">

                    <div className="flex justify-center gap-2">

                      <button
                        onClick={() =>
                          handleEdit(branch)
                        }
                        className="rounded-lg border p-2 hover:bg-gray-100"
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(branch)
                        }
                        className="rounded-lg border p-2 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={17} />
                      </button>

                    </div>

                  </td>

                </tr>

              ))}
                          </tbody>
          </table>

          {/* Empty State */}

          {!loading && branches.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">

              <Building2
                size={60}
                className="text-gray-300"
              />

              <h3 className="mt-4 text-xl font-semibold text-gray-700">
                No Branches Found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Create your first branch to get started.
              </p>

              <button
                onClick={handleCreate}
                className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-white hover:bg-blue-700"
              >
                Add Branch
              </button>

            </div>
          )}

          {/* Loading */}

          {loading && (
            <div className="flex justify-center py-20">

              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />

            </div>
          )}

        </div>

        {/* Pagination */}

        {!loading &&
          branches.length > 0 && (
            <div className="flex items-center justify-between border-t px-6 py-4">

              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-medium">
                  {branches.length}
                </span>{" "}
                of{" "}
                <span className="font-medium">
                  {total}
                </span>{" "}
                branches
              </p>

              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() =>
                    setPage((prev) => prev - 1)
                  }
                  className="rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="rounded-lg bg-blue-600 px-4 py-2 text-white">
                  {page}
                </span>

                <button
                  disabled={page >= totalPages}
                  onClick={() =>
                    setPage((prev) => prev + 1)
                  }
                  className="rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>

              </div>

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