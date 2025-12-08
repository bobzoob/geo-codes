import { Box, LinearProgress, Typography } from "@mui/material";

interface LoadingBarProps {
  progress: number;
}

export function LoadingBar({ progress }: LoadingBarProps) {
  return (
    <Box sx={{ width: "100%", marginTop: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Box sx={{ width: "100%", mr: 1 }}>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography variant="body2" color="text.secondary">
            {`${Math.round(progress)}%`}
          </Typography>
        </Box>
      </Box>
      <Typography
        variant="caption"
        sx={{ display: "block", textAlign: "center", mt: 1 }}
      >
        Loading data...
      </Typography>
    </Box>
  );
}
