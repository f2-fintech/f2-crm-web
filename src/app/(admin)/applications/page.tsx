"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

import ApplicationModal from "@/components/applications/ApplicationModal";
import DeleteApplicationModal from "@/components/applications/DeleteApplicationModal";

interface Application {
  _id: string;
  applicationNo: string;
  applicantName: string;
  customerId?: any;
  lender?: string;
  loanAmount: number;
  status: string;
  assignedTo?: any;
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  data: Application[];
  total?: number;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [page, setPage] = useState(1);
  const limit = 10;
  const [total, setTotal] = useState(0);

  const [mode, setMode] = useState<"create" | "edit">("create");

  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);

  const [openApplicationModal, setOpenApplicationModal] =
    useState(false);

  const [openDeleteModal, setOpenDeleteModal] =
    useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);

      const { data } = await api.get<ApiResponse>(
        "/applications",
        {
          params: {
            page,
            limit,
            search,
            status: statusFilter,
          },
        }
      );

      setApplications(Array.isArray(data) ? data : data.data || []);
      setTotal(data.total || data.data.length || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [page, search, statusFilter]);

  const totalPages = Math.ceil(total / limit);

  const pendingCount = applications.filter(
    (x) => x.status === "PENDING"
  ).length;

  const approvedCount = applications.filter(
    (x) => x.status === "APPROVED"
  ).length;

  const rejectedCount = applications.filter(
    (x) => x.status === "REJECTED"
  ).length;

  const handleCreate = () => {
    setMode("create");
    setSelectedApplication(null);
    setOpenApplicationModal(true);
  };

  const handleEdit = (application: Application) => {
    setMode("edit");
    setSelectedApplication(application);
    setOpenApplicationModal(true);
  };

  const handleDelete = (application: Application) => {
    setSelectedApplication(application);
    setOpenDeleteModal(true);
  };

  const closeApplicationModal = () => {
    setOpenApplicationModal(false);
    setSelectedApplication(null);
  };

  const closeDeleteModal = () => {
    setOpenDeleteModal(false);
    setSelectedApplication(null);
  };

  
  
  return (
    <div className="space-y-6">
        

          {/* Header */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Loan Applications
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage all customer loan applications.
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />
          New Application
        </button>

      </div>

      {/* Stats */}

      <div className="grid gap-5 md:grid-cols-4">

        <div className="rounded-xl border bg-white p-5 shadow-sm">

          <FileText
            className="mb-3 text-blue-600"
            size={28}
          />

          <h4 className="text-sm text-gray-500">
            Total Applications
          </h4>

          <h2 className="mt-2 text-3xl font-bold">
            {applications.length}
          </h2>

        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">

          <Clock
            className="mb-3 text-yellow-600"
            size={28}
          />

          <h4 className="text-sm text-gray-500">
            Pending
          </h4>

          <h2 className="mt-2 text-3xl font-bold">
            {pendingCount}
          </h2>

        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">

          <CheckCircle
            className="mb-3 text-green-600"
            size={28}
          />

          <h4 className="text-sm text-gray-500">
            Approved
          </h4>

          <h2 className="mt-2 text-3xl font-bold">
            {approvedCount}
          </h2>

        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">

          <XCircle
            className="mb-3 text-red-600"
            size={28}
          />

          <h4 className="text-sm text-gray-500">
            Rejected
          </h4>

          <h2 className="mt-2 text-3xl font-bold">
            {rejectedCount}
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
              placeholder="Search Application..."
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

            <option value="PENDING">
              Pending
            </option>

            <option value="APPROVED">
              Approved
            </option>

            <option value="REJECTED">
              Rejected
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
                  Application
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-600">
                  Customer
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-600">
                  Lender
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-gray-600">
                  Loan Amount
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

              {applications.map((application) => (

                <tr
                  key={application._id}
                  className="hover:bg-gray-50"
                >

                  <td className="px-6 py-5">

                    <h4 className="font-semibold">
                      {application.applicationNo}
                    </h4>

                    <p className="text-sm text-gray-500">
                      {new Date(
                        application.createdAt
                      ).toLocaleDateString()}
                    </p>

                  </td>

                  <td className="px-6 py-5">
                    {application.applicantName}
                  </td>

                  <td className="px-6 py-5">
                    {application.lender || "-"}
                  </td>

                  <td className="px-6 py-5 text-right font-semibold">
                    ₹
                    {application.loanAmount?.toLocaleString()}
                  </td>

                  <td className="px-6 py-5 text-center">

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        application.status === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : application.status === "REJECTED"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {application.status}
                    </span>

                  </td>

                  <td className="px-6 py-5">

                    <div className="flex justify-center gap-2">

                      <button
                        className="rounded-lg border p-2 hover:bg-gray-100"
                      >
                        <Eye size={17} />
                      </button>

                      <button
                        onClick={() =>
                          handleEdit(application)
                        }
                        className="rounded-lg border p-2 hover:bg-gray-100"
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(application)
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

          {!loading && applications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">

              <FileText
                size={60}
                className="text-gray-300"
              />

              <h3 className="mt-4 text-xl font-semibold text-gray-700">
                No Applications Found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Create your first loan application to get started.
              </p>

              <button
                onClick={handleCreate}
                className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-white hover:bg-blue-700"
              >
                New Application
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
          applications.length > 0 && (
            <div className="flex items-center justify-between border-t px-6 py-4">

              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-medium">
                  {applications.length}
                </span>{" "}
                of{" "}
                <span className="font-medium">
                  {total}
                </span>{" "}
                applications
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

      {/* Add / Edit Modal */}

      <ApplicationModal
        open={openApplicationModal}
        mode={mode}
        application={selectedApplication}
        onClose={closeApplicationModal}
        onSuccess={fetchApplications}
      />

      {/* Delete Modal */}

      <DeleteApplicationModal
        open={openDeleteModal}
        application={selectedApplication}
        onClose={closeDeleteModal}
        onSuccess={fetchApplications}
      />

    </div>
  );
}
