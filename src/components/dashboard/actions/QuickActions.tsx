"use client";

import Link from "next/link";

import {
  Card,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";

import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import GroupsIcon from "@mui/icons-material/Groups";
import DescriptionIcon from "@mui/icons-material/Description";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";

interface ActionItem {
  title: string;
  description: string;
  href: string;
  color: string;
  icon: React.ReactNode;
}

export default function QuickActions() {
  const actions: ActionItem[] = [
    {
      title: "New Lead",
      description: "Create Lead",
      href: "/leads/new",
      color: "#2563EB",
      icon: <PersonAddAlt1Icon fontSize="large" />,
    },
    {
      title: "Customers",
      description: "Manage Customers",
      href: "/customers",
      color: "#16A34A",
      icon: <GroupsIcon fontSize="large" />,
    },
    {
      title: "Applications",
      description: "Loan Applications",
      href: "/applications",
      color: "#9333EA",
      icon: <DescriptionIcon fontSize="large" />,
    },
    {
      title: "Bulk Upload",
      description: "Import Leads",
      href: "/leads/import",
      color: "#EA580C",
      icon: <CloudUploadIcon fontSize="large" />,
    },
    {
      title: "Reports",
      description: "Analytics",
      href: "/reports",
      color: "#0891B2",
      icon: <AssessmentIcon fontSize="large" />,
    },
    {
      title: "Settings",
      description: "CRM Settings",
      href: "/settings",
      color: "#475569",
      icon: <SettingsIcon fontSize="large" />,
    },
  ];

  return (
    <Card
      sx={{
        borderRadius: 3,
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          mb={3}
        >
          Quick Actions
        </Typography>

        <Grid
          container
          spacing={3}
        >
          {actions.map((item) => (
            <Grid
              key={item.title}
              size={{
                xs: 12,
                sm: 6,
                md: 4,
                lg: 2,
              }}
            >
              <Link
                href={item.href}
                style={{
                  textDecoration: "none",
                }}
              >
                <Card
                  sx={{
                    cursor: "pointer",
                    transition: ".25s",
                    "&:hover": {
                      transform:
                        "translateY(-5px)",
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 60,
                        height: 60,
                        margin: "0 auto",
                        borderRadius: 16,
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                          "center",
                        background:
                          item.color,
                        color: "#fff",
                      }}
                    >
                      {item.icon}
                    </div>

                    <Typography
                      mt={2}
                      fontWeight={700}
                    >
                      {item.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {item.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Link>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}