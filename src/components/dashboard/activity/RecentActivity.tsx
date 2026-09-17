"use client";

import Link from "next/link";

import {
  Avatar,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";

import PersonAddIcon from "@mui/icons-material/PersonAdd";
import DescriptionIcon from "@mui/icons-material/Description";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ScheduleIcon from "@mui/icons-material/Schedule";
import GroupIcon from "@mui/icons-material/Group";

export interface DashboardActivity {
  _id: string;

  title: string;

  description: string;

  type:
    | "LEAD"
    | "APPLICATION"
    | "CUSTOMER"
    | "FOLLOWUP"
    | "APPROVED";

  createdAt: string;

  href?: string;
}

interface RecentActivityProps {
  loading?: boolean;

  activities: DashboardActivity[];
}

function getIcon(type: string) {
  switch (type) {
    case "LEAD":
      return (
        <Avatar sx={{ bgcolor: "#2563EB" }}>
          <PersonAddIcon />
        </Avatar>
      );

    case "CUSTOMER":
      return (
        <Avatar sx={{ bgcolor: "#06B6D4" }}>
          <GroupIcon />
        </Avatar>
      );

    case "APPLICATION":
      return (
        <Avatar sx={{ bgcolor: "#7C3AED" }}>
          <DescriptionIcon />
        </Avatar>
      );

    case "APPROVED":
      return (
        <Avatar sx={{ bgcolor: "#16A34A" }}>
          <CheckCircleIcon />
        </Avatar>
      );

    default:
      return (
        <Avatar sx={{ bgcolor: "#F59E0B" }}>
          <ScheduleIcon />
        </Avatar>
      );
  }
}

function getChip(type: string) {
  switch (type) {
    case "LEAD":
      return (
        <Chip
          label="Lead"
          color="primary"
          size="small"
        />
      );

    case "CUSTOMER":
      return (
        <Chip
          label="Customer"
          color="info"
          size="small"
        />
      );

    case "APPLICATION":
      return (
        <Chip
          label="Application"
          color="secondary"
          size="small"
        />
      );

    case "APPROVED":
      return (
        <Chip
          label="Approved"
          color="success"
          size="small"
        />
      );

    default:
      return (
        <Chip
          label="Follow Up"
          color="warning"
          size="small"
        />
      );
  }
}

export default function RecentActivity({
  activities,
  loading = false,
}: RecentActivityProps) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        height: "100%",
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          mb={3}
        >
          Recent Activity
        </Typography>

        <List disablePadding>
          {loading &&
            [...Array(5)].map((_, i) => (
              <ListItem key={i}>
                Loading...
              </ListItem>
            ))}

          {!loading &&
            activities.map(
              (activity, index) => (
                <div key={activity._id}>
                  <ListItem
                    component={
                      activity.href
                        ? Link
                        : "div"
                    }
                    href={
                      activity.href || ""
                    }
                  >
                    <ListItemAvatar>
                      {getIcon(
                        activity.type
                      )}
                    </ListItemAvatar>

                    <ListItemText
                      primary={
                        <Typography
                          fontWeight={600}
                        >
                          {
                            activity.title
                          }
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography
                            variant="body2"
                          >
                            {
                              activity.description
                            }
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {new Date(
                              activity.createdAt
                            ).toLocaleString()}
                          </Typography>
                        </>
                      }
                    />

                    {getChip(
                      activity.type
                    )}
                  </ListItem>

                  {index !==
                    activities.length -
                      1 && (
                    <Divider />
                  )}
                </div>
              )
            )}

          {!loading &&
            activities.length ===
              0 && (
              <Typography
                align="center"
                color="text.secondary"
              >
                No Recent Activity
              </Typography>
            )}
        </List>
      </CardContent>
    </Card>
  );
}