"use client";

import * as React from "react";

import {
  Stack,
  Button,
  TextField,
  InputAdornment,
  Tooltip,
  IconButton,
} from "@mui/material";

import {
  Search,
  Refresh,
  FilterList,
  FileUpload,
  Download,
  Add,
} from "@mui/icons-material";

interface LeadToolbarProps {
  search: string;

  onSearchChange: (
    value: string,
  ) => void;

  onCreate: () => void;

  onRefresh: () => void;

  onFilter: () => void;

  onExport: () => void;

  onBulkUpload: () => void;
}

export default function LeadToolbar({
  search,
  onSearchChange,
  onCreate,
  onRefresh,
  onFilter,
  onExport,
  onBulkUpload,
}: LeadToolbarProps) {
  return (
    <Stack
      direction={{
        xs: "column",
        md: "row",
      }}
      spacing={2}
      alignItems={{
        xs: "stretch",
        md: "center",
      }}
      justifyContent="space-between"
      sx={{
        mb: 3,
      }}
    >
      {/* Search */}

      <TextField
        value={search}
        placeholder="Search Lead..."
        size="small"
        onChange={(e) =>
          onSearchChange(
            e.target.value,
          )
        }
        sx={{
          width: {
            xs: "100%",
            md: 350,
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search
                fontSize="small"
              />
            </InputAdornment>
          ),
        }}
      />

      {/* Actions */}

      <Stack
        direction="row"
        spacing={1}
        flexWrap="wrap"
      >
        <Tooltip title="Refresh">
          <IconButton
            onClick={
              onRefresh
            }
          >
            <Refresh />
          </IconButton>
        </Tooltip>

        <Tooltip title="Filters">
          <IconButton
            onClick={
              onFilter
            }
          >
            <FilterList />
          </IconButton>
        </Tooltip>

        <Button
          variant="outlined"
          startIcon={
            <Download />
          }
          onClick={
            onExport
          }
        >
          Export
        </Button>

        <Button
          variant="outlined"
          startIcon={
            <FileUpload />
          }
          onClick={
            onBulkUpload
          }
        >
          Bulk Upload
        </Button>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onCreate}
        >
          New Lead
        </Button>
      </Stack>
    </Stack>
  );
}