"use client";

import Chip from "@mui/material/Chip";

import { LeadPriority } from "@/types/leads/lead";

interface Props {
  priority: LeadPriority;
}

const priorityConfig: Record<
  LeadPriority,
  {
    label: string;
    color:
      | "default"
      | "primary"
      | "secondary"
      | "success"
      | "error"
      | "warning"
      | "info";
  }
> = {
  LOW: {
    label: "Low",
    color: "success",
  },

  MEDIUM: {
    label: "Medium",
    color: "info",
  },

  HIGH: {
    label: "High",
    color: "warning",
  },

  URGENT: {
    label: "Urgent",
    color: "error",
  },
};

export default function PriorityChip({
  priority,
}: Props) {
  const config =
    priorityConfig[priority] ??
    priorityConfig.MEDIUM;

  return (
    <Chip
      size="small"
      label={config.label}
      color={config.color}
      variant="filled"
    />
  );
}