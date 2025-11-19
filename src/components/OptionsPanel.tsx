import {
  Box,
  Typography,
  Stack,
  Checkbox,
  FormControlLabel,
  Button,
} from "@mui/material";
import { useAppState } from "../state/appContext";

/**
 * renders specific options for the currently selected layer
 * and is designed to be placed inside a container (like BottomPanel) that controls its visibility
 */
function OptionsPanel() {
  const { state, dispatch } = useAppState();
  const { layerConfig, selectedLayerId } = state;

  const selectedLayer = layerConfig.find(
    (layer) => layer.id === selectedLayerId
  );
  const FilterComponents = selectedLayer?.FilterComponents || [];

  return (
    <Box sx={{ padding: 2, borderTop: "1px solid #ddd" }}>
      {!selectedLayer ? (
        <Typography variant="body2" color="text.secondary">
          Select a layer to see its options.
        </Typography>
      ) : (
        <Stack spacing={3}>
          {/* checkbox options */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              General Options
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedLayer.showAllTooltips}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_LAYER_TOOLTIPS",
                      payload: {
                        layerId: selectedLayer.id,
                        showAll: e.target.checked,
                      },
                    })
                  }
                />
              }
              label="Show all tooltips"
            />
          </Box>

          {/* filterComponents dynamic */}
          {FilterComponents.map((FilterComponent, index) => (
            <Box key={index}>
              <FilterComponent layer={selectedLayer} />
            </Box>
          ))}
        </Stack>
      )}
      <Box sx={{ display: "flex", justifyContent: "flex-end", paddingTop: 2 }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => dispatch({ type: "CLEAR_ALL_FILTERS" })}
        >
          Clear All Filters
        </Button>
      </Box>
    </Box>
  );
}

export default OptionsPanel;
