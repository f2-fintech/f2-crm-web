"use client";

import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import {
  Assignment,
  Edit,
  PersonAdd,
  Timeline,
  CheckCircle,
} from "@mui/icons-material";

interface LeadTimelineProps {
  lead: any;
}

export default function LeadTimeline({
  lead,
}: LeadTimelineProps) {
  const timeline = [
    {
      title: "Lead Created",
      description: "Lead was created in CRM.",
      icon: <Timeline />,
      color: "primary",
      user: lead.createdBy?.fullName,
      date: lead.createdAt,
    },

    {
      title: "Assigned",
      description: lead.assignedTo
        ? `Assigned to ${lead.assignedTo.fullName}`
        : "Lead is not assigned yet.",
      icon: <PersonAdd />,
      color: "warning",
      user: lead.updatedBy?.fullName,
      date: lead.updatedAt,
    },

    {
      title: "Status Updated",
      description: `Current Status : ${lead.status}`,
      icon: <CheckCircle />,
      color: "success",
      user: lead.updatedBy?.fullName,
      date: lead.updatedAt,
    },

    {
      title: "Lead Updated",
      description: "Lead information updated.",
      icon: <Edit />,
      color: "info",
      user: lead.updatedBy?.fullName,
      date: lead.updatedAt,
    },

    {
      title: "Follow Up",
      description:
        lead.nextFollowUp
          ? `Next Follow Up : ${new Date(
              lead.nextFollowUp,
            ).toLocaleString()}`
          : "No follow up scheduled.",
      icon: <Assignment />,
      color: "secondary",
      user: lead.updatedBy?.fullName,
      date: lead.nextFollowUp,
    },
  ];

  return (
    <Stack spacing={3}>
      {timeline.map((item, index) => (
        <Card
          key={index}
          elevation={0}
          sx={{
            borderRadius: 3,
          }}
        >
          <CardContent>
            <Stack
              direction="row"
              spacing={2}
            >
              <Avatar
                color={item.color as any}
              >
                {item.icon}
              </Avatar>

              <Box sx={{ flex: 1 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography
                    variant="h6"
                  >
                    {item.title}
                  </Typography>

                  <Chip
                    size="small"
                    label={
                      item.date
                        ? new Date(
                            item.date,
                          ).toLocaleDateString()
                        : "-"
                    }
                  />
                </Stack>

                <Typography
                  sx={{ mt: 1 }}
                  color="text.secondary"
                >
                  {item.description}
                </Typography>

                <Divider
                  sx={{
                    my: 2,
                  }}
                />

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Performed By :
                  <strong>
                    {" "}
                    {item.user || "-"}
                  </strong>
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}