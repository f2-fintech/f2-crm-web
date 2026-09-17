"use client";

import * as React from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

import LeadForm from "../forms/LeadForm";

interface EditLeadDialogProps {
  open: boolean;

  loading?: boolean;

  values: any;

  errors?: any;

  onClose: () => void;

  onSubmit: () => void;

  onChange: (
    field: string,
    value: any,
  ) => void;
}

export default function EditLeadDialog({
  open,
  loading = false,

  values,
  errors,

  onClose,
  onSubmit,
  onChange,
}: EditLeadDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
    >
      <DialogTitle>
        Edit Lead
      </DialogTitle>

      <DialogContent dividers>
        <LeadForm
          values={values}
          errors={errors}
          loading={loading}
          onChange={onChange}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </DialogContent>

      <DialogActions>
        <Button
          variant="outlined"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={loading}
        >
          {loading
            ? "Updating..."
            : "Update Lead"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}