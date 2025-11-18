import { Box } from "@mui/material";
import TimelineControl from "./TimelineControl";
import MapWrapper from "./MapWrapper";
import LayerManager from "./LayerManager";
import { useAppState } from "../state/appContext";
import type { TimeRange } from "../types/state";

function MapContainer() {
  const { state, dispatch } = useAppState();
  const { geoJsonData, layerConfig, committedTimeRange, liveTimeRange } = state;

  return (
    <Box sx={{ height: "100%", width: "100%", position: "relative" }}>
      <MapWrapper>
        <LayerManager
          layers={layerConfig}
          data={geoJsonData}
          timeRange={committedTimeRange}
        />
      </MapWrapper>
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
  );
}

export default MapContainer;
