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

import { LeadPriority } from "@/types/leads/lead";

interface AssignLeadDialogProps {
  open: boolean;

  loading?: boolean;

  users: any[];

  branches: any[];

  departments: any[];

  values: {
    userId: string;
    branchId: string;
    departmentId: string;
    priority: LeadPriority;
    nextFollowUp: string;
    assignmentRemark: string;
  };

  errors?: any;

  onChange: (
    field: string,
    value: any,
  ) => void;

  onClose: () => void;

  onSubmit: () => void;
}

export default function AssignLeadDialog({
  open,
  loading = false,

  users,
  branches,
  departments,

  values,
  errors,

  onChange,

  onClose,
  onSubmit,
}: AssignLeadDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        Assign Lead
      </DialogTitle>

      <DialogContent dividers>
        <Grid
          container
          spacing={2}
        >
          {/* User */}

          <Grid
            size={{
              xs: 12,
            }}
          >
            <TextField
              select
              fullWidth
              required
              label="Assign User"
              value={values.userId}
              error={!!errors?.userId}
              helperText={
                errors?.userId
              }
              onChange={(e) =>
                onChange(
                  "userId",
                  e.target.value,
                )
              }
            >
              <MenuItem value="">
                Select User
              </MenuItem>

              {users.map((user) => (
                <MenuItem
                  key={user._id}
                  value={user._id}
                >
                  {user.fullName}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Branch */}

          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <TextField
              select
              fullWidth
              label="Branch"
              value={values.branchId}
              onChange={(e) =>
                onChange(
                  "branchId",
                  e.target.value,
                )
              }
            >
              <MenuItem value="">
                Select Branch
              </MenuItem>

              {branches.map((item) => (
                <MenuItem
                  key={item._id}
                  value={item._id}
                >
                  {item.branchName}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Department */}

          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <TextField
              select
              fullWidth
              label="Department"
              value={
                values.departmentId
              }
              onChange={(e) =>
                onChange(
                  "departmentId",
                  e.target.value,
                )
              }
            >
              <MenuItem value="">
                Select Department
              </MenuItem>

              {departments.map(
                (item) => (
                  <MenuItem
                    key={item._id}
                    value={
                      item._id
                    }
                  >
                    {
                      item.departmentName
                    }
                  </MenuItem>
                ),
              )}
            </TextField>
          </Grid>

          {/* Priority */}

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
                values.priority
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
              ).map((priority) => (
                <MenuItem
                  key={priority}
                  value={priority}
                >
                  {priority}
                </MenuItem>
              ))}
            </TextField>
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
              InputLabelProps={{
                shrink: true,
              }}
              onChange={(e) =>
                onChange(
                  "nextFollowUp",
                  e.target.value,
                )
              }
            />
          </Grid>

          {/* Remark */}

          <Grid
            size={{
              xs: 12,
            }}
          >
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Assignment Remark"
              value={
                values.assignmentRemark
              }
              onChange={(e) =>
                onChange(
                  "assignmentRemark",
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
            ? "Assigning..."
            : "Assign Lead"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}