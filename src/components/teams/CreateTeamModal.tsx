"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

interface CreateTeamModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface IUserOption {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function CreateTeamModal({
  open,
  onClose,
  onSuccess,
}: CreateTeamModalProps) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<IUserOption[]>([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    managerId: "",
  });

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users?limit=100"); // fetch some users for manager selection
      const usersList = Array.isArray(res.data) ? res.data : res.data.data || [];
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
      name: "",
      description: "",
      managerId: "",
    });
    onClose();
  };

  const handleSubmit = async () => {
    if (!form.name || !form.managerId) {
      alert("Please provide a name and select a manager.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/teams", form);
      alert("Team created successfully");
      onSuccess();
      handleClose();
    } catch (err: any) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          "Something went wrong while creating the team."
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
          <h2 className="text-xl font-semibold dark:text-white">Create New Team</h2>

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
              Team Name <span className="text-error-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-lg border p-3 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              placeholder="E.g., Sales Team North"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium dark:text-gray-300">
              Description
            </label>
            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full rounded-lg border p-3 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              placeholder="Team description..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium dark:text-gray-300">
              Manager <span className="text-error-500">*</span>
            </label>
            <select
              name="managerId"
              value={form.managerId}
              onChange={handleChange}
              className="w-full rounded-lg border p-3 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="">Select Manager</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.firstName} {user.lastName} ({user.email})
                </option>
              ))}
            </select>
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
            {loading ? "Creating..." : "Create Team"}
          </button>
        </div>
      </div>
    </div>
  );
}
