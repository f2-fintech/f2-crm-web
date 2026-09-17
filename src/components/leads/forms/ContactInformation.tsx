"use client";

import {
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
} from "@mui/material";

interface ContactInformationProps {
  values: any;
  errors?: any;
  onChange: (
    field: string,
    value: any,
  ) => void;
}

export default function ContactInformation({
  values,
  errors,
  onChange,
}: ContactInformationProps) {
  return (
    <Card>
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
        >
          Contact Information
        </Typography>

        <Grid
          container
          spacing={2}
        >
          <Grid size={12}>
            <TextField
              fullWidth
              label="Phone Number"
              value={
                values.phone || ""
              }
              error={
                !!errors?.phone
              }
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

          <Grid size={12}>
            <TextField
              fullWidth
              label="Alternate Phone"
              value={
                values.alternatePhone ||
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

          <Grid size={12}>
            <TextField
              fullWidth
              label="Email"
              value={
                values.email || ""
              }
              error={
                !!errors?.email
              }
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

          <Grid size={6}>
            <TextField
              fullWidth
              label="City"
              value={
                values.city || ""
              }
              onChange={(e) =>
                onChange(
                  "city",
                  e.target.value,
                )
              }
            />
          </Grid>

          <Grid size={6}>
            <TextField
              fullWidth
              label="State"
              value={
                values.state || ""
              }
              onChange={(e) =>
                onChange(
                  "state",
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