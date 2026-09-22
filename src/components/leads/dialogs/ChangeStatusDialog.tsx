"use client";

import * as React from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  MenuItem,
  TextField,
} from "@mui/material";

import { LeadStatus } from "@/types/lead";

interface ChangeStatusDialogProps {
  open: boolean;

  loading?: boolean;

  values: {
    status: LeadStatus;
    remarks: string;
    lastFollowUp: string;
    nextFollowUp: string;
  };

  errors?: any;

  onChange: (
    field: string,
    value: any,
  ) => void;

  onClose: () => void;

  onSubmit: () => void;
}

export default function ChangeStatusDialog({
  open,
  loading = false,

  values,
  errors,

  onChange,

  onClose,
  onSubmit,
}: ChangeStatusDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        Change Lead Status
      </DialogTitle>

      <DialogContent dividers>
        <Grid
          container
          spacing={2}
        >
          {/* Status */}

          <Grid
            size={{
              xs: 12,
            }}
          >
            <TextField
              select
              fullWidth
              required
              label="Lead Status"
              value={values.status}
              error={!!errors?.status}
              helperText={errors?.status}
              onChange={(e) =>
                onChange(
                  "status",
                  e.target.value,
                )
              }
            >
              {Object.values(
                LeadStatus,
              ).map((status) => (
                <MenuItem
                  key={status}
                  value={status}
                >
                  {status}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Last Follow Up */}

          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <TextField
              fullWidth
              type="datetime-local"
              label="Last Follow Up"
              value={
                values.lastFollowUp
              }
              slotProps={{
                inputLabel: {
                  shrink: true,
                }
              }}
              onChange={(e) =>
                onChange(
                  "lastFollowUp",
                  e.target.value,
                )
              }
            />
          </Grid>

          {/* Next Follow Up */}

          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <TextField
              fullWidth
              type="datetime-local"
              label="Next Follow Up"
              value={
                values.nextFollowUp
              }
              slotProps={{
                inputLabel: {
                  shrink: true,
                }
              }}
              onChange={(e) =>
                onChange(
                  "nextFollowUp",
                  e.target.value,
                )
              }
            />
          </Grid>

          {/* Remarks */}

          <Grid
            size={{
              xs: 12,
            }}
          >
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Remarks"
              value={
                values.remarks
              }
              error={!!errors?.remarks}
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
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={loading}
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
            : "Update Status"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}