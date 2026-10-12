"use client";

import { Box, Card, Typography, Grid } from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

import DescriptionIcon from "@mui/icons-material/Description";
import CallIcon from "@mui/icons-material/Call";

interface DashboardCardsProps {
  stats?: {
    overview?: {
      totalLeads?: number;
      approvedLeads?: number;
      rejectedLeads?: number;
      followUpLeads?: number;
      disbursedLeads?: number;
    };
    performance?: {
      todayLeads?: number;
      conversionRate?: number;
    };
    insights?: any[];
  };
  onCardClick?: (status: string) => void;
  activeStatus?: string;
  variant?: 'compact' | 'large';
}

export default function DashboardCards({ stats, onCardClick, activeStatus, variant = 'compact' }: DashboardCardsProps) {
  const notionInsight = stats?.insights?.find(i => i.title === 'Notion Leads');
  const dialerInsight = stats?.insights?.find(i => i.title === 'Dialer Leads');

  const statConfigs = [
    { label: "Total Leads", value: stats?.overview?.totalLeads ?? 0, Icon: GroupsIcon, bg: "bg-blue-50", color: "text-blue-600", colorHex: "#2563EB", bgHex: "#EFF6FF", trend: "Current", filter: "ALL" },
    { label: "Approved", value: stats?.overview?.approvedLeads ?? 0, Icon: CheckCircleIcon, bg: "bg-emerald-50", color: "text-emerald-600", colorHex: "#059669", bgHex: "#D1FAE5", trend: "Approved", filter: "APPROVED" },
    { label: "Rejected", value: stats?.overview?.rejectedLeads ?? 0, Icon: CancelIcon, bg: "bg-red-50", color: "text-red-600", colorHex: "#DC2626", bgHex: "#FEE2E2", trend: "Rejected", filter: "REJECTED" },
    { label: "Disbursed", value: stats?.overview?.disbursedLeads ?? 0, Icon: AccountBalanceWalletIcon, bg: "bg-purple-50", color: "text-purple-600", colorHex: "#7C3AED", bgHex: "#F3E8FF", trend: "Disbursed", filter: "DISBURSED" },
    { label: "Follow Up", value: stats?.overview?.followUpLeads ?? 0, Icon: AccessTimeIcon, bg: "bg-amber-50", color: "text-amber-600", colorHex: "#D97706", bgHex: "#FEF3C7", trend: "Active", filter: "FOLLOW_UP" },
    { label: "Notion", value: notionInsight?.metric ?? 0, Icon: DescriptionIcon, bg: "bg-teal-50", color: "text-teal-600", colorHex: "#0D9488", bgHex: "#CCFBF1", trend: "Source", filter: "" },
    { label: "Dialer", value: dialerInsight?.metric ?? 0, Icon: CallIcon, bg: "bg-pink-50", color: "text-pink-600", colorHex: "#DB2777", bgHex: "#FCE7F3", trend: "Source", filter: "" },
  ];

  if (variant === 'compact') {
    return (
      <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { height: 6 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#cbd5e1', borderRadius: 3 } }}>
        {statConfigs.map((item, idx) => {
          const isActive = activeStatus === item.filter && item.filter !== "";
          return (
            <Card
              key={idx}
              elevation={0}
              onClick={() => {
                if (item.filter && onCardClick) {
                  onCardClick(isActive ? "" : item.filter);
                }
              }}
              sx={{
                p: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                borderRadius: 3,
                border: isActive ? `2px solid ${item.colorHex}` : "1px solid #E5E7EB",
                minWidth: 160,
                flex: 1,
                cursor: item.filter ? 'pointer' : 'default',
                transition: 'all 0.2s',
                transform: isActive ? 'translateY(-2px)' : 'none',
                boxShadow: isActive ? `0 4px 12px ${item.colorHex}20` : 'none',
                '&:hover': {
                  borderColor: item.filter ? item.colorHex : '#E5E7EB',
                  bgcolor: item.filter ? `${item.bgHex}40` : '#fff',
                }
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: item.bgHex,
                  color: item.colorHex,
                  flexShrink: 0
                }}
              >
                <item.Icon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700} color="#111827" mb={0.5} sx={{ lineHeight: 1 }}>
                  {item.value}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ display: 'block', lineHeight: 1 }}>
                  {item.label}
                </Typography>
              </Box>
            </Card>
          );
        })}
      </Box>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-4 pt-1 px-1">
      {statConfigs.map((item, idx) => {
        const isActive = activeStatus === item.filter && item.filter !== "";
        const isDimmed = activeStatus && !isActive && item.filter !== "";

        return (
          <div
            key={idx}
            onClick={() => {
              if (item.filter && onCardClick) {
                onCardClick(isActive ? "" : item.filter);
              }
            }}
            className={`group relative overflow-hidden rounded-2xl bg-white p-6 transition-all 
              ${item.filter ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg' : ''}
              ${isActive ? `border-2 border-current ${item.color} shadow-md` : 'border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]'}
              ${isDimmed ? 'opacity-60 grayscale-[0.2]' : 'opacity-100'}
            `}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.bg}`}>
                <item.Icon className={`h-6 w-6 ${isActive ? '' : item.color}`} />
              </div>
              <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${item.bg} ${isActive ? '' : item.color}`}>
                <TrendingUpIcon sx={{ fontSize: 14 }} />
                {item.trend}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{item.label}</p>
              <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">{item.value}</h3>
            </div>
            <div className={`absolute bottom-0 left-0 h-1 w-full transition-opacity 
              ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} 
              ${item.bg.replace('bg-', 'bg-gradient-to-r from-').replace('-50', '-500')} to-transparent`} 
            />
          </div>
        );
      })}
    </div>
  );
}