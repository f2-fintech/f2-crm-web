"use client";

import Link from "next/link";

import {
  Card,
  CardContent,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export interface RecentLead {
  _id: string;

  fullName: string;

  phone: string;

  loanAmount: number;

  source: string;

  status: string;

  assignedTo?: {
    firstName: string;
    lastName: string;
  };

  createdAt: string;
}

interface RecentLeadsTableProps {
  loading?: boolean;

  leads: RecentLead[];

  onDelete?: (id: string) => void;
}

const statusColor = (status: string) => {
  switch (status) {
    case "APPROVED":
      return "success";

    case "REJECTED":
      return "error";

    case "FOLLOW_UP":
      return "warning";

    case "CONTACTED":
      return "info";

    default:
      return "default";
  }
};

export default function RecentLeadsTable({
  leads,
  loading = false,
  onDelete,
}: RecentLeadsTableProps) {
  return (
    <Card
      sx={{
        borderRadius: 3,
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          sx={{ mb: 3 }}
        >
          Recent Leads
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>

                <TableCell>Phone</TableCell>

                <TableCell>Loan</TableCell>

                <TableCell>Source</TableCell>

                <TableCell>Status</TableCell>

                <TableCell>Assigned</TableCell>

                <TableCell>Date</TableCell>

                <TableCell align="center">
                  Action
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading &&
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell
                      colSpan={8}
                    >
                      Loading...
                    </TableCell>
                  </TableRow>
                ))}

              {!loading &&
                leads.map((lead) => (
                  <TableRow
                    hover
                    key={lead._id}
                  >
                    <TableCell>
                      {lead.fullName}
                    </TableCell>

                    <TableCell>
                      {lead.phone}
                    </TableCell>

                    <TableCell>
                      ₹
                      {lead.loanAmount.toLocaleString()}
                    </TableCell>

                    <TableCell>
                      {lead.source}
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        label={lead.status}
                        color={statusColor(
                          lead.status
                        )}
                      />
                    </TableCell>

                    <TableCell>
                      {lead.assignedTo
                        ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}`
                        : "-"}
                    </TableCell>

                    <TableCell>
                      {new Date(
                        lead.createdAt
                      ).toLocaleDateString()}
                    </TableCell>

                    <TableCell align="center">
                      <Link
                        href={`/leads/${lead._id}`}
                      >
                        <IconButton
                          color="primary"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Link>

                      <Link
                        href={`/leads/${lead._id}/edit`}
                      >
                        <IconButton
                          color="warning"
                        >
                          <EditIcon />
                        </IconButton>
                      </Link>

                      <IconButton
                        color="error"
                        onClick={() =>
                          onDelete?.(
                            lead._id
                          )
                        }
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}

              {!loading &&
                leads.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      align="center"
                    >
                      No Leads Found
                    </TableCell>
                  </TableRow>
                )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}