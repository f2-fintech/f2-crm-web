"use client";

import { Card, CardContent, Typography } from "@mui/material";
import ScheduleIcon from "@mui/icons-material/Schedule";

interface Props {
  total: number;
}

export default function FollowUpCard({
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
        <ScheduleIcon
          color="warning"
          sx={{
            fontSize: 40,
            mb: 2,
          }}
        />

        <Typography
          variant="body2"
          color="text.secondary"
        >
          Follow Up Leads
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