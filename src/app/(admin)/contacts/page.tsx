"use client";

import React, { useEffect, useState } from "react";
import { Search, Mail, Phone, Building2, Inbox, Users } from "lucide-react";
import api from "@/lib/axios";

interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profileImage?: string;
  isActive: boolean;
  roleId?: { name: string; displayName?: string };
  departmentId?: { name: string; departmentName?: string };
  teamId?: { _id: string; name: string };
}

const initials = (f?: string, l?: string) =>
  `${f?.[0] ?? ""}${l?.[0] ?? ""}`.toUpperCase() || "?";

const avatarPalette = [
  "bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300",
  "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
];

const getAvatarColor = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return avatarPalette[Math.abs(hash) % avatarPalette.length];
};

export default function ContactsPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // fetch all users without pagination limit (or a high limit) to show all contacts
        const { data } = await api.get("/users", { params: { limit: 1000 } });
        const list = Array.isArray(data) ? data : data.data || [];
        setUsers(list);
      } catch (err) {
        console.error("Failed to load contacts", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase();
    return (
      u.firstName?.toLowerCase().includes(term) ||
      u.lastName?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.teamId?.name?.toLowerCase().includes(term)
    );
  });

  // Group by team
  const groupedContacts = filteredUsers.reduce((acc, user) => {
    const teamName = user.teamId?.name || "Unassigned";
    if (!acc[teamName]) {
      acc[teamName] = [];
    }
    acc[teamName].push(user);
    return acc;
  }, {} as Record<string, IUser[]>);

  const sortedTeamNames = Object.keys(groupedContacts).sort((a, b) => {
    if (a === "Unassigned") return 1;
    if (b === "Unassigned") return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Team Contacts
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Directory of all registered members grouped by their respective teams.
          </p>
        </div>
        <div className="relative w-full max-w-sm">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search contacts or teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-800 shadow-sm outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-400 dark:focus:ring-brand-400"
          />
        </div>
      </div>

      {/* Contacts List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-white dark:bg-gray-800" />
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-16 dark:border-gray-800 dark:bg-gray-800/50">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-50 text-gray-400 dark:bg-gray-800">
            <Inbox size={28} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No contacts found</h3>
          <p className="mt-1 text-sm text-gray-500">We couldn't find any users matching your search.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedTeamNames.map((teamName) => (
            <div key={teamName} className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <Users size={18} className="text-brand-500" />
                <h3 className="text-lg font-medium text-gray-800 dark:text-white/90">
                  {teamName}
                </h3>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  {groupedContacts[teamName].length}
                </span>
              </div>
              
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {groupedContacts[teamName].map((user) => (
                    <div
                      key={user._id}
                      className="group flex items-center justify-between p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <div className="flex items-center gap-4">
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt={user.firstName}
                            className="h-10 w-10 rounded-full border border-gray-100 object-cover dark:border-gray-700"
                          />
                        ) : (
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${getAvatarColor(
                              user._id
                            )}`}
                          >
                            {initials(user.firstName, user.lastName)}
                          </div>
                        )}
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                            {user.firstName} {user.lastName}
                          </h3>
                          <p className="text-xs font-medium text-brand-600 dark:text-brand-400">
                            {user.roleId?.displayName || user.roleId?.name || "Member"}
                          </p>
                        </div>
                      </div>

                      <div className="hidden items-center gap-6 sm:flex">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Mail size={14} className="text-gray-400" />
                          <span>{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Phone size={14} className="text-gray-400" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                        {user.departmentId && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Building2 size={14} className="text-gray-400" />
                            <span>
                              {user.departmentId.departmentName || user.departmentId.name}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Mobile view info icon or quick action */}
                      <div className="sm:hidden">
                        <a href={`mailto:${user.email}`} className="p-2 text-gray-400 hover:text-brand-500">
                          <Mail size={18} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
