"use client";

import { Card, CardContent, Typography } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

interface Props {
  rate: number;
}

export default function ConversionCard({
  rate,
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
        <TrendingUpIcon
          color="primary"
          sx={{
            fontSize: 40,
            mb: 2,
          }}
        />

        <Typography
          variant="body2"
          color="text.secondary"
        >
          Conversion Rate
        </Typography>

        <Typography
          variant="h4"
          fontWeight={700}
        >
          {rate}%
        </Typography>
      </CardContent>
    </Card>
  );
}