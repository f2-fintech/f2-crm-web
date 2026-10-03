"use client";

import { useEffect, useState } from "react";
import useDashboard from "@/hooks/useDashboard";
import { useAuth } from "@/hooks/useAuth";
import { 
  Users, Building2, UserCircle, Briefcase, 
  ShieldCheck, Activity, FileText, Target,
  Sparkles, TrendingUp, Clock, CheckCircle2,
  AlertCircle, ChevronRight, BarChart3,
  ArrowUpRight, ArrowDownRight, Zap
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function DashboardClient() {
  const { dashboard, loading, error, refresh } = useDashboard();
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
  if (roleType === 'ADMIN' || roleType === 'SUPER_ADMIN') {
    metrics = [
      { title: "Total Users", val: stats.totalUsers || 0, trend: "+5.2%", isUp: true, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
      { title: "Active Teams", val: stats.totalTeams || 0, trend: "+2.1%", isUp: true, icon: Building2, color: "text-purple-600", bg: "bg-purple-50" },
      { title: "Total Branches", val: stats.totalBranches || 0, trend: "0%", isUp: true, icon: Target, color: "text-emerald-600", bg: "bg-emerald-50" },
      { title: "Active Roles", val: stats.totalRoles || 0, trend: "+1.0%", isUp: true, icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-50" }
    ];
  } else if (roleType === 'MANAGER' || roleType === 'TEAM_LEADER') {
    metrics = [
      { title: "Team Size", val: stats.teamSize || 0, trend: "+10%", isUp: true, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
      { title: "Active Members", val: stats.activeMembers || 0, trend: "+5%", isUp: true, icon: UserCircle, color: "text-purple-600", bg: "bg-purple-50" },
      { title: "Total Leads", val: stats.totalLeads || 0, trend: "+12.5%", isUp: true, icon: Target, color: "text-emerald-600", bg: "bg-emerald-50" },
      { title: "Team Pages", val: stats.teamPages || 0, trend: "+14.0%", isUp: true, icon: FileText, color: "text-amber-600", bg: "bg-amber-50" }
    ];
  } else if (roleType === 'EMPLOYEE') {
    metrics = [
      { title: "My Tasks", val: stats.myLeads || 0, trend: "+12%", isUp: true, icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50" },
      { title: "Documents Reviewed", val: stats.assignedPages || 0, trend: "+5%", isUp: true, icon: FileText, color: "text-purple-600", bg: "bg-purple-50" },
      { title: "Pending Approvals", val: 0, trend: "-1%", isUp: false, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
      { title: "Completed Work", val: 0, trend: "+8%", isUp: true, icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" }
    ];
  } else if (roleType === 'SOURCER') {
    metrics = [
      { title: "Sourced Leads", val: stats.myLeads || 0, trend: "+20%", isUp: true, icon: Target, color: "text-blue-600", bg: "bg-blue-50" },
      { title: "Conversion Rate", val: "0%", trend: "0%", isUp: true, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
      { title: "Active Campaigns", val: 0, trend: "0%", isUp: true, icon: Activity, color: "text-amber-600", bg: "bg-amber-50" },
      { title: "Successful Deals", val: 0, trend: "+2%", isUp: true, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" }
    ];
  } else if (roleType === 'CHANNEL_PARTNER') {
    metrics = [
      { title: "Referred Leads", val: stats.myLeads || 0, trend: "+15%", isUp: true, icon: Target, color: "text-blue-600", bg: "bg-blue-50" },
      { title: "Commission Earned", val: "$0", trend: "+0%", isUp: true, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
      { title: "Pending Payouts", val: 0, trend: "0%", isUp: true, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
      { title: "Partner Rank", val: "New", trend: "-", isUp: true, icon: ShieldCheck, color: "text-purple-600", bg: "bg-purple-50" }
    ];
  } else {
    metrics = [
      { title: "My Leads", val: stats.myLeads || 0, trend: "+15%", isUp: true, icon: Target, color: "text-blue-600", bg: "bg-blue-50" },
      { title: "Assigned Pages", val: stats.assignedPages || 0, trend: "+5.2%", isUp: true, icon: FileText, color: "text-purple-600", bg: "bg-purple-50" },
      { title: "Completed Tasks", val: 0, trend: "0%", isUp: true, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
      { title: "Pending Actions", val: 0, trend: "-2%", isUp: false, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" }
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
      {/* AI Insights Banner (Premium Feature) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 p-8 text-white shadow-lg">
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white opacity-5 blur-3xl"></div>
        <div className="absolute right-20 bottom-0 h-40 w-40 rounded-full bg-indigo-400 opacity-20 blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-amber-300" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">Welcome Back</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              Good Morning, {userName}!
            </h2>
            <p className="text-indigo-100 max-w-2xl text-sm sm:text-base leading-relaxed">
              Here is your daily snapshot. Your dashboard is tailored for your <strong>{roleType?.replace('_', ' ')}</strong> role.
              Check out the latest metrics and activity to stay updated.
            </p>
          </div>
          <div className="shrink-0 flex gap-3">
            {roleType === 'ADMIN' || roleType === 'SUPER_ADMIN' || roleType === 'MANAGER' ? (
              <button className="flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-md px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/30">
                <Zap className="h-4 w-4 text-amber-300" />
                Auto-Assign Leads
              </button>
            ) : null}
            {(roleType === 'ADMIN' || roleType === 'SUPER_ADMIN') && (
              <span className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-600 shadow-sm transition-all opacity-50 cursor-not-allowed">
                View Workqueue
              </span>
            )}
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
                { stage: "New Leads", count: (stats.totalLeads || stats.myLeads || 0) > 0 ? (stats.totalLeads || stats.myLeads) : 10, color: "bg-blue-500", max: 100 },
                { stage: "Document Verification", count: (stats.totalLeads || stats.myLeads || 0) > 0 ? Math.floor((stats.totalLeads || stats.myLeads) * 0.4) : 4, color: "bg-amber-500", max: 100 },
                { stage: "Underwriting / Credit", count: (stats.totalLeads || stats.myLeads || 0) > 0 ? Math.floor((stats.totalLeads || stats.myLeads) * 0.2) : 2, color: "bg-purple-500", max: 100 },
                { stage: "Approved / Disbursed", count: (stats.totalLeads || stats.myLeads || 0) > 0 ? Math.floor((stats.totalLeads || stats.myLeads) * 0.1) : 1, color: "bg-emerald-500", max: 100 },
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

          {(roleType === 'ADMIN' || roleType === 'SUPER_ADMIN') && (
            <span className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-indigo-50 bg-indigo-50/50 py-3 text-sm font-bold text-indigo-600 opacity-50 cursor-not-allowed">
              Open Workqueue
              <ArrowUpRight className="h-4 w-4" />
            </span>
          )}
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-bold text-gray-900">Recent Activity</h3>
        {recentActivity && recentActivity.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentActivity.map((activity: any, idx: number) => {
              const Icon = UserCircle;
              return (
                <div key={activity._id || idx} className="flex gap-4 rounded-2xl border border-gray-50 p-4 transition-all hover:bg-gray-50 hover:border-gray-100">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{activity.title}</p>
                    <p className="mt-0.5 text-xs font-medium text-gray-500 line-clamp-2">{activity.description}</p>
                    <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      {new Date(activity.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-gray-50 p-4">
              <Activity className="h-8 w-8 text-gray-400" />
            </div>
            <h4 className="text-sm font-bold text-gray-900">No Recent Activity</h4>
            <p className="mt-1 text-sm text-gray-500">There are no recent activities to show for your role.</p>
          </div>
        )}
      </div>
    </div>
  );
}