"use client";

import {
  Card,
  CardContent,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

interface EmploymentInformationProps {
  values: any;
  errors?: any;

  onChange: (
    field: string,
    value: any,
  ) => void;
}

const employmentTypes = [
  "Salaried",
  "Self Employed",
  "Business",
  "Professional",
  "Government Employee",
  "Retired",
  "Student",
  "Others",
];

export default function EmploymentInformation({
  values,
  errors,
  onChange,
}: EmploymentInformationProps) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
      }}
    >
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Employment Information
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
              label="Employment Type"
              value={
                values.employmentType ??
                ""
              }
              error={
                !!errors?.employmentType
              }
              helperText={
                errors?.employmentType
              }
              onChange={(e) =>
                onChange(
                  "employmentType",
                  e.target.value,
                )
              }
            >
              {employmentTypes.map(
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
            }}
          >
            <TextField
              fullWidth
              label="Company Name"
              value={
                values.companyName ??
                ""
              }
              error={
                !!errors?.companyName
              }
              helperText={
                errors?.companyName
              }
              onChange={(e) =>
                onChange(
                  "companyName",
                  e.target.value,
                )
              }
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}