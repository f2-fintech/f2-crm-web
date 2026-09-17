"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import PermissionMatrix from "./PermissionMatrix";

interface Props {
  open: boolean;
  mode: "create" | "edit";
  role?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RoleModal({
  open,
  mode,
  role,
  onClose,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    displayName: "",
    description: "",
    permissions: [] as string[],
    isActive: true,
  });

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && role) {
      setForm({
        name: role.name || "",
        displayName: role.displayName || "",
        description: role.description || "",
        permissions: role.permissions || [],
        isActive: role.isActive,
      });
    } else {
      setForm({
        name: "",
        displayName: "",
        description: "",
        permissions: [],
        isActive: true,
      });
    }
  }, [open, mode, role]);

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
      name: "",
      displayName: "",
      description: "",
      permissions: [],
      isActive: true,
    });

    onClose();
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      return alert("Role name is required");
    }

    if (!form.displayName.trim()) {
      return alert("Display Name is required");
    }

    try {
      setLoading(true);

      const payload = {
        ...form,
      };

      const res =
        mode === "create"
          ? await api.post("/roles", payload)
          : await api.patch(`/roles/${role._id}`, payload);

      alert(res.data.message);

      onSuccess();

      handleClose();
    } catch (err: any) {
      alert(
        err?.response?.data?.message ||
          "Something went wrong."
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
        className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-5">

          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {mode === "create"
                ? "Add Role"
                : "Edit Role"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Manage role details and permissions.
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
                Role Name
              </label>

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="ADMIN"
                className="w-full rounded-lg border p-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Display Name
              </label>

              <input
                name="displayName"
                value={form.displayName}
                onChange={handleChange}
                placeholder="Administrator"
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
              placeholder="Enter description..."
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium">
              Status
            </label>

            <select
              name="isActive"
              value={form.isActive ? "true" : "false"}
              onChange={(e) =>
                setForm({
                  ...form,
                  isActive:
                    e.target.value === "true",
                })
              }
              className="w-52 rounded-lg border p-3"
            >
              <option value="true">
                Active
              </option>

              <option value="false">
                Inactive
              </option>
            </select>
          </div>

          {/* Permission Matrix */}

          <PermissionMatrix
            selectedPermissions={
              form.permissions
            }
            onChange={(permissions) =>
              setForm({
                ...form,
                permissions,
              })
            }
          />
                    {/* Footer */}

          <div className="sticky bottom-0 mt-8 flex items-center justify-end gap-3 border-t bg-white px-6 py-5">

            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-6 py-2.5 font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
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
                  ? "Creating..."
                  : "Updating..."
                : mode === "create"
                ? "Create Role"
                : "Update Role"}
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}