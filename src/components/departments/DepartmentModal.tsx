"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";

interface Props {
  open: boolean;
  mode: "create" | "edit";
  department?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DepartmentModal({
  open,
  mode,
  department,
  onClose,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  const [form, setForm] = useState({
    departmentCode: "",
    departmentName: "",
    description: "",
    headOfDepartment: "",
    isActive: true,
  });

  useEffect(() => {
    if (!open) return;

    const fetchUsers = async () => {
      try {
        const res = await api.get("/users");
        setUsers(Array.isArray(res.data) ? res.data : res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();

    if (mode === "edit" && department) {
      setForm({
        departmentCode: department.departmentCode || "",
        departmentName: department.departmentName || "",
        description: department.description || "",
        headOfDepartment:
          department.headOfDepartment?._id || department.headOfDepartment || "",
        isActive: department.isActive,
      });
    } else {
      setForm({
        departmentCode: "",
        departmentName: "",
        description: "",
        headOfDepartment: "",
        isActive: true,
      });
    }
  }, [open, mode, department]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClose = () => {
    setForm({
      departmentCode: "",
      departmentName: "",
      description: "",
      headOfDepartment: "",
      isActive: true,
    });
    onClose();
  };

  const handleSubmit = async () => {
    if (!form.departmentCode.trim()) {
      return toast.error("Department Code is required");
    }

    if (!form.departmentName.trim()) {
      return toast.error("Department Name is required");
    }

    try {
      setLoading(true);

      const payload = { ...form };
      if (!payload.headOfDepartment) delete payload.headOfDepartment;

      const res =
        mode === "create"
          ? await api.post("/departments", payload)
          : await api.patch(`/departments/${department._id}`, payload);

      toast.success(
        res.data?.message || (mode === "create" ? "Department created successfully" : "Department updated successfully")
      );

      onSuccess();
      handleClose();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold">
              {mode === "create" ? "Add Department" : "Edit Department"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Create and manage departments.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-2xl text-gray-400 hover:text-red-500"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="space-y-6 p-6">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Department Code
              </label>
              <input
                name="departmentCode"
                value={form.departmentCode}
                onChange={handleChange}
                placeholder="IT001"
                className="w-full rounded-lg border p-3"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Department Name
              </label>
              <input
                name="departmentName"
                value={form.departmentName}
                onChange={handleChange}
                placeholder="Information Technology"
                className="w-full rounded-lg border p-3"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Description
            </label>
            <textarea
              rows={3}
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter department description..."
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Head Of Department
              </label>
              <select
                name="headOfDepartment"
                value={form.headOfDepartment}
                onChange={handleChange}
                className="w-full rounded-lg border p-3"
              >
                <option value="">Select Head</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.firstName} {u.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Status
              </label>
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

          {/* Preview */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
            <h3 className="mb-4 text-base font-semibold text-blue-700">
              Department Preview
            </h3>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <p className="text-xs text-gray-500">Department Code</p>
                <p className="font-medium">{form.departmentCode || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Department Name</p>
                <p className="font-medium">{form.departmentName || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Head Of Department</p>
                <p className="font-medium">
                  {users.find((u) => u._id === form.headOfDepartment)
                    ? `${users.find((u) => u._id === form.headOfDepartment).firstName} ${
                        users.find((u) => u._id === form.headOfDepartment).lastName
                      }`
                    : form.headOfDepartment || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    form.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {form.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t px-6 py-5">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? mode === "create"
                ? "Saving..."
                : "Updating..."
              : mode === "create"
              ? "Save Department"
              : "Update Department"}
          </button>
        </div>
      </div>
    </div>
  );
}