"use client";
import React, { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { BellIcon } from "lucide-react";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const router = useRouter();

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleNotificationClick = async (notif: any) => {
    if (!notif.isRead) {
      await markAsRead(notif._id);
    }
    if (notif.relatedPageId) {
      // Navigate to Notion page
      const pageId = typeof notif.relatedPageId === 'string' ? notif.relatedPageId : notif.relatedPageId._id;
      if (pageId) {
        router.push(`/notion-pages?page=${pageId}`);
      }
    }
    closeDropdown();
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="relative dropdown-toggle flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
      >
        <span
          className={`absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400 ${
            unreadCount === 0 ? "hidden" : "flex"
          }`}
        >
          <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
        </span>
        <BellIcon className="w-5 h-5" />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Notifications ({unreadCount})
          </h5>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-brand-500 hover:text-brand-600 dark:text-brand-400 font-medium"
            >
              Mark all read
            </button>
          )}
        </div>
        
        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 mt-10">
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <li key={notif._id}>
                <DropdownItem
                  onItemClick={() => handleNotificationClick(notif)}
                  className={`flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5 cursor-pointer ${
                    !notif.isRead ? "bg-brand-50/50 dark:bg-brand-900/10" : ""
                  }`}
                >
                  <span className="block w-full">
                    <span className="mb-1 block text-theme-sm text-gray-800 dark:text-white/90">
                      {notif.title}
                    </span>
                    <span className="mb-1 block text-theme-xs text-gray-500 dark:text-gray-400">
                      {notif.message}
                    </span>
                    <span className="flex items-center justify-between text-gray-400 text-theme-xs">
                      <span>{formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}</span>
                      {!notif.isRead && <span className="w-2 h-2 bg-brand-500 rounded-full"></span>}
                    </span>
                  </span>
                </DropdownItem>
              </li>
            ))
          )}
        </ul>
      </Dropdown>
    </div>
  );
}
