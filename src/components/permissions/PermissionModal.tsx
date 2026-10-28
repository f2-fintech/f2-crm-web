"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import PermissionGroup from "./PermissionGroup";

interface Props {
  open: boolean;
  mode: "create" | "edit";
  permission?: any;
  onClose: () => void;
  onSuccess: () => void;
}

const MODULES = [
  "Dashboard",
  "Users",
  "Roles",
  "Permissions",
  "Branches",
  "Departments",
  "Leads",
  "Customers",
  "Applications",
  "Reports",
  "Settings",
];

const ACTIONS = [
  "View",
  "Create",
  "Update",
  "Delete",
  "Import",
  "Export",
  "Assign",
  "Approve",
  "Reject",
];

export default function PermissionModal({
  open,
  mode,
  permission,
  onClose,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);

  const [selectedPermissions, setSelectedPermissions] =
    useState<string[]>([]);

  const [form, setForm] = useState({
    module: "",
    action: "",
    key: "",
    description: "",
    isActive: true,
  });

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && permission) {
      setForm({
        module: permission.module || "",
        action: permission.action || "",
        key: permission.key || "",
        description: permission.description || "",
        isActive: permission.isActive,
      });
    } else {
      setForm({
        module: "",
        action: "",
        key: "",
        description: "",
        isActive: true,
      });

      setSelectedPermissions([]);
    }
  }, [open, mode, permission]);

  useEffect(() => {
    if (form.module && form.action) {
      setForm((prev) => ({
        ...prev,
        key: `${prev.module.toLowerCase()}.${prev.action.toLowerCase()}`,
      }));
    }
  }, [form.module, form.action]);

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
      module: "",
      action: "",
      key: "",
      description: "",
      isActive: true,
    });

    onClose();
  };

  const handleSubmit = async () => {
    if (!form.module)
      return alert("Module is required");

    if (!form.action)
      return alert("Action is required");

    try {
      setLoading(true);

      const payload = {
        ...form,
      };

      const res =
        mode === "create"
          ? await api.post(
              "/permissions",
              payload
            )
          : await api.patch(
              `/permissions/${permission._id}`,
              payload
            );

      alert(res.data?.message || (mode === "create" ? "Permission created successfully" : "Permission updated successfully"));

      onSuccess();

      handleClose();
    } catch (err: any) {
      alert(
        err?.response?.data?.message ||
          "Something went wrong"
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
              {mode === "create"
                ? "Add Permission"
                : "Edit Permission"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Manage system permissions.
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
                Module
              </label>

              <select
                name="module"
                value={form.module}
                onChange={handleChange}
                className="w-full rounded-lg border p-3"
              >
                <option value="">
                  Select Module
                </option>

                {MODULES.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ))}
              </select>

            </div>

            <div>

              <label className="mb-2 block text-sm font-medium">
                Action
              </label>

              <select
                name="action"
                value={form.action}
                onChange={handleChange}
                className="w-full rounded-lg border p-3"
              >
                <option value="">
                  Select Action
                </option>

                {ACTIONS.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ))}
              </select>

            </div>

          </div>
                    <div>
            <label className="mb-2 block text-sm font-medium">
              Permission Key
            </label>

            <input
              type="text"
              name="key"
              value={form.key}
              readOnly
              className="w-full rounded-lg border bg-gray-100 p-3 text-gray-600"
            />
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
              placeholder="Enter permission description..."
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Status
            </label>

            <select
              value={form.isActive ? "true" : "false"}
              onChange={(e) =>
                setForm({
                  ...form,
                  isActive: e.target.value === "true",
                })
              }
              className="w-52 rounded-lg border p-3"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          {/* Preview */}

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">

            <h4 className="mb-3 font-semibold text-blue-700">
              Permission Preview
            </h4>

            <div className="grid grid-cols-2 gap-4">

              <div>
                <p className="text-xs text-gray-500">
                  Module
                </p>

                <p className="font-medium">
                  {form.module || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Action
                </p>

                <p className="font-medium">
                  {form.action || "-"}
                </p>
              </div>

              <div className="col-span-2">
                <p className="text-xs text-gray-500">
                  Permission Key
                </p>

                <code className="rounded bg-white px-2 py-1 text-blue-700">
                  {form.key || "-"}
                </code>
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
            className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? mode === "create"
                ? "Creating..."
                : "Updating..."
              : mode === "create"
              ? "Create Permission"
              : "Update Permission"}
          </button>

        </div>

      </div>
    </div>
  );
}