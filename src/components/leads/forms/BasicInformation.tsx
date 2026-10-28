"use client";

import {
  Card,
  CardContent,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

import {
  LeadPriority,
  LeadSource,
} from "@/types/lead";

interface BasicInformationProps {
  values: any;
  errors?: any;

  onChange: (
    field: string,
    value: any,
  ) => void;
}

export default function BasicInformation({
  values,
  errors,
  onChange,
}: BasicInformationProps) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
      }}
    >
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Basic Information
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
              fullWidth
              required
              label="Full Name"
              value={
                values.fullName ?? ""
              }
              error={
                !!errors?.fullName
              }
              helperText={
                errors?.fullName
              }
              onChange={(e) =>
                onChange(
                  "fullName",
                  e.target.value,
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
              required
              label="Phone Number"
              value={
                values.phone ?? ""
              }
              error={!!errors?.phone}
              helperText={
                errors?.phone
              }
              onChange={(e) =>
                onChange(
                  "phone",
                  e.target.value,
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
              label="Alternate Phone"
              value={
                values.alternatePhone ??
                ""
              }
              onChange={(e) =>
                onChange(
                  "alternatePhone",
                  e.target.value,
                )
              }
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
            }}
          >
            <TextField
              fullWidth
              label="Email"
              value={
                values.email ?? ""
              }
              error={!!errors?.email}
              helperText={
                errors?.email
              }
              onChange={(e) =>
                onChange(
                  "email",
                  e.target.value,
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
              required
              label="City"
              value={
                values.city ?? ""
              }
              error={!!errors?.city}
              helperText={
                errors?.city
              }
              onChange={(e) =>
                onChange(
                  "city",
                  e.target.value,
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
              label="State"
              value={
                values.state ?? ""
              }
              onChange={(e) =>
                onChange(
                  "state",
                  e.target.value,
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
              select
              fullWidth
              required
              label="Lead Source"
              value={
                values.leadSource ??
                LeadSource.MANUAL
              }
              onChange={(e) =>
                onChange(
                  "leadSource",
                  e.target.value,
                )
              }
            >
              {Object.values(
                LeadSource,
              ).map((item) => (
                <MenuItem
                  key={item}
                  value={item}
                >
                  {item}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <TextField
              select
              fullWidth
              label="Priority"
              value={
                values.priority ??
                LeadPriority.MEDIUM
              }
              onChange={(e) =>
                onChange(
                  "priority",
                  e.target.value,
                )
              }
            >
              {Object.values(
                LeadPriority,
              ).map((item) => (
                <MenuItem
                  key={item}
                  value={item}
                >
                  {item}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}