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
  CheckCircle,
  XCircle,
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

      const parsedDepartments = Array.isArray(data) ? data : data.data || [];
      setDepartments(parsedDepartments);
      setTotal(data.total || parsedDepartments.length || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [page, search, statusFilter]);

  const totalPages = Math.ceil(total / limit);
  const activeDepartments = departments.filter((d) => d.isActive).length;
  const inactiveDepartments = departments.filter((d) => !d.isActive).length;

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Department Management</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your CRM departments here.</p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Department
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <Building2 className="mb-3 text-blue-600" size={28} />
          <h4 className="text-sm text-gray-500">Total Departments</h4>
          <h2 className="mt-2 text-3xl font-bold">{departments.length}</h2>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <CheckCircle className="mb-3 text-green-600" size={28} />
          <h4 className="text-sm text-gray-500">Active</h4>
          <h2 className="mt-2 text-3xl font-bold">{activeDepartments}</h2>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <XCircle className="mb-3 text-red-600" size={28} />
          <h4 className="text-sm text-gray-500">Inactive</h4>
          <h2 className="mt-2 text-3xl font-bold">{inactiveDepartments}</h2>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Department..."
              className="w-full rounded-lg border py-3 pl-10 pr-4"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border px-4"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Department
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Head of Dept
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Status
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y bg-white">
              {departments.map((dept) => (
                <tr key={dept._id} className="hover:bg-gray-50">
                  <td className="px-6 py-5">
                    <h4 className="font-semibold text-gray-900">{dept.departmentName}</h4>
                    <p className="text-sm text-gray-500">{dept.departmentCode}</p>
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-600">
                    {typeof dept.headOfDepartment === "object" && dept.headOfDepartment !== null
                      ? `${dept.headOfDepartment.firstName} ${dept.headOfDepartment.lastName}`
                      : typeof dept.headOfDepartment === "string" && dept.headOfDepartment !== ""
                      ? dept.headOfDepartment
                      : "-"}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        dept.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {dept.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(dept)}
                        className="rounded-lg border p-2 hover:bg-gray-100"
                      >
                        <Pencil size={17} />
                      </button>
                      <button
                        onClick={() => handleDelete(dept)}
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
          {!loading && departments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <Building2 size={60} className="text-gray-300" />
              <h3 className="mt-4 text-xl font-semibold text-gray-700">No Departments Found</h3>
              <p className="mt-2 text-sm text-gray-500">Create your first department to get started.</p>
              <button
                onClick={handleCreate}
                className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-white hover:bg-blue-700"
              >
                Add Department
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
        {!loading && departments.length > 0 && (
          <div className="flex items-center justify-between border-t px-6 py-4">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium">{departments.length}</span> of{" "}
              <span className="font-medium">{total}</span> departments
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((prev) => prev - 1)}
                className="rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span className="rounded-lg bg-blue-600 px-4 py-2 text-white">{page}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => prev + 1)}
                className="rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
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