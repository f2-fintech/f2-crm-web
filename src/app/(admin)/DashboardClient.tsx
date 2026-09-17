"use client";

import {
  Alert,
  Box,
  CircularProgress,
  Grid,
  Stack,
} from "@mui/material";

import DashboardStats from "@/components/dashboard/cards/DashboardStats";

import LeadStatusChart from "@/components/dashboard/charts/LeadStatusChart";
import LeadSourceChart from "@/components/dashboard/charts/LeadSourceChart";
import MonthlyLeadChart from "@/components/dashboard/charts/MonthlyLeadChart";
import PerformanceChart from "@/components/dashboard/charts/PerformanceChart";

import RecentLeadsTable from "@/components/dashboard/tables/RecentLeadsTable";
import RecentCustomersTable from "@/components/dashboard/tables/RecentCustomersTable";
import RecentApplicationsTable from "@/components/dashboard/tables/RecentApplicationsTable";

import RecentActivity from "@/components/dashboard/activity/RecentActivity";
import QuickActions from "@/components/dashboard/actions/QuickActions";

import useDashboard from "@/hooks/useDashboard";

export default function DashboardClient() {
  console.log("DashboardClient Mounted");
  const {
    dashboard,
    loading,
    error,
    refresh,
  } = useDashboard();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <button
            className="font-semibold"
            onClick={refresh}
          >
            Retry
          </button>
        }
      >
        {error}
      </Alert>
    );
  }

  if (!dashboard) {
    return (
      <Alert severity="warning">
        Dashboard data not found.
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      {/* Stats */}

      <DashboardStats
        stats={dashboard.stats}
      />

      {/* Charts */}

      <Grid
        container
        spacing={3}
      >
        <Grid
          size={{
            xs: 12,
            lg: 6,
          }}
        >
          <LeadStatusChart
            data={
              dashboard.leadStatus
            }
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            lg: 6,
          }}
        >
          <LeadSourceChart
            data={
              dashboard.leadSource
            }
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            lg: 6,
          }}
        >
          <MonthlyLeadChart
            data={
              dashboard
                .monthlyLeads.data
            }
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            lg: 6,
          }}
        >
          <PerformanceChart
            data={
              dashboard.performance
            }
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}

      <QuickActions />

      {/* Tables */}

      <RecentLeadsTable
        leads={
          dashboard.recentLeads
        }
      />

      <RecentCustomersTable
        customers={
          dashboard.recentCustomers
        }
      />

      <RecentApplicationsTable
        applications={
          dashboard.recentApplications
        }
      />

      {/* Activity */}

      <RecentActivity
        activities={
          dashboard.recentActivity
        }
      />
    </Stack>
  );
}