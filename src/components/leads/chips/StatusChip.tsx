"use client";

import Chip from "@mui/material/Chip";

import { LeadStatus } from "@/types/leads/lead";

interface Props {
  status: LeadStatus;
}

const statusConfig: Record<
  LeadStatus,
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
  NEW: {
    label: "New",
    color: "info",
  },

  CONTACTED: {
    label: "Contacted",
    color: "primary",
  },

  FOLLOW_UP: {
    label: "Follow Up",
    color: "warning",
  },

  INTERESTED: {
    label: "Interested",
    color: "secondary",
  },

  DOCUMENT_PENDING: {
    label: "Document Pending",
    color: "warning",
  },

  UNDER_REVIEW: {
    label: "Under Review",
    color: "info",
  },

  APPROVED: {
    label: "Approved",
    color: "success",
  },

  REJECTED: {
    label: "Rejected",
    color: "error",
  },

  DISBURSED: {
    label: "Disbursed",
    color: "success",
  },

  LOST: {
    label: "Lost",
    color: "default",
  },
};

export default function StatusChip({
  status,
}: Props) {
  const config =
    statusConfig[status] ??
    statusConfig.NEW;

  return (
    <Chip
      size="small"
      label={config.label}
      color={config.color}
      variant="filled"
    />
  );
}