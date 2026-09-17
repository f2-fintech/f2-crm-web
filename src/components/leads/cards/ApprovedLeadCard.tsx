"use client";

import { Card, CardContent, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface Props {
  total: number;
}

export default function ApprovedLeadCard({
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
        <CheckCircleIcon
          color="success"
          sx={{
            fontSize: 40,
            mb: 2,
          }}
        />

        <Typography
          variant="body2"
          color="text.secondary"
        >
          Approved Leads
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