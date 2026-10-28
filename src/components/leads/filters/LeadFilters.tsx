"use client";

import * as React from "react";

import {
  Drawer,
  Stack,
  Typography,
  Divider,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";

import {
  LeadPriority,
  LeadSource,
  LeadStatus,
} from "@/types/lead";

interface LeadFiltersProps {
  open: boolean;
  onClose: () => void;

  filters: any;

  onChange: (
    field: string,
    value: any,
  ) => void;

  onApply: () => void;

  onReset: () => void;
}

export default function LeadFilters({
  open,
  onClose,
  filters,
  onChange,
  onApply,
  onReset,
}: LeadFiltersProps) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
    >
      <Stack
        spacing={3}
        sx={{
          width: 360,
          p: 3,
        }}
      >
        <Typography variant="h6">
          Filters
        </Typography>

        <Divider />

        {/* Status */}

        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>

          <Select
            value={
              filters.status || ""
            }
            label="Status"
            onChange={(e) =>
              onChange(
                "status",
                e.target.value,
              )
            }
          >
            <MenuItem value="">
              All
            </MenuItem>

            {Object.values(
              LeadStatus,
            ).map((status) => (
              <MenuItem
                key={status}
                value={status}
              >
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Priority */}

        <FormControl fullWidth>
          <InputLabel>
            Priority
          </InputLabel>

          <Select
            value={
              filters.priority ||
              ""
            }
            label="Priority"
            onChange={(e) =>
              onChange(
                "priority",
                e.target.value,
              )
            }
          >
            <MenuItem value="">
              All
            </MenuItem>

            {Object.values(
              LeadPriority,
            ).map((item) => (
              <MenuItem
                key={item}
                value={item}
              >
                {item}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Source */}

        <FormControl fullWidth>
          <InputLabel>
            Lead Source
          </InputLabel>

          <Select
            value={
              filters.leadSource ||
              ""
            }
            label="Lead Source"
            onChange={(e) =>
              onChange(
                "leadSource",
                e.target.value,
              )
            }
          >
            <MenuItem value="">
              All
            </MenuItem>

            {Object.values(
              LeadSource,
            ).map((item) => (
              <MenuItem
                key={item}
                value={item}
              >
                {item}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* City */}

        <TextField
          label="City"
          value={
            filters.city || ""
          }
          onChange={(e) =>
            onChange(
              "city",
              e.target.value,
            )
          }
          fullWidth
        />

        {/* Loan Type */}

        <TextField
          label="Loan Type"
          value={
            filters.loanType ||
            ""
          }
          onChange={(e) =>
            onChange(
              "loanType",
              e.target.value,
            )
          }
          fullWidth
        />

        {/* Assigned User */}

        <TextField
          label="Assigned User ID"
          value={
            filters.assignedTo ||
            ""
          }
          onChange={(e) =>
            onChange(
              "assignedTo",
              e.target.value,
            )
          }
          fullWidth
        />

        {/* Date */}

        <TextField
          type="date"
          label="From Date"
          value={
            filters.fromDate ||
            ""
          }
          onChange={(e) =>
            onChange(
              "fromDate",
              e.target.value,
            )
          }
          slotProps={{
            inputLabel: {
              shrink: true,
            }
          }}
          fullWidth
        />

        <TextField
          type="date"
          label="To Date"
          value={
            filters.toDate || ""
          }
          onChange={(e) =>
            onChange(
              "toDate",
              e.target.value,
            )
          }
          slotProps={{
            inputLabel: {
              shrink: true,
            }
          }}
          fullWidth
        />

        <Divider />

        <Stack
          direction="row"
          spacing={2}
        >
          <Button
            variant="outlined"
            fullWidth
            onClick={onReset}
          >
            Reset
          </Button>

          <Button
            variant="contained"
            fullWidth
            onClick={onApply}
          >
            Apply
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}