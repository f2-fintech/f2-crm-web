"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function InternalChangePasswordModal({ open, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClose = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      return toast.error("All fields are required");
    }
    if (newPassword.length < 8) {
      return toast.error("New password must be at least 8 characters");
    }
    if (newPassword !== confirmPassword) {
      return toast.error("New passwords do not match");
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      toast.success(res.data.message || "Password changed successfully");
      onSuccess?.();
      handleClose();
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      toast.error(
        Array.isArray(msg) ? msg[0] : (msg || "Failed to update password")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={open} onClose={handleClose} className="max-w-[500px] m-4">
      <div className="no-scrollbar relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h4 className="text-2xl font-semibold text-gray-800 dark:text-white">
              Change Password
            </h4>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Update your account password.
            </p>
          </div>
          <button
            onClick={handleClose}
            type="button"
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-5">
            <div>
              <Label>Current Password</Label>
              <div className="relative">
                <Input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e: any) => setCurrentPassword(e.target.value)}
                  placeholder="Enter Current Password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600"
                >
                  {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <Label>New Password</Label>
              <div className="relative">
                <Input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e: any) => setNewPassword(e.target.value)}
                  placeholder="Enter New Password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600"
                >
                  {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <Label>Confirm New Password</Label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e: any) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm New Password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600"
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Saving..." : "Change Password"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
