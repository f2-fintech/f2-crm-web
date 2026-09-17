"use client";

import Chip from "@mui/material/Chip";

import { LeadSource } from "@/types/leads/lead";

interface Props {
  source: LeadSource;
}

const sourceConfig: Record<
  LeadSource,
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
  WEBSITE: {
    label: "Website",
    color: "primary",
  },

  FACEBOOK: {
    label: "Facebook",
    color: "info",
  },

  GOOGLE: {
    label: "Google",
    color: "success",
  },

  DIALER: {
    label: "Dialer",
    color: "warning",
  },

  MANUAL: {
    label: "Manual",
    color: "default",
  },

  REFERENCE: {
    label: "Reference",
    color: "secondary",
  },

  WHATSAPP: {
    label: "WhatsApp",
    color: "success",
  },

  INSTAGRAM: {
    label: "Instagram",
    color: "secondary",
  },

  OMS: {
    label: "OMS",
    color: "error",
  },
};

export default function SourceChip({
  source,
}: Props) {
  const config =
    sourceConfig[source] ??
    sourceConfig.MANUAL;

  return (
    <Chip
      size="small"
      label={config.label}
      color={config.color}
      variant="outlined"
    />
  );
}