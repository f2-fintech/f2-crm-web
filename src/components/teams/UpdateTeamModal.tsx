"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import SingleSelect from "@/components/ui/SingleSelect";
import MultiSelect from "@/components/ui/MultiSelect";

interface UpdateTeamModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  team: {
    _id: string;
    name: string;
    description?: string;
  } | null;
}

interface IUserOption {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
}

export default function UpdateTeamModal({
  open,
  onClose,
  onSuccess,
  team,
}: UpdateTeamModalProps) {
  const [loading, setLoading] = useState(false);
  const [fetchingHierarchy, setFetchingHierarchy] = useState(false);
  const [users, setUsers] = useState<IUserOption[]>([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    managerId: "",
    teamLeaderIds: [] as string[],
    managerMemberIds: [] as string[],
    teamLeaderMemberIds: [] as string[],
  });

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users?limit=200");
      const usersList = Array.isArray(res.data) ? res.data : res.data.data || [];
      setUsers(usersList);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const fetchHierarchyAndPopulate = async (teamId: string) => {
    try {
      setFetchingHierarchy(true);
      const res = await api.get(`/teams/hierarchy/${teamId}`);
      const hierarchy = res.data.data || res.data;
      
      const manager = hierarchy.manager;
      let managerId = manager?.id || "";
      let teamLeaderIds: string[] = [];
      let managerMemberIds: string[] = [];
      let teamLeaderMemberIds: string[] = [];

      if (manager && manager.directReports) {
        manager.directReports.forEach((report: any) => {
          if (report.directReports && report.directReports.length > 0) {
            teamLeaderIds.push(report.id);
            teamLeaderMemberIds.push(...report.directReports.map((r: any) => r.id));
          } else if (report.role === 'TEAM_LEADER' && !teamLeaderIds.includes(report.id)) {
            teamLeaderIds.push(report.id);
          } else {
            managerMemberIds.push(report.id);
          }
        });
      }

      setForm((prev) => ({
        ...prev,
        managerId,
        teamLeaderIds,
        managerMemberIds,
        teamLeaderMemberIds
      }));

    } catch (err) {
      console.error("Failed to fetch team hierarchy for editing", err);
      toast.error("Could not load current team members.");
    } finally {
      setFetchingHierarchy(false);
    }
  };

  useEffect(() => {
    if (open && team) {
      setForm((prev) => ({
        ...prev,
        name: team.name || "",
        description: team.description || "",
      }));
      fetchUsers();
      fetchHierarchyAndPopulate(team._id);
    }
  }, [open, team]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    setForm({
      name: "",
      description: "",
      managerId: "",
      teamLeaderIds: [],
      managerMemberIds: [],
      teamLeaderMemberIds: [],
    });
    onClose();
  };

  const handleSubmit = async () => {
    if (!form.name || !form.managerId) {
      toast.error("Please provide a team name and select a manager.");
      return;
    }
    if (!team) return;

    try {
      setLoading(true);
      
      // 1. Update basic details
      await api.patch(`/teams/${team._id}`, {
        name: form.name,
        description: form.description,
      });

      // 2. Sync members and hierarchy
      await api.post(`/teams/${team._id}/members/sync`, {
        managerId: form.managerId,
        teamLeaderIds: form.teamLeaderIds,
        managerMemberIds: form.managerMemberIds,
        teamLeaderMemberIds: form.teamLeaderMemberIds
      });
      
      toast.success("Team updated successfully!");
      onSuccess();
      handleClose();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to update the team."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!open || !team) return null;

  // Options
  const managerOptions = users
    .filter(u => u.role === "MANAGER")
    .map(u => ({ value: u._id, label: `${u.firstName} ${u.lastName} (${u.email})` }));
  
  const tlOptions = users
    .filter(u => u._id !== form.managerId)
    .map(u => ({ value: u._id, label: `${u.firstName} ${u.lastName} (TL)` }));
  
  const memberOptions = users
    .filter(u => u._id !== form.managerId && !form.teamLeaderIds.includes(u._id))
    .map(u => ({ value: u._id, label: `${u.firstName} ${u.lastName}` }));

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-6 py-5 dark:border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Team: {team.name}</h2>
            <p className="text-sm text-gray-500 mt-1">Update team details and member assignments.</p>
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {fetchingHierarchy ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500"></div>
              <p className="mt-4 text-sm text-gray-500">Loading team hierarchy...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Team Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 p-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:border-brand-500"
                    placeholder="E.g., Sales Team North"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 p-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:border-brand-500"
                    placeholder="What does this team do?"
                  />
                </div>
              </div>

              {/* Hierarchy */}
              <div className="rounded-xl border border-brand-100 bg-brand-50/50 p-5 dark:border-gray-700 dark:bg-gray-800/50">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">1</span>
                  Update Hierarchy
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <SingleSelect
                      label="Manager *"
                      options={managerOptions}
                      value={form.managerId}
                      onChange={(val) => {
                        setForm(prev => {
                          const next = { ...prev, managerId: val };
                          next.teamLeaderIds = next.teamLeaderIds.filter(id => id !== val);
                          next.managerMemberIds = next.managerMemberIds.filter(id => id !== val);
                          next.teamLeaderMemberIds = next.teamLeaderMemberIds.filter(id => id !== val);
                          return next;
                        });
                      }}
                      placeholder="Select Manager"
                    />
                  </div>

                  <div>
                    <MultiSelect
                      label="Team Leaders (TL)"
                      options={tlOptions}
                      value={form.teamLeaderIds}
                      onChange={(val) => {
                        setForm(prev => {
                          const next = { ...prev, teamLeaderIds: val };
                          next.managerMemberIds = next.managerMemberIds.filter(id => !val.includes(id));
                          next.teamLeaderMemberIds = next.teamLeaderMemberIds.filter(id => !val.includes(id));
                          return next;
                        });
                      }}
                      placeholder="Select Team Leaders"
                    />
                    <p className="mt-1.5 text-xs text-gray-500">
                      Reports to Manager.
                    </p>
                  </div>
                </div>
              </div>

              {/* Manager's Members */}
              {form.managerId && (
                <div>
                  <MultiSelect
                    label={`Members reporting to Manager (${form.managerMemberIds.length})`}
                    options={memberOptions.filter(m => !form.teamLeaderMemberIds.includes(m.value))}
                    value={form.managerMemberIds}
                    onChange={(val) => setForm(prev => ({ ...prev, managerMemberIds: val }))}
                    placeholder="Search and add employees..."
                  />
                </div>
              )}

              {/* Team Leader's Members */}
              {form.teamLeaderIds.length > 0 && (
                <div>
                  <MultiSelect
                    label={`Members reporting to Team Leaders (${form.teamLeaderMemberIds.length})`}
                    options={memberOptions.filter(m => !form.managerMemberIds.includes(m.value))}
                    value={form.teamLeaderMemberIds}
                    onChange={(val) => setForm(prev => ({ ...prev, teamLeaderMemberIds: val }))}
                    placeholder="Search and add employees..."
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/50">
          <button
            onClick={handleClose}
            className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || fetchingHierarchy}
            className="rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 disabled:cursor-not-allowed disabled:opacity-60 flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
