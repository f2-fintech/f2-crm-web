"use client";

import {
  Card,
  CardContent,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

import { LeadPriority } from "@/types/lead";

interface AssignmentInformationProps {
  values: any;
  errors?: any;

  users?: any[];
  branches?: any[];
  departments?: any[];

  onChange: (
    field: string,
    value: any,
  ) => void;
}

export default function AssignmentInformation({
  values,
  errors,
  users = [],
  branches = [],
  departments = [],
  onChange,
}: AssignmentInformationProps) {
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
          Assignment Information
        </Typography>

        <Grid
          container
          spacing={2}
        >
          {/* Assigned User */}

          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <TextField
              select
              fullWidth
              label="Assigned User"
              value={
                values.assignedTo ?? ""
              }
              error={
                !!errors?.assignedTo
              }
              helperText={
                errors?.assignedTo
              }
              onChange={(e) =>
                onChange(
                  "assignedTo",
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
              value={
                values.branchId ?? ""
              }
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

              {branches.map((branch) => (
                <MenuItem
                  key={branch._id}
                  value={branch._id}
                >
                  {branch.branchName}
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
                values.departmentId ??
                ""
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
                (department) => (
                  <MenuItem
                    key={department._id}
                    value={
                      department._id
                    }
                  >
                    {
                      department.departmentName
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

          <Grid size={12}>
            <TextField
              fullWidth
              type="datetime-local"
              label="Next Follow Up"
              value={
                values.nextFollowUp
                  ? values.nextFollowUp.slice(
                      0,
                      16,
                    )
                  : ""
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
        </Grid>
      </CardContent>
    </Card>
  );
}