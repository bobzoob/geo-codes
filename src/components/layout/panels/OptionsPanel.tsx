import { Box, Typography } from "@mui/material";
import { useAppState } from "../../../state/appContext";
import { SearchSection } from "../../options/SearchSection";

function OptionsPanel() {
  const { state } = useAppState();
  const { layerConfig, selectedLayerId } = state;

  const selectedLayer = layerConfig.find(
    (layer) => layer.id === selectedLayerId
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ p: 2, flexShrink: 0 }}>
        <Typography variant="h6">
          {selectedLayer ? `Options: ${selectedLayer.name}` : "Options"}
        </Typography>
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: "auto", px: 2, pb: 2 }}>
        {!selectedLayer ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontStyle: "italic" }}
          >
            Select a layer to view options.
          </Typography>
        ) : (
          <SearchSection layer={selectedLayer} />
        )}
      </Box>
    </Box>
  );
}

export default OptionsPanel;
