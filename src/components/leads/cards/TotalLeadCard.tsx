"use client";

import { Card, CardContent, Typography } from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";

interface Props {
  total: number;
}

export default function TotalLeadCard({
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
        <GroupsIcon
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
          Total Leads
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