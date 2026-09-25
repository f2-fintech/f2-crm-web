"use client";

import { useEffect, useState } from "react";
import useDashboard from "@/hooks/useDashboard";
import { Users, Building2, UserCircle, Briefcase, ShieldCheck, Activity, FileText, Target } from "lucide-react";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function DashboardClient() {
  const { dashboard, loading, error, refresh } = useDashboard();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (loading || !mounted) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={refresh}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!dashboard) return null;

  const { stats, recentActivity, monthlyLeads, roleType } = dashboard;

  let statCards: any[] = [];
  
  if (roleType === 'MANAGER' || roleType === 'TEAM_LEADER') {
    statCards = [
      {
        title: "Team Size",
        value: stats.teamSize,
        icon: Users,
        color: "from-blue-500 to-blue-600",
        lightColor: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
      },
      {
        title: "Active Members",
        value: stats.activeMembers,
        icon: UserCircle,
        color: "from-green-500 to-green-600",
        lightColor: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
      },
      {
        title: "Team Pages",
        value: stats.teamPages,
        icon: FileText,
        color: "from-purple-500 to-purple-600",
        lightColor: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
      },
      {
        title: "Total Leads",
        value: stats.totalLeads,
        icon: Target,
        color: "from-orange-500 to-orange-600",
        lightColor: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
      }
    ];
  } else if (['EMPLOYEE', 'SOURCER', 'CHANNEL_PARTNER'].includes(roleType)) {
    statCards = [
      {
        title: "Assigned Pages",
        value: stats.assignedPages || 0,
        icon: FileText,
        color: "from-purple-500 to-purple-600",
        lightColor: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
      },
      {
        title: "My Leads",
        value: stats.myLeads || 0,
        icon: Target,
        color: "from-orange-500 to-orange-600",
        lightColor: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
      }
    ];
  } else {
    statCards = [
      {
        title: "Total Users",
        value: stats.totalUsers,
        icon: Users,
        color: "from-blue-500 to-blue-600",
        lightColor: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
      },
      {
        title: "Active Users",
        value: stats.activeUsers,
        icon: UserCircle,
        color: "from-green-500 to-green-600",
        lightColor: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
      },
      {
        title: "Total Teams",
        value: stats.totalTeams,
        icon: Briefcase,
        color: "from-purple-500 to-purple-600",
        lightColor: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400",
      },
      {
        title: "Branches",
        value: stats.totalBranches,
        icon: Building2,
        color: "from-orange-500 to-orange-600",
        lightColor: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
      },
      {
        title: "Departments",
        value: stats.totalDepartments,
        icon: Activity,
        color: "from-pink-500 to-pink-600",
        lightColor: "bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400",
      },
      {
        title: "Total Roles",
        value: stats.totalRoles,
        icon: ShieldCheck,
        color: "from-indigo-500 to-indigo-600",
        lightColor: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
      },
    ];
  }

  const chartOptions = {
    chart: {
      type: "area" as const,
      toolbar: { show: false },
      zoom: { enabled: false },
      foreColor: "#888",
    },
    colors: ["#3b82f6"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth" as const, width: 2 },
    xaxis: {
      categories: monthlyLeads?.data.map((d) => d.name) || [],
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        formatter: (val: number) => val.toString(),
      },
    },
    grid: {
      borderColor: "#f1f1f1",
      strokeDashArray: 4,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } },
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    tooltip: { theme: "light" },
  };

  const chartSeries = [
    {
      name: "Leads",
      data: monthlyLeads?.data.map((d) => d.value) || [],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white/90">
          Dashboard Overview
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Welcome back! Here is a summary of your system's current status.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, idx) => (
          <div
            key={idx}
            className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-white/[0.02]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.title}
                </p>
                <h3 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white/90">
                  {stat.value}
                </h3>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.lightColor}`}
              >
                <stat.icon size={24} />
              </div>
            </div>
            
            {/* Decorative gradient line */}
            <div className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${stat.color} opacity-0 transition-opacity group-hover:opacity-100`} />
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.02] lg:col-span-2">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white/90">
            System Growth (Mock)
          </h3>
          <div className="h-[300px] w-full">
            <Chart
              options={chartOptions}
              series={chartSeries}
              type="area"
              height="100%"
              width="100%"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.02]">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white/90">
            Recent Activity
          </h3>
          <div className="space-y-6">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity._id} className="flex gap-4">
                  <div className="relative mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                    <UserCircle size={20} />
                    {/* Connection line */}
                    <span className="absolute left-1/2 top-full h-8 -translate-x-1/2 border-l-2 border-dashed border-gray-200 dark:border-gray-800" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white/90">
                      {activity.title}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      {activity.description}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No recent activity.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}