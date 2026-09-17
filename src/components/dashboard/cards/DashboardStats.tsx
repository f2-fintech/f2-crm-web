"use client";

import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import TodayIcon from "@mui/icons-material/Today";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PersonIcon from "@mui/icons-material/Person";
import DescriptionIcon from "@mui/icons-material/Description";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ScheduleIcon from "@mui/icons-material/Schedule";

import StatsCard from "./StatsCard";

interface DashboardStatsProps {
  loading?: boolean;

  stats: {
    totalLeads: number;

    todayLeads: number;

    monthlyLeads: number;

    customers: number;

    applications: number;

    approved: number;

    rejected: number;

    followUps: number;
  };
}

export default function DashboardStats({
  loading = false,
  stats,
}: DashboardStatsProps) {
  const cards = [
    {
      title: "Total Leads",
      value: stats.totalLeads,
      icon: <PeopleAltIcon />,
      color: "bg-blue-600",
      href: "/leads",
      trend: 12,
      description: "Overall Leads",
    },

    {
      title: "Today's Leads",
      value: stats.todayLeads,
      icon: <TodayIcon />,
      color: "bg-green-600",
      href: "/leads",
      trend: 5,
      description: "Created Today",
    },

    {
      title: "Monthly Leads",
      value: stats.monthlyLeads,
      icon: <CalendarMonthIcon />,
      color: "bg-purple-600",
      href: "/leads",
      trend: 18,
      description: "Current Month",
    },

    {
      title: "Customers",
      value: stats.customers,
      icon: <PersonIcon />,
      color: "bg-cyan-600",
      href: "/customers",
      trend: 8,
      description: "Total Customers",
    },

    {
      title: "Applications",
      value: stats.applications,
      icon: <DescriptionIcon />,
      color: "bg-orange-600",
      href: "/applications",
      trend: 7,
      description: "Loan Applications",
    },

    {
      title: "Approved",
      value: stats.approved,
      icon: <CheckCircleIcon />,
      color: "bg-emerald-600",
      href: "/applications",
      trend: 14,
      description: "Approved Cases",
    },

    {
      title: "Rejected",
      value: stats.rejected,
      icon: <CancelIcon />,
      color: "bg-red-600",
      href: "/applications",
      trend: -3,
      description: "Rejected Cases",
    },

    {
      title: "Today's Follow Ups",
      value: stats.followUps,
      icon: <ScheduleIcon />,
      color: "bg-yellow-500",
      href: "/followups",
      trend: 4,
      description: "Pending Today",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <StatsCard
          key={card.title}
          loading={loading}
          title={card.title}
          value={card.value}
          icon={card.icon}
          color={card.color}
          href={card.href}
          trend={card.trend}
          description={card.description}
        />
      ))}
    </div>
  );
}