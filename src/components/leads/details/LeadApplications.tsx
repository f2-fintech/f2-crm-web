"use client";

import * as React from "react";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";

import {
  DataGrid,
  GridColDef,
} from "@mui/x-data-grid";

import OpenInNewIcon from "@mui/icons-material/OpenInNew";

interface LeadApplication {
  _id: string;

  applicationId: string;

  lenderName: string;

  loanType: string;

  loanAmount: number;

  status: string;

  createdAt: string;
}

interface LeadApplicationsProps {
  lead: any;

  applications?: LeadApplication[];

  loading?: boolean;

  onOpen?: (
    application: LeadApplication,
  ) => void;
}

export default function LeadApplications({
  applications = [],

  loading = false,

  onOpen,
}: LeadApplicationsProps) {
  const columns: GridColDef[] = [
    {
      field: "applicationId",
      headerName: "Application ID",
      width: 170,
    },

    {
      field: "lenderName",
      headerName: "Lender",
      flex: 1,
      minWidth: 180,
    },

    {
      field: "loanType",
      headerName: "Loan Type",
      width: 170,
    },

    {
      field: "loanAmount",
      headerName: "Loan Amount",
      width: 170,

      valueFormatter: (value) =>
        `₹ ${Number(value || 0).toLocaleString(
          "en-IN",
        )}`,
    },

    {
      field: "status",
      headerName: "Status",
      width: 150,

      renderCell: ({ value }) => (
        <Chip
          label={value}
          size="small"
          color={
            value === "APPROVED"
              ? "success"
              : value === "REJECTED"
              ? "error"
              : value === "UNDER_REVIEW"
              ? "warning"
              : "info"
          }
        />
      ),
    },

    {
      field: "createdAt",
      headerName: "Created",
      width: 170,

      valueFormatter: (value) =>
        value
          ? new Date(value).toLocaleDateString()
          : "-",
    },

    {
      field: "actions",
      headerName: "",
      sortable: false,
      width: 120,

      renderCell: ({ row }) => (
        <Button
          size="small"
          endIcon={<OpenInNewIcon />}
          onClick={() =>
            onOpen?.(row)
          }
        >
          Open
        </Button>
      ),
    },
  ];

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h6">
            Applications
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Total :
            {" "}
            {applications.length}
          </Typography>
        </Stack>

        <Box
          sx={{
            height: 500,
            width: "100%",
          }}
        >
          <DataGrid
            rows={applications}
            columns={columns}
            loading={loading}
            getRowId={(row) => row._id}
            disableRowSelectionOnClick
            pageSizeOptions={[
              10,
              20,
              50,
            ]}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 10,
                },
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}