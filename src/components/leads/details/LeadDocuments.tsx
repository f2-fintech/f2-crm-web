"use client";

import * as React from "react";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

import {
  CloudUpload,
  Delete,
  Download,
  InsertDriveFile,
  PictureAsPdf,
  Image,
  Description,
} from "@mui/icons-material";

interface LeadDocument {
  _id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy?: {
    fullName: string;
  };
  createdAt: string;
}

interface LeadDocumentsProps {
  lead: any;

  documents?: LeadDocument[];

  uploading?: boolean;

  onUpload?: (file: File) => void;

  onDownload?: (
    document: LeadDocument,
  ) => void;

  onDelete?: (
    document: LeadDocument,
  ) => void;
}

export default function LeadDocuments({
  documents = [],

  uploading = false,

  onUpload,

  onDownload,

  onDelete,
}: LeadDocumentsProps) {
  const inputRef =
    React.useRef<HTMLInputElement>(null);

  const getIcon = (
    type: string,
  ) => {
    if (
      type.includes("pdf")
    ) {
      return (
        <PictureAsPdf
          color="error"
        />
      );
    }

    if (
      type.includes("image")
    ) {
      return (
        <Image color="primary" />
      );
    }

    if (
      type.includes(
        "word",
      )
    ) {
      return (
        <Description color="info" />
      );
    }

    return (
      <InsertDriveFile />
    );
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Button
          variant="contained"
          startIcon={
            <CloudUpload />
          }
          onClick={() =>
            inputRef.current?.click()
          }
          disabled={
            uploading
          }
        >
          {uploading
            ? "Uploading..."
            : "Upload Document"}
        </Button>

        <input
          hidden
          ref={inputRef}
          type="file"
          onChange={(e) => {
            const file =
              e.target
                .files?.[0];

            if (
              file &&
              onUpload
            ) {
              onUpload(file);
            }
          }}
        />
      </Box>

      {documents.length ===
      0 ? (
        <Card elevation={0}>
          <CardContent>
            <Typography
              align="center"
              color="text.secondary"
            >
              No Documents Found
            </Typography>
          </CardContent>
        </Card>
      ) : (
        documents.map(
          (
            document,
          ) => (
            <Card
              key={
                document._id
              }
              elevation={0}
            >
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                  >
                    {getIcon(
                      document.fileType,
                    )}

                    <Box>
                      <Typography fontWeight={600}>
                        {
                          document.fileName
                        }
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Uploaded
                        By :
                        {" "}
                        {document
                          .uploadedBy
                          ?.fullName ??
                          "-"}
                      </Typography>

                      <Typography
                        variant="caption"
                      >
                        {new Date(
                          document.createdAt,
                        ).toLocaleString()}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >
                    <Chip
                      label={`${(
                        document.fileSize /
                        1024
                      ).toFixed(
                        2,
                      )} KB`}
                    />

                    <IconButton
                      color="primary"
                      onClick={() =>
                        onDownload?.(
                          document,
                        )
                      }
                    >
                      <Download />
                    </IconButton>

                    <IconButton
                      color="error"
                      onClick={() =>
                        onDelete?.(
                          document,
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
        )
      )}
    </Stack>
  );
}