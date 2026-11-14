"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Users, User, Shield } from "lucide-react";
import Link from "next/link";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";

interface IHierarchyNode {
  id: string;
  name: string;
  role: string;
  directReports: IHierarchyNode[];
}

interface ITeamHierarchy {
  teamName: string;
  teamId: string;
  manager: IHierarchyNode | null;
}

export default function TeamHierarchyPage() {
  const params = useParams();
  const id = params.id as string;
  const [hierarchy, setHierarchy] = useState<ITeamHierarchy | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/teams/hierarchy/${id}`);
        setHierarchy(data.data || data);
      } catch (error) {
        console.error("Failed to fetch team hierarchy", error);
        toast.error("Failed to fetch team hierarchy");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchHierarchy();
  }, [id]);

  const renderNode = (node: IHierarchyNode, level = 0) => {
    return (
      <li key={node.id}>
        <div className={`inline-flex flex-col items-center rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900 min-w-[160px] border-t-4 mx-2 ${level === 0 ? 'border-t-brand-500' : level === 1 ? 'border-t-purple-500' : 'border-t-blue-500'}`}>
          <div className={`flex h-12 w-12 items-center justify-center rounded-full mb-3 ${level === 0 ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400' : level === 1 ? 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'}`}>
            {level === 0 ? <Shield size={24} /> : <User size={24} />}
          </div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white text-center whitespace-nowrap">{node.name}</h4>
          <span className="mt-1 inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300 whitespace-nowrap">
            {node.role.replace('_', ' ')}
          </span>
        </div>
        {node.directReports && node.directReports.length > 0 && (
          <ul>
            {node.directReports.map(child => renderNode(child, level + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div className="space-y-6">
      <style dangerouslySetInnerHTML={{__html: `
        .org-tree * {margin: 0; padding: 0;}
        .org-tree ul {
          padding-top: 20px; position: relative;
          transition: all 0.5s;
          display: flex; justify-content: center;
        }
        .org-tree li {
          float: left; text-align: center;
          list-style-type: none;
          position: relative;
          padding: 20px 5px 0 5px;
          transition: all 0.5s;
        }
        .org-tree li::before, .org-tree li::after{
          content: '';
          position: absolute; top: 0; right: 50%;
          border-top: 2px solid #e5e7eb;
          width: 50%; height: 20px;
        }
        .dark .org-tree li::before, .dark .org-tree li::after{
          border-top: 2px solid #374151;
        }
        .org-tree li::after{
          right: auto; left: 50%;
          border-left: 2px solid #e5e7eb;
        }
        .dark .org-tree li::after{
          border-left: 2px solid #374151;
        }
        .org-tree li:only-child::after, .org-tree li:only-child::before {
          display: none;
        }
        .org-tree li:only-child{ padding-top: 0;}
        .org-tree li:first-child::before, .org-tree li:last-child::after{
          border: 0 none;
        }
        .org-tree li:last-child::before{
          border-right: 2px solid #e5e7eb;
          border-radius: 0 5px 0 0;
        }
        .dark .org-tree li:last-child::before{
          border-right: 2px solid #374151;
        }
        .org-tree li:first-child::after{
          border-radius: 5px 0 0 0;
        }
        .org-tree ul ul::before{
          content: '';
          position: absolute; top: 0; left: 50%;
          border-left: 2px solid #e5e7eb;
          width: 0; height: 20px;
          transform: translateX(-50%);
        }
        .dark .org-tree ul ul::before{
          border-left: 2px solid #374151;
        }
      `}} />

      <div className="flex items-center gap-4">
        <Link
          href="/teams"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-300"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Team Hierarchy {hierarchy && `- ${hierarchy.teamName}`}
          </h2>
          {/* <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Visual representation of reporting structure
          </p> */}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.03] min-h-[500px] overflow-auto flex justify-center items-start">
        {loading ? (
          <div className="flex h-full items-center justify-center w-full">
            <span className="text-gray-500">Loading hierarchy...</span>
          </div>
        ) : !hierarchy ? (
          <div className="flex h-full items-center justify-center w-full">
            <span className="text-gray-500">Team not found</span>
          </div>
        ) : !hierarchy.manager ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 w-full">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800">
              <Users size={32} />
            </div>
            <p className="text-gray-500">No hierarchy defined for this team.</p>
          </div>
        ) : (
          <div className="pt-4 pb-12 org-tree w-full max-w-full overflow-x-auto overflow-y-hidden">
            <div className="min-w-max w-full flex justify-center px-10">
              <ul>
                {renderNode(hierarchy.manager)}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
