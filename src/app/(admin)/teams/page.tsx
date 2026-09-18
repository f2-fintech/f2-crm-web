"use client";

import { useEffect, useState } from "react";
import { Plus, Users as UsersIcon, Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import CreateTeamModal from "@/components/teams/CreateTeamModal";
import UpdateTeamModal from "@/components/teams/UpdateTeamModal";

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

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/teams");
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
  }, []);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Teams Management
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your organization's teams and their hierarchy
          </p>
        </div>

        <button
          onClick={() => setOpenCreateModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
        >
          <Plus size={18} />
          Create Team
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Team Name
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Description
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Manager
                </th>
                <th className="px-5 py-3.5 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Total Members
                </th>
                <th className="px-5 py-3.5 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center text-sm text-gray-500 dark:text-gray-400">
                    Loading teams...
                  </td>
                </tr>
              ) : teams.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center text-sm text-gray-500 dark:text-gray-400">
                    No teams found
                  </td>
                </tr>
              ) : (
                teams.map((team) => (
                  <tr
                    key={team._id}
                    className="transition hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                  >
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-500 dark:bg-brand-500/10">
                          <UsersIcon size={18} />
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-800 dark:text-white/90">
                            {team.name}
                          </h5>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-[250px] truncate">
                      {team.description || "-"}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap dark:text-gray-400">
                      {team.managerId
                        ? `${team.managerId.firstName} ${team.managerId.lastName}`
                        : "-"}
                    </td>

                    <td className="px-5 py-4 text-center whitespace-nowrap">
                      <span className="inline-flex rounded-full bg-blue-light-50 px-2.5 py-0.5 text-xs font-medium text-blue-light-600 dark:bg-blue-light-500/15 dark:text-blue-light-400">
                        {team.members?.length || 0}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/teams/${team._id}`}
                          title="View Hierarchy"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 dark:border-gray-700 dark:text-gray-400 dark:hover:border-brand-800 dark:hover:bg-brand-500/10"
                        >
                          <Eye size={16} />
                        </Link>
                        <button
                          onClick={() => setTeamToEdit(team)}
                          title="Edit Team"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:border-gray-700 dark:text-gray-400 dark:hover:border-blue-800 dark:hover:bg-blue-500/10"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(team._id, team.name)}
                          title="Delete Team"
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-error-300 hover:bg-error-50 hover:text-error-600 dark:border-gray-700 dark:text-gray-400 dark:hover:border-error-800 dark:hover:bg-error-500/10"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
