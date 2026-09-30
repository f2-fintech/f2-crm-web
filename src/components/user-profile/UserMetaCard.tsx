"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Camera, LogOut, KeyRound } from "lucide-react";
import api from "@/lib/axios";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import InternalChangePasswordModal from "./InternalChangePasswordModal";

interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
  isActive: boolean;
  roleId?: {
    _id: string;
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
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [form, setForm] = useState({ profileImage: "" });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get("/auth/profile");
        const profile = res.data.data ?? res.data;
        setUser(profile);
        setForm({ profileImage: profile.profileImage || "" });
      } catch (error) {
        console.error("Profile Error :", error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let res;
      try {
        res = await api.patch("/auth/profile", form);
      } catch {
        res = await api.put("/auth/profile", form);
      }
      const updatedProfile = res.data.data ?? res.data;
      const mergedUser = { ...user, ...updatedProfile, ...form } as UserProfile;
      setUser(mergedUser);
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(mergedUser));
        window.dispatchEvent(new Event("storage"));
      }
      closeModal();
    } catch (error) {
      console.error("Save Profile Error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout Error:", error);
    } finally {
      localStorage.clear();
      document.cookie = "accessToken=; Max-Age=0; path=/;";
      document.cookie = "refreshToken=; Max-Age=0; path=/;";
      window.location.href = "/login";
    }
  };

  if (loading) return <div className="h-64 rounded-2xl border flex items-center justify-center">Loading...</div>;
  if (!user) return <div className="h-64 rounded-2xl border text-red-500 flex items-center justify-center">Error loading profile.</div>;

  return (
    <>
      <div className="flex flex-col items-center p-6 border border-gray-200 rounded-2xl bg-white dark:bg-gray-900 dark:border-gray-800 shadow-sm relative overflow-hidden">
        {/* Banner Background */}
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-brand-500/20 to-brand-600/20 dark:from-brand-500/10 dark:to-brand-600/10"></div>
        
        {/* Avatar */}
        <div className="relative mt-8 mb-4">
          <div className="h-28 w-28 rounded-full border-4 border-white dark:border-gray-900 shadow-lg overflow-hidden bg-white z-10 relative">
            {user.profileImage && user.profileImage !== "#" && user.profileImage !== "/images/user/owner.jpg" ? (
              <Image src={user.profileImage} alt="Profile" width={112} height={112} className="h-full w-full object-cover" unoptimized />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-brand-500 text-4xl font-bold text-white">
                {getInitials(user.firstName, user.lastName)}
              </div>
            )}
          </div>
          <button 
            onClick={() => { setForm({ profileImage: user.profileImage || "" }); openModal(); }}
            className="absolute bottom-1 right-1 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-md text-gray-600 hover:text-brand-500 transition-colors z-20"
          >
            <Camera size={16} />
          </button>
        </div>

        {/* User Info */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center">
          {user.firstName} {user.lastName}
        </h2>
        <p className="text-sm font-medium text-brand-600 dark:text-brand-400 mt-1 mb-4 text-center">
          {user.roleId?.displayName || "User"}
        </p>
        
        <div className="flex items-center gap-2 mb-6">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
            {user.isActive ? 'Active Account' : 'Inactive Account'}
          </span>
        </div>

        <div className="w-full h-px bg-gray-200 dark:bg-gray-800 mb-6"></div>

        {/* Quick Actions */}
        <div className="w-full flex flex-col gap-3">
          <button 
            onClick={() => setIsPasswordModalOpen(true)}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 hover:text-brand-600 transition-colors dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <KeyRound size={16} />
            Change Password
          </button>
          
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-colors dark:bg-red-900/10 dark:border-red-900/20 dark:hover:bg-red-900/30"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>

      <InternalChangePasswordModal 
        open={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[400px] m-4">
        <div className="relative w-full max-h-[85vh] overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900">
          <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">
            Update Avatar
          </h3>
          <form onSubmit={handleSave}>
            <div className="flex flex-col gap-4">
              <div>
                <Label>Profile Image URL</Label>
                <Input
                  type="text"
                  name="profileImage"
                  placeholder="https://example.com/avatar.jpg"
                  value={form.profileImage}
                  onChange={(e: any) => setForm({ profileImage: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <Button variant="outline" size="sm" type="button" onClick={closeModal} disabled={saving}>Cancel</Button>
              <Button size="sm" type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}