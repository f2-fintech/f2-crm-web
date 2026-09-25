"use client";

import React from "react";
import {
  BookOpen,
  Users,
  FileText,
  ShieldCheck,
  TrendingUp,
  FolderTree,
} from "lucide-react";

export default function GuidePage() {
  const sections = [
    {
      title: "1. Dashboard & Analytics",
      icon: <TrendingUp className="text-blue-500" size={24} />,
      description:
        "The Dashboard gives you a birds-eye view of your CRM's performance. It includes quick stats for total leads, active users, and recent activities. Use this to track team progress on a daily basis.",
    },
    {
      title: "2. Notion Pages (Workspaces)",
      icon: <FileText className="text-purple-500" size={24} />,
      description:
        "Notion-style pages act as your core data hub. You can create 'Sheets' for tabular lead data or 'Pages' for rich text. Pages can be 'Private' (only for you) or 'Shared' (accessible to your team based on roles). You can also assign pages to specific team members.",
    },
    {
      title: "3. Lead Management",
      icon: <Users className="text-green-500" size={24} />,
      description:
        "Leads can be imported directly into your Notion Sheets. Users with Edit access can paste leads directly from Excel or Google Sheets. Team Leaders and Managers can re-assign leads to specific employees for follow-ups.",
    },
    {
      title: "4. Teams & Hierarchy",
      icon: <FolderTree className="text-orange-500" size={24} />,
      description:
        "The CRM uses a strict hierarchy: Super Admin -> Admin -> Manager -> Team Leader -> Employee. Managers oversee entire teams, while Team Leaders manage direct reports. Employees can only view data assigned to them.",
    },
    {
      title: "5. Roles & Permissions",
      icon: <ShieldCheck className="text-red-500" size={24} />,
      description:
        "Permissions are enforced both on the Frontend and Backend. For example, Employees can create their own private pages, but only Admins and Managers can upload bulk data or delete entire workspaces. You cannot assign tasks outside of your authorized scope.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900 md:p-12">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-sm dark:bg-gray-800 dark:text-gray-100 sm:p-12">
        <div className="mb-10 flex items-center gap-4 border-b border-gray-200 pb-6 dark:border-gray-700">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
            <BookOpen size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              CRM Onboarding Guide
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Everything you need to know to get the most out of your CRM.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {sections.map((section, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-6 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800 sm:flex-row sm:items-start"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-gray-900">
                {section.icon}
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {section.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {section.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-xl bg-indigo-50 p-6 text-center dark:bg-indigo-900/20">
          <h4 className="mb-2 font-medium text-indigo-900 dark:text-indigo-200">
            Need more help?
          </h4>
          <p className="text-sm text-indigo-700 dark:text-indigo-300">
            Reach out to your system administrator or IT support team for role upgrades
            or further technical assistance.
          </p>
        </div>
      </div>
    </div>
  );
}
