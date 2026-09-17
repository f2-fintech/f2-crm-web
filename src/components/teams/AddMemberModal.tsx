"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

interface AddMemberModalProps {
  open: boolean;
  teamId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddMemberModal({
  open,
  teamId,
  onClose,
  onSuccess,
}: AddMemberModalProps) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  
  // We can fetch existing team members to populate the 'Reports To' dropdown
  // For simplicity, we might just fetch all users or use the team's hierarchy to flatten members.
  // But let's just fetch users.
  const fetchUsers = async () => {
    try {
      const res = await api.get("/users?limit=100");
      let usersList = [];
      if (Array.isArray(res.data)) {
        usersList = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        usersList = res.data.data;
      } else if (res.data?.data?.data && Array.isArray(res.data.data.data)) {
        usersList = res.data.data.data;
      } else if (res.data?.users && Array.isArray(res.data.users)) {
        usersList = res.data.users;
      }
      setUsers(usersList);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const [form, setForm] = useState({
    userId: "",
    reportsTo: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClose = () => {
    setForm({
      userId: "",
      reportsTo: "",
    });
    onClose();
  };

  const handleSubmit = async () => {
    if (!form.userId) {
      alert("Please select a user to add.");
      return;
    }

    try {
      setLoading(true);
      // Clean up empty reportsTo
      const payload: any = { userId: form.userId };
      if (form.reportsTo) {
        payload.reportsTo = form.reportsTo;
      }

      await api.post(`/teams/${teamId}/members`, payload);
      alert("Member added successfully");
      onSuccess();
      handleClose();
    } catch (err: any) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          "Something went wrong while adding the member."
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
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 dark:bg-gray-900 border dark:border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold dark:text-white">Add Team Member</h2>

          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <label className="mb-2 block text-sm font-medium dark:text-gray-300">
              Select User <span className="text-error-500">*</span>
            </label>
            <select
              name="userId"
              value={form.userId}
              onChange={handleChange}
              className="w-full rounded-lg border p-3 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.firstName} {user.lastName} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium dark:text-gray-300">
              Reports To (Optional)
            </label>
            <select
              name="reportsTo"
              value={form.reportsTo}
              onChange={handleChange}
              className="w-full rounded-lg border p-3 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="">Select Manager/Leader</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Leave blank to report directly to the team manager.
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="rounded-lg border px-5 py-2 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-lg bg-brand-500 px-6 py-2 text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Member"}
          </button>
        </div>
      </div>
    </div>
  );
}
