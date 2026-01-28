import { Box, Typography, Stack, Divider } from "@mui/material";
import { useAppState } from "../../../state/appContext";
import TimelineControl from "../../TimelineControl";
import type { TimeRange } from "../../../types/state";
import { FilterList } from "../../options/FilterList";
import { SearchSection } from "../../options/SearchSection";

function OptionsPanel() {
  const { state, dispatch } = useAppState();
  const { layerConfig, selectedLayerId, liveTimeRange } = state;

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
        <Stack spacing={3}>
          {/* Timeline Area */}
          <Box>
            <TimelineControl
              range={liveTimeRange}
              onTimeChange={(newRange: TimeRange) =>
                dispatch({ type: "SET_LIVE_TIME_RANGE", payload: newRange })
              }
              onTimeChangeCommitted={(newRange: TimeRange) =>
                dispatch({
                  type: "SET_COMMITTED_TIME_RANGE",
                  payload: newRange,
                })
              }
            />
            {/* render any filters attached to the timeline area */}
            <FilterList
              layerId={selectedLayer.id}
              filters={selectedLayer.activeFilters.filter(
                (f) => f.placement === "timeline-area"
              )}
              values={selectedLayer.filterValues || {}}
            />
          </Box>

          <Divider />

          {/*Search Area */}
          <SearchSection layer={selectedLayer} />
        </Stack>
      )}
    </Box>
  );
}

export default OptionsPanel;
