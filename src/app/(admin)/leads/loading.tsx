import {
  Skeleton,
  Stack,
} from "@mui/material";

export default function Loading() {
  return (
    <Stack spacing={3}>
      <Skeleton
        variant="rounded"
        height={70}
      />

      <Skeleton
        variant="rounded"
        height={500}
      />
    </Stack>
  );
}