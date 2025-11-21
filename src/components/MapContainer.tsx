import { Box } from "@mui/material";
import MapWrapper from "./MapWrapper";
import LayerManager from "./LayerManager";
import { useAppState } from "../state/appContext";

/**
 * core map canvas- single responsibility:
 * render map tiles and data layers (polygons, points, lines, ..)
 */
function MapContainer() {
  const { state } = useAppState();
  const { geoJsonData, layerConfig, committedTimeRange } = state;

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <MapWrapper>
        <LayerManager
          layers={layerConfig}
          data={geoJsonData}
          timeRange={committedTimeRange}
        />
      </MapWrapper>
    </Box>
  );
}

export default MapContainer;
