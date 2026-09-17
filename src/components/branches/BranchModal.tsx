"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

interface Props {
  open: boolean;
  mode: "create" | "edit";
  branch?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BranchModal({
  open,
  mode,
  branch,
  onClose,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    branchCode: "",
    branchName: "",
    city: "",
    state: "",
    address: "",
    phone: "",
    email: "",
    manager: "",
    isActive: true,
  });

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && branch) {
      setForm({
        branchCode: branch.branchCode || "",
        branchName: branch.branchName || "",
        city: branch.city || "",
        state: branch.state || "",
        address: branch.address || "",
        phone: branch.phone || "",
        email: branch.email || "",
        manager: branch.manager || "",
        isActive: branch.isActive,
      });
    } else {
      setForm({
        branchCode: "",
        branchName: "",
        city: "",
        state: "",
        address: "",
        phone: "",
        email: "",
        manager: "",
        isActive: true,
      });
    }
  }, [open, mode, branch]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
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
      branchCode: "",
      branchName: "",
      city: "",
      state: "",
      address: "",
      phone: "",
      email: "",
      manager: "",
      isActive: true,
    });

    onClose();
  };

  const handleSubmit = async () => {
    if (!form.branchCode.trim()) {
      return alert("Branch Code is required");
    }

    if (!form.branchName.trim()) {
      return alert("Branch Name is required");
    }

    if (!form.city.trim()) {
      return alert("City is required");
    }

    if (!form.state.trim()) {
      return alert("State is required");
    }

    try {
      setLoading(true);

      const payload = {
        ...form,
      };

      const res =
        mode === "create"
          ? await api.post("/branches", payload)
          : await api.patch(
              `/branches/${branch._id}`,
              payload
            );

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
        className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        {/* Header */}

        <div className="flex items-center justify-between border-b px-6 py-5">

          <div>

            <h2 className="text-xl font-semibold">
              {mode === "create"
                ? "Add Branch"
                : "Edit Branch"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Manage branch information.
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
                Branch Code
              </label>

              <input
                name="branchCode"
                value={form.branchCode}
                onChange={handleChange}
                placeholder="NOIDA001"
                className="w-full rounded-lg border p-3"
              />

            </div>

            <div>

              <label className="mb-2 block text-sm font-medium">
                Branch Name
              </label>

              <input
                name="branchName"
                value={form.branchName}
                onChange={handleChange}
                placeholder="Noida Branch"
                className="w-full rounded-lg border p-3"
              />

            </div>

            <div>

              <label className="mb-2 block text-sm font-medium">
                City
              </label>

              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Noida"
                className="w-full rounded-lg border p-3"
              />

            </div>

            <div>

              <label className="mb-2 block text-sm font-medium">
                State
              </label>

              <input
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="Uttar Pradesh"
                className="w-full rounded-lg border p-3"
              />

            </div>
            <div className="col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Address
              </label>

              <textarea
                rows={3}
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Enter branch address..."
                className="w-full rounded-lg border p-3"
              />

            </div>

            <div>

              <label className="mb-2 block text-sm font-medium">
                Phone
              </label>

              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 9876543210"
                className="w-full rounded-lg border p-3"
              />

            </div>

            <div>

              <label className="mb-2 block text-sm font-medium">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="branch@company.com"
                className="w-full rounded-lg border p-3"
              />

            </div>

            <div>

              <label className="mb-2 block text-sm font-medium">
                Branch Manager
              </label>

              <input
                name="manager"
                value={form.manager}
                onChange={handleChange}
                placeholder="Prashant Kumar"
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
                    isActive:
                      e.target.value === "true",
                  })
                }
                className="w-full rounded-lg border p-3"
              >
                <option value="true">
                  Active
                </option>

                <option value="false">
                  Inactive
                </option>

              </select>

            </div>
          </div>
          {/* Preview */}

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">

            <h3 className="mb-4 text-base font-semibold text-blue-700">
              Branch Preview
            </h3>

            <div className="grid grid-cols-2 gap-5">

              <div>

                <p className="text-xs text-gray-500">
                  Branch Code
                </p>

                <p className="font-medium">
                  {form.branchCode || "-"}
                </p>

              </div>

              <div>

                <p className="text-xs text-gray-500">
                  Branch Name
                </p>

                <p className="font-medium">
                  {form.branchName || "-"}
                </p>

              </div>

              <div>

                <p className="text-xs text-gray-500">
                  City
                </p>

                <p className="font-medium">
                  {form.city || "-"}
                </p>

              </div>

              <div>

                <p className="text-xs text-gray-500">
                  State
                </p>

                <p className="font-medium">
                  {form.state || "-"}
                </p>

              </div>

              <div>

                <p className="text-xs text-gray-500">
                  Branch Manager
                </p>

                <p className="font-medium">
                  {form.manager || "-"}
                </p>

              </div>

              <div>

                <p className="text-xs text-gray-500">
                  Status
                </p>

                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    form.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {form.isActive
                    ? "Active"
                    : "Inactive"}
                </span>

              </div>

              <div className="col-span-2">

                <p className="text-xs text-gray-500">
                  Address
                </p>

                <p className="font-medium">
                  {form.address || "-"}
                </p>

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
              ? "Save Branch"
              : "Update Branch"}
          </button>

        </div>

      </div>
    </div>
  );
}

            