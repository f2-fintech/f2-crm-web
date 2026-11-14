import UserAddressCard from "@/components/user-profile/UserAddressCard";
import UserMetaCard from "@/components/user-profile/UserMetaCard";
import UserInfoCard from "@/components/user-profile/UserInfoCard";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "User Profile | F2 CRM",
  description:
    "This is the user profile page of F2 CRM, where users can view and edit their personal information, contact details, and address.",
};

export default function Profile() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Profile
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your personal information, security, and preferences.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Sidebar (Profile Summary & Quick Actions) */}
        <div className="xl:col-span-1 flex flex-col gap-6">
          <UserMetaCard />
        </div>

        {/* Right Main Content (Detailed Information) */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <UserInfoCard />
          <UserAddressCard />
        </div>
      </div>
    </div>
  );
}
