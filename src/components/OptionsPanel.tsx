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
  //const FilterComponents = selectedLayer?.FilterComponents || [];

  // fallback: only render when layer is selected
  if (!selectedLayer) {
    return (
      <Box sx={{ padding: 2 }}>
        <Typography>No layer selected.</Typography>
      </Box>
    );
  }

  // placement of the layers, due to array from layers.ts
  const activeFilters = selectedLayer.filters || [];

  const timelineFilters = activeFilters.filter(
    (f) => f.placement === "timeline-area"
  );

  const searchFilters = activeFilters.filter(
    (f) => f.placement === "search-area"
  );

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h6" gutterBottom>
        Options for {selectedLayer.name}
      </Typography>
      <Stack spacing={3}>
        {/* SECTION 1: Timeline Area */}
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

          {/* Render any filter configured for this area (e.g., Date Search) */}
          {timelineFilters.map((module, index) => {
            const Component = module.component;
            return (
              <Box key={`time-filter-${index}`} sx={{ marginTop: 2 }}>
                <Component layer={selectedLayer} />
              </Box>
            );
          })}
        </Box>

        <Divider />

        {/* SECTION 2: Search Area */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Toggle Options
          </Typography>
          <Stack spacing={2} alignItems="flex-start">
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

            {searchFilters.length > 0 && (
              <Typography variant="h6" gutterBottom sx={{ paddingTop: 2 }}>
                Search Options
              </Typography>
            )}

            {/* Render any filter configured for the search area */}
            {searchFilters.map((module, index) => {
              const Component = module.component;
              return (
                <Box key={`search-filter-${index}`} sx={{ width: "100%" }}>
                  <Component layer={selectedLayer} />
                </Box>
              );
            })}
          </Stack>
        </Box>

        {/* SECTION 3: Global Actions */}
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
