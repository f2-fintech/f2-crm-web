"use client";

import Chip from "@mui/material/Chip";

import { LeadSource } from "@/types/lead";

interface Props {
  source: LeadSource | string;
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
  const upperSource = (source || "").toUpperCase() as LeadSource;
  const config = sourceConfig[upperSource];

  if (config) {
    return (
      <Chip
        size="small"
        label={config.label}
        color={config.color}
        variant="outlined"
      />
    );
  }

  return (
    <Chip
      size="small"
      label={source || "Unknown"}
      color="default"
      variant="outlined"
      sx={{ textTransform: "capitalize" }}
    />
  );
}