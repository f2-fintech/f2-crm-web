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
  GitBranch, UserCog, LayoutDashboard, Settings2, CalendarClock, BellRing,
  MoreHorizontal, DollarSign
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

  if (error && !dashboard) {
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

  const { stats, recentActivity, monthlyLeads, roleType } = dashboard || {
    stats: {},
    recentActivity: [],
    monthlyLeads: { data: [] },
    roleType: effectiveRole || "ADMIN",
  };

  // Chart Options & Series - Rukada style smooth dual wave
  const leadCategories = monthlyLeads?.data?.length
    ? monthlyLeads.data.map((d: any) => d.name)
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];

  const leadRawData = monthlyLeads?.data?.length
    ? monthlyLeads.data.map((d: any) => d.value)
    : [18, 22, 38, 24, 16, 28, 42, 29, 36, 25];

  const processedData = leadRawData.map((val: number) => Math.max(3, Math.round(val * 0.68)));

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
    colors: ["#10b981", "#4f46e5"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth" as const, width: [3, 3] },
    xaxis: {
      categories: leadCategories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#94a3b8', fontSize: '11px', fontWeight: 600 } }
    },
    yaxis: {
      labels: {
        style: { colors: '#94a3b8', fontSize: '11px', fontWeight: 600 },
        formatter: (val: number) => val.toString(),
      },
    },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { top: 0, right: 0, bottom: 0, left: 10 }
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.55,
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
      data: leadRawData,
    },
    {
      name: "Worked Leads",
      data: processedData,
    }
  ];

  // Donut Chart - Top Referral & Pipeline Breakdown
  const totalLeadsCount = (leadStats?.overview?.totalLeads || stats?.totalLeads || pipeline?.leads?.active || 98256);
  const donutOptions = {
    chart: {
      type: "donut" as const,
      fontFamily: 'inherit',
      toolbar: { show: false }
    },
    labels: ['Approved', 'Follow Up', 'Disbursed', 'Rejected'],
    colors: ['#10b981', '#4f46e5', '#f59e0b', '#ff416c'],
    legend: { show: false },
    dataLabels: { enabled: false },
    stroke: { width: 3, colors: ['#ffffff'] },
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            show: true,
            name: { show: true, fontSize: '12px', fontWeight: 600, color: '#94a3b8', offsetY: -6 },
            value: {
              show: true,
              fontSize: '22px',
              fontWeight: 800,
              color: '#0f172a',
              offsetY: 6,
              formatter: (val: string) => Number(val).toLocaleString()
            },
            total: {
              show: true,
              label: 'Total Leads',
              fontSize: '11px',
              fontWeight: 700,
              color: '#64748b',
              formatter: () => Number(totalLeadsCount).toLocaleString()
            }
          }
        }
      }
    },
    tooltip: {
      theme: "light",
      y: { formatter: (val: number) => `${val} leads` }
    }
  };

  const donutSeries = [
    leadStats?.overview?.approvedLeads || 340,
    leadStats?.overview?.followUpLeads || 210,
    leadStats?.overview?.disbursedLeads || 120,
    leadStats?.overview?.rejectedLeads || 60,
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

    const gradientStyles = [
      { gradient: "from-[#4776E6] to-[#8E54E9]", shadow: "shadow-indigo-500/20", pct: "74%" },
      { gradient: "from-[#11998e] to-[#38ef7d]", shadow: "shadow-emerald-500/20", pct: "82%" },
      { gradient: "from-[#ff416c] to-[#ff4b2b]", shadow: "shadow-rose-500/20", pct: "65%" },
      { gradient: "from-[#141e30] via-[#243b55] to-[#2c3e50]", shadow: "shadow-slate-900/20", pct: "88%" },
    ];

    return (
      <div className="space-y-6 pb-12">
        {/* Top Header / Greeting Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-slate-100 p-4 sm:px-6 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-bold">
              {employeeName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Good Morning, {employeeName}!</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Desk
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {isLeadership ? `${effectiveRole === 'TEAM_LEADER' ? 'Team Leader' : 'Manager'} Operations Overview` : 'Sales Calling Desk & Notion Workspace'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={refresh}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors shadow-xs"
            >
              <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
              <span>Sync Data</span>
            </button>
            <Link
              href="/notion-pages"
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 text-xs font-bold text-white transition-colors shadow-xs"
            >
              <span>Notion Workspace</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* 4 Vibrant Gradient KPI Cards (Rukada Style) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {employeeMetrics.slice(0, 4).map((m, i) => {
            const style = gradientStyles[i % gradientStyles.length];
            return (
              <div
                key={i}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${style.gradient} p-5 text-white shadow-lg ${style.shadow} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-3xl font-extrabold tracking-tight">{m.val}</h3>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md text-white">
                    <m.icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="my-3.5 h-1.5 w-full rounded-full bg-white/20 overflow-hidden">
                  <div className="h-full rounded-full bg-white transition-all duration-1000" style={{ width: style.pct }} />
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-white/90">
                  <span>{m.title}</span>
                  <span className="flex items-center gap-0.5 font-bold">
                    {m.trend} <TrendingUp className="h-3 w-3 inline" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Site Traffic (Area Chart) + Top Referral (Donut Chart) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Site Traffic / Lead Operations Area Chart (2/3 width) */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Site Traffic & Lead Volume</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Dual-wave monthly lead activity</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#10b981]" />
                    <span className="text-slate-600">New Leads</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#4f46e5]" />
                    <span className="text-slate-600">Worked Leads</span>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600 p-1">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="h-[280px] w-full">
                <Chart options={chartOptions} series={chartSeries} type="area" height="100%" width="100%" />
              </div>
            </div>

            {/* 3 Metrics bar underneath chart */}
            <div className="mt-4 grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 pt-4 text-center">
              <div>
                <p className="text-xl sm:text-2xl font-black text-slate-900">
                  {((notionStats?.summary?.totalLeads || 0) + (stats?.totalLeads || 0) || 45870).toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Overall Leads <span className="text-emerald-600 font-bold">↑ 2.4%</span></p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-slate-900">15:48</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Avg Turnaround <span className="text-emerald-600 font-bold">↑ 12.6%</span></p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-slate-900">
                  {notionStats?.summary?.remarksFilled || 245}
                </p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Remarks / Desk <span className="text-emerald-600 font-bold">↑ 5.6%</span></p>
              </div>
            </div>
          </div>

          {/* Right: Top Referral / Pipeline Donut (1/3 width) */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Top Referral & Pipeline</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Lead stage breakdown</p>
                </div>
                <button className="text-slate-400 hover:text-slate-600 p-1">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>

              <div className="h-[240px] w-full flex items-center justify-center">
                <Chart options={donutOptions} series={donutSeries} type="donut" height="100%" width="100%" />
              </div>
            </div>

            {/* Source Pill Breakdown */}
            <div className="mt-4 space-y-2.5 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#10b981]" />
                  <span className="text-slate-700">Direct OMS Leads</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold font-mono">
                  {omsLeads.length || 650}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#4f46e5]" />
                  <span className="text-slate-700">Notion Workspace</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold font-mono">
                  {notionStats?.summary?.totalLeads || 420}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#f59e0b]" />
                  <span className="text-slate-700">Integrated Dialer</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold font-mono">320</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Circular Progress Gauge Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Gauge 1: SLA Compliance */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="relative flex h-14 w-14 items-center justify-center shrink-0">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-100" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-indigo-600 transition-all duration-1000" strokeDasharray="60, 100" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <span className="absolute text-xs font-extrabold text-slate-900">60%</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">SLA Tracked</h4>
                <p className="text-xs text-slate-400 mt-0.5">Cases within active SLA</p>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <BellRing className="h-5 w-5" />
            </div>
          </div>

          {/* Gauge 2: Remarks Discipline */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="relative flex h-14 w-14 items-center justify-center shrink-0">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-100" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-emerald-500 transition-all duration-1000" strokeDasharray="85, 100" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <span className="absolute text-xs font-extrabold text-slate-900">85%</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Remarks Filled</h4>
                <p className="text-xs text-slate-400 mt-0.5">Sheet completion discipline</p>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>

          {/* Gauge 3: Active Calling Agents */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="relative flex h-14 w-14 items-center justify-center shrink-0">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-100" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-amber-500 transition-all duration-1000" strokeDasharray="75, 100" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <span className="absolute text-xs font-extrabold text-slate-900">75%</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Agent Active Rate</h4>
                <p className="text-xs text-slate-400 mt-0.5">Calling desks active today</p>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Phone className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Notion Assignment & Remarks Status Card */}
        {notionStats && (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <FileSpreadsheet className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {isLeadership
                      ? (effectiveRole === 'TEAM_LEADER'
                          ? `My Assigned Calling Agents (${notionStats.teamName || `${employeeName}'s Team`})`
                          : `Team Notion Assignment & Remarks Distribution (${notionStats.teamName || 'Team'})`)
                      : 'My Assigned Notion Sheets & Remarks Status'}
                  </h3>
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  {effectiveRole === 'TEAM_LEADER'
                    ? 'Real-time monitoring of your direct calling agents, sheet allocation, and remarks feedback submitted'
                    : isLeadership
                    ? 'Real-time monitoring of team sheets, lead allocation, and remarks feedback submitted'
                    : 'Sheets assigned to you with lead counts and your remarks progress'}
                </p>
              </div>
              <Link
                href="/notion-pages"
                className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white px-4 py-2.5 rounded-xl transition-all shadow-xs shrink-0 group border border-indigo-100"
              >
                <span>Open Notion Workspace</span>
                <ExternalLink className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {isLeadership ? (
              /* Leadership View: Team Members Breakdown */
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gradient-to-br from-indigo-50/60 to-purple-50/40 p-4.5 rounded-2xl border border-indigo-100/80">
                  <div>
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Team Sheets</span>
                    <p className="text-2xl font-black text-slate-900 mt-0.5">{notionStats.summary?.teamSheets || 0}</p>
                  </div>
                  <div>
                    <span className="text-xs text-indigo-600 font-semibold uppercase tracking-wider">Total Sheet Leads</span>
                    <p className="text-2xl font-black text-indigo-600 mt-0.5">{notionStats.summary?.totalLeads || 0}</p>
                  </div>
                  <div>
                    <span className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">Remarks Filled</span>
                    <p className="text-2xl font-black text-emerald-600 mt-0.5">{notionStats.summary?.remarksFilled || 0}</p>
                  </div>
                  <div>
                    <span className="text-xs text-amber-700 font-semibold uppercase tracking-wider">Remarks Pending</span>
                    <p className="text-2xl font-black text-amber-600 mt-0.5">{notionStats.summary?.remarksEmpty || 0}</p>
                  </div>
                </div>

                {notionStats.members && notionStats.members.length > 0 ? (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
                    <table className="w-full text-left text-sm text-slate-600">
                      <thead className="bg-slate-50 text-xs uppercase font-black text-slate-500 border-b border-slate-200/80">
                        <tr>
                          <th className="px-4 py-3.5">{effectiveRole === 'TEAM_LEADER' ? 'Assigned Agent' : 'Team Member'}</th>
                          <th className="px-4 py-3.5">Role</th>
                          <th className="px-4 py-3.5 text-center">Assigned Sheets</th>
                          <th className="px-4 py-3.5 text-center">Total Leads</th>
                          <th className="px-4 py-3.5 text-center text-emerald-700">Remarks Filled</th>
                          <th className="px-4 py-3.5 text-center text-amber-700">Pending</th>
                          <th className="px-4 py-3.5">Remarks Progress</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {notionStats.members.map((member: any, idx: number) => {
                          const total = member.totalLeads || 0;
                          const pct = total > 0 ? Math.round((member.remarksFilled / total) * 100) : 0;
                          return (
                            <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                              <td className="px-4 py-3.5 font-bold text-slate-900">{member.name}</td>
                              <td className="px-4 py-3.5">
                                <span className="inline-block px-2.5 py-0.5 text-[11px] font-bold rounded-lg bg-slate-100 text-slate-700 uppercase">
                                  {member.role?.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 text-center font-bold text-indigo-600">{member.sheetsCount}</td>
                              <td className="px-4 py-3.5 text-center font-black text-slate-900">{member.totalLeads}</td>
                              <td className="px-4 py-3.5 text-center font-bold text-emerald-600">{member.remarksFilled}</td>
                              <td className="px-4 py-3.5 text-center font-bold text-amber-600">{member.remarksEmpty}</td>
                              <td className="px-4 py-3.5 min-w-[150px]">
                                <div className="flex items-center gap-2.5">
                                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                                      style={{ width: `${Math.min(pct, 100)}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-black text-slate-700 w-10 text-right">{pct}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic p-3 text-center bg-slate-50 rounded-xl">No team members assigned sheets yet.</p>
                )}
              </div>
            ) : (
              /* Employee View: My Scoped Sheets Only */
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gradient-to-br from-indigo-50/60 to-purple-50/40 p-4.5 rounded-2xl border border-indigo-100/80">
                  <div>
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">My Sheets</span>
                    <p className="text-2xl font-black text-slate-900 mt-0.5">{notionStats.summary?.mySheets || 0}</p>
                  </div>
                  <div>
                    <span className="text-xs text-indigo-600 font-semibold uppercase tracking-wider">My Assigned Leads</span>
                    <p className="text-2xl font-black text-indigo-600 mt-0.5">{notionStats.summary?.totalLeads || 0}</p>
                  </div>
                  <div>
                    <span className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">Remarks Submitted</span>
                    <p className="text-2xl font-black text-emerald-600 mt-0.5">{notionStats.summary?.remarksFilled || 0}</p>
                  </div>
                  <div>
                    <span className="text-xs text-amber-700 font-semibold uppercase tracking-wider">Pending Remarks</span>
                    <p className="text-2xl font-black text-amber-600 mt-0.5">{notionStats.summary?.remarksEmpty || 0}</p>
                  </div>
                </div>

                {notionStats.sheets && notionStats.sheets.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {notionStats.sheets.map((sheet: any, idx: number) => (
                      <Link
                        key={idx}
                        href={`/notion-pages?id=${sheet._id}`}
                        className="group p-4.5 rounded-2xl border border-slate-200/80 hover:border-indigo-400 bg-white hover:shadow-lg transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 truncate">{sheet.title}</span>
                          <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>Total: <strong className="text-slate-900 font-bold">{sheet.totalLeads}</strong></span>
                          <span>Done: <strong className="text-emerald-600 font-bold">{sheet.remarksFilled}</strong></span>
                          <span>Pending: <strong className="text-amber-600 font-bold">{sheet.remarksEmpty}</strong></span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic p-3 text-center bg-slate-50 rounded-xl">No Notion sheets currently assigned to your desk.</p>
                )}
              </div>
            )}
          </div>
        )}



        {/* OMS Specific Assigned Leads Queue */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Database className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {isLeadership ? 'Assigned OMS Leads Queue (Team Specific)' : `My Assigned OMS Leads (${userName})`}
                </h3>
                <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  ⚡ Live OMS Integration
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Showing cases synced directly from OMS specifically linked to your desk
              </p>
            </div>
          </div>

          {loadingOms ? (
            <div className="py-12 flex justify-center items-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            </div>
          ) : omsLeads.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase font-black text-slate-500 border-b border-slate-200/80">
                  <tr>
                    <th className="px-4 py-3.5">Customer Name</th>
                    <th className="px-4 py-3.5">Contact</th>
                    <th className="px-4 py-3.5 text-center">OMS Ticket</th>
                    <th className="px-4 py-3.5">Lender / Provider</th>
                    <th className="px-4 py-3.5">Loan Amount</th>
                    <th className="px-4 py-3.5 text-center">OMS Status</th>
                    <th className="px-4 py-3.5 text-center">Source</th>
                    <th className="px-4 py-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {omsLeads.map((item: any, idx: number) => {
                    const ticketStatusUpper = (item.omsTicketStatus || item.status || 'NEW').toUpperCase();
                    const statusColor = ticketStatusUpper.includes('DISBURS') || ticketStatusUpper.includes('APPROV')
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : ticketStatusUpper.includes('REJECT')
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200';

                    return (
                      <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-slate-900">
                          {item.fullName || 'Customer Lead'}
                        </td>
                        <td className="px-4 py-3.5 text-slate-600">
                          <span className="font-mono text-xs">{item.phone || '-'}</span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {item.omsTicketId ? (
                            <span className="inline-block px-2.5 py-0.5 rounded-lg text-xs font-bold font-mono bg-purple-50 text-purple-700 border border-purple-200">
                              #{item.omsTicketId}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 font-medium text-slate-700">
                          {item.omsProvider || 'Direct'}
                        </td>
                        <td className="px-4 py-3.5 font-black text-slate-900">
                          {item.loanAmount ? `₹ ${Number(item.loanAmount).toLocaleString('en-IN')}` : '₹ 0'}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusColor}`}>
                            {ticketStatusUpper}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 uppercase">
                            {item.leadSource || item.omsLeadType || 'OMS'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <button
                            onClick={() => setJourneyLeadId(item._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer group"
                            title="View Lead History & Journey"
                          >
                            <Activity className="h-3.5 w-3.5 text-indigo-600 group-hover:text-white transition-colors" />
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
            <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <Database className="h-10 w-10 text-slate-300 mb-3" />
              <h4 className="text-sm font-bold text-slate-700">No OMS Leads Assigned Right Now</h4>
              <p className="mt-1 text-xs text-slate-500 max-w-sm">
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
    <div className="space-y-6 pb-12">
      {/* Top Header / Greeting Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-slate-100 p-4 sm:px-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-bold">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">Welcome back, {userName}!</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Telemetry
              </span>
            </div>
            <p className="text-xs text-slate-500">Enterprise CRM Administration & Operations Control</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
            <span>Refresh Data</span>
          </button>
          <Link
            href="/leads"
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 text-xs font-bold text-white transition-colors shadow-xs"
          >
            <span>All Leads Queue</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* 4 Vibrant Gradient KPI Cards (Rukada Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Card 1: Purple-Blue Gradient */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#4776E6] to-[#8E54E9] p-5.5 text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-3xl font-extrabold tracking-tight">
              {((pipeline?.leads?.active || 0) + (pipeline?.leads?.inactive || 0) || stats?.totalLeads || leadStats?.total || 9526).toLocaleString()}
            </h3>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md text-white">
              <Target className="h-5 w-5" />
            </div>
          </div>
          <div className="my-3.5 h-1.5 w-full rounded-full bg-white/20 overflow-hidden">
            <div className="h-full rounded-full bg-white transition-all duration-1000" style={{ width: '74%' }} />
          </div>
          <div className="flex items-center justify-between text-xs font-semibold text-white/90">
            <span>Total Leads</span>
            <span className="flex items-center gap-0.5 font-bold">+4.2% <TrendingUp className="h-3 w-3 inline" /></span>
          </div>
        </div>

        {/* Card 2: Emerald Green Gradient */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#11998e] to-[#38ef7d] p-5.5 text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-3xl font-extrabold tracking-tight">
              {leadStats?.overview?.disbursedLeads ? `₹ ${leadStats.overview.disbursedLeads.toLocaleString()}` : '₹ 8,323'}
            </h3>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md text-white">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="my-3.5 h-1.5 w-full rounded-full bg-white/20 overflow-hidden">
            <div className="h-full rounded-full bg-white transition-all duration-1000" style={{ width: '82%' }} />
          </div>
          <div className="flex items-center justify-between text-xs font-semibold text-white/90">
            <span>Disbursed Pipeline</span>
            <span className="flex items-center gap-0.5 font-bold">+1.2% <TrendingUp className="h-3 w-3 inline" /></span>
          </div>
        </div>

        {/* Card 3: Coral-Red-Pink Gradient */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#ff416c] to-[#ff4b2b] p-5.5 text-white shadow-lg shadow-rose-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-3xl font-extrabold tracking-tight">
              {(leadStats?.overview?.approvedLeads || stats?.totalUsers || 6200).toLocaleString()}
            </h3>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md text-white">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="my-3.5 h-1.5 w-full rounded-full bg-white/20 overflow-hidden">
            <div className="h-full rounded-full bg-white transition-all duration-1000" style={{ width: '65%' }} />
          </div>
          <div className="flex items-center justify-between text-xs font-semibold text-white/90">
            <span>Approved Leads</span>
            <span className="flex items-center gap-0.5 font-bold">+0.2% <TrendingUp className="h-3 w-3 inline" /></span>
          </div>
        </div>

        {/* Card 4: Dark Navy-Slate Gradient */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#141e30] via-[#243b55] to-[#2c3e50] p-5.5 text-white shadow-lg shadow-slate-900/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-3xl font-extrabold tracking-tight">
              {(notionStats?.summary?.totalLeads || 5630).toLocaleString()}
            </h3>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md text-white">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
          </div>
          <div className="my-3.5 h-1.5 w-full rounded-full bg-white/20 overflow-hidden">
            <div className="h-full rounded-full bg-white transition-all duration-1000" style={{ width: '88%' }} />
          </div>
          <div className="flex items-center justify-between text-xs font-semibold text-white/90">
            <span>Notion Calling Records</span>
            <span className="flex items-center gap-0.5 font-bold">+2.2% <TrendingUp className="h-3 w-3 inline" /></span>
          </div>
        </div>
      </div>

      {/* Quick Navigation Bar */}
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-indigo-600" />
            Quick Modules
          </span>
          <span className="text-[11px] text-slate-400 font-medium">1-Click Fast Navigation</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {adminStats.map((s, i) => (
            <Link
              key={i}
              href={s.href}
              className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-100 hover:border-indigo-200 bg-slate-50/50 hover:bg-indigo-50/30 transition-all group"
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg} ${s.color} shrink-0 group-hover:scale-105 transition-transform`}>
                <s.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 truncate">{s.title}</p>
                <p className="text-[10px] text-slate-400 font-semibold">{s.val}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Site Traffic (Area Chart) + Top Referral (Donut Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Site Traffic / Lead Operations Area Chart (2/3 width) */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Site Traffic & Lead Volume</h3>
                <p className="text-xs text-slate-400 mt-0.5">Dual-wave monthly lead activity</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#10b981]" />
                  <span className="text-slate-600">New Leads</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#4f46e5]" />
                  <span className="text-slate-600">Worked Leads</span>
                </div>
                <button className="text-slate-400 hover:text-slate-600 p-1">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="h-[280px] w-full">
              <Chart options={chartOptions} series={chartSeries} type="area" height="100%" width="100%" />
            </div>
          </div>

          {/* 3 Metrics bar underneath chart */}
          <div className="mt-4 grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 pt-4 text-center">
            <div>
              <p className="text-xl sm:text-2xl font-black text-slate-900">45.87M</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Overall Leads <span className="text-emerald-600 font-bold">↑ 2.43%</span></p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-slate-900">15:48</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Avg Processing <span className="text-emerald-600 font-bold">↑ 12.65%</span></p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-slate-900">245.65</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Pages / Visit <span className="text-emerald-600 font-bold">↑ 5.61%</span></p>
            </div>
          </div>
        </div>

        {/* Right: Top Referral / Pipeline Donut (1/3 width) */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">Top Referral</h3>
                <p className="text-xs text-slate-400 mt-0.5">Channel sources breakdown</p>
              </div>
              <button className="text-slate-400 hover:text-slate-600 p-1">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            <div className="h-[240px] w-full flex items-center justify-center">
              <Chart options={donutOptions} series={donutSeries} type="donut" height="100%" width="100%" />
            </div>
          </div>

          {/* Source Pill Breakdown */}
          <div className="mt-4 space-y-2.5 border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#10b981]" />
                <span className="text-slate-700">Direct OMS Leads</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold font-mono">650</span>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#4f46e5]" />
                <span className="text-slate-700">Notion Workspace</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold font-mono">420</span>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#ff416c]" />
                <span className="text-slate-700">Integrated Dialer</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold font-mono">320</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Circular Progress Gauge Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Gauge 1: SLA Compliance */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="relative flex h-14 w-14 items-center justify-center shrink-0">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <path className="text-slate-100" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-indigo-600 transition-all duration-1000" strokeDasharray="60, 100" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <span className="absolute text-xs font-extrabold text-slate-900">60%</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">SLA Cases</h4>
              <p className="text-xs text-slate-400 mt-0.5">Cases within active SLA</p>
            </div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <BellRing className="h-5 w-5" />
          </div>
        </div>

        {/* Gauge 2: Remarks Discipline */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="relative flex h-14 w-14 items-center justify-center shrink-0">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <path className="text-slate-100" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-emerald-500 transition-all duration-1000" strokeDasharray="85, 100" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <span className="absolute text-xs font-extrabold text-slate-900">85%</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Remarks Filled</h4>
              <p className="text-xs text-slate-400 mt-0.5">Sheet completion discipline</p>
            </div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        {/* Gauge 3: Active Calling Agents */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="relative flex h-14 w-14 items-center justify-center shrink-0">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <path className="text-slate-100" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-amber-500 transition-all duration-1000" strokeDasharray="75, 100" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <span className="absolute text-xs font-extrabold text-slate-900">75%</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Agent Active Rate</h4>
              <p className="text-xs text-slate-400 mt-0.5">Calling desks active today</p>
            </div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Phone className="h-5 w-5" />
          </div>
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
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <BellRing className="h-4 w-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">SLA Health</h3>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              Live Cases
            </span>
          </div>
          <div className="space-y-4">
            {[
              { label: "Tracked Cases", val: slaData?.totalActive || 0, color: "bg-indigo-500", textColor: "text-indigo-600", max: slaData?.totalActive || 1 },
              { label: "Within SLA", val: slaData?.withinSla || 0, color: "bg-emerald-500", textColor: "text-emerald-600", max: slaData?.totalActive || 1 },
              { label: "At Risk", val: slaData?.atRisk || 0, color: "bg-amber-500", textColor: "text-amber-600", max: slaData?.totalActive || 1 },
              { label: "SLA Breached", val: slaData?.breached || 0, color: "bg-red-500", textColor: "text-red-600", max: slaData?.totalActive || 1 },
            ].map((row, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-semibold text-slate-600">{row.label}</span>
                  <span className={`font-black ${row.textColor}`}>{row.val}</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${row.color} rounded-full transition-all duration-700`}
                    style={{ width: `${Math.min((row.val / (row.max || 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Workload Table */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Activity className="h-4 w-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Agent Workload</h3>
            </div>
            <Link href="/leads" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group">
              <span>View All Leads</span>
              <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/50">
                  <th className="py-3 px-3 text-xs font-black uppercase tracking-wider text-slate-500 text-center">Leads</th>
                  <th className="py-3 px-3 text-xs font-black uppercase tracking-wider text-slate-500 text-center">Follow-ups</th>
                  <th className="py-3 px-3 text-xs font-black uppercase tracking-wider text-amber-600 text-center">At Risk</th>
                  <th className="py-3 px-3 text-xs font-black uppercase tracking-wider text-red-600 text-center">Breached</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {agentWorkload && agentWorkload.length > 0 ? (
                  agentWorkload.slice(0, 8).map((agent: any, idx: number) => (
                    <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="py-3.5 px-3 text-center">
                        <span className="inline-flex items-center justify-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">{agent.activeLeads}</span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className={`text-xs font-bold ${agent.pendingFollowUps > 0 ? 'text-amber-600' : 'text-slate-400'}`}>{agent.pendingFollowUps}</span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className={`text-xs font-bold ${agent.atRisk > 0 ? 'text-amber-600' : 'text-slate-300'}`}>{agent.atRisk || '-'}</span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className={`text-xs font-bold ${agent.breached > 0 ? 'text-red-600' : 'text-slate-300'}`}>{agent.breached || '-'}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-sm text-slate-400">No workload data yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Notion Assignment Overview — Who got how much data */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <FileSpreadsheet className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Notion Assignment Overview</h3>
              <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-indigo-200">
                {notionStats?.members?.length || 0} Active Members
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Member-wise Notion sheet allocation, lead count, and remarks discipline across all teams
            </p>
          </div>
          <div className="flex items-center gap-4 bg-gradient-to-r from-slate-50 to-indigo-50/40 px-5 py-3 rounded-2xl border border-slate-200/80 shrink-0">
            <div className="text-center">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Sheets</p>
              <p className="text-xl font-black text-indigo-600">{notionStats?.summary?.totalSheets || 0}</p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Leads</p>
              <p className="text-xl font-black text-slate-900">{notionStats?.summary?.totalLeads || 0}</p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center">
              <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">Remarks Done</p>
              <p className="text-xl font-black text-emerald-600">{notionStats?.summary?.remarksFilled || 0}</p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center">
              <p className="text-xs text-amber-600 font-semibold uppercase tracking-wider">Pending</p>
              <p className="text-xl font-black text-amber-600">{notionStats?.summary?.remarksEmpty || 0}</p>
            </div>
          </div>
        </div>

        {notionStats?.members && notionStats.members.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-black text-slate-500 border-b border-slate-200/80">
                <tr>
                  <th className="px-4 py-3.5">#</th>
                  <th className="px-4 py-3.5">Member</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5 text-center">Sheets</th>
                  <th className="px-4 py-3.5 text-center">Total Leads</th>
                  <th className="px-4 py-3.5 text-center text-emerald-700">Filled</th>
                  <th className="px-4 py-3.5 text-center text-amber-700">Pending</th>
                  <th className="px-4 py-3.5">Remarks Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {notionStats.members.map((member: any, idx: number) => {
                  const total = member.totalLeads || 0;
                  const filled = member.remarksFilled || 0;
                  const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
                  const barColor = pct >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : pct >= 50 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : pct >= 25 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 'bg-red-400';
                  return (
                    <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="px-4 py-3.5 text-slate-400 font-bold text-xs">{idx + 1}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-black shadow-xs">
                            {member.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <span className="font-bold text-slate-900">{member.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-block px-2.5 py-0.5 text-[10px] font-black rounded-lg bg-slate-100 text-slate-600 uppercase tracking-wide">
                          {(member.role || '').replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center justify-center rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-bold text-purple-700">{member.sheetsCount}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center font-black text-slate-900">{total}</td>
                      <td className="px-4 py-3.5 text-center font-bold text-emerald-600">{filled}</td>
                      <td className="px-4 py-3.5 text-center font-bold text-amber-600">{member.remarksEmpty || 0}</td>
                      <td className="px-4 py-3.5 min-w-[160px]">
                        <div className="flex items-center gap-2.5">
                          <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${barColor} rounded-full transition-all duration-700`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <span className={`text-xs font-black w-10 text-right ${pct >= 80 ? 'text-emerald-600' : pct >= 50 ? 'text-blue-600' : pct >= 25 ? 'text-amber-600' : 'text-red-500'}`}>
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
          <div className="flex flex-col items-center justify-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <FileSpreadsheet className="h-10 w-10 text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-600">No Notion sheets assigned yet</p>
            <Link href="/notion-pages" className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline">
              Go to Notion Pages →
            </Link>
          </div>
        )}
      </div>

      {/* Stage Aging + Today's Movement */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stage Aging */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <BarChart3 className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Stage Aging Overview</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/50">
                  <th className="py-3 px-3 text-xs font-black uppercase tracking-wider text-slate-500">Stage</th>
                  <th className="py-3 px-3 text-xs font-black uppercase tracking-wider text-slate-500 text-center">Active</th>
                  <th className="py-3 px-3 text-xs font-black uppercase tracking-wider text-slate-500">Avg Age</th>
                  <th className="py-3 px-3 text-xs font-black uppercase tracking-wider text-amber-600 text-center">At Risk</th>
                  <th className="py-3 px-3 text-xs font-black uppercase tracking-wider text-red-600 text-center">Breached</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stageAging?.agingStats && stageAging.agingStats.length > 0 ? (
                  stageAging.agingStats.map((stat: any, idx: number) => (
                    <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="py-3.5 px-3 font-semibold text-slate-900">{stat.stage}</td>
                      <td className="py-3.5 px-3 text-center">
                        <span className="inline-flex items-center justify-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">{stat.activeCases}</span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 text-xs font-medium">{stat.avgAgeDays?.toFixed(1) || '0'}d avg</td>
                      <td className="py-3.5 px-3 text-center">
                        <span className={`text-xs font-bold ${stat.atRiskCount > 0 ? 'text-amber-600' : 'text-slate-300'}`}>{stat.atRiskCount || '-'}</span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className={`text-xs font-bold ${stat.breachedCount > 0 ? 'text-red-600' : 'text-slate-300'}`}>{stat.breachedCount || '-'}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="py-10 text-center text-sm text-slate-400">No stage data available.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Today's Movement Feed */}
        <div className="flex flex-col rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm max-h-[380px] overflow-y-auto">
          <div className="flex items-center justify-between mb-4 sticky top-0 bg-white pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Today's Events</h3>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Live</span>
            </div>
          </div>
          <div className="flex-1 space-y-3 mt-1">
            {movement?.recentEvents && movement.recentEvents.length > 0 ? (
              movement.recentEvents.map((evt: any, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 border border-indigo-100">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {evt.recordType === 'EVENT' ? evt.eventType?.replace(/_/g, ' ') : `→ ${evt.stage}`}
                    </p>
                    <time className="text-[10px] text-slate-400 font-medium">
                      {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </time>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Activity className="h-8 w-8 text-slate-200 mb-2" />
                <p className="text-xs text-slate-400 font-medium">No events yet today</p>
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