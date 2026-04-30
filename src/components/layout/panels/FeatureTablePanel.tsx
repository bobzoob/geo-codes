import { Box } from "@mui/material";
import { FeatureTable } from "../../options/FeatureTable";

export default function FeatureTablePanel() {
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <FeatureTable />
    </Box>
  );
}
