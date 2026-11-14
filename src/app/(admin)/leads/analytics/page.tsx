"use client";

import { Stack } from "@mui/material";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import DashboardCards from "@/components/leads/cards/DashboardCards";

import LeadStatusChart from "@/components/dashboard/charts/LeadStatusChart";
import LeadSourceChart from "@/components/dashboard/charts/LeadSourceChart";
import MonthlyLeadChart from "@/components/dashboard/charts/MonthlyLeadChart";

import Grid from "@mui/material/Grid";

export default function LeadAnalyticsPage() {
  return (
    <>
      <PageBreadcrumb pageTitle="Lead Analytics" />

      <Stack spacing={3}>
        {/* Dashboard Cards */}

        <DashboardCards />

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
            <LeadStatusChart />
          </Grid>

          <Grid
            size={{
              xs: 12,
              lg: 6,
            }}
          >
            <LeadSourceChart />
          </Grid>

          <Grid size={12}>
            <MonthlyLeadChart />
          </Grid>
        </Grid>
      </Stack>
    </>
  );
}