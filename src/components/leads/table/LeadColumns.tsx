"use client";

import { GridColDef } from "@mui/x-data-grid";
import StatusChip from "../chips/StatusChip";
import PriorityChip from "../chips/PriorityChip";
import SourceChip from "../chips/SourceChip";
import LeadRowActions from "./LeadRowActions";

export const LeadColumns: GridColDef[] = [
  {
    field: "leadId",
    headerName: "Lead ID",
    width: 120,
  },

  {
    field: "fullName",
    headerName: "Customer",
    flex: 1,
    minWidth: 180,
  },

  {
    field: "phone",
    headerName: "Phone",
    width: 140,
  },

  {
    field: "city",
    headerName: "City",
    width: 120,
  },

  {
    field: "loanType",
    headerName: "Loan Type",
    width: 150,
  },

  {
    field: "loanAmount",
    headerName: "Loan Amount",
    width: 150,
    valueFormatter: (value: any) => {
      return `₹ ${Number(value || 0).toLocaleString("en-IN")}`;
    },
  },

  {
    field: "status",
    headerName: "Status",
    width: 150,
    renderCell: ({ value }) => (
      <StatusChip status={value} />
    ),
  },

  {
    field: "priority",
    headerName: "Priority",
    width: 130,
    renderCell: ({ value }) => (
      <PriorityChip priority={value} />
    ),
  },

  {
    field: "leadSource",
    headerName: "Source",
    width: 140,
    renderCell: ({ value }) => (
      <SourceChip source={value} />
    ),
  },

  {
    field: "assignedTo",
    headerName: "Assigned To",
    width: 180,
    valueGetter: (_, row) =>
      row.assignedTo?.fullName ?? "-",
  },

  {
    field: "createdAt",
    headerName: "Created",
    width: 170,
    valueFormatter: (value: any) =>
      value
        ? new Date(value).toLocaleString()
        : "-",
  },

  {
    field: "actions",
    headerName: "Actions",
    width: 90,
    sortable: false,
    filterable: false,
    renderCell: ({ row }) => (
      <LeadRowActions lead={row} />
    ),
  },
];