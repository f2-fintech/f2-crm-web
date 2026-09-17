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

export interface RecentApplication {
  _id: string;

  applicationNo: string;

  customerName: string;

  lender: string;

  loanAmount: number;

  status: string;

  createdAt: string;
}

interface RecentApplicationsTableProps {
  loading?: boolean;

  applications: RecentApplication[];
}

const statusColor = (status: string) => {
  switch (status) {
    case "APPROVED":
      return "success";

    case "REJECTED":
      return "error";

    case "PENDING":
      return "warning";

    case "UNDER_REVIEW":
      return "info";

    default:
      return "default";
  }
};

export default function RecentApplicationsTable({
  applications,
  loading = false,
}: RecentApplicationsTableProps) {
  return (
    <Card
      sx={{
        borderRadius: 3,
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          mb={3}
        >
          Recent Applications
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  Application No
                </TableCell>

                <TableCell>
                  Customer
                </TableCell>

                <TableCell>
                  Lender
                </TableCell>

                <TableCell>
                  Loan Amount
                </TableCell>

                <TableCell>
                  Status
                </TableCell>

                <TableCell>
                  Date
                </TableCell>

                <TableCell align="center">
                  Action
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading &&
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      Loading...
                    </TableCell>
                  </TableRow>
                ))}

              {!loading &&
                applications.map((item) => (
                  <TableRow
                    hover
                    key={item._id}
                  >
                    <TableCell>
                      {item.applicationNo}
                    </TableCell>

                    <TableCell>
                      {item.customerName}
                    </TableCell>

                    <TableCell>
                      {item.lender}
                    </TableCell>

                    <TableCell>
                      ₹
                      {item.loanAmount.toLocaleString()}
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        label={item.status}
                        color={statusColor(
                          item.status
                        )}
                      />
                    </TableCell>

                    <TableCell>
                      {new Date(
                        item.createdAt
                      ).toLocaleDateString()}
                    </TableCell>

                    <TableCell align="center">
                      <Link
                        href={`/applications/${item._id}`}
                      >
                        <IconButton color="primary">
                          <VisibilityIcon />
                        </IconButton>
                      </Link>

                      <Link
                        href={`/applications/${item._id}/edit`}
                      >
                        <IconButton color="warning">
                          <EditIcon />
                        </IconButton>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}

              {!loading &&
                applications.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      align="center"
                    >
                      No Applications Found
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