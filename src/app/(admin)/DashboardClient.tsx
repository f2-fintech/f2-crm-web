"use client";

import { useEffect, useState } from "react";
import useDashboard from "@/hooks/useDashboard";
import { useAuth } from "@/hooks/useAuth";
import { 
  Users, Building2, UserCircle, Briefcase, 
  ShieldCheck, Activity, FileText, Target,
  Sparkles, TrendingUp, Clock, CheckCircle2,
  AlertCircle, ChevronRight, BarChart3,
  ArrowUpRight, ArrowDownRight, Zap, RefreshCw, FileWarning
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function DashboardClient() {
  const { dashboard, pipeline, movement, stageAging, agentWorkload, agentActivity, slaData, loading, error, refresh } = useDashboard();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  let metrics = [];
  if (pipeline) {
    metrics = [
      { title: "Active Leads", val: pipeline.leads?.active || 0, trend: "Current", isUp: true, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
      { title: "Pending Applications", val: pipeline.applications?.pending || 0, trend: "Pipeline", isUp: true, icon: FileText, color: "text-amber-600", bg: "bg-amber-50" },
      { title: "Approved Apps", val: pipeline.applications?.approved || 0, trend: "Approved", isUp: true, icon: CheckCircle2, color: "text-purple-600", bg: "bg-purple-50" },
      { title: "Active Customers", val: pipeline.customers?.active || 0, trend: "Live", isUp: true, icon: Target, color: "text-emerald-600", bg: "bg-emerald-50" }
    ];
  } else {
    // Fallback if Phase 5 API fails or returns null
    metrics = [
      { title: "Total Users", val: stats.totalUsers || 0, trend: "+5.2%", isUp: true, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
      { title: "Active Teams", val: stats.totalTeams || 0, trend: "+2.1%", isUp: true, icon: Building2, color: "text-purple-600", bg: "bg-purple-50" },
      { title: "Total Branches", val: stats.totalBranches || 0, trend: "0%", isUp: true, icon: Target, color: "text-emerald-600", bg: "bg-emerald-50" },
      { title: "Active Roles", val: stats.totalRoles || 0, trend: "+1.0%", isUp: true, icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-50" }
    ];
  }

  // Premium Chart Options
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
      categories: monthlyLeads?.data?.length ? monthlyLeads.data.map((d) => d.name) : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
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
      data: monthlyLeads?.data?.length ? monthlyLeads.data.map((d) => d.value) : [12, 34, 23, 56, 34, 45, 78],
    }
  ];

  const userName = user?.firstName ? `${user.firstName} ${user.lastName || ''}` : roleType || 'User';

  return (
    <div className="space-y-8 pb-12">
      {/* AI Insights Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 p-8 text-white shadow-lg">
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white opacity-5 blur-3xl"></div>
        <div className="absolute right-20 bottom-0 h-40 w-40 rounded-full bg-indigo-400 opacity-20 blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-amber-300" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">Management Control Tower</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              Good Morning, {userName}!
            </h2>
            <p className="text-indigo-100 max-w-2xl text-sm sm:text-base leading-relaxed">
              Real-time monitoring of the client lifecycle and operations. Data refreshes every 60 seconds automatically.
            </p>
          </div>
          <div className="shrink-0 flex gap-3">
            <button onClick={refresh} className="flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-md px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/30">
              <RefreshCw className="h-4 w-4" />
              Sync Now
            </button>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m, i) => (
          <div key={i} className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] transition-all hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${m.bg}`}>
                <m.icon className={`h-6 w-6 ${m.color}`} />
              </div>
              <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-600`}>
                <ArrowUpRight className="h-3 w-3" />
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

      {/* Client Lifecycle Overview */}
      {pipeline && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-indigo-700">Active Onboarding</p>
              <h4 className="text-xl font-bold text-indigo-900">{pipeline.leads?.active + pipeline.applications?.pending}</h4>
            </div>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-700">Active Customers</p>
              <h4 className="text-xl font-bold text-emerald-900">{pipeline.customers?.active || 0}</h4>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-700">Recently Closed</p>
              <h4 className="text-xl font-bold text-gray-900">{pipeline.customers?.closed || 0}</h4>
            </div>
          </div>
          <div className="rounded-xl border border-red-100 bg-red-50/50 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-700">SLA Breached</p>
              <h4 className="text-xl font-bold text-red-900">{slaData?.breached || 0}</h4>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 mt-4">
        {/* SLA & Aging Overview */}
        {slaData && (
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                <Clock className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Tracked Cases</p>
                <h4 className="text-xl font-bold text-gray-900">{slaData.totalActive || 0}</h4>
              </div>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-emerald-700">Within SLA</p>
                <h4 className="text-xl font-bold text-emerald-900">{slaData.withinSla || 0}</h4>
              </div>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                <FileWarning className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-amber-700">At Risk</p>
                <h4 className="text-xl font-bold text-amber-900">{slaData.atRisk || 0}</h4>
              </div>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-red-700">SLA Breached</p>
                <h4 className="text-xl font-bold text-red-900">{slaData.breached || 0}</h4>
              </div>
            </div>
          </div>
        )}

        {/* Stage Aging & Attention Required */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Stage Aging &amp; Attention Required</h3>
              <p className="text-sm text-gray-500">Active cases and SLA performance by lifecycle stage</p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800/50 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Stage</th>
                  <th className="px-4 py-3 font-semibold">Active Cases</th>
                  <th className="px-4 py-3 font-semibold">Avg Age</th>
                  <th className="px-4 py-3 font-semibold">At Risk</th>
                  <th className="px-4 py-3 font-semibold">Breached</th>
                  <th className="px-4 py-3 font-semibold">SLA</th>
                </tr>
              </thead>
              <tbody>
                {stageAging?.agingStats && stageAging.agingStats.length > 0 ? (
                  stageAging.agingStats.map((stat: any, idx: number) => (
                    <tr key={idx} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {stat.stage}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">
                          {stat.activeCases}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {stat.avgAgeDays?.toFixed(1) || '0'}d (Oldest: {stat.oldestDays?.toFixed(1)}d)
                      </td>
                      <td className="px-4 py-3">
                        {stat.atRiskCount > 0 ? (
                          <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
                            {stat.atRiskCount}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {stat.breachedCount > 0 ? (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                            {stat.breachedCount}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {stat.slaConfigured ? (
                          <span className="text-xs font-medium text-gray-600">{stat.allowedDays}d Allowed</span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Not configured</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center">
                      No active cases across stages.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Real-Time Movement Feed */}
        <div className="flex flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-sm max-h-[500px] overflow-y-auto">
          <div className="flex items-center justify-between mb-6 sticky top-0 bg-white z-10 pb-2 border-b border-gray-100">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Today's Movement</h3>
              <p className="text-sm text-gray-500">Live lifecycle events</p>
            </div>
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>

          <div className="flex-1 space-y-4 mt-2">
            {movement?.recentEvents && movement.recentEvents.length > 0 ? (
              movement.recentEvents.map((evt: any) => (
                <div key={evt._id} className="relative pl-6">
                  <span className="absolute left-0 top-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-blue-100 ring-4 ring-white">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  </span>
                  <div className="flex flex-col">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-semibold text-gray-900">
                        {evt.recordType === 'EVENT' ? evt.eventType?.replace(/_/g, ' ') : `Entered: ${evt.stage}`}
                      </h4>
                      <time className="text-[10px] font-medium text-gray-400">
                        {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </time>
                    </div>
                    {evt.source && (
                      <span className="mt-1 inline-flex self-start rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 border border-gray-200">
                        {evt.source}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 rounded-full bg-gray-50 p-4">
                  <Activity className="h-8 w-8 text-gray-400" />
                </div>
                <h4 className="text-sm font-bold text-gray-900">No Movement Yet</h4>
                <p className="mt-1 text-sm text-gray-500">Events will appear here in real-time.</p>
              </div>
            )}
          </div>
        </div>
        {/* Agent Workload & Performance */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Agent Performance &amp; Workload</h3>
              <p className="text-sm text-gray-500">Current active workload and follow-up discipline</p>
            </div>
          </div>
          
          <div className="overflow-x-auto mb-8">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Current Pipeline Workload</h4>
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800/50 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Agent</th>
                  <th className="px-4 py-3 font-semibold">Active Leads</th>
                  <th className="px-4 py-3 font-semibold">Active Apps</th>
                  <th className="px-4 py-3 font-semibold">Pending Follow-ups</th>
                  <th className="px-4 py-3 font-semibold">At Risk</th>
                  <th className="px-4 py-3 font-semibold">Breached</th>
                </tr>
              </thead>
              <tbody>
                {agentWorkload && agentWorkload.length > 0 ? (
                  agentWorkload.map((agent: any, idx: number) => (
                    <tr key={idx} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {agent._id ? (
                          <Link href={`/leads?assignedTo=${agent._id}`} className="hover:text-indigo-600 hover:underline">
                            {agent.name}
                          </Link>
                        ) : (
                          <span className="text-gray-500 italic">{agent.name}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                          {agent.activeLeads}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700">
                          {agent.activeApps}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {agent.pendingFollowUps > 0 ? (
                          <span className="text-amber-600 font-medium">{agent.pendingFollowUps}</span>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {agent.atRisk > 0 ? <span className="text-amber-600 font-medium">{agent.atRisk}</span> : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-4 py-3">
                        {agent.breached > 0 ? <span className="text-red-600 font-bold">{agent.breached}</span> : <span className="text-gray-400">-</span>}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No agent workload data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Lifecycle Activity (Selected Period)</h4>
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800/50 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Agent</th>
                  <th className="px-4 py-3 font-semibold">Leads Created</th>
                  <th className="px-4 py-3 font-semibold text-indigo-600">Leads Qualified</th>
                  <th className="px-4 py-3 font-semibold text-green-600">Leads Converted</th>
                  <th className="px-4 py-3 font-semibold">Apps Created</th>
                  <th className="px-4 py-3 font-semibold text-emerald-600">Apps Approved</th>
                  <th className="px-4 py-3 font-semibold text-red-600">Apps Rejected</th>
                </tr>
              </thead>
              <tbody>
                {agentActivity && agentActivity.length > 0 ? (
                  agentActivity.map((agent: any, idx: number) => (
                    <tr key={idx} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {agent.name}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{agent.leadsCreated}</td>
                      <td className="px-4 py-3 font-medium text-indigo-600">{agent.leadsQualified}</td>
                      <td className="px-4 py-3 font-bold text-green-600">{agent.leadsConverted}</td>
                      <td className="px-4 py-3 text-gray-600">{agent.appsCreated}</td>
                      <td className="px-4 py-3 font-bold text-emerald-600">{agent.appsApproved}</td>
                      <td className="px-4 py-3 font-medium text-red-600">{agent.appsRejected}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No lifecycle activity in the selected period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}