"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useDashboard from "@/hooks/useDashboard";
import { useAuth } from "@/hooks/useAuth";
import {
  Users, Building2, UserCircle, Briefcase,
  ShieldCheck, Activity, FileText, Target,
  Sparkles, TrendingUp, Clock, CheckCircle2,
  AlertCircle, ChevronRight, BarChart3,
  ArrowUpRight, ArrowDownRight, Zap, RefreshCw, FileWarning,
  Phone, ExternalLink, FileSpreadsheet, CheckCircle, Database,
  GitBranch, UserCog, LayoutDashboard, Settings2, CalendarClock, BellRing
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import DashboardInsights from "./DashboardInsights";

import DashboardCards from "@/components/leads/cards/DashboardCards";
import LeadJourneyDialog from "@/components/leads/dialogs/LeadJourneyDialog";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function DashboardClient() {
  const router = useRouter();
  const { dashboard, pipeline, movement, stageAging, agentWorkload, agentActivity, slaData, volumeForecast, loading, error, refresh } = useDashboard();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [leadStats, setLeadStats] = useState<any>(null);
  const [notionStats, setNotionStats] = useState<any>(null);
  const [omsLeads, setOmsLeads] = useState<any[]>([]);
  const [loadingOms, setLoadingOms] = useState(false);
  const [journeyLeadId, setJourneyLeadId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    // Fetch lead stats for DashboardCards
    import("@/lib/axios").then((module) => {
      const axios = module.default;
      axios.get("/leads/dashboard/stats").then((res) => {
        if (res.data?.success) {
          setLeadStats(res.data.data);
        }
      }).catch(console.error);

      // Fetch scoped Notion data (team or individual)
      axios.get("/notion-pages/dashboard-stats").then((res) => {
        if (res.data) {
          setNotionStats(res.data);
        }
      }).catch(console.error);
    });
  }, []);

  const effectiveRole = (user?.role || dashboard?.roleType || '').toUpperCase();

  useEffect(() => {
    if (!user) return;
    setLoadingOms(true);
    import("@/lib/axios").then((module) => {
      const axios = module.default;
      const firstName = user?.firstName || '';
      const params: any = { limit: 100 };
      if (firstName && effectiveRole === 'EMPLOYEE') params.omsAppliedByName = firstName;

      axios.get("/leads", { params }).then((res) => {
        const list = res.data?.data?.data || res.data?.data || [];
        if (Array.isArray(list)) {
          const fNameLower = firstName.toLowerCase();

          // Collect direct reports' names & ids for Team Leader
          const teamMemberNames: string[] = [];
          const teamMemberIds: string[] = [];
          if (notionStats?.members && Array.isArray(notionStats.members)) {
            notionStats.members.forEach((m: any) => {
              if (m.name) teamMemberNames.push(m.name.toLowerCase());
              if (m.memberId) teamMemberIds.push(m.memberId.toString());
            });
          }

          const filtered = list.filter((item: any) => {
            if (!item.omsTicketId && !item.omsAppliedByName) return false;

            // Check self match
            if (fNameLower && item.omsAppliedByName && item.omsAppliedByName.toLowerCase().includes(fNameLower)) {
              return true;
            }
            if (user._id && item.assignedTo === user._id) return true;
            if (user.omsUserId && item.omsUserId === user.omsUserId) return true;

            // If Team Leader: strictly only direct assigned members!
            if (effectiveRole === 'TEAM_LEADER') {
              if (item.omsAppliedByName) {
                const appliedLower = item.omsAppliedByName.toLowerCase();
                if (teamMemberNames.some((name) => appliedLower.includes(name) || name.includes(appliedLower))) {
                  return true;
                }
              }
              if (item.assignedTo && teamMemberIds.includes(item.assignedTo.toString())) {
                return true;
              }
              return false;
            }

            // If Manager: can see team leads
            if (effectiveRole === 'MANAGER') {
              return true;
            }

            return false;
          });
          setOmsLeads(filtered);
        }
      }).catch(console.error).finally(() => setLoadingOms(false));
    });
  }, [user?._id, user?.firstName, effectiveRole, notionStats?.members?.length]);

  if (loading || !mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="relative flex h-14 w-14 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-indigo-500/20"></div>
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl mt-12 rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-red-700">Failed to load dashboard</h3>
        <p className="mt-2 text-sm text-red-600">{error}</p>
        <button
          onClick={refresh}
          className="mt-6 rounded-xl bg-red-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!dashboard) return null;

  const { stats, recentActivity, monthlyLeads, roleType } = dashboard;

  // Chart Options & Series
  const chartOptions = {
    chart: {
      type: "area" as const,
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: 'inherit',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: { enabled: true, delay: 150 },
        dynamicAnimation: { enabled: true, speed: 350 }
      }
    },
    colors: ["#6366f1", "#10b981"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth" as const, width: [3, 3] },
    xaxis: {
      categories: monthlyLeads?.data?.length ? monthlyLeads.data.map((d: any) => d.name) : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#94a3b8', fontSize: '12px' } }
    },
    yaxis: {
      labels: {
        style: { colors: '#94a3b8', fontSize: '12px' },
        formatter: (val: number) => val.toString(),
      },
    },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 4,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } },
      padding: { top: 0, right: 0, bottom: 0, left: 10 }
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    tooltip: {
      theme: "light",
      y: { formatter: (val: number) => `${val} leads` }
    },
    legend: { show: false }
  };

  const chartSeries = [
    {
      name: "New Leads",
      data: monthlyLeads?.data?.length ? monthlyLeads.data.map((d: any) => d.value) : [12, 34, 23, 56, 34, 45, 78],
    }
  ];

  const userName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : effectiveRole || 'User';

  const isStaffRole = !['ADMIN', 'SUPER_ADMIN'].includes(effectiveRole);

  if (isStaffRole) {
    let employeeMetrics: any[] = [];
    if (effectiveRole === 'TEAM_LEADER') {
      const tlMemberCount = notionStats?.members?.length ?? (stats?.teamSize || 0);
      employeeMetrics = [
        { title: "Team Members", val: tlMemberCount, trend: "+5%", isUp: true, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
        { title: "Active Calling Agents", val: tlMemberCount, trend: "Active", isUp: true, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
        { title: "Team Notion Sheets", val: notionStats?.summary?.teamSheets ?? (stats?.teamPages || 0), trend: "Sheets", isUp: true, icon: FileText, color: "text-purple-600", bg: "bg-purple-50" },
        { title: "Total Team Leads", val: notionStats?.summary?.totalLeads ?? (stats?.totalLeads || 0), trend: "+10%", isUp: true, icon: Target, color: "text-amber-600", bg: "bg-amber-50" }
      ];
    } else if (effectiveRole === 'MANAGER') {
      employeeMetrics = [
        { title: "Managed Team Size", val: stats?.teamSize || (notionStats?.members?.length ?? 0), trend: "+3%", isUp: true, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
        { title: "Active Members", val: stats?.activeMembers || (notionStats?.members?.length ?? 0), trend: "Live", isUp: true, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
        { title: "Team Notion Sheets", val: notionStats?.summary?.teamSheets ?? (stats?.teamPages || 0), trend: "Docs", isUp: true, icon: FileText, color: "text-purple-600", bg: "bg-purple-50" },
        { title: "Total Team Leads", val: notionStats?.summary?.totalLeads ?? (stats?.totalLeads || 0), trend: "+8%", isUp: true, icon: Target, color: "text-amber-600", bg: "bg-amber-50" }
      ];
    } else if (effectiveRole === 'EMPLOYEE') {
      employeeMetrics = [
        { title: "My Assigned Sheets", val: notionStats?.summary?.mySheets || stats?.assignedPages || 0, trend: "Sheets", isUp: true, icon: FileSpreadsheet, color: "text-blue-600", bg: "bg-blue-50" },
        { title: "My Notion Leads", val: notionStats?.summary?.totalLeads || stats?.myLeads || 0, trend: "Assigned", isUp: true, icon: Target, color: "text-purple-600", bg: "bg-purple-50" },
        { title: "Remarks Completed", val: notionStats?.summary?.remarksFilled || 0, trend: "Done", isUp: true, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
        { title: "Remarks Pending", val: notionStats?.summary?.remarksEmpty || 0, trend: "Pending", isUp: false, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" }
      ];
    } else if (effectiveRole === 'SOURCER') {
      employeeMetrics = [
        { title: "Sourced Leads", val: stats?.myLeads || 0, trend: "+20%", isUp: true, icon: Target, color: "text-blue-600", bg: "bg-blue-50" },
        { title: "Conversion Rate", val: "0%", trend: "0%", isUp: true, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
        { title: "Active Campaigns", val: 0, trend: "0%", isUp: true, icon: Activity, color: "text-amber-600", bg: "bg-amber-50" },
        { title: "Successful Deals", val: 0, trend: "+2%", isUp: true, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" }
      ];
    } else {
      employeeMetrics = [
        { title: "Referred Leads", val: stats?.myLeads || 0, trend: "+15%", isUp: true, icon: Target, color: "text-blue-600", bg: "bg-blue-50" },
        { title: "Commission Earned", val: "$0", trend: "+0%", isUp: true, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
        { title: "Pending Payouts", val: 0, trend: "0%", isUp: true, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
        { title: "Partner Rank", val: "New", trend: "-", isUp: true, icon: ShieldCheck, color: "text-purple-600", bg: "bg-purple-50" }
      ];
    }

    const employeeName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : effectiveRole || 'User';
    const isLeadership = effectiveRole === 'TEAM_LEADER' || effectiveRole === 'MANAGER';

    return (
      <div className="space-y-8 pb-12">
        {/* AI Insights Banner (Welcome Back) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 p-8 text-white shadow-lg">
          <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white opacity-5 blur-3xl"></div>
          <div className="absolute right-20 bottom-0 h-40 w-40 rounded-full bg-indigo-400 opacity-20 blur-2xl"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-amber-300" />
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                  {isLeadership ? `${effectiveRole === 'TEAM_LEADER' ? 'Team Leader' : 'Manager'} Operations Desk` : 'Sales Calling Desk'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
                Good Morning, {employeeName}!
              </h2>
              <p className="text-indigo-100 max-w-2xl text-sm sm:text-base leading-relaxed">
                {isLeadership
                  ? `Here is your team snapshot. Monitor team Notion sheets assignment, remarks discipline, and direct OMS leads.`
                  : `Your personal Calling Desk. You can only view your assigned Notion sheets and your specific OMS leads.`
                }
              </p>
            </div>
            <div className="shrink-0 flex gap-3">
              <button onClick={refresh} className="flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-md px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/30 cursor-pointer">
                <RefreshCw className="h-4 w-4" />
                Sync Data
              </button>
            </div>
          </div>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {employeeMetrics.map((m, i) => (
            <div key={i} className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${m.bg}`}>
                  <m.icon className={`h-6 w-6 ${m.color}`} />
                </div>
                <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${m.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  {m.isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {m.trend}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{m.title}</p>
                <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">{m.val}</h3>
              </div>
              <div className={`absolute bottom-0 left-0 h-1 w-full opacity-0 transition-opacity group-hover:opacity-100 ${m.bg.replace('bg-', 'bg-gradient-to-r from-').replace('-50', '-500')} to-transparent`} />
            </div>
          ))}
        </div>

        {/* Notion Assignment & Remarks Status Card */}
        {notionStats && (
          <div className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-lg font-bold text-gray-900">
                    {isLeadership
                      ? (effectiveRole === 'TEAM_LEADER'
                          ? `My Assigned Calling Agents (${notionStats.teamName || `${employeeName}'s Team`})`
                          : `Team Notion Assignment & Remarks Distribution (${notionStats.teamName || 'Team'})`)
                      : 'My Assigned Notion Sheets & Remarks Status'}
                  </h3>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {effectiveRole === 'TEAM_LEADER'
                    ? 'Real-time monitoring of your direct calling agents, sheet allocation, and remarks feedback submitted'
                    : isLeadership
                    ? 'Real-time monitoring of team sheets, lead allocation, and remarks feedback submitted'
                    : 'Sheets assigned to you with lead counts and your remarks progress'}
                </p>
              </div>
              <Link
                href="/notion-pages"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl transition-colors shrink-0"
              >
                <span>Open Notion Workspace</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>

            {isLeadership ? (
              /* Leadership View: Team Members Breakdown */
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                  <div>
                    <span className="text-xs text-gray-500 font-medium">Team Sheets</span>
                    <p className="text-xl font-bold text-gray-900">{notionStats.summary?.teamSheets || 0}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-medium">Total Sheet Leads</span>
                    <p className="text-xl font-bold text-indigo-600">{notionStats.summary?.totalLeads || 0}</p>
                  </div>
                  <div>
                    <span className="text-xs text-emerald-700 font-medium">Remarks Filled</span>
                    <p className="text-xl font-bold text-emerald-600">{notionStats.summary?.remarksFilled || 0}</p>
                  </div>
                  <div>
                    <span className="text-xs text-amber-700 font-medium">Remarks Pending</span>
                    <p className="text-xl font-bold text-amber-600">{notionStats.summary?.remarksEmpty || 0}</p>
                  </div>
                </div>

                {notionStats.members && notionStats.members.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-left text-sm text-gray-600">
                      <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-700 border-b border-gray-100">
                        <tr>
                          <th className="px-4 py-3">{effectiveRole === 'TEAM_LEADER' ? 'Assigned Agent' : 'Team Member'}</th>
                          <th className="px-4 py-3">Role</th>
                          <th className="px-4 py-3 text-center">Assigned Sheets</th>
                          <th className="px-4 py-3 text-center">Total Leads</th>
                          <th className="px-4 py-3 text-center">Remarks Filled</th>
                          <th className="px-4 py-3 text-center">Pending</th>
                          <th className="px-4 py-3">Remarks Progress</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {notionStats.members.map((member: any, idx: number) => {
                          const total = member.totalLeads || 0;
                          const pct = total > 0 ? Math.round((member.remarksFilled / total) * 100) : 0;
                          return (
                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 font-semibold text-gray-900">{member.name}</td>
                              <td className="px-4 py-3">
                                <span className="inline-block px-2 py-0.5 text-[11px] font-bold rounded-md bg-gray-100 text-gray-700">
                                  {member.role?.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center font-bold text-indigo-600">{member.sheetsCount}</td>
                              <td className="px-4 py-3 text-center font-bold text-gray-900">{member.totalLeads}</td>
                              <td className="px-4 py-3 text-center font-bold text-emerald-600">{member.remarksFilled}</td>
                              <td className="px-4 py-3 text-center font-bold text-amber-600">{member.remarksEmpty}</td>
                              <td className="px-4 py-3 min-w-[140px]">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-emerald-500 rounded-full transition-all"
                                      style={{ width: `${Math.min(pct, 100)}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-bold text-gray-600 w-9 text-right">{pct}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic p-2">No team members assigned sheets yet.</p>
                )}
              </div>
            ) : (
              /* Employee View: My Scoped Sheets Only */
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                  <div>
                    <span className="text-xs text-gray-500 font-medium">My Sheets</span>
                    <p className="text-xl font-bold text-gray-900">{notionStats.summary?.mySheets || 0}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-medium">My Assigned Leads</span>
                    <p className="text-xl font-bold text-indigo-600">{notionStats.summary?.totalLeads || 0}</p>
                  </div>
                  <div>
                    <span className="text-xs text-emerald-700 font-medium">Remarks Submitted</span>
                    <p className="text-xl font-bold text-emerald-600">{notionStats.summary?.remarksFilled || 0}</p>
                  </div>
                  <div>
                    <span className="text-xs text-amber-700 font-medium">Pending Remarks</span>
                    <p className="text-xl font-bold text-amber-600">{notionStats.summary?.remarksEmpty || 0}</p>
                  </div>
                </div>

                {notionStats.sheets && notionStats.sheets.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {notionStats.sheets.map((sheet: any, idx: number) => (
                      <Link
                        key={idx}
                        href={`/notion-pages?id=${sheet._id}`}
                        className="group p-4 rounded-2xl border border-gray-100 hover:border-indigo-300 bg-gray-50/50 hover:bg-white transition-all shadow-xs"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 truncate">{sheet.title}</span>
                          <ExternalLink className="h-3.5 w-3.5 text-gray-400 group-hover:text-indigo-600 shrink-0" />
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Total: <strong className="text-gray-900">{sheet.totalLeads}</strong></span>
                          <span>Done: <strong className="text-emerald-600">{sheet.remarksFilled}</strong></span>
                          <span>Pending: <strong className="text-amber-600">{sheet.remarksEmpty}</strong></span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic p-2">No Notion sheets currently assigned to your desk.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Charts & Funnel */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Chart */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Lead Trends</h3>
                <p className="text-sm text-gray-500">Monthly breakdown of leads</p>
              </div>
            </div>
            <div className="h-[320px] w-full">
              <Chart options={chartOptions} series={chartSeries} type="area" height="100%" width="100%" />
            </div>
          </div>

          {/* Actionable Workqueue (Onboarding Funnel) */}
          <div className="flex flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Pipeline Focus</h3>
                <p className="text-sm text-gray-500">Stages overview</p>
              </div>
              <button className="rounded-full bg-gray-50 p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-5">
              {dashboard?.pipelineData ? (
                dashboard.pipelineData.map((stage: any, idx: number) => {
                  const colors = ["bg-blue-500", "bg-amber-500", "bg-purple-500", "bg-emerald-500"];
                  const max = Math.max(...dashboard.pipelineData.map((s: any) => s.count), 1);
                  return (
                    <div key={idx} className="group">
                      <div className="flex justify-between text-sm font-semibold mb-2">
                        <span className="text-gray-700 group-hover:text-indigo-600 transition-colors">{stage.stage}</span>
                        <span className="text-gray-900">{stage.count}</span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                        <div className={`h-full rounded-full ${colors[idx % colors.length]} transition-all duration-1000 ease-out`} style={{ width: `${Math.min((stage.count / max) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                [
                  { stage: "New Leads", count: (stats?.totalLeads || stats?.myLeads || 0) > 0 ? (stats?.totalLeads || stats?.myLeads) : 10, color: "bg-blue-500", max: 100 },
                  { stage: "Document Verification", count: (stats?.totalLeads || stats?.myLeads || 0) > 0 ? Math.floor((stats?.totalLeads || stats?.myLeads) * 0.4) : 4, color: "bg-amber-500", max: 100 },
                  { stage: "Underwriting / Credit", count: (stats?.totalLeads || stats?.myLeads || 0) > 0 ? Math.floor((stats?.totalLeads || stats?.myLeads) * 0.2) : 2, color: "bg-purple-500", max: 100 },
                  { stage: "Approved / Disbursed", count: (stats?.totalLeads || stats?.myLeads || 0) > 0 ? Math.floor((stats?.totalLeads || stats?.myLeads) * 0.1) : 1, color: "bg-emerald-500", max: 100 },
                ].map((stage, idx) => (
                  <div key={idx} className="group">
                    <div className="flex justify-between text-sm font-semibold mb-2">
                      <span className="text-gray-700 group-hover:text-indigo-600 transition-colors">{stage.stage}</span>
                      <span className="text-gray-900">{stage.count}</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div className={`h-full rounded-full ${stage.color} transition-all duration-1000 ease-out`} style={{ width: `${Math.min((stage.count / (stage.max || 1)) * 100, 100)}%` }}></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* OMS Specific Assigned Leads Queue */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-gray-900">
                  {isLeadership ? 'Assigned OMS Leads Queue (Team Specific)' : `My Assigned OMS Leads (${userName})`}
                </h3>
                <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  ⚡ Live OMS Integration
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Showing cases synced directly from OMS specifically linked to your desk
              </p>
            </div>
          </div>

          {loadingOms ? (
            <div className="py-12 flex justify-center items-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            </div>
          ) : omsLeads.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-700 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3">Customer Name</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3 text-center">OMS Ticket</th>
                    <th className="px-4 py-3">Lender / Provider</th>
                    <th className="px-4 py-3">Loan Amount</th>
                    <th className="px-4 py-3 text-center">OMS Status</th>
                    <th className="px-4 py-3 text-center">Source</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {omsLeads.map((item: any, idx: number) => {
                    const ticketStatusUpper = (item.omsTicketStatus || item.status || 'NEW').toUpperCase();
                    const statusColor = ticketStatusUpper.includes('DISBURS') || ticketStatusUpper.includes('APPROV')
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : ticketStatusUpper.includes('REJECT')
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200';

                    return (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-gray-900">
                          {item.fullName || 'Customer Lead'}
                        </td>
                        <td className="px-4 py-3.5 text-gray-600">
                          <span className="font-mono text-xs">{item.phone || '-'}</span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {item.omsTicketId ? (
                            <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold font-mono bg-purple-50 text-purple-700 border border-purple-200">
                              #{item.omsTicketId}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 font-medium text-gray-700">
                          {item.omsProvider || 'Direct'}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-gray-900">
                          {item.loanAmount ? `₹ ${Number(item.loanAmount).toLocaleString('en-IN')}` : '₹ 0'}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusColor}`}>
                            {ticketStatusUpper}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-600 uppercase">
                            {item.leadSource || item.omsLeadType || 'OMS'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <button
                            onClick={() => setJourneyLeadId(item._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                            title="View Lead History & Journey"
                          >
                            <Activity className="h-3.5 w-3.5 text-blue-600" />
                            <span>History</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <Database className="h-10 w-10 text-gray-300 mb-3" />
              <h4 className="text-sm font-bold text-gray-700">No OMS Leads Assigned Right Now</h4>
              <p className="mt-1 text-xs text-gray-500 max-w-sm">
                As soon as fresh leads from OMS are assigned to {userName}, they will automatically appear in this live queue.
              </p>
            </div>
          )}
        </div>

        <LeadJourneyDialog
          open={!!journeyLeadId}
          onClose={() => setJourneyLeadId(null)}
          leadId={journeyLeadId}
        />
      </div>
    );
  }

  // Admin quick-stat cards using real data
  const adminStats = [
    { title: "Total Users", val: stats?.totalUsers || 0, sub: "Registered staff", icon: Users, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100", href: "/users" },
    { title: "Active Teams", val: stats?.totalTeams || 0, sub: "Running teams", icon: Building2, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100", href: "/teams" },
    { title: "Total Leads", val: (pipeline?.leads?.active || 0) + (pipeline?.leads?.inactive || 0) || stats?.totalLeads || leadStats?.total || 0, sub: "All OMS leads", icon: Target, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", href: "/leads" },
    // { title: "Active Customers", val: pipeline?.customers?.active || 0, sub: "Onboarded clients", icon: UserCircle, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", href: "/customers" },
    { title: "Branches", val: stats?.totalBranches || 0, sub: "Office locations", icon: GitBranch, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", href: "/branches" },
    { title: "Active Roles", val: stats?.totalRoles || 0, sub: "Permission roles", icon: ShieldCheck, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100", href: "/roles" },
  ];

  // Quick action nav items
  const quickLinks = [
    { label: "Manage Users", desc: "Add / edit staff accounts", icon: UserCog, color: "text-indigo-600", bg: "bg-indigo-50", href: "/users" },
    { label: "Manage Teams", desc: "Assign members & leaders", icon: Building2, color: "text-violet-600", bg: "bg-violet-50", href: "/teams" },
    { label: "All Leads", desc: "View & assign leads", icon: Target, color: "text-blue-600", bg: "bg-blue-50", href: "/leads" },
    // { label: "Customers", desc: "Onboarded client records", icon: UserCircle, color: "text-emerald-600", bg: "bg-emerald-50", href: "/customers" },
    { label: "Notion Pages", desc: "Calling sheet management", icon: FileSpreadsheet, color: "text-purple-600", bg: "bg-purple-50", href: "/notion-pages" },
    // { label: "Follow-ups", desc: "Pending reminders", icon: CalendarClock, color: "text-amber-600", bg: "bg-amber-50", href: "/follow-ups" },
    { label: "Roles & Perms", desc: "Access control", icon: ShieldCheck, color: "text-rose-600", bg: "bg-rose-50", href: "/roles" },
    // { label: "Settings", desc: "System configuration", icon: Settings2, color: "text-gray-600", bg: "bg-gray-100", href: "/settings" },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-800 p-8 text-white shadow-xl">
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white opacity-5 blur-3xl" />
        <div className="absolute right-20 bottom-0 h-40 w-40 rounded-full bg-indigo-400 opacity-20 blur-2xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <LayoutDashboard className="h-5 w-5 text-amber-300" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">System Administration</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1">Welcome back, {userName}!</h2>
            <p className="text-indigo-100 text-sm sm:text-base max-w-xl">
              Full control over users, teams, leads, and system configuration.
            </p>
          </div>
          <div className="shrink-0 flex gap-3">
            <button onClick={refresh} className="flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-md px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/30">
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </button>
            
          </div>
        </div>
      </div>

      {/* Key Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {adminStats.map((s, i) => (
          <Link key={i} href={s.href}
            className={`group relative overflow-hidden rounded-2xl border ${s.border} bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md`}
          >
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${s.bg}`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <p className="text-xs font-semibold text-gray-500 mb-0.5">{s.title}</p>
            <h3 className="text-2xl font-extrabold text-gray-900">{s.val}</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">{s.sub}</p>
            <ChevronRight className={`absolute right-3 top-3 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity ${s.color}`} />
          </Link>
        ))}
      </div>

      {/* Quick Actions Grid */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Zap className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
          <span className="text-xs text-gray-400 font-medium ml-1">— jump to any section</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {quickLinks.map((q, i) => (
            <Link key={i} href={q.href}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-gray-100 hover:border-indigo-200 bg-gray-50/60 hover:bg-white p-4 transition-all hover:shadow-md text-center"
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${q.bg} group-hover:scale-110 transition-transform`}>
                <q.icon className={`h-5 w-5 ${q.color}`} />
              </div>
              <span className="text-xs font-bold text-gray-700 group-hover:text-indigo-600 leading-tight">{q.label}</span>
              <span className="text-[10px] text-gray-400 leading-tight hidden sm:block">{q.desc}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Lead Stats from API + Pipeline Overview */}
      <DashboardCards
        stats={leadStats}
        variant="large"
        onCardClick={(filter) => {
          if (filter === 'ALL') router.push('/leads');
          else router.push(`/leads?status=${filter}`);
        }}
      />

      {/* SLA Health + Agent Workload Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* SLA Summary */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <BellRing className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-gray-900">SLA Health</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: "Tracked Cases", val: slaData?.totalActive || 0, color: "bg-indigo-500", textColor: "text-indigo-600", max: slaData?.totalActive || 1 },
              { label: "Within SLA", val: slaData?.withinSla || 0, color: "bg-emerald-500", textColor: "text-emerald-600", max: slaData?.totalActive || 1 },
              { label: "At Risk", val: slaData?.atRisk || 0, color: "bg-amber-500", textColor: "text-amber-600", max: slaData?.totalActive || 1 },
              { label: "SLA Breached", val: slaData?.breached || 0, color: "bg-red-500", textColor: "text-red-600", max: slaData?.totalActive || 1 },
            ].map((row, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-600">{row.label}</span>
                  <span className={`font-bold ${row.textColor}`}>{row.val}</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${row.color} rounded-full transition-all duration-700`}
                    style={{ width: `${Math.min((row.val / (row.max || 1)) * 100, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Workload Table */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-600" />
              <h3 className="text-base font-bold text-gray-900">Agent Workload</h3>
            </div>
            <Link href="/leads" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
              View All <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  {/* <th className="pb-3 text-xs font-black uppercase tracking-wider text-gray-500">Agent</th> */}
                  <th className="pb-3 text-xs font-black uppercase tracking-wider text-gray-500 text-center">Leads</th>
                  <th className="pb-3 text-xs font-black uppercase tracking-wider text-gray-500 text-center">Follow-ups</th>
                  <th className="pb-3 text-xs font-black uppercase tracking-wider text-amber-600 text-center">At Risk</th>
                  <th className="pb-3 text-xs font-black uppercase tracking-wider text-red-600 text-center">Breached</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {agentWorkload && agentWorkload.length > 0 ? (
                  agentWorkload.slice(0, 8).map((agent: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      {/* <td className="py-3 font-semibold text-gray-900">
                        <Link href={`/leads?assignedTo=${agent._id}`} className="hover:text-indigo-600">
                          {agent.name}
                        </Link>
                      </td> */}
                      <td className="py-3 text-center">
                        <span className="inline-flex items-center justify-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">{agent.activeLeads}</span>
                      </td>
                      <td className="py-3 text-center">
                        <span className={`text-xs font-bold ${agent.pendingFollowUps > 0 ? 'text-amber-600' : 'text-gray-400'}`}>{agent.pendingFollowUps}</span>
                      </td>
                      <td className="py-3 text-center">
                        <span className={`text-xs font-bold ${agent.atRisk > 0 ? 'text-amber-600' : 'text-gray-300'}`}>{agent.atRisk || '-'}</span>
                      </td>
                      <td className="py-3 text-center">
                        <span className={`text-xs font-bold ${agent.breached > 0 ? 'text-red-600' : 'text-gray-300'}`}>{agent.breached || '-'}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-sm text-gray-400">No workload data yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Notion Assignment Overview — Who got how much data */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-gray-900">Notion Assignment Overview</h3>
              <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-indigo-200">
                {notionStats?.members?.length || 0} Active Members
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Member-wise Notion sheet allocation, lead count, and remarks discipline across all teams
            </p>
          </div>
          <div className="flex items-center gap-4 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100 shrink-0">
            <div className="text-center">
              <p className="text-xs text-gray-500 font-medium">Total Sheets</p>
              <p className="text-lg font-extrabold text-indigo-600">{notionStats?.summary?.totalSheets || 0}</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <p className="text-xs text-gray-500 font-medium">Total Leads</p>
              <p className="text-lg font-extrabold text-gray-900">{notionStats?.summary?.totalLeads || 0}</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <p className="text-xs text-emerald-600 font-medium">Remarks Done</p>
              <p className="text-lg font-extrabold text-emerald-600">{notionStats?.summary?.remarksFilled || 0}</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <p className="text-xs text-amber-600 font-medium">Pending</p>
              <p className="text-lg font-extrabold text-amber-600">{notionStats?.summary?.remarksEmpty || 0}</p>
            </div>
          </div>
        </div>

        {notionStats?.members && notionStats.members.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase font-black text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Member</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3 text-center">Sheets</th>
                  <th className="px-4 py-3 text-center">Total Leads</th>
                  <th className="px-4 py-3 text-center text-emerald-600">Filled</th>
                  <th className="px-4 py-3 text-center text-amber-600">Pending</th>
                  <th className="px-4 py-3">Remarks Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {notionStats.members.map((member: any, idx: number) => {
                  const total = member.totalLeads || 0;
                  const filled = member.remarksFilled || 0;
                  const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
                  const barColor = pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-blue-500' : pct >= 25 ? 'bg-amber-500' : 'bg-red-400';
                  return (
                    <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="px-4 py-3.5 text-gray-400 font-bold text-xs">{idx + 1}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-black">
                            {member.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <span className="font-bold text-gray-900">{member.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-block px-2 py-0.5 text-[10px] font-black rounded-md bg-gray-100 text-gray-600 uppercase tracking-wide">
                          {(member.role || '').replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center justify-center rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-bold text-purple-700">{member.sheetsCount}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center font-extrabold text-gray-900">{total}</td>
                      <td className="px-4 py-3.5 text-center font-bold text-emerald-600">{filled}</td>
                      <td className="px-4 py-3.5 text-center font-bold text-amber-600">{member.remarksEmpty || 0}</td>
                      <td className="px-4 py-3.5 min-w-[160px]">
                        <div className="flex items-center gap-2.5">
                          <div className="h-2 flex-1 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${barColor} rounded-full transition-all duration-700`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <span className={`text-xs font-extrabold w-10 text-right ${pct >= 80 ? 'text-emerald-600' : pct >= 50 ? 'text-blue-600' : pct >= 25 ? 'text-amber-600' : 'text-red-500'}`}>
                            {pct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            <FileSpreadsheet className="h-10 w-10 text-gray-200 mb-3" />
            <p className="text-sm font-bold text-gray-500">No Notion sheets assigned yet</p>
            <Link href="/notion-pages" className="mt-3 text-xs font-bold text-indigo-600 hover:underline">
              Go to Notion Pages →
            </Link>
          </div>
        )}
      </div>

      {/* Stage Aging + Today's Movement */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stage Aging */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-gray-900">Stage Aging Overview</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 text-xs font-black uppercase tracking-wider text-gray-500">Stage</th>
                  <th className="pb-3 text-xs font-black uppercase tracking-wider text-gray-500 text-center">Active</th>
                  <th className="pb-3 text-xs font-black uppercase tracking-wider text-gray-500">Avg Age</th>
                  <th className="pb-3 text-xs font-black uppercase tracking-wider text-amber-600 text-center">At Risk</th>
                  <th className="pb-3 text-xs font-black uppercase tracking-wider text-red-600 text-center">Breached</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stageAging?.agingStats && stageAging.agingStats.length > 0 ? (
                  stageAging.agingStats.map((stat: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 font-semibold text-gray-900">{stat.stage}</td>
                      <td className="py-3 text-center">
                        <span className="inline-flex items-center justify-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">{stat.activeCases}</span>
                      </td>
                      <td className="py-3 text-gray-500 text-xs">{stat.avgAgeDays?.toFixed(1) || '0'}d avg</td>
                      <td className="py-3 text-center">
                        <span className={`text-xs font-bold ${stat.atRiskCount > 0 ? 'text-amber-600' : 'text-gray-300'}`}>{stat.atRiskCount || '-'}</span>
                      </td>
                      <td className="py-3 text-center">
                        <span className={`text-xs font-bold ${stat.breachedCount > 0 ? 'text-red-600' : 'text-gray-300'}`}>{stat.breachedCount || '-'}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="py-10 text-center text-sm text-gray-400">No stage data available.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Today's Movement Feed */}
        <div className="flex flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-sm max-h-[380px] overflow-y-auto">
          <div className="flex items-center justify-between mb-4 sticky top-0 bg-white pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-indigo-600" />
              <h3 className="text-base font-bold text-gray-900">Today's Events</h3>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="flex-1 space-y-3 mt-1">
            {movement?.recentEvents && movement.recentEvents.length > 0 ? (
              movement.recentEvents.map((evt: any, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">
                      {evt.recordType === 'EVENT' ? evt.eventType?.replace(/_/g, ' ') : `→ ${evt.stage}`}
                    </p>
                    <time className="text-[10px] text-gray-400">
                      {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </time>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Activity className="h-8 w-8 text-gray-200 mb-2" />
                <p className="text-xs text-gray-400">No events yet today</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <LeadJourneyDialog
        open={!!journeyLeadId}
        onClose={() => setJourneyLeadId(null)}
        leadId={journeyLeadId}
      />
    </div>
  );
}