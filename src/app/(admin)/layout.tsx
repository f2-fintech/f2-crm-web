"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import AppFooter from "@/components/footer/AppFooter";
import RoleGuard from "@/components/auth/RoleGuard";
import React from "react";
import GuideTour from "@/components/tour/GuideTour";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex">
      <GuideTour />
      <AppSidebar />
      <Backdrop />
      <div
  className={`flex-1 min-w-0 transition-all duration-300 ease-in-out ${mainContentMargin}`}
>
        <AppHeader />
        <div className="p-4 pb-16 mx-auto max-w-(--breakpoint-2xl) md:p-6 md:pb-16">
          <RoleGuard>
            {children}
          </RoleGuard>
        </div>

        <AppFooter />
      </div>
    </div>
  );
}
