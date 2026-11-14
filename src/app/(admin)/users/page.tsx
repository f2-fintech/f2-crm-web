"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Pencil,
  Plus,
  Search,
  Trash2,
  KeyRound,
  Users as UsersIcon,
  UserCheck,
  UserX,
  ShieldCheck,
  X,
  Inbox,
} from "lucide-react";

import api from "@/lib/axios";

import UserModal from "@/components/users/UserModal";
import DeleteUserModal from "@/components/users/DeleteUserModal";
import ChangePasswordModal from "@/components/users/ChangePasswordModal";

interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profileImage?: string;
  isActive: boolean;

  roleId?: {
    _id: string;
    name: string;
    displayName?: string;
  };

  branchId?: {
    _id: string;
    branchName?: string;
    name?: string;
  };

  departmentId?: {
    _id: string;
    departmentName?: string;
    name?: string;
  };

  createdAt: string;
  updatedAt: string;
}

interface IUserResponse {
  data: IUser[];
  total: number;
  page: number;
  limit: number;
}

interface IOption {
  _id: string;
  name?: string;
  displayName?: string;
  branchName?: string;
  departmentName?: string;
}

const initials = (first?: string, last?: string) =>
  `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "?";

// Deterministic soft color for an avatar background, based on user id
const avatarPalette = [
  "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400",
  "bg-blue-light-50 text-blue-light-600 dark:bg-blue-light-500/15 dark:text-blue-light-400",
  "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500",
  "bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-500",
];

const avatarColor = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return avatarPalette[Math.abs(hash) % avatarPalette.length];
};

export default function UsersPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");

  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

  const [openUserModal, setOpenUserModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openPasswordModal, setOpenPasswordModal] = useState(false);

  const [mode, setMode] = useState<"create" | "edit">("create");

  const [roleFilter, setRoleFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [roles, setRoles] = useState<IOption[]>([]);
  const [branches, setBranches] = useState<IOption[]>([]);
  const [departments, setDepartments] = useState<IOption[]>([]);

  const totalPages = useMemo(() => {
    return Math.ceil(total / limit);
  }, [total, limit]);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/users", {
        params: {
          page,
          limit,
          search,
          roleId: roleFilter,
          branchId: branchFilter,
          departmentId: departmentFilter,
          isActive: statusFilter,
        },
      });

      const usersList = Array.isArray(data) ? data : data.data || [];
      const totalCount = !Array.isArray(data) && data.total !== undefined ? data.total : usersList.length;

      setUsers(usersList);
      setTotal(totalCount);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadDropdowns = async () => {
    try {
      const [roleRes, branchRes, departmentRes] = await Promise.all([
        api.get("/roles"),
        api.get("/branches"),
        api.get("/departments"),
      ]);

      setRoles(Array.isArray(roleRes.data) ? roleRes.data : roleRes.data.data || []);
      setBranches(Array.isArray(branchRes.data) ? branchRes.data : branchRes.data.data || []);
      setDepartments(Array.isArray(departmentRes.data) ? departmentRes.data : departmentRes.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, roleFilter, branchFilter, departmentFilter, statusFilter]);

  useEffect(() => {
    loadDropdowns();
  }, []);

  const updateSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const updateRoleFilter = (value: string) => {
    setRoleFilter(value);
    setPage(1);
  };

  const updateBranchFilter = (value: string) => {
    setBranchFilter(value);
    setPage(1);
  };

  const updateDepartmentFilter = (value: string) => {
    setDepartmentFilter(value);
    setPage(1);
  };

  const updateStatusFilter = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setMode("create");
    setOpenUserModal(true);
  };

  const handleEdit = (user: IUser) => {
    setSelectedUser(user);
    setMode("edit");
    setOpenUserModal(true);
  };

  const handleDelete = (user: IUser) => {
    setSelectedUser(user);
    setOpenDeleteModal(true);
  };

  const handlePassword = (user: IUser) => {
    setSelectedUser(user);
    setOpenPasswordModal(true);
  };

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("");
    setBranchFilter("");
    setDepartmentFilter("");
    setStatusFilter("");
    setPage(1);
  };

  const activeFilterChips = [
    search && { key: "search", label: `"${search}"`, clear: () => updateSearch("") },
    roleFilter && {
      key: "role",
      label: roles.find((r) => r._id === roleFilter)?.displayName || roles.find((r) => r._id === roleFilter)?.name || "Role",
      clear: () => updateRoleFilter(""),
    },
    branchFilter && {
      key: "branch",
      label: branches.find((b) => b._id === branchFilter)?.branchName || branches.find((b) => b._id === branchFilter)?.name || "Branch",
      clear: () => updateBranchFilter(""),
    },
    departmentFilter && {
      key: "department",
      label:
        departments.find((d) => d._id === departmentFilter)?.departmentName ||
        departments.find((d) => d._id === departmentFilter)?.name ||
        "Department",
      clear: () => updateDepartmentFilter(""),
    },
    statusFilter && {
      key: "status",
      label: statusFilter === "true" ? "Active" : "Inactive",
      clear: () => updateStatusFilter(""),
    },
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[];

  const selectClass =
    "h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%228%22%20viewBox%3D%220%200%2012%208%22%3E%3Cpath%20d%3D%22M1%201l5%205%205-5%22%20stroke%3D%22%2398A2B3%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_0.75rem_center] bg-no-repeat px-4 py-2.5 pr-9 text-sm text-gray-800 shadow-theme-xs transition focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800";

  const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, total);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            User Management
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage all CRM users, roles, branches and departments
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 active:scale-[0.98]"
        >
          <Plus size={18} />
          Add User
        </button>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<UsersIcon size={20} />}
          label="Total Users"
          value={total}
          accent="border-l-brand-500 [&_.stat-icon]:bg-brand-50 [&_.stat-icon]:text-brand-500 dark:[&_.stat-icon]:bg-brand-500/10"
        />
        <StatCard
          icon={<UserCheck size={20} />}
          label="Active"
          value={users.filter((u) => u.isActive).length}
          accent="border-l-success-500 [&_.stat-icon]:bg-success-50 [&_.stat-icon]:text-success-600 dark:[&_.stat-icon]:bg-success-500/10"
        />
        <StatCard
          icon={<UserX size={20} />}
          label="Inactive"
          value={users.filter((u) => !u.isActive).length}
          accent="border-l-error-500 [&_.stat-icon]:bg-error-50 [&_.stat-icon]:text-error-600 dark:[&_.stat-icon]:bg-error-500/10"
        />
        <StatCard
          icon={<ShieldCheck size={20} />}
          label="Roles Configured"
          value={roles.length}
          accent="border-l-blue-light-500 [&_.stat-icon]:bg-blue-light-50 [&_.stat-icon]:text-blue-light-500 dark:[&_.stat-icon]:bg-blue-light-500/10"
        />
      </div>

      {/* Search + Filters */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="relative mb-4">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={18} />
          </span>

          <input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => updateSearch(e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-11 pr-4 text-sm text-gray-800 shadow-theme-xs transition placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <select value={roleFilter} onChange={(e) => updateRoleFilter(e.target.value)} className={selectClass}>
            <option value="">All Roles</option>
            {roles.map((role) => (
              <option key={role._id} value={role._id}>
                {role.displayName || role.name}
              </option>
            ))}
          </select>

          <select value={branchFilter} onChange={(e) => updateBranchFilter(e.target.value)} className={selectClass}>
            <option value="">All Branches</option>
            {branches.map((branch) => (
              <option key={branch._id} value={branch._id}>
                {branch.branchName || branch.name}
              </option>
            ))}
          </select>

          <select value={departmentFilter} onChange={(e) => updateDepartmentFilter(e.target.value)} className={selectClass}>
            <option value="">All Departments</option>
            {departments.map((department) => (
              <option key={department._id} value={department._id}>
                {department.departmentName || department.name}
              </option>
            ))}
          </select>

          <select value={statusFilter} onChange={(e) => updateStatusFilter(e.target.value)} className={selectClass}>
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {/* Active filter chips */}
        {activeFilterChips.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
            {activeFilterChips.map((chip) => (
              <span
                key={chip.key}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 py-1 pl-3 pr-1.5 text-xs font-medium text-gray-600 dark:border-gray-700 dark:bg-white/[0.03] dark:text-gray-300"
              >
                {chip.label}
                <button
                  onClick={chip.clear}
                  className="flex h-4 w-4 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-gray-200"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
            <button
              onClick={clearFilters}
              className="ml-1 text-xs font-medium text-brand-500 hover:text-brand-600"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  User
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Email
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Phone
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Role
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Branch
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Department
                </th>
                <th className="px-5 py-3.5 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th className="px-5 py-3.5 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16">
                    <div className="flex flex-col items-center justify-center gap-3 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-gray-400 dark:bg-white/[0.03]">
                        <Inbox size={22} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          No users found
                        </p>
                        <p className="mt-0.5 text-sm text-gray-400 dark:text-gray-500">
                          {search || roleFilter || branchFilter || departmentFilter || statusFilter
                            ? "Try adjusting your search or filters"
                            : "Get started by adding your first user"}
                        </p>
                      </div>
                      {!(search || roleFilter || branchFilter || departmentFilter || statusFilter) && (
                        <button
                          onClick={handleCreate}
                          className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3.5 py-2 text-xs font-medium text-white transition hover:bg-brand-600"
                        >
                          <Plus size={14} />
                          Add User
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user._id}
                    className="group transition hover:bg-gray-50/80 hover:shadow-[inset_2px_0_0_0] hover:shadow-brand-500 dark:hover:bg-white/[0.02]"
                  >
                    {/* User */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="h-11 w-11 rounded-full border border-gray-200 object-cover dark:border-gray-700"
                          />
                        ) : (
                          <div
                            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold ${avatarColor(
                              user._id
                            )}`}
                          >
                            {initials(user.firstName, user.lastName)}
                          </div>
                        )}
                        <div>
                          <h5 className="text-sm font-medium text-gray-800 dark:text-white/90">
                            {user.firstName} {user.lastName}
                          </h5>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            ID: {user._id.slice(-8)}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap dark:text-gray-400">
                      {user.email}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap dark:text-gray-400">
                      {user.phone || "-"}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="inline-flex rounded-full bg-blue-light-50 px-2.5 py-0.5 text-xs font-medium text-blue-light-600 dark:bg-blue-light-500/15 dark:text-blue-light-400">
                        {user.roleId?.displayName || user.roleId?.name || "-"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap dark:text-gray-400">
                      {user.branchId?.branchName || user.branchId?.name || "-"}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap dark:text-gray-400">
                      {user.departmentId?.departmentName || user.departmentId?.name || "-"}
                    </td>

                    <td className="px-5 py-4 text-center whitespace-nowrap">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-2.5 py-0.5 text-xs font-medium text-success-700 dark:bg-success-500/15 dark:text-success-500">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success-500 opacity-60" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success-500" />
                          </span>
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-error-50 px-2.5 py-0.5 text-xs font-medium text-error-700 dark:bg-error-500/15 dark:text-error-500">
                          <span className="h-1.5 w-1.5 rounded-full bg-error-500" />
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2 opacity-80 transition group-hover:opacity-100">
                        <button
                          onClick={() => handleEdit(user)}
                          title="Edit User"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 dark:border-gray-700 dark:text-gray-400 dark:hover:border-brand-800 dark:hover:bg-brand-500/10"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => handlePassword(user)}
                          title="Change Password"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-warning-300 hover:bg-warning-50 hover:text-warning-600 dark:border-gray-700 dark:text-gray-400 dark:hover:border-warning-800 dark:hover:bg-warning-500/10"
                        >
                          <KeyRound size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(user)}
                          title="Delete User"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-error-500 transition hover:border-error-300 hover:bg-error-50 dark:border-gray-700 dark:hover:border-error-800 dark:hover:bg-error-500/10"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {total === 0 ? (
              "No users to show"
            ) : (
              <>
                Showing <span className="font-medium text-gray-700 dark:text-gray-300">{rangeStart}–{rangeEnd}</span> of{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">{total}</span> users
              </>
            )}
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((prev) => prev - 1)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
            >
              Previous
            </button>

            <span className="px-2 text-sm text-gray-500 dark:text-gray-400">
              Page {page} of {totalPages || 1}
            </span>

            <button
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage((prev) => prev + 1)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.03]"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <UserModal
        open={openUserModal}
        mode={mode}
        user={selectedUser}
        onClose={() => setOpenUserModal(false)}
        onSuccess={fetchUsers}
      />

      <DeleteUserModal
        open={openDeleteModal}
        user={selectedUser}
        onClose={() => setOpenDeleteModal(false)}
        onSuccess={fetchUsers}
      />

      <ChangePasswordModal
        open={openPasswordModal}
        user={selectedUser}
        onClose={() => setOpenPasswordModal(false)}
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-l-4 border-gray-200 bg-white p-5 transition hover:shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] ${accent}`}
    >
      <div className="flex items-center gap-3">
        <div className="stat-icon flex h-11 w-11 items-center justify-center rounded-full">
          {icon}
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-lg font-semibold text-gray-800 dark:text-white/90">{value}</p>
        </div>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-gray-100 dark:bg-white/5" />
          <div className="space-y-2">
            <div className="h-3 w-28 rounded bg-gray-100 dark:bg-white/5" />
            <div className="h-2.5 w-16 rounded bg-gray-100 dark:bg-white/5" />
          </div>
        </div>
      </td>
      <td className="px-5 py-4"><div className="h-3 w-32 rounded bg-gray-100 dark:bg-white/5" /></td>
      <td className="px-5 py-4"><div className="h-3 w-20 rounded bg-gray-100 dark:bg-white/5" /></td>
      <td className="px-5 py-4"><div className="h-5 w-16 rounded-full bg-gray-100 dark:bg-white/5" /></td>
      <td className="px-5 py-4"><div className="h-3 w-20 rounded bg-gray-100 dark:bg-white/5" /></td>
      <td className="px-5 py-4"><div className="h-3 w-24 rounded bg-gray-100 dark:bg-white/5" /></td>
      <td className="px-5 py-4 text-center"><div className="mx-auto h-5 w-16 rounded-full bg-gray-100 dark:bg-white/5" /></td>
      <td className="px-5 py-4">
        <div className="mx-auto flex w-fit gap-2">
          <div className="h-9 w-9 rounded-lg bg-gray-100 dark:bg-white/5" />
          <div className="h-9 w-9 rounded-lg bg-gray-100 dark:bg-white/5" />
          <div className="h-9 w-9 rounded-lg bg-gray-100 dark:bg-white/5" />
        </div>
      </td>
    </tr>
  );
}