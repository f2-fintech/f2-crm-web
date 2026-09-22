"use client";

import {
  Box,
  Button,
  Grid,
  Paper,
  Stack,
} from "@mui/material";

import BasicInformation from "./BasicInformation";
import ContactInformation from "./ContactInformation";
import LoanInformation from "./LoanInformation";
import EmploymentInformation from "./EmploymentInformation";
import AssignmentInformation from "./AssignmentInformation";
import RemarksSection from "./RemarksSection";

interface LeadFormProps {
  values: any;

  errors?: any;

  loading?: boolean;

  onChange: (
    field: string,
    value: any,
  ) => void;

  onSubmit: () => void;

  onCancel: () => void;
}

export default function LeadForm({
  values,
  errors,
  loading,

  onChange,

  onSubmit,

  onCancel,
}: LeadFormProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
      }}
    >
      <Grid
        container
        spacing={3}
      >
        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <BasicInformation
            values={values}
            errors={errors}
            onChange={onChange}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <ContactInformation
            values={values}
            errors={errors}
            onChange={onChange}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <LoanInformation
            values={values}
            errors={errors}
            onChange={onChange}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <EmploymentInformation
            values={values}
            errors={errors}
            onChange={onChange}
          />
        </Grid>

        <Grid size={12}>
          <AssignmentInformation
            values={values}
            errors={errors}
            onChange={onChange}
          />
        </Grid>

        <Grid size={12}>
          <RemarksSection
            values={values}
            errors={errors}
            onChange={onChange}
          />
        </Grid>
      </Grid>

      <Box
        sx={{
          mt: 4,
          borderTop:
            "1px solid #E5E7EB",
          pt: 3,
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{
            justifyContent: "flex-end",
          }}
        >
          <Button
            variant="outlined"
            onClick={onCancel}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={onSubmit}
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : "Save Lead"}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}