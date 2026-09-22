"use client";

import * as React from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";

import {
  CloudUpload,
  Download,
  InsertDriveFile,
} from "@mui/icons-material";

interface BulkUploadDialogProps {
  open: boolean;

  loading?: boolean;

  progress?: number;

  file: File | null;

  summary?: {
    totalRows: number;
    inserted: number;
    duplicate: number;
    failed: number;
  };

  errors?: any[];

  onFileChange: (file: File | null) => void;

  onDownloadTemplate: () => void;

  onUpload: () => void;

  onClose: () => void;
}

export default function BulkUploadDialog({
  open,
  loading = false,
  progress = 0,
  file,
  summary,
  errors = [],

  onFileChange,

  onDownloadTemplate,

  onUpload,

  onClose,
}: BulkUploadDialogProps) {
  const inputRef =
    React.useRef<HTMLInputElement>(null);

  const handleChooseFile = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selected =
      e.target.files?.[0];

    if (!selected) return;

    const allowed = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];

    if (
      !allowed.includes(selected.type)
    ) {
      alert(
        "Only Excel (.xlsx/.xls) files are allowed.",
      );

      return;
    }

    onFileChange(selected);
  };

  return (
    <Dialog
      open={open}
      onClose={
        loading
          ? undefined
          : onClose
      }
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        Bulk Upload Leads
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          <Alert severity="info">
            Upload only
            <strong>
              {" "}
              Excel (.xlsx / .xls)
            </strong>{" "}
            files.
          </Alert>

          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={
              onDownloadTemplate
            }
          >
            Download Sample Template
          </Button>

          <Box
            sx={{
              border: "2px dashed",
              borderColor:
                "divider",
              borderRadius: 3,
              p: 5,
              textAlign: "center",
              cursor: "pointer",
            }}
            onClick={
              handleChooseFile
            }
          >
            <CloudUpload
              sx={{
                fontSize: 50,
                mb: 2,
              }}
            />

            <Typography
              variant="h6"
            >
              Click to Select Excel
            </Typography>

            <Typography
              color="text.secondary"
            >
              .xlsx / .xls
            </Typography>

            <input
              hidden
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={
                handleFileChange
              }
            />
          </Box>

          {file && (
            <Alert
              icon={
                <InsertDriveFile />
              }
              severity="success"
            >
              {file.name}
            </Alert>
          )}

          {loading && (
            <>
              <LinearProgress
                variant="determinate"
                value={progress}
              />

              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
              >
                <CircularProgress
                  size={20}
                />

                <Typography>
                  Uploading...
                </Typography>
              </Stack>
            </>
          )}

          {summary && (
            <Alert severity="success">
              <Typography>
                Total Rows :
                {summary.totalRows}
              </Typography>

              <Typography>
                Inserted :
                {summary.inserted}
              </Typography>

              <Typography>
                Duplicate :
                {summary.duplicate}
              </Typography>

              <Typography>
                Failed :
                {summary.failed}
              </Typography>
            </Alert>
          )}

          {errors.length > 0 && (
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ mb: 1 }}
              >
                Upload Errors
              </Typography>

              <Box
                sx={{
                  maxHeight: 220,
                  overflow: "auto",
                  border:
                    "1px solid #eee",
                  borderRadius: 2,
                  p: 2,
                }}
              >
                {errors.map(
                  (
                    item,
                    index,
                  ) => (
                    <Typography
                      key={index}
                      variant="body2"
                      color="error"
                      sx={{ mb: 1 }}
                    >
                      Row :
                      {item.row}
                      {" - "}
                      {item.reason}
                    </Typography>
                  ),
                )}
              </Box>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button
          variant="outlined"
          disabled={loading}
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          startIcon={
            <CloudUpload />
          }
          disabled={
            !file || loading
          }
          onClick={onUpload}
        >
          {loading
            ? "Uploading..."
            : "Upload"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}