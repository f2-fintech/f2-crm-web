"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import SingleSelect from "@/components/ui/SingleSelect";

interface AddMemberModalProps {
  open: boolean;
  teamId: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface IUserOption {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function AddMemberModal({
  open,
  teamId,
  onClose,
  onSuccess,
}: AddMemberModalProps) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<IUserOption[]>([]);
  
  const fetchUsers = async () => {
    try {
      const res = await api.get("/users?limit=200");
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

  const handleClose = () => {
    setForm({
      userId: "",
      reportsTo: "",
    });
    onClose();
  };

  const handleSubmit = async () => {
    if (!form.userId) {
      toast.error("Please select a user to add.");
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
      toast.success("Member added successfully");
      onSuccess();
      handleClose();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.message ||
          "Something went wrong while adding the member."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const userOptions = users.map(u => ({
    value: u._id,
    label: `${u.firstName} ${u.lastName} (${u.email})`
  }));

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-visible rounded-2xl bg-white shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-6 py-5 dark:border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Team Member</h2>
            <p className="text-sm text-gray-500 mt-1">Search and assign an employee to this team.</p>
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-visible px-6 py-6">
          <div className="flex flex-col gap-5">
            <div>
              <SingleSelect
                label="Select User *"
                options={userOptions}
                value={form.userId}
                onChange={(val) => setForm(prev => ({ ...prev, userId: val }))}
                placeholder="Search employee..."
              />
            </div>

            <div>
              <SingleSelect
                label="Reports To (Optional)"
                options={userOptions}
                value={form.reportsTo}
                onChange={(val) => setForm(prev => ({ ...prev, reportsTo: val }))}
                placeholder="Search manager/TL..."
              />
              <p className="mt-2 text-xs text-gray-500">
                Leave empty to use default team hierarchy reporting.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/50 rounded-b-2xl">
          <button
            onClick={handleClose}
            className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 disabled:cursor-not-allowed disabled:opacity-60 flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </>
            ) : (
              "Add Member"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
