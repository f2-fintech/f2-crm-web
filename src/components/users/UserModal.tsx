"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";

interface UserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: "create" | "edit";
  user?: any;
}

interface Option {
  _id: string;
  name?: string;
  displayName?: string;
  branchName?: string;
  departmentName?: string;
}

export default function UserModal({
  open,
  onClose,
  onSuccess,
  mode,
  user,
}: UserModalProps) {
  const [loading, setLoading] = useState(false);

  const [roles, setRoles] = useState<Option[]>([]);
  const [branches, setBranches] = useState<Option[]>([]);
  const [departments, setDepartments] = useState<Option[]>([]);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    roleId: "",
    branchId: "",
    departmentId: "",
    profileImage: "",
    isActive: true,
  });

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
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadDropdowns();

    if (mode === "edit" && user) {
      setForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        password: "",
        roleId: user.roleId?._id || "",
        branchId: user.branchId?._id || "",
        departmentId: user.departmentId?._id || "",
        profileImage: user.profileImage || "",
        isActive: user.isActive,
      });
    }

    if (mode === "create") {
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        roleId: "",
        branchId: "",
        departmentId: "",
        profileImage: "",
        isActive: true,
      });
    }
  }, [user, mode, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClose = () => {
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      roleId: "",
      branchId: "",
      departmentId: "",
      profileImage: "",
      isActive: true,
    });

    onClose();
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Don't send an empty password on edit - it would overwrite the
      // existing password hash on the backend.
      const payload: any = { ...form };
      if (mode === "edit" && !payload.password) {
        delete payload.password;
      }

      const res =
        mode === "create"
          ? await api.post("/users", payload)
          : await api.patch(`/users/${user._id}`, payload);

      toast.success(res.data.message);

      onSuccess();
      handleClose();
    } catch (err: any) {
      const errorData = err?.response?.data;
      let errorMessage = "Something went wrong. Please try again.";
      
      if (errorData?.message) {
        errorMessage = Array.isArray(errorData.message)
          ? errorData.message.join(", ")
          : errorData.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {mode === "create" ? "Add User" : "Edit User"}
          </h2>

          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="mb-2 block text-sm font-medium">
              First Name
            </label>

            <input
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              className="w-full rounded-lg border p-3"
              placeholder="First Name"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Last Name
            </label>

            <input
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              className="w-full rounded-lg border p-3"
              placeholder="Last Name"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Email</label>

            <input
              type="email"
              disabled={mode === "edit"}
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-lg border p-3"
              placeholder="Email"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Phone</label>

            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full rounded-lg border p-3"
              placeholder="+91xxxxxxxxxx"
            />
          </div>

          {mode === "create" && (
            <div className="col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-lg border p-3"
                placeholder="Password"
              />
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium">Role</label>

            <select
              name="roleId"
              value={form.roleId}
              onChange={handleChange}
              className="w-full rounded-lg border p-3"
            >
              <option value="">Select Role</option>

              {roles.map((role) => (
                <option key={role._id} value={role._id}>
                  {role.displayName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Branch</label>

            <select
              name="branchId"
              value={form.branchId}
              onChange={handleChange}
              className="w-full rounded-lg border p-3"
            >
              <option value="">Select Branch</option>

              {branches.map((branch) => (
                <option key={branch._id} value={branch._id}>
                  {branch.branchName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Department
            </label>

            <select
              name="departmentId"
              value={form.departmentId}
              onChange={handleChange}
              className="w-full rounded-lg border p-3"
            >
              <option value="">Select Department</option>

              {departments.map((department) => (
                <option key={department._id} value={department._id}>
                  {department.departmentName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Status</label>

            <select
              name="isActive"
              value={form.isActive ? "true" : "false"}
              onChange={(e) =>
                setForm({
                  ...form,
                  isActive: e.target.value === "true",
                })
              }
              className="w-full rounded-lg border p-3"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button onClick={handleClose} className="rounded-lg border px-5 py-2">
            Cancel
          </button>

          <button
  type="button"
  onClick={handleSubmit}
  disabled={loading}
  className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
>
  {loading
    ? "Saving..."
    : mode === "create"
    ? "Save"
    : "Update"}
</button>
        </div>
      </div>
    </div>
  );
}