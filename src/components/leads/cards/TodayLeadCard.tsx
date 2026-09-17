"use client";

import { Card, CardContent, Typography } from "@mui/material";
import TodayIcon from "@mui/icons-material/Today";

interface Props {
  total: number;
}

export default function TodayLeadCard({
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
        <TodayIcon
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
          Today's Leads
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