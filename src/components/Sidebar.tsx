import { Box, Button, Typography } from "@mui/material";
import LayerControlPanel from "./LayerControlPanel";
import { useAppState } from "../state/appContext";

function Sidebar() {
  const { state, dispatch } = useAppState();
  const { currentView, layerConfig } = state;

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h6">Menu</Typography>
      <Button
        variant="text"
        onClick={() => dispatch({ type: "SET_VIEW", payload: "dashboard" })}
      >
        Home
      </Button>
      {currentView === "map" && (
        <Box mt={4}>
          <LayerControlPanel layers={layerConfig} />
        </Box>
      )}
    </Box>
  );
}

export default Sidebar;
