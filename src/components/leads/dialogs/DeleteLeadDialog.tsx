"use client";

import * as React from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Stack,
  Alert,
} from "@mui/material";

import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

interface DeleteLeadDialogProps {
  open: boolean;

  loading?: boolean;

  lead?: {
    _id: string;
    leadId: string;
    fullName: string;
    phone: string;
  } | null;

  onClose: () => void;

  onConfirm: () => void;
}

export default function DeleteLeadDialog({
  open,
  loading = false,
  lead,

  onClose,
  onConfirm,
}: DeleteLeadDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Delete Lead
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          <Alert severity="warning">
            This action will soft delete the lead.
            You can restore it later if restore
            functionality is enabled.
          </Alert>

          <Typography variant="body1">
            Are you sure you want to delete this
            lead?
          </Typography>

          <Stack spacing={1}>
            <Typography variant="subtitle2">
              Lead ID
            </Typography>

            <Typography color="text.secondary">
              {lead?.leadId ?? "-"}
            </Typography>

            <Typography variant="subtitle2">
              Customer
            </Typography>

            <Typography color="text.secondary">
              {lead?.fullName ?? "-"}
            </Typography>

            <Typography variant="subtitle2">
              Phone
            </Typography>

            <Typography color="text.secondary">
              {lead?.phone ?? "-"}
            </Typography>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
        >
          Cancel
        </Button>

        <Button
          color="error"
          variant="contained"
          onClick={onConfirm}
          disabled={loading}
          startIcon={
            <DeleteOutlineRoundedIcon />
          }
        >
          {loading
            ? "Deleting..."
            : "Delete Lead"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}