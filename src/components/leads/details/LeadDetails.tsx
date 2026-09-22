"use client";

import {
  Box,
  Card,
  CardContent,
  Divider,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";

import { useState } from "react";

import LeadOverview from "./LeadOverview";
import LeadTimeline from "./LeadTimeline";
import LeadDocuments from "./LeadDocuments";
import LeadApplications from "./LeadApplications";
import LeadFollowUps from "./LeadFollowUps";

interface Props {
  lead: any;
}

export default function LeadDetails({
  lead,
}: Props) {
  const [tab, setTab] = useState(0);

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
      }}
    >
      <CardContent>
        <Typography
          variant="h5"
          fontWeight={700}
        >
          {lead.fullName}
        </Typography>

        <Typography
          color="text.secondary"
        >
          {lead.leadId}
        </Typography>

        <Box sx={{ mt: 3 }}>
          <Tabs
            value={tab}
            onChange={(_, value) =>
              setTab(value)
            }
          >
            <Tab label="Overview" />

            <Tab label="Timeline" />

            <Tab label="Documents" />

            <Tab label="Applications" />

            <Tab label="Follow Ups" />
          </Tabs>
        </Box>

        <Divider sx={{ my: 3 }} />

        {tab === 0 && (
          <LeadOverview
            lead={lead}
          />
        )}

        {tab === 1 && (
          <LeadTimeline
            lead={lead}
          />
        )}

        {tab === 2 && (
          <LeadDocuments
            lead={lead}
          />
        )}

        {tab === 3 && (
          <LeadApplications
            lead={lead}
          />
        )}

        {tab === 4 && (
          <LeadFollowUps
            lead={lead}
          />
        )}
      </CardContent>
    </Card>
  );
}