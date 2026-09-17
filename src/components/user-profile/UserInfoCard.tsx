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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
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

  if (loading) {
    return (
      <div className="p-6 border rounded-2xl">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 border rounded-2xl text-red-500">
        Unable to load profile.
      </div>
    );
  }

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

        <div>

          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Personal Information
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                First Name
              </p>

              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.firstName}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Last Name
              </p>

              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.lastName}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Email Address
              </p>

              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.email}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Phone
              </p>

              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.phone}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Employee ID
              </p>

              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.employeeId}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Role
              </p>

              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.roleId.displayName}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Status
              </p>

              <p
                className={`text-sm font-medium ${
                  user.isActive
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                {user.isActive ? "Active" : "Inactive"}
              </p>
            </div>

          </div>

        </div>

        <button
          onClick={handleOpenModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 lg:inline-flex lg:w-auto"
        >
          Edit
        </button>

      </div>
            <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[700px] m-4"
      >
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">

          <div className="mb-6">
            <h4 className="text-2xl font-semibold text-gray-800 dark:text-white">
              Edit Personal Information
            </h4>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Update your profile information.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

              <div>
                <Label>First Name</Label>

                <Input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label>Last Name</Label>

                <Input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label>Email Address</Label>

                <Input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label>Phone</Label>

                <Input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label>Employee ID</Label>

                <Input
                  type="text"
                  value={user.employeeId}
                  disabled
                />
              </div>

              <div>
                <Label>Role</Label>

                <Input
                  type="text"
                  value={user.roleId.displayName}
                  disabled
                />
              </div>

              <div>
                <Label>Status</Label>

                <Input
                  type="text"
                  value={user.isActive ? "Active" : "Inactive"}
                  disabled
                />
              </div>

              <div>
                <Label>Last Login</Label>

                <Input
                  type="text"
                  value={new Date(user.lastLogin).toLocaleString()}
                  disabled
                />
              </div>

            </div>

            <div className="mt-8 flex justify-end gap-3">

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={closeModal}
                disabled={saving}
              >
                Close
              </Button>

              <Button
                type="submit"
                size="sm"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>

            </div>

          </form>

        </div>
      </Modal>

    </div>
  );
}