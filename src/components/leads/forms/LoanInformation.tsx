"use client";

import {
  Card,
  CardContent,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

interface LoanInformationProps {
  values: any;
  errors?: any;

  onChange: (
    field: string,
    value: any,
  ) => void;
}

const loanTypes = [
  "Personal Loan",
  "Business Loan",
  "Home Loan",
  "Loan Against Property",
  "Credit Card",
  "Car Loan",
  "Education Loan",
  "Gold Loan",
];

export default function LoanInformation({
  values,
  errors,
  onChange,
}: LoanInformationProps) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          sx={{ mb: 3 }}
        >
          Loan Information
        </Typography>

        <Grid
          container
          spacing={2}
        >
          <Grid
            size={{
              xs: 12,
            }}
          >
            <TextField
              select
              fullWidth
              required
              label="Loan Type"
              value={
                values.loanType ?? ""
              }
              error={
                !!errors?.loanType
              }
              helperText={
                errors?.loanType
              }
              onChange={(e) =>
                onChange(
                  "loanType",
                  e.target.value,
                )
              }
            >
              {loanTypes.map(
                (item) => (
                  <MenuItem
                    key={item}
                    value={item}
                  >
                    {item}
                  </MenuItem>
                ),
              )}
            </TextField>
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <TextField
              fullWidth
              type="number"
              label="Loan Amount"
              value={
                values.loanAmount ??
                ""
              }
              error={
                !!errors?.loanAmount
              }
              helperText={
                errors?.loanAmount
              }
              onChange={(e) =>
                onChange(
                  "loanAmount",
                  Number(
                    e.target.value,
                  ),
                )
              }
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <TextField
              fullWidth
              type="number"
              label="Monthly Income"
              value={
                values.monthlyIncome ??
                ""
              }
              error={
                !!errors?.monthlyIncome
              }
              helperText={
                errors?.monthlyIncome
              }
              onChange={(e) =>
                onChange(
                  "monthlyIncome",
                  Number(
                    e.target.value,
                  ),
                )
              }
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}