"use client";

import Grid from "@mui/material/Grid";

import TotalLeadCard from "./TotalLeadCard";
import TodayLeadCard from "./TodayLeadCard";
import ApprovedLeadCard from "./ApprovedLeadCard";
import RejectedLeadCard from "./RejectedLeadCard";
import FollowUpCard from "./FollowUpCard";
import ConversionCard from "./ConversionCard";

interface DashboardCardsProps {
  stats?: {
    overview?: {
      totalLeads?: number;
      approvedLeads?: number;
      rejectedLeads?: number;
      followUpLeads?: number;
    };

    performance?: {
      todayLeads?: number;
      conversionRate?: number;
    };
  };
}

export default function DashboardCards({
  stats,
}: DashboardCardsProps) {
  return (
    <Grid container spacing={3}>
      <Grid
        size={{
          xs: 12,
          sm: 6,
          md: 4,
          lg: 2,
        }}
      >
        <TotalLeadCard
          total={
            stats?.overview?.totalLeads ?? 0
          }
        />
      </Grid>

      <Grid
        size={{
          xs: 12,
          sm: 6,
          md: 4,
          lg: 2,
        }}
      >
        <TodayLeadCard
          total={
            stats?.performance?.todayLeads ??
            0
          }
        />
      </Grid>

      <Grid
        size={{
          xs: 12,
          sm: 6,
          md: 4,
          lg: 2,
        }}
      >
        <ApprovedLeadCard
          total={
            stats?.overview?.approvedLeads ??
            0
          }
        />
      </Grid>

      <Grid
        size={{
          xs: 12,
          sm: 6,
          md: 4,
          lg: 2,
        }}
      >
        <RejectedLeadCard
          total={
            stats?.overview?.rejectedLeads ??
            0
          }
        />
      </Grid>

      <Grid
        size={{
          xs: 12,
          sm: 6,
          md: 4,
          lg: 2,
        }}
      >
        <FollowUpCard
          total={
            stats?.overview?.followUpLeads ??
            0
          }
        />
      </Grid>

      <Grid
        size={{
          xs: 12,
          sm: 6,
          md: 4,
          lg: 2,
        }}
      >
        <ConversionCard
          rate={
            stats?.performance
              ?.conversionRate ?? 0
          }
        />
      </Grid>
    </Grid>
  );
}