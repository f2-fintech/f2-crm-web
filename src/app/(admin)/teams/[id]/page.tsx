"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import {
  ArrowLeft,
  RefreshCw,
  Sparkles,
  GitBranch,
  LayoutGrid,
  ListTree,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Users,
  Shield,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface IHierarchyNode {
  id: string;
  name: string;
  role: string;
  email?: string;
  employeeId?: string;
  profileImage?: string | null;
  directReportsCount?: number;
  teamMembersCount?: number;
  directReports: IHierarchyNode[];
}

interface ITeamHierarchy {
  teamName: string;
  teamId: string;
  manager: IHierarchyNode | null;
}

type ViewMode = "chart" | "compact" | "list";

export default function TeamHierarchyPage() {
  const params = useParams();
  const id = params.id as string;
  const { user, isTeamLeader } = useAuth();
  const [hierarchy, setHierarchy] = useState<ITeamHierarchy | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("chart");
  const [zoomScale, setZoomScale] = useState(0.85);
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setViewMode("list");
      setZoomScale(0.65);
    }
  }, []);

  const fetchHierarchy = async () => {
    try {
      setLoading(true);
      const userIdQuery = user?._id || user?.id ? `?userId=${user?._id || user?.id}` : "";
      const { data } = await api.get(`/teams/hierarchy/${id}${userIdQuery}`);
      setHierarchy(data.data || data);
    } catch (error) {
      console.error("Failed to fetch team hierarchy", error);
      toast.error("Failed to fetch team hierarchy");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchHierarchy();
  }, [id, user]);

  const displayRoot = useMemo(() => {
    if (!hierarchy?.manager) return null;
    if (!isTeamLeader) return hierarchy.manager;

    const userIdStr = String(user?._id || user?.id || "");
    const myNode = (hierarchy.manager.directReports || []).find(
      (child) => String(child.id) === userIdStr,
    );

    if (myNode) {
      return {
        ...hierarchy.manager,
        directReports: [myNode],
      };
    }

    return hierarchy.manager;
  }, [hierarchy, isTeamLeader, user]);

  // Fit-to-screen calculation
  const handleFitToScreen = () => {
    setZoomScale(0.68);
    toast.success("Fitted to screen for single view");
  };

  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(1.3, Number((prev + 0.1).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => Math.max(0.45, Number((prev - 0.1).toFixed(2))));
  };

  const handleResetZoom = () => {
    setZoomScale(1.0);
  };

  const toggleCollapse = (nodeId: string) => {
    setCollapsedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  // Purely dynamic metric pill from actual DB data
  const getDynamicPill = (node: IHierarchyNode, level: number) => {
    const rawRole = (node.role || "").toUpperCase();
    const reportsCount = node.directReportsCount ?? (node.directReports?.length || 0);

    if (level === 0 || rawRole === "MANAGER") {
      if (node.teamMembersCount && node.teamMembersCount > 0) {
        return {
          text: `${node.teamMembersCount} Members`,
          gradient: "bg-gradient-to-r from-sky-400 to-indigo-500",
        };
      }
      if (reportsCount > 0) {
        return {
          text: `${reportsCount} Reports`,
          gradient: "bg-gradient-to-r from-sky-400 to-indigo-500",
        };
      }
    }

    if (rawRole.includes("LEADER") || rawRole === "TL" || rawRole === "TEAM_LEADER") {
      if (reportsCount > 0) {
        return {
          text: `${reportsCount} Team Members`,
          gradient: "bg-gradient-to-r from-cyan-400 to-indigo-400",
        };
      }
    }

    if (reportsCount > 0) {
      return {
        text: `${reportsCount} Reports`,
        gradient: "bg-gradient-to-r from-emerald-400 to-teal-500",
      };
    }

    return null;
  };

  const renderAvatar = (node: IHierarchyNode, size = "h-13 w-13") => {
    const hasRealImage =
      node.profileImage &&
      typeof node.profileImage === "string" &&
      node.profileImage.trim() !== "" &&
      node.profileImage !== "#" &&
      node.profileImage !== "/images/user/owner.jpg";

    return (
      <div className="relative shrink-0">
        <div className={`${size} rounded-full p-[2px] bg-gradient-to-tr from-cyan-400 via-sky-300 to-indigo-300 shadow-sm`}>
          {hasRealImage ? (
            <img
              src={node.profileImage!}
              alt={node.name}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 via-sky-500 to-indigo-600 font-bold text-white text-xs shadow-xs">
              {getInitials(node.name)}
            </div>
          )}
        </div>
        <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#10b981] ring-2 ring-white shadow-xs" />
      </div>
    );
  };

  // 1. Visual Org Chart Render
  const renderChartNode = (node: IHierarchyNode, level = 0) => {
    const reportsCount = node.directReportsCount ?? (node.directReports?.length || 0);
    const hasChildren = node.directReports && node.directReports.length > 0;
    const pillBadge = getDynamicPill(node, level);
    const roleText = (node.role || "Member").replace(/_/g, " ");

    return (
      <li key={node.id}>
        <div className="relative group inline-block text-left transition-all duration-300 hover:-translate-y-1">
          <div className="rounded-[26px] p-[2px] bg-gradient-to-r from-cyan-400/80 via-blue-500/70 to-purple-400/80 shadow-[0_12px_36px_-6px_rgba(99,102,241,0.18)] hover:shadow-[0_18px_44px_-4px_rgba(99,102,241,0.26)] transition-all">
            <div className="flex items-center gap-3.5 rounded-[24px] bg-white/95 backdrop-blur-md px-5 py-3.5 min-w-[260px] max-w-[300px]">
              {renderAvatar(node, "h-12 w-12")}

              <div className="flex-1 min-w-0 text-left">
                <h4 className="text-[14px] font-bold text-slate-900 truncate tracking-tight" title={node.name}>
                  {node.name}
                </h4>
                <p className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-wide truncate mt-0.5">
                  {roleText} {reportsCount > 0 && `· ${reportsCount} reports`}
                </p>

                {pillBadge && (
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center text-[9.5px] font-bold text-white px-2 py-0.5 rounded-full shadow-2xs ${pillBadge.gradient}`}
                    >
                      {pillBadge.text}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {hasChildren && (
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-white border border-indigo-200 text-slate-600 shadow-xs text-xs font-bold pointer-events-none">
              +
            </div>
          )}
        </div>

        {hasChildren && (
          <ul>
            {node.directReports.map((child) => renderChartNode(child, level + 1))}
          </ul>
        )}
      </li>
    );
  };

  // 2. Compact One-View Grouped Cards Render (No Scrolling Required)
  const renderCompactView = () => {
    if (!displayRoot) return null;

    const manager = displayRoot;
    const directBranches = manager.directReports || [];

    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Manager Header Card */}
        <div className="rounded-3xl p-[2px] bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 shadow-md">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-[22px] bg-white/95 backdrop-blur-md p-5">
            <div className="flex items-center gap-4">
              {renderAvatar(manager, "h-14 w-14")}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{manager.name}</h3>
                  <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200/60">
                    {manager.role}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct Reports: {directBranches.length} leadership lines · Team Total: {manager.teamMembersCount || 0} Members
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                <Users className="h-4 w-4 text-indigo-600" />
                <span>Executive Lead</span>
              </span>
            </div>
          </div>
        </div>

        {/* Branches Grid (All visible at once side-by-side) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {directBranches.map((branch) => {
            const hasSubReports = branch.directReports && branch.directReports.length > 0;
            const subCount = branch.directReports?.length || 0;

            return (
              <div
                key={branch.id}
                className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Branch Leader */}
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    {renderAvatar(branch, "h-11 w-11")}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{branch.name}</h4>
                      <p className="text-[11px] font-semibold text-purple-700 uppercase tracking-wide">
                        {branch.role}
                      </p>
                    </div>
                    {subCount > 0 && (
                      <span className="inline-flex rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200/60 shrink-0">
                        {subCount} reports
                      </span>
                    )}
                  </div>

                  {/* Sub-members List */}
                  <div className="mt-3 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {hasSubReports ? "Direct Team Members" : "Individual Role"}
                    </p>

                    {hasSubReports ? (
                      <div className="space-y-1.5">
                        {branch.directReports.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between rounded-xl bg-slate-50 p-2 hover:bg-slate-100/80 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {renderAvatar(member, "h-7 w-7")}
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-800 truncate">
                                  {member.name}
                                </p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-wide">
                                  {member.role}
                                </p>
                              </div>
                            </div>
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl bg-slate-50 p-3 text-center text-xs text-slate-400 italic">
                        Independent Contributor
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Branch Verified</span>
                  <span className="text-indigo-600 font-semibold">{hasSubReports ? `${subCount + 1} People` : "1 Person"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 3. Nested Tree List Render
  const renderListRow = (node: IHierarchyNode, depth = 0) => {
    const hasChildren = node.directReports && node.directReports.length > 0;
    const isCollapsed = !!collapsedNodes[node.id];
    const roleFormatted = (node.role || "Member").replace(/_/g, " ");

    return (
      <div key={node.id} className="space-y-1">
        <div
          className={`flex items-center justify-between rounded-xl p-2.5 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200/70`}
          style={{ paddingLeft: `${depth * 28 + 12}px` }}
        >
          <div className="flex items-center gap-3 min-w-0">
            {hasChildren ? (
              <button
                onClick={() => toggleCollapse(node.id)}
                className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
              </button>
            ) : (
              <span className="w-6" />
            )}

            {renderAvatar(node, "h-8 w-8")}

            <div className="min-w-0">
              <span className="text-sm font-bold text-slate-900">{node.name}</span>
              <span className="ml-2 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                {roleFormatted}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {node.directReports && node.directReports.length > 0 && (
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200/60">
                {node.directReports.length} reports
              </span>
            )}
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
        </div>

        {hasChildren && !isCollapsed && (
          <div className="space-y-1">
            {node.directReports.map((child) => renderListRow(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Seamless curved org tree connecting lines */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .org-tree * { margin: 0; padding: 0; box-sizing: border-box; }
        .org-tree ul {
          padding-top: 38px;
          position: relative;
          transition: all 0.3s;
          display: flex;
          justify-content: center;
        }
        .org-tree li {
          float: left;
          text-align: center;
          list-style-type: none;
          position: relative;
          padding: 38px 16px 0 16px;
          transition: all 0.3s;
        }
        .org-tree li::before, .org-tree li::after {
          content: '';
          position: absolute;
          top: 0;
          right: 50%;
          border-top: 2px solid #a5b4fc;
          width: 50%;
          height: 38px;
        }
        .org-tree li::after {
          right: auto;
          left: 50%;
          border-left: 2px solid #a5b4fc;
        }
        .org-tree li:only-child::after, .org-tree li:only-child::before {
          display: none;
        }
        .org-tree li:only-child {
          padding-top: 0;
        }
        .org-tree li:first-child::before, .org-tree li:last-child::after {
          border: 0 none;
        }
        .org-tree li:last-child::before {
          border-right: 2px solid #a5b4fc;
          border-radius: 0 18px 0 0;
        }
        .org-tree li:first-child::after {
          border-radius: 18px 0 0 0;
        }
        .org-tree ul ul::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          border-left: 2px solid #a5b4fc;
          width: 0;
          height: 38px;
          transform: translateX(-50%);
        }
      `,
        }}
      />

      {/* Top Header & View Mode Switcher */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/teams"
            className="flex h-9.5 w-9.5 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 shadow-2xs"
            title="Back to Teams"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                {hierarchy?.teamName || "Team"} Hierarchy
              </h1>
              <span className="inline-flex items-center rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 px-2.5 py-0.5 text-xs font-bold text-white shadow-xs">
                Live View
              </span>
            </div>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
              Interactive organization leadership tree and reporting chains
            </p>
          </div>
        </div>

        {/* View Switcher Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Segmented View Mode Tabs */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/80">
            <button
              onClick={() => setViewMode("chart")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "chart"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <GitBranch className="h-3.5 w-3.5" />
              <span>Org Tree</span>
            </button>

            <button
              onClick={() => setViewMode("compact")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "compact"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>One-View Matrix</span>
            </button>

            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ListTree className="h-3.5 w-3.5" />
              <span>Directory</span>
            </button>
          </div>

          <button
            onClick={fetchHierarchy}
            disabled={loading}
            title="Reload Hierarchy"
            className="flex h-9.5 w-9.5 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Hierarchy Canvas */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-50/90 via-slate-100/60 to-indigo-50/30 p-6 sm:p-8 min-h-[560px] shadow-sm flex flex-col justify-start"
      >
        {/* Subtle decorative background silhouettes */}
        <div className="pointer-events-none absolute -top-12 -left-12 h-64 w-64 rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="pointer-events-none absolute top-1/4 -right-12 h-72 w-72 rounded-full bg-sky-200/35 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 h-64 w-64 rounded-full bg-purple-200/25 blur-3xl" />

        {/* Decorative Sparkle icon at bottom-right */}
        <div className="pointer-events-none absolute bottom-6 right-6 text-slate-300">
          <Sparkles className="h-6 w-6 opacity-60" />
        </div>

        {/* Floating Zoom & Fit-to-Screen controls for Org Chart */}
        {viewMode === "chart" && !loading && displayRoot && (
          <div className="flex md:absolute top-4 right-4 z-20 items-center justify-between md:justify-start gap-1.5 rounded-2xl bg-white/90 backdrop-blur-md px-3 py-1.5 shadow-md border border-slate-200/80 mb-4 md:mb-0">
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
            >
              <ZoomOut size={15} />
            </button>

            <button
              onClick={handleResetZoom}
              title="Reset to 100%"
              className="text-xs font-bold text-slate-700 px-1 hover:text-indigo-600 cursor-pointer"
            >
              {Math.round(zoomScale * 100)}%
            </button>

            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
            >
              <ZoomIn size={15} />
            </button>

            <div className="h-4 w-px bg-slate-200 mx-1" />

            <button
              onClick={handleFitToScreen}
              title="Fit to Screen (Single View)"
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold cursor-pointer transition-colors"
            >
              <Maximize2 size={13} />
              <span>Fit Screen</span>
            </button>
          </div>
        )}

        {loading ? (
          <div className="relative z-10 flex h-64 flex-col items-center justify-center gap-2.5 w-full">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent shadow-xs" />
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Rendering hierarchy view...
            </p>
          </div>
        ) : !hierarchy ? (
          <div className="relative z-10 flex h-64 flex-col items-center justify-center gap-2 w-full">
            <p className="text-sm font-semibold text-slate-700">Team not found</p>
          </div>
        ) : !displayRoot ? (
          <div className="relative z-10 flex h-64 flex-col items-center justify-center gap-2 w-full">
            <p className="text-sm font-semibold text-slate-700">
              No hierarchy defined for this team
            </p>
            <p className="text-xs text-slate-400">Team has no assigned manager or leader.</p>
          </div>
        ) : viewMode === "chart" ? (
          <div className="relative z-10 pt-6 pb-12 w-full flex justify-center overflow-x-auto">
            <div
              className="min-w-max transition-transform duration-300 origin-top"
              style={{ transform: `scale(${zoomScale})` }}
            >
              <div className="org-tree px-8">
                <ul>{renderChartNode(displayRoot)}</ul>
              </div>
            </div>
          </div>
        ) : viewMode === "compact" ? (
          <div className="relative z-10 pt-2 pb-6 w-full">
            {renderCompactView()}
          </div>
        ) : (
          <div className="relative z-10 pt-2 pb-6 w-full max-w-4xl mx-auto rounded-2xl bg-white/95 backdrop-blur-md p-6 border border-slate-200/80 shadow-xs">
            <div className="pb-3 mb-3 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Department Members Directory
              </span>
              <span className="text-xs font-semibold text-indigo-600">
                Click arrows to expand/collapse
              </span>
            </div>
            {renderListRow(displayRoot)}
          </div>
        )}
      </div>
    </div>
  );
}
