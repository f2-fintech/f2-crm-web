"use client";

import TranslateDropdown from "@/components/header/TranslateDropdown";
import NotificationDropdown from "@/components/header/NotificationDropdown";
import UserDropdown from "@/components/header/UserDropdown";
import { useSidebar } from "@/context/SidebarContext";
import { usePathname } from "next/navigation";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Plus,
  Languages,
  Calendar,
  Bot,
  Settings,
  Grid3x3,
} from "lucide-react";

// Maps a route to the title shown on the left of the header.
// Add a route here whenever a new page is created.
const PAGE_TITLES: Record<string, string> = {
  "/": "Home",
  "/workqueue": "Workqueue",
  "/reports": "Reports",
  "/analytics": "Analytics",
  "/my-requests": "My Requests",
  "/leads": "Leads",
  "/customers": "Customers",
  "/applications": "Applications",
  "/followups": "Follow Ups",
  "/agents": "Agents",
  "/users": "Users",
  "/roles": "Roles",
  "/permissions": "Permissions",
  "/departments": "Departments",
  "/branches": "Branches",
  "/integrations": "Integrations",
  "/settings": "Settings",
};

function getPageTitle(pathname: string) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  const segment = pathname.split("/").filter(Boolean).pop() ?? "";
  return segment
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ") || "Home";
}

function IconButton({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
    >
      {children}
    </button>
  );
}

const AppHeader: React.FC = () => {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-[9999] flex h-16 w-full items-center border-b border-gray-200 bg-white px-3 lg:px-6">
      <div className="flex w-full items-center justify-between gap-3">
        {/* Left: sidebar toggle + page title */}
        <div className="flex items-center gap-3">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 lg:h-11 lg:w-11"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z"
                  fill="currentColor"
                />
              </svg>
            )}
          </button>

          <h1 className="hidden text-xl font-semibold text-gray-800 sm:block">
            {pageTitle}
          </h1>
        </div>

        {/* Right: search + quick create + utility icons + avatar + apps */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-3 w-auto">
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="global-search"
              ref={inputRef}
              type="text"
              placeholder="Search records"
              className="h-10 w-64 rounded-lg border-none bg-gray-100 pl-9 pr-12 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 xl:w-80"
            />
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] text-gray-400">
              ⌘K
            </span>
          </div>

          <button
            id="quick-create-btn"
            title="Quick create"
            aria-label="Quick create"
            className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-indigo-500 text-indigo-500 transition-colors hover:bg-indigo-50"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
          </button>

          <TranslateDropdown />

          <NotificationDropdown />

          <div className="hidden sm:block">
            <Link href="/calendar">
              <IconButton title="Calendar">
                <Calendar className="h-[18px] w-[18px]" />
              </IconButton>
            </Link>
          </div>

          <div className="hidden sm:block">
            <IconButton title="Assistant">
              <Bot className="h-[18px] w-[18px]" />
            </IconButton>
          </div>

          <div className="hidden sm:flex">
            <button
              id="start-tour-btn"
              title="Help / Guide"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              onClick={() => window.dispatchEvent(new Event('start-guide-tour'))}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </button>
          </div>

          <div className="hidden sm:block">
            <IconButton title="Settings">
              <Settings className="h-[18px] w-[18px]" />
            </IconButton>
          </div>

          <UserDropdown />

          <div className="hidden h-6 w-px bg-gray-200 sm:block" />

          <div className="hidden sm:block">
            <IconButton title="Apps">
              <Grid3x3 className="h-[18px] w-[18px]" />
            </IconButton>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;