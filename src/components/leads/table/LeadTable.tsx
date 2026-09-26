"use client";

import * as React from "react";
import {
  Box,
  Card,
  CardContent,
} from "@mui/material";
import {
  DataGrid,
  GridPaginationModel,
} from "@mui/x-data-grid";

import { getLeadColumns } from "./LeadColumns";

interface LeadTableProps {
  rows: any[];
  loading?: boolean;

  page: number;
  pageSize: number;
  rowCount: number;

  onPaginationChange: (
    model: GridPaginationModel,
  ) => void;
  onViewJourney?: (lead: any) => void;
}

export default function LeadTable({
  rows,
  loading = false,

  page,
  pageSize,
  rowCount,

  onPaginationChange,
  onViewJourney,
}: LeadTableProps) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
      }}
    >
      <CardContent sx={{ p: 0 }}>
        <Box
          sx={{
            height: 700,
            width: "100%",
          }}
        >
          <DataGrid
            rows={rows}
            columns={getLeadColumns({ onViewJourney })}
            loading={loading}
            getRowId={(row) => row._id}
            checkboxSelection
            disableRowSelectionOnClick
            paginationMode="server"
            paginationModel={{
              page: page - 1,
              pageSize,
            }}
            onPaginationModelChange={
              onPaginationChange
            }
            rowCount={rowCount}
            pageSizeOptions={[
              10,
              20,
              50,
              100,
            ]}
            sx={{
              border: 0,

              "& .MuiDataGrid-columnHeaders": {
                backgroundColor:
                  "#F8FAFC",
                fontWeight: 700,
              },

              "& .MuiDataGrid-cell": {
                display: "flex",
                alignItems: "center",
              },

              "& .MuiDataGrid-footerContainer": {
                borderTop:
                  "1px solid #E5E7EB",
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}