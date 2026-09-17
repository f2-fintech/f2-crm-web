"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, UserPlus, Users as UsersIcon, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import AddMemberModal from "@/components/teams/AddMemberModal";

export default function TeamDetailsPage() {
  const params = useParams();
  const teamId = params.id as string;

  const [hierarchy, setHierarchy] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openAddModal, setOpenAddModal] = useState(false);

  const fetchHierarchy = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/teams/${teamId}/hierarchy`);
      setHierarchy(data.data || data);
    } catch (error) {
      console.error("Failed to fetch hierarchy", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teamId) {
      fetchHierarchy();
    }
  }, [teamId]);

  const RenderNode = ({ node, level = 0 }: { node: any; level?: number }) => {
    if (!node) return null;
    
    // The backend sends nodes with { id, name, role, directReports }
    const children = node.directReports || [];
    const displayName = node.name || "Unknown User";
    const roleName = node.role || "Member";

    return (
      <div className="relative mt-4" style={{ marginLeft: `${level > 0 ? 24 : 0}px` }}>
        {level > 0 && (
          <div className="absolute -left-6 top-6 h-px w-6 bg-gray-300 dark:bg-gray-700" />
        )}
        {level > 0 && (
          <div className="absolute -left-6 -top-4 bottom-auto h-10 w-px bg-gray-300 dark:bg-gray-700" />
        )}
        
        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="h-12 w-12 overflow-hidden rounded-full border border-gray-100 dark:border-gray-700">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}`}
              alt="avatar"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-white/90">
              {displayName}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {roleName}
            </p>
          </div>
        </div>

        {children.length > 0 && (
          <div className="relative ml-6 border-l border-gray-300 pl-6 dark:border-gray-700 pt-2">
            {children.map((child: any) => (
              <RenderNode key={child._id || child.user?._id} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/teams"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Team Hierarchy
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View reporting structure and manage members
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => setOpenAddModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
        >
          <UserPlus size={18} />
          Add Member
        </button>
      </div>

      {/* Content */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-[#0f1729]">
        {loading ? (
          <div className="flex h-40 items-center justify-center text-gray-500">
            Loading hierarchy...
          </div>
        ) : !hierarchy ? (
          <div className="flex h-40 items-center justify-center text-gray-500">
            No hierarchy found. Make sure the team has a manager.
          </div>
        ) : (
          <div className="overflow-x-auto py-4">
            <div className="min-w-[600px]">
              <RenderNode node={hierarchy.manager} />
            </div>
          </div>
        )}
      </div>

      <AddMemberModal
        open={openAddModal}
        teamId={teamId}
        onClose={() => setOpenAddModal(false)}
        onSuccess={fetchHierarchy}
      />
    </div>
  );
}
