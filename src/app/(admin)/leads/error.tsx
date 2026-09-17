"use client";

import { Alert, Button } from "@mui/material";

export default function Error({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <Alert
      severity="error"
      action={
        <Button
          color="inherit"
          onClick={reset}
        >
          Retry
        </Button>
      }
    >
      Something went wrong while loading Leads.
    </Alert>
  );
}