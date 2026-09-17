"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

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

  roleId?: {
    _id: string;
    name: string;
    displayName: string;
  };
}

const getInitials = (firstName?: string, lastName?: string) => {
  const f = firstName?.trim() ? firstName.trim()[0] : "";
  const l = lastName?.trim() ? lastName.trim()[0] : "";
  if (f || l) return `${f}${l}`.toUpperCase();
  return "U";
};

export default function UserMetaCard() {
  const { isOpen, openModal, closeModal } = useModal();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [user, setUser] = useState<UserProfile | null>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profileImage: "",
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
          profileImage: profile.profileImage || "",
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
    setErrorMessage(null);
    if (user) {
      setForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        profileImage: user.profileImage || "",
      });
    }
    openModal();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSaving(true);

    try {
      let res;
      try {
        res = await api.patch("/auth/profile", form);
      } catch {
        res = await api.put("/auth/profile", form);
      }

      const updatedProfile = res.data.data ?? res.data;
      const mergedUser = { ...user, ...updatedProfile, ...form };

      setUser(mergedUser);

      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(mergedUser));
        window.dispatchEvent(new Event("storage"));
      }

      closeModal();
    } catch (error: any) {
      console.error("Save Profile Error:", error);
      setErrorMessage(
        error?.response?.data?.message || "Failed to update profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-gray-200 p-6 text-gray-500 dark:border-gray-800">
        Loading Profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 border border-red-200 rounded-2xl text-red-500 bg-red-50 dark:bg-red-950/20 dark:border-red-900/30">
        Unable to load profile. Please refresh or login again.
      </div>
    );
  }

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 bg-white dark:bg-gray-900">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {user.profileImage &&
            user.profileImage !== "#" &&
            user.profileImage !== "/images/user/owner.jpg" ? (
              <Image
                src={user.profileImage}
                alt="Profile"
                width={90}
                height={90}
                className="h-[90px] w-[90px] rounded-full border border-gray-200 object-cover dark:border-gray-700"
                unoptimized
              />
            ) : (
              <div className="flex h-[90px] w-[90px] shrink-0 items-center justify-center rounded-full bg-brand-500 text-3xl font-bold text-white shadow-md border border-brand-600">
                {getInitials(user.firstName, user.lastName)}
              </div>
            )}

            <div>
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">
                {user.firstName} {user.lastName}
              </h3>

              <p className="mt-1 text-sm font-medium text-brand-500">
                {user.roleId?.displayName || "User"}
              </p>

              <div className="mt-3 space-y-1.5">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Employee ID :
                  <span className="ml-2 font-semibold text-gray-800 dark:text-gray-100">
                    {user.employeeId || "N/A"}
                  </span>
                </p>

                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Email :
                  <span className="ml-2 text-gray-800 dark:text-gray-100">
                    {user.email}
                  </span>
                </p>

                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Phone :
                  <span className="ml-2 text-gray-800 dark:text-gray-100">
                    {user.phone || "Not set"}
                  </span>
                </p>

                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Status :
                  <span
                    className={`ml-2 font-semibold ${
                      user.isActive ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </p>

                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Last Login :
                  <span className="ml-2 text-gray-800 dark:text-gray-100">
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleString()
                      : "Never"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleOpenModal}
            className="flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Edit Profile
          </button>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full max-h-[85vh] overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900">
          <h3 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-white">
            Edit Profile
          </h3>

          {errorMessage && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200 dark:bg-red-950/30 dark:border-red-900/50">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <Label>First Name</Label>
                <Input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label>Last Name</Label>
                <Input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label>Profile Image URL</Label>
                <Input
                  type="text"
                  name="profileImage"
                  placeholder="https://example.com/avatar.jpg"
                  value={form.profileImage}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleInputChange}
                  disabled
                />
                <span className="text-[11px] text-gray-400 mt-0.5 block">
                  Email cannot be edited directly.
                </span>
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
                  value={user.employeeId || ""}
                  disabled
                />
              </div>

              <div>
                <Label>Role</Label>
                <Input
                  type="text"
                  value={user.roleId?.displayName || "N/A"}
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
                  value={
                    user.lastLogin
                      ? new Date(user.lastLogin).toLocaleString()
                      : "N/A"
                  }
                  disabled
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={closeModal}
                disabled={saving}
              >
                Cancel
              </Button>

              <Button
                size="sm"
                type="submit"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}