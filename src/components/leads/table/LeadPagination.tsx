"use client";

import * as React from "react";

import {
  Box,
  Pagination,
  Stack,
  Typography,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";

interface LeadPaginationProps {
  page: number;
  limit: number;
  total: number;

  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export default function LeadPagination({
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
}: LeadPaginationProps) {
  const totalPages = Math.max(
    1,
    Math.ceil(total / limit),
  );

  const start =
    total === 0 ? 0 : (page - 1) * limit + 1;

  const end = Math.min(
    page * limit,
    total,
  );

  const handleLimitChange = (
    event: SelectChangeEvent<number>,
  ) => {
    onLimitChange(Number(event.target.value));
  };

  return (
    <Box
      sx={{
        mt: 2,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 2,
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
      >
        Showing {start} - {end} of {total} records
      </Typography>

      <Stack
        direction="row"
        spacing={2}
        sx={{
          alignItems: "center",
        }}
      >
        <FormControl size="small">
          <Select<number>
            value={limit ?? 10}
            onChange={handleLimitChange}
            sx={{
              minWidth: 90,
            }}
          >
            <MenuItem value={10}>
              10
            </MenuItem>

            <MenuItem value={20}>
              20
            </MenuItem>

            <MenuItem value={50}>
              50
            </MenuItem>

            <MenuItem value={100}>
              100
            </MenuItem>
          </Select>
        </FormControl>

        <Pagination
          page={page ?? 1}
          count={totalPages ?? 1}
          color="primary"
          shape="rounded"
          showFirstButton
          showLastButton
          onChange={(_, value) =>
            onPageChange(value)
          }
        />
      </Stack>
    </Box>
  );
}