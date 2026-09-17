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

interface CreateLeadDialogProps {
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

export default function CreateLeadDialog({
  open,
  loading = false,
  values,
  errors,

  onClose,
  onSubmit,
  onChange,
}: CreateLeadDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
    >
      <DialogTitle>
        Create New Lead
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
            ? "Creating..."
            : "Create Lead"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}