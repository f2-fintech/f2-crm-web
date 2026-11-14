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

export interface RecentCustomer {
  _id: string;

  customerId: string;

  fullName: string;

  phone: string;

  email: string;

  city: string;

  status: string;

  createdAt: string;
}

interface RecentCustomersTableProps {
  loading?: boolean;

  customers: RecentCustomer[];
}

const statusColor = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "success";

    case "INACTIVE":
      return "error";

    case "PENDING":
      return "warning";

    default:
      return "default";
  }
};

export default function RecentCustomersTable({
  customers,
  loading = false,
}: RecentCustomersTableProps) {
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
          Recent Customers
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  Customer ID
                </TableCell>

                <TableCell>
                  Name
                </TableCell>

                <TableCell>
                  Phone
                </TableCell>

                <TableCell>
                  Email
                </TableCell>

                <TableCell>
                  City
                </TableCell>

                <TableCell>
                  Status
                </TableCell>

                <TableCell>
                  Joined
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
                    <TableCell colSpan={8}>
                      Loading...
                    </TableCell>
                  </TableRow>
                ))}

              {!loading &&
                customers.map((customer) => (
                  <TableRow
                    hover
                    key={customer._id}
                  >
                    <TableCell>
                      {customer.customerId}
                    </TableCell>

                    <TableCell>
                      {customer.fullName}
                    </TableCell>

                    <TableCell>
                      {customer.phone}
                    </TableCell>

                    <TableCell>
                      {customer.email}
                    </TableCell>

                    <TableCell>
                      {customer.city}
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        label={customer.status}
                        color={statusColor(
                          customer.status
                        )}
                      />
                    </TableCell>

                    <TableCell>
                      {new Date(
                        customer.createdAt
                      ).toLocaleDateString()}
                    </TableCell>

                    <TableCell align="center">
                      <Link
                        href={`/customers/${customer._id}`}
                      >
                        <IconButton color="primary">
                          <VisibilityIcon />
                        </IconButton>
                      </Link>

                      <Link
                        href={`/customers/${customer._id}/edit`}
                      >
                        <IconButton color="warning">
                          <EditIcon />
                        </IconButton>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}

              {!loading &&
                customers.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      align="center"
                    >
                      No Customers Found
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