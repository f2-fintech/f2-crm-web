"use client";

import { useState } from "react";
import api from "@/lib/axios";

interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  employeeId?: string;
}

interface DeleteUserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: IUser | null;
}

export default function DeleteUserModal({
  open,
  onClose,
  onSuccess,
  user,
}: DeleteUserModalProps) {
  const [loading, setLoading] = useState(false);

  if (!open || !user) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);

      const res = await api.delete(`/users/${user._id}`);

      alert(res.data.message);

      onSuccess();
      onClose();
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          "Failed to delete user."
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
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-red-600">
          Delete User
        </h2>

        <p className="mt-4 text-gray-600">
          Are you sure you want to delete
          <strong>
            {" "}
            {user.firstName} {user.lastName}
          </strong>
          ?
        </p>

        <p className="mt-2 text-sm text-red-500">
          This action cannot be undone.
        </p>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border px-5 py-2"
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            disabled={loading}
            className="rounded-lg bg-red-600 px-5 py-2 text-white"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}