"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/axios";

import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";

interface UserProfile {
  _id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImage?: string;
  isActive: boolean;
  lastLogin: string;

  roleId: {
    _id: string;
    name: string;
    displayName: string;
  };
}

export default function UserInfoCard() {
  const { isOpen, openModal, closeModal } = useModal();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get("/auth/profile");
        const profile = res.data.data ?? res.data;
        setUser(profile);
        setForm({
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          email: profile.email || "",
          phone: profile.phone || "",
        });
      } catch (error) {
        console.error("Profile Error :", error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleOpenModal = () => {
    if (user) {
      setForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
    openModal();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      let res;
      try {
        res = await api.patch("/auth/profile", form);
      } catch (err) {
        res = await api.put("/auth/profile", form);
      }
      const profile = res.data.data ?? res.data;
      setUser((prev) => (prev ? { ...prev, ...profile, ...form } : profile));
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify({ ...user, ...profile, ...form }));
        window.dispatchEvent(new Event("storage"));
      }
      closeModal();
    } catch (error) {
      console.error("Save Profile Error:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 border rounded-2xl">Loading...</div>;
  if (!user) return <div className="p-6 border rounded-2xl text-red-500">Unable to load profile.</div>;

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Personal Information
        </h4>
        <button
          onClick={handleOpenModal}
          className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
        >
          Edit Details
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">First Name</p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">{user.firstName}</p>
        </div>
        <div>
          <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">Last Name</p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">{user.lastName}</p>
        </div>
        <div>
          <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">Email Address</p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">{user.email}</p>
        </div>
        <div>
          <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">Phone</p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">{user.phone || "--"}</p>
        </div>
        <div>
          <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">Employee ID</p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">{user.employeeId || "N/A"}</p>
        </div>
        <div>
          <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">Last Login</p>
          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
            {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}
          </p>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[500px] m-4">
        <div className="relative w-full max-h-[85vh] overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900">
          <h3 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white">
            Edit Personal Details
          </h3>
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="flex flex-col gap-5">
              <div>
                <Label>First Name</Label>
                <Input type="text" name="firstName" value={form.firstName} onChange={handleInputChange} required />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input type="text" name="lastName" value={form.lastName} onChange={handleInputChange} required />
              </div>
              <div>
                <Label>Email Address</Label>
                <Input type="email" name="email" value={form.email} disabled />
                <span className="text-[11px] text-gray-400 mt-0.5 block">Email cannot be changed directly.</span>
              </div>
              <div>
                <Label>Phone</Label>
                <Input type="text" name="phone" value={form.phone} onChange={handleInputChange} />
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <Button type="button" variant="outline" size="sm" onClick={closeModal} disabled={saving}>Cancel</Button>
              <Button type="submit" size="sm" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
