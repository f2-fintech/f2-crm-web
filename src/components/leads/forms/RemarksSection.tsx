"use client";

import {
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
} from "@mui/material";

interface RemarksSectionProps {
  values: any;
  errors?: any;

  onChange: (
    field: string,
    value: any,
  ) => void;
}

export default function RemarksSection({
  values,
  errors,
  onChange,
}: RemarksSectionProps) {
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
          mb={3}
        >
          Additional Information
        </Typography>

        <Grid
          container
          spacing={2}
        >
          {/* Remarks */}

          <Grid size={12}>
            <TextField
              fullWidth
              multiline
              minRows={4}
              maxRows={8}
              label="Remarks"
              placeholder="Enter remarks..."
              value={
                values.remarks ?? ""
              }
              error={
                !!errors?.remarks
              }
              helperText={
                errors?.remarks
              }
              onChange={(e) =>
                onChange(
                  "remarks",
                  e.target.value,
                )
              }
            />
          </Grid>

          {/* OMS ID */}

          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <TextField
              fullWidth
              label="OMS ID"
              value={
                values.omsId ?? ""
              }
              onChange={(e) =>
                onChange(
                  "omsId",
                  e.target.value,
                )
              }
            />
          </Grid>

          {/* Application ID */}

          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <TextField
              fullWidth
              label="Application ID"
              value={
                values.applicationId ??
                ""
              }
              onChange={(e) =>
                onChange(
                  "applicationId",
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