import {
  Box,
  Typography,
  Stack,
  Checkbox,
  FormControlLabel,
  Button,
  Divider,
} from "@mui/material";
import { useAppState } from "../state/appContext";
import TimelineControl from "./TimelineControl";
import type { TimeRange } from "../types/state";

/**
 *  control center for the selected layer
 * renders a unified vertical layout (all dynamic options)
 */
function OptionsPanel() {
  const { state, dispatch } = useAppState();
  const { layerConfig, selectedLayerId, liveTimeRange } = state;

  const selectedLayer = layerConfig.find(
    (layer) => layer.id === selectedLayerId
  );
  const FilterComponents = selectedLayer?.FilterComponents || [];

  // fallback: only render when layer is selected
  if (!selectedLayer) {
    return (
      <Box sx={{ padding: 2 }}>
        <Typography>No layer selected.</Typography>
      </Box>
    );
  }
  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h6" gutterBottom>
        Options
      </Typography>
      <Stack spacing={3}>
        {/* SECTION 1: timeline */}
        <Box>
          <TimelineControl
            range={liveTimeRange}
            onTimeChange={(newRange: TimeRange) =>
              dispatch({ type: "SET_LIVE_TIME_RANGE", payload: newRange })
            }
            onTimeChangeCommitted={(newRange: TimeRange) =>
              dispatch({ type: "SET_COMMITTED_TIME_RANGE", payload: newRange })
            }
          />
        </Box>

        <Divider />

        {/* SECTION 2: options and serach filter */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Options for {selectedLayer.name}
          </Typography>
          <Stack spacing={2} alignItems="flex-start">
            {/* General Options */}
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

            {/* Dynamic Filter Components */}
            {FilterComponents.length > 0 && (
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ paddingTop: 2 }}
              >
                Search Filters
              </Typography>
            )}
            {FilterComponents.map((FilterComponent, index) => (
              <Box key={index} sx={{ width: "100%" }}>
                <FilterComponent layer={selectedLayer} />
              </Box>
            ))}
          </Stack>
        </Box>

        {/* SECTION 3: global */}
        <Box
          sx={{ display: "flex", justifyContent: "flex-end", paddingTop: 2 }}
        >
          <Button
            variant="contained"
            color="secondary"
            onClick={() => dispatch({ type: "CLEAR_ALL_FILTERS" })}
          >
            Clear All Filters
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}

export default OptionsPanel;
