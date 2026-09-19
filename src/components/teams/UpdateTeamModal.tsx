"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";

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
    teamLeaderId: "",
    managerMemberIds: [] as string[],
    teamLeaderMemberIds: [] as string[],
  });

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users?limit=100");
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
      let teamLeaderId = "";
      let managerMemberIds: string[] = [];
      let teamLeaderMemberIds: string[] = [];

      if (manager && manager.directReports) {
        manager.directReports.forEach((report: any) => {
          if (report.directReports && report.directReports.length > 0) {
            teamLeaderId = report.id;
            teamLeaderMemberIds = report.directReports.map((r: any) => r.id);
          } else if (report.role === 'TEAM_LEADER' && !teamLeaderId) {
            teamLeaderId = report.id;
          } else {
            managerMemberIds.push(report.id);
          }
        });
      }

      setForm((prev) => ({
        ...prev,
        managerId,
        teamLeaderId,
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
    setForm((prev) => {
      const newForm = { ...prev, [name]: value };
      
      // Reset team leader if manager changes and they were the same
      if (name === 'managerId' && value === prev.teamLeaderId) {
        newForm.teamLeaderId = "";
      }
      
      // If manager or team leader changes, remove that user from any member lists
      if (name === 'managerId' || name === 'teamLeaderId') {
        newForm.managerMemberIds = newForm.managerMemberIds.filter(id => id !== value);
        newForm.teamLeaderMemberIds = newForm.teamLeaderMemberIds.filter(id => id !== value);
      }
      return newForm;
    });
  };

  const toggleMember = (userId: string, type: 'manager' | 'teamLeader') => {
    setForm((prev) => {
      const field = type === 'manager' ? 'managerMemberIds' : 'teamLeaderMemberIds';
      const otherField = type === 'manager' ? 'teamLeaderMemberIds' : 'managerMemberIds';
      
      const isSelected = prev[field].includes(userId);
      
      // Remove from the other list to ensure a user only reports to one person
      const newOtherField = prev[otherField].filter(id => id !== userId);
      
      return {
        ...prev,
        [otherField]: newOtherField,
        [field]: isSelected
          ? prev[field].filter((id) => id !== userId)
          : [...prev[field], userId],
      };
    });
  };

  const handleClose = () => {
    setForm({
      name: "",
      description: "",
      managerId: "",
      teamLeaderId: "",
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
        teamLeaderId: form.teamLeaderId,
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

  // Derived filtered lists
  const availableTeamLeaders = users.filter((u) => u._id !== form.managerId);
  const availableMembers = users.filter(
    (u) => u._id !== form.managerId && u._id !== form.teamLeaderId
  );

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
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Update Team</h2>
            <p className="text-sm text-gray-500 mt-1">Modify team hierarchy and members.</p>
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {fetchingHierarchy ? (
            <div className="flex h-40 items-center justify-center">
              <div className="flex items-center gap-2 text-gray-500">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading hierarchy...
              </div>
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
                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Manager <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="managerId"
                      value={form.managerId}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 p-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:border-brand-500 cursor-pointer appearance-none"
                    >
                      <option value="">Select Manager</option>
                      {users.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.firstName} {user.lastName} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Team Leader (Optional)
                    </label>
                    <select
                      name="teamLeaderId"
                      value={form.teamLeaderId}
                      onChange={handleChange}
                      disabled={!form.managerId}
                      className="w-full rounded-xl border border-gray-200 p-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:border-brand-500 cursor-pointer appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Team Leader</option>
                      {availableTeamLeaders.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.firstName} {user.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Manager's Members */}
              {form.managerId && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">2</span>
                    Members reporting to Manager ({form.managerMemberIds.length})
                  </h3>
                  
                  {availableMembers.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-8 text-center dark:border-gray-700 dark:bg-gray-800/30">
                      <p className="text-sm text-gray-500">No more users available.</p>
                    </div>
                  ) : (
                    <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-200 p-3 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex flex-wrap gap-2">
                      {availableMembers.map((user) => {
                        const isSelected = form.managerMemberIds.includes(user._id);
                        return (
                          <button
                            key={`mgr-${user._id}`}
                            type="button"
                            onClick={() => toggleMember(user._id, 'manager')}
                            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 border ${
                              isSelected
                                ? "bg-brand-50 border-brand-200 text-brand-700 dark:bg-brand-500/20 dark:border-brand-500/30 dark:text-brand-300 shadow-sm"
                                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                            }`}
                          >
                            <div className={`flex h-4 w-4 items-center justify-center rounded border ${isSelected ? 'border-brand-500 bg-brand-500 text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                              {isSelected && (
                                <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3">
                                  <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </div>
                            {user.firstName} {user.lastName}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Team Leader's Members */}
              {form.teamLeaderId && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">3</span>
                    Members reporting to Team Leader ({form.teamLeaderMemberIds.length})
                  </h3>
                  
                  {availableMembers.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-8 text-center dark:border-gray-700 dark:bg-gray-800/30">
                      <p className="text-sm text-gray-500">No more users available.</p>
                    </div>
                  ) : (
                    <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-200 p-3 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex flex-wrap gap-2">
                      {availableMembers.map((user) => {
                        const isSelected = form.teamLeaderMemberIds.includes(user._id);
                        return (
                          <button
                            key={`tl-${user._id}`}
                            type="button"
                            onClick={() => toggleMember(user._id, 'teamLeader')}
                            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 border ${
                              isSelected
                                ? "bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-500/20 dark:border-purple-500/30 dark:text-purple-300 shadow-sm"
                                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                            }`}
                          >
                            <div className={`flex h-4 w-4 items-center justify-center rounded border ${isSelected ? 'border-purple-500 bg-purple-500 text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                              {isSelected && (
                                <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3">
                                  <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </div>
                            {user.firstName} {user.lastName}
                          </button>
                        );
                      })}
                    </div>
                  )}
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
                Updating...
              </>
            ) : (
              "Update Team"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
