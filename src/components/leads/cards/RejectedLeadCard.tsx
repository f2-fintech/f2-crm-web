"use client";

import { Card, CardContent, Typography } from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";

interface Props {
  total: number;
}

export default function RejectedLeadCard({
  total,
}: Props) {
  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: 2,
        height: "100%",
      }}
    >
      <CardContent>
        <CancelIcon
          color="error"
          sx={{
            fontSize: 40,
            mb: 2,
          }}
        />

        <Typography
          variant="body2"
          color="text.secondary"
        >
          Rejected Leads
        </Typography>

        <Typography
          variant="h4"
          fontWeight={700}
        >
          {total}
        </Typography>
      </CardContent>
    </Card>
  );
}