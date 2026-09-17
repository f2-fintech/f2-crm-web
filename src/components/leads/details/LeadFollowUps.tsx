"use client";

import * as React from "react";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

import {
  Add,
  Edit,
  Delete,
  AccessTime,
} from "@mui/icons-material";

interface LeadFollowUp {
  _id: string;

  status: string;

  remarks: string;

  nextFollowUp: string;

  createdAt: string;

  createdBy?: {
    _id: string;
    fullName: string;
  };
}

interface LeadFollowUpsProps {
  lead: any;

  followUps?: LeadFollowUp[];

  loading?: boolean;

  onAdd?: () => void;

  onEdit?: (
    followUp: LeadFollowUp,
  ) => void;

  onDelete?: (
    followUp: LeadFollowUp,
  ) => void;
}

export default function LeadFollowUps({
  followUps = [],

  loading = false,

  onAdd,

  onEdit,

  onDelete,
}: LeadFollowUpsProps) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h6">
            Follow Ups
          </Typography>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={onAdd}
          >
            Add Follow Up
          </Button>
        </Stack>

        {loading && (
          <Typography>
            Loading...
          </Typography>
        )}

        {!loading &&
          followUps.length === 0 && (
            <Typography
              color="text.secondary"
              align="center"
            >
              No Follow Ups Found
            </Typography>
          )}

        <Stack spacing={2}>
          {followUps.map(
            (item) => (
              <Card
                key={item._id}
                variant="outlined"
              >
                <CardContent>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                  >
                    <Box flex={1}>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        mb={2}
                      >
                        <Chip
                          size="small"
                          label={
                            item.status
                          }
                          color="primary"
                        />

                        <Chip
                          icon={
                            <AccessTime />
                          }
                          size="small"
                          label={
                            item.nextFollowUp
                              ? new Date(
                                  item.nextFollowUp,
                                ).toLocaleString()
                              : "-"
                          }
                        />
                      </Stack>

                      <Typography
                        fontWeight={600}
                      >
                        Remarks
                      </Typography>

                      <Typography
                        color="text.secondary"
                        mt={1}
                      >
                        {item.remarks ||
                          "-"}
                      </Typography>

                      <Divider
                        sx={{
                          my: 2,
                        }}
                      />

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Created By :
                        {" "}
                        {item
                          .createdBy
                          ?.fullName ??
                          "-"}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Created At :
                        {" "}
                        {new Date(
                          item.createdAt,
                        ).toLocaleString()}
                      </Typography>
                    </Box>

                    <Stack
                      direction="row"
                    >
                      <IconButton
                        color="primary"
                        onClick={() =>
                          onEdit?.(
                            item,
                          )
                        }
                      >
                        <Edit />
                      </IconButton>

                      <IconButton
                        color="error"
                        onClick={() =>
                          onDelete?.(
                            item,
                          )
                        }
                      >
                        <Delete />
                      </IconButton>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ),
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}