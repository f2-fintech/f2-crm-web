"use client";

import React from "react";
import {
  Box,
  Button,
  ButtonBase,
  IconButton,
  InputBase,
  Stack,
  Typography,
} from "@mui/material";
import {
  Download,
  RotateCcw,
  Search,
  Table as TableIcon,
  Trash2,
  X,
} from "lucide-react";
import {
  DispositionCategory,
  FILTER_SEGMENTS,
} from "./dispositionConstants";

interface NotionSegmentFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;

  selectedCategory: DispositionCategory;
  onSelectCategory: (cat: DispositionCategory) => void;

  counts: Record<DispositionCategory, number>;
  totalRows: number;
  filteredCount: number;

  isAdmin: boolean;
  canUploadData: boolean;
  onOpenUpload: () => void;
  onExport: () => void;
  onOpenClear: () => void;
  onResetFilters: () => void;
}

export default function NotionSegmentFilterBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  counts,
  totalRows,
  filteredCount,
  isAdmin,
  canUploadData,
  onOpenUpload,
  onExport,
  onOpenClear,
  onResetFilters,
}: NotionSegmentFilterBarProps) {
  const isFiltered =
    selectedCategory !== "ALL" || searchQuery.trim().length > 0;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, mb: 1.75 }}>
      {/* Top Controls Row */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.25}
        sx={{
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
        }}
      >
        {/* Search Input */}
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            gap: 1,
            px: 1.25,
            height: 34,
            flexGrow: 1,
            maxWidth: { xs: "100%", sm: 360 },
            border: "1px solid rgba(55, 53, 47, 0.14)",
            borderRadius: "7px",
            bgcolor: "#ffffff",
            "&:focus-within": {
              borderColor: "#2563eb",
              boxShadow: "0 0 0 2px rgba(37, 99, 235, 0.12)",
            },
          }}
        >
          <Search size={14} color="#94a3b8" />
          <InputBase
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            sx={{
              flexGrow: 1,
              fontSize: "12.5px",
              color: "#1e293b",
              "& input::placeholder": { color: "#94a3b8" },
            }}
          />
          {searchQuery && (
            <IconButton
              size="small"
              onClick={() => onSearchChange("")}
              sx={{ p: 0.3, color: "#94a3b8" }}
            >
              <X size={13} />
            </IconButton>
          )}
        </Stack>

        {/* Toolbar Actions */}
        <Stack direction="row" spacing={0.8} sx={{ alignItems: "center", flexWrap: "wrap" }}>
          {canUploadData && (
            <Button
              size="small"
              startIcon={<TableIcon size={13} />}
              onClick={onOpenUpload}
              sx={btnSx}
            >
              Paste leads
            </Button>
          )}

          {isAdmin && totalRows > 0 && (
            <Button
              size="small"
              startIcon={<Download size={13} />}
              onClick={onExport}
              sx={btnSx}
            >
              Export {isFiltered ? `(${filteredCount})` : ""}
            </Button>
          )}

          {totalRows > 0 && (
            <Button
              size="small"
              startIcon={<Trash2 size={13} />}
              onClick={onOpenClear}
              sx={{
                ...btnSx,
                color: "#dc2626",
                "&:hover": { bgcolor: "rgba(220, 38, 38, 0.08)", borderColor: "#fca5a5" },
              }}
            >
              Clear
            </Button>
          )}
        </Stack>
      </Stack>

      {/* Filter Segment Pills Row */}
      <Stack
        direction="row"
        spacing={0.7}
        sx={{
          flexWrap: "wrap",
          gap: 0.6,
          alignItems: "center",
        }}
      >
        {FILTER_SEGMENTS.map((seg) => {
          const isSelected = selectedCategory === seg.key;
          const count = counts[seg.key] || 0;
          const isPendingKey = seg.key === "PENDING";

          return (
            <ButtonBase
              key={seg.key}
              onClick={() => onSelectCategory(seg.key)}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.7,
                px: 1.25,
                py: 0.45,
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: isSelected ? 700 : 500,
                bgcolor: isSelected ? seg.activeBg : "#ffffff",
                color: isSelected ? "#ffffff" : isPendingKey && count > 0 ? "#b91c1c" : "#334155",
                border: isSelected
                  ? `1px solid ${seg.activeBg}`
                  : isPendingKey && count > 0
                  ? "1px dashed rgba(239, 68, 68, 0.6)"
                  : "1px solid rgba(55, 53, 47, 0.14)",
                transition: "all 0.15s ease",
                "&:hover": {
                  filter: "brightness(0.96)",
                  transform: "translateY(-0.5px)",
                },
              }}
            >
              <Box
                component="span"
                sx={{
                  width: 6.5,
                  height: 6.5,
                  borderRadius: "50%",
                  bgcolor: isSelected ? "#ffffff" : seg.dot,
                  flexShrink: 0,
                }}
              />

              <span>
                {seg.label}
              </span>

              <Box
                component="span"
                sx={{
                  ml: 0.2,
                  px: 0.6,
                  py: 0.05,
                  borderRadius: "10px",
                  fontSize: "11px",
                  fontWeight: 700,
                  bgcolor: isSelected
                    ? "rgba(255, 255, 255, 0.22)"
                    : isPendingKey && count > 0
                    ? "rgba(239, 68, 68, 0.12)"
                    : "rgba(0, 0, 0, 0.05)",
                  color: isSelected ? "#ffffff" : isPendingKey && count > 0 ? "#dc2626" : "#64748b",
                }}
              >
                {count}
              </Box>
            </ButtonBase>
          );
        })}

        {isFiltered && (
          <Button
            size="small"
            startIcon={<RotateCcw size={11} />}
            onClick={onResetFilters}
            sx={{
              textTransform: "none",
              fontSize: "11.5px",
              fontWeight: 600,
              color: "#64748b",
              py: 0.35,
              px: 0.9,
              borderRadius: "6px",
              "&:hover": { bgcolor: "rgba(0,0,0,0.05)", color: "#0f172a" },
            }}
          >
            Reset
          </Button>
        )}
      </Stack>
    </Box>
  );
}

const btnSx = {
  textTransform: "none",
  fontSize: "12px",
  fontWeight: 500,
  color: "#334155",
  border: "1px solid rgba(55, 53, 47, 0.14)",
  borderRadius: "6px",
  bgcolor: "#ffffff",
  px: 1.25,
  py: 0.45,
  "&:hover": {
    bgcolor: "rgba(55, 53, 47, 0.05)",
  },
} as const;
