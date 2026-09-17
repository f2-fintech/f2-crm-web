"use client";

import api from "@/lib/axios";
import { useState } from "react";
import { Trash2, X } from "lucide-react";

interface Props {
  open: boolean;
  role: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteRoleModal({
  open,
  role,
  onClose,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);

  if (!open || !role) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);

      const res = await api.delete(`/roles/${role._id}`);

      alert(res.data.message);

      onSuccess();

      onClose();
    } catch (err: any) {
      alert(
        err?.response?.data?.message ||
          "Failed to delete role."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
      >
        {/* Header */}

        <div className="flex items-center justify-between border-b px-6 py-5">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100">

              <Trash2
                size={22}
                className="text-red-600"
              />

            </div>

            <div>

              <h2 className="text-lg font-semibold text-gray-800">
                Delete Role
              </h2>

              <p className="text-sm text-gray-500">
                This action cannot be undone.
              </p>

            </div>

          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-500"
          >
            <X size={18} />
          </button>

        </div>

        {/* Body */}

        <div className="px-6 py-6">

          <p className="text-sm leading-6 text-gray-600">
            Are you sure you want to delete the role
            <span className="mx-1 font-semibold text-gray-900">
              "{role.displayName}"
            </span>
            ?
          </p>

          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">

            <h4 className="font-medium text-red-700">
              Warning
            </h4>

            <ul className="mt-2 list-disc pl-5 text-sm text-red-600">

              <li>
                Users assigned to this role may lose
                access.
              </li>

              <li>
                This operation cannot be reverted.
              </li>

            </ul>

          </div>

        </div>

        {/* Footer */}

        <div className="flex justify-end gap-3 border-t px-6 py-5">

          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            disabled={loading}
            className="rounded-lg bg-red-600 px-6 py-2.5 font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {loading
              ? "Deleting..."
              : "Delete Role"}
          </button>

        </div>

      </div>
    </div>
  );
}