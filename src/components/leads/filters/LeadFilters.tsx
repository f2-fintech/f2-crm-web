"use client";

import * as React from "react";
import {
  Drawer,
  Stack,
  Box,
  Typography,
  Divider,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
} from "@mui/material";
import { X, Filter, RotateCcw, Check } from "lucide-react";
import {
  LeadPriority,
  LeadSource,
  LeadStatus,
} from "@/types/lead";

export interface LeadFiltersProps {
  open: boolean;
  onClose: () => void;
  filters?: any;
  onChange?: (field: string, value: any) => void;
  updateFilter?: (field: string, value: any) => void;
  onApply?: () => void;
  applyFilters?: (values?: any) => void;
  onReset?: () => void;
  resetFilters?: () => void;
}

export default function LeadFilters(props: LeadFiltersProps) {
  const { open, onClose } = props;
  const filters = props.filters || {};
  const handleChange = props.onChange || props.updateFilter || (() => {});
  const handleReset = props.onReset || props.resetFilters || (() => {});
  const handleApply = props.onApply || (() => {});

  const activeCount = React.useMemo(() => {
    let count = 0;
    if (filters.status) count++;
    if (filters.priority) count++;
    if (filters.leadSource) count++;
    if (filters.city) count++;
    if (filters.loanType) count++;
    if (filters.assignedTo) count++;
    if (filters.fromDate) count++;
    if (filters.toDate) count++;
    return count;
  }, [filters]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(4px)",
          },
        },
        paper: {
          sx: {
            width: { xs: "100%", sm: 400 },
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            borderLeft: "1px solid #e2e8f0",
          },
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "#ffffff",
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              bgcolor: "#eff6ff",
              border: "1px solid #bfdbfe",
              color: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Filter size={18} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0f172a" }}>
                Filter Leads
              </Typography>
              {activeCount > 0 && (
                <Chip
                  size="small"
                  label={`${activeCount} active`}
                  sx={{
                    height: 20,
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    bgcolor: "#dbeafe",
                    color: "#1e40af",
                  }}
                />
              )}
            </Stack>
            <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
              Narrow down your lead pipeline
            </Typography>
          </Box>
        </Stack>

        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: "#64748b",
            "&:hover": { bgcolor: "#f1f5f9", color: "#0f172a" },
            borderRadius: "8px",
          }}
        >
          <X size={18} />
        </IconButton>
      </Box>

      {/* Form Fields Body */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
          bgcolor: "#f8fafc",
          "& .MuiOutlinedInput-root": {
            bgcolor: "#ffffff",
            borderRadius: "10px",
            fontSize: "0.875rem",
          },
          "& .MuiInputLabel-root": {
            fontSize: "0.875rem",
          },
        }}
      >
        {/* Status */}
        <FormControl fullWidth size="small">
          <InputLabel id="lead-filter-status-label">Lead Status</InputLabel>
          <Select
            labelId="lead-filter-status-label"
            value={filters.status || ""}
            label="Lead Status"
            onChange={(e) => handleChange("status", e.target.value)}
          >
            <MenuItem value="">
              <em>All Statuses</em>
            </MenuItem>
            {Object.values(LeadStatus).map((status) => (
              <MenuItem key={status} value={status}>
                {status.replace(/_/g, " ")}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Priority */}
        <FormControl fullWidth size="small">
          <InputLabel id="lead-filter-priority-label">Priority</InputLabel>
          <Select
            labelId="lead-filter-priority-label"
            value={filters.priority || ""}
            label="Priority"
            onChange={(e) => handleChange("priority", e.target.value)}
          >
            <MenuItem value="">
              <em>All Priorities</em>
            </MenuItem>
            {Object.values(LeadPriority).map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Lead Source */}
        <FormControl fullWidth size="small">
          <InputLabel id="lead-filter-source-label">Lead Source</InputLabel>
          <Select
            labelId="lead-filter-source-label"
            value={filters.leadSource || ""}
            label="Lead Source"
            onChange={(e) => handleChange("leadSource", e.target.value)}
          >
            <MenuItem value="">
              <em>All Sources</em>
            </MenuItem>
            {Object.values(LeadSource).map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* City */}
        <TextField
          size="small"
          label="City"
          placeholder="e.g. Mumbai, Pune"
          value={filters.city || ""}
          onChange={(e) => handleChange("city", e.target.value)}
          fullWidth
        />

        {/* Loan Type */}
        <TextField
          size="small"
          label="Loan Type"
          placeholder="e.g. Personal Loan, Home Loan"
          value={filters.loanType || ""}
          onChange={(e) => handleChange("loanType", e.target.value)}
          fullWidth
        />

        {/* Assigned User */}
        <TextField
          size="small"
          label="Assigned User ID / Name"
          placeholder="Filter by agent or user"
          value={filters.assignedTo || ""}
          onChange={(e) => handleChange("assignedTo", e.target.value)}
          fullWidth
        />

        <Divider sx={{ my: 0.5 }}>
          <Typography variant="caption" sx={{ color: "#94a3b8", px: 1, textTransform: "uppercase", fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.05em" }}>
            Date Range
          </Typography>
        </Divider>

        {/* Dates */}
        <Stack direction="row" spacing={1.5}>
          <TextField
            size="small"
            type="date"
            label="From Date"
            value={filters.fromDate || ""}
            onChange={(e) => handleChange("fromDate", e.target.value)}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            fullWidth
          />

          <TextField
            size="small"
            type="date"
            label="To Date"
            value={filters.toDate || ""}
            onChange={(e) => handleChange("toDate", e.target.value)}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            fullWidth
          />
        </Stack>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 2.5,
          borderTop: "1px solid #e2e8f0",
          bgcolor: "#ffffff",
        }}
      >
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleReset}
            startIcon={<RotateCcw size={15} />}
            sx={{
              borderRadius: "10px",
              py: 1,
              borderColor: "#cbd5e1",
              color: "#475569",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": {
                borderColor: "#94a3b8",
                bgcolor: "#f8fafc",
              },
            }}
          >
            Reset
          </Button>

          <Button
            variant="contained"
            fullWidth
            onClick={handleApply}
            startIcon={<Check size={16} />}
            sx={{
              borderRadius: "10px",
              py: 1,
              bgcolor: "#2563eb",
              fontWeight: 600,
              textTransform: "none",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
              "&:hover": {
                bgcolor: "#1d4ed8",
              },
            }}
          >
            Apply Filters
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}
