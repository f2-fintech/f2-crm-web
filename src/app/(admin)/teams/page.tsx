"use client";

import { useEffect, useState, useMemo } from "react";
import { Plus, Users as UsersIcon, Eye, Pencil, Trash2, Search, X, GitBranch } from "lucide-react";
import Link from "next/link";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import CreateTeamModal from "@/components/teams/CreateTeamModal";
import UpdateTeamModal from "@/components/teams/UpdateTeamModal";
import Pagination from "@/components/tables/Pagination";
import { useAuth } from "@/hooks/useAuth";

interface ITeam {
  _id: string;
  name: string;
  description?: string;
  managerId?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  members: any[];
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<ITeam[]>([]);
  const [loading, setLoading] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState<ITeam | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isSuperAdmin, isAdmin, isManager } = useAuth();
  const isTeamLeader = user?.role === "TEAM_LEADER";
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const userId = user?._id || user?.id;
      const { data } = await api.get("/teams", {
        params: userId ? { userId } : {},
      });
      setTeams(data.data || data);
    } catch (error) {
      console.error("Failed to fetch teams", error);
      toast.error("Failed to fetch teams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [user]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete team "${name}"?`)) return;
    try {
      setLoading(true);
      await api.delete(`/teams/${id}`);
      toast.success(`Team "${name}" deleted successfully`);
      fetchTeams();
    } catch (err: any) {
      console.error("Failed to delete team", err);
      toast.error(err?.response?.data?.message || "Failed to delete team");
      setLoading(false);
    }
  };

  // Restrict teams strictly to the logged-in user's own team if Manager or TL
  const userAllowedTeams = useMemo(() => {
    if (isSuperAdmin || isAdmin) return teams;
    const userIdStr = String(user?._id || user?.id || "");
    const userTeamIdStr = String(user?.teamId || "");

    return teams.filter((t) => {
      const managerIdStr = String(t.managerId?._id || t.managerId || "");
      const isMyManagedTeam = managerIdStr === userIdStr;
      const isMyAssignedTeam = t._id === userTeamIdStr;
      const isMember = (t.members || []).some(
        (m: any) => String(m?._id || m) === userIdStr,
      );
      return isMyManagedTeam || isMyAssignedTeam || isMember;
    });
  }, [teams, isSuperAdmin, isAdmin, user]);

  // Search filter
  const filteredTeams = useMemo(() => {
    if (!searchQuery.trim()) return userAllowedTeams;
    const q = searchQuery.toLowerCase().trim();
    return userAllowedTeams.filter((t) => {
      const nameMatch = t.name?.toLowerCase().includes(q);
      const descMatch = t.description?.toLowerCase().includes(q);
      const managerName = t.managerId
        ? `${t.managerId.firstName || ""} ${t.managerId.lastName || ""}`.toLowerCase()
        : "";
      return nameMatch || descMatch || managerName.includes(q);
    });
  }, [userAllowedTeams, searchQuery]);

  const currentTeams = filteredTeams.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredTeams.length / itemsPerPage) || 1;

  const getInitials = (name?: string) => {
    if (!name) return "T";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-5">
      {/* MNC Clean Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {isManager || isTeamLeader ? "My Team" : "Teams Management"}
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-gray-800 dark:text-gray-300 border border-slate-200/60 dark:border-gray-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {filteredTeams.length} {filteredTeams.length === 1 ? "team" : "teams"}
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-gray-400">
            {isManager || isTeamLeader
              ? "View your assigned team members, roles, and reporting hierarchy"
              : "Manage your organization's departmental teams, leadership, and structure"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9.5 w-48 sm:w-56 rounded-xl border border-slate-200 bg-white pl-8.5 pr-8 text-xs text-slate-700 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-gray-200 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {(isSuperAdmin || isAdmin) && (
            <button
              onClick={() => setOpenCreateModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-all hover:shadow-sm cursor-pointer"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Create Team</span>
            </button>
          )}
        </div>
      </div>

      {/* MNC Table Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/75 dark:border-gray-800 dark:bg-gray-800/40">
                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                  Team Name
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                  Description
                </th>
                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                  Manager
                </th>
                <th className="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                  Total Members
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-gray-800/80">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-xs font-medium text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                      <span>Loading teams directory...</span>
                    </div>
                  </td>
                </tr>
              ) : currentTeams.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-gray-800">
                        <UsersIcon className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-gray-300">
                        {searchQuery ? "No matching teams found" : "No teams available"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {searchQuery
                          ? `No results for "${searchQuery}". Clear search to view all teams.`
                          : "No teams have been assigned or created yet."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentTeams.map((team) => {
                  const managerFullName = team.managerId
                    ? `${team.managerId.firstName} ${team.managerId.lastName}`
                    : null;
                  const memberCount = team.members?.length || 0;

                  return (
                    <tr
                      key={team._id}
                      className="transition-colors hover:bg-slate-50/70 dark:hover:bg-gray-800/40"
                    >
                      {/* Team Name */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3.5">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 font-bold text-xs border border-indigo-100 dark:border-indigo-500/20 shrink-0">
                            {getInitials(team.name)}
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-slate-900 dark:text-white hover:text-indigo-600 transition-colors">
                              {team.name}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              <span className="text-[11px] font-medium text-slate-400 dark:text-gray-500">
                                Active Workspace
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="px-6 py-4 text-xs text-slate-500 dark:text-gray-400 max-w-[280px] truncate">
                        {team.description ? (
                          team.description
                        ) : (
                          <span className="text-slate-300 dark:text-gray-600">—</span>
                        )}
                      </td>

                      {/* Manager */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {managerFullName ? (
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300 font-bold text-[11px] border border-purple-100 dark:border-purple-500/20 shrink-0">
                              {getInitials(managerFullName)}
                            </div>
                            <div>
                              <span className="text-xs font-medium text-slate-800 dark:text-gray-200">
                                {managerFullName}
                              </span>
                              <span className="ml-1.5 inline-flex items-center rounded-full bg-slate-100 px-1.5 py-0.2 text-[10px] font-medium text-slate-500 dark:bg-gray-800 dark:text-gray-400">
                                Manager
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-gray-500 italic">
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Total Members */}
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-gray-800 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-gray-300 border border-slate-200/60 dark:border-gray-700/80">
                          <UsersIcon className="h-3.5 w-3.5 text-slate-400" />
                          <span>{memberCount} {memberCount === 1 ? "member" : "members"}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <Link
                            href={`/teams/${team._id}`}
                            title="View Hierarchy"
                            className="flex h-8.5 w-8.5 items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400 transition-colors"
                          >
                            <GitBranch size={16} />
                          </Link>
                          {(isSuperAdmin || isAdmin || isManager) && (
                            <button
                              onClick={() => setTeamToEdit(team)}
                              title="Edit Team"
                              className="flex h-8.5 w-8.5 items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 transition-colors cursor-pointer"
                            >
                              <Pencil size={15} />
                            </button>
                          )}
                          {(isSuperAdmin || isAdmin) && (
                            <button
                              onClick={() => handleDelete(team._id, team.name)}
                              title="Delete Team"
                              className="flex h-8.5 w-8.5 items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition-colors cursor-pointer"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        {filteredTeams.length > 0 && (
          <div className="border-t border-slate-200/80 p-4 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-gray-900">
            <p className="text-xs text-slate-500 dark:text-gray-400">
              Showing <span className="font-semibold text-slate-800 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-slate-800 dark:text-white">{Math.min(currentPage * itemsPerPage, filteredTeams.length)}</span> of <span className="font-semibold text-slate-800 dark:text-white">{filteredTeams.length}</span> teams
            </p>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <CreateTeamModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onSuccess={fetchTeams}
      />
      
      <UpdateTeamModal
        open={!!teamToEdit}
        team={teamToEdit}
        onClose={() => setTeamToEdit(null)}
        onSuccess={fetchTeams}
      />
    </div>
  );
}
