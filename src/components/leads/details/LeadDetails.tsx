"use client";

import {
  Box,
  Card,
  CardContent,
  Divider,
  Tab,
  Tabs,
  Typography,
  Stack,
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
        <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap" mb={1}>
          <Box
            sx={{
              width: 70,
              height: 70,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 'bold',
              boxShadow: '0 8px 16px rgba(25, 118, 210, 0.2)',
              flexShrink: 0
            }}
          >
            {lead.fullName?.charAt(0)?.toUpperCase()}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.5px', wordBreak: 'break-word' }}>
              {lead.fullName}
            </Typography>
            <Stack direction="row" spacing={1} mt={0.5} alignItems="center" flexWrap="wrap">
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                #{lead.leadId}
              </Typography>
              <Typography variant="body2" sx={{ px: 1, py: 0.2, bgcolor: 'primary.50', color: 'primary.main', borderRadius: 1, fontSize: '0.75rem', fontWeight: 600 }}>
                {lead.status}
              </Typography>
            </Stack>
          </Box>
        </Stack>

        <Box sx={{ mt: 4 }}>
          <Tabs
            value={tab}
            onChange={(_, value) => setTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTabs-indicator': { display: 'none' },
              '& .MuiTab-root': {
                minHeight: 40,
                borderRadius: 20,
                mr: 1,
                px: 3,
                fontWeight: 600,
                color: 'text.secondary',
                '&.Mui-selected': {
                  color: 'white',
                  background: 'linear-gradient(90deg, #1976d2, #2196f3)',
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                },
                transition: 'all 0.2s',
              }
            }}
          >
            <Tab label="Overview" disableRipple />
            <Tab label="Timeline" disableRipple />
            {/* <Tab label="Documents" disableRipple />
            <Tab label="Applications" disableRipple />
            <Tab label="Follow Ups" disableRipple /> */}
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