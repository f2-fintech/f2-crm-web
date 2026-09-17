"use client";

import {
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import StatusChip from "../chips/StatusChip";
import PriorityChip from "../chips/PriorityChip";
import SourceChip from "../chips/SourceChip";

interface LeadOverviewProps {
  lead: any;
}

const Item = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <Stack spacing={0.5}>
    <Typography
      variant="caption"
      color="text.secondary"
      fontWeight={600}
    >
      {label}
    </Typography>

    <Typography variant="body1">
      {value || "-"}
    </Typography>
  </Stack>
);

export default function LeadOverview({
  lead,
}: LeadOverviewProps) {
  return (
    <Grid
      container
      spacing={3}
    >
      {/* Personal */}

      <Grid
        size={{
          xs: 12,
          md: 6,
        }}
      >
        <Card elevation={0}>
          <CardContent>
            <Typography
              variant="h6"
              mb={2}
            >
              Personal Information
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Stack spacing={2}>
              <Item
                label="Lead ID"
                value={lead.leadId}
              />

              <Item
                label="Customer Name"
                value={lead.fullName}
              />

              <Item
                label="Phone"
                value={lead.phone}
              />

              <Item
                label="Alternate Phone"
                value={
                  lead.alternatePhone
                }
              />

              <Item
                label="Email"
                value={lead.email}
              />

              <Item
                label="City"
                value={lead.city}
              />

              <Item
                label="State"
                value={lead.state}
              />
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Loan */}

      <Grid
        size={{
          xs: 12,
          md: 6,
        }}
      >
        <Card elevation={0}>
          <CardContent>
            <Typography
              variant="h6"
              mb={2}
            >
              Loan Information
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Stack spacing={2}>
              <Item
                label="Loan Type"
                value={lead.loanType}
              />

              <Item
                label="Loan Amount"
                value={`₹ ${Number(
                  lead.loanAmount || 0,
                ).toLocaleString(
                  "en-IN",
                )}`}
              />

              <Item
                label="Monthly Income"
                value={`₹ ${Number(
                  lead.monthlyIncome || 0,
                ).toLocaleString(
                  "en-IN",
                )}`}
              />

              <Item
                label="Employment"
                value={
                  lead.employmentType
                }
              />

              <Item
                label="Company"
                value={
                  lead.companyName
                }
              />
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Status */}

      <Grid
        size={{
          xs: 12,
          md: 6,
        }}
      >
        <Card elevation={0}>
          <CardContent>
            <Typography
              variant="h6"
              mb={2}
            >
              Lead Status
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Stack spacing={2}>
              <Item
                label="Status"
                value={
                  <StatusChip
                    status={
                      lead.status
                    }
                  />
                }
              />

              <Item
                label="Priority"
                value={
                  <PriorityChip
                    priority={
                      lead.priority
                    }
                  />
                }
              />

              <Item
                label="Lead Source"
                value={
                  <SourceChip
                    source={
                      lead.leadSource
                    }
                  />
                }
              />

              <Item
                label="Assigned To"
                value={
                  lead.assignedTo
                    ?.fullName
                }
              />

              <Item
                label="Branch"
                value={
                  lead.branchId
                    ?.branchName
                }
              />

              <Item
                label="Department"
                value={
                  lead.departmentId
                    ?.departmentName
                }
              />
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Follow Up */}

      <Grid
        size={{
          xs: 12,
          md: 6,
        }}
      >
        <Card elevation={0}>
          <CardContent>
            <Typography
              variant="h6"
              mb={2}
            >
              Follow Up
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Stack spacing={2}>
              <Item
                label="Last Follow Up"
                value={
                  lead.lastFollowUp
                    ? new Date(
                        lead.lastFollowUp,
                      ).toLocaleString()
                    : "-"
                }
              />

              <Item
                label="Next Follow Up"
                value={
                  lead.nextFollowUp
                    ? new Date(
                        lead.nextFollowUp,
                      ).toLocaleString()
                    : "-"
                }
              />

              <Item
                label="Converted"
                value={
                  lead.isConverted
                    ? "Yes"
                    : "No"
                }
              />

              <Item
                label="Customer ID"
                value={
                  lead.customerId
                }
              />

              <Item
                label="OMS ID"
                value={lead.omsId}
              />

              <Item
                label="Application ID"
                value={
                  lead.applicationId
                }
              />
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Remarks */}

      <Grid size={12}>
        <Card elevation={0}>
          <CardContent>
            <Typography
              variant="h6"
              mb={2}
            >
              Remarks
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Typography>
              {lead.remarks ||
                "No Remarks"}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}