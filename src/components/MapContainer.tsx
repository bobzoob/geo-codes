import { Box } from "@mui/material";
import MapWrapper from "./MapWrapper";
import LayerManager from "./LayerManager";
import { useAppState } from "../state/appContext";

import BottomPanel from "./BottomPanel";

function MapContainer() {
  const { state } = useAppState();
  const { geoJsonData, layerConfig, committedTimeRange } = state;

  return (
    <Box sx={{ height: "100%", width: "100%", position: "relative" }}>
      <MapWrapper>
        <LayerManager
          layers={layerConfig}
          data={geoJsonData}
          timeRange={committedTimeRange}
        />
      </MapWrapper>

      {/* bottom controls life inside BottomPanel */}
      <BottomPanel />
    </Box>
  );
}

export default MapContainer;
