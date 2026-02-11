import { Box, Typography, Stack } from "@mui/material";
import { useAppState } from "../../../state/appContext";
import { SearchSection } from "../../options/SearchSection";

function OptionsPanel() {
  const { state } = useAppState();
  const { layerConfig, selectedLayerId } = state;

  const selectedLayer = layerConfig.find(
    (layer) => layer.id === selectedLayerId
  );

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h6" gutterBottom>
        {selectedLayer ? `Options for ${selectedLayer.name}` : "Options"}
      </Typography>

      {!selectedLayer ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontStyle: "italic" }}
        >
          Select a layer to view options.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {/*Search Area */}
          <SearchSection layer={selectedLayer} />
        </Stack>
      )}
    </Box>
  );
}

export default OptionsPanel;
