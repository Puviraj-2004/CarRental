import { Box, CircularProgress } from "@mui/material";

export default function PaymentCancelPage() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <CircularProgress />
    </Box>
  );
}