"use client";

import { useEffect, useState, useMemo } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import SingleSelect from "@/components/ui/SingleSelect";
import MultiSelect from "@/components/ui/MultiSelect";

interface CreateTeamModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface IUserOption {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
}

export default function CreateTeamModal({
  open,
  onClose,
  onSuccess,
}: CreateTeamModalProps) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<IUserOption[]>([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    managerId: "",
    teamLeaderIds: [] as string[],
    managerMemberIds: [] as string[],
    tlMembers: {} as Record<string, string[]>,
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

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

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
      tlMembers: {},
    });
    onClose();
  };

  const handleSubmit = async () => {
    if (!form.name || !form.managerId) {
      toast.error("Please provide a team name and select a manager.");
      return;
    }

    try {
      setLoading(true);
      
      // 1. Create the team
      const teamRes = await api.post("/teams", {
        name: form.name,
        description: form.description,
        managerId: form.managerId,
      });
      
      const newTeam = teamRes.data?.data || teamRes.data;
      const teamId = newTeam?._id;
      
      if (!teamId) {
        throw new Error("Failed to retrieve the new team ID.");
      }

      // 2. Add Team Leaders
      const teamLeaderPromises = form.teamLeaderIds.map(tlId => 
        api.post(`/teams/${teamId}/members`, {
          userId: tlId,
          reportsTo: form.managerId
        })
      );

      // 3. Add members reporting to Manager
      const managerMemberPromises = form.managerMemberIds.map(memberId => 
        api.post(`/teams/${teamId}/members`, {
          userId: memberId,
          reportsTo: form.managerId
        })
      );

      // 4. Add members reporting to Team Leaders
      const teamLeaderMemberPromises = Object.entries(form.tlMembers).flatMap(([tlId, memberIds]) => 
        memberIds.map(memberId => 
          api.post(`/teams/${teamId}/members`, {
            userId: memberId,
            reportsTo: tlId
          })
        )
      );

      // Execute all additions concurrently
      await Promise.all([...teamLeaderPromises, ...managerMemberPromises, ...teamLeaderMemberPromises]);

      const tlMembersCount = Object.values(form.tlMembers).flat().length;
      const totalMembersAdded = form.managerMemberIds.length + tlMembersCount + form.teamLeaderIds.length;
      
      toast.success(
        <div>
          <p className="font-semibold text-gray-900">Team "{form.name}" Created! 🎉</p>
          <p className="text-sm text-gray-600 mt-1">
            Manager assigned {totalMembersAdded > 0 ? `along with ${totalMembersAdded} team member(s).` : 'successfully.'}
          </p>
        </div>,
        { duration: 5000 }
      );
      
      onSuccess();
      handleClose();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.message ||
          "Something went wrong while creating the team. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

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
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Team</h2>
            <p className="text-sm text-gray-500 mt-1">Set up your team hierarchy and add members.</p>
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
                Set Hierarchy
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
                        Object.keys(next.tlMembers).forEach(k => {
                           next.tlMembers[k] = next.tlMembers[k].filter(id => id !== val);
                        });
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
                        
                        // Clean up tlMembers for TLs that were removed, and filter out new TLs from existing members
                        const newTlMembers: Record<string, string[]> = {};
                        val.forEach(tlId => {
                           newTlMembers[tlId] = (prev.tlMembers[tlId] || []).filter(id => !val.includes(id));
                        });
                        next.tlMembers = newTlMembers;
                        
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
                  options={memberOptions.filter(m => !Object.values(form.tlMembers).flat().includes(m.value))}
                  value={form.managerMemberIds}
                  onChange={(val) => setForm(prev => ({ ...prev, managerMemberIds: val }))}
                  placeholder="Search and add employees..."
                />
              </div>
            )}

            {/* Team Leader's Members */}
            {form.teamLeaderIds.map(tlId => {
              const tlUser = users.find(u => u._id === tlId);
              const tlName = tlUser ? `${tlUser.firstName} ${tlUser.lastName}` : "Team Leader";
              const currentMembers = form.tlMembers[tlId] || [];
              const otherTlMembers = Object.entries(form.tlMembers)
                .filter(([id]) => id !== tlId)
                .flatMap(([, members]) => members);
              
              return (
                <div key={tlId}>
                  <MultiSelect
                    label={`Members reporting to ${tlName} (${currentMembers.length})`}
                    options={memberOptions.filter(m => !form.managerMemberIds.includes(m.value) && !otherTlMembers.includes(m.value))}
                    value={currentMembers}
                    onChange={(val) => setForm(prev => ({ 
                      ...prev, 
                      tlMembers: { ...prev.tlMembers, [tlId]: val } 
                    }))}
                    placeholder={`Search and add employees for ${tlName}...`}
                  />
                </div>
              );
            })}
          </div>
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
            disabled={loading}
            className="rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 disabled:cursor-not-allowed disabled:opacity-60 flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              "Create Team"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
